# R-06／第 11–12 章近章證據

查閱 2026-09-28。完成本書使用的目標頁與限制，未登入供應商租戶、未連實際企業資料，沒有 MCP／支付服務實測。本書工具契約仍是設計規格。

## R17 協定版本

[MCP latest](https://modelcontextprotocol.io/specification/latest) 本輪仍轉向 [2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)。實讀 Overview、Key Details、Features、Security and Trust & Safety、Implementation Guidelines。

可支持：應用、連接端與服務端間的通訊約定；資源、提示模板及工具等能力。工具與資料不是因接通就可信，實作者仍需同意、權限與資料控制。本文不引用舊版初始化細節，不聲稱所有客戶端已支援同一版；若正式實作需核對雙端能力及傳輸。未精讀全部子規範，不能稱全規範精讀。

## R15 Fabric 公開預覽

[整合選項](https://learn.microsoft.com/en-us/fabric/iq/ontology/concepts-agent-integration)，頁尾 2026-07-23；實讀 How agents use ontology、Supported agent descriptions 與 Custom agents。另讀 [MCP server](https://learn.microsoft.com/en-us/fabric/iq/ontology/how-to-use-ontology-mcp-server) 的用途、Prerequisites、How it works、設定說明，頁尾 2026-05-05。

兩頁仍標 preview。頁面有登入提示但工具提供公開正文，未登入或繞過限制。MCP 選項存在，不表示只用 URL 就已具備租戶能力、身分與權限。該功能列付費容量及租戶啟用前提；本書不提供購買建議，也不將「更一致、更可信」的產品自述當對照實驗。只描述整合方向，不引用頁面的模型選單或點擊程序。

## R16 營運本體與實際限制

重讀 [Why create an Ontology](https://www.palantir.com/docs/foundry/ontology/why-ontology) 的四構面及 Security。補讀 [Action permissions](https://www.palantir.com/docs/foundry/action-types/permissions) 的 Apply action、Submission criteria、讀寫授權、Side effect permissions，以及 [Revert or undo actions](https://www.palantir.com/docs/foundry/action-types/action-reverts) 全部正文及 Caveats。公開頁未取得可核定的整體產品版號或更新日。

產品把資料、邏輯、動作、安全整合，但實際動作仍涉及提交條件及對象設定。讀取控制不可直接視為寫入控制；通知失敗時編輯仍可能成功。撤回有儲存版本及後續編輯等限制，且不撤回通知或 webhook 副作用。這些是該產品文件的限制，不是晨光已採用或所有平台一樣的證明。

## R18／R19 工程觀點

R18 [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) 另讀 Agents、Combining patterns、Appendix 2 的工具定義與測試建議。用於環境回饋、停止條件、工具責任與簡單方案；不採當代模型排行或案例效能數字。R19 定義與按需情境取用見 R-04 卡。兩者均為供應商經驗，不證明單靠提示即可強制授權。

## R22 與 R14／R26 的補足

[Azure Digital Twins ontologies](https://learn.microsoft.com/en-us/azure/digital-twins/concepts-ontologies)，頁尾 2025-12-12；實讀定義、策略、DTDL 表示、模型開發路徑。文件明分此概念與 Fabric ontology，能支持重用／擴充／轉換的選擇，不支持自動無損搬移或完整 OWL 語意相容。

R14 概覽及刷新限制已在本輪 ch06_07_evidence.md 核對；R26 已在 ch04_supplement.md 核對。本次 R-06 結案範圍為書稿所需公開文件，不把平台探索或租戶實測列成完成。

## 新增 R29：安全重試的介面契約

Malcolm Featonby，AWS Builders’ Library，[Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)。未見可確認發布日期；查閱日如上。實讀 Reducing client complexity 的唯一請求識別、Retries and semantic equivalence、Late arriving requests、Same client request ID, different intent、Conclusion；未執行文中雲端命令。

獨立請求識別可以表達一次業務意圖，不能只以相同參數推定同一次請求。服務端持久紀錄與副作用需協調；相同識別但參數改變應拒絕或明確處置，保留期限也有邊界。這是工程實務，不是跨所有外部服務的 exactly-once 保證。晨光重試例是本書設計，支付端契約仍須逐個驗證。

## 主張定位

- F37：語意、資料與工具三份契約是本書架構檢核，不是新增正式標準。
- F38：MCP 可選、接通不等於意思與權限一致——R17 版本頁、R15；晨光不依賴特定產品。
- F39：最少足夠脈絡、可信身分來源與不可信檢索內容分開——R17／R19＋固定工具設計。
- F40：「查—議—核—做—驗」為本書教學口訣；固定案例 AI 僅 read／propose，不因主管核准取得 execute。
- F41：超時結果待確認、持久請求識別、相同意圖重試——R29；具體服務待實測。
- F42：併行與部分成功要在執行服務處理——R28／R16；轉班例另設假設條件。
- F43：核准不保證可逆，記錄撤回不會自動逆轉真實外部動作——R16 revert 限制與本書假例。

停止條件：本章未解主張已刪除或限定；沒有付費、未查證即時狀態或授權自動擴張的結論。R-06 不代表未讀子頁全數精讀。
