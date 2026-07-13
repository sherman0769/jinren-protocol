import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0
    ? args[index + 1]
    : args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
};
const positionalArgs = args.filter((arg) => !arg.startsWith("--"));
const slug = readArg("--slug") ?? positionalArgs[0];
const baseUrl = (readArg("--base-url") ?? positionalArgs[1])?.replace(/\/$/, "");
const remoteSeek = args.includes("--remote-seek") || positionalArgs.includes("remote-seek");
const resolveAudioUrl = (audioSrc) =>
  /^https:\/\//iu.test(audioSrc) ? audioSrc : `${baseUrl}${audioSrc}`;

if (!slug) {
  throw new Error(
    "Usage: npm run validate:notebooklm-audio -- <slug> [base-url] [remote-seek]",
  );
}

const booksDocument = JSON.parse(readFileSync("src/content/books.json", "utf8"));
const books = Array.isArray(booksDocument) ? booksDocument : booksDocument.books;
const book = books.find((candidate) => candidate.slug === slug);

if (!book) {
  throw new Error(`Unknown book slug: ${slug}`);
}

const txtFolder = path.join("book-txt", book.title);
const ledgerPath = path.join(txtFolder, "notebooklm-audio-ledger.json");
const audioFolder = path.join("public", "books", slug, "audio");
const errors = [];
const warnings = [];
const chapterResults = [];
const invalidFilenameCharacters = /[\\/:*?"<>|]/g;
const sanitize = (value) =>
  String(value)
    .replace(invalidFilenameCharacters, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "") || "untitled";
const toSeconds = (duration) => {
  const parts = String(duration ?? "").split(":").map(Number);
  return parts.length === 2 && parts.every(Number.isFinite)
    ? parts[0] * 60 + parts[1]
    : Number.NaN;
};

const remoteAudioChapters = book.chapters.filter((chapter) => /^https:\/\//iu.test(chapter.audio?.src ?? ""));
const localAudioChapters = book.chapters.filter(
  (chapter) => chapter.audio?.src && !/^https:\/\//iu.test(chapter.audio.src),
);

if (!existsSync(ledgerPath)) errors.push(`Missing ledger: ${ledgerPath}`);
if (localAudioChapters.length > 0 && !existsSync(audioFolder)) {
  errors.push(`Missing audio folder: ${audioFolder}`);
}

const ledger = existsSync(ledgerPath)
  ? JSON.parse(readFileSync(ledgerPath, "utf8"))
  : { entries: [], downloadValidation: { chapters: [] } };
const txtFiles = existsSync(txtFolder)
  ? readdirSync(txtFolder).filter((name) => /^\d{2}_.+\.txt$/u.test(name)).sort()
  : [];
const audioFiles = existsSync(audioFolder)
  ? readdirSync(audioFolder).filter((name) => /\.(?:m4a|mp3|mp4|aac)$/iu.test(name)).sort()
  : [];

const expectedNumbers = book.chapters.map((chapter) => chapter.number);
const contiguousNumbers = expectedNumbers.every((number, index) => number === index + 1);
if (!contiguousNumbers) errors.push("Book chapter numbers are not contiguous from 1");
if (new Set(expectedNumbers).size !== expectedNumbers.length) {
  errors.push("Book contains duplicate chapter numbers");
}
if (txtFiles.length !== book.chapters.length) {
  errors.push(`TXT count ${txtFiles.length} != chapter count ${book.chapters.length}`);
}
if (ledger.entries?.length !== book.chapters.length) {
  errors.push(`Ledger entry count ${ledger.entries?.length ?? 0} != chapter count ${book.chapters.length}`);
}
if (audioFiles.length !== localAudioChapters.length) {
  errors.push(`Local audio file count ${audioFiles.length} != local reference count ${localAudioChapters.length}`);
}

const queueAudits = ledger.entries?.filter(
  (entry) =>
    entry.submissionOrdinal != null ||
    entry.preSubmitCardCount != null ||
    entry.postSubmitCardCount != null ||
    entry.queueAcceptanceState != null ||
    entry.queueAcceptedAt != null,
) ?? [];
if (queueAudits.length > 0 && queueAudits.length !== book.chapters.length) {
  errors.push("Batch queue audit fields exist for only part of the ledger");
} else if (queueAudits.length === book.chapters.length) {
  const ordinals = queueAudits.map((entry) => entry.submissionOrdinal).sort((a, b) => a - b);
  if (!ordinals.every((ordinal, index) => ordinal === index + 1)) {
    errors.push("Batch submission ordinals are missing or duplicated");
  }
  for (const entry of queueAudits) {
    if (entry.postSubmitCardCount !== entry.preSubmitCardCount + 1) {
      errors.push(`Chapter ${entry.chapterNumber} has no +1 queue acceptance proof`);
    }
    if (entry.queueAcceptanceState !== "accepted" || !entry.queueAcceptedAt) {
      errors.push(`Chapter ${entry.chapterNumber} is not marked queue-accepted`);
    }
  }
} else {
  warnings.push("Legacy ledger has no per-submission batch queue audit fields");
}

for (const chapter of book.chapters) {
  const prefix = String(chapter.number).padStart(2, "0");
  const expectedTitle = `${prefix}_${sanitize(chapter.title)}`;
  const expectedTxt = `${expectedTitle}.txt`;
  const entry = ledger.entries?.find((candidate) => candidate.chapterNumber === chapter.number);
  const download = ledger.downloadValidation?.chapters?.find(
    (candidate) => candidate.chapterNumber === chapter.number,
  );
  const result = { chapterNumber: chapter.number, expectedTitle, status: "passed" };

  if (!txtFiles.includes(expectedTxt)) errors.push(`Missing TXT: ${expectedTxt}`);
  if (!entry) {
    errors.push(`Missing ledger entry for chapter ${chapter.number}`);
  } else {
    if (entry.sourceFilename !== expectedTxt) errors.push(`Chapter ${chapter.number} source mismatch`);
    if (entry.promptMarker !== `章節標誌：${expectedTitle}`) {
      errors.push(`Chapter ${chapter.number} prompt marker mismatch`);
    }
    if (entry.selectedSourceCount !== 1) errors.push(`Chapter ${chapter.number} selected source count != 1`);
    if (entry.generationState !== "complete") errors.push(`Chapter ${chapter.number} generation incomplete`);
    if (entry.promptSourceVerification !== "complete") {
      errors.push(`Chapter ${chapter.number} prompt/source verification incomplete`);
    }
    if (entry.finalAudioCardTitle !== expectedTitle) {
      errors.push(`Chapter ${chapter.number} final card title mismatch`);
    }
  }

  if (!chapter.audio?.src) {
    errors.push(`Chapter ${chapter.number} has no books.json audio.src`);
    result.status = "failed";
    chapterResults.push(result);
    continue;
  }

  const audioFilename = decodeURIComponent(chapter.audio.src.split("/").at(-1));
  const audioPath = path.join(audioFolder, audioFilename);
  if (!audioFilename.startsWith(`${expectedTitle}.`)) {
    errors.push(`Chapter ${chapter.number} audio filename mismatch: ${audioFilename}`);
  }
  const isRemoteAudio = /^https:\/\//iu.test(chapter.audio.src);
  if (isRemoteAudio) {
    const audioFileSize = Number(download?.fileSizeBytes);
    const actualDuration = Number(download?.durationSeconds);
    const cardDuration = toSeconds(entry?.duration);
    const durationDelta = Math.abs(actualDuration - cardDuration);
    const lastPacketDuration = Number(download?.lastPacketDurationSeconds);
    const fullDecode = download?.fullDecode === true;
    if (!Number.isFinite(audioFileSize) || audioFileSize <= 0) {
      errors.push(`Chapter ${chapter.number} ledger file size is missing`);
    }
    if (download?.codec !== "aac") errors.push(`Chapter ${chapter.number} ledger codec is not AAC`);
    if (!Number.isFinite(cardDuration) || !Number.isFinite(actualDuration) || durationDelta > 2) {
      errors.push(`Chapter ${chapter.number} duration mismatch: card=${entry?.duration}, ledger=${actualDuration}`);
    }
    if (!Number.isFinite(lastPacketDuration) || Math.abs(lastPacketDuration - cardDuration) > 2) {
      errors.push(
        `Chapter ${chapter.number} playable packet duration mismatch: card=${entry?.duration}, ledgerLastPacket=${lastPacketDuration}`,
      );
    }
    if (!fullDecode) errors.push(`Chapter ${chapter.number} has no recorded full local decode`);
    if (!download?.linkedInBooksJson) errors.push(`Chapter ${chapter.number} is not ledger-linked`);
    if (download?.audioSrc !== chapter.audio.src) errors.push(`Chapter ${chapter.number} ledger audio.src mismatch`);
    if (download?.storage !== "vercel-blob" || download?.blobUrl !== chapter.audio.src) {
      errors.push(`Chapter ${chapter.number} Blob ledger identity mismatch`);
    }

    if (baseUrl) {
      const productionAudioUrl = resolveAudioUrl(chapter.audio.src);
      const response = await fetch(productionAudioUrl, { method: "HEAD" });
      const contentType = response.headers.get("content-type") ?? "";
      const contentLength = Number(response.headers.get("content-length"));
      if (!response.ok || !contentType.startsWith("audio/")) {
        errors.push(`Chapter ${chapter.number} production audio failed: ${response.status} ${contentType}`);
      }
      if (!Number.isFinite(contentLength) || contentLength !== audioFileSize) {
        errors.push(
          `Chapter ${chapter.number} production size mismatch: ledger=${audioFileSize}, production=${contentLength}`,
        );
      }
      const seekSeconds = Math.max(1, Math.min(120, Math.floor(cardDuration / 2)));
      let remoteSeekStatus;
      if (remoteSeek) {
        const remoteDecode = spawnSync(
          "ffmpeg",
          [
            "-hide_banner",
            "-v",
            "error",
            "-xerror",
            "-ss",
            String(seekSeconds),
            "-i",
            productionAudioUrl,
            "-t",
            "5",
            "-map",
            "0:a:0",
            "-f",
            "null",
            "-",
          ],
          { stdio: "ignore", timeout: 30_000 },
        );
        remoteSeekStatus = remoteDecode.status === 0 ? "passed" : "failed";
        if (remoteDecode.status !== 0) {
          errors.push(`Chapter ${chapter.number} production seek failed at ${seekSeconds}s`);
        }
      }
      result.production = {
        status: response.status,
        contentType,
        contentLength,
        remoteSeek: remoteSeek ? { seconds: seekSeconds, status: remoteSeekStatus } : "not-requested",
      };
    }

    result.codec = download?.codec;
    result.container = download?.container;
    result.durationSeconds = actualDuration;
    result.durationDeltaSeconds = durationDelta;
    result.lastPacketDurationSeconds = lastPacketDuration;
    result.fullDecode = fullDecode;
    result.storage = "vercel-blob";
    chapterResults.push(result);
    continue;
  }
  if (!existsSync(audioPath) || statSync(audioPath).size === 0) {
    errors.push(`Chapter ${chapter.number} audio file is missing or empty`);
    result.status = "failed";
    chapterResults.push(result);
    continue;
  }
  const audioFileSize = statSync(audioPath).size;

  const probe = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=format_name,duration",
        "-show_entries",
        "stream=codec_name,codec_type",
        "-of",
        "json",
        path.resolve(audioPath),
      ],
      { encoding: "utf8" },
    ),
  );
  const audioStream = probe.streams.find((stream) => stream.codec_type === "audio");
  const actualDuration = Number(probe.format.duration);
  const cardDuration = toSeconds(entry?.duration);
  const durationDelta = Math.abs(actualDuration - cardDuration);
  const packetProbe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_packets",
      "-show_entries",
      "packet=pts_time",
      "-of",
      "csv=p=0",
      path.resolve(audioPath),
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  const packetTimes = String(packetProbe.stdout ?? "")
    .trim()
    .split(/\r?\n/u)
    .map(Number)
    .filter(Number.isFinite);
  const lastPacketDuration = packetTimes.at(-1) ?? 0;
  const decode = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-v",
      "error",
      "-xerror",
      "-i",
      path.resolve(audioPath),
      "-map",
      "0:a:0",
      "-f",
      "null",
      "-",
    ],
    { stdio: "ignore" },
  );

  if (!audioStream) errors.push(`Chapter ${chapter.number} has no audio stream`);
  if (!Number.isFinite(cardDuration) || durationDelta > 2) {
    errors.push(`Chapter ${chapter.number} duration mismatch: card=${entry?.duration}, file=${actualDuration}`);
  }
  if (packetProbe.status !== 0 || Math.abs(lastPacketDuration - cardDuration) > 2) {
    errors.push(
      `Chapter ${chapter.number} playable packet duration mismatch: card=${entry?.duration}, lastPacket=${lastPacketDuration}`,
    );
  }
  if (decode.status !== 0) errors.push(`Chapter ${chapter.number} failed full ffmpeg decode`);
  if (!download?.linkedInBooksJson) errors.push(`Chapter ${chapter.number} is not ledger-linked`);
  if (download?.audioSrc !== chapter.audio.src) errors.push(`Chapter ${chapter.number} ledger audio.src mismatch`);
  if (download && Math.abs(Number(download.durationSeconds) - actualDuration) > 0.1) {
    errors.push(`Chapter ${chapter.number} ledger duration differs from ffprobe`);
  }

  if (baseUrl) {
    const productionAudioUrl = resolveAudioUrl(chapter.audio.src);
    const response = await fetch(productionAudioUrl, { method: "HEAD" });
    const contentType = response.headers.get("content-type") ?? "";
    const contentLength = Number(response.headers.get("content-length"));
    if (!response.ok || !contentType.startsWith("audio/")) {
      errors.push(`Chapter ${chapter.number} production audio failed: ${response.status} ${contentType}`);
    }
    if (!Number.isFinite(contentLength) || contentLength !== audioFileSize) {
      errors.push(
        `Chapter ${chapter.number} production size mismatch: local=${audioFileSize}, production=${contentLength}`,
      );
    }
    const seekSeconds = Math.max(1, Math.min(120, Math.floor(cardDuration / 2)));
    let remoteSeekStatus;
    if (remoteSeek) {
      const remoteDecode = spawnSync(
        "ffmpeg",
        [
          "-hide_banner",
          "-v",
          "error",
          "-xerror",
          "-ss",
          String(seekSeconds),
          "-i",
          productionAudioUrl,
          "-t",
          "5",
          "-map",
          "0:a:0",
          "-f",
          "null",
          "-",
        ],
        { stdio: "ignore", timeout: 30_000 },
      );
      remoteSeekStatus = remoteDecode.status === 0 ? "passed" : "failed";
      if (remoteDecode.status !== 0) {
        errors.push(`Chapter ${chapter.number} production seek failed at ${seekSeconds}s`);
      }
    }
    result.production = {
      status: response.status,
      contentType,
      contentLength,
      remoteSeek: remoteSeek ? { seconds: seekSeconds, status: remoteSeekStatus } : "not-requested",
    };
  }

  result.codec = audioStream?.codec_name;
  result.container = probe.format.format_name;
  result.durationSeconds = actualDuration;
  result.durationDeltaSeconds = durationDelta;
  result.lastPacketDurationSeconds = lastPacketDuration;
  result.fullDecode = decode.status === 0;
  chapterResults.push(result);
}

