# 《讓 AI 看懂一家公司》發布收據

作者李詩民；slug：`let-ai-understand-a-company`。16章正式正文、16集NotebookLM Podcast，合計約4小時35分，音訊173,279,555 bytes。封面已突出「本體入門」。

- [正式Podcast](https://jinren-protocol.vercel.app/books/let-ai-understand-a-company)
- [電子書](https://jinren-protocol.vercel.app/books/let-ai-understand-a-company/read)
- [NotebookLM筆記本](https://notebook.google.com/notebook/20c7a48e-8e5e-492d-8be4-400e856b088e)

## 可編輯來源與出版檔案

正式來源仍是`book_project/02_chapters/chapter_XX/chapter_XX_main.md`；全書在`book_project/01_master/full_book.md`。逐章口播稿、演講、投影片提綱及課程文字也保留，NotebookLM音訊直接由正式章稿TXT生成，不聲稱逐字朗讀另備的口播稿。

`book_project/05_exports/`有17個DOCX；259頁原生Word驗版及來源／輸出SHA見docx_manifest.json。

出版包：`../../published-books/讓AI看懂一家公司_出版包_v1.0.3.zip`，5,948,668 bytes，SHA-256 `5b1658bc00de56248bdb75aedc646aef1ee7677bc44dedcd6c0b0d6b81281f1a`。201檔及16章ZIP已解壓比對。這是文字出版包，Podcast由平台逐集下載，沒有宣稱ZIP內含音訊。

TXT與ledger：`../../book-txt/讓 AI 看懂一家公司/`。每章`audio.src`均為公開Vercel Blob網址。本機staging在正式驗證後移至`../../tmp/ontology-validated-audio-release/`，未提交原始音訊二進位檔；原始下載與轉檔備份另保留在tmp內。

## 發布及驗收

內容commit `41259eb58d35dfcfb5419f438155da372bc92813`已推送origin/main。Git自動正式部署`dpl_J5YiFGxBFGHvp7SmvFKr3AcZ5hQb`為READY，沒有重複CLI部署。後續提交僅補交付狀態及驗收證據，最終提交見git log。

lint／build通過（50頁）；交接檢查及22 tests通過。36次連續接受交易＝16集正式音訊＋20份保留未採用候選。來源、標誌、卡片、下載身分、全篇自動逐字稿與原始SHA互相對應，壓縮前後SHA鏈一致。

十六集時長、最後封包、完整解碼、唯一指紋；Blob固定路徑、HTTP 200音訊類型、精確Content-Length及逐集120秒遠端跳轉解碼全部通過。移出本機staging後，`validate:notebooklm-audio`仍為`passed`及`productionRemoteSeekChecked: true`；resume coordinator為16個`complete-blob`。

指定本書正式URL的`verify:podcast-ux`通過六尺寸：1440×900、1366×768、768×1024、390×844、360×640、844×390。控制項不重疊；90秒續聽、2.5x自動換集保速、手動換集、鍵盤拖曳、電子書及無音訊頁面回歸通過。Chrome另以2x播放確認時間前進、readyState=4、media error=null；測試後暫停。

證據在`../06_quality/run_20260928_round18/`：generation_release_audit.json、transcode_manifest.json、blob_manifest.json、production_audio_validation.json、production_podcast_ux.json、production_release.json及production_mobile.png／production_desktop.png。

## 驗收界線

代理書稿自審及全篇自動逐字稿比對，不是作者或獨立專家審稿，也不是人耳逐句試聽。手機尺寸瀏覽器測試不是實體手機測試。NotebookLM仍有生成式比喻與較強口語；名稱、編號、年份的自動轉錄可能有誤。來源閱讀層次、未複現論文與未商業租戶實測的限制均保留。

## 優化試行

本輪以音訊SHA綁定全篇自動逐字稿，保留未採用候選，驗證16集所選版本未混入20份淘汰音訊；它不替代人工聽測。函式區域內重新讀取ledger及分段驗證解決了舊閉包狀態回寫問題，恢復依據是既存卡片、接受交易與檔案雜湊。失敗helper沒有升級為固定流程。

先前StrConv轉換樣本失敗，未寫入正式正文，保留逐處人工修訂路徑。建議把「逐字稿與音檔版本綁定」納入往後音訊模板，待使用者另行同意；本輪未修改全域記憶或技能。
