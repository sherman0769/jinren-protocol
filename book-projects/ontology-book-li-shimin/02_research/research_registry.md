# 研究來源登錄表

版本：1.3.0。查閱日：2026-09-28。首輪種子 26 筆，本輪新增 R27／R28 共 28 筆，包含方法論、標準、論文、官方產品文件與架構評論；其中 R20 只供 Codex 操作使用。

活動修訂已更新 R01/R02/R03/R04/R05/R06/R07/R08/R13/R14/R16/R18/R26 的實際讀取範圍，另新增 R27／R28；R23 記錄讀取逾時，其餘維持交接種子紀錄。`FULLTEXT_TARGET_SECTIONS_READ` 表示讀取全文中的指定段落，不是全篇精讀。

這不是全書研究已完成的宣告。原種子的 `RELEVANT_SECTIONS_READ` 表示交接階段所報相關段落，不表示逐字讀完全文；`ABSTRACT_AND_METADATA_READ`、`AUTHOR_ABSTRACT_READ` 只表示已核對摘要與書目；`TOOL_DESCRIPTION_READ` 只表示讀過工具介紹。正文若需要尚未讀取的內容，必須再精讀。

本包只提供書目、連結、短評與限制，不附未授權的第三方全文。發布日期未核定就留空，不拿爬取日期當發布日期。arXiv DOI 不等於已通過同儕審查。論文若改版，作者表與結果也可能改變。

來源編號 `R01` 等要和章稿的主張、段落定位一起使用。單有篇末書目而找不到哪個主張引用哪裡，不算完成查核。


## R01

