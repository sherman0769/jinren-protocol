# 《讓 AI 看懂一家公司》Codex 交接包

**活動工作副本更新：2026-09-28／1.15.0。十六章完整正文與代理自審完成；Podcast 稿 16／16、音訊 0。next_task=Q-01，全書已組裝，續衍生、出版與詩塾書院手機 Podcast 驗收。**

從 [專案狀態](00_project/project_status.md) 續作。先讀 [第 1 章正文](book_project/02_chapters/chapter_01/chapter_01_main.md) 與 [第 2 章正文](book_project/02_chapters/chapter_02/chapter_02_main.md)。下列內容描述原始交接基準；沒有產生新的出版 ZIP、DOCX 或完整節目。

版本：1.0.0｜作者：李詩民｜查閱與交接基準：2026-09-28。
副標：從零理解本體，走向可運用、可教學的企業 AI。

**原始 1.0.0 ZIP 完成的是書籍專案交接；目前活動副本的進度以上方狀態及 project_state.json 為準。全書與完整 Podcast 尚未完成。**

已完成定位、Book Bible、四部十六章詳細規格、82 項中英術語、首輪 26 筆來源及正反研究任務、口播規格與語氣樣本、可計算虛構案例、教學驗收、Codex 指令與本機驗證工具。

編輯預算為約 84,000 正文可見字元；一章衍生一集，預設約 20–25 分鐘。兩者是本次編輯基準，不是假稱使用者已指定最低字數或已製成音訊。

## 開始使用

將 ZIP 解壓到新的專案資料夾，讓 Codex 開啟此資料夾，再貼上 `05_execution/CODEX_START_PROMPT.md` 的指令。先讀 `START_HERE.md`。單檔傳遞可使用 `CODEX_HANDOFF.md`；它不是取代完整案例、JSON 與驗證腳本的可執行 ZIP。

本機驗證只需 Python 3.10 以上的標準函式庫，沒有模型 API、金鑰或付費依賴：

```sh
python -B scripts/validate_handoff.py
python -B -m unittest discover -s tests -v
```

`python -B scripts/validate_manuscript.py` 現已通過結構檢查（不代表內容或出版驗收），用來避免把交接規格當成書。

## 分項入口

| 路徑 | 內容 |
|---|---|
| `00_project/` | 核心設定、決策、術語、狀態 |
| `01_plan/` | 認知樹、十六章規格與執行計畫 |
| `02_research/` | 來源、概念校正、正反主張與待研究任務 |
| `03_podcast/` | 聲音方向、口播範本、語氣樣本、朗讀詞彙 |
| `04_cases/` | 虛構資料、能力問題、工具契約、遷移與教學驗收 |
| `05_execution/` | 啟動指令、任務板、寫作協作、出版驗收 |
| `06_quality/` | 本次交接驗證、清單與校驗碼 |
| `scripts/`、`tests/` | 可在本機執行的有限檔案與資料檢查 |

來源只附合法公開連結、摘要式研究筆記與讀取範圍，不打包他人論文全文。未查證的舊對話說法不直接當引用。正式寫作前仍有研究精讀與產品狀態複核工作。
