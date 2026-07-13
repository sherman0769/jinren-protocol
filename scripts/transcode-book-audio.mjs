import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = process.cwd();
const booksPath = path.join(root, "src", "content", "books.json");
const defaultStageDir = path.join(root, "tmp", "audio-transcode-80k");
const args = parseArgs(process.argv);
const stageDir = path.resolve(root, stringArg("stage-dir") ?? defaultStageDir);
const manifestPath = path.join(stageDir, "manifest.json");
const targetBitRate = Number.parseInt(stringArg("bitrate") ?? "80000", 10);
const targetChannels = Number.parseInt(stringArg("channels") ?? "1", 10);
const concurrency = Math.max(1, Number.parseInt(stringArg("concurrency") ?? "3", 10));

function parseArgs(argv) {
  const parsed = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const separator = token.indexOf("=");
    if (separator >= 0) {
      parsed[token.slice(2, separator)] = token.slice(separator + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }
  return parsed;
}

function stringArg(name) {
  return typeof args[name] === "string" ? args[name] : undefined;
}

function usage() {
  return [
    "Usage:",
    "  npm run transcode:book-audio                 # read-only plan",
    "  npm run stage:book-audio                       # transcode and validate under tmp/",
    "  npm run apply:book-audio                       # back up, replace, revalidate, update ledgers",
    "  node scripts/transcode-book-audio.mjs --remote-base-url https://example.com",
    "",
    "Options:",
    "  --bitrate <bps>       Defaults to 80000.",
    "  --channels <count>    Defaults to 1.",
    "  --concurrency <count> Defaults to 3.",
    "  --stage-dir <path>    Defaults to tmp/audio-transcode-80k.",
    "",
    "Stage and apply are separate gates. Apply requires a passed manifest and creates",
    "a temporary original-file backup before replacing any tracked audio.",
  ].join("\n");
}

function toPosix(value) {
  return value.replace(/\\/gu, "/");
}

function booksFromDocument(document) {
  const books = Array.isArray(document) ? document : document?.books;
  if (!Array.isArray(books)) throw new Error("books.json must contain an array or { books: [] }");
  return books;
}

function resolveSource(source, slug) {
  if (typeof source !== "string" || !source.startsWith(`/books/${slug}/audio/`)) {
    throw new Error(`Unsupported audio.src for ${slug}: ${String(source)}`);
  }
  const decoded = decodeURIComponent(source);
  const resolved = path.resolve(root, "public", `.${decoded}`);
  const publicRoot = path.join(root, "public");
  const relative = path.relative(publicRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Audio path escapes public/: ${source}`);
  }
  return resolved;
}

function inventory(document) {
  const entries = [];
  for (const book of booksFromDocument(document)) {
    for (const chapter of book.chapters ?? []) {
      if (!chapter.audio?.src) continue;
      const sourcePath = resolveSource(chapter.audio.src, book.slug);
      if (!existsSync(sourcePath) || !statSync(sourcePath).isFile() || statSync(sourcePath).size === 0) {
        throw new Error(`Missing or empty audio: ${sourcePath}`);
      }
      if (path.extname(sourcePath).toLowerCase() !== ".m4a") {
        throw new Error(`Expected an .m4a source: ${sourcePath}`);
      }
      const relativePath = toPosix(path.relative(root, sourcePath));
      entries.push({
        slug: book.slug,
        bookTitle: book.title,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        audioSrc: chapter.audio.src,
        relativePath,
        sourcePath,
        stagedPath: path.join(stageDir, "staged", relativePath),
        backupPath: path.join(stageDir, "originals", relativePath),
      });
    }
  }
  entries.sort((left, right) =>
    left.slug.localeCompare(right.slug) || left.chapterNumber - right.chapterNumber,
  );
  const duplicatePaths = entries.filter(
    (entry, index) => entries.findIndex((candidate) => candidate.relativePath === entry.relativePath) !== index,
  );
  if (duplicatePaths.length > 0) throw new Error("One or more audio files are referenced more than once");
  return entries;
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: "ignore", ...options });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function mapConcurrent(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function consume() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
  return results;
}

function probe(filePath) {
  const output = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration,bit_rate,size,format_name",
      "-show_entries", "stream=codec_name,codec_type,bit_rate,sample_rate,channels",
      "-of", "json",
      filePath,
    ],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const audio = result.streams.find((stream) => stream.codec_type === "audio");
  if (!audio) throw new Error(`No audio stream: ${filePath}`);
  return {
    codec: audio.codec_name,
    channels: Number(audio.channels),
    sampleRate: Number(audio.sample_rate),
    bitRate: Number(audio.bit_rate || result.format.bit_rate),
    durationSeconds: Number(result.format.duration),
    bytes: statSync(filePath).size,
    container: result.format.format_name,
  };
}

function lastPacketDuration(filePath) {
  const durationSeconds = probe(filePath).durationSeconds;
  const intervalStart = Math.max(0, durationSeconds - 5);
  const output = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-read_intervals", `${intervalStart}%+10`,
      "-select_streams", "a:0",
      "-show_packets",
      "-show_entries", "packet=pts_time,duration_time",
      "-of", "csv=p=0",
      filePath,
    ],
    { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  const ends = output
    .trim()
    .split(/\r?\n/gu)
    .map((line) => line.split(",").map(Number))
    .filter(([pts]) => Number.isFinite(pts))
    .map(([pts, duration]) => pts + (Number.isFinite(duration) ? duration : 0));
  if (ends.length === 0) throw new Error(`No decodable packet timestamps: ${filePath}`);
  return Math.max(...ends);
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function validatePair(entry, destinationPath) {
  const source = probe(entry.sourcePath);
  const output = probe(destinationPath);
  const durationDeltaSeconds = Math.abs(source.durationSeconds - output.durationSeconds);
  const outputLastPacketDurationSeconds = lastPacketDuration(destinationPath);
  const lastPacketDeltaSeconds = Math.abs(
    outputLastPacketDurationSeconds - output.durationSeconds,
  );
  await run("ffmpeg", [
    "-hide_banner", "-v", "error", "-xerror",
    "-i", destinationPath,
    "-map", "0:a:0",
    "-f", "null", "-",
  ]);
  const [sourceSha256, outputSha256] = await Promise.all([
    sha256(entry.sourcePath),
    sha256(destinationPath),
  ]);
  const errors = [];
  if (output.codec !== "aac") errors.push(`codec=${output.codec}`);
  if (output.channels !== targetChannels) errors.push(`channels=${output.channels}`);
  if (output.bitRate < targetBitRate * 0.85 || output.bitRate > targetBitRate * 1.2) {
    errors.push(`bitRate=${output.bitRate}`);
  }
  if (durationDeltaSeconds > 0.25) errors.push(`durationDelta=${durationDeltaSeconds}`);
  if (lastPacketDeltaSeconds > 0.1) errors.push(`lastPacketDelta=${lastPacketDeltaSeconds}`);
  if (output.bytes >= source.bytes) errors.push(`output is not smaller (${output.bytes} >= ${source.bytes})`);
  if (errors.length > 0) throw new Error(`${entry.relativePath}: ${errors.join(", ")}`);
  return {
    slug: entry.slug,
    bookTitle: entry.bookTitle,
    chapterNumber: entry.chapterNumber,
    chapterTitle: entry.chapterTitle,
    audioSrc: entry.audioSrc,
    relativePath: entry.relativePath,
    stagedPath: toPosix(path.relative(root, destinationPath)),
    original: { ...source, sha256: sourceSha256 },
    transcoded: {
      ...output,
      sha256: outputSha256,
      lastPacketDurationSeconds: outputLastPacketDurationSeconds,
      durationDeltaSeconds,
      fullDecode: true,
    },
  };
}

async function stage(entries) {
  rmSync(path.join(stageDir, "staged"), { recursive: true, force: true });
  mkdirSync(path.join(stageDir, "staged"), { recursive: true });
  const results = await mapConcurrent(entries, concurrency, async (entry, index) => {
    mkdirSync(path.dirname(entry.stagedPath), { recursive: true });
    console.log(`[${index + 1}/${entries.length}] transcode ${entry.slug}#${entry.chapterNumber}`);
    await run("ffmpeg", [
      "-hide_banner", "-v", "error", "-y",
      "-i", entry.sourcePath,
      "-vn", "-map_metadata", "-1",
      "-ac", String(targetChannels),
      "-c:a", "aac",
      "-b:a", String(targetBitRate),
      "-movflags", "+faststart",
      entry.stagedPath,
    ]);
    return validatePair(entry, entry.stagedPath);
  });
  const duplicateHashes = results.filter(
    (entry, index) =>
      results.findIndex((candidate) => candidate.transcoded.sha256 === entry.transcoded.sha256) !== index,
  );
  if (duplicateHashes.length > 0) throw new Error("Duplicate transcoded audio fingerprints detected");
  const manifest = buildManifest(results, "passed");
  mkdirSync(stageDir, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest.summary, null, 2));
}