**可攜式本體規格的轉譯方法**  
原文：A Translation Approach to Portable Ontology Specifications  
作者／機構：Thomas R. Gruber  
類型：期刊論文之作者公開技術報告 PDF  
日期：1993  
版本／狀態：期刊書目 1993；實讀 KSL 92-71，September 1992 / Revised April 1993  
查閱日：2026-09-28  
讀取深度：`FULLTEXT_TARGET_SECTIONS_READ`  
支持章節：第1章、第2章  
來源：[原文](https://tomgruber.org/writing/ontolingua-kaj-1993/)

備用／全文入口：[連結](https://tomgruber.org/writing/ontolingua-kaj-1993.pdf)

可支持：將本體放回知識共享與可重用詞彙的問題脈絡。

限制：僅精讀 §1–2；§3–4 未全文精讀。知識共享規格不等於共識達成、完整行為或企業成效。

定位：§1–2；PDF 第 2–6 頁（含封面），正文頁 1–5。

本輪詳細主張—證據：`book_project/00_research/ch01_04_evidence.md`；原種子狀態保留在 sources.json 的 handoff_seed_record。

更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。

## R02

**本體開發入門：建立第一個本體的指南**  
原文：Ontology Development 101: A Guide to Creating Your First Ontology  
作者／機構：Natalya F. Noy、Deborah L. McGuinness  
類型：大學技術報告／方法指南  
日期：2001  
版本／狀態：Stanford 技術報告 KSL-01-05；HTML 版本
查閱日：2026-09-28  
讀取深度：FULLTEXT_TARGET_SECTIONS_READ
支持章節：第2章、第3章、第5章、第6章、第15章、第16章  
來源：[原文](https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html)

備用／全文入口：[連結](https://protegewiki.stanford.edu/wiki/Ontology101)

可支持：用能力問題限定建模範圍，並採迭代與重用方法。

限制：方法指南而非當代成效試驗；不沿用舊格式轉換敘述作現行無損互通保證。

定位：§1–2；§3 開頭、Step 1–7；本輪 PDF 補讀正文頁 6–11 的 Step 3–7

本輪詳細主張—證據：`book_project/00_research/ch01_04_evidence.md`；原種子狀態保留在 sources.json 的 handoff_seed_record。

更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。


最新章級查核：`book_project/00_research/ch06_07_evidence.md`；第 8 章另見 `ch08_evidence.md`。

## R03

**RDF 1.1 入門**  
原文：RDF 1.1 Primer  
作者／機構：W3C  
類型：標準組織入門文件  
日期：2014-06-24
版本／狀態：W3C Working Group Note；本書基礎例用 RDF 1.1
查閱日：2026-09-28  
讀取深度：`FULLTEXT_TARGET_SECTIONS_READ`
支持章節：第4章、第6章、第8章  
來源：https://www.w3.org/TR/rdf11-primer/

可支持：用主詞、述詞、受詞介紹圖式陳述。

限制：入門文件非所有 RDF 功能的規範全文；RDF 不等同完整業務本體或唯一可選圖模型。

定位：Status；§1；§3.1–3.3；§4 開頭；不含完整語法教學

更新要求：基礎概念可作穩定參考；新增細節仍須回到指定版本查證。

本輪詳細主張—證據：`book_project/00_research/ch04_supplement.md`；原種子狀態保留在 sources.json。


## R04

**OWL 2 本體語言入門，第二版**  
原文：OWL 2 Web Ontology Language Primer (Second Edition)  
作者／機構：W3C  
類型：標準組織文件  
日期：2012-12-11
版本／狀態：W3C Recommendation；入門說明為 informative
查閱日：2026-09-28  
讀取深度：`FULLTEXT_TARGET_SECTIONS_READ`
支持章節：第3章、第8章  
來源：[原文](https://www.w3.org/TR/owl2-primer/)

可支持：區分邏輯表達、個體事實、開放世界與資料格式驗證。

限制：規則反例完成逐步語意推導，未跑 OWL 推理器；不等於資料必填驗證或執行授權。

定位：原 R-01 範圍＋§4.6–4.8 複核、§5.3 基數；Direct Semantics §2.2.3／2.3.1／2.3.6／2.4–2.5 相關定義


更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。

本輪詳細主張—證據：`book_project/00_research/ch01_04_evidence.md`；`book_project/00_research/r02_rules_counterexamples.md`；原種子狀態保留在 sources.json。


## R05

**形狀約束語言**  
原文：Shapes Constraint Language (SHACL)  
作者／機構：W3C  
類型：標準規範  
日期：2017-07-20
版本／狀態：W3C Recommendation
查閱日：2026-09-28  
讀取深度：`FULLTEXT_TARGET_SECTIONS_READ`
支持章節：第8章  
來源：[原文](https://www.w3.org/TR/shacl/)

可支持：用指定形狀驗證 RDF 資料是否符合要求。

限制：按定義手算目標、值數與型別反例；未跑 SHACL 驗證器。未涵蓋遞迴、SPARQL 擴充、實際業務端點。

定位：§1.5；§2.1.2–2.1.3.2；§3–3.6.1；§4.1.1–4.1.3；§4.2；§4.3.2


更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。

本輪詳細主張—證據：`book_project/00_research/r02_rules_counterexamples.md`；原種子狀態保留在 sources.json。


## R06

**簡易知識組織系統參考**  
原文：SKOS Simple Knowledge Organization System Reference  
作者／機構：W3C  
類型：標準規範  
日期：2009-08-18
版本／狀態：W3C Recommendation
查閱日：2026-09-28  
讀取深度：`FULLTEXT_TARGET_SECTIONS_READ`
支持章節：第4章  
來源：https://www.w3.org/TR/skos-reference/

可支持：支援受控詞彙、概念階層與標籤的對照教學。

限制：SKOS 的 broader 關係不能直接當成 OWL 子類公理；不宣稱分類表已足夠所有任務。

定位：§1.1–1.3；§3.1／3.5.1；§5.1；§8.6.6

更新要求：基礎概念可作穩定參考；新增細節仍須回到指定版本查證。

本輪詳細主張—證據：`book_project/00_research/ch04_supplement.md`；原種子狀態保留在 sources.json。


## R07

**PROV-O 來源追溯本體**  
原文：PROV-O: The PROV Ontology  
作者／機構：W3C  
類型：標準規範  
日期：2013-04-30  
版本／狀態：W3C Recommendation
查閱日：2026-09-28  
讀取深度：FULLTEXT_TARGET_SECTIONS_READ
支持章節：第7章  
來源：https://www.w3.org/TR/prov-o/

可支持：為事物、處理活動與責任主體的來源關係提供詞彙。

限制：非整份形式規範精讀；PROV Agent 可是人／組織／軟體，非專指 LLM；來源可追溯不保證真實，事實卡不是完整 PROV-O 實作。

定位：2013 固定版 Abstract、§1.1、§3.1 文字、§3.2 前四類說明

更新要求：基礎概念可作穩定參考；新增細節仍須回到指定版本查證。



最新章級查核：`book_project/00_research/ch06_07_evidence.md`；第 8 章另見 `ch08_evidence.md`。

## R08

**知識圖譜**  
原文：Knowledge Graphs  
作者／機構：Aidan Hogan 等  
類型：已發表的綜述論文  
日期：2021-09-11  
版本／狀態：arXiv v6；ACM Computing Surveys 54(4), Article 71；DOI 10.1145/3447772
查閱日：2026-09-28  
讀取深度：FULLTEXT_TARGET_SECTIONS_READ
支持章節：第3章、第4章、第6章、第7章  
來源：[原文](https://arxiv.org/abs/2003.02320)

備用／全文入口：[連結](https://arxiv.org/html/2003.02320v6)

可支持：說明圖模型、身分、綱要與情境各自的責任。

限制：僅近章相關段落；非全篇精讀。HTML 部分公式未完整呈現，未從該處取數。綜述不是企業成效試驗。

定位：v6：§2.1 開頭、§2.1.1、§3 開頭、§3.1.1–3.1.2、§3.2 開頭／3.2.1–3.2.2、§3.3 開頭；本輪補 §3.3／3.3.1、§7 開頭、§7.1.1–7.1.3、§7.2.1

本輪詳細主張—證據：`book_project/00_research/ch01_04_evidence.md`；原種子狀態保留在 sources.json 的 handoff_seed_record。

更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。


最新章級查核：`book_project/00_research/ch06_07_evidence.md`；第 8 章另見 `ch08_evidence.md`。

## R09

**Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**
版本／狀態：arXiv v4；頁面註明 accepted at NeurIPS 2020
查閱：2026-09-28；讀取深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://arxiv.org/abs/2005.11401)

定位：§1–2、§3.1–3.4、§4.1–4.3 相關段。
限制：特定訓練與資料架構，不等於所有現代 RAG；未重現實驗。
詳細方法與偏差：`book_project/00_research/r04_retrieval_comparison.md`。

## R10

**From Local to Global: A Graph RAG Approach to Query-Focused Summarization**
版本／狀態：arXiv v2；初稿 2024-04-24
查閱：2026-09-28；讀取深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://arxiv.org/abs/2404.16130)

定位：§3–6；不含全部附錄。
限制：全局問題、兩種語料、模型裁判／主張數；不等於事實正確或總費用降低。
詳細方法與偏差：`book_project/00_research/r04_retrieval_comparison.md`。

## R11

**RAG vs. GraphRAG: A Systematic Evaluation and Key Insights**
版本／狀態：arXiv v3；先查看 v1 後已改以 v3 為交接基準
查閱：2026-09-28；讀取深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://arxiv.org/abs/2502.11371)

定位：v3 §3–5、附錄 M 正文；L 設定參考。
限制：固定 v3；題型與參考答案影響結論；非所有 GraphRAG 皆勝，數值未供正文引用。
詳細方法與偏差：`book_project/00_research/r04_retrieval_comparison.md`。

## R12

**使用大語言模型進行本體學習**  
原文：LLMs4OL: Large Language Models for Ontology Learning  
作者／機構：Hamed Babaei Giglou、Jennifer D’Souza、Sören Auer  
類型：已接受發表的原始研究  
日期：2023-08-02  
版本／狀態：arXiv v2；頁面註明 ISWC 2023 research track  
查閱日：2026-09-28  
讀取深度：`ABSTRACT_AND_METADATA_READ`  
支持章節：第13章  
來源：https://arxiv.org/abs/2307.16648

可支持：研究模型在詞項類型、分類結構與非分類關係抽取的子任務。

限制：子任務成功不等於可無人維護完整企業本體；本輪尚未精讀結果表。

定位：Abstract；Comments；Submission history。正式使用時補出精確小節／頁碼／表號與主張對應。

更新要求：基礎概念可作穩定參考；新增細節仍須回到指定版本查證。


## R13

**專家參與的能力問題擷取與協作本體工程**  
原文：IDEA2: Expert-in-the-loop competency question elicitation for collaborative ontology engineering  
作者／機構：Elliott Watkiss-Leek 等  
類型：研究預印本  
日期：2026-04-01
版本／狀態：arXiv v1；不因年份新就視為主流共識
查閱日：2026-09-28  
讀取深度：`FULLTEXT_TARGET_SECTIONS_READ`
支持章節：第5章、第13章、第16章  
來源：https://arxiv.org/abs/2604.01344

備用／全文入口：https://arxiv.org/html/2604.01344v1

可支持：讓模型提出能力問題，再由領域專家審查與回饋修訂。

限制：預印本與有限場景；第 5 章僅採流程和限制，不引效果數據。接受率分母含審查事件，不能稱原始問題正確率；未複現。

定位：書目及 v1；§1；§3.1–3.4；§4.1–4.3；§5

更新要求：正式寫作或出版前重新核對動態狀態及所用版本。

本輪詳細主張—證據：`book_project/00_research/ch05_evidence.md`；原種子狀態保留在 sources.json。


## R14

**Microsoft Fabric 本體預覽版概覽**  
原文：What is ontology (preview)?  
作者／機構：Microsoft  
類型：供應商官方文件  
日期：2026-07-21  
版本／狀態：2026-09-28 仍標 preview；概覽頁尾 2026-07-21、刷新細節頁尾 2026-05-14；未登入租戶
查閱日：2026-09-28  
讀取深度：TARGET_SECTIONS_RECHECKED
支持章節：第2章、第7章  
來源：[原文](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview)

可支持：描述其企業語意、資料綁定與查詢功能。

限制：只讀公開產品文件、未實測；外部來源需刷新安排，細節有手動及週期刷新，不得寫只能手動或接上即時。

定位：Overview 的 Data binding／Ontology graph／Note；Entity type details 的 Refresh the graph model

本輪詳細主張—證據：`book_project/00_research/ch01_04_evidence.md`；原種子狀態保留在 sources.json 的 handoff_seed_record。

更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。


最新章級查核：`book_project/00_research/ch06_07_evidence.md`；第 8 章另見 `ch08_evidence.md`。

## R15

**Agent integration options for ontology (preview)**
作者／機構：Microsoft。
版本／狀態：preview；選項頁 2026-07-23，MCP server 頁 2026-05-05；未登入租戶
查閱：2026-09-28；深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://learn.microsoft.com/en-us/fabric/iq/ontology/concepts-agent-integration)

定位：Agent integration 的用途、支援選項及 Custom agents；MCP server 的前提、機制與設定（未執行）。
詳細限制與讀取：`book_project/00_research/ch11_12_evidence.md`；未登入租戶或實測服務。

## R16

**Why create an Ontology?**
作者／機構：Palantir。
版本／狀態：2026-09-28 所讀公開頁；未核定統一版號／發布日期
查閱：2026-09-28；深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://www.palantir.com/docs/foundry/ontology/why-ontology)

定位：Why ontology 四構面及 Security；Action permissions 正文；Revert or undo actions 正文／Caveats。
詳細限制與讀取：`book_project/00_research/ch11_12_evidence.md`；未登入租戶或實測服務。

## R17

**Model Context Protocol — Specification**
作者／機構：Model Context Protocol 維護團隊。
版本／狀態：2026-09-28 再查 latest 仍轉向 2026-07-28；未驗證客戶端相容性
查閱：2026-09-28；深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://modelcontextprotocol.io/specification/2026-07-28)

定位：2026-07-28 Overview、Features、Security and Trust & Safety／Implementation Guidelines，未讀全部子規範。
詳細限制與讀取：`book_project/00_research/ch11_12_evidence.md`；未登入租戶或實測服務。

## R18

**Building effective agents**
作者／機構：Anthropic。
版本／狀態：文章標 2024-12-19；2026-09-28 現頁提醒工具資訊已改變；只用架構取捨
查閱：2026-09-28；深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://www.anthropic.com/engineering/building-effective-agents)

定位：另讀 Agents、Combining patterns、Appendix 2 工具定義與測試。
詳細限制與讀取：`book_project/00_research/ch11_12_evidence.md`；未登入租戶或實測服務。

## R19

**Effective context engineering for AI agents**
版本／狀態：線上工程文章；非標準組織規範
查閱：2026-09-28；讀取深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

定位：定義、有效情境組成、Context retrieval and agentic search。
限制：供應商工程實務文章，非獨立控制實驗；只讀指定節。
詳細方法與偏差：`book_project/00_research/r04_retrieval_comparison.md`。

## R20

**使用 AGENTS.md 提供專案指令**  
原文：Custom instructions with AGENTS.md  
作者／機構：OpenAI  
類型：工具官方文件  
日期：本輪未核定，不可補造  
版本／狀態：本次官方入口轉向 ChatGPT Learn 文件  
查閱日：2026-09-28  
讀取深度：`RELEVANT_SECTIONS_READ`  
支持章節：交接工具操作，非書稿論證  
來源：https://developers.openai.com/codex/guides/agents-md

備用／全文入口：https://learn.chatgpt.com/docs/agent-configuration/agents-md

可支持：把簡短專案規則放在根目錄 AGENTS.md，配合明確讀取順序。

限制：只支援本交接包操作，不作為本體技術論證；不要求關閉使用者的安全確認。

定位：Custom instructions with AGENTS.md；How Codex discovers guidance。正式使用時補出精確小節／頁碼／表號與主張對應。

更新要求：正式寫作或出版前重新核對動態狀態及所用版本。


## R21

**大語言模型生成學術本體：工程領域分析**  
原文：Large Language Models for Scholarly Ontology Generation: An Extensive Analysis in the Engineering Field  
作者／機構：Tanay Aggarwal、Angelo Salatino、Francesco Osborne、Enrico Motta  
類型：研究預印本  
日期：2025-06-11  
版本／狀態：arXiv v2；初稿 2024-12-11  
查閱日：2026-09-28  
讀取深度：`ABSTRACT_AND_METADATA_READ`  
支持章節：第13章  
來源：https://arxiv.org/abs/2412.08258

可支持：檢查模型對研究主題之語意關係的辨識能力。

限制：此任務不等於完整企業規則建模；本包不摘錄 F1 數值，使用前需精讀評測。

定位：Abstract；Submission history。正式使用時補出精確小節／頁碼／表號與主張對應。

更新要求：基礎概念可作穩定參考；新增細節仍須回到指定版本查證。


## R22

**What is an ontology? — Azure Digital Twins**
作者／機構：Microsoft。
版本／狀態：頁尾 Last updated 2025-12-12；非整體產品版號
查閱：2026-09-28；深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://learn.microsoft.com/en-us/azure/digital-twins/concepts-ontologies)

定位：定義與 Fabric 差別、策略、DTDL 表示、模型開發路徑。
詳細限制與讀取：`book_project/00_research/ch11_12_evidence.md`；未登入租戶或實測服務。

## R23

**本體常見陷阱掃描工具**  
原文：OOPS! — OntOlogy Pitfall Scanner!  
作者／機構：Ontology Engineering Group  
類型：研究團隊工具頁  
日期：本輪未核定，不可補造  
版本／狀態：官方頁面與工具介紹；本包未上傳任何資料或執行遠端掃描
查閱日：2026-09-28  
讀取深度：TOOL_DESCRIPTION_READ
支持章節：第8章、第13章  
來源：https://oops.linkeddata.es/

可支持：作為檢查本體建模陷阱的工具與研究延伸入口。

限制：掃描通過不等於業務正確；正式研究需追讀工具所連原始論文與檢查範圍。 本輪入口讀取逾時；未升讀取深度，第 8 章不引現行能力。

定位：工具介紹與相關出版連結

更新要求：正式寫作或出版前重新核對動態狀態及所用版本。



最新章級查核：`book_project/00_research/ch06_07_evidence.md`；第 8 章另見 `ch08_evidence.md`。

## R24

**Retrieval-Augmented Generation with Graphs (GraphRAG)**
版本／狀態：arXiv v2；初稿日期為 2024-12-31，不能只從編號猜發布月份
查閱：2026-09-28；讀取深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://arxiv.org/abs/2501.00309)

定位：§1、§2 開頭、§10.1–10.6、§11。
限制：綜述的指定節已讀；被引文章不代表已逐篇精讀；不採過時泛稱。
詳細方法與偏差：`book_project/00_research/r04_retrieval_comparison.md`。

## R25

**限界情境**  
原文：Bounded Context  
作者／機構：Martin Fowler  
類型：資深實務作者的架構說明  
日期：2014-01-15  
版本／狀態：第一手架構評論；非 ontology 成效實驗  
查閱日：2026-09-28  
讀取深度：`RELEVANT_SECTIONS_READ`  
支持章節：第14章、第15章  
來源：https://martinfowler.com/bliki/BoundedContext.html

可支持：大型領域可保留局部一致模型，再明確描述模型間關係。

限制：不能把這篇直接當所有本體方法失敗的證據；書中只是用來檢查強制全域統一的假設。

定位：Bounded Context 主文。正式使用時補出精確小節／頁碼／表號與主張對應。

更新要求：基礎概念可作穩定參考；新增細節仍須回到指定版本查證。


## R26

**dbt 分析語意層**  
原文：dbt Semantic Layer  
作者／機構：dbt Labs  
類型：供應商官方文件  
日期：2026-08-18
版本／狀態：2026-09-28 重讀，頁尾 Last updated Aug 18, 2026；僅頁面更新標籤，非統一產品版本
查閱日：2026-09-28  
讀取深度：`TARGET_SECTIONS_RECHECKED`
支持章節：第1章、第4章、第15章  
來源：[原文](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl)

可支持：可統一指標定義及處理資料連接，是分析需求的比較方案。

限制：供應商自述；未測功能、版本、費率或效益，不與通用本體作全功能等價。

定位：Introduction 第 1–3 段；Get started


更新要求：正式出版前依主張需要重查，動態產品不可只靠此輪資料。

本輪詳細主張—證據：`book_project/00_research/ch01_04_evidence.md`；`book_project/00_research/ch04_supplement.md`；原種子狀態保留在 sources.json。


## R27

**時間資料庫概念共識詞彙：1998 年 2 月版**
原文：The Consensus Glossary of Temporal Database Concepts—February 1998 Version
作者／機構：Christian S. Jensen、Curtis E. Dyreson 編及共同作者
類型：學術術語共識篇章之作者公開 PDF
版本／狀態：February 1998 Version；LNCS 1399, pp.367–405
查閱日：2026-09-28
讀取深度：FULLTEXT_TARGET_SECTIONS_READ
來源：[原文](https://www2.cs.arizona.edu/~rts/pubs/LNCS1399.pdf)

可支持：有效時間與資料庫交易時間的區別。

限制：只讀封面及 §3.1–3.2；不將觀測／抓取／刷新時間一律等同 transaction time，不宣稱已實作時間資料庫。

定位：§3.1 Valid Time、§3.2 Transaction Time，印刷頁 370–371

詳細查核：`book_project/00_research/ch06_07_evidence.md`。

## R28

**PostgreSQL 17 交易隔離文件**
原文：PostgreSQL 17 Documentation: 13.2 Transaction Isolation
作者／機構：PostgreSQL Global Development Group
類型：軟體官方版本文件
版本／狀態：PostgreSQL 17 文件，非最新版本宣稱
查閱日：2026-09-28
讀取深度：FULLTEXT_TARGET_SECTIONS_READ
來源：[原文](https://www.postgresql.org/docs/17/transaction-iso.html)

可支持：交易隔離、併行異常與衝突中止／重試的邊界。

限制：只讀指定段落；未執行 SQL 或真實併行測試，不表示採交易就自動維持所有業務條件。

定位：§13.2 前言、表 13.1、§13.2.1 查詢／更新衝突段、§13.2.3 隔離與失敗處理

詳細查核：`book_project/00_research/ch08_evidence.md`。

## R29

**Making retries safe with idempotent APIs**
作者／機構：Malcolm Featonby / AWS Builders’ Library。
版本／狀態：2026-09-28 所見公開正文，未確認發布日
查閱：2026-09-28；深度：FULLTEXT_TARGET_SECTIONS_READ。
來源：[原文](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

定位：唯一請求識別、semantic equivalence、late arrivals、same ID different intent、conclusion。
詳細限制與讀取：`book_project/00_research/ch11_12_evidence.md`；未登入租戶或實測服務。


## R12 本輪更新｜2026-09-28

**LLMs4OL: Large Language Models for Ontology Learning**；Hamed Babaei Giglou、Jennifer D’Souza、Sören Auer。

類型／版本：已接受發表的原始研究；arXiv v2；頁面註明 ISWC 2023 research track。深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/html/2307.16648v2)；定位：§1；§3；§4.1–4.3 方法與結果文字；§5。

限制：三項子任務與特定資料／模型／最佳提示；未複現或視覺核表，正文不引用成績、模型參數或現行排名。

詳細精讀與種子校正見 `book_project/00_research/ch13_15_evidence.md`；前文為交接登錄，現況以本節及 sources.json 為準。

## R21 本輪更新｜2026-09-28

**Large Language Models for Scholarly Ontology Generation: An Extensive Analysis in the Engineering Field**；Tanay Aggarwal、Angelo Salatino、Francesco Osborne、Enrico Motta。

類型／版本：期刊接受之作者公開稿；arXiv v2；Information Processing & Management accepted camera ready；DOI 10.1016/j.ipm.2025.104262。深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://arxiv.org/html/2412.08258v2)；定位：§3.1–3.3、§4.1–4.4、§5.5、§6、§7、§8 開頭。

限制：工程領域四種關係分類；人工策展參照，未比較非 LLM 方法；不是完整本體。same-as 標籤不等於 OWL 個體同一；未複現、不引 F1。

詳細精讀與種子校正見 `book_project/00_research/ch13_15_evidence.md`；前文為交接登錄，現況以本節及 sources.json 為準。

## R23 本輪更新｜2026-09-28

**OOPS! — OntOlogy Pitfall Scanner!**；Ontology Engineering Group。

類型／版本：研究團隊工具頁；官方頁面與工具介紹；本包未上傳任何資料或執行遠端掃描。深度：OFFICIAL_CATALOGUE_AND_2012_PAPER_TARGET_SECTIONS_READ。

[來源](https://oops.linkeddata.es/catalogue.jsp)；定位：官方目錄 P01–P09 等；ESWC 2012 Did you validate your ontology? OOPS! 摘要／§1–2。

限制：入口曾逾時、目錄本輪成功；2012 論文後段未讀、2014 全文未取；未上傳或執行掃描，不把潛在陷阱當業務錯誤定論。

詳細精讀與種子校正見 `book_project/00_research/ch13_15_evidence.md`；前文為交接登錄，現況以本節及 sources.json 為準。

## R25 本輪更新｜2026-09-28

**Bounded Context**；Martin Fowler。

類型／版本：資深實務作者的架構說明；第一手架構評論；非 ontology 成效實驗。深度：FULL_MAIN_TEXT_READ。

[來源](https://martinfowler.com/bliki/BoundedContext.html)；定位：2014-01-15 Bounded Context 主文。

限制：第一手架構評論，不是企業成效對照試驗；不表示全域模型必敗。

詳細精讀與種子校正見 `book_project/00_research/ch13_15_evidence.md`；前文為交接登錄，現況以本節及 sources.json 為準。

## R30 本輪更新｜2026-09-28

**Ontology Evolution: Not the Same as Schema Evolution**；Natalya F. Noy、Michel Klein。

類型／版本：原始研究公開全文；目標段落精讀；見研究卡。深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://research.vu.nl/ws/portalfiles/portal/29675469/KAIS03.pdf)；定位：書目封面；§1.1；§1.2 開頭；§3.1–3.2；§3.3 開頭。

限制：歷史方法研究，非現行工具或成本實驗；DOI 10.1007/s10115-003-0137-2。

詳細精讀與種子校正見 `book_project/00_research/ch13_15_evidence.md`；前文為交接登錄，現況以本節及 sources.json 為準。

## R31 本輪更新｜2026-09-28

**Methods of managing the evolution of ontologies and their alignments**；Marcin Pietranik、Adrianna Kozierkiewicz。

類型／版本：原始研究公開全文；目標段落精讀；見研究卡。深度：FULLTEXT_TARGET_SECTIONS_READ。

[來源](https://link.springer.com/article/10.1007/s10489-023-04545-0)；定位：§1；§3.3；§4.1 開頭；§4.2.2–4.2.3 解說；§5.1、5.5、6。

限制：小型 Conference 本體、半隨機演化、結構與基準重疊指標；未證明企業真值、普遍省工或大規模效果；未複現。

詳細精讀與種子校正見 `book_project/00_research/ch13_15_evidence.md`；前文為交接登錄，現況以本節及 sources.json 為準。
