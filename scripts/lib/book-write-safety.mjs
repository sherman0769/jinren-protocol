import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function parseOptions(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "--") continue;
    if (!value.startsWith("--")) { args._.push(value); continue; }
    const next = argv[i + 1];
    args[value.slice(2)] = next && !next.startsWith("--") ? argv[++i] : true;
  }
  return args;
}

export function writeOptions(args) {
  for (const flag of ["apply", "dry-run", "replace-existing"]) {
    if (args[flag] !== undefined && args[flag] !== true) {
      throw new Error(`${flag}：不接受值，請單獨使用 --${flag}`);
    }
  }
  if (args.apply && args["dry-run"]) throw new Error("apply：不可同時指定 --dry-run");
  if (args.root !== undefined && typeof args.root !== "string") throw new Error("root：缺少路徑");
  return { root: path.resolve(args.root || projectRoot), apply: args.apply === true,
    replaceExisting: args["replace-existing"] === true };
}

export function safePath(root, ...segments) {
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(resolvedRoot, ...segments);
  const relative = path.relative(resolvedRoot, target);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`path：目標必須位於專案內：${target}`);
  }
  let current = resolvedRoot;
  for (const segment of ["", ...relative.split(path.sep)]) {
    current = path.join(current, segment);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`path：不接受符號連結或 junction：${current}`);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return target;
}

