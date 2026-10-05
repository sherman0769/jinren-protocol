# 《程式如何變成影片》｜Codex 寫書交接入口

版本 1.0.0 · 2026-10-05 · 語言：繁體中文（臺灣）

## 先辨認這是哪一個專案

這是一本「用寫書來學習」的原理書之交接包，不是影片製作任務，也不是舊引擎的操作手冊。

- 暫定書名：《程式如何變成影片》。
- 暫定副標：不背術語，也能看懂 AI 如何用程式寫出一部電影。
- 發起與主要讀者：李詩民；具 AI 實務與教學經驗，不預設具備電腦圖學、英文術語或程式設計訓練。
- 學習目標：看得懂畫面背後的時間、座標、規則與輸出流程；能用中文提出可驗收的要求，能辨認 AI 的技術錯誤。
- 既有案例：《當世界開始被計算》Programmatic Motion Engine V1。它是證據與拆解材料，不是本書的唯一技術答案。

## 人類讀者的最短路線

先開 `START_HERE.html` 看專案導覽，再看 `OUTLINE/FULL_BOOK_OUTLINE.md`、`SAMPLE_CHAPTER/CH04_圓點為什麼會動.md`。要交給 Codex，就貼上 `CODEX_INSTRUCTIONS/MASTER_PROMPT.md` 的全文。

本包是寫書交接包，不是已出版書稿。24 章已有寫作任務卡，只有第 4 章有校準樣章；樣章尚未經李詩民確認。請勿把任務卡當成完成章節。

## Codex 的第一個工作回合

先讀 `AGENTS.md`、`book.json`、`work.json`、`CONTEXT/DECISIONS_AND_BOUNDARIES.md`。檢查目前目錄是否已有寫書專案；保留現有規約與未提交修改。不要猜測 D 槽路徑，也不要建立或改動全域設定。

執行本包驗證與範例測試，閱讀校準樣章後，開始撰寫前言與第 1～3 章完整初稿。不是重新詢問方向，不是只交另一份目錄。各章完成技術審查、初學者審查與引用核對後才更新狀態；逐批繼續其餘章節。一次執行無法寫完時，把已寫檔案與下一步存進 `work.json`，不得聲稱背景會自動續寫。

## 本包可直接執行

```sh
python scripts/validate_package.py
python -m unittest discover -s tests -v
python examples/build_examples.py
```

以上只需要 Python 標準函式庫，不需付費服務、不需 API 金鑰、不需顯示卡。需重新輸出示範 MP4 時，另需 Pillow 與系統可執行的 FFmpeg：

```sh
python -m pip install -r requirements-demo.txt
python examples/render_demo.py --output examples/output/principles_demo.mp4
```

以上命令的用途與英文逐一解釋在 `examples/README.md`。本次實測環境、實際輸出和已知限制見 `qa/HANDOFF_QA.md`；Windows 啟動腳本未在使用者電腦實測。

## 案例素材邊界

本包附原影片驗收報告副本、這次讀取的影片中繼資料與四張實際成片截圖。沒有重包兩支完整長片，亦沒有取得原 Motion Engine 完整原始碼 ZIP。未取得的程式不可虛構檔名、函式、行號或粒子數；以新寫的教學重建例子繼續，不讓缺檔阻止原理書撰寫。