function buildManifest(entries, status) {
  const originalBytes = entries.reduce((sum, entry) => sum + entry.original.bytes, 0);
  const transcodedBytes = entries.reduce((sum, entry) => sum + entry.transcoded.bytes, 0);
  return {
    schemaVersion: 1,
    status,
    target: { codec: "aac", container: "m4a", bitRate: targetBitRate, channels: targetChannels },
    checks: {
      metadataIdentity: "passed",
      lastPacketDuration: "passed",
      fullLocalDecode: "passed",
      uniqueFingerprints: "passed",
      deployedPlayback: "pending",
    },
    summary: {
      audioCount: entries.length,
      originalBytes,
      transcodedBytes,
      savedBytes: originalBytes - transcodedBytes,
      reductionPercent: ((originalBytes - transcodedBytes) / originalBytes) * 100,
    },
    entries,
  };
}

function readManifest() {
  if (!existsSync(manifestPath)) throw new Error(`Missing staged manifest: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (
    !["passed", "applied-and-locally-validated"].includes(manifest.status) ||
    manifest.entries?.length === 0
  ) {
    throw new Error("The staged manifest has not passed validation");
  }
  if (
    manifest.target?.codec !== "aac" ||
    manifest.target?.container !== "m4a" ||
    manifest.target?.bitRate !== targetBitRate ||
    manifest.target?.channels !== targetChannels
  ) {
    throw new Error("Manifest target does not match the requested transcode settings");
  }
  return manifest;
}

function ledgerPath(bookTitle) {
  return path.join(root, "book-txt", bookTitle, "notebooklm-audio-ledger.json");
}

function updateCanonicalData(document, manifest) {
  const byIdentity = new Map(
    manifest.entries.map((entry) => [`${entry.slug}:${entry.chapterNumber}`, entry]),
  );
  for (const book of booksFromDocument(document)) {
    for (const chapter of book.chapters ?? []) {
      const entry = byIdentity.get(`${book.slug}:${chapter.number}`);
      if (!entry) continue;
      chapter.audio.durationSeconds = entry.transcoded.durationSeconds;
    }
  }
}

function updateLedger(ledger, bookEntries) {
  const downloadValidation = ledger.downloadValidation ?? {};
  const existingItems = Array.isArray(downloadValidation.chapters)
    ? downloadValidation.chapters
    : Array.isArray(downloadValidation.files)
      ? downloadValidation.files
      : [];
  const existingByNumber = new Map(existingItems.map((item) => [item.chapterNumber, item]));
  downloadValidation.chapters = bookEntries.map((entry) => ({
    ...(existingByNumber.get(entry.chapterNumber) ?? {}),
    chapterNumber: entry.chapterNumber,
    audioFilename: path.basename(entry.relativePath),
    audioPath: entry.relativePath,
    audioSrc: entry.audioSrc,
    durationSeconds: entry.transcoded.durationSeconds,
    lastPacketDurationSeconds: entry.transcoded.lastPacketDurationSeconds,
    codec: entry.transcoded.codec,
    container: entry.transcoded.container,
    bitRate: entry.transcoded.bitRate,
    sampleRate: entry.transcoded.sampleRate,
    channels: entry.transcoded.channels,
    fileSizeBytes: entry.transcoded.bytes,
    sha256: entry.transcoded.sha256,
    fullDecode: true,
    linkedInBooksJson: true,
    transcodedFrom: {
      codec: entry.original.codec,
      bitRate: entry.original.bitRate,
      channels: entry.original.channels,
      fileSizeBytes: entry.original.bytes,
      sha256: entry.original.sha256,
    },
  }));
  delete downloadValidation.files;
  downloadValidation.downloadedCount = bookEntries.length;
  downloadValidation.linkedCount = bookEntries.length;
  ledger.downloadValidation = downloadValidation;
  ledger.transcodeValidation = {
    status: "complete",
    codec: "aac",
    container: "m4a",
    targetBitRate,
    channels: targetChannels,
    checkedAudioCount: bookEntries.length,
    failedChapterNumbers: [],
    metadataIdentityChecked: true,
    lastPacketDurationChecked: true,
    fullLocalDecodeChecked: true,
    uniqueFingerprintsChecked: true,
    productionRemoteSeekChecked: false,
  };
}

async function apply(entries) {
  const manifest = readManifest();
  const currentByPath = new Map(entries.map((entry) => [entry.relativePath, entry]));
  if (manifest.entries.length !== entries.length) throw new Error("Manifest/current inventory count mismatch");
  rmSync(path.join(stageDir, "originals"), { recursive: true, force: true });

  for (const item of manifest.entries) {
    const current = currentByPath.get(item.relativePath);
    if (!current) throw new Error(`Manifest path is no longer referenced: ${item.relativePath}`);
    if ((await sha256(current.sourcePath)) !== item.original.sha256) {
      throw new Error(`Original changed after staging: ${item.relativePath}`);
    }
    const stagedPath = path.join(root, item.stagedPath);
    if (!existsSync(stagedPath) || (await sha256(stagedPath)) !== item.transcoded.sha256) {
      throw new Error(`Staged output missing or changed: ${item.relativePath}`);
    }
    mkdirSync(path.dirname(current.backupPath), { recursive: true });
    copyFileSync(current.sourcePath, current.backupPath);
    if ((await sha256(current.backupPath)) !== item.original.sha256) {
      throw new Error(`Backup verification failed: ${item.relativePath}`);
    }
  }

  const ledgerSnapshots = new Map();
  const booksSnapshot = readFileSync(booksPath, "utf8");
  try {
    for (const item of manifest.entries) {
      const destination = path.join(root, item.relativePath);
      const replacement = `${destination}.transcode-replacement`;
      copyFileSync(path.join(root, item.stagedPath), replacement);
      rmSync(destination);
      renameSync(replacement, destination);
    }

    const destinationChecks = await mapConcurrent(manifest.entries, concurrency, async (item, index) => {
      console.log(`[${index + 1}/${manifest.entries.length}] verify destination ${item.slug}#${item.chapterNumber}`);
      const destination = path.join(root, item.relativePath);
      if ((await sha256(destination)) !== item.transcoded.sha256) {
        throw new Error(`Destination hash mismatch: ${item.relativePath}`);
      }
      const metadata = probe(destination);
      const packetEnd = lastPacketDuration(destination);
      await run("ffmpeg", [
        "-hide_banner", "-v", "error", "-xerror",
        "-i", destination,
        "-map", "0:a:0",
        "-f", "null", "-",
      ]);
      if (
        metadata.codec !== "aac" ||
        metadata.channels !== targetChannels ||
        Math.abs(packetEnd - metadata.durationSeconds) > 0.1
      ) {
        throw new Error(`Destination metadata validation failed: ${item.relativePath}`);
      }
      return true;
    });
    if (!destinationChecks.every(Boolean)) throw new Error("One or more destination checks failed");

    const document = JSON.parse(booksSnapshot);
    updateCanonicalData(document, manifest);
    const grouped = Map.groupBy(manifest.entries, (entry) => entry.bookTitle);
    for (const [bookTitle, bookEntries] of grouped) {
      const targetLedgerPath = ledgerPath(bookTitle);
      if (!existsSync(targetLedgerPath)) throw new Error(`Missing ledger: ${targetLedgerPath}`);
      const original = readFileSync(targetLedgerPath, "utf8");
      ledgerSnapshots.set(targetLedgerPath, original);
      const ledger = JSON.parse(original);
      updateLedger(ledger, bookEntries);
      writeFileSync(targetLedgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
    }
    writeFileSync(booksPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
    manifest.status = "applied-and-locally-validated";
    manifest.checks.destinationHash = "passed";
    manifest.checks.destinationLastPacketDuration = "passed";
    manifest.checks.destinationFullDecode = "passed";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ status: manifest.status, ...manifest.summary }, null, 2));
  } catch (error) {
    for (const item of manifest.entries) {
      const backup = path.join(stageDir, "originals", item.relativePath);
      const destination = path.join(root, item.relativePath);
      if (existsSync(backup)) copyFileSync(backup, destination);
    }
    writeFileSync(booksPath, booksSnapshot, "utf8");
    for (const [targetLedgerPath, original] of ledgerSnapshots) {
      writeFileSync(targetLedgerPath, original, "utf8");
    }
    throw new Error(`Apply failed and originals were restored: ${error.message}`);
  }
}

