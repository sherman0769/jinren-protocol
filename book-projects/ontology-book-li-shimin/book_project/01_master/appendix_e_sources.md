# 附錄 E｜來源、版本與研究方法

本書不是系統性文獻回顧。26 筆交接種子經針對性精讀與補充，共登錄 31 筆；列在索引不等於全篇讀過，正式章節只採用已核對的主張範圍。查閱基準為 2026-09-28。

標準用於規範語意；研究只支持其方法與資料所涵蓋的結果；供應商文件用於描述特定產品；架構評論與本書設計不冒充對照實驗。本書沒有複現所引 LLM／GraphRAG 研究，也沒有把抽取成績換成企業投資報酬。

研究先核書目與版本，再核方法、比較方案、結果與限制。數據表未經足夠確認時不引用效果數字；全文存取失敗時保留失敗與實際讀取深度，不以摘要冒充全文。沒有取得適用小型工作室的獨立完整成本資料，因此成本、效益及時間均以待填試行記錄處理。

重要更新：R21 已註明獲期刊接受，正文使用作者公開稿；R13 仍為預印本。R17 依 2026-07-28 版核對；Fabric 文件於查閱日仍有 preview 標記。這些是當時資料，日後實作須重查。新增 R27 時間術語、R28 固定版交易文件、R29 重試工程及 R30／R31 維護研究。

以下提供合法來源連結與實際使用範圍，不打包他人論文全文。深度代碼保留原紀錄，旁列定位與限制；ABSTRACT／METADATA 等字樣表示摘要或書目層級，不能當作實驗全文精讀。

## R01｜可攜式本體規格的轉譯方法

A Translation Approach to Portable Ontology Specifications；Thomas R. Gruber。

日期／版本：1993；期刊書目 1993；實讀 KSL 92-71，September 1992 / Revised April 1993。

類型：期刊論文之作者公開技術報告 PDF。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://tomgruber.org/writing/ontolingua-kaj-1993/)；[補充／實讀版本](https://tomgruber.org/writing/ontolingua-kaj-1993.pdf)。

定位：§1–2；PDF 第 2–6 頁（含封面），正文頁 1–5。

可支持：將本體放回知識共享與可重用詞彙的問題脈絡。

限制：僅精讀 §1–2；§3–4 未全文精讀。知識共享規格不等於共識達成、完整行為或企業成效。

## R02｜本體開發入門：建立第一個本體的指南

Ontology Development 101: A Guide to Creating Your First Ontology；Natalya F. Noy、Deborah L. McGuinness。

日期／版本：2001；Stanford 技術報告 KSL-01-05；HTML 版本。

類型：大學技術報告／方法指南。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html)；[補充／實讀版本](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf)。

定位：§1–2；§3 開頭、Step 1–7；本輪 PDF 補讀正文頁 6–11 的 Step 3–7。

可支持：用能力問題限定建模範圍，並採迭代與重用方法。

限制：方法指南而非當代成效試驗；不沿用舊格式轉換敘述作現行無損互通保證。

## R03｜RDF 1.1 入門

RDF 1.1 Primer；W3C。

日期／版本：2014-06-24；W3C Working Group Note；本書基礎例用 RDF 1.1。

類型：標準組織入門文件。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.w3.org/TR/rdf11-primer/)；[補充／實讀版本](https://www.w3.org/TR/2014/NOTE-rdf11-primer-20140624/)。

定位：Status；§1；§3.1–3.3；§4 開頭；不含完整語法教學。

可支持：用主詞、述詞、受詞介紹圖式陳述。

限制：入門文件非所有 RDF 功能的規範全文；RDF 不等同完整業務本體或唯一可選圖模型。

## R04｜OWL 2 本體語言入門，第二版

OWL 2 Web Ontology Language Primer (Second Edition)；W3C。

日期／版本：2012-12-11；W3C Recommendation；入門說明為 informative。

類型：標準組織文件。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.w3.org/TR/owl2-primer/)。

定位：原 R-01 範圍＋§4.6–4.8 複核、§5.3 基數；Direct Semantics §2.2.3／2.3.1／2.3.6／2.4–2.5 相關定義。

可支持：區分邏輯表達、個體事實、開放世界與資料格式驗證。

限制：規則反例完成逐步語意推導，未跑 OWL 推理器；不等於資料必填驗證或執行授權。

## R05｜形狀約束語言

Shapes Constraint Language (SHACL)；W3C。

