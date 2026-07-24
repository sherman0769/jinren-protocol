import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_COORDINATOR_PATH = path.join(
  process.env.CODEX_HOME || path.join(homedir(), ".codex"),
  "skills",
  "notebooklm-chapter-audio",
  "scripts",
  "notebooklm-download-resume-coordinator.mjs",
);
const AUDIO_EXTENSIONS = new Set([".aac", ".m4a", ".mp3", ".mp4"]);
const invalidFilenameCharacters = /[\\/:*?"<>|]/gu;

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--") continue;
    if (!value.startsWith("--")) {
      args._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  npm run resume:notebooklm-audio -- <slug>",
    "  npm run resume:notebooklm-audio -- <slug> execute",
    "  node scripts/resume-notebooklm-audio.mjs <slug> --execute",
    "",
    "Default behavior is a read-only dry-run.",
    "",
    "Options:",
    "  --execute                    Run the verified resume plan.",
    "  --runtime-module <path>      Runtime bridge exporting createNotebookLmResumeRuntime().",
    "  --downloads-dir <path>       Downloads folder passed to the runtime bridge.",
    "  --coordinator-module <path>  Override the selected skill coordinator path.",
    "  --timeout-ms <number>        Per-file validation timeout; default 1800000.",
    "  --help                       Show this message.",
    "",
    "If incomplete chapters exist, --execute fails closed unless a live Chrome",
    "controller is injected programmatically or through --runtime-module. In the",
    "persistent Node/Chrome workflow, import runResumeCommand() from this file.",
  ].join("\n");
}

function booksFromDocument(document) {
  if (Array.isArray(document)) return document;
  if (Array.isArray(document?.books)) return document.books;
  throw new Error("src/content/books.json must be an array or contain a books array");
}

function sanitizeTitle(value) {
  return String(value)
    .replace(invalidFilenameCharacters, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/[. ]+$/gu, "") || "untitled";
}

