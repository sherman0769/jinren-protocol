import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { head, list, put } from "@vercel/blob";

const root = process.cwd();
const booksPath = path.join(root, "src", "content", "books.json");
const manifestPath = path.join(root, "tmp", "audio-blob-migration.json");
const smokePath = path.join(root, "tmp", "audio-blob-smoke.json");
const productionBaseUrl = "https://jinren-protocol.vercel.app";
const concurrency = 3;
const args = new Set(process.argv.slice(2));

function booksFromDocument(document) {
  const books = Array.isArray(document) ? document : document?.books;
  if (!Array.isArray(books)) throw new Error("books.json must contain an array or { books: [] }");
  return books;
}

function toPosix(value) {
  return value.replace(/\\/gu, "/");
}

function isAbsoluteUrl(value) {
  return /^https:\/\//iu.test(value ?? "");
}

function resolveLocalSource(source, slug) {
  if (typeof source !== "string" || !source.startsWith(`/books/${slug}/audio/`)) {
    throw new Error(`Expected a local audio.src for ${slug}: ${String(source)}`);
  }
  const decoded = decodeURIComponent(source);
  const resolved = path.resolve(root, "public", `.${decoded}`);
  const publicRoot = path.join(root, "public");
  const relative = path.relative(publicRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Audio path escapes public/: ${source}`);
  }
  return resolved;
}

function localInventory(document) {
  const entries = [];
  for (const book of booksFromDocument(document)) {
    for (const chapter of book.chapters ?? []) {
      if (!chapter.audio?.src) continue;
      if (isAbsoluteUrl(chapter.audio.src)) continue;
      const sourcePath = resolveLocalSource(chapter.audio.src, book.slug);
      if (!existsSync(sourcePath) || !statSync(sourcePath).isFile() || statSync(sourcePath).size === 0) {
        throw new Error(`Missing or empty local audio: ${sourcePath}`);
      }
      const filename = path.basename(sourcePath);
      entries.push({
        slug: book.slug,
        bookTitle: book.title,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        currentSrc: chapter.audio.src,
        relativePath: toPosix(path.relative(root, sourcePath)),
        sourcePath,
        blobPathname: `books/${book.slug}/audio/${filename}`,
        bytes: statSync(sourcePath).size,
      });
    }
  }
  entries.sort((left, right) =>
    left.slug.localeCompare(right.slug) || left.chapterNumber - right.chapterNumber,
  );
  if (new Set(entries.map((entry) => entry.relativePath)).size !== entries.length) {
    throw new Error("A local audio file is referenced more than once");
  }
  if (new Set(entries.map((entry) => entry.blobPathname)).size !== entries.length) {
    throw new Error("A Blob pathname is assigned more than once");
  }
  return entries;
}

function canonicalInventory(document, manifest) {
  const expectedByIdentity = new Map(
    manifest.entries.map((entry) => [`${entry.slug}:${entry.chapterNumber}`, entry]),
  );
  const results = [];
  for (const book of booksFromDocument(document)) {
    for (const chapter of book.chapters ?? []) {
      const expected = expectedByIdentity.get(`${book.slug}:${chapter.number}`);
      if (!expected) continue;
      if (chapter.audio?.src !== expected.blob.url) {
        throw new Error(`books.json Blob URL mismatch: ${book.slug}#${chapter.number}`);
      }
      results.push({ ...expected, currentSrc: chapter.audio.src });
    }
  }
  if (results.length !== manifest.entries.length) {
    throw new Error("Canonical Blob reference count does not match the manifest");
  }
  return results;
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function mapConcurrent(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function consume() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
  return results;
}

function expectedUrlPathname(blobPathname) {
  return `/${blobPathname.split("/").map(encodeURIComponent).join("/")}`;
}