if (ledger.downloadValidation?.status !== "complete") errors.push("Ledger downloadValidation status is not complete");
if (ledger.downloadValidation?.downloadedCount !== book.chapters.length) {
  errors.push("Ledger downloaded count does not equal chapter count");
}
if (ledger.downloadValidation?.linkedCount !== book.chapters.length) {
  errors.push("Ledger linked count does not equal chapter count");
}
if ((ledger.downloadValidation?.missingChapterNumbers ?? []).length > 0) {
  errors.push("Ledger still reports missing chapter numbers");
}
if (
  ledger.integrityValidation?.status !== "complete" ||
  ledger.integrityValidation?.checkedChapterCount !== book.chapters.length ||
  (ledger.integrityValidation?.failedChapterNumbers ?? []).length > 0
) {
  errors.push("Ledger full-decode integrity validation is missing or incomplete");
}
if (
  remoteAudioChapters.length > 0 &&
  (
    ledger.blobMigrationValidation?.status !== "production-verified" ||
    ledger.blobMigrationValidation?.checkedAudioCount !== remoteAudioChapters.length ||
    ledger.blobMigrationValidation?.remoteSeekChecked !== true
  )
) {
  errors.push("Ledger Blob migration validation is missing or incomplete");
}

const report = {
  status: errors.length === 0 ? "passed" : "failed",
  slug,
  chapterCount: book.chapters.length,
  txtCount: txtFiles.length,
  ledgerEntryCount: ledger.entries?.length ?? 0,
  audioCount: book.chapters.filter((chapter) => chapter.audio?.src).length,
  localAudioCount: audioFiles.length,
  remoteAudioCount: remoteAudioChapters.length,
  queueAudit: queueAudits.length === book.chapters.length ? "complete" : "legacy-unavailable",
  productionChecked: Boolean(baseUrl),
  productionRemoteSeekChecked: Boolean(baseUrl && remoteSeek),
  warnings,
  errors,
  chapters: chapterResults,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length > 0) process.exitCode = 1;
