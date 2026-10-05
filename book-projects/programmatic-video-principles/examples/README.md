# 最小原理實驗｜怎麼執行、怎麼檢查

這些是為本書新寫的教學重建例子，不是《當世界開始被計算》的原始碼。六張 SVG 與八秒短片都是配套示範，不代表全書實驗已完成。

## 不裝開發環境也能先看

直接打開 `output/01_coordinate.svg` 到 `06_projection.svg`；也可由根目錄 START_HERE.html 進入。圖中文字使用系統可用字型，不隨包提供字型文件。示範影片在 `output/principles_demo.mp4`。

## 重建六張圖

先進入本交接資料夾，再執行：

```sh
python examples/build_examples.py
```

`python` 是執行程式的工具；後面的文字是要執行的文件路徑。`examples/` 是子資料夾；輸出統一寫進 `examples/output/`。此命令只需 Python 標準函式庫，沒有隱藏 API，也不聯網。建議 Python 3.10 或更新；本輪實際版本見 qa/HANDOFF_QA.md。

六張圖依次解釋：座標、插值、緩動、曲線、點群聚字、三維投影。靜態圖不會自己動；要驗證時間連續性，需看短片或更改多個取樣時點，而不只截中點。

## 跑真正的檢查

```sh
python -m unittest discover -s tests -v
```

這句話讓 Python 使用內建測試工具，在 tests 資料夾尋找測試，並逐項顯示結果。它不是生成書稿的命令，也不證明你已經聽懂或整本書已審查。

## 重新輸出八秒示範影片

額外需要 Pillow 繪圖套件，以及系統能找到的 FFmpeg 程式。先查看本機有沒有它們，不為學習概念先安裝所有影片框架。

```sh
python -m pip install -r requirements-demo.txt
python examples/render_demo.py --output examples/output/principles_demo.mp4
```

第一句安裝此示範需要的單一 Python 套件。FFmpeg 不是這樣自動安裝的：本腳本會檢測，找不到時清楚報錯並退出，不偷偷下載系統工具。缺少中文字型時設置 `BOOK_DEMO_FONT` 指向你本機合法可用的中文字型；本包不包含字型文件。

示範為 1280×720、30 fps、八秒。前四秒對照等速與緩動，後四秒把點群聚成自繪「井」形。聲音只有程序生成的短提示音，不是旁白或聲線克隆。沒有調用任何文字轉語音服務。

程式碼目錄：`motion_core.py` 算狀態；`build_examples.py` 把狀態寫成 SVG；`render_demo.py` 畫影格、產生測試音並交給 FFmpeg 編碼封裝。最後兩步故意分開，讓讀者看清楚「數學不是 MP4，MP4 需要輸出流程」。

## 可改與不可誤讀

可以改 duration、取樣時間、亂數種子，先預測再執行。目標井形是手工幾何遮罩，不是完整中文字型抽樣；粒子採用固定索引配對，不宣稱最短路或最佳視覺效果；立方體是線框投影，不做材質照明與隱藏面消除；示範沒有 GPU shader 或真實物理引擎。

更新輸出後原交接包的發行清單會失效，這是正常的版本差異。請保存變更後再製作新的 release，不覆蓋舊驗收記錄假裝沒改。
