# EP12 節目附註

來源第 12 章 1.0.0；實際音訊尚未生成。

- 三個錨點：人工介入 Human-in-the-Loop／HITL；授權 Authorization；冪等性 Idempotency。查議核做驗是本書口訣；補償不是把外部世界倒轉。
- R16 Palantir actions permissions／reverts；R17 MCP 2026-07-28 安全分工；R18 Anthropic 工程建議；R28 PostgreSQL 17 §13.2；R29 AWS Builders’ Library 請求識別、意圖、保留期及參數變更。查閱 2026-09-28，未測真實服務。
- SNAP-001／POL-001：AI 無退款執行權，退款與轉班資格未完整定義；主管核准不升權。逾時、轉班、通知部分成功、設備借用皆為獨立假設。
- 無法律建議、付款操作、端點或併行實驗；聲音生成、時長與實際聽測未完成。

## 可回查來源與限制

- [R16：Palantir 動作權限](https://www.palantir.com/docs/foundry/action-types/permissions) 與 [撤回限制](https://www.palantir.com/docs/foundry/action-types/action-reverts)，2026-09-28 所見公開文件。限定產品文件範圍，未實測。
- [R17：MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)，Security and Trust & Safety；通訊協定與業務授權分開。
- [R18：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)，Agents；工程建議，非安全保證。
- [R28：PostgreSQL 17 交易隔離](https://www.postgresql.org/docs/17/transaction-iso.html)，§13.2；固定版本，未執行併行程式。
- [R29：Malcolm Featonby，Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)，唯一請求識別、語意等價、延遲請求、同識別不同參數；工程案例，不是所有服務共通保證。
- 退款與轉班皆為假設契約演練；POL-001 沒有授予 AI 執行權，也沒有完整退款或轉班資格政策。本章無法律結論、真實端點測試或款項操作。
