# 本輪下載與恢復試行

24 章使用同一 NotebookLM notebook、同一持續 Node/Chrome binding、所選 skill 的原生下載 controller。每次先使用 resume coordinator 分類已完成章節；只依完整媒體證據略過。

每章從現行 DOM 找到 ledger 已核對卡片，重開「查看提示詞和來源」核對章節標誌與唯一來源，關閉視窗後讀回 DOM，再以精確卡片的「下載」選單鍵盤 Enter 觸發。下載前保存整個 Downloads 檔名集合。Controller 的檔案觀測忽略 `.tmp` 與 `.crdownload`，只接受集合差異的完成檔名；不以修改時間或短暫大小穩定判定完成。

同一本書重用唯一 controller，串行處理；每次 browser call 完成一至三章，每章均完整 await。現有 skill coordinator 完成當章並重新分類為 `complete-local` 後，本輪以 `VALIDATED_CHUNK_YIELD` 明確交出控制權。這是有意的執行邊界，保留 coordinator 原始 run audit；不是下載成功的替代證據。最後一章產生完整 `resume-complete`。下一段重新規劃並略過已證實完成的章節。

`validation_worker.mjs` 僅處理本機檔案與媒體，不控制瀏覽器。它以既有專案 `createValidatedDownloadStore` 讀取完成檔，檢查實際容器、codec、時長、最後音訊封包、完整 FFmpeg 解碼與 SHA；复制後重複驗證，寫入同一 ledger。tmp request/response 配對讓 browser call 不需載入受限的 Node process module。worker 已在完成後停止。

第一章曾收到消失的 `.tmp` 與未完成 `.crdownload`。保留兩次 audit，待精確完成檔名出現後恢復驗證，沒有第三次重傳。第八章來源對話框滑鼠關閉未接受；讀回仍開啟且目標新檔不存在，鍵盤關閉與 DOM 確認後才下載。過去一次未 await 的跨 call UI 執行失敗；本輪改為每段完整 await，第二章未提交時才恢復。

相容性試行曾嘗試在 browser REPL 載入專案 resume module；受限 process module 無法載入，已回復根目錄 `scripts/resume-notebooklm-audio.mjs` 原版。Chrome internal downloads 頁被工具拒絕，未繞過；最後只用已授權 NotebookLM HTTPS 頁與本機下載檔案完成驗收。

結果：24/24 身分及本機媒體驗證通過；整批轉檔後仍逐檔通過並保持唯一 SHA。以上是本書可回退試行，尚未升級全局或 skill 標準。建議後續加入明確的 coordinator `maxChapters`/成功 checkpoint 回傳，避免以有意 yield exception 表達正常分段；需使用者採用與回歸驗證後才變更共用流程。