日期／版本：2017-07-20；W3C Recommendation。

類型：標準規範。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.w3.org/TR/shacl/)。

定位：§1.5；§2.1.2–2.1.3.2；§3–3.6.1；§4.1.1–4.1.3；§4.2；§4.3.2。

可支持：用指定形狀驗證 RDF 資料是否符合要求。

限制：按定義手算目標、值數與型別反例；未跑 SHACL 驗證器。未涵蓋遞迴、SPARQL 擴充、實際業務端點。

## R06｜簡易知識組織系統參考

SKOS Simple Knowledge Organization System Reference；W3C。

日期／版本：2009-08-18；W3C Recommendation。

類型：標準規範。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.w3.org/TR/skos-reference/)。

定位：§1.1–1.3；§3.1／3.5.1；§5.1；§8.6.6。

可支持：支援受控詞彙、概念階層與標籤的對照教學。

限制：SKOS 的 broader 關係不能直接當成 OWL 子類公理；不宣稱分類表已足夠所有任務。

## R07｜PROV-O 來源追溯本體

PROV-O: The PROV Ontology；W3C。

日期／版本：2013-04-30；W3C Recommendation。

類型：標準規範。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.w3.org/TR/prov-o/)；[補充／實讀版本](https://www.w3.org/TR/2013/REC-prov-o-20130430/)。

定位：2013 固定版 Abstract、§1.1、§3.1 文字、§3.2 前四類說明。

可支持：為事物、處理活動與責任主體的來源關係提供詞彙。

限制：非整份形式規範精讀；PROV Agent 可是人／組織／軟體，非專指 LLM；來源可追溯不保證真實，事實卡不是完整 PROV-O 實作。

## R08｜知識圖譜

Knowledge Graphs；Aidan Hogan 等。

日期／版本：2021-09-11；arXiv v6；ACM Computing Surveys 54(4), Article 71；DOI 10.1145/3447772。

類型：已發表的綜述論文。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2003.02320)；[補充／實讀版本](https://arxiv.org/html/2003.02320v6)。

定位：v6：§2.1 開頭、§2.1.1、§3 開頭、§3.1.1–3.1.2、§3.2 開頭／3.2.1–3.2.2、§3.3 開頭；本輪補 §3.3／3.3.1、§7 開頭、§7.1.1–7.1.3、§7.2.1。

可支持：說明圖模型、身分、綱要與情境各自的責任。

限制：僅近章相關段落；非全篇精讀。HTML 部分公式未完整呈現，未從該處取數。綜述不是企業成效試驗。

## R09｜知識密集語言任務的檢索增強生成

Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks；Patrick Lewis 等。

日期／版本：2021-04-12；arXiv v4；頁面註明 accepted at NeurIPS 2020。

類型：已接受發表的原始研究。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2005.11401)。

定位：§1–2、§3.1–3.4、§4.1–4.3 相關段。

可支持：提供 RAG 原始研究脈絡。

限制：特定訓練與資料架構，不等於所有現代 RAG；未重現實驗。

## R10｜從局部到全局：用圖式 RAG 做提問導向摘要

From Local to Global: A Graph RAG Approach to Query-Focused Summarization；Darren Edge 等。

日期／版本：2025-02-19；arXiv v2；初稿 2024-04-24。

