<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Book Intake / New Book Publishing

The user will place future manuscripts in the root `books/` folder. When asked to check, import, publish, or "上架" books, first inspect `books/` and compare its files with the existing entries in `src/content/books.json`. Treat any supported manuscript that is not already represented in `books.json` as a new book to publish.

Supported source formats, in preferred order:

- Markdown: `.md`
- Word: `.docx`
- Plain text: `.txt`
- PDF only when the text layer is extractable or OCR has already been done

Use the same publishing model as the first book:

- The app's canonical book data lives in `src/content/books.json`.
- Preserve all existing books; append new books instead of replacing the array.
- Each book needs `id`, `slug`, `title`, `subtitle`, `author`, `description`, `status`, `genre`, `rating`, `cover`, `ogImage`, `sourceUrl`, and `chapters`.
- Each chapter needs `id`, `number`, `title`, `summary`, `minutes`, and `paragraphs`.
- Store cover assets under `public/books/<slug>/cover.png`, and point both `cover` and `ogImage` to `/books/<slug>/cover.png`.

Default metadata rules for new manuscripts:

- Infer `title` from the manuscript title or filename.
- Infer `subtitle`, `description`, and `genre` from the manuscript content when possible.
- Use `李詩民` as the default author unless the manuscript clearly states another author.
- Use `published` as the default status once the book has been fully parsed into chapters.
- Use `All` as the default rating.
- Use a stable lowercase kebab-case slug derived from the title; avoid changing an existing slug.
- Set `sourceUrl` to a local source reference such as `books/<filename>` unless there is a better canonical URL.

Chapter parsing rules:

- Prefer explicit headings such as `第 1 章`, `第1章`, `第 一 章`, `Chapter 1`, `序`, `前言`, `終章`, and similar book-section headings.
- For Markdown, preserve paragraph order and ignore horizontal-rule separators used only as visual dividers.
- Split long prose into readable paragraphs, but do not rewrite the author's text unless the user explicitly asks for editing.
- Estimate reading time with the existing project convention: at least 2 minutes per chapter, based on approximate Chinese character count.

Operational workflow:

1. Inspect `books/`, identify new manuscripts, and state which files will be imported.
2. Parse the manuscript into the `Book` / `Chapter` schema used by `src/lib/books.ts`.
3. Add or update only the necessary assets under `public/books/<slug>/`.
4. Update `src/content/books.json` while preserving existing book entries.
5. Run validation after changes: at minimum `npm run lint`; run `npm run build` when the import changes app behavior or page generation.
6. Commit and push the completed book update to the repository. A new book is not considered finished until the changes have been pushed.
7. Deploy the pushed version to production. A new book is not considered fully complete until the production deployment succeeds.
8. Report the new book title, slug, chapter count, validation result, pushed commit, and production deployment URL.

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

Completion rules:

- For any task that changes app code, public assets, metadata, or project workflow rules, run the appropriate validation, commit the relevant files, push the branch, and deploy to production.
- A task is not considered complete until the pushed commit and production deployment have succeeded.
- When a user adds a new repeatable preference or workflow requirement, update `AGENTS.md` as part of the same task.
