# 第 6–7 章近章證據｜2026-09-28

範圍是下列目標段落，非全篇精讀。原始研究／標準、供應商自述、本書設計及假設案例分開。未登入產品、執行遠端本體或下載第三方全文。

## R02｜第 6 章補讀

[Stanford PDF](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf)，2001。實讀 §3 開頭及 Step 3–7，正文頁 6–11；連同原有 Step 1／2，支持概念、屬性、實例及迭代分工。這是方法指南；不把 Protégé-2000 的 facets 說明直接當成現行 OWL／SHACL 同一語意，不沿用舊格式轉換樂觀主張。中文卡片、欄位對應及固定案例為本書設計。

## R07｜第 7 章來源沿革

[PROV-O 固定版](https://www.w3.org/TR/2013/REC-prov-o-20130430/)，2013-04-30 Recommendation。實讀 Abstract、§1.1、§3.1 文字、§3.2 前四類說明；§4 僅沿詞彙入口確認，不宣稱整份形式規範精讀。用於分辨資料事物、處理活動與責任主體；Agent 可包含人、組織、軟體，不專指 LLM。此詞彙可描述來源關係，不使來源自動真實；本書事實卡不是宣稱符合完整 PROV-O 語法的實作。

## R08｜第 7 章時效與情境

[Knowledge Graphs v6](https://arxiv.org/html/2003.02320v6)，2021-09-11。本輪補讀 §3.3 開頭與 §3.3.1、§7 開頭、§7.1.1–7.1.3、§7.2.1。僅採時間／來源情境與資料品質區別，不引用公式、效果數據或舊 RDF* 功能比較；圖資料需要更新流程，不因表示形式自動即時。§3.3.2 以後的技術表示不納入本章教學。

## R14｜第 7 章具體刷新限制

[Overview](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview) 的 Data binding、Ontology graph 及兩處 Note；頁尾 2026-07-21。另讀 [Entity type details](https://learn.microsoft.com/en-us/fabric/iq/ontology/how-to-view-entity-type-details) 的 Refresh the graph model；頁尾 2026-05-14。2026-09-28 公開回傳正文仍標 preview；有登入提示但未繞過或登入。

重要校正：概覽說上游變更須手動刷新，但細節也允許在面板設定週期刷新；不可寫成產品「只能人工更新」。細節區分 schema 改動觸發重取資料與外部來源改動；後者需刷新安排，並提示每次全量刷新有成本。本章只寫「來源變動不等於立即反映；可手動或設定週期刷新」，不引成本數字、不宣稱實測服務延遲或所有部署相同。

## 新增 R27｜有效時間的原始術語來源

Jensen、Dyreson 編及共同作者，*The Consensus Glossary of Temporal Database Concepts—February 1998 Version*，LNCS 1399，367–405（1998）。[作者大學提供 PDF](https://www2.cs.arizona.edu/~rts/pubs/LNCS1399.pdf)，[作者書目](https://www2.cs.arizona.edu/~rts/publications.html)。實讀封面、§3.1 Valid Time、§3.2 Transaction Time（印刷頁 370–371），非全篇。

只取「主張在所建模現實何時成立」與「資料庫中何時為當前可取記錄」的區別。本文的觀測時間、取得時間、刷新完成時間不冒充同一種正式 transaction time。適用範圍是術語校準，沒有主張本案已實作雙時間資料庫或遵循現行 SQL 標準。搜尋頁的近期擷取日期不當作出版年。

## 主張落點

| ID | 章／位置 | 依據與限制 |
|---|---|---|
| F22 | 6，五卡至迭代 | R02 方法；實際卡片為本書原創；不以格式可解析冒充推理 |
| F23 | 7，來源沿革 | R07 §3.1／3.2；鏈可追溯不保證真實、獨立或完整 |
| F24 | 7，三種時間 | R27 §3.1／3.2 校準；案例 observed_at 非每筆生效起點 |
| F25 | 7，刷新 | R14 細節與概覽交叉核對；手動／週期皆有安排，沒有即時性承諾 |
| F26 | 7，可信程度 | R08 品質小節；本書以缺項／衝突及證據表述，不捏造模型信心百分比 |

## 案例邊界

P001/P003 同名異人、S102 教室未知、E002 付款未知、E005 退款未知均已固定。SNAP-001 是九月二十八日上午九點（臺灣時間）的教學快照；政策 POL-001 生效自九月一日零時。報名未帶事件時間，不能重建歷史。第 7 章若用不同時間的座位狀態，只作獨立假設推演，不能回填 fixed fixture。
