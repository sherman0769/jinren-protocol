import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const booksPath = path.join(root, "src", "content", "books.json");

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

function normalizeWhitespace(value) {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([，。！？；：、,.!?;:])/g, "$1")
    .trim();
}

function cleanMarkdownLine(line) {
  return normalizeWhitespace(
    line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^>\s*/, "")
      .replace(/\*\*/g, "")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\x60([^\x60]+)\x60/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
  );
}

function splitTopLevelSections(markdown) {
  const sections = [];
  let current = null;
  let fence = null;

  for (const rawLine of markdown.replace(/\r/g, "").split("\n")) {
    const trimmed = rawLine.trim();
    const fenceMatch = trimmed.match(/^(\x60{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === marker) fence = null;
      else if (!fence) fence = marker;
      if (current) current.lines.push(rawLine);
      continue;
    }

    if (!fence) {
      const headingMatch = rawLine.match(/^#\s+(.+)$/);
      if (headingMatch) {
        if (current) sections.push(current);
        current = { title: cleanMarkdownLine(headingMatch[1]), lines: [] };
        continue;
      }
    }

    if (current) current.lines.push(rawLine);
  }

  if (current) sections.push(current);
  return sections;
}

function isMarkdownTableSeparator(line) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
}

function cleanMarkdownTableRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map(cleanMarkdownLine)
    .filter(Boolean)
    .join("｜");
}

function looksLikeListLine(line) {
  return /^[-*]\s+/.test(line) || /^\d+[.)、]\s+/.test(line);
}

function cleanListLine(line) {
  const cleaned = cleanMarkdownLine(line);
  return /^[-*]\s+/.test(line) ? cleaned.replace(/^[-*]\s+/, "- ") : cleaned;
}

function pushBlock(paragraphs, block) {
  const lines = block.map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return;

  if (lines.every(looksLikeListLine)) {
    for (const line of lines) {
      const item = cleanListLine(line);
      if (item) paragraphs.push(item);
    }
    return;
  }

  const paragraph = normalizeWhitespace(lines.map(cleanMarkdownLine).filter(Boolean).join(""));
  if (paragraph) paragraphs.push(paragraph);
}

function parseSection(section) {
  const paragraphs = [];
  let block = [];
  let fence = null;

  const flush = () => {
    pushBlock(paragraphs, block);
    block = [];
  };

  for (const rawLine of section.lines) {
    const line = rawLine.trim();
    const fenceMatch = line.match(/^(\x60{3,}|~{3,})/);

    if (fenceMatch) {
      flush();
      const marker = fenceMatch[1][0];
      if (fence === marker) fence = null;
      else if (!fence) fence = marker;
      continue;
    }

    if (fence) {
      flush();
      const codeLine = cleanMarkdownLine(line);
      if (codeLine) paragraphs.push(codeLine);
      continue;
    }

    if (!line) {
      flush();
      continue;
    }

    if (/^-{3,}$/.test(line) || isMarkdownTableSeparator(line)) {
      flush();
      continue;
    }

    if (line.includes("|") && /^\|.*\|$/.test(line)) {
      flush();
      const tableRow = cleanMarkdownTableRow(line);
      if (tableRow) paragraphs.push(tableRow);
      continue;
    }

    if (/^#{2,6}\s+/.test(line)) {
      flush();
      const heading = cleanMarkdownLine(line);
      if (heading) paragraphs.push(heading);
      continue;
    }

    block.push(line);
  }

  flush();
  return paragraphs.filter(
    (paragraph, index) => paragraph && paragraphs[index - 1] !== paragraph,
  );
}

function parseOverview(manuscriptPath) {
  const markdown = fs.readFileSync(manuscriptPath, "utf8");
  const sections = splitTopLevelSections(markdown);
  if (sections.length === 0) {
    throw new Error("No level-one Markdown heading found: " + manuscriptPath);
  }

  const titleSection = sections[0];
  const subtitleLine = titleSection.lines
    .map((line) => line.trim())
    .find((line) => /^##\s+/.test(line));
  const authorLine = titleSection.lines
    .map(cleanMarkdownLine)
    .find((line) => /^作者[:：]/.test(line));
  const descriptionSection = sections.find(
    (section) => normalizeWhitespace(section.title) === "閱讀與版本說明",
  );
  const descriptionParagraphs = descriptionSection ? parseSection(descriptionSection) : [];

  return {
    title: titleSection.title,
    subtitle: subtitleLine ? cleanMarkdownLine(subtitleLine) : "",
    author: authorLine ? authorLine.replace(/^作者[:：]\s*/, "") : "李詩民",
    description:
      descriptionParagraphs.find((paragraph) => paragraph.length >= 30)?.slice(0, 180) ||
      "一本把模糊想法整理成可執行、可驗收、可交接之 AI 工作的方法書。",
  };
}

function collectChapters(manuscriptPath) {
  const markdown = fs.readFileSync(manuscriptPath, "utf8");
  const sections = splitTopLevelSections(markdown);
  const candidates = [];
  let appendixPrelude = [];

  for (const section of sections.slice(1)) {
    const title = normalizeWhitespace(section.title);
    if (title === "目錄") continue;

    const paragraphs = parseSection(section);
    if (title === "附錄") {
      appendixPrelude = paragraphs;
      continue;
    }

    const mergedParagraphs =
      appendixPrelude.length > 0 && /^附錄一(?:\b|[｜|:：])/u.test(title)
        ? [...appendixPrelude, ...paragraphs]
        : paragraphs;
    appendixPrelude = [];

    if (mergedParagraphs.length > 0) {
      candidates.push({ title, paragraphs: mergedParagraphs });
    }
  }

  return candidates.map((section, index) => {
    const number = index + 1;
    const summarySource =
      section.paragraphs.find(
        (paragraph) =>
          paragraph.length >= 30 &&
          !/^[-*]\s+/.test(paragraph) &&
          !/^\d+[.)、]\s+/.test(paragraph),
      ) || section.paragraphs[0];
    const characters = section.paragraphs.join("").length;

    return {
      id: "chapter-" + String(number).padStart(2, "0"),
      number,
      title: section.title,
      summary: normalizeWhitespace(summarySource).slice(0, 140),
      minutes: Math.max(2, Math.ceil(characters / 850)),
      paragraphs: section.paragraphs,
    };
  });
}

