# 詩塾書院

這是一個 Next.js 數位書院閱讀器。首頁顯示書籍，進入後可依章節閱讀長文內容，支援目錄、閱讀進度保存、字級調整、PWA 安裝與分享預覽。

## First Book

- 書名：數量級躍升：AI 時代的多面人生與自由之路
- 作者：李詩民
- 來源：Google Drive `.docx`
- 狀態：已匯入為 23 章、約 11.4 萬字

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run import:book
npm run normalize:books
```

`npm run import:book` 會從 `tmp/book.docx` 重新解析書稿並更新 `src/content/books.json`。

`npm run normalize:books` 會將 `src/content/books.json` 內的書籍內容整理成人類閱讀版：合併過碎的 Markdown / 講稿換行、清理生成提示語與製作痕跡、保留章節與小標，並重新計算章節摘要與閱讀時間。新書上架後應先執行此整理，再檢查閱讀器畫面。

## Content Model

- `Book`: 書籍資料、封面、作者、分類、章節列表
- `Chapter`: 章節標題、摘要、閱讀時間、段落
- `src/content/books.json`: 書籍內容資料來源
- `/books/[bookId]`: 書籍閱讀路由

## Deployment

部署前確認：

```bash
npm run lint
npm run build
```
