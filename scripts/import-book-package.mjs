import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "src", "content", "books.json");

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;

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
    "  node scripts/import-book-package.mjs --package <extracted-package-dir> --source <published-source-path> --slug <book-slug>",
    "",
    "Options:",
    "  --id <book-id>      Defaults to --slug.",
    "  --title <title>     Override inferred book title.",
    "  --subtitle <text>   Override inferred subtitle.",
    "  --description <text> Override inferred description.",
    "  --genre <csv>       Override default comma-separated genre list.",
    "  --replace-existing Replace the matching existing book instead of appending a new one.",
    "  --dry-run          Validate and print the generated book without writing books.json.",
  ].join("\n");
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function findPackageRoot(inputPath) {
  const resolved = path.resolve(root, inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Package directory not found: ${resolved}`);
  }

  if (fs.existsSync(path.join(resolved, "full_book.md"))) {
    return { root: resolved, format: "overview-expanded" };
  }

  if (fs.existsSync(path.join(resolved, "00_full_manuscript.md"))) {
    return { root: resolved, format: "full-manuscript-package" };
  }

  if (
    fs.existsSync(path.join(resolved, "metadata.json")) &&
    fs.existsSync(path.join(resolved, "chapters"))
  ) {
    return { root: resolved, format: "metadata-chapters-package" };
  }

  const children = fs
    .readdirSync(resolved, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(resolved, entry.name));

  const overviewPackageRoot = children.find((candidate) => fs.existsSync(path.join(candidate, "full_book.md")));
  if (overviewPackageRoot) {
    return { root: overviewPackageRoot, format: "overview-expanded" };
  }

  const manuscriptPackageRoot = children.find((candidate) =>
    fs.existsSync(path.join(candidate, "00_full_manuscript.md")),
  );
  if (manuscriptPackageRoot) {
    return { root: manuscriptPackageRoot, format: "full-manuscript-package" };
  }

  const metadataPackageRoot = children.find(
    (candidate) =>
      fs.existsSync(path.join(candidate, "metadata.json")) &&
      fs.existsSync(path.join(candidate, "chapters")),
  );
  if (metadataPackageRoot) {
    return { root: metadataPackageRoot, format: "metadata-chapters-package" };
  }

  throw new Error(`Could not find supported book package under ${resolved}`);
}

function parseMetadataPackageOverview(packageRoot) {
  const metadataPath = path.join(packageRoot, "metadata.json");
  assertFile(metadataPath, "metadata.json");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  return {
    title: normalizeWhitespace(metadata.title),
    subtitle: normalizeWhitespace(metadata.subtitle),
    author: normalizeWhitespace(metadata.author),
    description: normalizeWhitespace(metadata.description),
  };
}

function normalizeWhitespace(value) {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([，。！？；：、,.!?;:])/g, "$1")
    .trim();
}

function readHeadingBody(markdown, heading) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const start = lines.findIndex((line) => normalizeWhitespace(line) === `## ${heading}`);
  if (start === -1) return "";

  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line)) break;
    if (/^\s*$/.test(line) && body.length === 0) continue;
    body.push(line);
  }

  return body.join("\n").trim();
}

function firstParagraph(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => normalizeWhitespace(block.replace(/^[-*]\s+/gm, "")))
    .find(Boolean);
}

