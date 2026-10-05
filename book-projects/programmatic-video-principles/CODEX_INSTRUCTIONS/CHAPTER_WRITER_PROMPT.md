# 逐章撰稿指令

從 work.json 找下一章，讀取對應 OUTLINE/CHAPTER_BRIEFS/CHxx.md 與已完成的先備章節。先列「本章讀者已懂甚麼」「本章新詞」到工作筆記，再寫正文；不在正文複製任務卡。

承接前章的同一套白點與時間例子。解釋輸入、規則與輸出；數學需列單位與數值；比喻需講邊界；引用需實際讀過。把最小程式寫成可重跑文件並執行，保存實際輸出，不用未經運行的程式碼假裝實驗。

輸出 MANUSCRIPT/chapters/CHxx.md、CHxx.meta.json、本章所需例子和圖、練習與答案。該章狀態只能先設 draft。然後按 technical review 與 beginner review 的指令修稿，完成證據後才能更改為 reviewed。未解決的問題寫在章末編輯備注及 work.json，不靜默省略。
