# 近人協議

《近人協議》是一個 AI 文明後題材的原創縱向網漫網站。首版包含完整 20 集第一季、200 張分鏡資產、播放器式閱讀器、PWA 安裝圖示與社群分享圖。

## Features

- Next.js App Router + TypeScript + Tailwind CSS
- 手機優先縱向 webtoon 閱讀
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

## Content

- 主題：AI 文明後，人與 AI 逐漸失去界線
- 標題：《近人協議》
- 語言：繁體中文
- 分級：13+ 科幻劇情
- 美術方向：電影概念感，冷調城市、霓虹、寫實比例、強光影

## Deployment

這是靜態可預渲染的 Next.js 專案，可直接部署到 Vercel。部署前請確認：

```bash
npm run lint
npm run build
```
