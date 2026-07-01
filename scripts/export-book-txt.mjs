import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "src", "content", "books.json");
const outputRoot = path.join(root, "book-txt");
const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run export:book-txt -- <book-slug>");
  process.exit(1);
}

function sanitizePathSegment(value) {
  const cleaned = String(value)
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "");

  return cleaned || "untitled";
}

function chapterFilename(chapter) {
  const number = String(chapter.number).padStart(2, "0");
  const title = sanitizePathSegment(chapter.title);
  return `${number}_${title}.txt`;
}

function chapterText(book, chapter) {
  const lines = [
    chapter.title,
    ...chapter.paragraphs.map((paragraph) => String(paragraph).trim()).filter(Boolean),
  ];

  return `${lines.join("\n\n")}\n`;
}

const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const book = data.books.find((item) => item.slug === slug || item.id === slug);

if (!book) {
  console.error(`Book not found: ${slug}`);
  process.exit(1);
}

const bookFolder = path.join(outputRoot, sanitizePathSegment(book.title));

if (fs.existsSync(bookFolder)) {
  fs.rmSync(bookFolder, { recursive: true, force: true });
}

fs.mkdirSync(bookFolder, { recursive: true });

for (const chapter of book.chapters) {
  const target = path.join(bookFolder, chapterFilename(chapter));
  fs.writeFileSync(target, chapterText(book, chapter), "utf8");
}

console.log(
  JSON.stringify(
    {
      title: book.title,
      slug: book.slug,
      output: path.relative(root, bookFolder),
      chapters: book.chapters.length,
    },
    null,
    2,
  ),
);
