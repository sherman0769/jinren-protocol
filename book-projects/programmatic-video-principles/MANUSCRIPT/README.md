# 正式書稿輸出位置

本交接包沒有把完整書稿假裝寫好。Codex 由 `chapters/00_preface.md`、`chapters/CH01.md`、`chapters/CH02.md`、`chapters/CH03.md` 開始撰寫；完成審查前標 draft。

第 4 章校準樣章在 `SAMPLE_CHAPTER/`，可作語氣和密度參考，不能未審查就列為正式完稿。後續每章需有正文、圖解、例子、題目答案、來源及對應審查紀錄。

正式章首使用 JSON 中介資料另存 `CHxx.meta.json`，包含 chapter_id、status、new_terms、example_paths、source_ids、review_paths、updated_date。避免為了自動檢查而把主文寫成機器表格。
