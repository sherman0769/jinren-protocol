import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { test, mock } from "node:test";
import { exportBookTxt } from "./export-book-txt.mjs";
import { applyFileChanges, projectRoot, saveImportedBook, sha256 } from "./lib/book-write-safety.mjs";

// Mammoth already uses JSZip for DOCX parsing; generate a real minimal DOCX
// fixture with the same installed dependency, without downloading test assets.
const require = createRequire(import.meta.url);
const JSZip = createRequire(require.resolve("mammoth"))("jszip");
const tmp = path.join(projectRoot, "tmp");
fs.mkdirSync(tmp, { recursive: true });
const suiteRoot = fs.mkdtempSync(path.join(tmp, "book-write-safety-test-"));
const paragraph = "這是一段完整而可供讀者閱讀的章節內容，用來驗證匯入與匯出不會破壞其他書籍和音訊證據。";
function book(slug = "first-book") {
  return { id: slug, slug, title: `測試書 ${slug}`, subtitle: "副標題", author: "李詩民",
    description: paragraph, status: "published", genre: ["測試"], rating: "All",
    sourceUrl: `published-books/${slug}.md`, cover: `/books/${slug}/cover.png`, ogImage: `/books/${slug}/cover.png`,
    chapters: [1, 2].map((number) => ({ id: `chapter-${String(number).padStart(2, "0")}`, number,
      title: `第 ${number} 章`, summary: paragraph, minutes: 2, paragraphs: [paragraph] })) };
}
function fixture(books = [book(), book("second-book")]) {
  const root = fs.mkdtempSync(path.join(suiteRoot, "case-"));
  const catalog = path.join(root, "src", "content", "books.json");
  fs.mkdirSync(path.dirname(catalog), { recursive: true });
  fs.writeFileSync(catalog, JSON.stringify({ customMetadata: { retained: true }, books }, null, 2));
  return { root, catalog, books };
}
function readCatalog(f) { return JSON.parse(fs.readFileSync(f.catalog)); }
function updateCatalog(f, mutate) {
  const data = readCatalog(f); mutate(data); fs.writeFileSync(f.catalog, JSON.stringify(data, null, 2));
}
function snapshot(root) {
  const result = {};
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else result[path.relative(root, file)] = sha256(fs.readFileSync(file));
    }
  }
  walk(root); return result;
}
function cli(script, args, cwd) {
  return spawnSync(process.execPath, [path.join(projectRoot, "scripts", script), ...args], { cwd, encoding: "utf8" });
}
function success(result) { assert.equal(result.status, 0, result.stderr || result.stdout); return JSON.parse(result.stdout); }
function folder(f) { return path.join(f.root, "book-txt", f.books[0].title); }
function exportFixture(f, apply = true) { return exportBookTxt({ root: f.root, slug: f.books[0].slug, apply }); }

test("append preserves both existing books, audio and top-level metadata; preview is zero-write", () => {
  const original = book(); original.chapters[0].audio = { src: "https://example.invalid/chapter.m4a", durationSeconds: 180 };
  const f = fixture([original, book("second-book")]);
  const baseline = snapshot(f.root);
  const preview = saveImportedBook({ root: f.root, book: book("third-book") });
  assert.equal(preview.booksAfter, 3); assert.deepEqual(snapshot(f.root), baseline);
  const applied = saveImportedBook({ root: f.root, book: book("third-book"), apply: true });
  const data = readCatalog(f);
  assert.deepEqual(data.books.slice(0, 2), f.books); assert.deepEqual(data.customMetadata, { retained: true });
  assert.equal(data.books.length, 3);
  assert.equal(fs.readFileSync(path.join(applied.backupFolder, "0.before"), "utf8"), JSON.stringify({ customMetadata: { retained: true }, books: f.books }, null, 2));
  const after = snapshot(f.root);
  assert.throws(() => saveImportedBook({ root: f.root, book: book("third-book"), apply: true }), /已存在/);
  assert.deepEqual(snapshot(f.root), after);
});

