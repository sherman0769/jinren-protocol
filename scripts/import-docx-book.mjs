import fs from "node:fs";
import path from "node:path";
import mammoth from "mammoth";

const root = process.cwd();
const inputPath = path.join(root, "tmp", "book.docx");
const outputPath = path.join(root, "src", "content", "books.json");

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

const title = "數量級躍升：AI 時代的多面人生與自由之路";
const author = "李詩民";
const sourceUrl =
  "https://docs.google.com/document/d/1VsvZi2e6tKtULgfhOpTTG7nzyH5xshn_/edit?usp=drivesdk&ouid=117146208230528101111&rtpof=true&sd=true";

const headingPatterns = [
  /^書名頁$/,
  /^推薦序$/,
  /^謹識$/,
  /^版權頁$/,
  /^第[一二三四五六七八九十百0-9]+[章部篇]/,
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
  if (isHeading(line) && current.paragraphs.length > 0) {
    sections.push(current);
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
  id: "exponential-ai-life",
  slug: "exponential-ai-life",
  title,
  subtitle: "AI 時代的多面人生與自由之路",
  author,
  description:
    "一本面向 AI 時代個人成長、斜槓能力、時間自由與多面人生實踐的教練式書籍。",
  status: "published",
  genre: ["AI 應用", "個人成長", "多面人生", "自由工作"],
  rating: "All",
  cover: "/books/exponential-ai-life/cover.png",
  ogImage: "/books/exponential-ai-life/cover.png",
  sourceUrl,
  chapters: cleanedSections,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ books: [book] }, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      title,
      author,
      chapters: cleanedSections.length,
      paragraphs: cleanedSections.reduce((total, section) => total + section.paragraphs.length, 0),
      characters: raw.length,
      outputPath,
    },
    null,
    2,
  ),
);