function validateBook(book) {
  const requiredFields = [
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

  for (const field of requiredFields) {
    if (book[field] == null || book[field] === "") {
      throw new Error("Book is missing required field: " + field);
    }
  }

  if (!Array.isArray(book.genre) || book.genre.length === 0) {
    throw new Error("Book genre must be a non-empty array");
  }
  if (!Array.isArray(book.chapters) || book.chapters.length === 0) {
    throw new Error("Book chapters must be a non-empty array");
  }

  for (const [index, chapter] of book.chapters.entries()) {
    const expected = index + 1;
    if (chapter.number !== expected) {
      throw new Error(
        "Chapter numbering gap at index " + index + ": expected " + expected + ", got " + chapter.number,
      );
    }
    if (!chapter.title || !chapter.summary || !Array.isArray(chapter.paragraphs) || chapter.paragraphs.length === 0) {
      throw new Error("Chapter " + expected + " is incomplete");
    }
  }
}

const args = parseArgs(process.argv);
if (!args.manuscript || !args.source || !args.slug) {
  throw new Error(
    "Usage: node scripts/import-markdown-book.mjs --manuscript <file.md> --source <archived-source> --slug <slug> [--dry-run]",
  );
}

const manuscriptPath = path.resolve(root, args.manuscript);
if (!fs.existsSync(manuscriptPath) || !fs.statSync(manuscriptPath).isFile()) {
  throw new Error("Markdown manuscript not found: " + manuscriptPath);
}
if (path.extname(manuscriptPath).toLowerCase() !== ".md") {
  throw new Error("Markdown manuscript must use the .md extension");
}

const overview = parseOverview(manuscriptPath);
const slug = args.slug;
const chapters = collectChapters(manuscriptPath);
const book = {
  id: args.id || slug,
  slug,
  title: args.title || overview.title,
  subtitle: args.subtitle || overview.subtitle,
  author: args.author || overview.author || "李詩民",
  description: args.description || overview.description,
  status: "published",
  genre: args.genre
    ? args.genre.split(",").map((item) => item.trim()).filter(Boolean)
    : ["AI 工作流", "工作設計", "Codex"],
  rating: "All",
  cover: "/books/" + slug + "/cover.png",
  ogImage: "/books/" + slug + "/cover.png",
  sourceUrl: args.source,
  chapters,
};

validateBook(book);

const data = JSON.parse(fs.readFileSync(booksPath, "utf8"));
const duplicateIndex = data.books.findIndex(
  (existing) =>
    existing.slug === book.slug ||
    existing.id === book.id ||
    existing.title === book.title ||
    existing.sourceUrl === book.sourceUrl,
);
const duplicate = duplicateIndex === -1 ? null : data.books[duplicateIndex];

if (duplicate && !args["replace-existing"]) {
  throw new Error("Refusing to import duplicate book: " + duplicate.title + " (" + duplicate.slug + ")");
}
if (!duplicate && args["replace-existing"]) {
  throw new Error("No existing book matches " + book.slug);
}

if (!args["dry-run"]) {
  if (duplicate) data.books[duplicateIndex] = book;
  else data.books.push(book);
  fs.writeFileSync(booksPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

console.log(
  JSON.stringify(
    {
      dryRun: Boolean(args["dry-run"]),
      mode: duplicate ? "replace" : "append",
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      slug: book.slug,
      sourceUrl: book.sourceUrl,
      chapters: book.chapters.length,
      paragraphs: book.chapters.reduce((total, chapter) => total + chapter.paragraphs.length, 0),
      characters: book.chapters.reduce(
        (total, chapter) =>
          total + chapter.paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0),
        0,
      ),
      chapterTitles: book.chapters.map((chapter) => chapter.title),
    },
    null,
    2,
  ),
);
