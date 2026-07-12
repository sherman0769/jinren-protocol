<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Book Intake / New Book Publishing

The user will place future manuscripts in the root `books/` folder, or provide a Google Drive link to a manuscript/package that should be downloaded into `books/` first. When asked to check, import, publish, or "上架" books, first inspect `books/` and compare its files with the existing entries in `src/content/books.json`. Treat any supported manuscript that is not already represented in `books.json` as a new book to publish.

Google Drive intake model:

- When the user provides a Google Drive link as the source for a new book, use the Google Drive connector when available to access and download the linked file or folder contents. If connector access is not available or the link is not shared correctly, ask the user to adjust sharing or provide access before proceeding.
- Treat any Google Drive or other manuscript/package download link as a request to run the complete publishing loop by default: intake, parse, TXT export, NotebookLM chapter audio generation, audio download, `books.json` linking, validation, commit, push, and production deployment. Do not stop at website text publishing unless the user explicitly says to exclude NotebookLM, audio download, deployment, or asks for website-only publishing.
- Download only the intended manuscript/package files into the root `books/` intake folder. Preserve the original filename when possible, and do not download directly into `published-books/`, `book-txt/`, or app content folders.
- After download, verify the local file exists under `books/`, has a supported extension, has nonzero size, and is not already represented in `src/content/books.json` or archived under `published-books/`.
- If the Drive link points to a folder or multiple files, identify the complete book package or intended manuscript files before importing. Prefer one complete ZIP package per book when present.

The preferred source format is now one complete ZIP package per book. A book ZIP may contain a README, manifest, chapter folders, chapter ZIP files, Markdown chapter sources, Word chapter sources, and supporting production notes. Extract the ZIP into `tmp/`, inspect the README/manifest first, then parse the reader-facing chapter source files in chapter order. Prefer `chapter_XX_main.md` or equivalent polished manuscript files; use `.docx` only when Markdown is missing or incomplete. Ignore supporting files such as speech notes, slide outlines, quote banks, loop canvases, and internal README files unless the user explicitly asks to publish them.

The root `books/` folder is an intake folder for unprocessed sources only. After a manuscript has been imported and published, move its original source file to the root `published-books/` folder and keep `books/` available for future incoming manuscripts. Do not re-import files from `published-books/`; use that folder as the archive of completed source manuscripts.

Supported source formats, in preferred order:

- Complete book ZIP package: `.zip`
- Markdown: `.md`
- Word: `.docx`
- Plain text: `.txt`
- PDF only when the text layer is extractable or OCR has already been done

Use the same publishing model as the first book:

- The app's canonical book data lives in `src/content/books.json`.
- Preserve all existing books; append new books instead of replacing the array.
- Each book needs `id`, `slug`, `title`, `subtitle`, `author`, `description`, `status`, `genre`, `rating`, `cover`, `ogImage`, `sourceUrl`, and `chapters`.
- Each chapter needs `id`, `number`, `title`, `summary`, `minutes`, and `paragraphs`. After real chapter audio exists, add an `audio` object with at least `src`; include `title`, `provider`, or `durationSeconds` when available.
- Store cover assets under `public/books/<slug>/cover.png`, and point both `cover` and `ogImage` to `/books/<slug>/cover.png`.

Plain-text export model:

- For each newly published book, also create a root `book-txt/` export.
- Create one subfolder per book under `book-txt/`, using the book's display title as the folder name, not the slug.
- Export each chapter as a UTF-8 `.txt` file inside that folder, with filenames prefixed by a two-digit chapter number, for example `01_Chapter Title.txt`.
- TXT exports must be clean reader-facing plain text derived from the final `books.json` chapter data: chapter title first, then paragraphs separated by blank lines.
- Sanitize only filesystem-invalid filename characters such as `\ / : * ? " < > |`; preserve Chinese names and readable punctuation whenever the filesystem allows it.
- Keep TXT exports in version control with the book update so the repository contains both the website data and portable plain-text chapter files.