function toSeconds(duration) {
  const parts = String(duration ?? "").split(":").map(Number);
  if (
    parts.length < 2 ||
    parts.length > 3 ||
    !parts.every((part) => Number.isFinite(part) && part >= 0)
  ) {
    return Number.NaN;
  }
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function toPosix(value) {
  return value.replace(/\\/gu, "/");
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function publicAudioSource(projectRoot, destinationPath) {
  const publicRoot = path.resolve(projectRoot, "public");
  const relative = path.relative(publicRoot, destinationPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Audio destination escapes public/: ${destinationPath}`);
  }
  return encodeURI(`/${toPosix(relative)}`);
}

function ensureInsideProject(projectRoot, candidatePath, label) {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, candidatePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes project root: ${candidatePath}`);
  }
  return resolved;
}

async function loadBook(projectRoot, slug) {
  if (!slug) throw new Error("Book slug is required");
  const booksPath = path.join(projectRoot, "src", "content", "books.json");
  const document = JSON.parse(await readFile(booksPath, "utf8"));
  const book = booksFromDocument(document).find((candidate) => candidate.slug === slug);
  if (!book) throw new Error(`Unknown book slug: ${slug}`);
  if (!Array.isArray(book.chapters) || book.chapters.length === 0) {
    throw new Error(`Book has no chapters: ${slug}`);
  }
  return {
    book,
    booksPath,
    ledgerPath: path.join(
      projectRoot,
      "book-txt",
      book.title,
      "notebooklm-audio-ledger.json",
    ),
  };
}

async function loadCoordinator(modulePath = DEFAULT_COORDINATOR_PATH) {
  const resolvedPath = path.resolve(modulePath);
  try {
    await stat(resolvedPath);
  } catch {
    throw new Error(
      `NotebookLM resume coordinator not found: ${resolvedPath}. ` +
        "Restore the selected notebooklm-chapter-audio skill or pass --coordinator-module.",
    );
  }
  const coordinator = await import(`${pathToFileURL(resolvedPath).href}?v=${Date.now()}`);
  if (
    typeof coordinator.planNotebookLmDownloadResume !== "function" ||
    typeof coordinator.runNotebookLmDownloadResume !== "function"
  ) {
    throw new Error(`Invalid NotebookLM resume coordinator module: ${resolvedPath}`);
  }
  return { ...coordinator, resolvedPath };
}

function assertBookLedgerIdentity(book, plan) {
  const expected = book.chapters.map((chapter) => ({
    chapterNumber: Number(chapter.number),
    expectedTitle: `${String(chapter.number).padStart(2, "0")}_${sanitizeTitle(chapter.title)}`,
  }));
  const expectedNumbers = expected.map((chapter) => chapter.chapterNumber);
  if (
    new Set(expectedNumbers).size !== expectedNumbers.length ||
    !expectedNumbers.every((number, index) => number === index + 1)
  ) {
    throw new Error("Book chapter numbers must be unique and contiguous from 1");
  }
  if (expected.length !== plan.chapters.length) {
    throw new Error(
      `Book/ledger chapter count mismatch: ${expected.length}/${plan.chapters.length}`,
    );
  }
  for (const chapter of expected) {
    const planned = plan.chapters.find(
      (candidate) => candidate.chapterNumber === chapter.chapterNumber,
    );
    if (!planned) throw new Error(`Ledger is missing chapter ${chapter.chapterNumber}`);
    if (planned.expectedTitle !== chapter.expectedTitle) {
      throw new Error(
        `Chapter ${chapter.chapterNumber} title mismatch: ` +
          `${planned.expectedTitle}/${chapter.expectedTitle}`,
      );
    }
    if (!Number.isFinite(toSeconds(planned.expectedDuration))) {
      throw new Error(`Chapter ${chapter.chapterNumber} has no valid card duration`);
    }
  }
}

export async function inspectDownloadedAudio(
  filePath,
  {
    expectedDuration,
    runProcess = spawnSync,
    runFile = execFileSync,
  } = {},
) {
  const details = await stat(filePath);
  if (!details.isFile() || details.size <= 0) {
    throw new Error(`Downloaded audio is missing or empty: ${filePath}`);
  }
  if (!AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase()) && !filePath.endsWith(".tmp")) {
    throw new Error(`Unsupported downloaded audio extension: ${filePath}`);
  }

  const probe = JSON.parse(
    runFile(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=format_name,duration,bit_rate",
        "-show_entries",
        "stream=codec_name,codec_type,bit_rate,sample_rate,channels",
        "-of",
        "json",
        filePath,
      ],
      { encoding: "utf8" },
    ),
  );
  const audio = probe.streams?.find((stream) => stream.codec_type === "audio");
  if (!audio) throw new Error(`Downloaded file has no audio stream: ${filePath}`);
  const durationSeconds = Number(probe.format?.duration);
  const expectedSeconds = toSeconds(expectedDuration);
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(expectedSeconds)) {
    throw new Error(`Audio duration is unavailable: ${filePath}`);
  }

  const intervalStart = Math.max(0, durationSeconds - 10);
  const packetOutput = runFile(
    "ffprobe",
    [
      "-v",
      "error",
      "-read_intervals",
      `${intervalStart}%+20`,
      "-select_streams",
      "a:0",
      "-show_packets",
      "-show_entries",
      "packet=pts_time,duration_time",
      "-of",
      "csv=p=0",
      filePath,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  const packetEnds = String(packetOutput)
    .trim()
    .split(/\r?\n/gu)
    .map((line) => line.split(",").map(Number))
    .filter(([pts]) => Number.isFinite(pts))
    .map(([pts, duration]) => pts + (Number.isFinite(duration) ? duration : 0));
  if (packetEnds.length === 0) {
    throw new Error(`Downloaded file has no decodable packet endpoint: ${filePath}`);
  }
  const lastPacketDurationSeconds = Math.max(...packetEnds);
  if (
    Math.abs(durationSeconds - expectedSeconds) > 2 ||
    Math.abs(lastPacketDurationSeconds - expectedSeconds) > 2
  ) {
    throw new Error(
      `Downloaded audio has not reached the verified card duration: ` +
        `${durationSeconds}/${lastPacketDurationSeconds}/${expectedSeconds}`,
    );
  }
  if (audio.codec_name !== "aac" || !/(?:mp4|m4a|mov)/iu.test(probe.format?.format_name ?? "")) {
    throw new Error(
      `Expected AAC in MP4/M4A, received ${audio.codec_name}/${probe.format?.format_name}`,
    );
  }

  const decode = runProcess(
    "ffmpeg",
    [
      "-hide_banner",
      "-v",
      "error",
      "-xerror",
      "-i",
      filePath,
      "-map",
      "0:a:0",
      "-f",
      "null",
      "-",
    ],
    { stdio: "ignore", timeout: 30 * 60 * 1000 },
  );
  if (decode.error) throw decode.error;
  if (decode.status !== 0) {
    throw new Error(`Downloaded audio failed full ffmpeg decode: ${filePath}`);
  }
  const bytes = (await stat(filePath)).size;
  return {
    durationSeconds,
    lastPacketDurationSeconds,
    codec: audio.codec_name,
    container: probe.format.format_name,
    bitRate: Number(audio.bit_rate || probe.format.bit_rate),
    sampleRate: Number(audio.sample_rate),
    channels: Number(audio.channels),
    fileSizeBytes: bytes,
    sha256: await sha256File(filePath),
    fullDecode: true,
  };
}

async function waitForValidatedAudio(
  filePath,
  {
    expectedDuration,
    timeoutMs = 30 * 60 * 1000,
    pollIntervalMs = 2_000,
    inspectAudio = inspectDownloadedAudio,
  },
) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  do {
    try {
      return await inspectAudio(filePath, { expectedDuration });
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  } while (Date.now() <= deadline);
  throw new Error(
    `Downloaded audio did not become complete within ${timeoutMs}ms: ${lastError?.message}`,
  );
}

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.resume-${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await copyFile(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => {});
  }
}