async function validateRemote(entries, baseUrl) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/u, "");
  const checks = await mapConcurrent(entries, concurrency, async (entry, index) => {
    const local = probe(entry.sourcePath);
    const url = `${normalizedBaseUrl}${entry.audioSrc}`;
    console.log(`[${index + 1}/${entries.length}] remote ${entry.slug}#${entry.chapterNumber}`);
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type") ?? "";
    const contentLength = Number(response.headers.get("content-length"));
    if (!response.ok || !contentType.startsWith("audio/") || contentLength !== local.bytes) {
      throw new Error(
        `Remote identity failed ${entry.relativePath}: ${response.status} ${contentType} ${contentLength}/${local.bytes}`,
      );
    }
    const seekSeconds = Math.max(1, Math.min(120, Math.floor(local.durationSeconds / 2)));
    await run("ffmpeg", [
      "-hide_banner", "-v", "error", "-xerror",
      "-ss", String(seekSeconds),
      "-i", url,
      "-t", "5",
      "-map", "0:a:0",
      "-f", "null", "-",
    ]);
    return { slug: entry.slug, chapterNumber: entry.chapterNumber, status: 200, contentType, contentLength, seekSeconds };
  });
  const manifest = readManifest();
  manifest.checks.deployedPlayback = "passed";
  manifest.remoteValidation = { status: "passed", baseUrl: normalizedBaseUrl, checkedAudioCount: checks.length, checks };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const grouped = Map.groupBy(checks, (check) => check.slug);
  const document = JSON.parse(readFileSync(booksPath, "utf8"));
  for (const book of booksFromDocument(document)) {
    const bookChecks = grouped.get(book.slug);
    if (!bookChecks) continue;
    const targetLedgerPath = ledgerPath(book.title);
    const ledger = JSON.parse(readFileSync(targetLedgerPath, "utf8"));
    ledger.transcodeValidation.productionRemoteSeekChecked = true;
    ledger.transcodeValidation.productionCheckedAudioCount = bookChecks.length;
    ledger.transcodeValidation.productionBaseUrl = normalizedBaseUrl;
    writeFileSync(targetLedgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify({ status: "passed", checkedAudioCount: checks.length, baseUrl: normalizedBaseUrl }, null, 2));
}

if (args.help) {
  console.log(usage());
  process.exit(0);
}
if (!Number.isFinite(targetBitRate) || targetBitRate <= 0) throw new Error("Invalid --bitrate");
if (!Number.isFinite(targetChannels) || targetChannels <= 0) throw new Error("Invalid --channels");

const selectedModes = [Boolean(args.stage), Boolean(args.apply), Boolean(stringArg("remote-base-url"))].filter(Boolean);
if (selectedModes.length > 1) throw new Error("Choose only one of --stage, --apply, or --remote-base-url");
const document = JSON.parse(readFileSync(booksPath, "utf8"));
const entries = inventory(document);

if (args.stage) {
  await stage(entries);
} else if (args.apply) {
  await apply(entries);
} else if (stringArg("remote-base-url")) {
  await validateRemote(entries, stringArg("remote-base-url"));
} else {
  const bytes = entries.reduce((sum, entry) => sum + statSync(entry.sourcePath).size, 0);
  console.log(JSON.stringify({ mode: "dry-run", audioCount: entries.length, sourceBytes: bytes, target: { codec: "aac", container: "m4a", bitRate: targetBitRate, channels: targetChannels }, stageDir: toPosix(path.relative(root, stageDir)), mutations: false }, null, 2));
}