NotebookLM chapter audio workflow:

- Project-level "目標" instructions for book publishing include this NotebookLM chapter audio loop by default. When the user asks for a shortest "目標" command, a book publishing goal, or "上架" work, treat NotebookLM audio generation and ledger validation as part of the expected deliverable unless the user explicitly excludes NotebookLM or asks for website-only publishing.
- The completed loop must leave the reader able to listen to NotebookLM audio directly inside the ebook platform: every chapter should have a validated audio asset under `public/books/<slug>/audio/`, a matching chapter `audio.src` in `src/content/books.json`, and a visible NotebookLM Podcast play/download entry after deployment.
- When using `book-txt/<book title>/` chapter files as NotebookLM sources for podcast/audio study, treat each numbered `.txt` chapter as one source and one expected audio artifact.
- Before opening NotebookLM, run a TXT chapter preflight: verify the chapter count, two-digit ordering, no duplicate chapter numbers, no missing chapter numbers, no empty files, and that every filename stem is the intended final audio title.
- Create or update `book-txt/<book title>/notebooklm-audio-ledger.json` during audio work. Track notebook URL, chapter number, source filename, prompt marker, selected source count, generation state, prompt/source verification state, final audio card title, and completion timestamp. For batch runs also record the submission ordinal, pre-submit card count, post-submit card count, queue-acceptance state, and acceptance timestamp so queue progress can be audited without relying on visual order.
- Use exactly one NotebookLM notebook per book. Upload all chapter TXT sources into that book notebook; do not create one notebook per chapter.
- Before generating each chapter audio, clear source selections by clicking `全選` twice, verify the Studio area shows `0 個來源`, then select only the target chapter and verify the UI shows `1 個來源`.
- Use NotebookLM `深入探索` Audio Overview for study-quality chapter audio; do not switch to short/summary formats unless the user explicitly prioritizes speed over content depth.
- Before generation, use the `自訂語音摘要` prompt and put a first-line marker such as `章節標誌：01_Chapter Title`, so the prompt/source view beside the generated audio can be used as a second verification mark.
- After generation, rename the NotebookLM audio card to the chapter filename stem, for example `01_Chapter Title`, and verify `查看提示詞和來源` contains the matching marker/source.
- NotebookLM may reorder audio cards after generation or rename. During rename, verification, and download, do not rely on card index, visual order, or completion order to infer chapter identity. Re-scan the current card list after each rename or meaningful UI change, open `查看提示詞和來源`, and map the card only by matching `章節標誌` plus source filename before downloading or updating the ledger.
- Unless the user explicitly excludes ebook audio, download every completed chapter audio file and store it under `public/books/<slug>/audio/` with a two-digit chapter-number prefix matching the TXT/audio title, for example `01_Chapter Title.mp3`.
- When testing a new ebook audio loop or when the user asks to "試一下新增環節", do a one-chapter smoke test before batch download: download one completed NotebookLM audio card, identify the actual container/codec with `ffprobe`, save it under `public/books/<slug>/audio/` with the final chapter title stem, run `node scripts/link-book-audio.mjs --slug <slug> --allow-partial --dry-run`, then run the actual partial link only after the dry-run maps the intended chapter.
- NotebookLM downloads may initially appear as browser `.tmp` files even when they are playable MP4/M4A audio. Verify with `ffprobe`; if the stream is AAC in an MP4/DASH container, store it as `.m4a`.
- After audio files are stored, run `npm run link:book-audio -- <slug>` to write chapter `audio.src` entries into `src/content/books.json`; use `node scripts/link-book-audio.mjs --slug <slug> --dry-run` for named-flag dry runs. Do not use `--allow-partial` for a finished book unless the user explicitly accepts a partial audio release.
- During audio download/link work, extend `notebooklm-audio-ledger.json` with a `downloadValidation` section that records status (`partial` or `complete`), asset folder, expected chapter count, downloaded/linked count, missing chapter numbers, audio filename/path, app `audio.src`, duration, codec/container, and whether the chapter is linked in `books.json`.
- Batch generation is the default whenever two or more chapter audios remain. Do not wait for one chapter to finish before submitting the next. Serial waiting is a recovery mode only when NotebookLM rejects additional queue items, the selected-source state cannot be verified, or the user explicitly requests serial generation; record the reason in the ledger before switching modes.
- Treat each batch submission as an auditable transaction: clear selections with `全選` twice and verify `0 個來源`; select the target and verify exactly `1 個來源` plus the target filename; set the exact `章節標誌`; close the customization dialog after clicking `生成`; then verify the total Studio work-item count (`ready cards + generating cards`) increased by exactly one before proceeding. Count only after the dialog closes because modal state can hide or alter accessible card names. If the count does not increment, re-scan once and retry the same chapter once; do not advance or mark it queued without proof of acceptance.
- Continue submitting the next verified chapter immediately after queue acceptance. At least every five submissions, and again after the last submission, assert `accepted queue items = ledger queued entries = submitted chapter count`, with no duplicated chapter number or prompt marker. A generating card is a valid queued work item; lack of a ready title is not a batch failure.
- Never infer chapter identity from card position, completion order, toast text, duration alone, or the newest file in Downloads. After any rename or meaningful Studio change, re-scan the card list and identify a completed card only through the matching `章節標誌` plus source filename in `查看提示詞和來源`; scope menu actions to that exact card using its current DOM/card relationship.
- Before each download, snapshot the existing Downloads filenames/paths. After clicking `下載` on the verified card, accept only a newly appearing file from the set difference. Do not choose a file only because it has the newest modification time, and do not treat a briefly stable size or a temporarily successful decode as download completion because a browser `.tmp` can pause at a valid packet boundary and continue growing.
- A download is complete only when the last decodable audio packet timestamp reaches the verified card duration within 2 seconds and a full `ffmpeg -xerror` decode succeeds. Then copy the file and repeat both checks on the copied destination. Run `ffprobe` on every completed asset and record actual duration, last-packet duration, codec, container, and full-decode result in the ledger. A mismatch, missing audio stream, wrong codec/container, duplicate file fingerprint where durations should differ, incomplete last-packet duration, or decode error requires re-downloading from the exact verified card before linking; never publish a mismatched or truncated asset.
- Final NotebookLM validation is a count-and-identity invariant, not a visual spot check. Confirm `TXT sources = NotebookLM sources = accepted queue items = completed cards = expected card titles = verified ledger entries = downloaded assets = linked chapters`; confirm no `正在生成語音摘要` remains, no duplicate/missing chapter number or marker exists, every asset passes metadata probing, last-packet duration, and full-decode checks, every `audio.src` maps to its chapter, the reader UI exposes a separate NotebookLM Podcast play/download entry, and every production audio URL returns HTTP 200 with a valid audio content type. Run `npm run validate:notebooklm-audio -- <slug> [production-base-url]` as the repeatable local/production audit and require `status: passed`; do not report completion while any equality or identity check fails.

