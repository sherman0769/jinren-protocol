# AI 時代的學習：Facebook 分享包

貼文：`post.txt`。文案以李詩民第一人稱分享一直在使用的學習方式，包含少量技術細節，不附完整網址。2026-10-05 使用者另行授權「發文到FB」後，已於李詩民個人動態時報公開發布。

發布連結：https://www.facebook.com/li.shi.min.823327/posts/pfbid02hyAfeYd7FAfMkM99UBgCoSUcf8tkJtcenN7YcsVWNkYywNNP15Cqzs7PeUYdf6Z2l

`facebook-publication.json` 保存單次上傳／發布、來源身份、UI 恢復與發布後全文／五張照片驗證；`facebook-publication.lock` 已完成並保留，避免誤重發。`facebook-published.jpg` 為發布成功證據，屬紀錄圖片，未附加到 Facebook。

## 建議圖片順序與圖說

1. `01_book-cover.png`：以《程式如何變成影片》作為一個學習成果的例子。原封面直接複製，未重製或編修。
2. `02_app-library.jpg`：自己的學習書庫，逐步累積成可回頭閱讀、聆聽的知識系統。
3. `03_app-diagram.jpg`：從圖解到數值：動畫回彈如何計算，時間步長如何影響誤差。
4. `04_app-verification.jpg`：從實作到驗證：數值重現、媒體解碼、觀看與聽審，各自需要證據。
5. `05_app-podcast-mobile.jpg`：同一主題也能逐章聆聽，支援倍速、連播與下載。

前四張適合建立問題與方法的脈絡，第五張補上手機聆聽。圖片均為原書封或實際正式站 APP 截圖，沒有生成模擬 UI、文字覆蓋或合成。

## 來源與驗收

- 原封面：`public/books/how-code-becomes-film/cover.png`。
- 書庫：`https://jinren-protocol.vercel.app/`，畫面顯示 24 本書。
- 閱讀器：`https://jinren-protocol.vercel.app/books/how-code-becomes-film/read`；第 12、20 章。
- Podcast：`https://jinren-protocol.vercel.app/books/how-code-becomes-film`；第 12 集，截圖時處於準備播放、2x、自動下一集開啟。
- 手機截圖使用 390×844 的瀏覽器響應式檢查，並非手機實體機截圖。擷取後已恢復暫時視窗尺寸與播放器選擇。
- 截圖保存頁面原有文字。文案不宣稱每本既有藏書都有完整 Podcast，也不宣稱 AI 回答或技術測試等於人類內容驗收。
- 已檢查截圖章節與圖解一致、控制項可讀、無私人帳號資訊。既有封面的書頁／螢幕內容位於觀看側，未發現正面文字穿透背面的矛盾；本輪沒有新生成人物。
- 每張圖片的尺寸、位元組與 SHA-256 見 `manifest.json`。

## 本輪整理與後續建議

本輪以「成果 → 累積 → 理解 → 驗證 → 重複吸收」編號排列 5 張原始圖片；圖片身份與文案零完整網址檢查通過，原素材保持不變，未有失敗試行或回復動作。

下一次可選一個參數變更，分享它如何改變畫面或數值，讓讀者更容易理解如何動手學習。本輪排序先保留在此分享包，沒有升級為全局圖像模板。
