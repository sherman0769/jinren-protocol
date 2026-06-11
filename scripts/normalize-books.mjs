import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "src", "content", "books.json");
const targetParagraphLength = 150;

const sectionHeadingPattern =
  /^(開場|前言|序言|導讀|結語|結論|總結|小結|後記|終章|附錄|延伸補充|核心命題|核心概念|案例|練習|實作|問答|重點整理)$|^第\s*[一二三四五六七八九十百千\d]+\s*[講章节章課部]\b|^[一二三四五六七八九十]+、.+|^\d+(\.\d+)+\s+.+|^\d+[、.]\s*.+/;

const productionArtifactPatterns = [
  /^以下這版.*(可講授|可錄音|形式|版本)/,
  /^以下版本.*(可講授|可錄音|形式|版本)/,
  /^我直接.*(可授課|可講授|可錄音|版本|來寫)/,
  /^這一講的核心命題是[:：]?$/,
  /^這一章的核心命題是[:：]?$/,
  /^本章撰寫提示[:：]?$/,
  /^寫作提示[:：]?$/,
  /^生成提示[:：]?$/,
  /^Prompt[:：]?$/i,
  /^Book:\s*/i,
  /^Current Chapter:\s*/i,
  /^Completed Chapters:\s*/i,
  /^Next Chapter/i,
  /^Style:\s*/i,
  /^book_title\s*=/i,
  /^completed_chapters\s*=/i,
  /^current_chapter\s*=/i,
  /^current_topic\s*=/i,
  /^next_topic\s*=/i,
  /^style\s*=/i,
];

const aiInstructionPattern =
  /^(請|請你|幫我|你是|請用|請從|請把|請維持|請掃描|請讀取|請檢查|請整理|請改寫|請產生|請生成|請寫|請輸出).*(書稿|章節|講義|課程|草稿|版本|風格|語氣|字數|輸出|生成|撰寫|掃描|檢查|整理|改寫|維持)/;

function normalizeWhitespace(text) {
  return String(text)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([，。！？；：、])/g, "$1")
    .trim();
}

function isLikelyHeading(text) {
  const line = normalizeWhitespace(text);
  if (!line || line.length > 80) return false;
  return sectionHeadingPattern.test(line);
}

function isProductionArtifact(text) {
  const line = normalizeWhitespace(text);
  if (!line) return true;
  if (productionArtifactPatterns.some((pattern) => pattern.test(line))) return true;

  if (aiInstructionPattern.test(line)) {
    const looksLikeReaderExample =
      /例如|範例|可以這樣問|你可以這樣|提示詞範本|prompt 範例|Prompt 範例/i.test(line);
    return !looksLikeReaderExample;
  }

  return false;
}

function hasTerminalPunctuation(text) {
  return /[。！？；：，、.!?;:,"」』）】》]$/.test(text);
}

function sentenceize(text) {
  const line = normalizeWhitespace(text);
  if (!line) return "";
  if (hasTerminalPunctuation(line)) return line;
  return `${line}。`;
}

function isVeryShortFragment(text) {
  const line = normalizeWhitespace(text);
  if (!line || isLikelyHeading(line)) return false;
  if (line.length > 24) return false;
  if (/[，。！？；：、,.!?;:「」]/.test(line)) return false;
  return true;
}

function joinFragments(lines) {
  const fragments = lines.map(normalizeWhitespace).filter(Boolean);
  if (fragments.length === 0) return "";
  if (fragments.length === 1) return sentenceize(fragments[0]);

  const first = fragments[0];
  const rest = fragments.slice(1);
  if (first.endsWith("：") || first.endsWith(":")) {
    return `${first}${rest.join("、")}。`;
  }

  return `${fragments.join("、")}。`;
}

function pushParagraph(paragraphs, text) {
  const line = cleanupJoinedText(normalizeWhitespace(text));
  if (!line) return;
  for (const chunk of splitLongParagraph(line)) {
    if (paragraphs[paragraphs.length - 1] === chunk) continue;
    paragraphs.push(chunk);
  }
}

function cleanupJoinedText(text) {
  return text
    .replace(/，。/g, "，")
    .replace(/、。/g, "。")
    .replace(/：。/g, "：")
    .replace(/：、/g, "：")
    .replace(/，、/g, "，")
    .replace(/、，/g, "，")
    .replace(/。+/g, "。")
    .replace(/([，。！？；：])、/g, "$1")
    .replace(/、(但|而|也|所以|因為|如果)/g, "$1")
    .replace(/([。！？；：])([，、])/g, "$1")
    .trim();
}

function splitLongParagraph(text) {
  if (text.length <= 260) return [text];

  const sentences = text.match(/[^。！？；]+[。！？；]?/g) ?? [text];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if (current && current.length + sentence.length > 220) {
      chunks.push(cleanupJoinedText(current));
      current = "";
    }
    current += sentence;
  }

  if (current) chunks.push(cleanupJoinedText(current));
  return chunks.filter(Boolean);
}

function flushProse(paragraphs, lines) {
  if (lines.length === 0) return;

  let current = "";
  let shortRun = [];

  const flushShortRun = () => {
    if (shortRun.length === 0) return;
    const joined = joinFragments(shortRun);
    current += joined;
    shortRun = [];
  };

  const flushCurrent = () => {
    flushShortRun();
    if (!current) return;
    pushParagraph(paragraphs, current);
    current = "";
  };

  for (const rawLine of lines) {
    const line = normalizeWhitespace(rawLine);
    if (!line) continue;

    if (isVeryShortFragment(line)) {
      shortRun.push(line);
      if (shortRun.length >= 6) flushShortRun();
      continue;
    }

    flushShortRun();
    current += sentenceize(line);

    if (current.length >= targetParagraphLength && !/[，：、]$/.test(current)) {
      flushCurrent();
    }
  }

  flushCurrent();
}

function normalizeChapter(chapter) {
  const paragraphs = [];
  let proseBuffer = [];
  let removed = 0;

  const flush = () => {
    flushProse(paragraphs, proseBuffer);
    proseBuffer = [];
  };

  for (const paragraph of chapter.paragraphs) {
    const line = normalizeWhitespace(paragraph);
    if (isProductionArtifact(line)) {
      removed += 1;
      continue;
    }

    if (isLikelyHeading(line)) {
      flush();
      pushParagraph(paragraphs, line);
      continue;
    }

    proseBuffer.push(line);
  }

  flush();

  const characters = paragraphs.join("").length;
  const summarySource = paragraphs.find((line) => !isLikelyHeading(line)) ?? paragraphs[0] ?? chapter.summary;

  return {
    chapter: {
      ...chapter,
      summary: normalizeWhitespace(summarySource).slice(0, 140),
      minutes: Math.max(2, Math.ceil(characters / 850)),
      paragraphs,
    },
    removed,
    before: chapter.paragraphs.length,
    after: paragraphs.length,
  };
}

function normalizeBook(book) {
  let removed = 0;
  let before = 0;
  let after = 0;

  const chapters = book.chapters.map((chapter) => {
    const result = normalizeChapter(chapter);
    removed += result.removed;
    before += result.before;
    after += result.after;
    return result.chapter;
  });

  return {
    book: { ...book, chapters },
    stats: {
      slug: book.slug,
      before,
      after,
      removed,
      reduction: before === 0 ? 0 : Math.round(((before - after) / before) * 100),
    },
  };
}

const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const results = data.books.map(normalizeBook);
data.books = results.map((result) => result.book);

fs.writeFileSync(contentPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.table(results.map((result) => result.stats));
