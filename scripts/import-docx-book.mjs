import path from "node:path";
import mammoth from "mammoth";
import { parseOptions, saveImportedBook, writeOptions } from "./lib/book-write-safety.mjs";

const args = parseOptions();
const options = writeOptions(args);
const { root } = options;
if (![args.manuscript, args.slug, args.source].every((value) => typeof value === "string" && value.trim())) {
  throw new Error("Usage: npm run import:book -- --manuscript <file.docx> --source <source-path> --slug <slug> [--title <title>] [--apply]");
}
const inputPath = path.resolve(root, args.manuscript);
if (path.extname(inputPath).toLowerCase() !== ".docx") throw new Error("manuscript：必須為 .docx");

const result = await mammoth.extractRawText({ path: inputPath });
const raw = result.value
  .replace(/\r/g, "")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const lines = raw
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const title = args.title || path.basename(inputPath, path.extname(inputPath));
const author = args.author || "李詩民";
const sourceUrl = args.source;

const headingPatterns = [
  /^書名頁$/,
  /^推薦序$/,
  /^謹識$/,
  /^版權頁$/,
  /^第\s*[一二三四五六七八九十百0-9]+\s*[章部篇]/,
  /^Chapter\s+\d+/i,
  /^終章[:：]/,
  /^寫在(?:前面|後面|結束)/,
  /^結束，也?是/,
  /^若你讀畢之後/,
  /^我的推薦理由/,
  /^書中四大部/,
];

function isHeading(line) {
  if (line.length > 42) return false;
  return headingPatterns.some((pattern) => pattern.test(line));
}

const sections = [];
let current = { title: "書名頁", paragraphs: [] };

for (const line of lines) {
  if (isHeading(line)) {
    if (current.paragraphs.length > 0) sections.push(current);
    current = { title: line, paragraphs: [] };
    continue;
  }

  if (line !== current.title) {
    current.paragraphs.push(line);
  }
}

if (current.paragraphs.length > 0) sections.push(current);

const cleanedSections = sections
  .map((section, index) => ({
    id: `chapter-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
    title: section.title,
    summary: section.paragraphs.slice(0, 2).join(" ").slice(0, 140),
    minutes: Math.max(2, Math.ceil(section.paragraphs.join("").length / 850)),
    paragraphs: section.paragraphs,
  }))
  .filter(
    (section) =>
      section.paragraphs.join("").length > 8 &&
      section.title !== "書名頁" &&
      section.title !== "版權頁",
  )
  .map((section, index) => ({
    ...section,
    id: `chapter-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
  }));

const book = {
  id: args.id || args.slug,
  slug: args.slug,
  title,
  subtitle: args.subtitle || title,
  author,
  description: args.description || cleanedSections[0]?.summary,
  status: "published",
  genre: args.genre ? args.genre.split(",").map((item) => item.trim()).filter(Boolean) : ["未分類"],
  rating: "All",
  cover: `/books/${args.slug}/cover.png`,
  ogImage: `/books/${args.slug}/cover.png`,
  sourceUrl,
  chapters: cleanedSections,
};

const plan = saveImportedBook({ ...options, book });

console.log(
  JSON.stringify(
    {
      ...plan,
      title,
      author,
      chapters: cleanedSections.length,
      paragraphs: cleanedSections.reduce((total, section) => total + section.paragraphs.length, 0),
      characters: raw.length,
    },
    null,
    2,
  ),
);
