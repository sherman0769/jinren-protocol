import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  inspectDownloadedAudio,
  planResumeCommand,
  runResumeCommand,
} from "./resume-notebooklm-audio.mjs";

const root = await mkdtemp(path.join(tmpdir(), "resume-notebooklm-command-"));
const slug = "test-book";
const bookTitle = "Test Book";
const audioFolder = path.join(root, "public", "books", slug, "audio");
const ledgerPath = path.join(
  root,
  "book-txt",
  bookTitle,
  "notebooklm-audio-ledger.json",
);
const coordinatorModulePath = path.join(
  process.env.CODEX_HOME || path.join(process.env.USERPROFILE, ".codex"),
  "skills",
  "notebooklm-chapter-audio",
  "scripts",
  "notebooklm-download-resume-coordinator.mjs",
);

function generateAudio(filePath, frequency) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-v",
      "error",
      "-y",
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${frequency}:duration=1`,
      "-c:a",
      "aac",
      "-b:a",
      "80k",
      "-ac",
      "1",
      "-movflags",
      "+faststart",
      "-f",
      "mp4",
      filePath,
    ],
    { stdio: "ignore" },
  );
  if (result.error) throw result.error;
  assert.equal(result.status, 0);
}

async function writeLedger(ledger) {
  await mkdir(path.dirname(ledgerPath), { recursive: true });
  await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
}

try {
  await mkdir(path.join(root, "src", "content"), { recursive: true });
  await mkdir(audioFolder, { recursive: true });
  await writeFile(
    path.join(root, "src", "content", "books.json"),
    `${JSON.stringify(
      [
        {
          slug,
          title: bookTitle,
          chapters: [
            { number: 1, title: "One" },
            { number: 2, title: "Two" },
          ],
        },
      ],
      null,
      2,
    )}\n`,
    "utf8",
  );

  const firstPath = path.join(audioFolder, "01_One.m4a");
  const secondDownloadPath = path.join(root, "02-download.tmp");
  generateAudio(firstPath, 440);
  generateAudio(secondDownloadPath, 660);
  const firstValidation = await inspectDownloadedAudio(firstPath, {
    expectedDuration: "00:01",
  });
  await writeLedger({
    entries: [
      {
        chapterNumber: 1,
        sourceFilename: "01_One.txt",
        expectedAudioTitle: "01_One",
        finalAudioCardTitle: "01_One",
        duration: "00:01",
      },
      {
        chapterNumber: 2,
        sourceFilename: "02_Two.txt",
        expectedAudioTitle: "02_Two",
        finalAudioCardTitle: "02_Two",
        duration: "00:01",
      },
    ],
    downloadValidation: {
      status: "partial",
      chapters: [
        {
          chapterNumber: 1,
          audioFilename: "01_One.m4a",
          audioPath: "public/books/test-book/audio/01_One.m4a",
          audioSrc: "/books/test-book/audio/01_One.m4a",
          ...firstValidation,
          linkedInBooksJson: true,
        },
      ],
    },
  });

  const dryRun = await planResumeCommand({
    slug,
    projectRoot: root,
    coordinatorModulePath,
  });
  assert.equal(dryRun.mode, "dry-run");
  assert.equal(dryRun.mutations, false);
  assert.deepEqual(dryRun.completedChapterNumbers, [1]);
  assert.deepEqual(dryRun.remainingChapterNumbers, [2]);

  let missingControllerCode;
  try {
    await runResumeCommand({
      slug,
      projectRoot: root,
      coordinatorModulePath,
    });
  } catch (error) {
    missingControllerCode = error.code;
  }
  assert.equal(missingControllerCode, "CHROME_CONTROLLER_REQUIRED");

  const calls = [];
  const controller = {
    async downloadChapter(context) {
      calls.push(context.chapterNumber);
      return {
        ...context,
        newFilename: path.basename(secondDownloadPath),
        newPath: secondDownloadPath,
        triggerMethod: "keyboard-preferred",
        transactionId: "test-transaction-2",
      };
    },
  };
  const executed = await runResumeCommand({
    slug,
    projectRoot: root,
    coordinatorModulePath,
    controller,
    timeoutMs: 10_000,
  });
  assert.equal(executed.status, "download-resume-complete");
  assert.deepEqual(calls, [2]);
  assert.deepEqual(executed.remainingChapterNumbers, []);
  const secondDestination = path.join(audioFolder, "02_Two.m4a");
  const secondDetails = await inspectDownloadedAudio(secondDestination, {
    expectedDuration: "00:01",
  });
  assert.equal(secondDetails.fullDecode, true);
  const completedLedger = JSON.parse(await readFile(ledgerPath, "utf8"));
  assert.equal(
    completedLedger.downloadValidation.chapters.find(
      (chapter) => chapter.chapterNumber === 2,
    ).fullDecode,
    true,
  );
  assert.equal(completedLedger.downloadResumeAudit.runs.at(-1).outcome, "complete");

  const noOp = await runResumeCommand({
    slug,
    projectRoot: root,
    coordinatorModulePath,
  });
  assert.equal(noOp.status, "already-complete");
  assert.equal(noOp.mutations, false);

  const incompatibleLedger = JSON.parse(await readFile(ledgerPath, "utf8"));
  incompatibleLedger.entries.pop();
  await writeLedger(incompatibleLedger);
  await assert.rejects(
    planResumeCommand({ slug, projectRoot: root, coordinatorModulePath }),
    /Book\/ledger chapter count mismatch/u,
  );

  console.log(
    JSON.stringify({
      status: "passed",
      scenarios: 5,
      dryRunReadOnly: true,
      controllerFailClosed: true,
      validatedExecution: true,
      completedNoOp: true,
      legacyMismatchRejected: true,
    }),
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