Default metadata rules for new manuscripts:

- Infer `title` from the manuscript title or filename.
- Infer `subtitle`, `description`, and `genre` from the manuscript content when possible.
- Use `李詩民` as the default author unless the manuscript clearly states another author.
- Use `published` as the default status once the book has been fully parsed into chapters.
- Use `All` as the default rating.
- Use a stable lowercase kebab-case slug derived from the title; avoid changing an existing slug.
- Set `sourceUrl` to a local source reference. New pending sources start as `books/<filename>`; after import, move the source package or manuscript into `published-books/<filename>` and update `sourceUrl` to that completed source location unless there is a better canonical URL.

Chapter parsing rules:

- Prefer explicit headings such as `第 1 章`, `第1章`, `第 一 章`, `Chapter 1`, `序`, `前言`, `終章`, and similar book-section headings.
- For Markdown, preserve paragraph order and ignore horizontal-rule separators used only as visual dividers.
- Normalize Markdown / transcript line breaks into human-readable book paragraphs before publishing.
- Split long prose into readable paragraphs and merge excessive one-line transcript fragments into natural paragraphs.
- Remove manuscript-production artifacts and AI prompt residue, including lines that instruct an AI to write, rewrite, scan, output, preserve style, or generate the chapter, unless the passage is clearly part of a teaching example that the reader needs.
- Remove drafting notes such as "以下這版", "我直接用可授課、可錄音的版本來寫", "這一講的核心命題是" when they are scaffolding rather than reader-facing prose.
- Preserve actual reader-facing structure: chapter titles, section headings such as `一、...`, key concepts, examples, and intentional lists.
- Do not let source-file line breaks dictate final book paragraphs; the final reading experience should look like a polished book, not raw Markdown, prompt notes, or lecture draft fragments.
- Estimate reading time with the existing project convention: at least 2 minutes per chapter, based on approximate Chinese character count.

