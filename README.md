# 近人協議

這是一個原創漫畫閱讀器網站。首頁是書庫，可以選擇作品；進入書籍後使用縱向 webtoon 閱讀器閱讀章節。首本作品保留《近人協議》，包含 20 集第一季、200 張分鏡資產、播放器式閱讀器、PWA 安裝圖示與社群分享圖。

## Features

- Next.js App Router + TypeScript + Tailwind CSS
- 首頁書庫，可持續新增由我們建立的漫畫作品
- 書籍路由：`/books/[bookId]`
- 手機優先縱向 webtoon 閱讀器
- 播放/暫停、上一格/下一格、章節切換與閱讀進度保存
- 20 集完整故事資料與本地分鏡資產
- PWA manifest、service worker、install icon、Apple touch icon
- Open Graph / Twitter 分享預覽圖

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run assets
```

`npm run assets` 會重新產生 `public/comic/season-01/` 的 200 張分鏡 SVG，以及 `public/icons/` 的 PWA 圖示。

## Content Model

- `Book`: 書籍資料、封面、分享圖、角色表、章節列表
- `Episode`: 章節資料、摘要、封面、分鏡列表
- `Panel`: 圖像、文字節拍、對白、播放器停留時間

## First Book

- 標題：《近人協議》
- 主題：AI 文明後，人與 AI 逐漸失去界線
- 語言：繁體中文
- 分級：13+ 科幻劇情
- 美術方向：電影概念感，冷調城市、霓虹、寫實比例、強光影

## Deployment

這是靜態可預渲染的 Next.js 專案，可直接部署到 Vercel。部署前請確認：

```bash
npm run lint
npm run build
```