function parseOverview(packageRoot) {
  const overviewPath = path.join(packageRoot, "book_overview.md");
  assertFile(overviewPath, "book_overview.md");
  const overview = fs.readFileSync(overviewPath, "utf8");

  const title =
    overview
      .split("\n")
      .map((line) => line.trim())
      .find((line) => /^#\s+/.test(line))
      ?.replace(/^#\s+/, "")
      .trim() ?? "";

  const subtitle = firstParagraph(readHeadingBody(overview, "副標"));
  const positioning = firstParagraph(readHeadingBody(overview, "定位"));
  const coreAnswer = firstParagraph(readHeadingBody(overview, "全書核心答案"));

  return {
    title,
    subtitle,
    description:
      positioning ||
      coreAnswer ||
      "一本整理 AI 工作流、代理協作與多智慧體工作台方法論的書。",
  };
}

function parseFullManuscriptOverview(packageRoot) {
  const manuscriptPath = path.join(packageRoot, "00_full_manuscript.md");
  assertFile(manuscriptPath, "00_full_manuscript.md");
  const manuscript = fs.readFileSync(manuscriptPath, "utf8").replace(/\r/g, "");
  const lines = manuscript.split("\n");

  const title =
    lines
      .map((line) => line.trim())
      .find((line) => /^#\s+/.test(line))
      ?.replace(/^#\s+/, "")
      .trim() ?? "";

  const subtitle =
    lines
      .map((line) => line.trim())
      .find((line) => /^\*\*.+\*\*$/.test(line))
      ?.replace(/^\*\*|\*\*$/g, "")
      .trim() ?? "";

  return {
    title,
    subtitle,
    description: "一本面向 AI Agent 時代的驗證、記憶、工作流與治理設計筆記。",
  };
}

function collectOverviewChapterFiles(packageRoot) {
  const expandedRoot = path.join(packageRoot, "expanded");
  if (!fs.existsSync(expandedRoot)) {
    throw new Error(`expanded folder not found: ${expandedRoot}`);
  }

  const chapterFiles = [];

  for (const entry of fs.readdirSync(expandedRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const chapterDir = path.join(expandedRoot, entry.name);
    for (const file of fs.readdirSync(chapterDir, { withFileTypes: true })) {
      if (!file.isFile()) continue;
      const match = file.name.match(/^chapter_(\d{2})_main\.md$/i);
      if (!match) continue;
      chapterFiles.push({
        number: Number.parseInt(match[1], 10),
        path: path.join(chapterDir, file.name),
        preserveHeadingTitle: false,
      });
    }
  }

  chapterFiles.sort((left, right) => left.number - right.number);

  if (chapterFiles.length === 0) {
    throw new Error(`No chapter_XX_main.md files found under ${expandedRoot}`);
  }

  return chapterFiles;
}

function collectFullManuscriptChapterFiles(packageRoot) {
  const chapterFiles = [];

  for (const entry of fs.readdirSync(packageRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const chapterDir = path.join(packageRoot, entry.name);
    for (const file of fs.readdirSync(chapterDir, { withFileTypes: true })) {
      if (!file.isFile()) continue;
      const match = file.name.match(/^chapter_(\d{2})_main\.md$/i);
      if (!match) continue;
      chapterFiles.push({
        sourceNumber: Number.parseInt(match[1], 10),
        path: path.join(chapterDir, file.name),
        preserveHeadingTitle: true,
      });
    }
  }

  chapterFiles.sort((left, right) => left.sourceNumber - right.sourceNumber);

  if (chapterFiles.length === 0) {
    throw new Error(`No chapter_XX_main.md files found under ${packageRoot}`);
  }

  return chapterFiles.map((file, index) => ({
    ...file,
    number: index + 1,
  }));
}

function collectMetadataPackageChapterFiles(packageRoot) {
  const chaptersRoot = path.join(packageRoot, "chapters");
  const chapterFiles = [];

  for (const entry of fs.readdirSync(chaptersRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const chapterDir = path.join(chaptersRoot, entry.name);
    for (const file of fs.readdirSync(chapterDir, { withFileTypes: true })) {
      if (!file.isFile()) continue;
      const match = file.name.match(/^chapter_(\d{2})_main\.md$/i);
      if (!match) continue;
      chapterFiles.push({
        number: Number.parseInt(match[1], 10),
        path: path.join(chapterDir, file.name),
        preserveHeadingTitle: false,
      });
    }
  }

  chapterFiles.sort((left, right) => left.number - right.number);

  if (chapterFiles.length === 0) {
    throw new Error(`No chapter_XX_main.md files found under ${chaptersRoot}`);
  }

  return chapterFiles;
}

function isSkippableLine(line) {
  const text = normalizeWhitespace(line.replace(/^>\s*/, ""));
  if (!text) return false;
  return (
    /^來源觸發點[:：]/.test(text) ||
    /^本章為個人內化書稿/.test(text) ||
    /^主要依據使用者提供之/.test(text) ||
    /^為李詩民整理的個人內化版書稿$/.test(text)
  );
}

function cleanMarkdownLine(line) {
  return normalizeWhitespace(
    line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^>\s*/, "")
      .replace(/\*\*/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
  );
}

function looksLikeListLine(line) {
  return /^[-*]\s+/.test(line) || /^\d+[.)、]\s+/.test(line);
}

function cleanListLine(line) {
  const text = cleanMarkdownLine(line);
  if (/^[-*]\s+/.test(line)) return text.replace(/^[-*]\s+/, "- ");
  return text;
}

function pushBlock(paragraphs, block) {
  const lines = block.map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return;

  const allListLines = lines.every(looksLikeListLine);
  if (allListLines) {
    for (const line of lines) {
      const item = cleanListLine(line);
      if (item) paragraphs.push(item);
    }
    return;
  }

  const cleanedLines = lines.map(cleanMarkdownLine).filter(Boolean);
  if (cleanedLines.length === 0) return;

  const paragraph = normalizeWhitespace(cleanedLines.join(""));
  if (paragraph) paragraphs.push(paragraph);
}

function parseChapter(fileInfo) {
  const raw = fs.readFileSync(fileInfo.path, "utf8").replace(/\r/g, "");
  const lines = raw.split("\n");
  const heading = lines.find((line) => /^#\s+/.test(line.trim()));

  const headingTitle = heading ? cleanMarkdownLine(heading) : "";
  const title = headingTitle
    ? fileInfo.preserveHeadingTitle
      ? headingTitle
      : headingTitle.replace(/^第\s*\d+\s*章\s*[｜|:：-]\s*/, "")
    : `第 ${fileInfo.number} 章`;

  const paragraphs = [];
  let block = [];
  let skippedChapterHeading = false;

  const flush = () => {
    pushBlock(paragraphs, block);
    block = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!skippedChapterHeading && line === heading?.trim()) {
      skippedChapterHeading = true;
      continue;
    }

    if (/^-{3,}$/.test(line) || isSkippableLine(line)) {
      flush();
      continue;
    }

    if (!line) {
      flush();
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      flush();
      const headingParagraph = cleanMarkdownLine(line);
      if (headingParagraph) paragraphs.push(headingParagraph);
      continue;
    }

    block.push(line);
  }

  flush();

  const deduped = paragraphs.filter((paragraph, index) => paragraph && paragraphs[index - 1] !== paragraph);
  const summarySource =
    deduped.find((paragraph) => !/^[-*]\s+/.test(paragraph) && !/^(章首開場|現象觀察|問題指出|新觀念提出|模型整理|實際情境|內化筆記|延伸提醒|案例拆解|給自己的三個問題|演講提煉|章末金句)$/.test(paragraph)) ??
    deduped[0] ??
    title;
  const characters = deduped.join("").length;

  return {
    id: `chapter-${String(fileInfo.number).padStart(2, "0")}`,
    number: fileInfo.number,
    title,
    summary: normalizeWhitespace(summarySource).slice(0, 140),
    minutes: Math.max(2, Math.ceil(characters / 850)),
    paragraphs: deduped,
  };
}

function validateBook(book) {
  const requiredBookFields = [
    "id",
    "slug",
    "title",
    "subtitle",
    "author",
    "description",
    "status",
    "genre",
    "rating",
    "cover",
    "ogImage",
    "sourceUrl",
    "chapters",
  ];

  for (const field of requiredBookFields) {
    if (book[field] == null || book[field] === "") {
      throw new Error(`Book is missing required field: ${field}`);
    }
  }

  if (!Array.isArray(book.genre) || book.genre.length === 0) {
    throw new Error("Book genre must be a non-empty array");
  }

  if (!Array.isArray(book.chapters) || book.chapters.length === 0) {
    throw new Error("Book chapters must be a non-empty array");
  }

  book.chapters.forEach((chapter, index) => {
    const expected = index + 1;
    if (chapter.number !== expected) {
      throw new Error(`Chapter numbering gap at index ${index}: expected ${expected}, got ${chapter.number}`);
    }
    for (const field of ["id", "number", "title", "summary", "minutes", "paragraphs"]) {
      if (chapter[field] == null || chapter[field] === "") {
        throw new Error(`Chapter ${expected} missing field: ${field}`);
      }
    }
    if (!Array.isArray(chapter.paragraphs) || chapter.paragraphs.length === 0) {
      throw new Error(`Chapter ${expected} has no paragraphs`);
    }
  });
}

const args = parseArgs(process.argv);

if (!args.package || !args.source || !args.slug) {
  console.error(usage());
  process.exit(1);
}

const packageInfo = findPackageRoot(args.package);
const packageRoot = packageInfo.root;
const overview =
  packageInfo.format === "full-manuscript-package"
    ? parseFullManuscriptOverview(packageRoot)
    : packageInfo.format === "metadata-chapters-package"
      ? parseMetadataPackageOverview(packageRoot)
    : parseOverview(packageRoot);
const chapters =
  packageInfo.format === "full-manuscript-package"
    ? collectFullManuscriptChapterFiles(packageRoot).map(parseChapter)
    : packageInfo.format === "metadata-chapters-package"
      ? collectMetadataPackageChapterFiles(packageRoot).map(parseChapter)
    : collectOverviewChapterFiles(packageRoot).map(parseChapter);
const slug = args.slug;
const id = args.id || slug;
const genre = args.genre
  ? args.genre
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  : ["AI 架構", "多智慧體協作", "AI 工作流", "技術方法論"];

const book = {
  id,
  slug,
  title: args.title || overview.title,
  subtitle: args.subtitle || overview.subtitle,
  author: overview.author || "李詩民",
  description: args.description || overview.description,
  status: "published",
  genre,
  rating: "All",
  cover: `/books/${slug}/cover.png`,
  ogImage: `/books/${slug}/cover.png`,
  sourceUrl: args.source,
  chapters,
};

validateBook(book);

const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const duplicateIndex = data.books.findIndex(
  (existing) =>
    existing.slug === book.slug ||
    existing.id === book.id ||
    existing.title === book.title ||
    existing.sourceUrl === book.sourceUrl,
);
const duplicate = duplicateIndex === -1 ? null : data.books[duplicateIndex];

if (duplicate && !args["replace-existing"]) {
  throw new Error(`Refusing to import duplicate book: ${duplicate.title} (${duplicate.slug})`);
}

if (!duplicate && args["replace-existing"]) {
  throw new Error(`Cannot replace existing book because no matching book was found for slug: ${book.slug}`);
}

if (!args["dry-run"]) {
  if (duplicate) {
    data.books[duplicateIndex] = book;
  } else {
    data.books.push(book);
  }
  fs.writeFileSync(contentPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(
  JSON.stringify(
    {
      dryRun: Boolean(args["dry-run"]),
      mode: duplicate ? "replace" : "append",
      replaced: duplicate
        ? {
            title: duplicate.title,
            slug: duplicate.slug,
            sourceUrl: duplicate.sourceUrl,
            chapters: duplicate.chapters.length,
          }
        : null,
      title: book.title,
      slug: book.slug,
      sourceUrl: book.sourceUrl,
      chapters: book.chapters.length,
      paragraphs: book.chapters.reduce((total, chapter) => total + chapter.paragraphs.length, 0),
      characters: book.chapters.reduce(
        (total, chapter) =>
          total + chapter.paragraphs.reduce((chapterTotal, paragraph) => chapterTotal + paragraph.length, 0),
        0,
      ),
    },
    null,
    2,
  ),
);