Operational workflow:

1. If the user provides a Google Drive source link, download the intended manuscript/package into `books/` first and verify the local file. Then inspect `books/`, identify new manuscripts or complete book ZIP packages, and state which files will be imported. Treat `published-books/` as completed-source archive, not as an import queue.
2. For ZIP packages, extract to `tmp/`, read the README/manifest, unpack nested chapter ZIPs when present, and identify the reader-facing chapter source files.
3. Parse the manuscript into the `Book` / `Chapter` schema used by `src/lib/books.ts`. If a ZIP package represents a clearly new title, append it as a new book; if it is a full replacement package for an existing title, update the existing book instead of adding a duplicate.
4. If the user asks to treat a package as a new book even when it resembles an existing title, assign a distinct title and stable slug rather than overwriting the existing book.
5. Add or update only the necessary assets under `public/books/<slug>/`.
6. Update `src/content/books.json` while preserving existing book entries.
7. Export the final chapters to `book-txt/<book title>/` as numbered `.txt` files.
8. Run the NotebookLM chapter audio workflow from the TXT exports by default, including ledger creation/update and final NotebookLM validation, unless the user explicitly excludes NotebookLM or asks for website-only publishing.
9. Download the validated chapter audio files into `public/books/<slug>/audio/`, run `npm run link:book-audio -- <slug>`, and verify chapter audio count equals chapter count in both `books.json` and the reader UI.
10. Move the completed source package or manuscript from `books/` to `published-books/` and update `sourceUrl` to the archived source path.
11. Run validation after changes: at minimum `npm run lint`; run `npm run build` when the import changes app behavior or page generation.
12. Commit and push the completed book update to the repository. A new book is not considered finished until the changes have been pushed.
13. Deploy the pushed version to production. A new book is not considered fully complete until the production deployment succeeds.
14. Report the new book title, slug, chapter count, TXT export folder, NotebookLM ledger path and validation result, audio asset folder and `books.json` audio-link validation result, app validation result, pushed commit, and production deployment URL.

Do not ask for confirmation before publishing a clearly new manuscript in `books/` unless required metadata is genuinely ambiguous or the file cannot be parsed safely.

## UI / Visual Asset Workflow

When the user requests interface polish, mobile improvements, cover updates, social sharing images, download/install icons, or other reusable visual rules, record the resulting rule in this file before considering the task complete.

Branding rules:

- The app's public heading, browser title, installed app name, and social sharing title should use `詩塾書院`.
- Mobile / PWA app icons should use the Chinese character `詩` as the core visual mark.

Visual quality rules:

- Book covers and major share images must be treated as high-quality designed assets, not simple placeholders.
- For new book covers, use AI image generation in the conversation first, then save and reuse the selected image under the appropriate `public/books/<slug>/` asset folder.
- Social sharing images should use a dedicated landscape asset when possible. Prefer `1200x630` for Open Graph / Twitter large-card images, and keep metadata dimensions aligned with the actual file.
- Once the book count grows beyond a small single-screen catalog, the home/library page should use a bookshelf model instead of one long one-page grid: include shelf navigation, horizontal shelf rows, a compact repeatable book item, and dedicated shelves for continuing, Podcast-ready books, curated categories, and the full archive.
- Mobile icon-only controls should remain compact and accessible, with `aria-label` and `title`, but may use layered styling, glow, texture, or secondary glyphs when the user asks for a more artistic look.
- After visual changes, verify the relevant mobile viewport with a browser check or Playwright screenshot when the app can run locally.

Narration rules:

- The public information architecture is Podcast-first: home-page book links open `/books/<slug>` as the primary single-screen Podcast experience, while the full text reader lives at `/books/<slug>/read` and is reached through a clear secondary `閱讀電子書` action.
- Podcast pages should fit their core controls within one viewport without whole-page scrolling on supported desktop and mobile sizes. Use compact episode selection, responsive density, and height-aware layouts instead of a long episode list; never hide the route back to the library or the electronic-book entry.
- Reader narration should continue across chapter boundaries by default once the user starts playback, stopping only at the end of the book or when the user manually stops it.
- NotebookLM chapter audio should be presented as a separate chapter Podcast experience, not as a silent replacement for the reader's original browser-native narration. When both exist, keep the original narration controls available and show a distinct NotebookLM Podcast panel or equivalent chapter-level link/play/download entry.
- NotebookLM Podcast is the primary listening experience when chapter audio exists. Its controls should be visually prioritized over browser-native narration, support at least `2x` playback speed, and default to continuous playback into the next chapter until the book ends or the user disables auto-advance/stops playback.
- Podcast UI must expose the listening context directly in the player surface: current episode/title, play state, progress, duration when known, current speed, auto-next state, next chapter context, and a download entry when an audio asset exists.
- Podcast listening progress must persist independently for each book, including the last audio chapter and playback timestamp. Save it during playback and whenever playback pauses, stops, the page is hidden, or the reader leaves; on a later visit, offer an explicit resume action from that timestamp without forcing autoplay.
- Podcast progress controls must be seekable rather than display-only. Provide an accessible touch/keyboard range control with elapsed and total time, and keep Media Session seek actions aligned with the same saved position when supported.
- Podcast playback speed must remain unchanged across automatic and manual episode transitions. Apply the selected value to both `defaultPlaybackRate` and `playbackRate` whenever an audio source loads or playback starts, and keep an end-to-end auto-next regression check.
- After adding or changing Podcast UI, run a mobile viewport browser check or Playwright screenshot and verify Podcast controls, chapter controls, and narration controls do not overlap. If a fixed mobile control bar covers Podcast content, prefer an in-flow mobile layout for the affected controls.
- For browser-native `speechSynthesis`, background / lock-screen support is best-effort only: use Media Session metadata/actions and Screen Wake Lock when available, but do not claim guaranteed lock-screen playback unless narration is backed by real audio files or an audio streaming TTS pipeline.

Reading progress rules:

- Each book must keep an independent reading progress record keyed by its stable slug.
- Continue-reading should restore the reader to the last meaningful position inside the book, including chapter, paragraph, and paragraph-relative offset when available, not only the start of the chapter.

Completion rules:

- For any task that changes app code, public assets, metadata, or project workflow rules, run the appropriate validation, commit the relevant files, push the branch, and deploy to production.
- A task is not considered complete until the pushed commit and production deployment have succeeded.
- When a user adds a new repeatable preference or workflow requirement, update `AGENTS.md` as part of the same task.
- The user has granted standing authorization for this repository to commit validated task-relevant changes, push them, and deploy directly to production without pausing for separate commit, push, or deployment confirmations. Continue to preserve unrelated workspace changes and keep destructive, payment, credential, account, and external-submission actions behind their existing confirmation requirements.