類型：研究預印本。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2404.16130)；[補充／實讀版本](https://arxiv.org/html/2404.16130v2)。

定位：§3–6；不含全部附錄。

可支持：以文本抽取、圖與社群摘要組織全局問題的證據。

限制：全局問題、兩種語料、模型裁判／主張數；不等於事實正確或總費用降低。

## R11｜RAG 與 GraphRAG 的系統性比較與洞見

RAG vs. GraphRAG: A Systematic Evaluation and Key Insights；Haoyu Han、Li Ma 等（v3 作者表）。

日期／版本：2026-03-04；arXiv v3；先查看 v1 後已改以 v3 為交接基準。

類型：研究預印本／比較實驗。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2502.11371)；[補充／實讀版本](https://arxiv.org/html/2502.11371v3)。

定位：v3 §3–5、附錄 M 正文；L 設定參考。

可支持：比較方法的任務差異、效率取捨與評測偏差。

限制：固定 v3；題型與參考答案影響結論；非所有 GraphRAG 皆勝，數值未供正文引用。

## R12｜使用大語言模型進行本體學習

LLMs4OL: Large Language Models for Ontology Learning；Hamed Babaei Giglou、Jennifer D’Souza、Sören Auer。

日期／版本：2023-08-02；arXiv v2；頁面註明 ISWC 2023 research track。

類型：已接受發表的原始研究。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2307.16648)；[補充／實讀版本](https://arxiv.org/html/2307.16648v2)。

定位：§1；§3；§4.1–4.3 方法與結果文字；§5。

可支持：研究模型在詞項類型、分類結構與非分類關係抽取的子任務。

限制：三項子任務與特定資料／模型／最佳提示；未複現或視覺核表，正文不引用成績、模型參數或現行排名。

## R13｜專家參與的能力問題擷取與協作本體工程

IDEA2: Expert-in-the-loop competency question elicitation for collaborative ontology engineering；Elliott Watkiss-Leek 等。

日期／版本：2026-04-01；arXiv v1；不因年份新就視為主流共識。

類型：研究預印本。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2604.01344)；[補充／實讀版本](https://arxiv.org/html/2604.01344v1)。

定位：書目及 v1；§1；§3.1–3.4；§4.1–4.3；§5。

可支持：讓模型提出能力問題，再由領域專家審查與回饋修訂。

限制：預印本與有限場景；第 5 章僅採流程和限制，不引效果數據。接受率分母含審查事件，不能稱原始問題正確率；未複現。

## R14｜Microsoft Fabric 本體預覽版概覽

What is ontology (preview)?；Microsoft。

日期／版本：2026-07-21；2026-09-28 仍標 preview；概覽頁尾 2026-07-21、刷新細節頁尾 2026-05-14；未登入租戶。

類型：供應商官方文件。讀取深度：TARGET_SECTIONS_RECHECKED。

[來源](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview)；[補充／實讀版本](https://learn.microsoft.com/en-us/fabric/iq/ontology/how-to-view-entity-type-details)。

定位：Overview 的 Data binding／Ontology graph／Note；Entity type details 的 Refresh the graph model。

可支持：描述其企業語意、資料綁定與查詢功能。

限制：只讀公開產品文件、未實測；外部來源需刷新安排，細節有手動及週期刷新，不得寫只能手動或接上即時。

## R15｜本體與智能體的整合選項，預覽版

Agent integration options for ontology (preview)；Microsoft。

日期／版本：2026-07-23；preview；選項頁 2026-07-23，MCP server 頁 2026-05-05；未登入租戶。

類型：供應商官方文件。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://learn.microsoft.com/en-us/fabric/iq/ontology/concepts-agent-integration)；[補充／實讀版本](https://learn.microsoft.com/en-us/fabric/iq/ontology/how-to-use-ontology-mcp-server)。

定位：Agent integration 的用途、支援選項及 Custom agents；MCP server 的前提、機制與設定（未執行）。

可支持：列出不同 Agent 取得本體情境的整合方式，包括 MCP。

限制：官方功能列表不是獨立效益研究；實際租戶、權限、支援工具需再查。

## R16｜為何建立 Palantir Ontology

Why create an Ontology?；Palantir。

日期／版本：未確認日期；2026-09-28 所讀公開頁；未核定統一版號／發布日期。

類型：供應商官方架構說明。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.palantir.com/docs/foundry/ontology/why-ontology)。

定位：Why ontology 四構面及 Security；Action permissions 正文；Revert or undo actions 正文／Caveats。

可支持：Palantir 將資料、邏輯、行動與安全整合為其產品營運模型。

限制：四項整合為平台設計自述，不是所有本體的標準定義；未實測。Onyx 是文中明示虛構例。

## R17｜模型情境協定規格

Model Context Protocol — Specification；Model Context Protocol 維護團隊。

日期／版本：2026-07-28；2026-09-28 再查 latest 仍轉向 2026-07-28；未驗證客戶端相容性。

類型：協定官方規範。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://modelcontextprotocol.io/specification/2026-07-28)；[補充／實讀版本](https://modelcontextprotocol.io/specification/latest)。

定位：2026-07-28 Overview、Features、Security and Trust & Safety／Implementation Guidelines，未讀全部子規範。

可支持：規範應用程式與外部資料、工具的連接；安全需實作者處理。

限制：不能推論 MCP 會統一業務語意或自動執行全部安全原則。

## R18｜建構有效的智能體

Building effective agents；Anthropic。

日期／版本：2024-12-19；文章標 2024-12-19；2026-09-28 現頁提醒工具資訊已改變；只用架構取捨。

類型：供應商第一手工程經驗文章。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.anthropic.com/engineering/building-effective-agents)。

