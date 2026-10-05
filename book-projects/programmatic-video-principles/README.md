# 程式如何變成影片

**從一個畫面中的小點，到能指揮 AI 完成可驗收影片。**

2026-10-05 母專案出版整合：24 章正式主稿、24 張原理圖、24 份 TXT 及 NotebookLM 音訊已建立。最新出版證據見 [整合紀錄](INTEGRATION.md)、`qa/RELEASE.md` 與 `work.json`。原交接說明及 `qa/HANDOFF_QA.md` 保留為當時證據，不代表本輪現況。真人試讀、完整聽審與原案例完整原始碼審查尚未完成。

閱讀入口：[START_HERE.html](START_HERE.html) · [中文開始頁](00_START_HERE.md) · [Codex 主指令](CODEX_INSTRUCTIONS/MASTER_PROMPT.md)

這份專案保存本書定位、使用者原意、完整章綱、先後依賴、逐章寫作任務、中英術語卡、原理校正、範例與測試、案例證據、研究來源及接續狀態。交接不依賴 Codex 看得到原聊天。

## 目錄功能

| 位置 | 內容 |
|---|---|
| `AGENTS.md`、`book.json`、`work.json` | 接手規約、書籍設定、已完成／未完成狀態 |
| `CONTEXT/` | 從影片到原理書的決策脈絡、禁止跑偏事項 |
| `OUTLINE/` | 六部二十四章、每章問題、產出、驗收及先後順序 |
| `GLOSSARY/` | 中文優先術語卡、同義詞與易混淆名詞 |
| `STYLE_GUIDE/` | 語氣、數學、程式、圖解與認知負擔規則 |
| `CASE_STUDY/` | 既有影片的有限證據、截圖、核對與重建規格 |
| `CODEX_INSTRUCTIONS/` | 主編、逐章撰稿、技術審查、初學者審查與接續指令 |
| `SAMPLE_CHAPTER/` | 第 4 章校準樣章，不冒充全書完成 |
| `examples/`、`tests/` | 可執行最小原理範例、示範影片、離線測試 |
| `RESEARCH/` | 官方來源登錄、事實與推論分流、版本查核方式 |
| `MANUSCRIPT/` | 本輪 24 章正式主稿與合併稿；校準樣章另留原處 |
| `scripts/`、`qa/` | 打包與檢核工具、當次實測紀錄 |

## 交付與出版邊界

這不是商業出版品，也沒有擅自指定出版社、ISBN、價格或出版日期。暫定篇幅與章數是編輯規劃，不是使用者已批准的固定頁數。最後格式以可維護的 Markdown 主稿為準；HTML／PDF／DOCX／EPUB 是否輸出，依後續明確需求與可用工具處理，不讓排版工作取代內容完成。

不得把本包測試通過說成原電影重驗 70 項通過，或說成整本書已被人類讀者驗收。權利與來源見 `RIGHTS_AND_PROVENANCE.md`。

## 同步離線閱讀頁面

修改目錄、術語或樣章後，可另行安裝 `requirements-docs.txt`，再執行：

```sh
python -m pip install -r requirements-docs.txt
python scripts/build_reading.py
```

此命令只重建本包的閱讀入口、目錄、術語搜尋與校準樣章，不會把尚未撰寫的二十四章自動寫成書。由套件管理工具安裝依賴可能需要網路；Codex 不應在沒有必要時擅自改動使用者環境。
