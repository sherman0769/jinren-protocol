import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = process.cwd();
const booksPath = path.join(root, "src", "content", "books.json");
const publicRoot = path.join(root, "public");
const supportedAudioTypes = new Map([
  [".aac", "audio/aac"],
  [".m4a", "audio/mp4"],
  [".mp3", "audio/mpeg"],
  [".mp4", "audio/mp4"],
  [".ogg", "audio/ogg"],
  [".wav", "audio/wav"],
  [".webm", "audio/webm"],
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args[rawKey] = next;
      index += 1;
    } else {
      args[rawKey] = true;
    }
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  npm run plan:audio-blob",
    "  node scripts/plan-audio-blob-migration.mjs [options]",
    "",
    "Options:",
    "  --slug <book-slug>  Plan one book instead of every book with audio.",
    "  --output <path>      Write the deterministic JSON manifest to this path.",
    "  --skip-hash          Skip SHA-256 calculation for a faster diagnostic run.",
    "  --json               Print the full manifest instead of only the summary.",
    "  --help               Show this help.",
    "",
    "This command is read-only except for the optional manifest output. It never uploads,",
    "deletes, untracks, or rewrites audio references.",
  ].join("\n");
}

function toPosix(relativePath) {
  return relativePath.replace(/\\/gu, "/");
}

