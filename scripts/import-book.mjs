import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseOptions, writeOptions } from "./lib/book-write-safety.mjs";

const args = parseOptions();
const usage = `Usage: npm run import:book -- --manuscript <file.md|file.docx> --source <source-path> --slug <slug> [--apply]
       npm run import:book -- --package <extracted-package-dir> --source <source-path> --slug <slug> [--apply]
Default: read-only preview. Existing titles require --replace-existing. ZIP packages must be inspected and extracted into tmp first.
Optional: --root <project-dir>, --title, --subtitle, --description, --author, --genre.`;
try {
  writeOptions(args);
  if (args.help) { console.log(usage); }
  else {
    if (Boolean(args.package) === Boolean(args.manuscript)) throw new Error(`source：請指定一種書稿來源\n${usage}`);
    const extension = typeof args.manuscript === "string" ? path.extname(args.manuscript).toLowerCase() : "";
    const script = args.package ? "import-book-package.mjs" : extension === ".md" ? "import-markdown-book.mjs"
      : extension === ".docx" ? "import-docx-book.mjs" : null;
    if (!script) throw new Error("manuscript：目前支援 .md、.docx 或已解壓書籍套件");
    const result = spawnSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url)), ...process.argv.slice(2)], { stdio: "inherit" });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