定位：另讀 Agents、Combining patterns、Appendix 2 工具定義與測試。

可支持：以簡單可組合方案開始，必要才增加 Agent 複雜度。

限制：作者工程經驗不是隨機實驗或反本體論文；不要以舊工具名推定當前版本。

## R19｜智能體的有效情境工程

Effective context engineering for AI agents；Anthropic。

日期／版本：2025-09-29；線上工程文章；非標準組織規範。

類型：供應商第一手工程文章。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)。

定位：定義、有效情境組成、Context retrieval and agentic search。

可支持：按任務維護與選取推理時需要的情境，而非只優化單一提示詞。

限制：供應商工程實務文章，非獨立控制實驗；只讀指定節。

## R20｜使用 AGENTS.md 提供專案指令

Custom instructions with AGENTS.md；OpenAI。

日期／版本：未確認日期；本次官方入口轉向 ChatGPT Learn 文件。

類型：工具官方文件。讀取深度：RELEVANT_SECTIONS_READ。

[來源](https://developers.openai.com/codex/guides/agents-md)；[補充／實讀版本](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

定位：Custom instructions with AGENTS.md；How Codex discovers guidance。

可支持：把簡短專案規則放在根目錄 AGENTS.md，配合明確讀取順序。

限制：只支援本交接包操作，不作為本體技術論證；不要求關閉使用者的安全確認。

## R21｜大語言模型生成學術本體：工程領域分析

Large Language Models for Scholarly Ontology Generation: An Extensive Analysis in the Engineering Field；Tanay Aggarwal、Angelo Salatino、Francesco Osborne、Enrico Motta。

日期／版本：2025-06-11；arXiv v2；Information Processing & Management accepted camera ready；DOI 10.1016/j.ipm.2025.104262。

類型：期刊接受之作者公開稿。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2412.08258)；[補充／實讀版本](https://arxiv.org/html/2412.08258v2)。

定位：§3.1–3.3、§4.1–4.4、§5.5、§6、§7、§8 開頭。

可支持：檢查模型對研究主題之語意關係的辨識能力。

限制：工程領域四種關係分類；人工策展參照，未比較非 LLM 方法；不是完整本體。same-as 標籤不等於 OWL 個體同一；未複現、不引 F1。

## R22｜Azure Digital Twins 的本體概念

What is an ontology? — Azure Digital Twins；Microsoft。

日期／版本：未確認日期；頁尾 Last updated 2025-12-12；非整體產品版號。

類型：供應商官方文件。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://learn.microsoft.com/en-us/azure/digital-twins/concepts-ontologies)。

定位：定義與 Fabric 差別、策略、DTDL 表示、模型開發路徑。

可支持：為數位分身中的共用領域模型與重用提供產品例子。

限制：不是企業本體具備因果或預測能力的證據；需要額外狀態及模擬假設。

## R23｜本體常見陷阱掃描工具

OOPS! — OntOlogy Pitfall Scanner!；Ontology Engineering Group。

日期／版本：未確認日期；官方頁面與工具介紹；本包未上傳任何資料或執行遠端掃描。

類型：研究團隊工具頁。讀取深度：OFFICIAL_CATALOGUE_AND_2012_PAPER_TARGET_SECTIONS_READ。

[來源](https://oops.linkeddata.es/)；[補充／實讀版本](https://oops.linkeddata.es/catalogue.jsp)。

定位：官方目錄 P01–P09 等；ESWC 2012 Did you validate your ontology? OOPS! 摘要／§1–2。

可支持：作為檢查本體建模陷阱的工具與研究延伸入口。

限制：入口曾逾時、目錄本輪成功；2012 論文後段未讀、2014 全文未取；未上傳或執行掃描，不把潛在陷阱當業務錯誤定論。

## R24｜結合圖結構的檢索增強生成綜述

Retrieval-Augmented Generation with Graphs (GraphRAG)；Haoyu Han 等。

日期／版本：2025-01-08；arXiv v2；初稿日期為 2024-12-31，不能只從編號猜發布月份。

類型：研究預印本／綜述。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/abs/2501.00309)。

定位：§1、§2 開頭、§10.1–10.6、§11。

可支持：區分 GraphRAG 的組成、領域差異與設計挑戰。

限制：綜述的指定節已讀；被引文章不代表已逐篇精讀；不採過時泛稱。

## R25｜限界情境

Bounded Context；Martin Fowler。

日期／版本：2014-01-15；第一手架構評論；非 ontology 成效實驗。

類型：資深實務作者的架構說明。讀取深度：FULL_MAIN_TEXT_READ。

[來源](https://martinfowler.com/bliki/BoundedContext.html)。

定位：2014-01-15 Bounded Context 主文。

可支持：大型領域可保留局部一致模型，再明確描述模型間關係。

限制：第一手架構評論，不是企業成效對照試驗；不表示全域模型必敗。

## R26｜dbt 分析語意層

dbt Semantic Layer；dbt Labs。

日期／版本：2026-08-18；2026-09-28 重讀，頁尾 Last updated Aug 18, 2026；僅頁面更新標籤，非統一產品版本。

類型：供應商官方文件。讀取深度：TARGET_SECTIONS_RECHECKED。

[來源](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl)。

定位：Introduction 第 1–3 段；Get started。

可支持：可統一指標定義及處理資料連接，是分析需求的比較方案。

限制：供應商自述；未測功能、版本、費率或效益，不與通用本體作全功能等價。

## R27｜時間資料庫概念共識詞彙：1998 年 2 月版

The Consensus Glossary of Temporal Database Concepts—February 1998 Version；Christian S. Jensen、Curtis E. Dyreson 編及共同作者。

日期／版本：1998；February 1998 Version；LNCS 1399, pp.367–405。

類型：學術術語共識篇章之作者公開 PDF。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www2.cs.arizona.edu/~rts/pubs/LNCS1399.pdf)；[補充／實讀版本](https://www2.cs.arizona.edu/~rts/publications.html)。

定位：§3.1 Valid Time、§3.2 Transaction Time，印刷頁 370–371。

可支持：有效時間與資料庫交易時間的區別。

限制：只讀封面及 §3.1–3.2；不將觀測／抓取／刷新時間一律等同 transaction time，不宣稱已實作時間資料庫。

## R28｜PostgreSQL 17 交易隔離文件

PostgreSQL 17 Documentation: 13.2 Transaction Isolation；PostgreSQL Global Development Group。

日期／版本：未確認日期；PostgreSQL 17 文件，非最新版本宣稱。

類型：軟體官方版本文件。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://www.postgresql.org/docs/17/transaction-iso.html)。

定位：§13.2 前言、表 13.1、§13.2.1 查詢／更新衝突段、§13.2.3 隔離與失敗處理。

可支持：交易隔離、併行異常與衝突中止／重試的邊界。

限制：只讀指定段落；未執行 SQL 或真實併行測試，不表示採交易就自動維持所有業務條件。

## R29｜以冪等介面設計安全重試

Making retries safe with idempotent APIs；Malcolm Featonby / AWS Builders’ Library。

日期／版本：未確認日期；2026-09-28 所見公開正文，未確認發布日。

類型：供應商工程實務文章。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)。

定位：唯一請求識別、semantic equivalence、late arrivals、same ID different intent、conclusion。

可支持：一次意圖的請求識別、重試語意與持久去重邊界。

限制：非普遍 exactly-once 證明；未執行 AWS 命令或真實支付服務。

## R30｜Ontology Evolution: Not the Same as Schema Evolution

Ontology Evolution: Not the Same as Schema Evolution；Natalya F. Noy、Michel Klein。

日期／版本：2004；目標段落精讀；見研究卡。

類型：原始研究公開全文。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://research.vu.nl/ws/portalfiles/portal/29675469/KAIS03.pdf)。

定位：書目封面；§1.1；§1.2 開頭；§3.1–3.2；§3.3 開頭。

可支持：版本相容性／跨模型對應的維護邊界

限制：歷史方法研究，非現行工具或成本實驗；DOI 10.1007/s10115-003-0137-2。

## R31｜Methods of managing the evolution of ontologies and their alignments

Methods of managing the evolution of ontologies and their alignments；Marcin Pietranik、Adrianna Kozierkiewicz。

日期／版本：2023-04-12；目標段落精讀；見研究卡。

類型：原始研究公開全文。讀取深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://link.springer.com/article/10.1007/s10489-023-04545-0)。

定位：§1；§3.3；§4.1 開頭；§4.2.2–4.2.3 解說；§5.1、5.5、6。

可支持：版本相容性／跨模型對應的維護邊界

限制：小型 Conference 本體、半隨機演化、結構與基準重疊指標；未證明企業真值、普遍省工或大規模效果；未複現。