test("replacement preserves unchanged audio and refuses changed content or ambiguous identity", () => {
  const original = book(); original.chapters[0].audio = { src: "https://example.invalid/01.m4a" };
  const f = fixture([original, book("second-book")]);
  const candidate = book(); candidate.description = "已修正文案";
  saveImportedBook({ root: f.root, book: candidate, apply: true, replaceExisting: true });
  assert.deepEqual(readCatalog(f).books[0].chapters[0].audio, original.chapters[0].audio);
  const baseline = snapshot(f.root);
  candidate.chapters[0].paragraphs = ["已變更正文"];
  assert.throws(() => saveImportedBook({ root: f.root, book: candidate, apply: true, replaceExisting: true }), /audio：/);
  const collision = book(); collision.id = "second-book";
  assert.throws(() => saveImportedBook({ root: f.root, book: collision, apply: true, replaceExisting: true }), /匹配到多本書/);
  assert.deepEqual(snapshot(f.root), baseline);
});

test("Markdown CLI routes safely from project root and external cwd", () => {
  const f = fixture();
  const manuscript = path.join(f.root, "third.md");
  fs.writeFileSync(manuscript, `# 第三本書\n## 副標題\n作者：李詩民\n\n# 第 1 章\n\n${paragraph}\n`);
  const args = ["--root", f.root, "--manuscript", "third.md", "--source", "books/third.md", "--slug", "third-book"];
  const before = snapshot(f.root);
  const fromRoot = success(cli("import-book.mjs", args, projectRoot));
  const external = success(cli("import-book.mjs", args, suiteRoot));
  assert.deepEqual(fromRoot, external); assert.equal(external.dryRun, true);
  assert.deepEqual(snapshot(f.root), before);
  success(cli("import-book.mjs", [...args, "--apply"], suiteRoot));
  assert.deepEqual(readCatalog(f).books.slice(0, 2), f.books);
  assert.equal(readCatalog(f).books.length, 3);
  const after = snapshot(f.root);
  assert.notEqual(cli("import-markdown-book.mjs", [...args, "--apply"], suiteRoot).status, 0);
  assert.deepEqual(snapshot(f.root), after);
});

test("DOCX legacy invocation fails closed; real DOCX import appends and rejects duplicates", async () => {
  const f = fixture();
  assert.notEqual(cli("import-docx-book.mjs", ["--root", f.root], suiteRoot).status, 0);
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("word/document.xml", `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>第1章</w:t></w:r></w:p><w:p><w:r><w:t>${paragraph}</w:t></w:r></w:p></w:body></w:document>`);
  fs.writeFileSync(path.join(f.root, "third.docx"), await zip.generateAsync({ type: "nodebuffer" }));
  const args = ["--root", f.root, "--manuscript", "third.docx", "--source", "books/third.docx", "--slug", "third-book"];
  const before = snapshot(f.root);
  success(cli("import-book.mjs", args, suiteRoot)); assert.deepEqual(snapshot(f.root), before);
  success(cli("import-book.mjs", [...args, "--apply"], suiteRoot));
  assert.equal(readCatalog(f).books.length, 3); assert.deepEqual(readCatalog(f).books.slice(0, 2), f.books);
  assert.notEqual(cli("import-docx-book.mjs", [...args, "--apply"], suiteRoot).status, 0);
});

test("package CLI previews and appends through the same guarded writer", () => {
  const f = fixture();
  const pkg = path.join(f.root, "package"); fs.mkdirSync(path.join(pkg, "01"), { recursive: true });
  fs.writeFileSync(path.join(pkg, "00_full_manuscript.md"), `# 套件測試\n## 副標題\n作者：李詩民\n\n${paragraph}`);
  fs.writeFileSync(path.join(pkg, "01", "chapter_01_main.md"), `# 第1章\n\n${paragraph}`);
  const args = ["--root", f.root, "--package", "package", "--source", "books/third.zip", "--slug", "third-book", "--title", "套件測試", "--subtitle", "副標題", "--description", paragraph];
  const before = snapshot(f.root);
  success(cli("import-book.mjs", args, suiteRoot)); assert.deepEqual(snapshot(f.root), before);
  success(cli("import-book.mjs", [...args, "--apply"], suiteRoot));
  assert.deepEqual(readCatalog(f).books.slice(0, 2), f.books); assert.equal(readCatalog(f).books.length, 3);
  assert.notEqual(cli("import-book-package.mjs", [...args, "--apply"], suiteRoot).status, 0);
});

