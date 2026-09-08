import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { applyFileChanges, parseOptions, readOptional, safePath, sha256, writeOptions } from "./lib/book-write-safety.mjs";

export function sanitizePathSegment(value) {
  const cleaned = String(value).replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim().replace(/[. ]+$/g, "");
  if (!cleaned || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(cleaned)) {
    throw new Error(`filename：無法安全使用名稱 ${value}`);
  }
  return cleaned;
}

export function exportBookTxt({ root, slug, apply = false }) {
  const catalogPath = safePath(root, "src", "content", "books.json");
  const catalogBytes = fs.readFileSync(catalogPath);
  const { books } = JSON.parse(catalogBytes);
  const book = books.find((entry) => entry.slug === slug || entry.id === slug);
  if (!book) throw new Error(`slug：找不到書籍 ${slug}`);
  const folderName = sanitizePathSegment(book.title);
  if (books.some((other) => other !== book && sanitizePathSegment(other.title).toLowerCase() === folderName.toLowerCase())) {
    throw new Error("title：清理後的書名資料夾與其他書籍衝突");
  }
  const folder = safePath(root, "book-txt", folderName);
  const manifestPath = safePath(root, folder, ".book-txt-manifest.json");
  const manifestBytes = readOptional(manifestPath);
  const previous = manifestBytes ? JSON.parse(manifestBytes) : null;
  if (previous && (previous.schemaVersion !== 1 || previous.bookSlug !== book.slug || !Array.isArray(previous.files))) {
    throw new Error("manifest：版本、書籍身份或檔案清單不符");
  }
  const owned = new Map();
  for (const file of previous?.files || []) {
    if (typeof file.filename !== "string" || path.basename(file.filename) !== file.filename ||
      !/^\d{2,}_.+\.txt$/u.test(file.filename) || /[\\/:*?"<>|]/.test(file.filename) ||
      !/^[a-f0-9]{64}$/.test(file.sha256) || owned.has(file.filename.toLowerCase())) {
      throw new Error("manifest：受管理的檔名、雜湊或唯一性不正確");
    }
    owned.set(file.filename.toLowerCase(), file);
  }
  if (!book.chapters?.length) throw new Error("chapters：不可為空");
  const desired = new Map();
  for (const [index, chapter] of book.chapters.entries()) {
    if (chapter.number !== index + 1 || !chapter.title || !Array.isArray(chapter.paragraphs) ||
      !chapter.paragraphs.length || chapter.paragraphs.some((text) => typeof text !== "string" || !text.trim())) {
      throw new Error(`chapters：第 ${index + 1} 章的編號、標題或段落不完整`);
    }
    const filename = `${String(chapter.number).padStart(2, "0")}_${sanitizePathSegment(chapter.title)}.txt`;
    const bytes = Buffer.from(`${[chapter.title, ...chapter.paragraphs.map((text) => text.trim())].join("\n\n")}\n`);
    const key = filename.toLowerCase();
    if (desired.has(key)) throw new Error(`filename：重複章節檔名 ${filename}`);
    desired.set(key, { filename, bytes, sha256: sha256(bytes) });
  }
  const changes = [];
  const guards = [{ path: catalogPath, before: catalogBytes }];
  const ledgerPath = safePath(root, folder, "notebooklm-audio-ledger.json");
  const ledgerBytes = readOptional(ledgerPath);
  guards.push({ path: ledgerPath, before: ledgerBytes });
  const hasAudioEvidence = ledgerBytes !== null || book.chapters.some((chapter) => chapter.audio?.src);
  const difference = { created: [], updated: [], removed: [], unchanged: [] };
  for (const [key, file] of desired) {
    const target = safePath(root, folder, file.filename);
    const before = readOptional(target);
    const old = owned.get(key);
    if (old && old.filename !== file.filename) throw new Error(`filename：大小寫改名請先人工核對 ${old.filename}`);
    if (old && before && sha256(before) !== old.sha256) throw new Error(`filename：拒絕覆蓋已手動修改的檔案 ${file.filename}`);
    if (hasAudioEvidence && old && old.sha256 !== file.sha256) throw new Error(`audio：${file.filename} 的來源內容會改變；請先重驗`);
    if (before && before.equals(file.bytes)) {
      difference.unchanged.push(file.filename);
      guards.push({ path: target, before });
      continue;
    }
    if (before && (!old || sha256(before) !== old.sha256)) {
      throw new Error(`filename：拒絕覆蓋未受管理或已手動修改的檔案 ${file.filename}`);
    }
    if (hasAudioEvidence && (!old || old.sha256 !== file.sha256)) {
      throw new Error(`audio：${file.filename} 的來源內容會改變；請先完成音訊來源差異與重驗流程`);
    }
    difference[before ? "updated" : "created"].push(file.filename);
    changes.push({ path: target, before, after: file.bytes });
  }
  for (const [key, file] of owned) {
    if (desired.has(key)) continue;
    const target = safePath(root, folder, file.filename);
    const before = readOptional(target);
    if (hasAudioEvidence) throw new Error(`audio：移除 ${file.filename} 會改變音訊來源，請先核對`);
    if (before && sha256(before) !== file.sha256) throw new Error(`filename：拒絕刪除已手動修改的檔案 ${file.filename}`);
    if (before) {
      difference.removed.push(file.filename);
      changes.push({ path: target, before, after: null });
    }
  }
  const manifest = { schemaVersion: 1, bookSlug: book.slug,
    files: [...desired.values()].map(({ filename, sha256: fingerprint }) => ({ filename, sha256: fingerprint })) };
  const manifestAfter = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  if (!manifestBytes?.equals(manifestAfter)) changes.push({ path: manifestPath, before: manifestBytes, after: manifestAfter });
  else guards.push({ path: manifestPath, before: manifestBytes });
  const preservedFiles = fs.existsSync(folder) ? fs.readdirSync(folder).filter((name) =>
    name !== ".book-txt-manifest.json" && !desired.has(name.toLowerCase()) && !owned.has(name.toLowerCase())) : [];
  const result = { dryRun: !apply, title: book.title, slug: book.slug, output: path.relative(root, folder),
    chapters: book.chapters.length, ...difference, preservedFiles, changedFiles: changes.length };
  if (apply && changes.length) result.backupFolder = applyFileChanges(root, changes, guards);
  return result;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = parseOptions();
    if (!args._[0] || args._.length !== 1) throw new Error("Usage: npm run export:book-txt -- <slug> [--apply] [--root <project-dir>] (default: read-only preview)");
    console.log(JSON.stringify(exportBookTxt({ ...writeOptions(args), slug: args._[0] }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