async function verifyBlob(entry, blob, localSha256) {
  const sdkMetadata = await head(blob.url);
  const response = await fetch(blob.url, { method: "HEAD", cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "";
  const contentLength = Number(response.headers.get("content-length"));
  const url = new URL(blob.url);
  const errors = [];
  if (url.pathname !== expectedUrlPathname(entry.blobPathname)) {
    errors.push(`pathname=${url.pathname}`);
  }
  if (sdkMetadata.pathname !== entry.blobPathname) errors.push(`sdkPathname=${sdkMetadata.pathname}`);
  if (sdkMetadata.size !== entry.bytes) errors.push(`sdkSize=${sdkMetadata.size}`);
  if (!response.ok) errors.push(`status=${response.status}`);
  if (!contentType.startsWith("audio/")) errors.push(`contentType=${contentType}`);
  if (contentLength !== entry.bytes) errors.push(`contentLength=${contentLength}`);
  if (errors.length > 0) {
    throw new Error(`${entry.blobPathname}: ${errors.join(", ")}`);
  }
  const durationSeconds = Number(
    booksFromDocument(JSON.parse(readFileSync(booksPath, "utf8")))
      .find((book) => book.slug === entry.slug)
      ?.chapters.find((chapter) => chapter.number === entry.chapterNumber)
      ?.audio?.durationSeconds,
  );
  const seekSeconds = Math.max(1, Math.min(120, Math.floor(durationSeconds / 2)));
  await run("ffmpeg", [
    "-hide_banner", "-v", "error", "-xerror",
    "-ss", String(seekSeconds),
    "-i", blob.url,
    "-t", "5",
    "-map", "0:a:0",
    "-f", "null", "-",
  ]);
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: sdkMetadata.pathname,
    contentType,
    contentLength,
    size: sdkMetadata.size,
    etag: sdkMetadata.etag,
    cacheControl: sdkMetadata.cacheControl,
    localSha256,
    headVerified: true,
    remoteSeekSeconds: seekSeconds,
    remoteSeekVerified: true,
  };
}

async function uploadEntry(entry) {
  const localSha256 = await sha256(entry.sourcePath);
  const blob = await put(entry.blobPathname, createReadStream(entry.sourcePath), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 31_536_000,
    contentType: "audio/mp4",
    multipart: true,
  });
  return { ...entry, localSha256, blob: await verifyBlob(entry, blob, localSha256) };
}

async function verifyExistingEntry(entry) {
  return {
    ...entry,
    blob: await verifyBlob(entry, entry.blob, entry.localSha256),
  };
}

async function assertStoreIdentity(entries) {
  const result = await list({ prefix: "books/", limit: 1000, mode: "expanded" });
  const actual = result.blobs.map((blob) => blob.pathname).sort();
  const expected = entries.map((entry) => entry.blobPathname).sort();
  if (result.hasMore) throw new Error("Blob listing has more than 1000 results; identity is ambiguous");
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new Error(`Blob Store identity mismatch: expected ${expected.length}, found ${actual.length}`);
  }
  return { blobCount: actual.length, exactPathnameSet: true };
}

async function smoke(entries) {
  const entry = entries.find((candidate) => candidate.slug === "standing-above-multi-agent-workbench") ?? entries[0];
  console.log(`Smoke upload: ${entry.slug}#${entry.chapterNumber}`);
  const uploaded = await uploadEntry(entry);
  const report = {
    status: "passed",
    mode: "smoke",
    deterministicPathname: uploaded.blob.pathname === uploaded.blobPathname,
    entry: uploaded,
  };
  writeFileSync(smokePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: report.status, pathname: uploaded.blob.pathname, bytes: uploaded.bytes, url: uploaded.blob.url }, null, 2));
}

async function uploadAll(entries) {
  const smokeReport = existsSync(smokePath) ? JSON.parse(readFileSync(smokePath, "utf8")) : null;
  const smokeEntry = smokeReport?.status === "passed" ? smokeReport.entry : null;
  const uploaded = await mapConcurrent(entries, concurrency, async (entry, index) => {
    console.log(`[${index + 1}/${entries.length}] Blob ${entry.slug}#${entry.chapterNumber}`);
    if (smokeEntry?.blobPathname === entry.blobPathname) {
      return verifyExistingEntry(smokeEntry);
    }
    return uploadEntry(entry);
  });
  if (new Set(uploaded.map((entry) => entry.localSha256)).size !== uploaded.length) {
    throw new Error("Duplicate local SHA-256 values require identity review");
  }
  const storeIdentity = await assertStoreIdentity(uploaded);
  const totalBytes = uploaded.reduce((sum, entry) => sum + entry.bytes, 0);
  const manifest = {
    schemaVersion: 1,
    status: "uploaded-and-verified",
    access: "public",
    region: "hnd1",
    storeIdentity,
    checks: {
      localSha256: "passed",
      deterministicPathname: "passed",
      sdkMetadata: "passed",
      publicHead: "passed",
      exactContentLength: "passed",
      remoteSeek: "passed",
      exactStorePathnameSet: "passed",
      booksJsonApplied: "pending",
      productionReader: "pending",
    },
    summary: { audioCount: uploaded.length, totalBytes },
    entries: uploaded,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: manifest.status, ...manifest.summary, ...storeIdentity }, null, 2));
}