test("TXT repeat export preserves ledger and user files byte-for-byte; second apply is a no-op", () => {
  const f = fixture();
  const before = snapshot(f.root); assert.equal(exportFixture(f, false).dryRun, true);
  assert.deepEqual(snapshot(f.root), before);
  exportFixture(f);
  fs.writeFileSync(path.join(folder(f), "notebooklm-audio-ledger.json"), '{"proof":"preserve exactly"}\r\n');
  fs.writeFileSync(path.join(folder(f), "personal-notes.txt"), "使用者備註");
  const after = snapshot(f.root);
  assert.equal(exportFixture(f).changedFiles, 0); assert.deepEqual(snapshot(f.root), after);
});

test("legacy identical TXT can be adopted without touching ledger", () => {
  const f = fixture(); exportFixture(f);
  fs.unlinkSync(path.join(folder(f), ".book-txt-manifest.json"));
  const ledger = path.join(folder(f), "notebooklm-audio-ledger.json");
  fs.writeFileSync(ledger, '{"sourceVerified":true}'); const before = fs.readFileSync(ledger);
  assert.equal(exportFixture(f).changedFiles, 1); assert.deepEqual(fs.readFileSync(ledger), before);
});

test("TXT rename removes only an unchanged owned file and backs it up", () => {
  const f = fixture(); exportFixture(f);
  fs.writeFileSync(path.join(folder(f), "personal-notes.txt"), "keep");
  updateCatalog(f, (data) => { data.books[0].chapters[0].title = "重新命名"; });
  const plan = exportFixture(f);
  assert.deepEqual(plan.removed, ["01_第 1 章.txt"]);
  assert.equal(fs.existsSync(path.join(folder(f), "01_第 1 章.txt")), false);
  assert.ok(fs.existsSync(path.join(folder(f), "01_重新命名.txt")));
  assert.equal(fs.readFileSync(path.join(folder(f), "personal-notes.txt"), "utf8"), "keep");
  assert.ok(fs.existsSync(path.join(plan.backupFolder, "transaction.json")));
});

test("TXT refuses unmanaged overwrite, manual changes and source changes with audio evidence", () => {
  const f = fixture(); exportFixture(f);
  fs.writeFileSync(path.join(folder(f), "01_第 1 章.txt"), "手動修改");
  let baseline = snapshot(f.root);
  assert.throws(() => exportFixture(f), /手動修改/); assert.deepEqual(snapshot(f.root), baseline);
  const other = fixture(); exportFixture(other);
  fs.writeFileSync(path.join(folder(other), "notebooklm-audio-ledger.json"), "{}");
  updateCatalog(other, (data) => { data.books[0].chapters[0].paragraphs = ["變更來源"]; });
  baseline = snapshot(other.root);
  assert.throws(() => exportFixture(other), /audio：/); assert.deepEqual(snapshot(other.root), baseline);
  fs.unlinkSync(path.join(folder(f), ".book-txt-manifest.json"));
  assert.throws(() => exportFixture(f), /未受管理/);
});

test("TXT failure after first mutation restores all chapter files and manifest", () => {
  const f = fixture(); exportFixture(f);
  updateCatalog(f, (data) => { for (const chapter of data.books[0].chapters) chapter.paragraphs = ["更新的正文"]; });
  const baseline = snapshot(folder(f)); const rename = fs.renameSync; let calls = 0;
  mock.method(fs, "renameSync", (...args) => { if (++calls === 2) throw new Error("injected disk failure"); return rename(...args); });
  try { assert.throws(() => exportFixture(f), /injected disk failure/); } finally { mock.restoreAll(); }
  assert.deepEqual(snapshot(folder(f)), baseline);
  assert.equal(fs.existsSync(path.join(f.root, "tmp", "book-write.lock")), false);
});

