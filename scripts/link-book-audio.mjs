import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "src", "content", "books.json");
const publicRoot = path.join(root, "public");
const supportedExtensions = new Set([".aac", ".m4a", ".mp3", ".ogg", ".wav", ".webm"]);

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

function npmConfigValue(name) {
  return process.env[`npm_config_${name.replace(/-/g, "_")}`];
}

function hasFlag(args, name) {
  return Boolean(args[name] || npmConfigValue(name) === "true");
}

function usage() {
  return [
    "Usage:",
    "  npm run link:book-audio -- <book-slug>",
    "  node scripts/link-book-audio.mjs --slug <book-slug>",
    "",
    "Options:",
    "  --audio-dir <path>  Defaults to public/books/<slug>/audio.",
    "  --provider <name>   Defaults to notebooklm.",
    "  --allow-partial     Allow chapters without matching audio files.",
    "  --dry-run           Validate and print the planned changes without writing books.json.",
  ].join("\n");
}

function extractChapterNumber(filename) {
  const stem = path.parse(filename).name.trim();
  const patterns = [
    /^(\d{1,3})(?:[._\s-]|$)/,
    /^chapter[._\s-]?(\d{1,3})(?:[._\s-]|$)/i,
    /^ch[._\s-]?(\d{1,3})(?:[._\s-]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = stem.match(pattern);
    if (match) return Number.parseInt(match[1], 10);
  }

  return null;
}

function toPublicUrl(filePath) {
  const relative = path.relative(publicRoot, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Audio file must be under public/: ${filePath}`);
  }

  return encodeURI(`/${relative.replace(/\\/g, "/")}`);
}

function collectAudioFiles(audioDir) {
  if (!fs.existsSync(audioDir) || !fs.statSync(audioDir).isDirectory()) {
    throw new Error(`Audio directory not found: ${audioDir}`);
  }

  const files = fs
    .readdirSync(audioDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const number = extractChapterNumber(entry.name);
      if (!number) {
        throw new Error(`Audio filename must start with a chapter number: ${entry.name}`);
      }

      return {
        number,
        name: entry.name,
        path: path.join(audioDir, entry.name),
        title: path.parse(entry.name).name,
      };
    })
    .sort((left, right) => left.number - right.number || left.name.localeCompare(right.name));

  if (files.length === 0) {
    throw new Error(`No supported audio files found in ${audioDir}`);
  }

  const seen = new Map();
  for (const file of files) {
    const duplicate = seen.get(file.number);
    if (duplicate) {
      throw new Error(
        `Duplicate audio for chapter ${file.number}: ${duplicate.name}, ${file.name}`,
      );
    }
    seen.set(file.number, file);
  }

  return files;
}

const args = parseArgs(process.argv);
const slugArg = args.slug || args._[0] || npmConfigValue("slug");
if (!slugArg) {
  console.error(usage());
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const book = data.books.find((item) => item.slug === slugArg || item.id === slugArg);

if (!book) {
  console.error(`Book not found: ${slugArg}`);
  process.exit(1);
}

const audioDirArg = args["audio-dir"] || args._[1] || npmConfigValue("audio-dir");
const audioDir = path.resolve(
  root,
  audioDirArg || path.join("public", "books", book.slug, "audio"),
);
const audioFiles = collectAudioFiles(audioDir);
const audioByNumber = new Map(audioFiles.map((file) => [file.number, file]));
const missingChapters = book.chapters
  .filter((chapter) => !audioByNumber.has(chapter.number))
  .map((chapter) => chapter.number);
const extraFiles = audioFiles
  .filter((file) => !book.chapters.some((chapter) => chapter.number === file.number))
  .map((file) => file.name);

if (extraFiles.length > 0) {
  throw new Error(`Audio files do not match existing chapters: ${extraFiles.join(", ")}`);
}

if (missingChapters.length > 0 && !hasFlag(args, "allow-partial")) {
  throw new Error(
    `Missing audio for chapters: ${missingChapters.join(", ")}. Use --allow-partial only for a draft audio pass.`,
  );
}

for (const chapter of book.chapters) {
  const file = audioByNumber.get(chapter.number);
  if (!file) {
    delete chapter.audio;
    continue;
  }

  chapter.audio = {
    src: toPublicUrl(file.path),
    title: file.title,
    provider: args.provider || npmConfigValue("provider") || "notebooklm",
  };
}

if (!hasFlag(args, "dry-run")) {
  fs.writeFileSync(contentPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(
  JSON.stringify(
    {
      dryRun: hasFlag(args, "dry-run"),
      title: book.title,
      slug: book.slug,
      audioDir: path.relative(root, audioDir),
      linkedChapters: audioFiles.length,
      totalChapters: book.chapters.length,
      missingChapters,
    },
    null,
    2,
  ),
);