function listFilesRecursively(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFilesRecursively(entryPath));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function resolvePublicAudioSource(source, slug) {
  if (typeof source !== "string" || !source.startsWith("/")) {
    throw new Error(`Book ${slug} has a non-local audio source: ${String(source)}`);
  }

  let decoded;
  try {
    decoded = decodeURIComponent(source);
  } catch {
    throw new Error(`Book ${slug} has an invalid encoded audio source: ${source}`);
  }

  const expectedPrefix = `/books/${slug}/audio/`;
  if (!decoded.startsWith(expectedPrefix)) {
    throw new Error(`Book ${slug} audio source is outside ${expectedPrefix}: ${source}`);
  }

  const resolved = path.resolve(publicRoot, `.${decoded}`);
  const relative = path.relative(publicRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Book ${slug} audio source escapes public/: ${source}`);
  }
  return resolved;
}

function trackedFiles() {
  const output = execFileSync("git", ["ls-files", "-z", "--", "public/books/*/audio/*"], {
    cwd: root,
    encoding: "utf8",
  });
  return new Set(output.split("\0").filter(Boolean).map(toPosix));
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

function duplicateValues(items, select) {
  const groups = new Map();
  for (const item of items) {
    const value = select(item);
    const existing = groups.get(value) ?? [];
    existing.push(item);
    groups.set(value, existing);
  }
  return [...groups.entries()].filter(([, group]) => group.length > 1);
}

const args = parseArgs(process.argv);
if (args.help) {
  console.log(usage());
  process.exit(0);
}

if (!existsSync(booksPath)) throw new Error(`Missing canonical book data: ${booksPath}`);
const document = JSON.parse(readFileSync(booksPath, "utf8"));
const books = Array.isArray(document) ? document : document?.books;
if (!Array.isArray(books)) {
  throw new Error("src/content/books.json must be an array or an object with a books array");
}

const duplicatedSlugs = duplicateValues(books, (book) => book.slug);
if (duplicatedSlugs.length > 0) {
  throw new Error(`Duplicate book slugs: ${duplicatedSlugs.map(([slug]) => slug).join(", ")}`);
}

const requestedSlug = typeof args.slug === "string" ? args.slug : undefined;
if (requestedSlug && !books.some((book) => book.slug === requestedSlug)) {
  throw new Error(`Unknown book slug: ${requestedSlug}`);
}

const selectedBooks = books.filter(
  (book) =>
    (!requestedSlug || book.slug === requestedSlug) &&
    Array.isArray(book.chapters) &&
    book.chapters.some((chapter) => chapter.audio?.src),
);
if (selectedBooks.length === 0) {
  throw new Error(requestedSlug ? `Book has no audio references: ${requestedSlug}` : "No audio references found");
}

const tracked = trackedFiles();
const entries = [];
const errors = [];
const warnings = [];

for (const book of selectedBooks) {
  const duplicateChapterNumbers = duplicateValues(book.chapters, (chapter) => chapter.number);
  if (duplicateChapterNumbers.length > 0) {
    errors.push(
      `Book ${book.slug} has duplicate chapter numbers: ${duplicateChapterNumbers
        .map(([number]) => number)
        .join(", ")}`,
    );
  }

  for (const chapter of book.chapters) {
    if (!chapter.audio?.src) continue;
    let filePath;
    try {
      filePath = resolvePublicAudioSource(chapter.audio.src, book.slug);
    } catch (error) {
      errors.push(error.message);
      continue;
    }

    const relativePath = toPosix(path.relative(root, filePath));
    const extension = path.extname(filePath).toLowerCase();
    const contentType = supportedAudioTypes.get(extension);
    if (!contentType) errors.push(`Unsupported audio extension: ${relativePath}`);
    if (!existsSync(filePath)) {
      errors.push(`Referenced audio file is missing: ${relativePath}`);
      continue;
    }

    const stats = statSync(filePath);
    if (!stats.isFile() || stats.size === 0) {
      errors.push(`Referenced audio is not a non-empty file: ${relativePath}`);
      continue;
    }

    const isTracked = tracked.has(relativePath);
    if (!isTracked) errors.push(`Referenced audio is not tracked by Git: ${relativePath}`);
    const filename = path.basename(filePath);
    entries.push({
      slug: book.slug,
      bookTitle: book.title,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      localPath: relativePath,
      currentSrc: chapter.audio.src,
      rollbackSrc: chapter.audio.src,
      blobPathname: `books/${book.slug}/audio/${filename}`,
      contentType,
      bytes: stats.size,
      gitTracked: isTracked,
      sha256: null,
    });
  }
}

const selectedSlugs = new Set(selectedBooks.map((book) => book.slug));
const diskAudioFiles = listFilesRecursively(path.join(publicRoot, "books"))
  .filter((filePath) => path.basename(path.dirname(filePath)) === "audio")
  .filter((filePath) => selectedSlugs.has(path.basename(path.dirname(path.dirname(filePath)))))
  .map((filePath) => toPosix(path.relative(root, filePath)))
  .sort();
const referencedPaths = new Set(entries.map((entry) => entry.localPath));
const unreferencedAudioFiles = diskAudioFiles.filter((filePath) => !referencedPaths.has(filePath));
if (unreferencedAudioFiles.length > 0) {
  errors.push(`Unreferenced audio files: ${unreferencedAudioFiles.join(", ")}`);
}

const duplicateLocalPaths = duplicateValues(entries, (entry) => entry.localPath);
if (duplicateLocalPaths.length > 0) {
  errors.push(`Audio files referenced more than once: ${duplicateLocalPaths.map(([value]) => value).join(", ")}`);
}
const duplicateBlobPaths = duplicateValues(entries, (entry) => entry.blobPathname);
if (duplicateBlobPaths.length > 0) {
  errors.push(`Blob pathname collisions: ${duplicateBlobPaths.map(([value]) => value).join(", ")}`);
}

if (!args["skip-hash"] && errors.length === 0) {
  for (const entry of entries) {
    entry.sha256 = await sha256(path.join(root, entry.localPath));
  }
  const duplicateHashes = duplicateValues(entries, (entry) => entry.sha256);
  if (duplicateHashes.length > 0) {
    errors.push(
      `Duplicate audio fingerprints require manual identity review: ${duplicateHashes
        .map(([hash, group]) => `${hash} (${group.map((entry) => `${entry.slug}#${entry.chapterNumber}`).join(", ")})`)
        .join("; ")}`,
    );
  }
} else if (args["skip-hash"]) {
  warnings.push("SHA-256 was skipped by request; execute-mode migration must not use this manifest");
}

entries.sort(
  (left, right) =>
    left.slug.localeCompare(right.slug) ||
    left.chapterNumber - right.chapterNumber ||
    left.localPath.localeCompare(right.localPath),
);

const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
const trackedBytes = entries
  .filter((entry) => entry.gitTracked)
  .reduce((sum, entry) => sum + entry.bytes, 0);
const report = {
  schemaVersion: 1,
  mode: "dry-run",
  status: errors.length === 0 ? "passed" : "failed",
  destructiveChanges: false,
  uploadPerformed: false,
  sourceReferencesChanged: false,
  localFilesDeleted: false,
  gitHistoryRewritten: false,
  scope: requestedSlug ?? "all-books-with-audio",
  summary: {
    selectedBookCount: selectedBooks.length,
    referencedAudioCount: entries.length,
    diskAudioCount: diskAudioFiles.length,
    gitTrackedAudioCount: entries.filter((entry) => entry.gitTracked).length,
    totalBytes,
    potentialFutureCheckoutReliefBytes: trackedBytes,
    hashAlgorithm: args["skip-hash"] ? null : "sha256",
    unreferencedAudioCount: unreferencedAudioFiles.length,
  },
  invariants: {
    oneReferencePerLocalFile: duplicateLocalPaths.length === 0,
    oneReferencePerBlobPathname: duplicateBlobPaths.length === 0,
    everyReferencedFileExists: !errors.some((error) => error.startsWith("Referenced audio file is missing")),
    everyReferencedFileIsNonEmpty: !errors.some((error) =>
      error.startsWith("Referenced audio is not a non-empty file"),
    ),
    everyReferencedFileIsGitTracked: entries.every((entry) => entry.gitTracked),
    noUnreferencedFilesInSelectedAudioFolders: unreferencedAudioFiles.length === 0,
    uniqueAudioFingerprints:
      args["skip-hash"] || entries.some((entry) => !entry.sha256)
        ? null
        : duplicateValues(entries, (entry) => entry.sha256).length === 0,
  },
  errors,
  warnings,
  rollback: {
    strategy: "Restore each chapter audio.src from entries[].rollbackSrc; local files remain untouched during migration.",
    entries: entries.map(({ slug, chapterNumber, rollbackSrc }) => ({
      slug,
      chapterNumber,
      audioSrc: rollbackSrc,
    })),
  },
  entries,
};

if (typeof args.output === "string") {
  const outputPath = path.resolve(root, args.output);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

if (args.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    JSON.stringify(
      {
        status: report.status,
        mode: report.mode,
        scope: report.scope,
        output: typeof args.output === "string" ? toPosix(path.relative(root, path.resolve(root, args.output))) : null,
        ...report.summary,
        errors: report.errors,
        warnings: report.warnings,
      },
      null,
      2,
    ),
  );
}

if (errors.length > 0) process.exitCode = 1;
