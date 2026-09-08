# 詩塾書院

這是一個 Next.js 數位書院。首頁書架以逐章 Podcast 為主要入口，另提供完整電子書閱讀、獨立進度保存、字級調整、PWA 安裝與分享預覽。

## First Book

- 書名：數量級躍升：AI 時代的多面人生與自由之路
- 作者：李詩民
- 來源：Google Drive `.docx`
- 章節與音訊狀態以 `src/content/books.json` 為準。

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run test:book-write-safety
```

## 安全匯入與 TXT 匯出

`import:book` 現在是統一入口，支援 Markdown、DOCX 與已解壓套件；不再讀取固定 `tmp/book.docx` 或重建只有第一本書的書庫。ZIP 仍須依 `AGENTS.md` 先放入 `books/`，在 `tmp/` 解壓並檢查 README／manifest。

以下命令預設只解析、驗證並顯示差異，不寫入檔案：

```bash
npm run import:book -- --manuscript books/new-book.md --source books/new-book.md --slug new-book
npm run import:book -- --manuscript books/new-book.docx --source books/new-book.docx --slug new-book --title "新書名稱"
npm run import:book -- --package tmp/new-book --source books/new-book.zip --slug new-book
npm run export:book-txt -- new-book
```

檢視結果後，使用相同參數加上 `--apply` 才會寫入。既有書籍須另外明確指定 `--replace-existing`；id、slug、書名必須相同。章節身份、順序、標題與正文不變時保留原音訊；已有音訊而章節變動時會停止，要求先核對來源及音訊更新。直接呼叫三個格式匯入器也採用同一安全寫入規則。

TXT 匯出使用 `.book-txt-manifest.json` 記錄受管理章節及 SHA-256，只更新或移除清單內且尚未被手動修改的 TXT。舊 TXT 若與目標內容完全相同，可建立管理清單；不相同則停止供人工核對。音訊帳本、其他 JSON 與使用者檔案會保留。已有音訊或 NotebookLM 帳本時，不可直接改變來源 TXT。

每次實際寫入前會在 `tmp/book-write-backups/<transaction-id>/` 保留原檔及 `transaction.json`，並使用專案共用寫入鎖。可捕捉的寫入失敗會回復已修改的檔案；強制終止或回復失敗會留下鎖／交易證據，需先檢查，不可直接刪鎖重跑。這些備份仍在本機 `tmp/`，不是外部災難備份。

預設專案根目錄由腳本位置決定；從外部工作目錄呼叫也相同。隔離測試或明確操作其他 checkout 可使用 `--root <project-dir>`。這些命令只處理本機書籍資料／TXT；完整上架仍須完成 NotebookLM、Blob、來源歸檔及正式部署流程。

`npm run normalize:books` 會將 `src/content/books.json` 內的書籍內容整理成人類閱讀版：合併過碎的 Markdown / 講稿換行、清理生成提示語與製作痕跡、保留章節與小標，並重新計算章節摘要與閱讀時間。新書上架後應先執行此整理，再檢查閱讀器畫面。

## Content Model

- `Book`: 書籍資料、封面、作者、分類、章節列表
- `Chapter`: 章節標題、摘要、閱讀時間、段落
- `src/content/books.json`: 書籍內容資料來源
- `/books/[bookId]`: Podcast 路由
- `/books/[bookId]/read`: 完整電子書閱讀路由

## Deployment

部署前確認：

```bash
npm run lint
npm run test:book-write-safety
npm run build
```

音訊或播放器變更另需依 `AGENTS.md` 執行 `validate:notebooklm-audio`（含正式環境 remote-seek）及 `verify:podcast-ux`。推送後優先等待既有 Vercel Git 整合部署，避免重複觸發。
