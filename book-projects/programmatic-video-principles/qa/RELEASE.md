# 《程式如何變成影片》出版驗收

2026-10-05；作者李詩民；slug `how-code-becomes-film`。

本輪依交接章綱實際撰寫 24 章，主稿約 29,638 個中文字；網站 707 段、24 張原理图。24 份 UTF-8 TXT 保存於母專案 `book-txt/程式如何變成影片/`。封面與可下載原稿／範例包位於 `public/books/how-code-becomes-film/`。原交接 ZIP 保留並歸檔，SHA-256 與來源一致；其他 23 本書及頂層目錄資料保持一致。

## 已通過

- 24 章數值推導實測、34 項原理單元測試；模型逐章技術及初學者角色自審。原案例歷史測試不算本輪測試。
- 8 秒與 60 秒教學重建影片實際編碼及完整解碼；四幕代表幀檢視。不宣稱取得原片完整引擎或 GPU 效能。
- 24 章 TXT 連號、非空、來源 SHA 與 canonical data；原圖及手機完成畫面兩次視覺檢查。
- 單一 NotebookLM notebook：24 TXT 來源、24 次 +1 排隊受理、24 完成卡片、24 標誌與唯一來源核對；無仍在生成項目。
- 24 完整下載：codec/容器/時長、末封包、全檔解碼、複製後重複驗證、唯一 SHA。
- 整批 80 kbps AAC、單聲道、M4A faststart，原始 841,818,022 bytes → 274,335,296 bytes，減少 67.41%。原始檔仍在 Downloads 與 tmp 備份；這不代表任何 Git 歷史縮減。
- 24 public Blob deterministic pathnames、SDK metadata、HTTP HEAD 精確長度及 120 秒處五秒遠端解碼；整個 books 儲存區 154 個路徑完全對應。
- 24 絕對 Blob `audio.src`；六種尺寸 Podcast 版面、90 秒進度恢復、2.5 倍速手動／自動換章保留、電子書入口及無音訊書籍 fallback。
- 最新 lint、TypeScript 與 production build：52 static pages。public 本機音訊仍保留至正式驗證完成，不納入此新書的 Git 發布提交。

## 正式部署

待本輪 Git push 的 Vercel production READY 與每章 production HEAD/remote seek。此檔會在驗收後更新，不把本機 build 或 Blob 上傳當正式部署。

## 範圍與優化

真人試讀、逐章完整聽審與原案例完整原始碼審查未完成；模型自審不等於獨立專家驗收。內容為完整精簡版，交接包的 6.5–9 萬字為編輯提案，未用重複文字填充。

本輪分段下載、完成檔名差異、既有 CLI 媒體驗證 worker 的試行已通過 24 章；細節與失敗回退見 `DOWNLOAD_EXECUTION.md`。受限 module 相容性試行失敗後，根目錄 resume module 已恢復原版。第 21 章 Blob 原上傳停滯，停止本輪程序後權威讀回確認缺項，再重用其他 23 個資產補齊；未增加第二組路徑。

建議後續將成功 checkpoint 與 `maxChapters` 加到 coordinator 的正式 API，讓正常分段不需 yield exception；需使用者採用決定及回歸驗證後才納入共用標準。現階段只保留本書整合與試行證據。