test("stale snapshots and existing locks refuse mutation", () => {
  const f = fixture(); const before = fs.readFileSync(f.catalog);
  updateCatalog(f, (data) => { data.customMetadata.externalEdit = true; });
  const current = fs.readFileSync(f.catalog);
  assert.throws(() => applyFileChanges(f.root, [{ path: f.catalog, before, after: Buffer.from("{}") }]), /檔案已變動/);
  assert.deepEqual(fs.readFileSync(f.catalog), current);
  const lock = path.join(f.root, "tmp", "book-write.lock"); fs.writeFileSync(lock, "existing transaction");
  assert.throws(() => saveImportedBook({ root: f.root, book: book("third-book"), apply: true }), /已有寫入鎖/);
  assert.equal(fs.readFileSync(lock, "utf8"), "existing transaction");
});

test("malformed manifest paths, folder collisions and numbering fail before writing", () => {
  const f = fixture(); exportFixture(f);
  const manifest = path.join(folder(f), ".book-txt-manifest.json");
  fs.writeFileSync(manifest, JSON.stringify({ schemaVersion: 1, bookSlug: f.books[0].slug,
    files: [{ filename: "../outside.txt", sha256: "0".repeat(64) }] }));
  const baseline = snapshot(f.root);
  assert.throws(() => exportFixture(f), /manifest：/); assert.deepEqual(snapshot(f.root), baseline);
  const a = book(), b = book("second-book"); a.title = "測試:書"; b.title = "測試/書";
  assert.throws(() => exportFixture(fixture([a, b])), /資料夾與其他書籍衝突/);
  const invalid = book(); invalid.chapters[1].number = 1;
  assert.throws(() => exportFixture(fixture([invalid])), /編號/);
});

test("TXT CLI is cwd-independent and explicit apply is required", () => {
  const f = fixture(); const args = [f.books[0].slug, "--root", f.root];
  const baseline = snapshot(f.root);
  assert.deepEqual(success(cli("export-book-txt.mjs", args, projectRoot)), success(cli("export-book-txt.mjs", args, suiteRoot)));
  assert.deepEqual(snapshot(f.root), baseline);
  success(cli("export-book-txt.mjs", [...args, "--apply"], suiteRoot));
  assert.ok(fs.existsSync(path.join(folder(f), "01_第 1 章.txt")));
  const after = snapshot(f.root);
  assert.notEqual(cli("export-book-txt.mjs", [...args, "--apply", "--dry-run"], suiteRoot).status, 0);
  assert.deepEqual(snapshot(f.root), after);
});

test("default project root is script-relative with no files created in an external cwd", () => {
  const external = fs.mkdtempSync(path.join(suiteRoot, "external-"));
  const catalog = path.join(projectRoot, "src", "content", "books.json");
  const before = fs.readFileSync(catalog);
  const slug = JSON.parse(before).books[0].slug;
  const local = success(cli("export-book-txt.mjs", [slug], projectRoot));
  const elsewhere = success(cli("export-book-txt.mjs", [slug], external));
  assert.deepEqual(elsewhere, local);
  assert.equal(elsewhere.dryRun, true);
  assert.deepEqual(fs.readdirSync(external), []);
  assert.deepEqual(fs.readFileSync(catalog), before);
});

test("invalid metadata and duplicate chapter identities cannot enter the catalog", () => {
  const f = fixture(); const baseline = snapshot(f.root);
  const invalid = book("third-book"); invalid.title = true;
  assert.throws(() => saveImportedBook({ root: f.root, book: invalid, apply: true }), /title：/);
  const duplicate = book("third-book"); duplicate.chapters[1].id = duplicate.chapters[0].id;
  assert.throws(() => saveImportedBook({ root: f.root, book: duplicate, apply: true }), /chapters：/);
  assert.deepEqual(snapshot(f.root), baseline);
});