export function createValidatedDownloadStore({
  slug,
  projectRoot = process.cwd(),
  timeoutMs = 30 * 60 * 1000,
  inspectAudio = inspectDownloadedAudio,
}) {
  return async function validateAndStore({ chapter, download, ledgerPath }) {
    const sourcePath = path.resolve(download.newPath);
    const source = await waitForValidatedAudio(sourcePath, {
      expectedDuration: chapter.expectedDuration,
      timeoutMs,
      inspectAudio,
    });
    const destinationFolder = ensureInsideProject(
      projectRoot,
      path.join("public", "books", slug, "audio"),
      "Audio folder",
    );
    const destinationPath = path.join(
      destinationFolder,
      `${chapter.expectedTitle}.m4a`,
    );
    const replacementPath = `${destinationPath}.resume-${randomUUID()}.tmp`;
    const backupPath = path.join(
      projectRoot,
      "tmp",
      "notebooklm-resume-backups",
      slug,
      `${Date.now()}-${path.basename(destinationPath)}`,
    );
    await mkdir(destinationFolder, { recursive: true });
    await copyFile(sourcePath, replacementPath);
    const destinationValidation = await inspectAudio(replacementPath, {
      expectedDuration: chapter.expectedDuration,
    });
    if (
      source.sha256 !== destinationValidation.sha256 ||
      source.fileSizeBytes !== destinationValidation.fileSizeBytes
    ) {
      await rm(replacementPath, { force: true });
      throw new Error(`Copied download identity mismatch: chapter ${chapter.chapterNumber}`);
    }

    let hadDestination = false;
    try {
      const existing = await stat(destinationPath);
      hadDestination = existing.isFile();
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (hadDestination) {
      await mkdir(path.dirname(backupPath), { recursive: true });
      await copyFile(destinationPath, backupPath);
      const [destinationHash, backupHash] = await Promise.all([
        sha256File(destinationPath),
        sha256File(backupPath),
      ]);
      if (destinationHash !== backupHash) {
        throw new Error(`Rollback backup verification failed: ${destinationPath}`);
      }
    }

    const ledgerSnapshot = await readFile(ledgerPath, "utf8");
    try {
      await rm(destinationPath, { force: true });
      await rename(replacementPath, destinationPath);

      const ledger = JSON.parse(ledgerSnapshot);
      const downloadValidation = ledger.downloadValidation ?? {};
      const chapters = Array.isArray(downloadValidation.chapters)
        ? downloadValidation.chapters.filter(
            (item) => Number(item.chapterNumber) !== chapter.chapterNumber,
          )
        : [];
      const relativeAudioPath = toPosix(path.relative(projectRoot, destinationPath));
      chapters.push({
        chapterNumber: chapter.chapterNumber,
        audioFilename: path.basename(destinationPath),
        audioPath: relativeAudioPath,
        audioSrc: publicAudioSource(projectRoot, destinationPath),
        ...destinationValidation,
        linkedInBooksJson: false,
      });
      chapters.sort((left, right) => left.chapterNumber - right.chapterNumber);

      const expectedNumbers = (ledger.entries ?? []).map((entry) =>
        Number(entry.chapterNumber),
      );
      const completedNumbers = new Set(
        chapters
          .filter((item) => item.fullDecode === true && item.fileSizeBytes > 0)
          .map((item) => Number(item.chapterNumber)),
      );
      const missingChapterNumbers = expectedNumbers.filter(
        (number) => !completedNumbers.has(number),
      );
      ledger.downloadValidation = {
        ...downloadValidation,
        status: missingChapterNumbers.length === 0 ? "complete" : "partial",
        assetFolder: toPosix(path.relative(projectRoot, destinationFolder)),
        expectedChapterCount: expectedNumbers.length,
        downloadedCount: completedNumbers.size,
        linkedCount: chapters.filter((item) => item.linkedInBooksJson).length,
        missingChapterNumbers,
        chapters,
      };
      ledger.updatedAt = new Date().toISOString();
      await writeJsonAtomic(ledgerPath, ledger);
    } catch (error) {
      if (hadDestination) await copyFile(backupPath, destinationPath);
      else await rm(destinationPath, { force: true });
      await writeFile(ledgerPath, ledgerSnapshot, "utf8");
      throw new Error(
        `Chapter ${chapter.chapterNumber} store failed and prior state was restored: ` +
          error.message,
      );
    } finally {
      await rm(replacementPath, { force: true }).catch(() => {});
    }

    return {
      chapterNumber: chapter.chapterNumber,
      destinationPath,
      backupPath: hadDestination ? backupPath : null,
      validation: destinationValidation,
    };
  };
}

export async function planResumeCommand({
  slug,
  projectRoot = process.cwd(),
  coordinatorModulePath = DEFAULT_COORDINATOR_PATH,
}) {
  const root = path.resolve(projectRoot);
  const { book, ledgerPath } = await loadBook(root, slug);
  const coordinator = await loadCoordinator(coordinatorModulePath);
  const plan = await coordinator.planNotebookLmDownloadResume({
    ledgerPath,
    projectRoot: root,
  });
  assertBookLedgerIdentity(book, plan);
  return {
    mode: "dry-run",
    status:
      plan.remainingChapterNumbers.length === 0
        ? "already-complete"
        : "resume-required",
    mutations: false,
    slug,
    bookTitle: book.title,
    ledgerPath,
    coordinatorModulePath: coordinator.resolvedPath,
    expectedChapterCount: plan.expectedChapterCount,
    completedChapterNumbers: plan.completedChapterNumbers,
    remainingChapterNumbers: plan.remainingChapterNumbers,
    firstIncompleteChapterNumber: plan.firstIncompleteChapterNumber,
    chapters: plan.chapters.map((chapter) => ({
      chapterNumber: chapter.chapterNumber,
      state: chapter.state,
      reason: chapter.reason,
    })),
  };
}

export async function runResumeCommand({
  slug,
  projectRoot = process.cwd(),
  coordinatorModulePath = DEFAULT_COORDINATOR_PATH,
  controller,
  validateAndStore,
  timeoutMs,
}) {
  const root = path.resolve(projectRoot);
  const { book, ledgerPath } = await loadBook(root, slug);
  const coordinator = await loadCoordinator(coordinatorModulePath);
  const initialPlan = await coordinator.planNotebookLmDownloadResume({
    ledgerPath,
    projectRoot: root,
  });
  assertBookLedgerIdentity(book, initialPlan);

  if (initialPlan.remainingChapterNumbers.length === 0) {
    return {
      mode: "execute",
      status: "already-complete",
      mutations: false,
      slug,
      bookTitle: book.title,
      ledgerPath,
      completedChapterNumbers: initialPlan.completedChapterNumbers,
      remainingChapterNumbers: [],
    };
  }
  if (typeof controller?.downloadChapter !== "function") {
    const error = new Error(
      "Incomplete chapters exist, but no live Chrome download controller was injected. " +
        "Keep the dry-run plan or invoke runResumeCommand from the persistent Node/Chrome workflow.",
    );
    error.code = "CHROME_CONTROLLER_REQUIRED";
    throw error;
  }

  const result = await coordinator.runNotebookLmDownloadResume({
    ledgerPath,
    projectRoot: root,
    controller,
    validateAndStore:
      validateAndStore ??
      createValidatedDownloadStore({ slug, projectRoot: root, timeoutMs }),
  });
  assertBookLedgerIdentity(book, result.plan);
  return {
    mode: "execute",
    status: "download-resume-complete",
    mutations: true,
    slug,
    bookTitle: book.title,
    ledgerPath,
    runId: result.runId,
    completedChapterNumbers: result.plan.completedChapterNumbers,
    remainingChapterNumbers: result.plan.remainingChapterNumbers,
    nextRequiredAction: `npm run link:book-audio -- ${slug}`,
  };
}

async function loadRuntimeModule(modulePath, context) {
  const resolved = path.resolve(modulePath);
  const runtimeModule = await import(
    `${pathToFileURL(resolved).href}?v=${Date.now()}`
  );
  if (typeof runtimeModule.createNotebookLmResumeRuntime !== "function") {
    throw new Error(
      `Runtime module must export createNotebookLmResumeRuntime(): ${resolved}`,
    );
  }
  const runtime = await runtimeModule.createNotebookLmResumeRuntime(context);
  if (typeof runtime?.controller?.downloadChapter !== "function") {
    throw new Error(`Runtime module did not provide a download controller: ${resolved}`);
  }
  return runtime;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    return;
  }
  const slug = args.slug || args._[0];
  const projectRoot = process.cwd();
  const coordinatorModulePath =
    args["coordinator-module"] || DEFAULT_COORDINATOR_PATH;
  const execute = Boolean(args.execute || args._.slice(1).includes("execute"));
  if (args["runtime-module"] && !execute) {
    throw new Error("--runtime-module requires --execute");
  }
  const timeoutMs = args["timeout-ms"]
    ? Number(args["timeout-ms"])
    : 30 * 60 * 1000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("--timeout-ms must be a positive number");
  }

  if (!execute) {
    console.log(
      JSON.stringify(
        await planResumeCommand({ slug, projectRoot, coordinatorModulePath }),
        null,
        2,
      ),
    );
    return;
  }

  const plan = await planResumeCommand({ slug, projectRoot, coordinatorModulePath });
  let runtime = {};
  if (plan.remainingChapterNumbers.length > 0) {
    if (!args["runtime-module"]) {
      const error = new Error(
        "--execute found incomplete chapters; pass a live --runtime-module or " +
          "invoke runResumeCommand from the persistent Node/Chrome workflow.",
      );
      error.code = "CHROME_CONTROLLER_REQUIRED";
      throw error;
    }
    runtime = await loadRuntimeModule(args["runtime-module"], {
      slug,
      projectRoot,
      downloadsDir: args["downloads-dir"]
        ? path.resolve(args["downloads-dir"])
        : undefined,
      coordinatorModulePath,
    });
  }
  console.log(
    JSON.stringify(
      await runResumeCommand({
        slug,
        projectRoot,
        coordinatorModulePath,
        controller: runtime.controller,
        validateAndStore: runtime.validateAndStore,
        timeoutMs,
      }),
      null,
      2,
    ),
  );
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main().catch((error) => {
    console.error(
      JSON.stringify(
        {
          status: "failed",
          code: error.code ?? "RESUME_COMMAND_FAILED",
          error: error.message,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  });
}