export function readOptional(file) {
  try { return fs.readFileSync(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

function equalBytes(left, right) {
  return left === null || right === null ? left === right : left.equals(right);
}

// One lock covers every supported importer and TXT writer. Backups and a durable
// journal remain in tmp even when a synchronous failure has been rolled back.
export function applyFileChanges(root, changes, guards = []) {
  const tmp = safePath(root, "tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const lock = safePath(root, "tmp", "book-write.lock");
  let handle;
  try { handle = fs.openSync(lock, "wx"); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("transaction：已有寫入鎖；請先檢查既有交易，不可盲目重跑");
    throw error;
  }
  const applied = [];
  const createdDirs = [];
  let backupFolder;
  let journal;
  let keepLock = false;
  function ensureDir(directory) {
    if (fs.existsSync(directory)) return;
    ensureDir(path.dirname(directory));
    fs.mkdirSync(directory);
    createdDirs.push(directory);
  }
  try {
    const transactionId = randomUUID();
    fs.writeFileSync(handle, JSON.stringify({ transactionId, pid: process.pid }));
    for (const entry of [...changes, ...guards]) {
      safePath(root, entry.path);
      if (!equalBytes(readOptional(entry.path), entry.before)) throw new Error(`transaction：預覽後檔案已變動：${entry.path}`);
    }
    backupFolder = safePath(root, "tmp", "book-write-backups", transactionId);
    fs.mkdirSync(backupFolder, { recursive: true });
    journal = { transactionId, status: "prepared", changes: changes.map((entry, index) => ({
      path: path.relative(root, entry.path), backup: entry.before === null ? null : `${index}.before`,
      beforeSha256: entry.before === null ? null : sha256(entry.before),
      afterSha256: entry.after === null ? null : sha256(entry.after),
    })) };
    for (const [index, entry] of changes.entries()) {
      if (entry.before !== null) fs.writeFileSync(path.join(backupFolder, `${index}.before`), entry.before, { flag: "wx" });
      if (entry.after !== null) fs.writeFileSync(path.join(backupFolder, `${index}.after`), entry.after, { flag: "wx" });
    }
    fs.writeFileSync(path.join(backupFolder, "transaction.json"), JSON.stringify(journal, null, 2));
    for (const [index, entry] of changes.entries()) {
      // Recheck immediately before each individual mutation as well as at entry.
      safePath(root, entry.path);
      if (!equalBytes(readOptional(entry.path), entry.before)) throw new Error(`transaction：檔案已被其他作業修改：${entry.path}`);
      ensureDir(path.dirname(entry.path));
      if (entry.after === null) fs.unlinkSync(entry.path);
      else fs.renameSync(path.join(backupFolder, `${index}.after`), entry.path);
      applied.push(entry);
    }
    journal.status = "complete";
    fs.writeFileSync(path.join(backupFolder, "transaction.json"), JSON.stringify(journal, null, 2));
    return backupFolder;
  } catch (error) {
    try {
      for (const entry of applied.reverse()) {
        safePath(root, entry.path);
        if (!equalBytes(readOptional(entry.path), entry.after)) throw new Error(`rollback：檔案有後續變更：${entry.path}`);
        if (entry.before === null) fs.unlinkSync(entry.path);
        else fs.writeFileSync(entry.path, entry.before);
      }
      for (const directory of createdDirs.reverse()) fs.rmdirSync(directory);
      if (journal) {
        journal.status = "rolled-back";
        journal.error = error.message;
        fs.writeFileSync(path.join(backupFolder, "transaction.json"), JSON.stringify(journal, null, 2));
      }
    } catch (rollbackError) {
      keepLock = true;
      throw new Error(`transaction：回復未完成，保留鎖與備份 ${backupFolder}；${rollbackError.message}`, { cause: error });
    }
    throw error;
  } finally {
    fs.closeSync(handle);
    if (!keepLock) fs.unlinkSync(lock);
  }
}

function sameChapter(left, right) {
  return left.id === right.id && left.number === right.number && left.title === right.title &&
    JSON.stringify(left.paragraphs) === JSON.stringify(right.paragraphs);
}

export function saveImportedBook({ root, book, apply = false, replaceExisting = false }) {
  for (const field of ["id", "slug", "title", "subtitle", "author", "description", "status", "rating", "cover", "ogImage", "sourceUrl"]) {
    if (typeof book[field] !== "string" || !book[field].trim()) throw new Error(`${field}：必須是非空文字`);
  }
  if (!["draft", "creating", "published"].includes(book.status)) throw new Error("status：不支援的書籍狀態");
  if (!Array.isArray(book.genre) || !book.genre.length || book.genre.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error("genre：必須是非空文字陣列");
  }
  if (!Array.isArray(book.chapters) || !book.chapters.length) throw new Error("chapters：必須是非空陣列");
  const chapterIds = new Set();
  for (const [index, chapter] of book.chapters.entries()) {
    if (["id", "title", "summary"].some((field) => typeof chapter[field] !== "string" || !chapter[field].trim()) ||
      chapter.number !== index + 1 || !Number.isFinite(chapter.minutes) || chapter.minutes < 2 ||
      !Array.isArray(chapter.paragraphs) || !chapter.paragraphs.length ||
      chapter.paragraphs.some((text) => typeof text !== "string" || !text.trim()) || chapterIds.has(chapter.id)) {
      throw new Error(`chapters：第 ${index + 1} 章的身份、編號、時間或正文無效`);
    }
    chapterIds.add(chapter.id);
  }
  const catalog = safePath(root, "src", "content", "books.json");
  const before = fs.readFileSync(catalog);
  const data = JSON.parse(before);
  if (!Array.isArray(data.books)) throw new Error("books：必須是陣列");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.slug)) throw new Error("slug：必須為小寫 kebab-case");
  const matches = data.books.filter((existing) => existing.slug === book.slug || existing.id === book.id ||
    existing.title === book.title || existing.sourceUrl === book.sourceUrl);
  if (matches.length > 1) throw new Error("book：身份欄位匹配到多本書，拒絕寫入");
  const existing = matches[0];
  if (existing && !replaceExisting) throw new Error(`book：已存在 ${existing.slug}；新增不可覆蓋既有書籍`);
  if (!existing && replaceExisting) throw new Error("replace-existing：找不到目標書籍");
  let candidate = structuredClone(book);
  if (existing) {
    if (existing.slug !== book.slug || existing.id !== book.id || existing.title !== book.title) {
      throw new Error("book：替換必須保留原 id、slug 與書名；改名需另行核對來源資料夾");
    }
    const unchanged = existing.chapters.length === book.chapters.length &&
      existing.chapters.every((chapter, index) => sameChapter(chapter, book.chapters[index]));
    if (!unchanged && existing.chapters.some((chapter) => chapter.audio?.src)) {
      throw new Error("audio：新版章節會使現有音訊失效，請先走章節差異與音訊重驗流程");
    }
    // Keep ancillary metadata, and retain exact audio identities only for
    // unchanged reader-facing chapters. Never infer identity from a number alone.
    candidate = { ...existing, ...candidate, chapters: candidate.chapters.map((chapter, index) => {
      const previous = existing.chapters[index];
      return previous && sameChapter(previous, chapter)
        ? { ...previous, ...chapter, ...(previous.audio ? { audio: previous.audio } : {}) } : chapter;
    }) };
    data.books[data.books.indexOf(existing)] = candidate;
  } else data.books.push(candidate);
  const changed = !existing || JSON.stringify(existing) !== JSON.stringify(candidate);
  const plan = { dryRun: !apply, mode: existing ? "replace" : "append", title: book.title, slug: book.slug,
    booksBefore: existing ? data.books.length : data.books.length - 1, booksAfter: data.books.length,
    chapters: book.chapters.length, changed, preservedAudioCount: candidate.chapters.filter((chapter) => chapter.audio?.src).length };
  if (apply && changed) {
    plan.backupFolder = applyFileChanges(root, [{ path: catalog, before,
      after: Buffer.from(`${JSON.stringify(data, null, 2)}\n`) }]);
  }
  return plan;
}
