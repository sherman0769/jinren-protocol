<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Book Intake / New Book Publishing

The user will place future manuscripts in the root `books/` folder, or provide a Google Drive link to a manuscript/package that should be downloaded into `books/` first. When asked to check, import, publish, or "上架" books, first inspect `books/` and compare its files with the existing entries in `src/content/books.json`. Treat any supported manuscript that is not already represented in `books.json` as a new book to publish.

Google Drive intake model:

- When the user provides a Google Drive link as the source for a new book, use the Google Drive connector when available to access and download the linked file or folder contents. If connector access is not available or the link is not shared correctly, ask the user to adjust sharing or provide access before proceeding.
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
- When using `book-txt/<book title>/` chapter files as NotebookLM sources for podcast/audio study, treat each numbered `.txt` chapter as one source and one expected audio artifact.
- Before opening NotebookLM, run a TXT chapter preflight: verify the chapter count, two-digit ordering, no duplicate chapter numbers, no missing chapter numbers, no empty files, and that every filename stem is the intended final audio title.
- Create or update `book-txt/<book title>/notebooklm-audio-ledger.json` during audio work. Track notebook URL, chapter number, source filename, prompt marker, selected source count, generation state, prompt/source verification state, final audio card title, and completion timestamp.
- Use exactly one NotebookLM notebook per book. Upload all chapter TXT sources into that book notebook; do not create one notebook per chapter.
- Before generating each chapter audio, clear source selections by clicking `全選` twice, verify the Studio area shows `0 個來源`, then select only the target chapter and verify the UI shows `1 個來源`.
- Use NotebookLM `深入探索` Audio Overview for study-quality chapter audio; do not switch to short/summary formats unless the user explicitly prioritizes speed over content depth.
- Before generation, use the `自訂語音摘要` prompt and put a first-line marker such as `章節標誌：01_Chapter Title`, so the prompt/source view beside the generated audio can be used as a second verification mark.
- After generation, rename the NotebookLM audio card to the chapter filename stem, for example `01_Chapter Title`, and verify `查看提示詞和來源` contains the matching marker/source.
- Unless the user explicitly excludes ebook audio, download every completed chapter audio file and store it under `public/books/<slug>/audio/` with a two-digit chapter-number prefix matching the TXT/audio title, for example `01_Chapter Title.mp3`.
- After audio files are stored, run `npm run link:book-audio -- <slug>` to write chapter `audio.src` entries into `src/content/books.json`; use `node scripts/link-book-audio.mjs --slug <slug> --dry-run` for named-flag dry runs. Do not use `--allow-partial` for a finished book unless the user explicitly accepts a partial audio release.
- For faster batch work, queue multiple chapter audio generations in the same notebook after each one has been individually selected and marked. Do not infer chapter identity from completion order.
- Final NotebookLM validation must confirm completed audio count equals chapter count, no `正在生成語音摘要` remains, every `NN_Chapter Title` audio card title exists, every completed card has a matching prompt marker/source check in the ledger, downloaded audio count equals chapter count, `books.json` has one `audio.src` per chapter, and NotebookLM source count equals TXT chapter count.

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
- Mobile icon-only controls should remain compact and accessible, with `aria-label` and `title`, but may use layered styling, glow, texture, or secondary glyphs when the user asks for a more artistic look.
- After visual changes, verify the relevant mobile viewport with a browser check or Playwright screenshot when the app can run locally.

Narration rules:

- Reader narration should continue across chapter boundaries by default once the user starts playback, stopping only at the end of the book or when the user manually stops it.
- NotebookLM chapter audio should be presented as a separate chapter Podcast experience, not as a silent replacement for the reader's original browser-native narration. When both exist, keep the original narration controls available and show a distinct NotebookLM Podcast panel or equivalent chapter-level link/play/download entry.
- For browser-native `speechSynthesis`, background / lock-screen support is best-effort only: use Media Session metadata/actions and Screen Wake Lock when available, but do not claim guaranteed lock-screen playback unless narration is backed by real audio files or an audio streaming TTS pipeline.

Reading progress rules:

- Each book must keep an independent reading progress record keyed by its stable slug.
- Continue-reading should restore the reader to the last meaningful position inside the book, including chapter, paragraph, and paragraph-relative offset when available, not only the start of the chapter.

Completion rules:

- For any task that changes app code, public assets, metadata, or project workflow rules, run the appropriate validation, commit the relevant files, push the branch, and deploy to production.
- A task is not considered complete until the pushed commit and production deployment have succeeded.
- When a user adds a new repeatable preference or workflow requirement, update `AGENTS.md` as part of the same task.