function readManifest() {
  if (!existsSync(manifestPath)) throw new Error(`Missing migration manifest: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!manifest.entries?.length || !["uploaded-and-verified", "applied", "production-verified"].includes(manifest.status)) {
    throw new Error(`Migration manifest is not eligible: ${manifest.status}`);
  }
  return manifest;
}

function ledgerPath(bookTitle) {
  return path.join(root, "book-txt", bookTitle, "notebooklm-audio-ledger.json");
}

function updateLedgers(manifest, productionVerified) {
  const grouped = Map.groupBy(manifest.entries, (entry) => entry.bookTitle);
  for (const [bookTitle, bookEntries] of grouped) {
    const target = ledgerPath(bookTitle);
    const ledger = JSON.parse(readFileSync(target, "utf8"));
    const items = ledger.downloadValidation?.chapters ?? [];
    const byNumber = new Map(bookEntries.map((entry) => [entry.chapterNumber, entry]));
    for (const item of items) {
      const entry = byNumber.get(item.chapterNumber);
      if (!entry) continue;
      item.audioSrc = entry.blob.url;
      if ("appAudioSrc" in item) item.appAudioSrc = entry.blob.url;
      item.storage = "vercel-blob";
      item.blobUrl = entry.blob.url;
      item.blobPathname = entry.blob.pathname;
      item.blobEtag = entry.blob.etag;
      item.blobHeadVerified = true;
      item.blobRemoteSeekVerified = productionVerified;
    }
    ledger.blobMigrationValidation = {
      status: productionVerified ? "production-verified" : "uploaded-and-applied",
      provider: "vercel-blob",
      access: "public",
      region: "hnd1",
      checkedAudioCount: bookEntries.length,
      failedChapterNumbers: [],
      exactContentLengthChecked: true,
      remoteSeekChecked: productionVerified,
    };
    writeFileSync(target, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  }
}

async function applyManifest() {
  const manifest = readManifest();
  if (manifest.status !== "uploaded-and-verified") {
    throw new Error(`Apply requires uploaded-and-verified, found ${manifest.status}`);
  }
  const document = JSON.parse(readFileSync(booksPath, "utf8"));
  const byIdentity = new Map(
    manifest.entries.map((entry) => [`${entry.slug}:${entry.chapterNumber}`, entry]),
  );
  let changed = 0;
  for (const book of booksFromDocument(document)) {
    for (const chapter of book.chapters ?? []) {
      const entry = byIdentity.get(`${book.slug}:${chapter.number}`);
      if (!entry) continue;
      if (chapter.audio?.src !== entry.currentSrc) {
        throw new Error(`Canonical source changed after upload: ${book.slug}#${chapter.number}`);
      }
      chapter.audio.src = entry.blob.url;
      chapter.audio.storage = "vercel-blob";
      changed += 1;
    }
  }
  if (changed !== manifest.entries.length) throw new Error(`Applied ${changed}/${manifest.entries.length}`);
  writeFileSync(booksPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  updateLedgers(manifest, false);
  manifest.status = "applied";
  manifest.checks.booksJsonApplied = "passed";
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: manifest.status, changedAudioReferences: changed }, null, 2));
}

async function verifyProduction() {
  const manifest = readManifest();
  if (!["applied", "production-verified"].includes(manifest.status)) {
    throw new Error(`Production verify requires applied, found ${manifest.status}`);
  }
  const document = JSON.parse(readFileSync(booksPath, "utf8"));
  const entries = canonicalInventory(document, manifest);
  const checks = await mapConcurrent(entries, concurrency, async (entry, index) => {
    console.log(`[${index + 1}/${entries.length}] production Blob ${entry.slug}#${entry.chapterNumber}`);
    const verified = await verifyExistingEntry(entry);
    return { slug: entry.slug, chapterNumber: entry.chapterNumber, url: verified.blob.url, bytes: verified.blob.contentLength, seekSeconds: verified.blob.remoteSeekSeconds };
  });
  await assertStoreIdentity(entries);
  const page = await fetch(`${productionBaseUrl}/books/${entries[0].slug}`, { cache: "no-store" });
  const html = await page.text();
  if (!page.ok || !html.includes("blob.vercel-storage.com")) {
    throw new Error("Production reader does not expose Blob-backed audio URLs");
  }
  manifest.status = "production-verified";
  manifest.checks.productionReader = "passed";
  manifest.production = { baseUrl: productionBaseUrl, status: "passed", checkedAudioCount: checks.length, checks };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  updateLedgers(manifest, true);
  console.log(JSON.stringify({ status: manifest.status, productionReader: "passed", checkedAudioCount: checks.length }, null, 2));
}

if (!process.env.BLOB_READ_WRITE_TOKEN && !args.has("--plan")) {
  throw new Error("BLOB_READ_WRITE_TOKEN is required; run with --env-file-if-exists=.env.local");
}

const document = JSON.parse(readFileSync(booksPath, "utf8"));
if (args.has("--smoke")) {
  await smoke(localInventory(document));
} else if (args.has("--upload")) {
  await uploadAll(localInventory(document));
} else if (args.has("--apply")) {
  await applyManifest();
} else if (args.has("--verify-production")) {
  await verifyProduction();
} else {
  const entries = localInventory(document);
  console.log(JSON.stringify({ mode: "plan", mutations: false, audioCount: entries.length, totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0), deterministicPathnames: new Set(entries.map((entry) => entry.blobPathname)).size === entries.length }, null, 2));
}
