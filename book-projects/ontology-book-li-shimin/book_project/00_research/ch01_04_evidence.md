# R-01｜第一至四章基礎證據定位

版本：1.0｜實際查閱：2026-09-28（Asia/Taipei）｜範圍：近章必需段落精讀，非 26 筆全部精讀、非系統性文獻回顧。

## 查閱方法與停止條件

本輪由交接包指定的原始網址直接讀取作者 PDF、大學指南、W3C 文件及論文全文 HTML；產品例子另讀供應商官方文件。沒有以搜尋摘要代替內文，也沒有採用未核定 DOI。定位以文件版本、章節標題及段落內容為準，不使用瀏覽工具暫時行號作長期引用。沒有下載或重新散布第三方全文。

R-01 的必要來源是 R01、R02、R04、R08。本輪已讀到支援下列主張的內文及限制，足以開始第一部；各章仍須各自通過 R-08。R-02 的完整基數／驗證反例、R-04 的 GraphRAG 實驗、R-05 的維護成本均未因此結案。第 4 章的 R03／R06 已找到原文入口，正式使用前須完成所用段落的章級查核。

## 來源閱讀卡

### R01｜Gruber，A Translation Approach to Portable Ontology Specifications

- 原文：[作者提供 PDF](https://tomgruber.org/writing/ontolingua-kaj-1993.pdf)；[作者書目頁](https://tomgruber.org/writing/ontolingua-kaj-1993/)。
- 書目：Knowledge Acquisition 5(2), 199–220 (1993)。實讀 PDF 封面為 KSL 92-71，September 1992、Revised April 1993；不能用期刊頁碼冒充此檔的頁碼。
- 深度：`FULLTEXT_TARGET_SECTIONS_READ`。精讀 §1 Introduction、§2 Ontologies and knowledge sharing；PDF 第 2–6 頁（含封面起算），正文頁 1–5。未精讀 §3–4 的轉譯實作與其完整論證。
- 問題與方法：知識系統如何共享詞彙；概念論證與系統設計，非當代企業導入對照試驗。
- 可用：選定範圍的明確概念約定、內容協議與介面格式的差別。
- 必留限制：§2 末段明列未解決的人群共識問題；§2 中段不把共同本體視為完整功能規格。不能推成「裝了本體就會合作」或普遍效益。
- 本書定位：C01；第 1 章末段、第 2 章歷史／範圍說明。替代證據入口 R18，非反本體實驗。

### R02｜Noy、McGuinness，Ontology Development 101

- 原文：[Stanford HTML](https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html)，2001 方法指南，交接書目 KSL-01-05。
- 深度：`FULLTEXT_TARGET_SECTIONS_READ`。§1、§2、§3 開頭；Step 1／Competency questions、Step 2、Step 4–5。未以閱讀前半部宣稱全篇精讀。
- 問題與方法：如何選範圍並建立初始概念模型；作者方法經驗與示例，無當代 LLM 成效數據。
- 可用：從要回答的問題限制模型；類別、個體、關係的入門區別；設計須迭代。
- 必留限制：§3 的多種可行設計，§1 的領域知識／操作知識區別。Step 2 的舊格式轉換樂觀描述不沿用為今日無損互通保證。
- 本書定位：第 2–3 章；第 1 章練習僅採本書教學設計，勿冒充經驗研究。

### R04｜W3C，OWL 2 Primer，第二版

- 原文：[2012-12-11 固定版](https://www.w3.org/TR/2012/REC-owl2-primer-20121211/)；實讀 [series 2 頁面](https://www.w3.org/TR/owl2-primer/)，標示同版日期。Recommendation 中的入門說明是 informative。
- 深度：`FULLTEXT_TARGET_SECTIONS_READ`。§2、§3、§4.1–4.2、§4.4、§4.6–4.8 的概念段與必要例子。§5.3 的完整基數反例仍交 R-02。
- 問題與方法：形式語意／教學例，不是實際支付、業務系統或 AI 安全測試。
- 可用：本體可含個體陳述；邏輯推得與必填檢查不同；名稱不同不自動代表不同個體。
- 必留限制：§2 的宣告式描述不等於程式，§3 的一致性相對於前提；§4.6 的 domain/range 可產生類別推論，不是輸入拒絕清單。資料庫是否完整另依任務，不能一概宣稱資料庫缺列就等於現實否定。
- 本書定位：C02、C03；第 3–4 章概念分工，不提前教第 8 章語法。

### R08｜Hogan 等，Knowledge Graphs

- 原文：[arXiv v6 HTML](https://arxiv.org/html/2003.02320v6)；[版本與出版資訊](https://arxiv.org/abs/2003.02320)。v6：2021-09-11；ACM Computing Surveys 54(4), Article 71；DOI 10.1145/3447772。本輪頁面仍列 v6。
- 深度：`FULLTEXT_TARGET_SECTIONS_READ`。§2.1 開頭、§2.1.1、§3 開頭、§3.1.1–3.1.2、§3.2 開頭及 3.2.1–3.2.2、§3.3 開頭；未精讀全篇圖學習與品質評量部分。HTML 部分公式顯示不全，未從那些公式／表格摘數值。
- 問題與方法：圖譜概念的綜述與教學，不能當特定企業實驗。
- 可用：模型與儲存方式有別；綱要、身分、情境分工；語意綱要與驗證綱要可互補。
- 必留限制：本書採用它的教學界定，不稱唯一通用定義；不由圖式資料推論有完整、真實或即時知識。§2.1 的關聯式改寫例反駁「有關係就必須買圖資料庫」。

### 第 1 章補充｜R18、R26

- [R18 Anthropic，Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：實讀導言、When (and when not) to use agents、基礎組件。文章標示 2024-12-19，現頁提醒工具資訊已變。僅使用「依需要增加複雜度」的工程觀點；不引用客戶成功率，不當本體對照研究，不推薦舊工具版本。
- [R26 dbt Semantic Layer](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl)：實讀導言與 Get started；官方描述集中指標定義、資料連接及下游使用。第 1 章只用來證明存在此產品做法，未實測功能，未核定整套版本，未沿用種子資料的頁尾更新日作現行版本證據；不引用費率／方案或安全成效。

### 邊界校準｜R05；第 2 章預讀 R14、R16

- [R05 SHACL 2017 固定版](https://www.w3.org/TR/2017/REC-shacl-20170720/)：本輪僅複核 Abstract 的資料圖／條件驗證定位；不足以結案 R-02 或宣稱跑過驗證器。
- [R14 Microsoft ontology overview](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview)：實讀公開回傳的 Overview、Core concepts 與 Data binding；頁面有 authorization 提示但本文可讀，本輪未登入／繞過。仍標 preview，頁尾 2026-07-21；資料刷新注意事項保留。產品所稱理解／一致性只列設計自述，非獨立試驗。
- [R16 Palantir Why create an Ontology?](https://www.palantir.com/docs/foundry/ontology/why-ontology)：實讀 Understanding the value 的四項及 Security；現行頁面無已核定統一版本號。資料、邏輯、行動、安全是該平台分類，不能回填為所有本體的必要構件。文中 Onyx 明為虛構，也不能當導入成果。

## 主張落點與處置

| 主張 ID | 章與預定落點 | 可採用的精確主張／性質 | 證據定位 | 不可跨越的限制 |
|---|---|---|---|---|
| F01 | 1「下一步」；2「定義」 | 本體研究處理共同概念的明確約定 | R01 §1–2；R02 §1–2 | 不等於機器完整理解企業 |
| F02 | 1「較小安排」 | 輕量方案應保留為可比較選項／本書判斷 | R18 When (and when not) | 未取得正式本體有無的對照效益 |
| F03 | 1「較小安排」；4 | 指標定義集中是可觀察的產品做法 | R26 導言第 1–3 段 | 不能宣稱與本體功能完全相同 |
| F04 | 2「三種語境」 | 概念、形式表達、平台功能須辨別 | R01 §1；R04 §2；R14 Overview；R16 Understanding the value | 產品能力僅為自述 |
| F05 | 2「模型邊界」 | 依任務選範圍，維護需要人負責 | R02 §3 Step 1；R01 §2 末段 | 不宣稱已有量化維護成本 |
| F06 | 3「類別與個體」 | 類別可含多個個體，個體可多重歸類 | R04 §4.1–4.2；R02 Step 4 | 講師必為員工不成立於本案例 |
| F07 | 3「關係與值」 | 物件關係與資料值屬性有別 | R04 §3、4.4、4.8 | 不是每種關係都為上下位 |
| F08 | 3「同名」；7 詳論 | 本案例 P001／P003 不可合併；形式命名另有語意 | example_data.json；R04 §4.7；R08 §3.2 | 案例 ID 規則不可直接冒充 OWL 唯一名稱假設 |
| F09 | 4「重疊」 | 本體可含個體，圖譜可含語意約定 | R04 §2；R08 §3 開頭 | 不硬切「規則／事實」 |
| F10 | 4「儲存」 | 有關係的資料可用表格結構表達 | R08 §2.1 開頭；R04 §2 末段 | 不保證查詢、效能、維護成本等價 |
| F11 | 4「不同責任」；8 詳論 | 推論、資料驗證、業務規則、執行授權分開 | R04 §2–3；R05 Abstract；案例 POL-001 | 未執行 OWL／SHACL／退款系統，勿寫成實測 |
| F12 | 1「時間與依據」 | SNAP-001 只回答快照；付款缺列是未知 | 案例完整性範圍、observed_at、policy；現有 CaseTests | 不把教學演算當真實公司成效 |

## 反方保留與研究缺口

第 1 章保留「清楚文件＋既有查詢可能足夠」，第 2 章保留「共同定義可能壓掉合理差異」及維護責任。這些是本書情境推理／方法取捨，不冒充觀察到的企業失敗。

GraphRAG 的效果、索引成本、抽取損失與基準公平性，仍由 R-04 查 R10／R11／R24；本輪不寫任何效果數字，也不刪除反方。版本演變、概念對齊、人力成本仍由 R-05 補原始研究，不能以 R01／R02 年代較早就宣稱已研究完成。R-07 保留 SQL、指標層與不導入方案。R-06 全平台功能盤點仍未完成。

第一章沒有未核定成效數據、未核定功能承諾或真人經驗；可進 W-01。第二章在 R14／R16 本輪公開頁面限縮後可進 R-08/W-02；第三、四章仍要對實際章句做近章 R-08，不能僅因本文件存在即視為完成。
