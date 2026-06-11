《AI 工程操作系統：Codex × GitHub × 真實專案的完整腦內地圖》
副標
給正在用 AI 開發真實產品的人，一套能靠「聽」建立起來的系統模型
版本對齊日期 2026 年 4 月 12 日。
官方依據摘要 本書以今天查核到的官方文件為準。OpenAI 官方文件顯示，Codex 已形成 App、CLI、IDE extension、Cloud 的多表面工作系統，核心能力包含平行 threads、worktrees、review、skills、automations，以及 approval、sandbox、network controls；但 Windows 上的能力表現會因 App、CLI、IDE 不同而不同。Google 官方文件顯示，NotebookLM 可吃進 docx、md、txt、pdf、pptx、URL 等來源，Audio Overview 可選語言、可下載分享。
工程骨架與版本敏感說明 長期穩定的工程骨架，是 Git 這套「本地如何記錄變更」的模型，以及 GitHub 這套「遠端如何同步、審查、合併」的模型。Git 官方仍把世界分成 working tree、staging area、Git directory；GitHub 官方仍把 fetch、push、PR、merge 定義成不同層次的動作。這些是地板，不會因工具換皮就消失。
【版本敏感】Codex 的產品表面、Windows 工作方式、approval policy、sandbox mode、network access、skills、subagents、automations、方案與費率，都會隨版本、權限與工作區政策變動。尤其截至今天，Codex App 已可在 Windows 上原生用 PowerShell 與 Windows sandbox；但 Codex CLI 官方仍註明 Windows 支援屬 experimental、最佳體驗建議在 WSL；IDE extension 設定頁則寫 Windows 上的 agent mode 目前需要 WSL。方案與費率也在 2026 年 4 月仍處於遷移中，不同方案可能對應 token-based 或 legacy rate card。
--------------------------------------------------------------------------------
前言
這本書不是教你背指令，而是替你建立地圖
很多人都有同一種挫折感。
他在 GPT 裡一問，當下覺得全懂。 一離開對話框，回到自己的專案，腦中又糊掉。 看到 branch、commit、push、PR、deploy、worktree、handoff、sandbox 這些字，像每個都認識，但一放進真實工作流裡，就不知道自己現在到底站在哪裡。
這通常不是理解力差。
而是腦中還沒有一張穩定地圖。
沒有地圖時，你每次遇到問題，都只能重新問一次。 slot 為什麼怪怪的，要問。 Google Calendar 為什麼沒建立事件，要問。 本地明明好了，GitHub 為什麼沒更新，要問。 明明按了提交，為什麼還沒上線，也要問。
久了你會誤以為：自己只能靠問。 其實不是。真正的問題是，你沒有把這些事情放進同一張系統圖裡。
這本書要做的，不是把你變成一個會背一堆 Git 指令的人。 也不是把你變成一個只會講 prompt 的人。 它要做的，是替你建立一套 AI 工程操作系統。
這套系統裡，有幾句話你要反覆聽到，直到它們變成反射。
AI 負責產生變更。 Git 負責記錄變更。 GitHub 負責同步變更。 我負責決定變更。
還有三個檢查問題，你要反覆問自己。
我現在在哪一層？ 我現在在改什麼？ 誰負責記錄、同步、驗證與上線？
你接下來會看到的，不是一堆分散知識點。 而是一個固定場景：一個跑在 Windows 開發環境上的預約／排程系統。它有前端頁面互動，有 slot 產生與選取規則，有 booking 流程，有 route.ts／API endpoints，有類 Firestore 的雲端資料庫，有 Google Calendar 同步，有 token、auth、env config，有 Git 本地版本管理，有 GitHub 遠端同步與 PR，也有最後的部署與發版。
我不會中途換案例。 因為讀者最容易卡住的，不是單一技術點，而是抽象概念一直換場景之後，腦中抓不到骨架。
這份書稿也刻意寫成可直接拿去做 NotebookLM Audio Overview 的來源稿。官方目前支援 docx、txt、md、pdf、pptx 與 URL 等來源；Audio Overview 可選語言、可下載或分享，所以我會盡量用可朗讀的節奏、少表格、少依賴視覺版面來寫。【版本敏感】NotebookLM 的方案、額度與進階功能會隨方案而變。
你不用把自己想成「正在學會用 AI 幫我寫 code」。 你要把自己想成「正在學會管理一條從需求到上線的變更鏈」。
當這張地圖穩了，你就不會每次都從零問起。 你會開始知道，哪一段可以交給 Codex 先跑，哪一段一定要自己做決策，哪一段出了問題要先查 Git，哪一段要看 GitHub，哪一段其實根本還沒部署。
這時候，你才不是在使用 AI。 你是在指揮一個工程系統。
--------------------------------------------------------------------------------
第一部：先把世界看對
第 1 章
你進入的不是寫程式，而是 AI 工程操作系統
一、這章只講一件事
這章只講一句核心：
你現在做的，不是單純寫程式；你是在管理一條「需求變成上線版本」的完整系統。
如果你只把自己想成「我在改一個函式」，你就會一直迷路。 因為真實專案從來不是只有函式。 它還有資料流、權限、版本、同步、驗證、發版、回滾，以及誰有權決定哪些事情可以真的進到線上。
所以這本書一開始就要先把視角拉高。 不是先學按鈕。 不是先背指令。 而是先知道：你站在什麼系統裡。
--------------------------------------------------------------------------------
二、先用畫面理解
先不要想成你坐在電腦前改檔案。 先想成你站在一個控制塔裡。
你的面前不是一個工具，而是一條流動中的航線。
左邊飛進來的是需求。 中間經過的是分析、修改、測試、記錄、同步。 右邊飛出去的是可交付版本。
控制塔裡站著很多角色。
ChatGPT 幫你想清楚路線。 Codex 幫你真的去搬動東西、改東西、跑東西。 Git 幫你把每次變更留下可追溯的快照。 GitHub 幫你把本地世界同步到遠端協作世界。 部署平台把某個版本送到真正服務使用者的地方。 而你，是塔台裡最後那個能說「這個版本可以過」的人。
請你在腦中先放一張最粗的系統圖：
需求 → 我定義範圍與驗收 → ChatGPT 幫我釐清策略 → Codex 產生變更 → Git 記錄變更 → GitHub 同步與審查變更 → 部署平台交付變更 → 使用者真的用到變更
這張圖先不用細。 但你要先接受一件事：
你不是在跟一個 AI 聊天而已。你是在操作一個多層系統。
OpenAI 官方目前把 Codex 定位成 coding agent，並且拆成 App、CLI、IDE extension、Cloud 等不同表面。Codex App 主打平行 threads、worktrees、automations 與內建 Git；CLI 是在終端機本地讀、改、跑；IDE extension 使用與 CLI 相同的 agent 與共享設定；Cloud 則是背景雲端環境。這不是「同一個視窗換皮」而已，而是同一條工程鏈在不同工作表面的落點。
錨點句：你不是在寫一支程式，你是在管理一條變更供應鏈。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這章最重要的幾個字，翻成人腦真的能用的版本。
操作系統，Operating System。 白話講，不是你電腦裡那個 Windows。 這裡指的是：一整套讓工作能穩定流動的規則。 口語定義：讓事情不是靠運氣完成，而是靠流程完成。
變更，Change。 白話講，就是「現在和剛剛不一樣了」的那一段差異。 可能是多一個按鈕，少一個 bug，改一條 API，換一個 token 流程。 口語定義：任何讓系統變得不同的東西。
代理，Agent。 白話講，是能幫你讀、改、跑、查的一個執行者。 它不是老闆，也不是產品負責人。 口語定義：會動手的人，不是負責拍板的人。
工作流，Workflow。 白話講，是事情從開始到完成的路線。 不是單一步驟，而是步驟之間的因果。 口語定義：一件事怎麼走到做完。
交付，Delivery。 白話講，不是「我本地改好了」。 而是該被看到的人，真的看得到、用得到、驗得到。 口語定義：變更真的到位。
你現在先不用急著把 branch、HEAD、rebase 全背起來。 今天這一章只要先抓住這個底層感覺：
工程不是檔案集合，工程是變更流。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們整本書固定的主案例。
你在做一個預約／排程系統。 使用者打開頁面，看到可預約 slot。 他點了一個時段，畫面出現 selected 樣式。 接著送出 booking。 前端把資料送到 API route。 API 再把資料寫進雲端資料庫。 如果需要同步日曆，就再去打 Google Calendar。 最後你希望管理者在後台看得到，使用者的預約狀態也正確，線上環境也跟著更新。
現在請你注意。
這整件事裡，任何一個地方出錯，都可能讓你誤以為自己只是「某個函式沒寫好」。
其實不是。
假設你把 slot 規則改了。 你以為自己改的是「可選時段邏輯」。 但 UI selected 樣式怪怪的，可能是前端 state 沒跟著同一套規則走。 可能是資料模型回傳的欄位變了。 可能是 API 還在用舊的 slot shape。 可能是本地跑的是新資料，GitHub 上遠端分支還是舊版。 也可能是 GitHub 其實更新了，但部署平台還沒上到線上。
你看，這就是關鍵。 你不是在改一個點。 你是在動一條鏈。
再看另一個場景。
你已經寫好 route.ts，也測到 API 被打到了。 但 Google Calendar 沒建立事件。 這時候，如果你腦中沒有系統圖，你就會一直追那個建立事件的函式。
可是真實世界裡，問題可能在：
資料有沒有進到 API。 token 有沒有真的可用。 權限範圍對不對。 env 有沒有在本地和部署環境都設好。 資料模型能不能被轉成 Calendar event。 同步流程是同步失敗、還是其實根本沒被觸發。 甚至是你以為自己修好了，但只是本地修好，還沒同步、還沒部署。
所以，從現在開始，你遇到任何 bug，都先不要問：
「是哪個函式壞了？」
先問：
我現在在哪一層？ 我現在在改什麼？ 誰負責記錄、同步、驗證與上線？
這三句話，是把你從亂抓函式，拉回系統視角的第一把繩子。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這個視角放回 Codex。
Codex 不是一個魔法筆。 它是被 OpenAI 拆成多個工作表面的 coding agent 系統。
Codex App 是桌面工作中心。官方文件把它寫成能在不同專案之間切換、平行跑 threads，並內建 worktree、automations 與 Git 功能；你可以在裡面看 diff、留 inline comments、stage / revert、commit、push，甚至建立 pull request。
Codex CLI 是終端機裡的本地代理。它可以在你選定的目錄讀 repo、改檔案、跑命令，還能用 /review 做本地 code review，並透過 approval 與 sandbox 控制它能動到哪裡。
Codex IDE extension 是編輯器裡的協作界面。官方文件說它使用和 CLI 相同的 agent 與共享設定；你可以在 IDE 裡本地做事，也可以把大任務委派到 cloud，再把結果拉回本地套用。
Codex Cloud 則是背景雲端執行面。官方文件把它定位成可在自己的 cloud environment 裡平行處理背景任務，並支援從 IDE 或 GitHub 委派。
【版本敏感】Windows 上不要把三個表面混成一句話。今天的官方狀態是：Codex App 已可在 Windows 原生用 PowerShell 加 Windows sandbox；CLI 文件仍寫 Windows support is experimental，最佳體驗建議 WSL；IDE extension 設定頁則寫 Windows 上 agent mode 目前需要 WSL。這代表你不能把「我在 App 上做得到」直接推論成「CLI 與 IDE 一定同樣做得到」。
所以你在 Codex 工作流裡，真正要養成的不是「叫它幫我寫」。 而是：
先定義任務邊界。 再決定在哪個表面做。 再決定允許它做到哪裡。 最後用 Git / GitHub 把它產生的變更放進可追蹤的工程流程。
也就是說，Codex 不是流程本身。Codex 是流程裡的執行者。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：我會下 prompt，就等於我會做專案。
不是。 會下 prompt，只代表你能讓代理開始動。 專案能不能完成，還取決於你有沒有把 UI、API、資料、權限、版本、部署放進同一張圖。
第二個誤解是：Codex 改完、畫面也跑了，就算完成。
不是。 那常常只代表「變更被產生了」。 還沒記錄，還沒同步，還沒合併，還沒部署，還沒驗收。
第三個誤解是：我用了 GitHub，所以我有版本控制。
不是。 真正記錄變更的是 Git。 GitHub 主要是遠端同步與協作中心。 你沒 commit，GitHub 沒東西好同步；你沒 push，GitHub 也不會突然知道你本地做了什麼。Git 官方把 committed 定義為資料已安全存到本地資料庫；GitHub 官方把 push 定義成把本地變更推到線上 repo。這兩件事本來就不是同一步。
第四個誤解是：給 Full Access，就代表該全部交給 Codex。
不是。 官方文件反而一直提醒你要謹慎。CLI 的 Full Access 與 IDE 的 Agent Full Access，都代表它可在更大範圍內讀、改、跑，甚至含網路；官方都明確寫要 sparingly 使用、只在你信任 repo 與任務時才這樣做。權限變大，只代表風險變大，不代表決策責任消失。
--------------------------------------------------------------------------------
七、能力邊界
這本書之後會反覆用三層來講能力邊界。 這一章先把總版放進你腦中。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是改一個表單 UI、補 loading state、寫測試、補文件、整理型別、做小範圍重構、把 route handler 拆乾淨、產出初版 diff。這些工作的共通點是：範圍明確、回頭檢查成本低、錯了容易回滾。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 slot 規則設計、booking 流程改版、Google Calendar 同步策略、auth 流、資料模型調整、跨頁面狀態一致性、是否改 schema、是否拆服務。這些工作不是不能讓 Codex做，而是你不能把「定義正確」這件事一起外包。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、真實資料庫危險操作、權限設定、正式發版、法規與資安判斷、商業取捨、不可逆 migration、對外承諾。這些事情真正危險的不是技術難度，而是責任歸屬。
官方文件對 approval、sandbox、network access、full access 的設計，其實就在提醒你這件事：代理能做什麼，來自你給它什麼邊界；而邊界一旦放寬，就更需要人類負責審核與決策。【版本敏感】例如今天官方文件寫到，app / CLI / IDE 預設的 workspace-write 模式下，網路預設是關的；只有你另外開啟，或切到 full access 類型的模式，才會變。
所以，真正成熟的 AI 工程師，不是最敢放權的人。 而是最知道哪裡可以放，哪裡不能放，哪裡只能放一半的人。
--------------------------------------------------------------------------------
八、一句帶走
你不是在請 AI 幫你寫幾行 code；你是在管理一條從需求到交付的變更系統。
--------------------------------------------------------------------------------
本章記憶點
工程不是檔案集合，工程是變更流。
Codex 會幫你產生變更，但不替你承擔架構責任。
完成變更，不等於完成交付。
本章最小實戰動作
拿一張紙，或開一個新檔案，寫下你的預約系統六格圖：UI、slot、API、資料庫、Google Calendar、Deploy。然後在旁邊補上四句：AI 負責產生變更，Git 負責記錄變更，GitHub 負責同步變更，我負責決定變更。
本章一句帶走
你不是在寫一支程式，你是在管理一條變更供應鏈。

第 2 章
四個角色：ChatGPT、Codex App、Codex CLI、IDE Extension 各自是誰
一、這章只講一件事
這章只講一句核心：
這四個名字不是同義詞，它們是同一套 AI 工程系統裡的四個不同工位。
如果你把工位看錯，你就會在錯的地方期待錯的東西。 你會拿 ChatGPT 當成 repo 操作台。 你會把 Codex App 當成只是比較漂亮的聊天視窗。 你會把 CLI 當成 Git。 你會把 IDE extension 當成單純自動補全。
結果就是：事情明明在動，你卻一直不知道「現在到底是誰在負責哪一段」。
這本書要你建立的，不是「會不會用某個介面」。 而是「我能不能一眼分出，現在需要的是思考台、調度台、終端現場，還是編輯器內協作台」。
--------------------------------------------------------------------------------
二、先用畫面理解
先在腦中放一個畫面。
想像你面前有一個專案戰情室，裡面不是一張桌子，而是四張桌子。
第一張是白板桌。 你站在那裡想需求、拆問題、定義驗收。 這張桌子，叫 ChatGPT。
第二張是調度桌。 你在這裡同時開幾個任務、切換不同 thread、看 diff、收斂 review、決定要不要 commit、push、PR。 這張桌子，叫 Codex App。官方把它定位成一個 focused desktop experience，用來平行處理 Codex threads，並且內建 worktree、automations 與 Git 功能。
第三張是終端現場桌。 你站在某個資料夾裡，真的讓 agent 去讀專案、改檔案、跑命令、驗證結果。 這張桌子，叫 Codex CLI。官方把它定義成可以在你本機終端機裡執行的 coding agent，能在選定目錄讀、改、跑。
第四張是鍵盤旁副駕桌。 你正在 VS Code、Cursor、Windsurf 裡看檔案，它就貼著你正在看的內容一起工作，幫你根據開啟的檔案與選取的程式碼協作。 這張桌子，叫 Codex IDE extension。官方文件說它直接把 Codex 放進 IDE，而且使用和 CLI 相同的 agent、共享同一套設定。
你可以把這張圖記成：
需求進來 → ChatGPT 把問題講清楚 → Codex App 安排與追蹤任務 → Codex CLI 在終端機真的動手 → Codex IDE extension 在編輯器裡貼著檔案協作 → Git 記錄變更 → GitHub 同步變更 → Deploy 交付變更
這裡最重要的一句話是：
ChatGPT 幫你想，Codex 幫你做；但做事也分不同工位。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這章的名詞翻成你真的能在腦中叫得出來的版本。
對話式 AI，ChatGPT。 白話講，就是你拿來想清楚問題、比較方案、整理脈絡、問概念、拆需求的對話工作台。官方把它放在 AI chatbot 的位置，支援對話、web search、寫作與程式協作、資料分析等能力；在本書裡，我們把它放在「思考、規劃、講解、策略層」。
桌面工作中心，Codex App。 白話講，就是專門拿來管理 Codex 任務的桌面總控台。 口語定義：開多工、看結果、收斂 review 的地方。 它不是單純聊天窗。它的角色是把多個 thread、worktree、diff review、內建 Git 動作放在一個桌面中心裡。
命令列介面，Command-Line Interface，CLI。 白話講，就是在終端機裡直接讓 agent 進某個目錄做事。 口語定義：真正站進資料夾裡動手的入口。 你在這裡最能感覺到「它正在讀 repo、改檔、跑測試、看命令結果」。
整合開發環境擴充，IDE extension。 IDE 是 Integrated Development Environment，整合開發環境，簡單講就是你平常寫程式的編輯器工作台。 extension 是擴充套件。 口語定義：貼在編輯器裡、跟著你正在看的檔案一起工作的代理入口。 它的特點不是「比較聰明」，而是「上下文離檔案最近」。它能直接吃你目前開的檔案、選取的區塊、當前編輯節奏。
工作表面，surface。 白話講，就是同一類能力的不同入口。 你可以把它理解成「同一支隊伍，不同工位」。 不是誰取代誰，而是誰更適合哪個時刻。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在把四張桌子放回我們固定的主案例：預約／排程系統。
你今天收到一個需求：
「管理者要能設定某些時段不可預約；前端要正確顯示 selected 與 disabled；送出 booking 後要寫進資料庫，並同步建立 Google Calendar 事件。」
這時候，ChatGPT 最適合做的，不是直接衝進 repo 大改。 它最適合先幫你把需求拆成幾層：
前端顯示層：哪些 slot 要反灰，哪些要 selected。 規則層：slot 產生與選取邏輯到底怎麼算。 流程層：booking 成功後，哪些步驟要依序發生。 資料層：Firestore 類型的文件要存哪些欄位。 同步層：Google Calendar 何時建立事件，失敗怎麼重試。 驗收層：使用者看到什麼，管理者看到什麼，哪些算成功。
這時候你不是在「問 AI 幫我寫 code」。 你是在讓它幫你把系統分層。
接著，Codex App 很適合登場。 你可以把這個需求拆成兩個 thread。 第一個 thread 專心處理 UI 與 slot state。 第二個 thread 專心處理 route.ts、資料寫入與 Google Calendar 同步。 因為 App 本身就是拿來平行跑 threads、看 diff、做 review 的桌面中心，所以它適合你一邊看整體，一邊控制變更不要混成一團。
然後，當你想深入某個專案目錄，像是進到 app/api/booking/route.ts 那一層，真的跑命令、看測試、查目前 repo 狀態時，Codex CLI 很適合。 因為 CLI 的本質就是：在你所在的目錄，讓 Codex 真正讀、改、跑。你會更直接感受到檔案系統、命令輸出、測試結果、git status 這些東西的現場感。
而當你已經坐在編輯器裡，正在看 BookingForm.tsx、slotRules.ts、route.ts、calendarSync.ts，這時 Codex IDE extension 最順。 因為它離你正在看的檔案最近。你可以直接利用目前開啟的檔案與選取的程式碼，讓它做局部修改、解釋、重構、補測試，甚至把較大的工作委派到 cloud，再把結果拉回本地。
你可以把這個專案裡的分工記成這樣：
ChatGPT：先把 booking、slot、Calendar 的問題講清楚。 Codex App：把不同任務分線處理，集中 review。 CLI：在某個資料夾裡真正動手。 IDE extension：貼著你正在看的檔案加速修改。
工位選對，腦就不會亂。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這四個角色，放回你每天真的會走的工作流。
一個成熟的節奏通常是這樣：
先在 ChatGPT 把需求講清楚。 不是只問「幫我做」。 而是先問：「這個 slot selected 與 disabled 的狀態，應該拆成哪些 state？Google Calendar 沒寫入時，失敗點可能落在哪幾層？這次變更的最小驗收是什麼？」 這一步的價值是：先把模糊變成可執行。
接著進 Codex App。 你選 project，開 thread，決定要用哪種模式，並且用它集中看 diff、留 inline comments、stage、revert、commit、push、PR。官方文件明確寫到，App 內建 common Git features，能直接看 local project 或 worktree 的 diff，也能在 app 內 commit、push、建立 pull request。
當你需要貼近現場，進入某個目錄做深度處理時，用 Codex CLI。 官方文件把 CLI 寫得很直接：它就是本地 terminal 裡的 coding agent，你可以在目前目錄讓它 inspect repository、edit files、run commands。這一層最像真正站進工地。
當你已經在編輯器裡流暢工作，就用 IDE extension。 因為它和 CLI 共用同一個 agent 與設定，所以你不用把它想成另一套完全不同的東西；它只是把同一類能力搬到編輯器裡，讓你能利用開啟檔案、選取程式碼與本地上下文來協作。它也能把較大的工作 offload 到 cloud，再把結果帶回本地。
有一個很容易被忽略的點是：App 和 IDE extension 可以在同一專案自動同步。 官方文件寫到，當兩者都在同一個 project 時，Codex app 和 IDE extension 會自動 sync；你可以在 app 看 IDE context，也能在 IDE 看到 app 裡跑的 threads。這代表它們不是兩個互相孤立的宇宙，而是同一條工作流的兩個表面。
【版本敏感】Windows 上一定要分開看。 今天官方文件顯示，Codex App 已可在 Windows 原生跑 PowerShell，並使用 native Windows sandbox，也可切到 WSL；官方甚至建議預設優先考慮 native Windows sandbox。可是 CLI 與 IDE extension 的 Windows 狀態仍有差異：CLI 官方頁面寫 Windows support is experimental，最佳體驗建議在 WSL workspace；IDE 文件也寫 Windows support is experimental，而且 IDE settings 頁面明確註明「Codex agent mode on Windows currently requires WSL」。所以你不能把「App 在 Windows 原生可跑」直接等同於「CLI 與 IDE 在 Windows 的行為完全一樣」。
【版本敏感】登入方式也會影響你怎麼理解這四個角色。 官方文件寫到，Codex App、CLI、IDE extension 都支援用 ChatGPT 帳號或 API key 登入，但 Codex cloud 需要 ChatGPT 登入；而且使用哪種登入方式，會影響可用功能與 admin controls。這就是為什麼「同一個 OpenAI 生態系」不等於「每個表面都完全同權限、同能力」。
所以，角色分清楚之後，你的工作流要這樣想：
ChatGPT 負責把問題想清楚。 Codex App 負責把多任務收斂成可 review 的變更。 CLI 與 IDE extension 負責在不同工作位真的把變更做出來。 Git 負責記錄變更。GitHub 負責同步變更。我負責決定變更。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：ChatGPT 就是 Codex。
不是。 ChatGPT 是對話式思考台。 Codex 是 coding agent 的工作系統。 它們可能共用帳號、共用某些生態與方案，但工位不同，期待就應該不同。ChatGPT 可以幫你把 booking 流程、slot 規則、驗收條件想清楚；真正進 repo 讀、改、跑、review，應該落在 Codex 的工作表面上。
第二個誤解是：Codex App 只是比較大的聊天視窗。
不是。 官方文件把它寫得很明確：它是桌面工作中心，重點是 parallel threads、worktrees、automations、built-in Git。你在這裡做的不是單純聊天，而是任務調度與變更收斂。
第三個誤解是：IDE extension 只是自動補全。
不是。 官方文件寫的是 read、edit、run code；預設 Agent mode 可以在 working directory 裡讀檔、改檔、跑命令，還能視情況委派到 cloud。它的價值不只是補字，而是把 agent 放進你正在看的編輯脈絡裡。
第四個誤解是：同一個帳號、同一個專案，就代表每個表面完全一樣。
不是。 Windows、登入方式、approval、sandbox、是否在本地或 cloud，都會影響能力邊界。尤其 Windows 上，App、CLI、IDE 的成熟度和執行位置今天就不完全相同。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，重點不是「誰比較強」，而是「哪種決策應該落在哪個工位」。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是把 BookingForm.tsx 的 selected 樣式修到和 slot state 一致、補一組 API 測試、整理型別、把一個過長的 handler 拆成幾個函式、補 loading 和 error state、補文件。這種事最適合在 CLI 或 IDE extension 動手，在 App 集中 review。官方文件也反覆強調 diff review、Git checkpoints、把建議當 PR 來看。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 slot 產生規則到底怎麼定、Google Calendar 同步要同步到哪一種 event model、booking 失敗是要 rollback 還是部分成功、資料模型欄位要不要改、這次要不要切新 branch、PR 要怎麼拆。這些事 ChatGPT 可以幫你比較方案，Codex 可以幫你做草案與實作，但最後的定義權在你。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、真實資料庫危險操作、權限設定、不可逆 schema migration、正式發版、法規與資安取捨、商業承諾。 就算你給了更大的 access，也不代表你應該把責任一起外包。官方文件對 approvals、sandbox 與 full access 的設計，本質上就是在提醒你：能力可以放寬，責任不能轉移。
把這個邊界放回四個角色，你會更清楚：
ChatGPT 可以幫你想，不替你拍板。 Codex App 可以幫你收斂，不替你負責。 CLI 和 IDE extension 可以幫你動手，不替你承擔後果。 最後，我負責決定變更。
--------------------------------------------------------------------------------
八、一句帶走
先分清工位，再分派工作；不要拿錯角色，期待錯責任。
--------------------------------------------------------------------------------
本章記憶點
ChatGPT 是思考台，不是 repo 操作台。
Codex App 是調度與 review 中心，CLI 是終端現場，IDE extension 是編輯器內副駕。
同一個生態，不等於同一個工位；同一個帳號，也不等於同一種能力。
本章最小實戰動作
拿你的預約系統，現在就把手上正在做的一件事拆成四句： 「這件事要先在 ChatGPT 想清楚什麼？」 「要不要在 Codex App 分 thread？」 「哪一段適合在 CLI 動手？」 「哪一段適合在 IDE extension 貼著檔案改？」
本章一句帶走
ChatGPT 幫我想，Codex 在不同工位幫我做；我先選對工位，事情才會做對。

第 3 章
四層現實：Local、Git、GitHub、Deploy
一、這章只講一件事
這章只講一句核心：
Local、Git、GitHub、Deploy 是四層現實，不是四個同義詞。
你一旦把這四層混在一起，後面所有名詞都會開始打結。 你會以為本地畫面跑起來，就等於專案已經被記錄。 你會以為 commit 之後，GitHub 應該自動看得到。 你會以為 GitHub 上合併了，使用者就一定已經用到。 但 Git 官方對 Git 的定義，本來就是把工作區、暫存區、Git 目錄分開；GitHub 官方對 remote repository、push、pull request、deployment environment 的定義，也本來就是不同層次的動作。
這一章要做的，就是在你腦中立一張非常穩的四層圖。 之後你每次卡住，都先回來問：
我現在在哪一層？ 我現在在改什麼？ 誰負責記錄、同步、驗證與上線？
--------------------------------------------------------------------------------
二、先用畫面理解
把你的專案想成一棟四層樓的建築。
第一層是 Local。 這是你的工作桌。檔案真的攤在你電腦磁碟上，dev server 在這裡跑，瀏覽器看到的本地畫面也在這裡。
第二層是 Git。 這不是另一台電腦，也不是 GitHub。 這是一個「本地版本檔案館」。 你把哪些變更放進 staging area，Git 就知道你下一張快照要收哪些東西；你做 commit，Git 就把那個時間點的專案狀態記進本地歷史。
第三層是 GitHub。 這是遠端協作中心。 別人要看你的變更、fetch 你的分支、review 你的 diff、開 PR 討論、決定要不要 merge，都在這一層。
第四層是 Deploy。 這是營業樓層。 不是「大家看得到 code」，而是「真正的使用者打開系統時，跑到的是這個版本」。
你可以把整條路線想成一句話：
我在 Local 改東西。 我用 Git 記下東西。 我把它送到 GitHub 給人看與合。 我再把某個版本送去 Deploy 給使用者用。
請把這張文字圖直接記住：
Local → 我正在改檔案、跑畫面、查 bug
Git → 我把變更整理成可追蹤的快照
GitHub → 我把本地快照同步到遠端，讓團隊 review、PR、merge
Deploy → 我把可運行版本送到 staging 或 production
錨點句：本地不是歷史，歷史不是遠端，遠端不是上線。
Git 官方把 working tree、staging area、Git directory 明確拆開，並說 commit 是把 staging area 的狀態永久存進本地 Git directory；GitHub 官方則把 remote repository、push、pull request、deployment environments 分成不同概念。這個分層不是教學技巧，而是工具本來就這樣設計。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這一章最重要的字翻成人腦真的能用的版本。
本地，Local。 白話講，就是你眼前這台電腦上的現場。 Git 官方說 working tree 是某個版本被 checkout 到磁碟上的那份檔案，你就在這裡修改它們；而且 Git 大部分操作本來就是本地完成，因為完整歷史就在你的本機磁碟。 口語定義：我手上真的在動的那份專案。
儲存庫，Repository，簡稱 repo。 白話講，就是「裝著這個專案與它的版本歷史的容器」。 GitHub 官方寫得很直白：repository 裡面有你的 code、檔案，以及每個檔案的 revision history。 口語定義：裝著程式和歷史的盒子。
Git。 白話講，它不是網站，也不是雲端服務。 它是你本地的版本控制系統。Git 官方強調 Git 存的是 snapshots，不是單純一段一段差異；每次 commit，都是把當下專案狀態存成一張快照，而且 committed 的意思是「資料已安全存到本地資料庫」。 口語定義：把變更記成可回頭查的本地歷史。
GitHub。 白話講，它不是 Git 本身，而是 Git 的遠端協作中心。 GitHub 官方說 remote repository 是存放在 GitHub 上的 repo；團隊協作依賴你把本地 commits 發佈到 GitHub，讓其他人可以 view、fetch、update。 口語定義：遠端同步與協作的地方。
Push。 白話講，就是把你本地 branch 上的 commits 推到遠端。 GitHub 官方直接說 git push 是把 local branch 上的 commits 推到 remote repository。 口語定義：把我本地的歷史送上去。
Pull Request，簡稱 PR。 白話講，不是合併本身，而是「提案合併」。 GitHub 官方說 pull request 是 proposals to merge code changes，讓你先 review、討論、看 checks，再決定要不要 merge。 口語定義：請大家看這批變更能不能進主線。
部署，Deploy。 白話講，是把某個可運行版本送到某個環境。 GitHub 官方對 deployment environments 的描述，是 production、staging、development 這類 deployment target，而且可以加 approval、branch restrictions、secrets。 口語定義：把版本送到真的會跑的地方。
到這裡你要開始養成一個新習慣。 以後不要說「我有改到 GitHub 上」。 你要更精準地說：
我在 Local 改了。 我已經 commit 到 Git。 我還沒 push 到 GitHub。 或者我已經 push 了，但還沒 deploy。
一精準，腦就不亂。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
你今天改了 slot 選取邏輯。 原本使用者點某個時段，selected 樣式有時亮、有時不亮；你把 slotRules.ts 和 BookingForm.tsx 一起改了，本地瀏覽器看起來終於正常。
這時你完成的是哪一層？
你只完成了 Local。 也就是說，你在你電腦上的檔案與本地執行結果變對了。 這很重要，但它還不是歷史，更不是同步，更不是上線。
接著你把變更 stage 起來，做了 commit。 這時你完成的是 Git。 Git 官方的說法很清楚：你修改 working tree，選擇性地 stage 想要進下一次 commit 的變更，然後 commit，Git 就把 staging area 的那個狀態永久存進本地 Git directory。 也就是說，現在你有歷史了，但歷史還在你自己電腦裡。
再接著你把這個 branch push 上去，開 PR。 這時你完成的是 GitHub。 遠端 repo 現在看得到你的變更，團隊可以 review、看 Files changed、看 checks、討論要不要 merge。GitHub 官方就是把 PR 定義成 propose、review、merge 的協作中心。 也就是說，現在你完成了同步與審查，但還不是使用者真的用到。
最後，某個版本被送到 production。 這時你完成的是 Deploy。 部署層的本質不是「程式碼上網了」，而是「某個環境正在跑這個版本」。GitHub 對 deployment environments 的官方語彙，也是把它當成 production、staging、development 這類實際 deployment target。 這時候，使用者打開預約系統，才真的會看到新 slot 規則。
所以同一個需求，會穿過四層：
你改了 slot 規則。 這叫開發完成。
你 commit 了。 這叫記錄完成。
你 push 了、PR 了、merge 了。 這叫同步完成、合併完成。
你把版本送去環境。 這才叫部署完成。
開發完成、同步完成、合併完成、部署完成，不是同一件事。
再看另一個更容易誤判的場景。
你的 booking API 在本地測試通過，Firestore 也有寫進資料，但 Google Calendar 在線上沒建立事件。 這時很多人會直覺說：「是不是 createCalendarEvent() 那個函式壞了？」
不一定。
因為本地成功，只代表 Local 那套條件通了。 線上沒成功，常常是在 Deploy 層出了事。 像是部署環境沒有正確的 token、env config、授權範圍或 environment secret。GitHub 對 deployment environments 的官方設計就直接把 approvals、environment secrets、branch restrictions 放在部署層，這本身就在提醒你：部署不是同步的附屬功能，它是另一層現實。
所以你要開始這樣問：
我現在看到的是本地 bug，還是部署 bug？ 我現在缺的是 commit，還是 push，還是 merge，還是 deploy？ 我現在改的是檔案，還是歷史，還是遠端，還是線上環境？
只要你問對層，很多問題會瞬間縮小。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這四層圖，放回 Codex 的工作方式。
【版本敏感】以今天的官方文件來看，Codex App 開 thread 時有 Local、Worktree、Cloud 三種 mode；其中 Local 與 Worktree 都是在你的電腦上跑，Cloud 則是在遠端的 configured cloud environment 跑。這代表 Codex 自己也明確區分「本地工作」和「遠端執行」。
這裡先抓住一個重點：
Codex 最常直接碰到的是 Local 與 Git 這兩層。
因為你不管在 Codex App 的 Local / Worktree 模式，還是在 Codex CLI 裡工作，實際上都在對某個目錄裡的專案讀、改、跑。Codex CLI 官方寫得很直白：它是你可以在 terminal 本地執行的 coding agent，會在 selected directory 讀、改、跑 code。
接著，Codex App 又把 Git 動作接起來。 官方文件明寫：App 內建 Git tools，你可以看 diff、留 inline comments、stage 或 revert 特定 chunks，還可以直接 commit、push、create pull requests。 也就是說，Codex App 橫跨了 Local、Git、GitHub 這三層的接口。
但你一定要記住：
Codex 的 Cloud mode，不等於你的產品已經部署到線上。
Cloud mode 的意思，是 Codex 任務在遠端環境執行； Deploy 的意思，是你的預約系統某個版本被送到 staging 或 production，讓真實服務環境跑起來。 這兩個字都可能讓人聯想到「雲端」，但它們不是同一層。前者是 agent 的執行位置，後者是產品的交付位置。前者屬於 Codex 的工作表面設計，後者屬於你的產品運行現實。這是我根據官方 mode 定義做的直接區分。
所以放回 Codex 工作流，你可以這樣記：
ChatGPT 幫我想清楚這次要改哪一層。 Codex 在 Local 幫我產生變更。 Git 幫我把變更記成歷史。 GitHub 幫我把歷史同步成可 review 的提案。 部署平台把被接受的版本送去真的跑。 我負責決定哪一層算完成。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
本地畫面正常，就表示專案完成了。
不是。 那通常只代表 Local 這層通了。 Git 官方把 commit 定義成存進本地資料庫；GitHub 官方把 push、PR、merge 定義成後面的遠端協作；部署環境又是另一層。你本地看到的「好了」，頂多是第一層好了。
第二個誤解是：
我已經 commit，所以 GitHub 應該看得到。
不是。 commit 是 Git 的本地歷史動作。 GitHub 官方對 remote repository 的描述很直接：協作依賴你把本地 commits 發佈到 GitHub；而 push 的定義就是把 local branch 上的 commits 推到 remote repository。 沒有 push，GitHub 不會自動知道你本地做了什麼。
第三個誤解是：
GitHub 上 merge 了，就等於使用者已經用到。
不是。 merge 代表變更被納入某個遠端分支。 Deploy 則是另一件事：把某個版本送到某個 deployment environment。官方把 environment 明確當成 production、staging、development 這類目標，還能設 approvals 與 secrets。 也就是說，遠端整合完成，不等於線上交付完成。
第四個誤解是：
Codex 在 Cloud 跑，等於我系統在線上跑。
不是。 前者是 Codex 任務的執行位置，後者是你產品的部署位置。 名字都帶一點「遠端」味道，但它們在系統圖上不是同一格。
--------------------------------------------------------------------------------
七、能力邊界
這一章談能力邊界，最重要的是：你要分清楚 Codex 能碰哪一層，不能因為它會動，就把四層責任一起交出去。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是本地改 UI、整理 slot 元件、補 loading state、修 route.ts 的型別、加測試、跑 lint、看 diff、產生 commit message 草稿。這些都主要發生在 Local 與 Git 層，而官方文件也明確說 Codex CLI 能在 selected directory 讀、改、跑；Codex App 能看 diff、stage、revert、commit。
第二層：Codex 可以協助，但人必須主導決策的事。 像是要不要 push、要不要開 PR、這個 PR 要不要 merge、slot 規則要不要改動商業邏輯、Google Calendar 同步失敗要不要先允許 booking 成功後補償。PR 在 GitHub 官方語彙裡本來就是提案、討論、review 後再 merge；這一層不是「會不會按按鈕」，而是「要不要把這批變更送進主線」。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production deploy、deployment approvals、environment secrets、正式發版、不可逆 migration、真實資料庫危險操作、權限與法規取捨。GitHub 官方對 deployment environments 的設計，本來就把 approval、branch restriction、secrets 放在這一層；這已經很清楚地告訴你：部署層不是單純技術動作，而是責任動作。
所以這章的能力邊界可以濃縮成一句話：
Codex 很適合幫你穿過前兩層，能幫你碰到第三層的邊；但第四層真正要不要放行，責任仍然在你。
--------------------------------------------------------------------------------
八、一句帶走
Local 是我手上的現場，Git 是我手上的歷史，GitHub 是我交出去的提案，Deploy 是使用者真的用到的版本。
--------------------------------------------------------------------------------
本章記憶點
本地改好了，不等於 Git 已記錄；Git 已記錄，不等於 GitHub 已同步；GitHub 已同步，不等於線上已部署。
四層現實一旦分清楚，很多 bug 會從「一團霧」變成「某一層出了事」。
AI 負責產生變更，Git 負責記錄變更，GitHub 負責同步變更，我負責決定變更。
本章最小實戰動作
打開你的預約系統，找一個最近改過的功能，拿一張紙只寫四行： 「我在哪個檔案改了它？」 「我有沒有 commit？」 「我有沒有 push / PR / merge？」 「它有沒有真的部署到使用者在跑的環境？」 把答案填完，你就會立刻知道自己卡在哪一層。
本章一句帶走
本地不是歷史，歷史不是遠端，遠端不是上線。

第 4 章
變更的生命週期：從一句需求到真正上線
一、這章只講一件事
這章只講一句核心：
一個需求，只有穿過完整生命週期，才算真的完成。
很多人說「我做完了」，其實只是做完其中一段。 官方文件本來就把這條線拆得很清楚：Git 的 commit 是把 staging area 的內容存進本地 Git directory；GitHub 的 push 是把本地 branch 上的 commits 推到 remote repository；Pull Request 是「提案合併」；merge 是把 PR 納入目標分支；而 GitHub Actions 又可以在 PR 上跑 build / test，或把 merged pull requests 部署到 production。也就是說，做出變更、記下變更、同步變更、合併變更、部署變更，官方從來就沒有把它們當成同一件事。
所以這一章你只要記住一個觀念：
不要再問「有沒有做完」。要問「做完的是哪一段」。
--------------------------------------------------------------------------------
二、先用畫面理解
把一個需求想成一個要送到門市上架的產品。
一開始，它只是一張訂單。 接著，有人把需求翻成規格。 有人真的在工作台上做出東西。 有人檢查它。 有人幫它貼上可追蹤標籤。 有人把它送到中央倉。 有人在中央倉決定可不可以入主線。 最後，才有人把它送到真正營業的門市。
如果你只做到了工作台那一步，你不能說「商品已經上市」。 你只能說：「東西做出來了。」
把這張圖放進腦中：
一句需求 → 定義驗收條件 → 在 Local 產生變更 → 看 diff、跑測試、做 review → commit 到 Git → push 到 GitHub → 開 PR 請求合併 → 通過 review / checks 後 merge → deploy 到 staging 或 production → 在線上驗證真的可用
這條線之所以重要，是因為 GitHub 官方對 PR、review、merge、deployment 都有各自獨立的流程與守門機制；像 protected branch 可以要求 approving review 或 passing status checks，deployment environment 又可以要求 approval、限制分支、限制 secrets。工具本身就告訴你：這不是一個按鈕，而是一串關卡。
錨點句：變更做出來，只是開始；變更被交付，才算完成。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這條生命線上的字，翻成你耳朵一聽就懂的版本。
需求，Requirement。 白話講，就是你要讓系統「變得哪裡不一樣」。 不是程式碼，不是按鈕，而是產品要發生的改變。 口語定義：我要系統多做到什麼。
驗收條件，Acceptance Criteria。 白話講，就是什麼情況下你願意說「這次真的達標」。 口語定義：怎樣才算這次有做成。
差異，Diff。 白話講，就是這次和上一版相比，到底改了哪些地方。 口語定義：這次動了什麼。
審查，Review。 白話講，就是有人看你的 diff、行為、測試與風險，判斷這批變更能不能往下一關走。 GitHub 官方把 pull request review 定義成協作核心：reviewer 可以 comment、suggest、approve 或 request changes。 口語定義：這批改動值不值得放行。
提交，Commit。 白話講，不是「我按了某個送出鍵」。 Git 官方的意思是：你先修改 working tree，再把要進下一次記錄的變更放進 staging area，最後 commit，把那個狀態永久存進本地 Git directory。 口語定義：把這次改動記成一張本地快照。
推送，Push。 白話講，就是把你本地已經有的 commits，送去遠端 repository。 口語定義：把我本地的歷史送上 GitHub。
拉取請求，Pull Request，簡稱 PR。 白話講，不是合併本身，而是「我提議把這批變更合進某個目標分支」。 GitHub 官方直接說 pull requests are proposals to merge code changes。 口語定義：請大家來看，這批變更能不能進主線。
合併，Merge。 白話講，就是這批變更通過了 review 與規則，真的被納進目標分支。 GitHub 官方對 merging a pull request 的說法也很直接：工作完成後，將 PR merge 進 upstream branch。 口語定義：這批變更正式進入主線。
部署，Deploy。 白話講，就是把某個版本送到一個真正在跑的環境。 GitHub 官方把 environment 定義成像 production、staging、development 這樣的 deployment target，而且可以設 approval、branch restrictions、deployment protection rules、secrets。 口語定義：把版本送到真的會跑的地方。
狀態檢查，Status Checks。 白話講，就是自動守門員。 GitHub 的 branch protection 可以要求 passing status checks、approving reviews，沒有通過就不能 merge。 口語定義：不是你想進主線就能進。
到這裡，你要把「完成」拆成至少六個層級來想：
需求被說清楚。 變更被做出來。 變更被記下來。 變更被同步出去。 變更被合進主線。 變更被部署並驗證。
只要其中少一段，你就不是沒努力。 你只是還沒走完整條生命線。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們整本書固定的主案例：預約／排程系統。
假設這次需求是：
「管理者可以封鎖不可預約時段；前端要正確顯示 disabled 與 selected；使用者送出 booking 後，資料要寫進 Firestore 類型的雲端資料庫，並同步建立 Google Calendar 事件。」
這一句話，看起來像一個需求。 但真正的工程生命週期，不是聽完這句就直接開始改檔。
你先要做的，是把需求翻成驗收條件。
例如：
管理者封鎖的 slot，使用者不能選。 被選到的 slot，UI 樣式要和實際狀態一致。 booking 成功後，資料庫裡要有正確紀錄。 如果 Calendar 同步成功，要有 event id。 如果 Calendar 同步失敗，要有可追蹤錯誤，而不是靜默失敗。
這一步如果沒做，你後面所有「修好了嗎」都會變成感覺題。
接著你才進入 Local 的實作。 你可能會改 slotRules.ts，改 BookingGrid.tsx，改 route.ts，改 calendarSync.ts。你本地打開頁面，看到 disabled 與 selected 終於對了；API 測試也過了；本地假資料和資料庫資料看起來一致。
這時候，請你非常誠實地說：
你完成的是開發，不是交付。
因為 Git 官方定義的下一關，叫 staging 和 commit。你得先把想記下的變更收進 staging area，再做 commit，把這次狀態存進本地歷史。這代表你現在終於有一個可回頭查的版本點，但它還只活在你電腦裡。
再來，你把 branch push 上 GitHub。 這時 GitHub 上才真的看得到你的 commits；別人才有辦法 view、fetch、review。GitHub 官方對 remote repository 的描述很清楚：協作依賴你把 local repository 的 commits 發佈到 GitHub。
接著，你開 PR。 PR 不是「我已經合併了」，而是「我提議把這批變更合進去」。這一關的重點不是上傳，而是審查：看 diff 合不合理、測試有沒有過、是否需要 requested changes、是否有 required reviews。GitHub 官方把 PR 和 review 放在同一條協作主線上，而且 protected branches 可以要求一定數量的 approving reviews 與 passing status checks。
再往後，PR 被 merge。 這代表變更正式進入目標分支，例如 main。但請注意，這依然不等於線上已經更新。官方文件甚至明確把「PR merge」和「workflow deploy」分開寫：你可以設定 GitHub Actions 在每個 PR 上 build / test，也可以在 merged PRs 之後 deploy to production；而如果你要在 PR merge 時觸發 workflow，GitHub 也另外提供 pull_request 的 closed 事件加 merged 條件。這件事本身就在告訴你：merge 是一個節點，deploy 是另一個節點。
最後，某個 workflow 或部署平台把這個版本送到 staging 或 production。 到了這一關，environment secrets、deployment approvals、branch restrictions 才開始真的重要。也就是說，如果你本地測試都過了、GitHub 也 merge 了，但 Google Calendar 在線上還是沒建立事件，問題可能根本不是 createCalendarEvent() 那個函式，而是部署環境的 token、secret、scope、approval、branch policy，或 environment 設定本身。GitHub 官方對 environments 的描述正是這樣：它們是 deployment target，而且可以用 approval、secrets、protection rules 來守門。
現在把幾個你最常遇到的痛點，放進這張生命圖裡：
你改了 slot 規則，selected 樣式卻怪怪的。 這通常不是「今天運氣不好」，而是變更死在「規則層和 UI state 沒對齊」，或者 review / 測試沒把這個落差抓出來。
你本地改好了，但 GitHub 上看不到。 這通常不是 GitHub 壞掉，而是你只走到 commit，還沒 push。
GitHub 已同步，但線上環境還沒變。 這通常不是 UI cache 神祕失靈，而是你只走到 push 或 merge，還沒 deploy，或 deploy 沒被放行。
API route 寫了，但 Google Calendar 沒建立事件。 這通常不是單一函式問題，而是整條生命線都要查：API 有沒有被打到、資料模型對不對、token 在哪個環境、權限 scope 是否正確、workflow 是否真的部署到含有正確 secrets 的 environment。
所以你每次說「這次做完了」之前，要多補一句：
做完哪一關？
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這條生命週期，放回 Codex 的工作流裡。
第一關，需求澄清。 這一關最適合用 ChatGPT。 因為你要先把「管理者可封鎖 slot」翻成系統規則，把「Google Calendar 要同步」翻成資料流與錯誤處理，把「完成」翻成驗收條件。這是思考、規劃、講解、策略層。
第二關，實作與局部驗證。 這一關最適合用 Codex CLI 或 IDE extension。 官方文件對 CLI 的描述很直接：它會在你的 terminal 裡讀 repository、改檔案、跑命令；IDE extension 則把同一類 agent 能力帶進編輯器，貼著你正在看的檔案工作。這一關的重點，是在 Local 真的把 diff 做出來、把測試跑起來、把 bug 收斂。
第三關，收斂變更與版本動作。 這一關最適合用 Codex App。 【版本敏感】以今天的官方文件來看，Codex App 內建 Git tools；你可以在 diff pane 看 local project 或 worktree 的 diff、加 inline comments、stage 或 revert 特定 chunks 或整個檔案，並且直接 commit、push、create pull requests。這讓 Codex App 很像是你變更生命週期中段的調度台：把做出來的東西，整理成能被審查的版本單位。
第四關，遠端 review 與合併。 這一關主要落在 GitHub。 PR 是合併提案，review 是守門，protected branches 可以要求 reviews 與 checks。若你有用 OpenAI 的 GitHub integration，【版本敏感】今天官方也支援在 PR 裡用 @codex review 讓 Codex 直接回覆標準 GitHub code review。這代表 Codex 可以參與 review，但「要不要放行」依然是 GitHub 規則與人類決策在控。
第五關，部署與線上放行。 這一關不應該被你腦中自動歸到「Codex 已經幫我做完」。 GitHub Actions 可以把 merged PRs 部署到 production；deployment environments 又可以要求 approval、限制分支、限制 secrets。也就是說，這一關已經不只是產生變更，而是要不要讓某個版本進入真實服務環境。
所以，把整條工作流壓縮成一句話就是：
ChatGPT 幫我把需求講清楚。 Codex 幫我把變更做出來。 Git 幫我把變更記下來。 GitHub 幫我把變更同步、審查、合併。 部署平台幫我把變更送上線。 我負責決定每一關能不能過。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
我本地畫面正常，所以這個需求完成了。
不是。 那通常只代表 Local 這一關完成。 如果你還沒 commit、push、PR、merge、deploy，那只是變更做出來了，不是變更交付了。Git 與 GitHub 官方文件就是把這些步驟明確拆開來寫的。
第二個誤解是：
我已經 commit，所以 GitHub 上應該看得到。
不是。 commit 是本地版本歷史。 push 才是把本地 commits 送到 remote repository。沒有 push，GitHub 不會自動知道你剛剛在電腦上做了什麼。
第三個誤解是：
我開了 PR，就等於快要上線了。
不一定。 PR 只是 proposal to merge；而且如果 branch protection 要求 required reviews 或 passing checks，你連 merge 都未必能做。PR 是「請求進主線」，不是「已經進主線」。
第四個誤解是：
merge 了，就等於 deploy 了。
不是。 GitHub Actions 官方甚至直接舉例：你可以用 workflow 在 merged pull requests 之後部署到 production。這句話本身就表示 merge 和 deploy 是兩段不同流程。若 environment 還設了 approval 或 secrets，merge 後也不代表 deployment 已被放行。
再補一個你很容易中招的隱性誤解：
我按了 submit，就等於 Git 的提交。
不是。 在你的預約系統裡，使用者按 submit 是業務流程提交 booking。 在 Git 裡，commit 是版本快照。 在 GitHub 裡，PR 是合併提案。 三個都像「提交」，但根本不是同一個世界。這個概念我會在第 9 章再把它完全拆開。
--------------------------------------------------------------------------------
七、能力邊界
這一章談能力邊界，要用生命週期來看，而不是只看「它會不會寫 code」。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是把 slot UI 改成正確顯示 disabled / selected、補 booking API 的測試、寫 Firestore adapter、整理型別、補文件、產生 commit message 草稿、產生 PR description 草稿、先跑本地驗證。這些事情都主要發生在「需求已清楚」之後、「正式放行」之前，範圍明確、可 review、錯了可回頭。
第二層：Codex 可以協助，但人必須主導決策的事。 像是這次需求的驗收條件要怎麼定、Google Calendar 失敗是否允許 booking 先成功、slot 規則要依商業規則還是技術簡化、PR 要怎麼切、這次要不要 merge、部署先上 staging 還是直接 production。Codex 可以幫你列方案、改草稿、做比較，但這裡真正重要的是取捨，而不是生成。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、deployment approvals、branch protection 規則、正式發版、不可逆 migration、真實資料庫修復、法規與資安判斷、對外 SLA 與商業承諾。GitHub 官方對 environments 與 protected branches 的設計，本質上就是把這些地方做成守門點；既然工具都把它設成守門點，你就不該把它當成「最後再順手按一下」。
所以這章的能力邊界，用一句很實際的話說就是：
Codex 很適合幫你把變更做出來，也能幫你整理到可合併；但是否往下一關走，始終該由你拍板。
--------------------------------------------------------------------------------
八、一句帶走
需求不是做出來就算完成；它必須穿過記錄、同步、審查、合併、部署與驗證，才叫真正上線。
--------------------------------------------------------------------------------
本章記憶點
變更的生命週期，不是一個動作，而是一串關卡。
commit 是本地記錄，push 是遠端同步，PR 是合併提案，merge 不是 deploy。
你以為完成的，常常只是完成了變更，不是完成了交付。
本章最小實戰動作
拿你現在手上一個正在做的功能，直接寫下這九格：
需求 驗收 Local 變更 測試 / review commit push PR merge deploy / 線上驗證
哪一格還是空的，你就知道你不是卡住，而是還沒走到那一關。
本章一句帶走
變更做出來，只是開始；變更被交付，才算完成。

第 5 章
Repository、Working Tree、Staging Area、Commit History 到底是什麼
一、這章只講一件事
這章只講一句核心：
你以為自己在改「專案」，其實你每一秒都在四個不同層次之間移動：repo、working tree、staging area、commit history。
Git 官方把一個 Git 專案的核心結構拆成 working tree、staging area、Git directory；GitHub 官方則把 repository 定義成裝著程式、檔案與 revision history 的地方。也就是說，你平常口中的「repo」，不是一個扁平盒子，而是一整包有層次的系統。
如果這四個層次沒有分清楚，後面所有 Git 指令都會像咒語。 你會不知道自己到底是在改檔案、挑檔案、記歷史，還是在看過去。
所以這章的目標很單純： 把這四個名詞，變成你腦中一張能站得住的圖。
--------------------------------------------------------------------------------
二、先用畫面理解
先不要想 Git。 先想你的工作桌。
桌上攤開的，是你正在動手改的檔案。 旁邊有一個待裝箱區，你決定這一箱要放哪些東西。 後面有一個檔案庫，已經封箱入庫的版本都在那裡。 而整個房間，叫做你的 repo。
把這張圖直接放進腦中：
Repository，repo，儲存庫 → 整個專案的盒子
盒子裡你每天最常碰到三層：
Working Tree → 桌上攤開、正在改的那份檔案
Staging Area，也叫 Index → 下一箱準備要封存的內容清單
Commit History → 已經封存入庫、能回頭查的版本歷史
Git 官方對這三層的說法非常精準。Working tree 是某一個版本被 checkout 到磁碟上的檔案，給你使用與修改；staging area 是一個通常放在 Git directory 裡的檔案，記錄下一次 commit 要放什麼；commit 則是把 staging area 當下的狀態永久存進 Git directory。
所以你可以把它記成一句很穩的口訣：
Working tree 是現在。 Staging area 是下一張快照。 Commit history 是已經入庫的過去。
再給你一張可朗讀的文字圖：
專案 repo ├── working tree：我眼前正在改的檔案 ├── staging area／index：我準備放進下一次 commit 的內容 └── commit history：我已經記錄好的版本鏈
錨點句：你不是直接把 working tree 丟進歷史；你是先挑進 staging area，再把它記成 commit。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這章的關鍵術語，一個一個翻成人腦可用版本。
儲存庫，Repository，簡稱 repo。 白話講，就是這個專案的整包容器。GitHub 官方說 repository 是最基本的元素，是存放 code、files 和每個檔案 revision history 的地方。當你把專案 clone 到本地時，Git 官方文件又補了一個很重要的畫面：你會得到工作檔案，也就是 working tree，還有一個隱藏的 .git 目錄，裡面放著專案的歷史資訊。 口語定義：repo 是整個盒子，不只是你看到的那幾個檔案。
工作樹，Working Tree。 白話講，就是現在攤在你磁碟上、能打開來改的那份專案。Git 官方原文說得很直白：它是某一個版本的 single checkout，被放到 disk 上供你 use or modify。 口語定義：我手上正在動的那份檔案。
暫存區，Staging Area；技術名叫 Index。 白話講，它不是另一份專案，也不是另一個 branch。它是「下一次 commit 要收哪些內容」的準備區。Git 官方甚至直接說：index is your proposed next commit；git add 就是把新內容放進 index，而 git commit 沒帶其他參數時，只會提交 staged changes。 口語定義：下一張快照的候選清單。
這裡有一個非常重要的細節。 git add 不是施一個永久追蹤魔法。Git 官方明寫：git add 可以在 commit 前做很多次，而且它只會加入你執行 add 當下的內容；如果之後你又改了檔案，想把後續新改動也放進下一次 commit，你必須再 add 一次。 口語翻成一句話就是：你放進暫存區的是當下那一版，不是之後自動跟著更新。
提交歷史，Commit History。 白話講，不是你的資料夾歷史回憶錄，而是一串彼此相連的版本快照。Git 官方把 Git 定義成儲存檔案集合歷史的工具，歷史是「compressed collection of interrelated snapshots」，而每一個版本叫 commit。每個 commit 會帶著作者、時間、訊息，也會指向 parent commit，所以你能一路往回追。 口語定義：一條可以回頭查的版本鏈。
這裡再補一句很關鍵的矯正：
commit history 記的是你 staged 好的快照，不是你腦中以為自己改過的一切。 Git 官方寫得很清楚：commit takes the files as they are in the staging area；沒有 stage 的變更，仍然只是 modified，還留在 working tree。
如果你只想先記三個最小命令，先記這三個就夠：
git status git add -p git commit -m "fix slot selected state sync"
git status 幫你看現在 working tree 和 staging 的狀態；git add -p 讓你只挑一部分變更進暫存區；git commit 則把暫存區那一份，正式記成一個版本點。git add -p 能做部分片段的 staging，正是因為 staging area 的本質就是「下一次 commit 的提案」。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
你的整個專案，例如 appointment-system，就是 repo。 它裡面有前端頁面、有 slotRules.ts、有 BookingForm.tsx、有 app/api/booking/route.ts、有資料庫存取層、有 calendarSync.ts。這整包，加上背後的 Git 歷史，就是你的 repository。從 GitHub 的角度，它也是那個存著 code、files、revision history 的遠端專案。
你今天在修一個常見 bug： slot 選取邏輯改了，可是 selected 樣式和實際資料不同步。
你打開 slotRules.ts 改規則，打開 BookingGrid.tsx 改 UI state，甚至順手在 calendarSync.ts 裡加了幾行 debug log。 這一刻，這些變更都在 working tree。 意思不是它們「已經進 Git」，而是它們現在只存在你桌上的檔案世界裡。
接著你停下來想： 這次我要記錄的是哪一件事？
如果你的答案是「先把 slot 的規則與 selected 樣式同步修好」，那麼你真正想做的，就不是把所有改動一股腦送進 commit，而是只把和這個主題有關的檔案、甚至只把某些 hunks 放進 staging area。Git 官方 git add 文件明確支援 git add -p，讓你只把部分片段加入 index。
於是你可能做出這樣兩個 commit：
第一個 commit： fix: sync selected style with slot availability rules
第二個 commit： chore: add calendar sync debug logging
這時候你就在建立 commit history。 而且這條歷史不是裝飾。它的價值是：未來當你發現 Google Calendar 沒建立事件時，你可以明確知道「slot UI 修正」和「Calendar 偵錯紀錄」是兩次不同決策；你回頭比較、回滾、審查時，成本會小很多。Git 官方也明確把 commit 說成可 later revert to or compare to 的 snapshot。
再想一個你一定遇過的情境。
Firestore 裡已經有資料了，但 UI 顯示還是不對。 你本地也許早就改好了 BookingList.tsx，working tree 看起來正常。 可是如果那份修正還沒進 staging、還沒 commit，它就還不是歷史；你同事抓不到，你自己明天也未必一眼看得出昨天到底改了什麼。 這就是為什麼很多人會有一種幻覺： 「我明明改了啊，怎麼系統還像沒改？」 因為他改的是 working tree，還沒有把那個改動變成可追蹤的版本單位。
所以你要開始這樣問：
我現在看的，是 repo 的哪一層？ 我現在改的，是 working tree，還是下一次 commit 的提案？ 我現在需要的是繼續改，還是收斂成一個乾淨的 commit？
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這四個概念，放回 Codex 的工作方式。
先講最接地氣的：Codex CLI。 官方文件寫得很直接，CLI 是可以在你 terminal 本地執行的 coding agent，它能在 selected directory inspect your repository、edit files、run commands。翻成人話就是：當你在 CLI 裡叫 Codex 幫你做事，它最先碰到的，通常就是你的 repo 與 working tree。它讀你這個專案、改你這個目錄下的檔案、跑你這個目錄裡的命令。
再講 Codex App。 【版本敏感】 以今天的官方文件來看，Codex App 內建 Git tools。它的 diff pane 會顯示 local project 或 worktree checkout 的 Git diff；你可以加 inline comments，還可以對特定 chunks 或整個檔案做 stage 或 revert，之後直接 commit、push、建立 pull request。這代表在 Codex App 裡，working tree、staging area、commit 不是抽象概念，而是你每天真的會碰到的操作面。
所以把這一章放進 Codex 工作流，畫面會很清楚：
ChatGPT 幫你想清楚這次變更應該切成幾個 commit。 Codex 在 working tree 幫你把變更做出來。 你看 diff，決定哪些 hunks 進 staging area。 Git 把 staging area 記成 commit history。 GitHub 之後再負責同步這些 commit。 AI 負責產生變更，Git 負責記錄變更，GitHub 負責同步變更，我負責決定變更。
這裡也順手解一個很常見的困惑：
「Codex 改了很多檔案，但我不知道自己到底該 review 什麼。」
通常不是因為你不夠懂。 而是你把 repo 看成一坨，把 working tree、staging area、commit boundary 混成一團。 正確順序應該是：
先看 working tree 裡總共動了什麼。 再決定這次 next commit 應該只收哪一件事。 再把那件事 stage 起來。 最後才 commit。
一旦你照這個順序走，review 的焦點就會清楚很多。 你不是在 review 「這個 agent 今天做了很多事」。 你是在 review 「這一個 commit 到底在主張什麼」。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
repo 就是 GitHub 上那個網頁。
不是。 GitHub 上的 repository 當然是 repo，但你本地 clone 下來之後，也有一個 local repo。Git 官方文件明說，clone 後你會得到 project files，也就是 working tree，還有 .git 目錄，裡面放著專案歷史資訊。也就是說，repo 不是只有遠端那一頁，它在你本機也真實存在。
第二個誤解是：
working tree 就是 commit history。
不是。 working tree 是現在 checkout 到磁碟上、可以用和改的那份檔案；commit history 是已經存進 Git 的 interrelated snapshots。前者是現場，後者是歷史。你可以把現場弄得一團亂，但歷史還沒變；反過來，你也可以有乾淨的歷史，同時 working tree 又有尚未提交的新變更。
第三個誤解是：
staging area 只是麻煩的中間站，可以忽略。
不是。 Git 官方甚至直接把 index 說成 your proposed next commit。沒有 staging area，你就沒辦法很精準地決定「下一個 commit 到底要主張哪件事」。而且 git commit 沒帶其他參數時，只會提交 staged changes。這不是麻煩，它是讓你把歷史切乾淨的工具。
第四個誤解是：
我已經 git add 過一次，之後這個檔案的新修改會自動跟上。
不是。 Git 官方 git add 文件明寫：它只會加入你執行 add 當下的內容；如果後面又有新的修改，想把它們也放進下一次 commit，就得再 add 一次。這是很多人會莫名覺得「怎麼 commit 少了東西」的根本原因。
第五個誤解是：
commit history 就是一串文字訊息。
不只。 Git 官方把 commit history 說成一組彼此相連的 commits；每個 commit 有作者、時間、訊息，也有 parent 關係。訊息很重要，但歷史真正有力量的，是它把一個個快照串成可追蹤的因果鏈。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，要放在「誰可以碰哪一層」來看。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是讀 repo、掃描 working tree、整理哪些檔案被改了、提出 staging 建議、用 git add -p 類似的方式幫你切出比較乾淨的 commit 單位、草擬 commit message、在 App 裡先 stage / revert 幾個明顯不該混進來的 hunks。官方文件已經明確寫到 CLI 可 inspect repository、edit files、run commands；App 可看 diff、stage / revert、commit。
第二層：Codex 可以協助，但人必須主導決策的事。 像是這次 slotRules.ts 和 BookingGrid.tsx 應不應該算同一個 commit、route.ts 的 API 調整要不要和 UI 一起送、debug log 該不該進歷史、這次 commit 要切成「修 bug」還是「重構 + 修 bug」兩段。這些不是機械操作，而是歷史設計。 換句話說，Codex 可以幫你整理變更，但 commit 的邊界本身，就是你的架構判斷。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是把 .env、service account 憑證、production token、真實使用者資料、臨時救火腳本一起 stage 進去，或把大量不相關改動一次 commit 成一團，或重寫敏感歷史卻沒有人類確認。 因為一旦錯誤內容進了 commit history，它就不只是 working tree 的亂，而是正式進入可同步、可擴散、可留下痕跡的歷史。
所以這章的能力邊界，用一句很實際的話說就是：
Codex 很適合幫你看清 repo、整理 working tree、收斂 staging；但哪一些東西值得被寫進歷史，最後一定是你決定。
--------------------------------------------------------------------------------
八、一句帶走
Repo 是整個盒子，working tree 是桌上那份，staging area 是下一張快照，commit history 是已入庫的過去。
--------------------------------------------------------------------------------
本章記憶點
Working tree 是現在，staging area 是下一張快照，commit history 是已經封存的過去。
git add 不是永久追蹤魔法，它只加入你當下那一版的內容。
乾淨的 commit history，不是自然長出來的，而是你刻意切出來的。
本章最小實戰動作
在你的預約系統裡，隨便挑一個小改動做一次四步練習：先改一行 UI 文字，接著跑 git status 看 working tree；再用 git add 或 git add -p 把它放進 staging area；然後 git commit -m "test: understand working tree and staging"；最後看一次最新 commit。這個動作的目的不是記指令，而是親手感受「桌上檔案、待提交清單、已入庫歷史」其實是三件不同的事。
本章一句帶走
你不是直接把檔案丟進歷史；你是先挑進暫存區，再把它記成版本。

第 6 章
HEAD、Branch、Checkout、Remote、Origin：版本世界怎麼定位你現在在哪裡
一、這章只講一件事
這章只講一句核心：
HEAD、branch、checkout、remote、origin，不是五個零散名詞；它們合在一起，是 Git 版本世界的定位系統。
Git 官方把 branch 描述成指向某個 commit 的 branch head，把 HEAD 定義成目前分支的參照；GitHub 官方則把 remote URL 解釋成「你的程式碼存放的位置」，並說預設 remote 通常叫 origin。所以這一章真正要回答的，不是名詞表，而是三個定位問題：我現在站在哪條線上？我一移動會去哪裡？我現在在跟哪個遠端互動？
如果這組定位沒有穩，你就會反覆犯同一種錯：你不知道下一個 commit 會長在哪條 branch，上週修好的 BookingGrid.tsx 為什麼切回 main 後像消失，或 GitHub 明明已經有人推新東西了，為什麼你本地看起來還像舊的。Git 官方對 remote-tracking branches 的定義很關鍵：它們是你本地對遠端狀態的書籤，Git 只會在你做網路溝通時替你更新它們。
--------------------------------------------------------------------------------
二、先用畫面理解
把整個 Git 版本世界想成一張捷運圖。
每一個 commit，都是一個站。 每一條 branch，都是一條線尾端那個會移動的指標。 HEAD 是月台上的那個大箭頭，寫著：你現在在這裡。 checkout 或 switch，是你把自己移到另一條線。 remote 是對岸那座城市的調度中心。 origin 只是你替第一個常用遠端取的名字，不是神聖主線。 而 origin/main，不是遠端本體，它是你本地記著的那張便條：我上次連線時，遠端的 main 在這裡。
你可以把它先記成這張文字圖：
本地 repo ├── local branch：main ├── local branch：feature/slot-rules-sync ├── HEAD → feature/slot-rules-sync ├── remote：origin → GitHub 上的那個 repo └── remote-tracking branch：origin/main
這張圖最重要的地方是：main 是你的本地 branch，origin/main 是你的本地遠端書籤，GitHub 上真正的 main 在遠端 repo 那一側。名字很像，層次完全不同。
錨點句：branch 是線，HEAD 是你腳下，origin/main 是你對對岸位置的本地筆記。
--------------------------------------------------------------------------------
三、把名詞翻成白話
分支，Branch。 白話講，不是整份專案再複製一份。 Git 官方的說法更接近「可移動的指標」：建立一個新 branch，就是建立一個新的 branch head，指向目前的 HEAD 或你指定的起點；而且只建立，不會自動切過去。 口語定義：一條你可以繼續往前長 commit 的線。
頭指標，HEAD。 白話講，不是整個 repo 裡「最新的 commit」。 Git 官方把 HEAD 定義成目前分支；更完整地說，你的 working tree 通常來自 HEAD 指到的那棵 tree。如果你沒有站在任何命名 branch 上，而是直接 checkout 某個 commit，HEAD 就會變成 detached HEAD，也就是直接指向某個 commit。 口語定義：我現在腳踩在哪條線，或哪個點上。
切換，Checkout。 白話講，這個字歷史上很容易搞亂人，因為 Git 官方文件明說 git checkout 有兩個主模式：一個是切 branch，一個是把檔案還原成某個版本。所以很多人以為 checkout 永遠都在做同一件事，其實不是。 口語定義：一個老字，既可能在切線，也可能在還原檔案。
切換分支，Switch。 白話講，這是比較乾淨的新動詞。Git 官方說 git switch 會切到指定 branch，並把 working tree 和 index 更新成那條 branch 的狀態；之後的新 commit 都會長到那條 branch 的 tip 上。 口語定義：專門把我移到另一條 branch。
遠端，Remote。 白話講，就是你正在追蹤的另一個 repository。Git 官方把 git remote 描述成管理一組你正在追蹤其 branches 的 repositories；GitHub 官方則把 remote URL 說成「你的 code 存放的位置」。 口語定義：我現在連的是哪一個遠方倉庫。
來源遠端，Origin。 白話講，不是 Git 規定的宇宙中心。 Git 官方直接說：origin 不特殊，它只是 git clone 預設替第一個 remote 取的名字；GitHub 官方也說你的 default remote 通常叫 origin。 口語定義：第一個常用遠端的預設小名。
還有一個一定要順手講清楚的字：
遠端追蹤分支，Remote-tracking branch。 白話講，就是像 origin/main 這種名字。Git 官方說它是本地參照，你不能直接手動移動它；Git 會在你做網路溝通時替你更新它，讓它反映你上次看到遠端分支的位置。 口語定義：我本地記著遠端分支在哪裡的書籤。
如果你只想先記幾個最小動作，先記這四行：
git switch feature/slot-rules-sync git checkout feature/slot-rules-sync git fetch origin git log --oneline --decorate --graph --all
第一行是現在最乾淨的「切 branch」。第二行是你仍然會在很多教學和工具輸出裡看到的舊語法。第三行只更新遠端書籤，不替你 merge。第四行則會把 HEAD、branch pointers 和分岔歷史一起畫出來。
--------------------------------------------------------------------------------
四、把它放回你的專案
回到我們固定的主案例：預約／排程系統。
你的 main，是目前可交付的主線。 你要修 slot 規則和 selected 樣式不同步，就開一條 feature/slot-rules-sync。 你要修 Google Calendar token 或授權問題，就可能再開一條 hotfix/calendar-auth。 這裡最容易搞錯的是：建立 branch 不等於站上那條 branch。 Git 官方明寫，建立新 branch 只是建立新指標；切過去要再做 switch 或 checkout。
如果你現在的 HEAD 指向 feature/slot-rules-sync，那你接下來的 commit 都會長在那條線上。當你切回 main，Git 會把 working tree 更新成 main 指到的那個 snapshot。這就是為什麼你昨天在 BookingGrid.tsx 改好的 selected 樣式，切回 main 後像突然不見了。它不是消失，而是你站回另一條線，所以眼前檔案跟著換了。
再看 origin。在你的預約系統裡，origin 通常就是 GitHub 上那個遠端 repo。origin/main 則是你本地對遠端 main 的書籤。如果同事在 GitHub 上把 main 推進了，而你還沒 fetch，那你的 origin/main 不會自動前進；你的本地 main 更不會自己變好。GitHub 官方明確說 git fetch 會抓下新的 remote-tracking branches 和 tags，但不會把它們 merge 進你自己的 branch。
這也能解釋一個很真實的痛點：你說「本地改好了，GitHub 怎麼看不到」，有時不只是還沒 push，而是你本地一直在看 feature/slot-rules-sync，GitHub 頁面卻一直停在 main。你以為自己在對照同一條線，實際上你看的根本不是同一個 branch。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
【版本敏感】今天的 OpenAI 官方文件寫得很清楚：Codex App 有 built-in worktree support 和 Git functionality；thread 可以跑在 Local、Worktree 或 Cloud。對 Git repository 而言，Worktree 是同一個 repo 的第二份 checkout，每個 worktree 都有自己的檔案副本，但共享同一份 .git metadata，所以你可以平行站在不同 branches 上工作。這代表你在 Codex App 裡看到的每個 thread，也都在回答同一個問題：它現在站在哪個 checkout、哪條 branch、哪個 HEAD 上？
【版本敏感】OpenAI 官方也寫到，Codex App 的 diff pane 直接顯示 local project 或 worktree checkout 的 Git diff，並支援 stage、revert、commit、push、create pull request。CLI 則是在你選定的 directory 本地讀 repo、改檔案、跑命令；IDE extension 使用 Codex CLI，並在預設 Agent mode 下直接在你的專案目錄裡讀檔、跑命令、寫變更。換句話說，Codex 不是飄在空中做事，它永遠是在某個目錄、某個 checkout、某個 branch 上動手。
所以你在 Codex 工作流裡，要多問一個版本定位題：這個 thread 現在在 Local 還是 Worktree？它是從哪條 branch 起跑的？HEAD 現在指哪裡？你一旦把這三句問清楚，很多「Codex 怎麼把我專案改亂了」的感覺，會立刻縮成比較精準的問題：其實只是你看錯了 checkout，或你把不同 thread 的 branch 混在一起看。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：HEAD 就是整個 repo 最新的 commit。 不是。Git 官方把 HEAD 定義成目前分支的參照；在 detached HEAD 時，它甚至可以直接指向某個 commit，而不是任何命名 branch。
第二個誤解是：git branch feature-x 就等於我已經切到 feature-x。 不是。官方文件明寫，建立 branch 是建立新的 branch head；不會切換 working tree。真正切過去，要用 git switch feature-x 或 git checkout feature-x。
第三個誤解是：origin 是某種神祕主線，不能改，也不能換。 不是。Git 官方直接說 origin 不特殊；它只是 clone 時預設給第一個 remote 的名字。GitHub 官方也說你的 default remote 通常叫 origin，但那只是慣例，不是天條。
第四個誤解是：origin/main 就是 GitHub 上活的 main，而且 checkout 只代表切 branch。 前半句不對，因為 origin/main 是你本地的 remote-tracking bookmark，Git 只會在網路溝通時替你更新它。後半句也不對，因為 Git 官方對 checkout 的定義本來就有兩個主模式：切 branch，或把檔案還原成某個版本。這兩種看起來「像是一件事」的混淆，常常一起把人搞亂。
--------------------------------------------------------------------------------
七、能力邊界
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是讓它讀目前 repo 狀態、告訴你現在的 HEAD 在哪條 branch、列出 remotes、幫你從正確起點建立 feature branch、在 worktree 裡平行試做、把 diff 對回正確 branch。這些都是定位與低風險操作；而且 OpenAI 官方文件也明確說 App、CLI 都是直接在 checkout 與 repo 上工作。
第二層：Codex 可以協助，但人必須主導決策的事。 像是這次 slot UI 修正要不要從 main 切新 branch，Google Calendar 問題該走 hotfix 還是一般 feature branch，Codex thread 要留在 Worktree 還是 handoff 回 Local。官方文件允許你替 worktree 選 starting branch，也提供 Local / Worktree 的切換與 handoff；但哪一條線才是這次需求該站的線，這仍然是你的架構判斷。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 force-reset 重要 branch、改 remote URL、把 origin 指到錯的倉庫、或用會丟掉本地修改的方式強行切線。Git 官方文件明寫 git switch --discard-changes 會把 index 與 working tree 還原成目標 branch 的狀態，而 git branch -f 會重設 branch 指向。這類動作一旦做錯，不只是「改壞一個函式」，而是把你的定位系統整個扭掉。
--------------------------------------------------------------------------------
八、一句帶走
Branch 是線，HEAD 是你腳下，checkout 是移動，remote 是對岸，origin 只是對岸的預設小名。
--------------------------------------------------------------------------------
本章記憶點
HEAD 回答的不是「整個 repo 最新在哪」，而是「我現在站在哪條 branch 或哪個 commit 上」。
建立 branch 不等於切過去；切 branch 會連 working tree 一起換。
origin 只是預設 remote 名字，origin/main 只是你本地對遠端位置的書籤。
本章最小實戰動作
在你的預約系統 repo 裡，依序做三件事：先跑 git remote -v 看清楚 origin 指到哪裡；再跑 git fetch origin 更新遠端書籤；最後跑 git log --oneline --decorate --graph --all，然後大聲回答三句話：我現在的 HEAD 在哪條 branch？origin/main 在哪裡？我剛剛在 GitHub 頁面看的又是哪條 branch？ 這個動作的目的不是背指令，而是把「線、腳下、對岸書籤」一次對齊。
本章一句帶走
你一旦分清 main、origin/main、HEAD 各自代表什麼，就比較不會再問自己：我到底改到哪裡去了。

第 7 章
Fetch、Pull、Merge、Rebase、Push、PR：同步世界到底怎麼流動
一、這章只講一件事
這章只講一句核心：
同步世界不是一個按鈕，而是一組有方向的箭頭。
GitHub 的基礎教學把這件事講得很白：clone 和 fetch 是把遠端內容抓到本地，merge 是把別人的工作和你的工作整合在一起，pull 是把前兩段合成一個方便指令。Git 官方目前的 git pull 文件則講得更精準：pull 一定先做 fetch，再把抓回來的遠端分支整合進你目前分支；整合方式可以是 fast-forward only、rebase、merge 或 squash，會受參數與設定影響。也就是說，你不是在學一串近義詞，你是在學變更如何在本地與遠端之間流動。
很多人之所以一看到 fetch、pull、push、PR 就亂，是因為他腦中沒有方向圖。 他不知道哪個動作是在「看見遠端」，哪個是在「把遠端帶回自己這條線」，哪個是在「把自己這條線送出去」，哪個是在「請求進主線」。方向一糊，責任就會一起糊。這也是為什麼你會反覆遇到同一種困惑：本地明明改好了，GitHub 為什麼沒更新；GitHub 明明有分支，為什麼 main 還沒變；PR 明明開了，為什麼還不算完成。這些其實不是不同問題，而是同一張圖還沒立起來。
--------------------------------------------------------------------------------
二、先用畫面理解
先把畫面想成兩個倉庫，中間夾著一張便條紙。
右邊是 GitHub 上的遠端倉庫。 左邊是你本地的 Git 倉庫。 你本地還有一張便條紙，寫著 origin/main。 這張便條紙不是遠端本身，它只是你上次知道遠端 main 在哪裡的本地記號。GitHub 文件說 clone 之後會建立一個叫 origin 的 remote，並在本地替遠端各分支建立對應的 remote-tracking branch；Git 官方則把 fetch 的結果描述成更新 refs/remotes/origin/* 這一類遠端追蹤分支。
把這張同步圖記成下面這樣：
GitHub 遠端 branch → fetch → 本地 remote-tracking branch，例如 origin/main → merge / rebase / pull → 你目前的本地 branch → push → GitHub 上你的遠端 branch → PR → 請求把這條遠端 branch 合進 base branch
這張圖最重要的，不是名詞，而是箭頭方向。 fetch 是把遠端資訊拉回來，但先只放在本地的遠端書籤。 merge 或 rebase 才是把那些更新整合進你現在的本地 branch。 push 是把你本地 branch 的 commits 送到遠端。 PR 則不是傳輸，而是 GitHub 上的協作提案：讓大家 review、討論、決定要不要 merge。 GitHub 官方直接把 pull request 定義成 propose、review、merge code changes 的協作中心。
錨點句：fetch 先讓你看見對岸，merge 或 rebase 才把對岸帶回你這條線，push 才把你這條線送去對岸，PR 才是請求進主線。
--------------------------------------------------------------------------------
三、把名詞翻成白話
抓取，Fetch。 白話講，就是把遠端最新狀態抓回本地，但先不要動你現在手上的 branch。Git 官方把 git fetch 定義成「從另一個 repository 下載 objects 和 refs」，而 GitHub 官方更直接說：fetch 會抓回新的 remote-tracking branches 和 tags，但不會把這些變更 merge 到你自己的 branches。 口語定義：先更新我對遠端的認知，不先改我手上的線。
拉取，Pull。 白話講，就是 fetch 之後，順手把抓回來的那條遠端線整合進你目前 branch。GitHub 的基礎文件把它教成 fetch + merge；Git 官方目前的文件更精準，說 pull 會先跑 fetch，再決定如何整合，可能是 fast-forward only、rebase、merge 或 squash。 口語定義：先抓，再整合。 【版本敏感】pull 的實際行為會受你的參數與 Git 設定影響，例如 pull.rebase、pull.ff、pull.squash。所以成熟工程師不會把 pull 想成一個永遠固定的魔法。
合併，Merge。 白話講，就是把兩條已經分岔的歷史接起來。Git 官方對 git merge 的一句話定義是「把兩個或更多 development histories 接在一起」；而且當目標只是單純往前追上時，Git 可以做 fast-forward，只更新 branch 指標，不產生新的 merge commit。 口語定義：把兩條線接成一條，必要時留下接線痕跡。
重整基底，Rebase。 白話講，就是把你這條 branch 上的 commits，搬到另一個更新的基底上重新套一次。Git 官方把 git rebase 定義成「把 commits 重新套到另一個 base tip 上」；Git 官方書則補了最重要的直覺：merge 和 rebase 最後可能得到同樣的程式碼快照，但歷史長相不同。rebase 讓歷史更線性，但它本質上是在重寫 commits。 口語定義：把我這條線上的改動，搬去新的地基上重演一次。
推送，Push。 白話講，就是把你本地 branch 上的 commits 送到遠端 repository。GitHub 官方說 git push 是把本地 branch 上做出的 commits 推到遠端；Git 官方則更完整地說，push 會更新遠端 refs，並把遠端沒有的資料送過去。 口語定義：把我本地的歷史送上 GitHub。
拉取請求，Pull Request，PR。 白話講，它不是 Git 指令，也不是 merge 本身。它是 GitHub 的協作機制。GitHub 官方說 pull requests 讓你 propose、review、merge code changes；也就是說，PR 的本質是提案合併，不是「我已經合併」。 口語定義：請大家來看，這批遠端變更能不能進目標分支。
順手再補一個你會常遇到的錯誤訊息。
non-fast-forward。 白話講，就是遠端那條 branch 已經往前長了，而你的本地還停在舊位置；如果現在直接 push，可能會覆蓋掉遠端已存在的歷史，所以 GitHub 會拒絕你的 push。GitHub 官方對這個錯誤的解釋非常直白：有時 Git 無法在不丟失 commits 的情況下更新遠端，所以 push 會被拒絕。 口語定義：遠端比你新，不能硬蓋。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
你正在 feature/slot-rules-sync 這條 branch 上，修一個很典型的問題： slot 選取邏輯改了，但 selected 樣式和實際資料狀態不同步。 同時，你同事剛把一個新規則合進 main：管理者現在可以封鎖某些 slot，前端要顯示 disabled。這表示你的 branch 已經不是站在最新的 main 上。這時候第一步不是 pull 下去碰碰運氣，而是先看清楚遠端發生了什麼。也就是先 git fetch origin，讓你的本地 origin/main 更新。GitHub 與 Git 官方都把這件事講得很清楚：fetch 會把遠端的新狀態抓回本地書籤，但不會直接 merge 到你現在的 branch。
你可以把這段操作想成：
git fetch origin git log --oneline --decorate --graph --all
第一行先把遠端最新資訊抓回來。 第二行不是必要指令，但很值得養成習慣，因為它會把你目前 branch、origin/main、歷史分岔位置一起畫出來。這時你會清楚看見：原來不是 Git 壞了，而是我的 branch 落後了。
接著你要做的，不是問「哪個指令比較高級」，而是問：
我要用 merge，還是 rebase，把新的 main 整合進我現在的 branch？
如果你選 git merge origin/main，你是在把最新 main 的歷史接進你現在的功能分支。這種做法比較像忠實保留「事情實際怎麼發生」：先有我的功能分支，再把新的主線整合進來。如果只是 fast-forward，Git 只會移動指標；若兩邊都各自長出 commits，則會留下 merge 的痕跡。Git 官方就是這樣定義 merge 與 fast-forward 的。
如果你選 git rebase origin/main，你是在把自己 branch 上那幾個 commits，搬到最新 main 上重新套一次。這通常會得到更線性的歷史。Git 官方書特別提醒一個很重要的觀念：merge 與 rebase 最後可以得到同樣的程式碼快照，差別主要在歷史怎麼講故事。也正因為 rebase 會重寫 commits，所以 Git 官方書也明確告誡：不要去 rebase 已經公開、而且別人可能已經基於它工作的 commits。
在你的預約系統裡，這兩種做法的感受會很不一樣。
如果你想保留這個事實： 「我先修 selected 樣式，後來 main 又加了 disabled 規則，我再把它整合進來。」 那 merge 很直觀。
如果你想讓 PR 看起來更乾淨，像是： 「這條功能分支本來就建立在最新 disabled 規則之上，我只是補完 selected 與 booking 流程。」 那 rebase 通常會比較乾淨。這也是為什麼很多團隊會在開 PR 前，先把自己的 feature branch rebase 到最新 main。但前提還是那句老話：這些 commits 還沒有變成別人的公共地基。
當你把遠端更新整合完，本地測試也過了，例如 slot 顯示正確、booking API 正常、Firestore 類型資料一致、Google Calendar 同步也沒被你新的 disabled 規則打壞，接下來才輪到 push。 這時候的方向是反過來：不是把遠端抓回來，而是把你本地 branch 的 commits 送去遠端 branch。GitHub 官方說得很直接：git push 是把本地 branch 上的 commits 推到遠端 repository。假設你推的是 feature/slot-rules-sync，那 GitHub 上現在會多出這條 branch，讓別人看見你的變更。
但 push 不保證一定成功。 如果同一條遠端 branch 已經被別人往前推過，而你還沒把那些更新整合進來，GitHub 會用 non-fast-forward 拒絕你，因為直接覆蓋可能會丟歷史。官方的建議路徑就是：先 fetch，再 merge，或者直接用 pull 把它們整合回來，再重新 push。這一段其實就是同步方向圖在現實世界裡的安全機制：遠端不讓你用舊地圖硬蓋新地圖。
當遠端 branch 上已經有你的 commits，這時候才輪到 PR。 PR 不是把 code 傳上去，傳上去那一步在 push 就已經做了。PR 是在 GitHub 上說：「我希望把 feature/slot-rules-sync 合進 main，請 review。」GitHub 官方把 PR 定義成 propose、review、merge code changes 的核心協作機制。這句話非常重要，因為它直接拆掉一個常見幻覺：push 完，不等於進主線；PR 開了，也不等於已經 merge。
【版本敏感】如果你是在 GitHub 網頁上處理 PR，還要再多分一層：你怎麼 merge 這個 PR。 GitHub 官方目前的說法是，預設的 Merge pull request 會建立一個 merge commit，而且使用的是 --no-ff 思路；Squash and merge 會把一整條功能分支壓成一個 commit；Rebase and merge 會把 topic branch 上的 commits 一個個加到 base branch 上，不建立 merge commit，但會產生新的 commit SHAs，並更新 committer information。若 repository 的 protected branch 開了「require linear history」，那麼這條受保護分支就不接受 merge commits，PR 只能用 squash merge 或 rebase merge。也就是說，同樣叫做 merge 進主線，最後留下的歷史形狀可能完全不同，而且會受 repo 規則影響。
【版本敏感】如果 PR 的 base branch 在你開 PR 之後又往前長了，GitHub 官方目前也支援在 PR 頁面更新 head branch。條件包括：分支落後、沒有 merge conflicts，以及 repository 有對應設定；更新時可以選傳統 merge，或選 update with rebase。這代表你在 GitHub 網頁上看到的「Update branch」其實也不是單一動作，而是另一個同步選擇點。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
放回 Codex 工作流，你要把這章記成一句話：
Codex 可以幫你執行同步動作，但它不會替你決定同步策略。
OpenAI 官方文件現在已經把這件事寫得很明確。Codex CLI 是一個在終端機裡讀 repository、改檔案、跑命令的 agent，所以它很適合幫你做 fetch、看目前 branch 落後多少、比較 origin/main 和 HEAD 的 diff、跑測試、檢查 rebase 之後有沒有壞掉。Codex App 則內建 common Git features，能直接看 diff、stage / revert，還可以 commit、push、create pull requests；但官方也明說，更進階的 Git 任務建議用 integrated terminal。也就是說，Codex 是你的操作加速器，不是 Git 規則的替代品。
這一章放回你的預約系統時，很實際的工作流會長這樣。
你先用 ChatGPT 把問題想清楚： 這次 feature/slot-rules-sync 要不要 rebase 到最新 main？ 如果 Google Calendar 同步邏輯也一起改了，這次 PR 要不要拆成兩個？ 如果 branch protection 要求線性歷史，這個 repo 適合 merge commit 還是 rebase merge？
接著，你可以用 Codex CLI 去做事： 讓它先 git fetch origin，再看 origin/main 與目前 branch 的差異，請它解釋這次同步會碰到哪些檔案，例如 slotRules.ts、BookingGrid.tsx、route.ts。然後請它先不要直接選策略，而是列出「merge 會怎樣、rebase 會怎樣」。這樣做的關鍵不是省指令，而是讓策略先浮到檯面上。
如果你已經在 Codex App 裡 review diff，那 App 很適合處理這章的後半段： 你看變更、收斂 commit、再由 App 幫你 push、建立 PR。OpenAI 官方文件明確寫到，這些 Git 動作已經能在 App 裡做；但請你牢記，本質沒有變：push 仍然只是同步遠端 branch，create pull request 仍然只是提出合併請求。 不要因為它在同一個桌面介面裡發生，就以為它們變成同一件事。
所以放回整條主線，這章的四句口訣要再唸一次：
AI 負責產生變更。 Git 負責記錄變更。 GitHub 負責同步變更。 我負責決定變更。
尤其在同步世界裡，最後一句更重要。 因為決定「要 merge 還是 rebase」「要不要 force push」「這個 PR 是否現在就該進 main」的人，不能是代理。那是你。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：我 fetch 了，所以我本地 branch 已經更新。 不是。fetch 更新的是你本地對遠端的書籤，也就是 remote-tracking branches，例如 origin/main；GitHub 官方的基礎教學也明寫，fetch 不會把那些變更 merge 到你自己的 branch。真正把遠端更新帶進你目前 branch 的，是 merge、rebase，或 pull 裡的整合那一步。
第二個誤解是：pull 就是安全同步鍵，按下去就好。 不是。Git 官方目前把 pull 講得很清楚：它先 fetch，再整合；整合方式可能是 ff-only、merge、rebase 或 squash，而且會受設定影響。GitHub 的基礎文件則提醒你，因為 pull 會做 merge，所以最好先把本地工作 commit 好。翻成人話就是：pull 不是單純下載，它會動到你目前 branch 的歷史與工作樹。
第三個誤解是：我 push 了，所以主線應該已經更新。 不是。push 只是在更新你推送到的遠端 ref。GitHub 官方把 PR 定義成後面的 proposal / review / merge 機制，這代表 push 和進主線之間，還隔著 PR、review、merge，甚至 branch protection、required checks、deployment gating。你只是把 branch 送上去，不是把它直接塞進 main。
第四個誤解是：rebase 永遠比 merge 高級。 不是。Git 官方書講得非常漂亮也非常務實：merge 與 rebase 可能得到同樣的最終 snapshot，差別主要在歷史怎麼表達。rebase 會讓歷史更線性，但它在重寫 commits；如果那批 commits 已經公開，別人又基於它工作，你去 rebase 它就可能把協作搞亂。所以這不是「高級 vs 初學者」，而是「這次你要保存真實分岔，還是要整理出線性歷史，而且有沒有公共協作風險」。
--------------------------------------------------------------------------------
七、能力邊界
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是讓它先 fetch、比較 origin/main 與目前 branch、列出哪些檔案會受同步影響、幫你產出 merge 與 rebase 的風險摘要、整理 PR description、在 App 裡收斂 diff、協助 push feature branch、建立 PR 草稿。這些事的共通點是：方向清楚、可回看、可 review，而且 OpenAI 官方也已經把 CLI 的讀 repo / 跑命令能力，以及 App 的 commit / push / create pull requests 能力寫進正式文件。
第二層：Codex 可以協助，但人必須主導決策的事。 像是這次要用 merge 還是 rebase、PR 應該用 merge commit 還是 squash merge、功能分支是不是已經公開到不該 rebase、這次要不要把 Google Calendar 同步的修改和 slot UI 修正放同一個 PR、遇到 non-fast-forward 時要不要改走別條 branch。這些都不是「指令會不會敲」的問題，而是歷史策略與協作策略。GitHub 對 merge methods、protected branches、linear history 的規則設計，本身就在提醒你：同步不是純機械操作，它也是團隊治理。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 force push 改寫公共歷史、對受保護的 main 自動 merge、繞過 required reviews / status checks / deployment requirements、替你決定哪一個高風險 PR 應該立刻進主線。GitHub 官方對 protected branches 的設計很明確：是否允許 merge、是否要求線性歷史、是否要成功部署到指定 environment 才能 merge，都是守門規則。守門規則既然存在，就代表這一層不是拿來讓 agent 自作主張的。
所以這章的能力邊界，壓縮成一句話就是：
Codex 很適合幫你跑同步流程；但同步策略、歷史形狀、放行責任，仍然是你的工作。
--------------------------------------------------------------------------------
八、一句帶走
fetch 是看見對岸，merge 或 rebase 是把對岸帶回我這條線，push 是把我這條線送去對岸，PR 才是請求進主線。
--------------------------------------------------------------------------------
本章記憶點
fetch 更新的是本地對遠端的書籤，不是你當前 branch。
pull 的本質是 fetch 之後再整合；怎麼整合，會受設定與參數影響。
push 只是把本地歷史送上 GitHub；PR 才是合併提案，merge 之後也還不等於 deploy。
本章最小實戰動作
在你的預約系統 repo，挑一條還沒合進 main 的功能分支，實際走一次這四步：
git fetch origin git log --oneline --decorate --graph --all git merge origin/main
或：git rebase origin/main
git push origin 你的功能分支名稱
做完之後，不要急著開 PR，先大聲回答這三句： 我剛剛更新的是哪一層？ 我剛剛整合的是哪一條線？ 我剛剛送上去的是遠端 branch，還是已經進主線？
這個練習的重點不是把指令記熟，而是把「看見對岸、帶回自己、送去對岸、請求進主線」四個方向刻進腦中。
本章一句帶走
同步不是一個按鈕，而是一組方向。

第 8 章
衝突、回滾、救援：版本失控時你到底該怎麼想
一、這章只講一件事
這章只講一句核心：
版本失控時，不要先找神奇指令；先判斷你遇到的是哪一種事故。
Git 官方本來就把「救回來」拆成不同類型的動作：merge 遇到衝突時會停下來等你處理；restore 是把檔案或 index 還原；reset 會移動 HEAD 或取消 staged 狀態；revert 是新增一個反向 commit；reflog 則記錄本地 refs 曾經指到哪裡。也就是說，Git 自己都沒有把「回復」當成一個按鈕，你更不該把它想成一個按鈕。
所以這章真正要替你建立的，不是更多指令，而是一張事故分類圖。 當你腦中有這張圖，你就不會一慌就亂按 reset --hard，也不會把本來該 revert 的事情，做成改寫共享歷史的災難。這章的重點只有一個：先辨識事故類型，再選工具。
--------------------------------------------------------------------------------
二、先用畫面理解
把 Git 世界想成一個版本急診室。
不是每一次出事，病人都一樣。 有時是兩股變更撞在一起。 有時是你本地走錯一步，想退回上一個安全點。 有時是你已經把錯的東西公開了，只能正式撤回。 有時則是你連自己剛剛在哪裡都忘了，要先找黑盒子。 GitHub 官方對 merge conflict 的定義是 competing changes；Git 官方對 reflog 的定義則是本地 refs 的移動紀錄。這兩個放在一起看，畫面就很清楚：有些問題是「怎麼選」，有些問題是「怎麼找回」。
你可以把這章先記成一張文字圖：
版本事故處理圖 ├── Git 停下來要你決定保留哪個版本 │　→ 這叫 衝突 conflict ├── 我只想取消本地還沒公開的改動 │　→ 這通常是 restore / reset ├── 錯的 commit 已經 push、甚至 merge 了 │　→ 這通常是 revert └── 我把 commit 弄丟了，想知道剛剛 branch 在哪 　　→ 這通常先看 reflog / ORIG_HEAD
錨點句：衝突是需要選擇，回滾是回到安全點，救援是先找黑盒子。
還有一個很重要的感覺你要建立起來： 衝突不是爆炸。衝突是 Git 有紀律地停下來。 GitHub 官方直接寫到，當分支之間有 merge conflicts 時，你必須先解掉衝突，PR 才能 merge；Merge pull request 按鈕也會停用。這表示它不是壞掉，而是在說：「這一段該由人做決定。」
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這章最關鍵的名詞，一次講白。
合併衝突，Merge Conflict。 白話講，就是兩股變更同時碰到同一塊地方。GitHub 官方列出的典型情況有兩種：同一個檔案同一行，被不同分支改成不同內容；或者一邊改檔，一邊刪檔。 口語定義：Git 不知道該替你留下哪個版本，所以停下來問你。
中止，Abort。 白話講，就是「這次 merge 或 rebase 先不要了，退回開始前的狀態」。Git 官方對 git merge 和 git rebase 都提供 --abort；但 git merge 官方文件也明白警告，如果你在 merge 開始前就有未提交的 worktree 變更，merge --abort 有時未必能完整重建原狀，所以最好在 merge 前先 commit 或 stash。 口語定義：先撤退，不在混亂中硬做決定。
還原，Restore。 白話講，就是把檔案內容或暫存狀態還原成某個來源版本。Git 官方說 git restore 可以把 working tree 檔案從 index 或另一個 commit 還原，也可以用 --staged 還原 index，用 --staged --worktree 同時還原兩邊。 口語定義：把某個檔案拉回某個已知版本，不動 branch。
重設，Reset。 白話講，它不是單一招。Git 官方說 git reset 有兩個主要面向：一個是改變 HEAD 指向哪個 commit，另一個是更新 staged 版本。這也是為什麼它既能拿來回退本地歷史，也能拿來把檔案從 staging 拿掉。 口語定義：動 branch 指標，或動暫存區。
硬重設，Reset --hard。 白話講，這是大刀。Git 官方寫得很清楚：--hard 會把 working tree 與 index 都覆寫成指定 commit 的版本，還可能覆寫 untracked files。 口語定義：把現場直接清成目標版本。 所以這不是不能用，而是不能在沒判斷事故類型前亂用。
反向撤銷，Revert。 白話講，不是回到過去重寫歷史，而是新增一個新的 commit，去抵銷舊 commit 的效果。Git 官方說得很直白：git revert 是 record some new commits to reverse the effect of earlier commits，而且它要求 working tree 先是乾淨的。 口語定義：不改舊歷史，新增一張反向單據。
引用日誌，Reflog。 白話講，就是本地黑盒子。Git 官方說 reflogs 會記錄 branches 和其他 refs 的 tips 何時被更新；像 HEAD@{2} 就代表 HEAD 兩步前在哪裡。 口語定義：我本地剛剛走過哪些位置的紀錄。
原始頭指標，ORIG_HEAD。 白話講，就是 Git 在做大動作前，先幫你留的一條安全繩。Git 官方說，ORIG_HEAD 會在 merge、rebase、reset 這些會大幅移動 HEAD 的操作前，記下原本的 HEAD 位置。 口語定義：大動作前的原點備份。
回滾，Rollback。 這個字在這本書裡，我把它當成白話總稱。 它不是一條固定的 Git 指令。 你回滾的實作方式，可能是 restore 某個檔案，可能是 reset 本地 branch，可能是 revert 一個已公開的 commit，甚至在 GitHub 上是直接對已 merge 的 PR 做 Revert。 口語定義：把系統帶回一個已知安全點。
如果你只想先記一組最小急救字，先記這五個就夠：
git status git merge --abort git restore --staged <file> git revert <commit> git reflog
第一個先看現場。 第二個是 merge 先撤退。 第三個把檔案從下一次 commit 拿掉，但保留改動。 第四個對已經進歷史的錯誤做正式反向撤銷。 第五個在你不知道自己剛剛到底在哪時，先找黑盒子。這組對應的不是五個技巧，而是五種不同情境。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
先看第一種最常見的事故：衝突。
你在 feature/slot-rules-sync 上改 slotRules.ts，把 selected 規則修成和實際可預約狀態一致。 同時你同事在 main 上加了 disabled slot 規則，也改到同一段條件判斷。 當你 merge 或 rebase 時，Git 停下來，檔案裡出現：
<<<<<<< HEAD
BRANCH-NAME
GitHub 官方的 command-line 文件就是這樣描述 conflict markers 的：<<<<<<< HEAD 下面是目前一側的內容，======= 是分隔線，>>>>>>> BRANCH-NAME 下面是另一側內容；你要自己決定保留哪一邊，或寫出第三種新的整合版本，再 stage、commit。這就是為什麼衝突不是「二選一」的死板機制；很多時候，真正正確的答案是重寫成一個同時容納 selected 與 disabled 的新狀態機。
再看第二種事故：本地改亂，但還沒公開。
Codex 幫你改了很多檔案：BookingGrid.tsx、route.ts、calendarSync.ts、FirestoreAdapter.ts 都動了。 結果你 review 後發現，只有 BookingGrid.tsx 的 selected 樣式修正是你要的，route.ts 那段 API 重構現在不該進。 這時候你不是要「推倒重來」，而是要精準把錯的變更拿掉。Git 官方把 restore 定義成 restore working tree files 或 index 內容；Git book 也補得很清楚，git restore --staged <file> 是把檔案從暫存區拿出來，git restore <file> 則會丟掉該檔案尚未提交的本地修改，而且這是危險操作，因為那些改動會直接消失。 所以這類事故的正確心法不是「亂 reset」，而是：我要拿掉的是 staged 狀態，還是 working tree 內容？
第三種事故，是很多人最容易搞錯的：已經公開了，卻想用本地刀法處理。
假設你把 Google Calendar 同步邏輯改壞了。 這個錯誤不只是本地 branch 上有，而是已經 push、開 PR、merge 進 main，甚至已經部署。 這時候，Git 層的首選心法通常不是 reset main，而是revert。Git 官方對 revert 的定義就是新增反向 commit；GitHub 官方對「Reverting a pull request」則更直接：當一個 PR 已經 merge 到 upstream branch 後，在 GitHub 上做 Revert，會建立一個新的 pull request，裡面包含一個對原 merge commit 的 revert。 翻成人話就是：共享歷史裡出錯，通常用正式的反向變更撤回，而不是偷偷把公共時間線改掉。
而且 GitHub 官方還提醒兩個很實際的例外。 如果這個 PR 的 Revert 會造成衝突，或者原 PR 根本不是在 GitHub 上 merge 的，例如是用 command line fast-forward 合進去，那你可能需要改成手動 revert 個別 commits。這對你的預約系統很重要，因為像 route.ts、calendarSync.ts、auth.ts 這些檔案常常會在不同 PR 裡彼此交錯。你不能只因為畫面上有個 Revert 按鈕，就以為所有回滾都會是單鍵完成。
第四種事故，是最讓人心慌的：我明明有那個 commit，但它怎麼不見了？
這很常發生在你想把 PR 弄乾淨時。 你把 feature/slot-rules-sync rebase 到最新 main，又做了幾次 reset，結果原本修好的 slot selected commit 好像消失了。 這時先不要慌。Git 官方說 reflog 會記錄 refs 何時被更新，像 HEAD@{2} 就能表示兩步前的 HEAD；rebase 官方文件也補充，rebase 一開始會設定 ORIG_HEAD 指向原 branch tip，但如果過程中你又做了會改 ORIG_HEAD 的動作，最穩的找回方式仍然是 current branch 的 reflog。 所以真正成熟的反應不是「完了，全沒了」，而是：先開黑盒子。
這裡再送你一句會救命的話：
已經 commit 的東西，通常還有機會找回。 從來沒 commit 過的東西，才是真的危險。
Git 官方書就是這樣提醒的：被 commit 過的東西，幾乎總能透過 Git 找回；從未 commit 就丟掉的內容，則很可能再也看不到。這句話一進腦，你對版本急救的恐慌會小很多。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這章放回 Codex。
【版本敏感】今天的官方文件顯示，Codex App 內建 Git tools，diff pane 可以直接看你 local project 或 worktree 的 Git diff，也能 stage 或 revert 特定 chunks 或整個檔案，之後再 commit、push、開 PR；但官方同一頁也明說，更進階的 Git 任務建議用 integrated terminal。 這句話很重要。 因為它等於是在告訴你：小範圍收斂變更，可以在 App 做；真正高風險的急救，應該回到終端機，明白知道自己在做什麼。
【版本敏感】Codex CLI 這邊，官方文件寫到 /review 會啟動一個專門 reviewer，讀你選的 diff，回報 prioritized、actionable 的發現，而且不會碰你的 working tree。 這對救援特別有用。 因為你在版本混亂時，最需要的常常不是「再多改一點」，而是「先把現場看清楚」。 所以一個成熟的用法是：先讓 CLI /review 幫你把這次 diff 的問題點列出來，再決定你是在解衝突、做 restore、做 revert，還是先查 reflog。
把它翻成工作流，就是這樣：
ChatGPT 幫你判斷事故類型。 Codex 幫你檢查 diff、整理候選修法。 Git 負責保存與回退路徑。 GitHub 負責共享世界裡的正式撤銷與審查。 你負責決定：這次是要解衝突、放棄合併、反向撤銷，還是做資料救援。
這裡你要開始養成一個新的 prompt 習慣。 不要只對 Codex 說：「幫我救回來。」 你要說得更像工程指揮：
「我現在在 merge conflict，中止比較安全，先幫我確認有哪些 unmerged files。」 「我只想把 route.ts 從 staged 拿掉，不要動 working tree。」 「這個錯誤 commit 已經 merge 到 main 了，請先幫我規劃 revert，不要改寫歷史。」 「我做完 rebase 後 commit 像消失了，先幫我讀 reflog 找可能的舊位置。」
一旦你這樣說，Codex 才是在架構內工作，不是在混亂裡亂猜。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
衝突代表 Git 壞掉了。
不是。 GitHub 官方反而把衝突寫得很清楚：就是 competing changes，Git 需要你幫忙決定最後要保留什麼。PR 上的 Merge 按鈕會被停用，也是在提醒你「這一段是決策，不是機械動作」。
第二個誤解是：
回滾就是 git reset --hard。
不是。 Git 官方明確把 reset、restore、revert 分成不同角色：restore 還原檔案與 index，reset 會移動 branch / HEAD 或更新 staged 狀態，revert 是新增一個反向 commit。你遇到的是哪一層事故，決定了你該用哪一把刀。
第三個誤解是：
merge --abort 一定能百分之百還原現場。
不是。 Git 官方的 git merge 文件直接警告：如果 merge 開始前就有未提交的 worktree 變更，尤其後來又繼續改過，merge --abort 有時無法完整重建那些原本的改動；官方因此建議 merge 前先 commit 或 stash。 所以真正成熟的做法是：不要帶著模糊未提交狀態就衝進 merge。
第四個誤解是：
Git 裡的東西都一定救得回來。
不是。 Git 官方書講得很誠實：被 commit 過的東西幾乎總能救；但從來沒 commit 過、又被你用危險指令覆蓋掉的本地內容，很可能就沒了。 所以版本急救最重要的保命線，仍然是：盡量先形成 commit，再做高風險操作。
第五個誤解是：
revert merge commit 跟 revert 普通 commit 一樣簡單。
不一定。 Git 官方說，通常你不能直接 revert 一個 merge，因為 Git 不知道哪一邊才是 mainline，所以需要 -m <parent-number> 指定；而且官方也提醒，revert 一個 merge commit 等於宣告你不要那次 merge 帶來的 tree changes，這會影響之後的 merges。 也就是說，撤回 merge 不是普通倒帶，而是對後續歷史有後果的決策。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，不是看 Codex 會不會跑 Git 指令。 而是看哪一種急救可以讓它協助，哪一種一定要你親自拍板。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是讀 git status、列出哪些檔案是 unmerged、解釋 <<<<<<< HEAD 這些 markers 在哪裡、把 diff 摘要成「slotRules 和 BookingGrid 在同一段條件分岔了」、建議哪幾個檔案先從 staging 拿掉、在 App 裡幫你 revert 某些明顯不該留下的 chunks、用 CLI /review 先檢查這次救援會不會傷到別的邏輯。這些事的共通點是：它們幫你看清現場，而不是替你做最終決策。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 merge conflict 到底要保留 ours、theirs、兩者合併，還是重寫第三種版本；Google Calendar 同步壞掉時，這次要 revert 整個 PR，還是只 revert 其中兩個 commits；feature/slot-rules-sync 這條 branch 是該 reset 重切，還是該保留歷史改用 revert。 這些事情不是「Git 會不會」，而是「產品與歷史該怎麼講」。 Git 只能強迫你面對衝突，不能替你理解 slot 規則、API 相依與商業後果。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是在共享分支上做高風險 reset --hard、force-push 改寫大家已經在用的歷史、對已 merge 的 PR 自動做 revert 並直接放到 production、在你還沒看過 reflog 和 diff 前就丟掉本地未提交變更、或把 .env、token、真實資料修復腳本一起清掉。 因為這些不是單純技術操作，而是責任操作。 尤其 Git 官方與 GitHub 官方都反覆提醒：--hard 會覆寫本地內容；revert merged PR 是正式生成新的 PR；merge / rebase / reset 這些大動作都會改變 refs 的位置。 這種層級的後果，不能交給代理自行拍板。
所以這章的能力邊界，濃縮成一句話就是：
Codex 很適合幫你看清楚混亂；但要丟掉什麼、保留什麼、正式撤回什麼，最後一定是你決定。
--------------------------------------------------------------------------------
八、一句帶走
版本失控時，先分清這是衝突、回滾，還是救援；別用同一把刀處理所有事故。
--------------------------------------------------------------------------------
本章記憶點
衝突不是 Git 壞掉，而是 Git 停下來等你做語意決策。
restore、reset、revert 不是近義詞；它們分別在處理檔案、歷史與正式反向撤銷。
已 commit 的東西通常還有機會救；從未 commit 就被覆蓋的本地內容，才最危險。
本章最小實戰動作
在你的預約系統 repo，現在就做一個零風險救援練習：只跑一次 git reflog，然後大聲說出 HEAD@{1} 代表什麼。如果你看得懂這一條，你之後遇到 reset、rebase、切 branch 後「東西不見了」的恐慌，會立刻小很多。
本章一句帶走
衝突是需要選擇，回滾是回到安全點，救援是先找黑盒子。

第 9 章
把「提交」講清楚：Codex 的提交、Git commit、push、PR 到底哪裡不同
一、這章只講一件事
這章只講一句核心：
你口中的「提交」，其實常常不是同一個動作。
今天查到的官方文件把這些動作分得非常清楚。OpenAI 官方在 Codex worktrees 文件裡，把開始工作寫成「送出 prompt / task」；Git 官方把 commit 定義成把 index，也就是 staging area，變成一個新的本地 commit；GitHub 官方把 push 定義成把本地 branch 上的 commits 送到 remote repository，把 PR 定義成「提議合併變更」；GitHub Actions 官方又把部署寫成另一條 CI/CD 流程，甚至直接舉例可以在 merged pull requests 之後部署到 production。也就是說，下任務、commit、push、PR、merge、deploy，本來就是六個不同層級。
所以這一章要做的，不是再多教你幾個按鈕。 而是把這句混成一團的話拆開：
「我已經提交了。」
你到底是在說：
我把任務交給 Codex 了？ 我做了本地 commit？ 我 push 到 GitHub 了？ 我開 PR 了？ 我 merge 了？ 還是我真的 deploy 上線了？
這六句，只要你一混，整個工作流就會糊掉。
--------------------------------------------------------------------------------
二、先用畫面理解
把這條流程想成一條物流線。
你先對工班下工單。 工班真的把東西做出來。 你把這批東西封成一箱。 你把箱子寄到總倉。 你提交上架申請。 倉管審核通過，放進主貨架。 最後門市真的上架，客人買得到。
這裡最容易混的是： 你對工班下工單，不等於已經封箱。 你封箱，不等於已經寄出。 你寄出，不等於總倉已經收進主貨架。 主貨架收了，也不等於門市今天就已經上架。
把這張文字圖直接記住：
需求 → 對 Codex 下任務 → 產生 diff → Git commit 本地快照 → push 到遠端 branch → PR 請求合進 base branch → merge 進主線 → deploy 到 staging / production
Git 與 GitHub 的官方文件，就是這樣把世界切開的：commit 是本地歷史、push 是送到遠端、PR 是提案合併、deploy 是另一條交付流程。GitHub Actions 官方甚至把「build / test 每個 PR」和「deploy merged pull requests to production」分開寫，這正好在提醒你：審查世界和交付世界，本來就不是同一關。
錨點句：對 Codex 交代工作，不等於對 Git 記錄版本；對 Git 記錄版本，不等於對 GitHub 提案合併。
--------------------------------------------------------------------------------
三、把名詞翻成白話
向 Codex 送出任務，submit a task / prompt。 白話講，就是你把一個工作交給代理開始做。OpenAI 官方在 worktrees 文件裡，明確把這一步寫成「Submit your prompt」，接著 Codex 才會依你選的 branch 建立 worktree；而同一頁後面才另外寫到你之後可以 commit、push、開 PR。 口語定義：叫 Codex 開工。 這不是 Git commit。這只是讓 agent 開始工作。
提交版本，Commit。 白話講，就是把你這次準備好的變更，記成一個本地版本點。Git 官方把 git commit 定義成建立一個新 commit，內容來自 index；GitHub 官方則補了一個很好懂的白話：commit 很像把已修改的檔案存成一個版本單位，而且每個 commit 都有自己的 SHA，能識別改了什麼、誰改的、什麼時候改的。 口語定義：把這次改動封成一張本地快照。
GitHub 網頁上的「Commit changes」。 這個特別容易害人混淆。GitHub 官方的檔案編輯文件寫得很清楚：你在網頁上改完檔案後，可以選「把 commit 加到目前 branch」，也可以選「為這個 commit 建一條新 branch，然後再建立 pull request」。 口語定義：在 GitHub 網頁上產生一個 commit。 注意，這一步仍然只是 commit，不是 PR，更不是 merge。GitHub 的介面甚至把「commit 到新 branch」和「接著建立 PR」拆成兩段。
推送，Push。 白話講，就是把你本地 branch 上已經存在的 commits，送到 remote repository。GitHub 官方的定義非常直接：git push 是把 local branch 上的 commits 推到 remote repository。 口語定義：把我本地的版本送上 GitHub。 所以 push 的前提，是你本地先有 commit。沒有 commit，push 沒東西可送。
拉取請求，Pull Request，PR。 白話講，不是把 code 傳上去，而是提出一個「請把這批變更合進某個 base branch」的申請。GitHub 官方把 PR 定義成 proposals to merge code changes，也強調它是 review 與討論的核心協作機制。 口語定義：請大家來看，這批變更能不能進主線。 所以 PR 的本質是「申請」，不是「已經合併」。
草稿 PR，Draft Pull Request。 這個字很值得你記住。GitHub 官方明說，Draft pull requests 不能被 merge。 口語定義：我先把工作攤出來，但還沒正式請求放行。 這一句很能幫你把 PR 和 merge 在腦中徹底拆開。
合併，Merge。 白話講，就是 PR 經過 review、規則檢查、決策之後，真的被納進 base branch。GitHub 官方的合併文件寫到，當你在 PR 頁面選擇 merge 時，是把這個 head branch 的變更合進 base branch。 口語定義：正式進主線。 所以 merge 是 PR 之後的事，不是 PR 本身。
部署，Deploy。 白話講，就是把某個版本送到實際執行的環境。GitHub 官方把 environments 定義成像 production、staging、development 這樣的 deployment target，還可以要求 approval、限制分支、限制 secrets；GitHub Actions 官方也直接說，你可以建立 workflows，讓 merged pull requests 部署到 production。 口語定義：把版本送到真的會跑的地方。 這一步跟 merge 不是同義詞。
如果你只想先記最小口訣，先記這六層：
對 Codex 送任務。 對 Git 做 commit。 對 GitHub 做 push。 在 GitHub 開 PR。 在 GitHub merge。 在部署環境上線。
--------------------------------------------------------------------------------
四、把它放回你的專案
回到我們固定的主案例：預約／排程系統。
你今天發現一個很典型的 bug： slot 選取邏輯改了，但 selected 樣式和實際資料不同步。
你對 Codex 說：「請修 slotRules.ts 和 BookingGrid.tsx，讓 selected 與可預約狀態一致，順便檢查 booking 後的 UI 回填。」 這一步，如果放在 Codex App / worktree 的語境裡，官方叫做送出 prompt 或 task，讓 thread 開始工作。這代表代理開始讀專案、改檔案、跑命令；但它還不等於你的 repo 已經有 commit。OpenAI 官方 quickstart 甚至特別建議，在 Codex 任務前後建立 Git checkpoints，這反過來就說明了：任務本身不是 checkpoint，task 和 Git 版本點是兩回事。
接著 Codex 改了幾個檔案。 你 review 後，決定先收這一批和 slot / selected 有關的變更。你把它 commit 起來。 這時候你完成的是：本地版本記錄。 Git 官方與 GitHub 官方都把 commit 定義成 branch 上的一個版本點，帶著 SHA 與訊息。它讓你之後能回頭查這次到底改了哪些內容。 但這一步仍然只在本地，GitHub 還不一定看得到。
再來，你做 push。 這時候遠端的 feature branch 才會出現這些 commits；GitHub 官方的說法很直接，push 就是把本地 branch 上的 commits 送到 remote repository。 所以「我已經 commit 了」和「GitHub 上已經有了」之間，中間還隔著一個 push。這就是為什麼很多人會覺得「本地明明好了，GitHub 怎麼沒看到」——因為他走到的是 commit，不是 push。
接著，你開 PR。 這時候你才是在說：「我希望把 feature/slot-rules-sync 合進 main。」GitHub 官方明確把 PR 定義成 proposal to merge，而且如果你選 Draft PR，它甚至還不能被 merge。 所以你現在完成的是：提出合併申請。 不是主線更新。不是上線完成。不是交付結束。
再來，PR 被 review、通過、merge。 這時候你完成的是：主線被更新。 如果 repository 有 branch protection，還可能要求 approving review 或 passing status checks 之後才准 merge。GitHub 官方就是這樣設計 protected branches 與 PR reviews 的。 所以 merge 這一關，已經是治理層，不只是同步層。
最後，就算 PR 已 merge，你的 Google Calendar 仍然可能在線上沒建立事件。 因為 merge 不等於 deploy。GitHub Actions 官方把 build / test / deploy pipeline 分開寫，還直接舉例 merged pull requests 可以部署到 production；environments 又可以要求 approval、限制 branches、限制 secrets。 這就是為什麼你在預約系統裡，常常會碰到這種情況： 本地 booking API 通了。 GitHub 也有 PR。 甚至 main 也 merge 了。 但 production 還是沒有新事件。 問題不一定在 createCalendarEvent()，而可能是 deployment environment 的 token、approval、branch policy，或者 secrets 根本還沒到位。
所以，當你下次說「我已經提交了」，請你自己再補一句：
提交的是哪一層？
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
這一章放回 Codex 工作流時，有一個你一定要牢記的重點：
在 Codex 世界裡，至少有兩種完全不同的「提交」。
第一種，是把任務送給 Codex。 OpenAI 官方在 worktrees 文件裡，真的就是用「Submit your prompt」來表示你把工作交給代理；而且這一步之後，Codex 才建立對應的 worktree、開始在那個上下文做事。這一種「提交」，本質上是任務啟動。
第二種，是把變更 commit 到 Git。 OpenAI 官方同一套 Codex App 文件又另外寫到，App 內建 Git tools，你可以看 diff、stage / revert chunks 或整個檔案，並且直接 commit、push、create pull requests。 也就是說，官方文件自己就把「送任務給 Codex」和「commit / push / PR」分成不同動作。這不是我們教學上硬拆，是產品本身就這樣設計。 【版本敏感】
【版本敏感】更進一步，Codex App 的設定頁甚至把 commit messages 和 pull request descriptions 分成兩種可自訂的提示來源，並且讓你選擇是否允許 Codex 使用 force pushes。這件事本身就在提醒你：對 Codex 來說，commit、PR description、force push 也不是同一件事，而是不同層級的 Git / GitHub 行為。
所以放回你的日常工作流，畫面應該是這樣：
你先在 ChatGPT 把需求講清楚。 再把任務送給 Codex。 Codex 在 working tree 產生 diff。 你 review 後，決定哪些變更要 commit。 再決定要不要 push。 再決定要不要開 Draft PR 還是正式 PR。 再決定何時 merge。 最後才是 deploy。
這時候，你就不會再把所有「送出去」的動作都叫做提交。 你會開始說得更精準：
我剛把任務交給 Codex。 我剛做了 commit。 我剛把 branch push 上 GitHub。 我剛開了一個 Draft PR。 我剛 merge。 我還沒 deploy。
一精準，腦就穩。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
我把任務送給 Codex 了，所以等於我已經 commit。
不是。 OpenAI 官方在 worktrees 文件裡，先寫「Submit your prompt」，後面才寫 commit、push、open a pull request。這代表 task submission 是 agent workflow 的開始，不是 Git 版本點。
第二個誤解是：
我在 GitHub 網頁上按了「Commit changes」，所以等於我已經開 PR。
不是。 GitHub 官方的檔案編輯文件明確把這兩步分開：你先決定 commit 到目前 branch，或 commit 到新 branch；如果需要，再建立 pull request。 所以 GitHub 網頁上的「Commit changes」按鈕，仍然是在做 commit，不是在做 PR。
第三個誤解是：
我 push 了，所以主線應該已經更新。
不是。 GitHub 官方把 push 定義成把本地 commits 送到 remote repository；把 PR 定義成提議合併；而 merge 又是 PR 之後的另一個動作。 換句話說，push 常常只是讓遠端 branch 更新，未必碰到 main。
第四個誤解是：
我開 PR 了，所以等於快上線了。
不一定。 PR 只是 proposal to merge，甚至 Draft PR 連 merge 都不能做；而 protected branches 還可能要求 approving reviews 與 passing status checks。 也就是說，PR 是審查流程的入口，不是交付流程的終點。
第五個誤解是：
merge 了，就等於 deploy 了。
不是。 GitHub Actions 官方把 CI/CD pipeline 寫成 build、test、deploy 的流程，並且直接說可以部署 merged pull requests 到 production；deployment environments 又可以要求 approvals、限制 branches、限制 secrets。 所以 merge 是版本進主線，deploy 是版本進環境。兩者中間，還可能隔著保護規則。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，重點不是「Codex 會不會按這些按鈕」，而是哪一層可以讓它代做，哪一層只能讓它代勞不能代決，哪一層不能交出去。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是根據 diff 產生較乾淨的 commit 候選、草擬 commit message、整理 PR description、在 feature branch 上完成低風險 commit、幫你 push 到你自己的功能分支、替你開一個 Draft PR。OpenAI 官方文件已經明確寫到 Codex App 可以 commit、push、create pull requests；設定頁也支援 commit messages 與 PR descriptions 的提示自訂。 這一層的關鍵是：它在幫你加速表達，不是在替你決定方向。 【版本敏感】
第二層：Codex 可以協助，但人必須主導決策的事。 像是這次 slot 規則修正應該切成一個 commit 還是兩個、Google Calendar 同步修正要不要和 UI 修正放同一個 PR、這個 PR 現在該是 Draft 還是 Ready for review、最後用 merge commit、squash merge，還是 rebase merge。GitHub 官方對 PR、merge methods、reviews 的設計，本來就把這些當成團隊治理問題，不是單純傳輸問題。 這一層的關鍵是：Codex 可以幫你整理，但 commit 邊界、PR 邊界、merge 方式是你在定義歷史。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 force push 改寫公共歷史、直接 merge 受保護的 main、繞過 required reviews / status checks、用 production secrets 直接部署、在還沒看懂環境保護規則前就放行 production。GitHub 官方對 protected branches 的說法很清楚：受保護的分支可以要求 approving reviews、passing status checks，甚至不能 force push；environments 也可以要求 approval、限制 branches、限制 secrets。 所以哪怕 【版本敏感】今天 Codex App 設定裡已經有「是否允許 force pushes」這種選項，也不代表你應該把這個決策交給代理。因為這不是技術能力問題，而是責任歸屬問題。
這一章的能力邊界，可以濃縮成一句很實際的話：
Codex 可以幫你把變更送到對的層，但不能替你決定這批變更應不應該往下一層走。
--------------------------------------------------------------------------------
八、一句帶走
「提交」不是一個按鈕，而是一條鏈：對 Codex 送任務、對 Git 做 commit、對 GitHub 做 push 與 PR、對主線做 merge、對環境做 deploy。
--------------------------------------------------------------------------------
本章記憶點
把任務送給 Codex，不等於已經 commit。
commit 是本地版本點，push 是送到遠端 branch，PR 是提議合併。
merge 也還不等於 deploy；真正上線還要過部署環境那一關。
本章最小實戰動作
拿你現在手上一個正在做的功能，直接寫下這六格：
Codex task 已送出嗎？ Git commit 了嗎？ push 了嗎？ PR 開了嗎？ merge 了嗎？ deploy 了嗎？
哪一格空著，你就不是「還沒完成」，而是只完成到某一層。
本章一句帶走
不要再說「我已經提交了」；要說清楚，我提交的是任務、commit、push、PR、merge，還是 deploy。

第 10 章
今天的 Codex 到底是什麼：Windows App、CLI、IDE、Cloud 的角色分工
一、這章只講一件事
這章只講一句核心：
今天的 Codex，不是一個單一視窗，而是一套同一個 agent 的多表面工作系統。
OpenAI 官方目前把 Codex 定義成「用於軟體開發的 coding agent」IDE extension、Codex Cloud。它們都在做「讀、改、跑」這件事，但各自站在不同工位上：App 是桌面工作中心，CLI 是終端現場，IDE extension 是編輯器內副駕，Cloud 是遠端背景工地。rShell 加 Windows sandbox；但 CLI 的 Windows support 仍標示 experimental，最佳體驗建議在 WSL workspace；IDE extension 也把 Windows support 標成 experimental，且設定頁直接寫「Codex agent mode on Windows currently requires WSL」。所以這一章真正要替你建立的，不是功能清單，而是一張「今天該在哪個表面做哪種事」的地圖。跨專案切換、同時看多個 thread、收斂 diff、做 review、決定哪批變更要 commit、push、PR。 這個工位，叫 Codex App。官方把它叫做一個 focused desktop experience，主打 parallel threads、worktrees、automations 和 built-in Git。gent 讀 repo、改檔、跑命令、做本地 review。 這個工位，叫 Codex CLI。官方寫得非常直白：它可以在你選定的 directory 讀、改、跑 code。ngGrid.tsx、route.ts、calendarSync.ts`，它就直接貼著你打開的檔案、選取的程式碼、目前編輯上下文來協作。 這個工位，叫 Codex IDE extension。官方說它使用和 CLI 相同的 agent，也共享同一套 configuration；而且在 IDE 裡，open files 與 selected code 會直接變成上下文。nt 裡背景跑、平行跑，等你回來再 review 結果、拉 diff、甚至建立 PR。 這個工位，叫 Codex Cloud。官方把它寫成「delegate to Codex in the cloud」，而且說它能在自己的 cloud environment 中背景工作、平行工作。
Windows 電腦 → App 原生跑：PowerShell ＋ Windows sandbox → 或 App 切到 WSL：agent 改在 Linux 環境裡跑 → 或 CLI / IDE 走 WSL workspace：這是官方目前對 Windows 上 CLI / IDE 較偏好的路線
這表示你不是只在選介面，你其實也在選執行位置。某一個視窗，而是 OpenAI 的 coding agent。 口語定義：**會讀、會改、會跑的工程代理。**它的角色不是單純聊天，而是把 parallel threads、worktrees、automations、Git diff review 放在一個桌面中心裡。 口語定義：**多任務調度與收斂中心。**ine interface，命令列介面。 白話講，就是在終端機裡直接讓 Codex 站進你目前資料夾做事。 口語定義：**在 repo 現場真正動手的入口。**是把同一個 agent 放進你的編輯器裡。 它不是另一個大腦，而是和 CLI 同一套 agent、同一套 config，只是更靠近 open files、selected code、目前編輯脈絡。 口語定義：**貼著你正在看的檔案一起工作的副駕。**線，而是 Codex 任務在遠端雲端環境執行。 它會在自己的 cloud environment 裡背景跑工作；如果是 repo 型任務，官方文件也說它會 clone 你的 repository、checkout 正在工作的 branch。 口語定義：遠端背景工地，不是 production 環境。原生的命令列殼層。 在今天的 Codex App for Windows 文件裡，官方明寫預設 Windows-native agent 代表它在 PowerShell 裡跑命令。 口語定義：Windows 原生現場。【版本敏感】ndows 原生模式下，拿來把 agent 活動框在邊界內的沙盒。 官方文件說 native Windows agent mode 會用 Windows sandbox 阻擋工作資料夾外的寫入，並在沒有你明確批准前阻擋網路。 口語定義：Windows 原生的安全圍欄。【版本敏感】x。 白話講，就是讓你在 Windows 上跑一個 Linux 工作環境。 今天官方建議是：如果你需要 Linux-native tooling，或你的開發流程本來就活在 WSL，Codex 可以跑進 WSL；CLI 和 IDE 在 Windows 上也都偏向把 WSL 當成較好的工作場。 口語定義：讓 Windows 變成可用 Linux 工作流的橋。【版本敏感】 IDE 比較像貼身副駕。 Cloud 比較像遠端分身。
--------------------------------------------------------------------------------
四、把它放回你的專案
回到我們整本書固定的主案例：預約／排程系統。
你今天有四種不同類型的工作。
第一種，是你要同時盯兩條線： 一條在修 slot 的 selected / disabled 規則。 另一條在查 Google Calendar 為什麼沒有建立事件。 這時最適合的通常是 Codex App。因為 App 本來就是拿來跨 project / thread 切換、平行處理、看 review pane、收斂 diff 的桌面中心。你不是要它離檔案最近，而是要它把多個任務放在你看得見的同一張桌上。g/route.ts、跑測試、看 log、比對 git diff、用 /review 先做一次本地 code review。 這時比較像 Codex CLI 的工作。因為 CLI 的官方角色就是 terminal 裡的本地 agent，能 inspect repository、edit files、run commands，還支援本地 review 與 cloud task 入口。es.ts、calendarSync.ts。 你想對著目前開啟的檔案直接說：「根據這三個檔案，把 selected 樣式和實際 slot availability 對齊；別碰 booking 提交流程。」 這時最順的通常是 IDE extension。因為它會自動利用 open files、selected code、@file 參照，把局部上下文變成更短、更準的提示。 例如你想把 token / auth / env config 和 Google Calendar 同步流程整體梳理乾淨，但你不想卡住自己當下的本地工作。 這時比較像 Codex Cloud。官方文件把它定位成背景、平行的 cloud environment；你可以在瀏覽器裡直接開任務，也可以從 IDE 委派到 cloud，之後再把 diff 拉回本地測、修、收尾。y 做工作，官方文件說 cloud thread 會 clone repo 並 checkout branch；因此要讓它直接用你的 repo 工作，通常要先把 code push 到 GitHub。 但如果你是從本地 conversation 委派到 cloud，官方文件也寫到它可以把既有 conversation context 甚至 local source changes 一起帶過去。 翻成白話就是：Cloud 不是永遠只能看 GitHub 上那份，但它的進場方式不同，能看到的上下文也不同。 工作流。
第一步，還是 ChatGPT。 你先把需求講清楚：這次是 UI 問題、API 問題、資料模型問題，還是整體同步鏈問題。這一層是策略，不是表面。
第二步，決定這次最主要的 Codex 工位。 如果你要管理多條 thread、做跨任務 review、最後收斂 commit / push / PR，選 App。 如果你要貼近 repo 現場、跑命令、看 terminal 回應、做本地 review，選 CLI。 如果你正在編輯器裡看檔案，想利用 open files 和 selected code，選 IDE extension。 如果任務長、平行、想在背景跑，選 Cloud。這不是「哪個比較強」，而是「哪個比較貼近這次工作的摩擦面」。的 Windows 原生體驗最完整；CLI / IDE 的 Windows 體驗仍偏 WSL。** 官方 Windows 指南寫到，Codex 在 Windows 上有三種實際跑法：原生 Windows 的 elevated sandbox、原生 Windows 的 unelevated sandbox、或在 WSL 裡跑 Linux sandbox。App for Windows 預設用 Windows-native agent，也就是在 PowerShell 裡跑；官方並且建議 native Windows sandbox 當預設，只有在你需要 Linux-native tooling、工作流本來就在 WSL，或 native sandbox 不適合你環境時，才改走 WSL。mental，最佳 Windows experience 建議在 WSL workspace；IDE extension 頁面也寫 Windows support is experimental，設定頁更直接補一句：Codex agent mode on Windows currently requires WSL。 所以如果你今天在 Windows 上想要最穩的本地工作中心，App 原生 是很強的選項；如果你要 CLI / IDE 的 agent 工作流，WSL 仍然是官方更偏好的落點。s-native agent，官方建議專案主要放在 Windows filesystem，從 WSL 用 /mnt/<drive>/... 去存取，會比直接把專案開在 WSL filesystem 更可靠。 如果你真的要讓 agent 本身跑進 WSL，就去 App settings 把 agent 從 Windows native 切到 WSL，然後重啟 App。 這種細節不是小事，因為它直接影響你對 repo 路徑、工具鏈與 sandbox 的預期。異也要先記住。【版本敏感】 官方 authentication 文件寫到，Codex Cloud 需要用 ChatGPT 登入；CLI 與 IDE extension 支援 ChatGPT 或 API key；App 也可用 API key，但 App overview 又補充：如果你用 API key 登入，部分功能例如 cloud threads 可能不可用。 所以當你發現「我明明有 Codex，怎麼沒有 cloud」時，先不要立刻懷疑自己找錯按鈕；先查你現在是哪個表面、用哪種登入方式。 明確共享同一套 ~/.codex/config.toml 與 project-level config；OpenAI 的 best practices 又進一步寫到，CLI、IDE、App 三者都共享同一組 configuration layers。 所以你不要把它們想成三個完全斷開的宇宙。更接近的理解是：**同一套代理體系，換不同入口與工作姿勢。dex 全部。
不是。 App 是 command center，但 CLI、IDE、Cloud 都是正式工作表面。官方文件甚至明寫，IDE 可把任務委派到 cloud，CLI 也有 codex cloud 入口。 也就是說，App 不是唯一真身，它只是其中一個很重要的表面。的執行環境，不是你的產品 production。官方寫的是 Codex 在自己的 cloud environment 背景工作；另一份文件則說 cloud thread 會 clone 你的 repository、checkout branch。 這跟把預約系統部署到線上，完全不是同一層現實。不是。 官方文件明寫 IDE extension uses the same agent as the Codex CLI，並共享同一套 configuration。 所以你不應把它理解成「兩套模型」，而要理解成「同一個 agent，兩個不同入口」。跑，那 CLI 和 IDE 應該也一樣穩。**
不是。 今天官方寫法恰好相反：App on Windows 是明確主打 PowerShell ＋ native Windows sandbox；但 CLI 和 IDE 仍把 Windows support 標為 experimental，且 IDE agent mode 目前需要 WSL。 這就是本章最重要的【版本敏感】現實。n 文件明寫 cloud requires ChatGPT sign-in；App overview 也明寫用 API key 登入時，部分功能像 cloud threads 可能不可用。 所以功能差異有時不是你不會用，而是登入模式本來就不同。個表面最強」，而是「哪個表面適合讓 Codex 主做，哪個決策一定要你自己拿」。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是讓 IDE extension 先根據 open files 修一個 BookingGrid.tsx 的 UI 問題，讓 CLI 先在 route.ts 周邊跑測試與 /review，讓 App 幫你集中看 diff、stage / revert 某些 chunks，或把長一點的 issue triage 丟到 cloud 背景跑，之後你再 review 結果。這些都屬於「表面負責加速，最後由你驗收」的工作。 就地修；這個長任務該不該委派到 cloud；如果你在 Windows 上，該跑 native PowerShell 還是切到 WSL；cloud task 應該從 main 起跑，還是從你的 local changes 繼續。這些不是功能問題，而是工作流設計。官方文件提供了這些路徑，但不會替你決定哪條路最適合你的 repo。(Full Access)` 或 Full Access mode 就直接把所有權限打開、把 production secrets 也一起交出去、把雲端任務結果直接當成可上線版本、或把「Cloud 在背景跑」誤當成「線上環境已經安全」。官方文件對 full access 都明確附上 Exercise caution 或 data loss 風險提醒；Windows 文件也提醒 Full Access 會突破 project directory 邊界。 換句話說，**表面越方便，越不代表你該放棄審核。可以替你做事；但要在哪個工位做、權限開到哪裡、成果能不能往下一關走，永遠是你決定。
--------------------------------------------------------------------------------
八、一句帶走
今天的 Codex，不是一個工具，而是一個多表面工作系統：App 管調度，CLI 管現場，IDE 管檔案上下文，Cloud 管背景平行；你要先選對工位，再要求它做對事。 目前要求 WSL。混淆交付責任。四種工作各放進一個工位： 「修 BookingGrid.tsx 的局部 UI」放 IDE； 「跑 route.ts 周邊測試與 review」放 CLI； 「同時追 slot 與 Google Calendar 兩條線」放 App； 「把 token / auth / env 梳理成長任務」放 Cloud。 然後再補一句：【版本敏感】如果你在 Windows 上，這四件事裡哪幾件要留在原生，哪幾件更該走 WSL？ 

第 11 章
Thread、Session、Worktree、Local / Worktree、Handoff：Codex 的工作空間地圖
一、這章只講一件事
這章只講一句核心：
這些名詞不是介面字眼，它們是在回答：你的任務現在住在哪裡，接下來要在哪裡繼續做。
OpenAI 官方今天把這張地圖拆得很清楚：thread 是一條工作線；Local、Worktree、Cloud 是 thread 的執行模式；Worktree 是用 Git worktree 做出的隔離 checkout；Handoff 則是把 thread 在 Local 和 Worktree 之間安全移動的流程。也就是說，這一章不是在講術語大全，而是在講 Codex 的工作空間模型。
如果這張地圖沒立起來，你就很容易把三件不同的事混成一團： 你以為自己只是「開了另一個聊天」。 其實你是在開一條新的工作線。 你以為自己只是「換個地方看」。 其實你是在把同一條 thread 從前景移到背景，或從背景移回前景。 你以為 worktree 是另一個 repo。 其實它是同一個 Git repo 的另一份 checkout，而且共享同一份 .git metadata。
--------------------------------------------------------------------------------
二、先用畫面理解
先不要想成你在用一個 app。 先想成你有一張主桌，旁邊還有幾張副桌。
主桌是你平常工作的地方。 你的 IDE 在這裡。 你平常跑的 dev server 在這裡。 你最熟悉的專案路徑也在這裡。 這張桌子，在 Codex App 裡叫 Local。官方甚至直接說：Local 是 foreground，Worktree 是 background。
副桌是隔離開來的工作台。 你可以在那裡平行試另一條線，不打擾主桌。 你可以讓 Codex 在那裡改檔、跑命令、做背景工作。 這張副桌，在 Codex App 裡叫 Worktree，它底下用的是 Git worktree。Git 官方定義也很直接：同一個 Git repository 可以掛多個 working trees，因此你能同時在多個 branch 上工作。
而 thread，不是桌子。 thread 比較像桌上的那份案件夾。 它裡面裝的是這條工作的來龍去脈：你的 prompt、Codex 的輸出、工具呼叫、後續追問。OpenAI 官方寫得很清楚：thread 是 single session，你的 prompt 加上後面模型輸出與 tool calls；而且一條 thread 可以包含多個 prompts，也可以之後再接著續。
Handoff 則像是把同一份案件夾，連同目前做到一半的工作，從副桌搬回主桌，或從主桌搬去副桌。官方文件的原意很明確：Handoff 會把 thread 在 Local 和 Worktree 之間移動，並由 Codex 處理底下需要的 Git 操作；而且同一條 thread 之後再搬回 worktree 時，會回到它原本那個關聯 worktree。
把這張圖直接記住：
你的專案 → Local：前景主桌 → Worktree A：背景副桌，跑 slot UI 修正 → Worktree B：背景副桌，查 Calendar 同步 → Thread：每一條工作的案件夾 → Handoff：把案件夾在主桌和副桌之間安全搬動
錨點句：thread 是工作線，Local 是前景，Worktree 是背景，Handoff 是轉場。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這章的字，翻成人腦真的能用的版本。
Thread。 白話講，就是一條工作線。 官方文件說，thread 是 single session，你的 prompt 加上後續模型輸出與 tool calls；它可以有多個 prompts，可以同時跑多條，但要避免兩條 thread 同時修改同一批檔案。 口語定義：圍繞同一個問題持續工作的那條線。
Session。 白話講，官方語彙裡它和 thread 高度重疊。Prompting 頁把 thread 直接叫做 single session；Best practices 又說 sessions 不是聊天紀錄，而是 working threads，會累積 context、decisions 和 actions。CLI 文件則把你當下打開的互動工作流叫 session，而且可以 resume 回來，保留 transcript、plan history 和 approvals。 所以照官方語彙來看，我建議你把它這樣記：thread 比較像被保存的工作線；session 比較像你現在打開或恢復中的那次工作會話。 這是依官方文件做的實務拆法，不是兩套完全不同的東西。
Worktree。 白話講，就是同一個 repo 的第二份 checkout。 OpenAI 文件說得很明白：每個 worktree 都有 repo 裡每個檔案的自己的副本，但共享同一份 .git metadata；Git 官方也同樣定義了這件事。 口語定義：同一個 Git repo 的另一張工作桌，不是另一個 repo。
Local checkout，簡稱 Local。 白話講，就是你本來打開、平常就在用的那份專案。 OpenAI 工作樹文件直接把它定義成「你建立的 repository」，也就是你日常那份本地 checkout。 口語定義：我平常就在用的主現場。
Local mode / Worktree mode。 白話講，是同一條 thread 開工時，你要讓它站在哪一種本地工作位。 官方 App features 頁明寫：Local 直接在目前 project directory 工作；Worktree 則是在 Git worktree 裡隔離變更；兩者都跑在你的電腦上。 口語定義：一個在主桌做，一個在副桌做。
Handoff。 白話講，就是把 thread 從 Local 搬到 Worktree，或從 Worktree 搬回 Local。 官方說 Handoff 不是單純視窗切換，而是 Codex 代你處理底下的 Git 操作，安全地把工作在兩個 checkouts 之間轉移。 口語定義：讓同一條工作線換工作位，不換工作本身。
Detached HEAD。 這個字先講白話。 它的意思不是專案壞掉。 Git 官方說，正常時 HEAD 會指向某個 branch；在 detached HEAD 狀態下，HEAD 直接指向某個 commit，而不是某條 branch。OpenAI 工作樹文件則明寫：當你建立 worktree thread 時，Codex 預設會在 detached HEAD 下工作，這樣可以建立多個 worktrees，而不把你的 branches 弄髒。 口語定義：先在臨時實驗位做事，不急著宣告這就是正式 branch。
這裡再補一個很有用的進階白話。
Codex-managed worktree。 白話講，是 Codex 幫你管的輕量背景桌，通常一條 thread 一張桌，用完可以丟。 Permanent worktree。 白話講，是你自己明確養成長期工作位的副桌，它不會自動刪掉，也能從同一個 permanent worktree 再開多條 thread。 這兩者官方今天都有正式寫進文件。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
假設你今天同時有兩個問題。
第一個問題是： slot 選取邏輯改了，selected 樣式和實際資料不同步。
第二個問題是： API route 寫了，但 Google Calendar 沒建立事件。
這兩個問題，都在同一個 repo。 但它們不一定該住在同一條 thread。
官方 Best practices 很值得你直接記住一句：一條 thread 只放一個 coherent unit of work；如果還是同一個問題，留在同一條 thread 往往比較好；只有當工作真的分岔，才 fork。 這句話對你的預約系統非常重要。因為 slot UI 和 Calendar 同步雖然都屬於 booking 系統，但它們的驗證方式、檔案範圍、風險面完全不同。
所以一個很合理的地圖會是這樣：
slot UI 那條線，開一條 thread。 Google Calendar 同步那條線，再開另一條 thread。 不要讓兩條 thread 同時碰同一批檔案，特別是像 route.ts、共用的 booking service、或共享狀態的 UI hooks。因為官方明確提醒：你可以同時跑多條 thread，但要避免兩條 thread 同時修改同一組檔案。
接著你要決定，哪條住在 Local，哪條住在 Worktree。
如果 slot UI 這條線，只是要改 BookingGrid.tsx、slotRules.ts、一些前端狀態邏輯，而且你想讓它在背景跑，不要打擾你主桌正在看的東西，那它很適合先住在 Worktree。 因為 Worktree 的設計目的，本來就是讓你在同一個專案裡平行做獨立任務，而且變更跟主桌隔開。官方文件甚至直接把 Local 說成 foreground、Worktree 說成 background。
但 Google Calendar 同步這條線，情況常常不同。 因為它可能依賴 .env.local、OAuth token、service account 憑證、本地正在跑的開發伺服器，甚至你平常 IDE 裡那一套手動驗證流程。 這時你就要小心：官方 Troubleshooting 明寫，worktrees 是在不同目錄建立，而且只會繼承那些已經 checked into Git 的檔案；如果你的 dependencies 或 tooling 需要額外設定，可能要透過 local environment setup scripts 處理，不然就改在你平常的 local project 驗證。再加上 Handoff 使用 Git 操作，所以 .gitignore 裡的檔案不會跟著 thread 一起移動。 翻成人話就是：跟 secrets、token、未納入 Git 的本地配置高度耦合的問題，常常更適合回到 Local。
這也正好解釋一個你很可能遇過的現象：
Codex 在 worktree 裡把 Google Calendar 同步邏輯看起來修好了， 可是一到你主桌那份專案，還是沒建立事件。
這時候你不要立刻說「Codex 不準」。 先問自己：
這個問題是不是本來就依賴 .env.local 或本地已登入狀態？ 那份 worktree 是不是只有 checked-in files，沒有我的本地秘密與忽略檔？ 我是不是其實該 Handoff 回 Local，再用我平常那個 dev server 和驗證流程測？
再看另一個很實際的場景。
你讓 Codex 在 worktree 裡修好 slot UI，畫面也差不多了。 現在你想用你熟悉的 IDE 窗口打開、跑現成的開發伺服器、自己手動點幾次 booking 流程。 這就是 Handoff 到 Local 最典型的時機。官方文件直接說，這條路特別適合你想在平常 IDE 裡看變更、想在日常環境驗證，或你的 app 只能同時跑一份時。
還有一個細節一定要記。
如果你在 worktree 上把它變成某條 branch，例如 feature/slot-rules-sync，然後又想在本地 Local 同時 checkout 同一條 branch，Git 會拒絕。OpenAI 文件不只寫了這個限制，還解釋了原因：Git 不允許同一條 branch 同時被多個 worktrees checkout，因為 branch 是單一可變 ref，讓兩個工作位同時推動它，會造成 race conditions、lost commits 和混亂的 conflict handling。官方建議很明確：要把那條工作帶回主桌，就用 Handoff，不要硬在兩邊同時 checkout 同一 branch。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這些字，重新放回你每天真的會走的 Codex 工作流。
先講 thread 和 session 的管理。
官方 Best practices 說得很到位：sessions 不是聊天紀錄，而是會累積 context、decisions、actions 的 working threads；如果還是同一個問題，盡量留在同一條 thread，因為那樣 reasoning trail 會完整。真的分岔時，再 fork。CLI 也提供相應的 session controls：codex resume 可以重開舊對話，保留原本 transcript、plan history、approvals；/fork 可以保留原轉錄內容，另開一條新 thread；/compact 則在 thread 很長時做摘要壓縮。
這對你的預約系統，意思非常具體。
如果你還在修同一個 slot UI 問題，只是第二輪補測試、第三輪調 selected 與 disabled 的互動，那就繼續留在同一條 thread。 如果你已經從「修 slot state」分岔成「重做整個 booking 資料模型」，那才是值得 fork 的時機。 不要因為每次多一個想法，就把 thread 開到滿天飛。 也不要因為懶得分類，就把完全不同的問題塞進同一條 thread 裡。
再講 Local / Worktree 的選擇。
官方 App features 明確寫到：每條 thread 開始時，你可以選 Local、Worktree 或 Cloud；其中 Local 是直接在你現在的 project directory 做，Worktree 是在 Git worktree 裡隔離變更，而且兩者都跑在你的電腦上。 所以你要把這兩個模式理解成：不是功能等級不同，而是工作位置不同。 Local 比較像前景位，Worktree 比較像背景位。
【版本敏感】再補一個很實際的 OpenAI 官方細節。 Automations 在 Git repositories 裡，預設就跑在 dedicated background worktrees；這代表 worktree 不只是你手動開的隔離桌，也是 Codex 背景自動工作的重要基礎。這也正是為什麼你之後學 automations 時，會一直回到 worktree 這個概念。
接著講 worktree 的實際生命週期。
官方 worktrees 文件說，當你建立 worktree thread 時，先選 Worktree，再選 starting branch，送出 prompt 後，Codex 會依你選的 branch 建立 Git worktree；如果你選的是帶有本地未提交變更的 branch，那些 uncommitted changes 也會套到 worktree；而且預設不直接 checkout 成 branch，而是以 detached HEAD 開始。 這套設計的用意非常清楚：先給你一個乾淨、隔離、可丟棄的實驗工作位，不急著污染正式分支。若你決定這條背景線要正式長成一條 branch，再按 Create branch here。
如果你選擇一直留在 worktree 做，那官方文件也寫得很直接：你可以在那裡直接 commit、push、開 pull request，也可以用 Open 按鈕把 IDE 打到那個 worktree 目錄。 也就是說，Worktree 不是「只能遠遠看著 Codex 跑」；它可以是完整可操作的工作位。
反過來，如果你要把它帶回主桌，就用 Handoff。 而且 Handoff 不是一次性搬家。官方說每條 thread 會長期保留它關聯的那個 worktree；如果你之後再把 thread hand off 回去，Codex 會把你送回同一個背景環境。 這件事非常重要，因為它讓你對背景工作位有連續感。你不是每次都掉進一個陌生臨時資料夾，而是回到同一張副桌。
【版本敏感】還有一個你很值得知道的現實。 OpenAI 官方 Troubleshooting 頁明寫：Codex App 和 Codex CLI 使用同一個 underlying agent 和 configuration，但它們在任何時刻可能依賴不同版本的 agent，而且某些 experimental features 可能會先落到 CLI。 所以如果你發現同一個 repo、同一套思路，在 CLI 做得到、App 一時沒有，不要先判斷自己地圖錯了；有時候只是版本落點不同。
最後，再給你一個很實用的小動作。 如果你在 App 裡一開始選錯了 target，例如本來應該開 Worktree，卻誤開成 Local 或 Cloud，官方說你可以取消目前 run，再用 composer 的上箭頭把剛剛那段 prompt 找回來。 這個小技巧很不起眼，但它其實在教你一件事：target 是工作位，不是命運。選錯了，修正工作位；不要重寫整件事。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
thread 只是聊天紀錄。
不是。 官方文件說 thread 是 single session，裡面有 prompt、outputs、tool calls；Best practices 更直接說 sessions 是會累積 context、decisions、actions 的 working threads。 所以 thread 的本質不是「聊天曾經說過什麼」，而是「這條工作線目前走到哪裡了」。
第二個誤解是：
session 和 thread 是兩套完全不同的東西。
也不是。 照官方語彙，它們高度重疊。Prompting 頁直接說 thread is a single session；CLI 則把你打開、關閉、resume 的互動工作流叫 session；Best practices 又把 sessions 稱為 working threads。 比較實用的理解是：thread 是被保存的工作線，session 是你當下打開它工作的那次會話。 這是實務拆法，不是兩個彼此無關的宇宙。
第三個誤解是：
worktree 是另一個 repo，或者等同於一條 branch。
都不是。 Git 和 OpenAI 官方都說 worktree 是同一個 repository 的另一份 checkout，檔案有自己的副本，但共享同一份 .git metadata。branch 只是版本指標；worktree 是工作位。 所以你不能把「開了一條 branch」和「開了一個 worktree」當成同一件事。
第四個誤解是：
Handoff 就是單純搬檔案，所以我的本地秘密、忽略檔、執行環境也會一起過去。
不是。 官方寫得很清楚：Handoff 底下用的是 Git 操作，所以 .gitignore 裡的檔案不會跟著 thread 走；Troubleshooting 也明寫，worktree 只會繼承已經 checked into Git 的檔案，需要額外 tooling 或依賴時，可能要跑 local environment setup scripts，或直接回到 regular local project。 所以 Handoff 是工作位轉移，不是把你整台本機狀態打包搬家。
--------------------------------------------------------------------------------
七、能力邊界
這一章談能力邊界，最重要的不是「Codex 會不會開 thread」。 而是誰來決定這條工作線該住在哪裡、該不該分岔、什麼時候該搬家。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是替你在同一個 repo 開一條新的 thread、在 worktree 裡先做背景修改、幫你把同一條 thread 接著做下去、在 CLI 透過 resume 把前一次工作接回來、在 App 裡把 background thread 繼續跑。這些事的共通點是：它們在整理工作位，不是在替你拍板架構。官方文件也明說 thread 可以被 resume、fork、compact，worktree 可被 Codex 管理和重回原位。
第二層：Codex 可以協助，但人必須主導決策的事。 像是這個預約系統 bug 到底還算不算同一個 thread、slot UI 問題要不要 fork 成獨立工作線、Google Calendar 問題該留在 Local 還是搬去 Worktree、什麼時候該按 Create branch here、是否需要 permanent worktree。這些都不是機械操作，而是你在管理任務邊界與驗證環境。官方建議是一條 thread 保持一個 coherent unit of work，但怎麼切，還是你的責任。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是讓兩條 thread 同時去改同一組核心檔案、默認 worktree 一定看得到你的 .env.local 與 token、在 detached HEAD 的背景實驗位上直接當成正式分支策略、或不經你確認就把一條背景 worktree 線直接當成可 merge 的主線方案。官方已經明確提醒不要讓多條 thread 同時碰同一批檔案，也明確寫出 .gitignore 檔案不會隨 Handoff 移動，worktree 也只會繼承 checked-in files。這些限制不是小細節，而是責任邊界。
所以這章的能力邊界，濃縮成一句話就是：
Codex 可以替你管理工作位，但不能替你決定工作邊界。
--------------------------------------------------------------------------------
八、一句帶走
Thread 是工作線，Session 是你打開那條線的當下，Local 是前景主桌，Worktree 是背景副桌，Handoff 是安全轉場。
--------------------------------------------------------------------------------
本章記憶點
第一句：thread 不是聊天紀錄，而是一條會累積上下文、決策與行動的工作線。 第二句：Local 和 Worktree 不是高低等級，而是前景與背景兩種本地工作位。 第三句：Handoff 不是提交，也不是同步；它是把同一條工作線在兩個 checkouts 之間安全移動。
本章最小實戰動作
拿你現在手上的預約系統問題，直接填四格： 這還是同一條 thread 嗎，還是該 fork？ 它該住 Local 還是 Worktree？ 如果我要驗證它，需不需要 Handoff 回 Local？ 它有沒有依賴 .env.local、token、或其他不在 Git 裡的東西？ 只要這四格填完，你對這次工作的空間感就會立刻清楚很多。
本章一句帶走
不要只問「我要不要開新聊天」；要問「這條工作線該住在哪裡，什麼時候該搬家」。

第 12 章
Review、Diff、Inline Comments、Commit、Push、PR：Codex 內建 Git 工作流怎麼看
一、這章只講一件事
這章只講一句核心：
Codex App 的內建 Git 工作流，不是在替你把 Git 變不見；而是在把「先看清差異、再決定留下什麼、最後才送出去」這條路，做成一個可視化的收斂流程。
【版本敏感】截至今天，OpenAI 官方文件把這條流程寫得很清楚：Codex App 有 built-in Git tools；diff pane 會顯示 local project 或 worktree checkout 的 Git diff；你可以在裡面加 inline comments，對特定 chunks 或整個檔案做 stage 或 revert，之後直接 commit、push、create pull requests。官方同時也明講，若是更進階的 Git 任務，應該回 integrated terminal。這代表 App 不是 Git 的替代品，而是 Git 的前段收斂台。
所以這一章的真正目的，不是教你多記幾個按鈕。 而是讓你腦中長出一張圖：
我先 review diff。 我再決定哪些變更值得進 commit。 我再決定要不要 push。 我再決定要不要開 PR。
這裡最關鍵的一句，還是那句老話：
AI 負責產生變更。Git 負責記錄變更。GitHub 負責同步變更。我負責決定變更。
--------------------------------------------------------------------------------
二、先用畫面理解
先把 Codex App 的 Git 工作流想成一張分揀桌。
Codex 把它做出的東西，全放到桌面上。 你先看每一份差異。 覺得對的，放進待出貨區。 覺得不對的，退回去。 覺得方向對但細節不夠準的，就在那一行旁邊貼一張便條，告訴它怎麼修。 等到你真的認可了一批內容，才把它封成一箱，也就是 commit。 然後你才把箱子寄到遠端，也就是 push。 接著你才提出「這箱要不要進總倉主線」的申請，也就是 PR。
這裡有一個非常重要的層次感。
Review pane 是本地收斂台。 GitHub PR 是遠端協作台。
GitHub 官方把 pull request 定義成 propose、review、merge code changes 的協作中心；PR 頁面裡還有 Conversation、Commits、Checks、Files changed 這些不同視角。這表示你在 Codex App 裡看的，不是最終遠端審查世界，而是 PR 之前那個「先把本地差異整理成值得送出去的變更單位」的階段。
錨點句：Codex App 的 review，是把變更收斂乾淨；GitHub 的 PR review，是把變更放進共享世界審查。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這一章最關鍵的字，翻成人腦真的能用的版本。
Review pane。 白話講，就是 App 裡的本地審稿桌。 【版本敏感】官方文件明說，它只對 Git repository 有效；而且它反映的是整個 Git repository 的狀態，不只是 Codex 改過的內容。也就是說，它會同時顯示 Codex 的改動、你自己手改的內容，以及 repo 裡任何其他尚未提交的變更。預設它看的是 uncommitted changes，但你也可以切到 all branch changes，或只看 last turn changes；在 local 工作時，還能在 unstaged 和 staged 之間切換。
這句話非常值得你停一下。
Review pane 看的不是「Codex 做了什麼」，而是「這個 repo 現在差了什麼」。
這也是為什麼很多人會覺得「Codex 怎麼把我沒要 review 的東西也算進來」。 不是它多管閒事。 而是 Git 的差異本來就是看 repo 狀態，不是看作者身分。
Diff。 白話講，就是這次和現在基準相比，哪些地方不同。 在 Codex App 裡，diff pane 會顯示你 local project 或 worktree checkout 的 Git diff；在 review 頁裡，官方又把它拆成幾種常用視角：未提交差異、整條 branch 相對 base branch 的差異、或只看最近一輪 assistant turn 的差異。 口語定義：我這次到底動了什麼。
Inline comments。 白話講，就是直接貼在線上的精準回饋。 【版本敏感】官方文件寫得很明白：你可以在 diff 裡對特定行加 inline comment；因為 comment 直接錨在那一行，Codex 通常能比你丟一段籠統指令更精準地回應。官方還建議你留完 comment 之後，再補一句明確的 follow-up，例如「處理這些 inline comments，並保持範圍最小」。 口語定義：不是泛泛地說重寫，而是指著這一行說這裡怎麼修。
Code review results。 白話講，就是你跑 review 後，問題不只出現在聊天裡，還會直接出現在 diff 旁邊。 官方 review 頁明寫：如果你用 /review 跑 code review，comments 會直接顯示在 review pane 裡。 口語定義：review 結果直接貼回變更旁邊，不用你自己來回對照。
Stage / Unstage / Revert。 白話講，就是在送出 commit 之前，先做取捨。 官方文件說得很清楚：你可以在 review pane 裡，對整份 diff、單一檔案、或單一 hunk 做 stage、unstage、revert。stage 是接受這部分要進下一次 commit；revert 是丟掉這部分不要留；而且 Git 容許同一個檔案同時有 staged 和 unstaged 內容，所以有時你會看到同一個檔案像出現兩次，那是正常的 partially staged 狀態，不是 App 壞掉。 口語定義：不是一口吞下全部，而是先決定這次要收哪一塊。
Commit、Push、Create pull request。 白話講，這三件事在 App 裡可以連著做，但本質仍然是三層。 官方 features 頁明寫：對 local 和 worktree tasks，你可以直接在 Codex App 裡 commit、push、create pull requests。 口語定義：App 幫你把 Git / GitHub 常用動作放進同一個桌面，但沒有把層次抹平。
Integrated terminal。 白話講，就是當內建收斂台不夠時，你回到完整工具面。 官方文件說，進階 Git 任務用 integrated terminal；而且 terminal 是 scoped 到當前 project 或 worktree 的，Codex 還能讀目前 terminal output，去看 dev server 狀態或失敗 build 的輸出。 口語定義：收斂差異用 review pane，動完整 Git 刀法用 terminal。
再補一個對你很實用的字。
Draft PR。 白話講，就是「先攤出來看，但還沒正式請求放行」。 GitHub 官方明確寫到，draft pull requests 不能被 merge。 口語定義：工作可以先公開，但還不算 ready。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們整本書固定的主案例：預約／排程系統。
假設你讓 Codex 幫你修一個很常見的問題：
「slot 選取邏輯改了，但 selected 樣式和實際資料不同步。」
Codex 這一輪改了三個檔案： slotRules.ts BookingGrid.tsx route.ts
其中前兩個是你要的。 第三個只是它順手補的 debug log。 而且更麻煩的是，你自己剛剛也手動改了 calendarSync.ts，只是還沒 commit。
這時候，如果你腦中沒有 review pane 的正確模型，你就會很容易說：
「這一輪 Codex 改太多了，我不知道該 review 什麼。」
但官方文件其實已經替你點破答案了：review pane 看的不是「Codex 這輪」而已，而是「目前整個 repo 的差異」。所以你現在要做的第一件事，不是抱怨它太多，而是先切對視角。你可以先看 uncommitted changes，如果想只看這一輪 agent 的輸出，再切到 last turn changes；如果你要站在「準備開 PR」的角度看，則切到 all branch changes，看這整條 branch 相對 base branch 的差異。
接著，你就能做真正成熟的收斂：
把 slotRules.ts 的條件修正 stage 起來。 把 BookingGrid.tsx 的 selected 樣式同步 stage 起來。 把 route.ts 那些今天不該混進來的 debug log revert 掉。 至於 calendarSync.ts，如果那是你手動做、但和這次 slot 問題無關的探索，就先別一起 commit。
這就是 review pane 的真正價值。 不是看而已。 而是把「很多差異」整理成「這次 commit 到底在主張什麼」。
再看另一個更貼近真實專案的場景。
你修了 booking API，Firestore 裡也有資料了，可是 UI 還是顯示不對。 Codex 改了 API route、前端 state、還補了一些 error handling。 這時你不應該直接「Stage all」。 因為 Stage all 的意思不是「這些都對」，而只是「全部都進下一次 commit」。官方文件反而一直在暗示你應該精細取捨，因為 stage / unstage / revert 可以做到整份 diff、單檔、單 hunk。換句話說，這個工具設計本身就在鼓勵你先分辨，再收錄。
再往後一步。
你把 slot 的修正收斂成乾淨 diff 之後，做 commit。 接著你發現 Google Calendar 同步那部分還沒完全驗證。 這時候就很適合開 Draft PR，因為 GitHub 官方明講，Draft PR 不能 merge，它適合 work-in-progress 的分享與提早收回饋。 對你的預約系統來說，這非常實用： slot UI 那段已經可以讓人 review。 但 Calendar 同步還在驗證 token、權限與 env。 所以你可以先讓團隊看 UI / rule changes，不要假裝整個功能已 ready。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這整套放回 Codex 工作流。
你要把 Codex App 想成一條很清楚的本地收斂鏈：
先看 diff。 再留 inline comments。 再 stage / revert。 再 commit。 再 push。 再 create PR。
【版本敏感】這不是我自己發明的順序，而是官方文件現在真的把這些能力寫在一起：diff pane、inline comments、stage / revert、commit / push / create pull requests，都在 App 裡；而 worktree 文件也補充，如果你是在 worktree 路徑上工作，先把它 turn into a branch，接著同樣可以 commit、push、open a pull request on GitHub。
這裡有一個很重要的心智模型：
App review pane 是你和 Codex 的局部審查循環。 GitHub PR 是你和團隊的共享審查循環。
GitHub 官方對 PR 頁的說法很清楚：Conversation 看說明與討論，Commits 看這條分支的提交歷史，Checks 看自動化測試與 build 狀態，Files changed 看最終會合進去的差異；reviewer 可以給 Comment、Approve、Request changes。 所以你在 App 裡做的 review，不是 PR review 的替代，而是 PR 之前的淨化。
如果你把這張圖看清楚，你就會知道自己每天到底在哪一層：
當你還在 App 裡留 inline comments，要 Codex 修正某一行的 slot disabled 判斷時，你還在本地收斂層。 當你已經 push 並 create PR，等待 reviewer 按 Approve 或 Request changes，你就在遠端協作層。 這兩層都叫 review，但不是同一種 review。
【版本敏感】再補幾個今天官方 changelog 上很值得你知道的點。 截至 2026 年 2 月 6 日，Codex App 的 review pane 移除了整體 diff 大小上限，讓大型 review 的處理更順；2 月 26 日，inline review comments 加入了 @mentions 和 skill mentions；2 月 27 日，task rows 和 PR buttons 加入了 draft、open、merged、closed 這些 PR 狀態徽章。這些都不是 Git 骨架本身，但它們會明顯影響你每天「怎麼看 review」「怎麼看 PR 狀態」的操作體感。
【版本敏感】App 設定裡也已經把一些 Git 工作流偏好拉到台面上了。官方 settings 頁寫到，你可以統一 branch naming，決定 Codex 是否可用 force pushes，還能設 prompts 讓它產生 commit messages 與 pull request descriptions。這些設計很有意思，因為它們不是替你做決策，而是在替你把決策風格標準化。
所以放回主線，這一章最重要的一句話是：
Codex App 不是幫你跳過 Git 工作流，而是幫你把 Git 工作流前半段做得更可見、更可細切、更可審查。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
review pane 只會顯示 Codex 改的東西。
不是。 官方文件明說，它反映的是 Git repository 的狀態，不只是 Codex 編輯過的內容，所以你的手動修改、其他未提交變更，也都會一起出現在 review pane 裡。 這就是為什麼你在修 slot UI 時，自己剛剛順手加在 calendarSync.ts 的 log 也會跑進來。
第二個誤解是：
看到很多變更時，按 Stage all 比較有效率。
不一定。 官方 review 頁面明確設計了整份 diff、單檔、單 hunk 三個層級的 stage / unstage / revert。這種設計本身就在告訴你，效率不是「全部收下」，而是「收對邊界」。 對你的預約系統來說，slot 規則修正和 Calendar debug log 混在同一個 commit，往往才是後面 review 和回滾最痛的原因。
第三個誤解是：
App 裡已經有 commit、push、PR，所以這三個差不多。
不是。 官方 features 頁只是把三個動作都放進同一個 App，不代表它們變成同一件事。commit 仍然是本地版本點；push 仍然是送到遠端 branch；PR 仍然是提議合併。GitHub 官方對 PR 的定義也很清楚：它是 proposal to merge，不是 merge 本身。
第四個誤解是：
PR 開了，就等於快完成了。
不一定。 GitHub 官方把 Draft PR 明確區分出來，而且 review 狀態也分成 Comment、Approve、Request changes。這代表 PR 不是「快完成」的同義詞，而是正式進入共享審查流程。 尤其當你的 Google Calendar 同步還沒跑完線上驗證時，Draft PR 往往比「假裝 ready」更成熟。
第五個誤解是：
同一個檔案在 staged / unstaged 都看到，代表 App 重複或出 bug。
不是。 官方文件直接點出，Git 本來就允許同一個檔案同時有 staged 和 unstaged 狀態，所以 review pane 看起來像同一檔案出現兩次，是正常的 partially staged 行為。 這個誤解一旦解開，你對 Git 的細切能力會成熟很多。
--------------------------------------------------------------------------------
七、能力邊界
這一章談能力邊界，最重要的是：Codex 很適合幫你把差異做出來、讓你收斂；但不適合替你默默把每一步都放行。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是先產出一版 diff、跑 /review 把意見貼回 inline comments、根據你的 line-level feedback 修某個 slotRules.ts 條件、草擬 commit message、草擬 PR description、把已明確同意的 UI 修正整理成可 stage 的 hunks。這些事都很適合讓 Codex 主做，因為你可以直接在 review pane 裡看得到、退得回、切得細。
第二層：Codex 可以協助，但人必須主導決策的事。 像是這次到底該切幾個 commit、slot UI 修正和 booking API 調整要不要放同一個 PR、現在該開 Draft PR 還是 Ready for review、哪些 hunk 應該 revert 而不是再修、這批 branch changes 是否已經足夠代表本次需求。這些不是「看得到 diff」就能自動拍板的事，因為它們本質上是在定義歷史邊界與交付邊界。GitHub 官方把 review、approve、request changes 做成明確狀態，也是在提醒你：review 是決策，不只是瀏覽。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是替你直接 force push 公共分支、直接把未完全驗證的預約系統變更開成 Ready PR 並催進 merge、在你還沒看懂差異邊界前就 Stage all 再 push、或把涉及 production secrets、真實資料庫操作、部署放行的內容，混進「順便一起 commit」。 【版本敏感】官方 settings 頁確實提供 force pushes 選項，但「能不能」和「該不該」不是同一件事。這裡仍然是你負責。
所以這一章的能力邊界，濃縮成一句話就是：
Codex 可以幫你加速 review 與收斂，但 commit 邊界、PR 邊界、放行責任，最後都在你手上。
--------------------------------------------------------------------------------
八、一句帶走
Codex App 內建 Git 工作流的真正價值，不是替你按完所有按鈕，而是讓你先看清差異、再做取捨、最後才送出去。
--------------------------------------------------------------------------------
本章記憶點
第一句：review pane 看的是整個 repo 的差異，不只是 Codex 這一輪改了什麼。 第二句：inline comments 是貼在線上的精準回饋，stage / revert 是在 commit 前做真正的取捨。 第三句：App review 是本地收斂，GitHub PR review 是遠端協作；兩者都叫 review，但不是同一層。
本章最小實戰動作
打開你預約系統目前那條正在做的 thread，進 review pane，只做一個動作：不要 Stage all。 先把視角切到 Last turn changes，再只 stage 一個你百分之百確定的 hunk，並對另一個不夠準的 hunk 留一則 inline comment，要求 Codex 只修那一小塊。 這個練習的目的，是讓你親手感覺到：review 不是看過，而是切過、留過、選過。
本章一句帶走
先把 diff 收斂乾淨，再去 commit、push、PR；不要把「看見變更」誤當成「已經準備好交付」。

第 13 章
Approval、Sandbox、Network、Full Access：Codex 的能力從哪裡來，邊界又卡在哪裡
一、這章只講一件事
這章只講一句核心：
Codex 能做多少事，不是只看模型有多強，而是看你給了它什麼邊界。
OpenAI 官方把這件事拆成兩層：sandbox mode 決定它技術上碰得到什麼，像是能寫哪裡、能不能出網；approval policy 決定它什麼時候必須停下來先問你。預設情況下，本地 Codex 會在作業系統強制的 sandbox 裡工作，而且網路預設是關的。這表示「它為什麼停下來」和「它為什麼做不到」，本來就可能是兩個不同原因。
所以這一章真正要你建立的，不是勇敢不勇敢，而是判斷力：Approval 是問不問你，Sandbox 是做不做得到，Network 是能不能碰外界，Full Access 是把圍欄拆掉，不是把責任外包。
--------------------------------------------------------------------------------
二、先用畫面理解
先把 Codex 想成一個在工地裡工作的代理。
Sandbox 像工地圍欄。 圍欄決定它可以在哪些地方走動、能不能碰倉庫、能不能走出工地上街。 Approval 像門口警衛。 警衛決定它是不是要先來找你簽名，才能跨出那道界線。 Network 像通往外界的門。 門開著，它可以出去抓資料、叫依賴、碰外部 API。門關著，它就只能在場內做事。 Full Access 則像你把圍欄拆掉，還告訴警衛不用再攔。它不是讓代理突然變聰明，而是讓代理能碰到更多東西，也更容易碰錯東西。
再補一張 cloud 的畫面。
Codex Cloud 不是在你電腦工地裡，而是在 OpenAI 管理的隔離容器裡。官方文件說它是兩階段：setup phase 可以上網安裝依賴，agent phase 預設離線；而且配置在 cloud environment 裡的 secrets 只在 setup 階段可用，進入 agent phase 之前就會被移除。這代表 cloud 不是「永遠什麼都能做」，而是一個有更明確切段的遠端工地。
錨點句：Approval 管的是要不要先問你，Sandbox 管的是它碰不碰得到。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這章最重要的幾個字，翻成人腦真的能用的版本。
核准策略，Approval policy。 白話講，就是 Codex 什麼時候要先停下來問你。官方目前常見的值有三個：【版本敏感】untrusted 是遇到不在 trusted set 的命令就問；on-request 是先在 sandbox 內自主工作，碰到要越界的動作再問；never 是不跳出 approval prompts。更細一點時，還可以用 granular approval policy，把某些類別自動拒絕或單獨保留人工審核。
沙盒模式，Sandbox mode。 白話講，就是技術圍欄本身有多大。【版本敏感】官方現在常見三種：read-only 只能看，不能改檔、不能跑命令而不先核准；workspace-write 可以在工作區內讀、改、跑一般本地命令，這是本地低摩擦工作的預設主力；danger-full-access 則是不設 sandbox 邊界，直接拿掉檔案系統與網路限制。
完整存取，Full Access。 白話講，不是一個比較帥的開關，而是一組高風險組合。官方把它講得很明白：full access 的實質，是 sandbox_mode = "danger-full-access" 加上 approval_policy = "never"。相對地，很多人常聽到的 --full-auto 並不是 full access，它只是較低風險的本地自動化預設，也就是 workspace-write 加 on-request。
網路存取，Network access。 白話講，就是殼層命令、測試程式、套件管理器、API 呼叫能不能真的出去碰外部世界。官方文件寫得很清楚：在本地的 workspace-write 模式下，網路預設是關的，除非你在設定裡另外打開。這也是為什麼「它能改檔」不等於「它能 npm install、curl、打外部 API」。
Web search。 白話講，這是另一條管道，不等於把 shell 命令的網路一起打開。官方明說，你可以控制 web search tool，而不必同時賦予 spawned commands 完整網路；而且本地任務的 web search 預設是 cached，也就是走 OpenAI 維護的快取索引，不是每次都 live 抓最新頁面。若你使用 --yolo 或其他 full access 類設定，web search 才會預設改成 live。
保護路徑，Protected paths。 這個字非常關鍵。 很多人以為 workspace-write 代表整個 repo 都能寫。不是。官方文件明寫，在預設 workspace-write 裡，.git、.agents、.codex 這些路徑仍然是唯讀保護的，保護還是遞迴的。所以像 git commit 這類會碰 .git 的動作，可能仍需要 approval，這不是 Codex 卡住，而是保護設計本來就如此。
不同表面的權限名稱。 這裡最容易混。 【版本敏感】在 App 和 IDE，你會看到 permissions selector；官方說它可以讓你在 default permissions、full access、custom config 之間切換。IDE 這邊又把互動模式分成 Chat、Agent、Agent (Full Access)：Chat 偏規劃與討論，Agent 可在工作目錄內自動讀、改、跑，但出工作目錄或要用網路時仍需你同意；Agent (Full Access) 則允許它不經核准就讀、改、跑，包含網路。CLI 則是用 /permissions 或旗標來切，例如 --sandbox、--ask-for-approval、--full-auto、--yolo。名字不同，骨架相同。
設定從哪裡來。 白話講，就是你的邊界不是只有眼前那個下拉選單決定。官方說 CLI flags 與 --config 覆寫優先級最高，其次是 profile，再來是專案內 .codex/config.toml、使用者層 ~/.codex/config.toml、系統層與內建預設；而且專案層設定只有在你信任這個專案時才會載入。再往上一層，受管機器還能透過 requirements.toml 直接禁止 approval_policy = "never" 或 sandbox_mode = "danger-full-access"。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
先看一個低風險場景。 你只是要修 BookingGrid.tsx 的 selected 樣式，或把 slotRules.ts 的 disabled / selected 條件對齊。這類工作多半只碰目前工作區裡的檔案，不需要出網，也不需要碰 repo 以外的地方。這時候，workspace-write 搭 on-request 通常就很夠了。它讓 Codex 能自己讀檔、改檔、跑一般本地命令，但還保留越界時停下來問你的機制。
再看一個很多人會誤判的場景。 你已經把 route.ts 修好了，本地看起來 booking API 也正常，可是 Google Calendar 還是沒建立事件。這時不要只盯著 createCalendarEvent()。從權限邊界的角度看，問題可能是：本地 shell 的網路根本沒開；IDE / CLI 還在 workspace-write 且 network_access = false；web search 雖然可用，但那不代表 curl 或你的同步程式真的能出去；如果你是在 cloud 跑，agent phase 又預設離線，而且 cloud internet access 是按 environment 單獨設定的，還可以被 domain allowlist 與 allowed HTTP methods 限住。也就是說，API 看起來修好了，不代表它真的拿得到外部資源。
再往深一點。 如果你期待 cloud task 直接拿著敏感 token 去呼叫 Google Calendar，也要小心核對環境設計。官方明寫，cloud environment 裡配置的 secrets 只在 setup 階段可用，進 agent phase 前會被移除；而 agent phase 又預設不開外網。這種時候，問題未必是程式碼邏輯，而是你把「建構環境」「執行代理」「呼叫外部服務」三件事想成同一層了。
再看一個更貼近日常的場景。 你想同時改前端 UI 與另一個目錄裡的共用 package，甚至跨到第二個 repo。這時官方比較推薦的方向，不是先開 full access，而是優先用 separate projects、worktrees，或在 CLI 透過 --add-dir / writable roots 擴充可寫邊界。也就是說，你可以擴大工作區，不必一開始就拆掉整個圍欄。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
如果你問「Codex 的能力到底從哪裡來」，我會把它濃縮成四個旋鈕：
第一個旋鈕，是你在哪個表面。 App、CLI、IDE、Cloud 的權限表現不完全一樣。IDE 目前把模式直接分成 Chat、Agent、Agent (Full Access)；CLI 用 /permissions 或旗標切；Cloud 則用 environment 控網路。這代表你不是只在選介面，你是在選治理方式。
第二個旋鈕，是sandbox mode。 它回答的是「技術上碰不碰得到」。你可以讓 Codex 只看、不改；也可以讓它在 workspace 內自由做日常工作；也可以直接拆掉圍欄。但官方反覆提醒，danger-full-access 與 Windows 上的 full access 都有資料遺失風險，應謹慎使用。
第三個旋鈕，是approval policy。 它回答的是「碰到越界時要不要先問你」。在 App 裡，你會看到像「approve once」或「approve for this session」這類不同授權範圍的提示；官方也明說，如果不確定，先批最窄的那個。這是很成熟的默認。
第四個旋鈕，是config 與組織政策。 CLI 與 IDE 共用同一套 configuration layers；專案設定只有在 trusted project 才會生效；受管機器還能直接禁止 never 或 danger-full-access。換句話說，你以為自己是在「個人喜好」裡切權限，實際上常常還在團隊治理框架裡。
把這四個旋鈕放進你每天的工作流，順序就會變得很清楚。 先判斷任務風險。 再選表面。 再選 sandbox。 再選 approval。 最後才決定要不要開網路、要不要 live web search、要不要 full access。 這個順序很重要，因為它逼你先想工作邊界，而不是先想工具能不能強推過去。
如果你是 Windows 使用者，還要再多一層現實感。 【版本敏感】官方目前建議在 Windows 原生模式下優先用 elevated sandbox，unelevated 只是後備；而 native Windows agent mode 會用 Windows sandbox 去限制工作資料夾外的寫入與未經核准的出網。這代表在 Windows 上，sandbox 不是抽象觀念，而是真正的作業系統機制。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
Full Access 比較厲害，所以也比較接近正確。
不是。 Full Access 只是把 filesystem 與 network 邊界拿掉，讓 Codex 不再因為這些限制停下來；它沒有替你補上判斷力。官方不只在 sandbox 文件裡說它應該謹慎使用，也在 Windows 文件裡直接警告 full access 可能造成 unintentional destructive actions 與 data loss。
第二個誤解是：
approval_policy = "never" 就等於 Full Access。
不是。 如果你只是把 approval 改成 never，但 sandbox 還是 workspace-write，Codex 仍然會被技術邊界卡住。官方講得非常直接：full access 是 danger-full-access 加 never；而 --full-auto 則只是 workspace-write 加 on-request。這三者不能混。
第三個誤解是：
把 web search 開成 live，就等於 shell 命令也能上網。
不是。 官方文件特別把這兩件事拆開：你可以控制 web search tool，而不給 spawned commands 完整網路；本地 workspace-write 的網路預設仍是關的。也就是說，能搜尋文件，不代表你的同步腳本能打外部 API。
第四個誤解是：
workspace-write 代表 repo 內什麼都能寫，包括 .git。
不是。 .git、.agents、.codex 這些在預設 writable roots 內仍然是 protected paths。這就是為什麼你明明讓 Codex 在工作區內自動改檔了，但一碰到 git commit、某些寫 .git metadata 的動作，它還是可能停下來問你。
第五個誤解是：
Approval 只是在管 shell 指令。
也不是。 官方明寫，帶 side effects 的 app / connector / MCP tool calls 一樣可能觸發 approval；如果工具自己宣告 destructive annotation，甚至會強制要求 approval。也就是說，這不是「終端機安全」而已，而是整體 agent action 的治理。
--------------------------------------------------------------------------------
七、能力邊界
如果把官方這套控制模型翻成你在真實專案裡能用的決策，我會把它分成三層。這是我根據官方對 sandbox、approval、network、full access 的設計，做出的實務分層。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是改 BookingGrid.tsx 的 UI、整理 slot 呈現邏輯、補測試、補文件、小範圍重構、在 feature branch 上收斂乾淨 diff、草擬 commit message。這些工作大多能在 workspace-write 加 on-request 內完成，回頭檢查成本低，錯了也容易 rollback。
第二層：Codex 可以協助，但人必須主導決策的事。 像是改 API 契約、調整 booking / appointment 流程、決定 Google Calendar 同步要不要允許部分成功、要不要開網路、是否切到 live web search、跨目錄 writable roots 要怎麼放、何時 push、何時開 PR、PR 要不要從 Draft 轉 Ready。這些事情 Codex 能幫你做分析、草案與實作，但最後責任點在你，因為你在定義的是風險和流程，不只是程式碼。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、真實資料庫寫入與 migration、權限設定、force push 公共分支、繞過保護規則、正式發版、法規與資安判斷、商業取捨。理由不是「Codex 一定會出錯」，而是官方這整套設計本來就在告訴你：越接近 secrets、network、external effects、destructive actions，人就越該在場。Full access 只代表機器能動，不代表你應該讓它自己決定。
所以這一章真正要你建立的習慣是： 當你想把某件事交給 Codex 前，不要先問「它做不做得到？」 先問：這件事如果做錯，代價是可逆還是不可逆？是本地還是外部？是檔案差異，還是權限與真實資源？ 只要這三句先問完，你大多就知道該用 workspace-write、該讓它停下來問、還是根本不該交出去。
--------------------------------------------------------------------------------
八、一句帶走
Approval 決定它什麼時候先問你，Sandbox 決定它能碰到哪裡；Network 讓它碰外界，Full Access 只是把圍欄拆掉，不會替你承擔後果。
--------------------------------------------------------------------------------
本章記憶點
第一句：Approval 是問不問你，Sandbox 是做不做得到。 第二句：--full-auto 不是 Full Access；Full Access 的本質是 danger-full-access 加 never。 第三句：Web search、shell network、cloud internet access 是三件相關但不同的事。
本章最小實戰動作
拿你的預約系統下一個任務，先不要急著做。只寫四行： 這次要不要出網？ 這次只碰工作區，還是會碰到 repo 外？ 這次如果做錯，可不可以直接回滾？ 我應該用 Chat、Agent、Agent (Full Access)，還是 CLI 的 workspace-write / on-request？ 你只要把這四行寫完，這次任務該不該開 full access，通常就已經很清楚了。
本章一句帶走
能做多少，不只看模型；更看你給它多大的圍欄，以及你願不願意繼續當那個最後拍板的人。

第 14 章
AGENTS.md、Skills、Subagents、Automations：怎麼讓 Codex 不只是會寫，而是越來越懂你
一、這章只講一件事
這章只講一句核心：
讓 Codex 越來越懂你，不是把聊天拉得越來越長，而是把一次性交代，沉澱成分層的規則、流程、分工與排程。
OpenAI 官方的最佳實務把這條路講得很清楚：先給對任務上下文，再用 AGENTS.md 放 durable guidance，接著把重複工作變成 skills，把真正分岔的工作交給 subagents，把已經穩定的重複流程做成 automations。換句話說，成熟的 Codex 使用方式，不是每次都重新教它，而是讓你的工作方法逐步外化成系統。
--------------------------------------------------------------------------------
二、先用畫面理解
把 Codex 想成一位越做越熟的工程夥伴。
一開始，你每次都得口頭交代。 這是 prompt。
做久了，你把固定工作方式寫成一張牆上的作業規則。 這是 AGENTS.md。
再做久一點，你發現有些工作不是「規則」而是「固定流程」，像是查 slot 顯示異常、寫 release note、做 PR 檢查清單。 這時你把它們做成一張張可重用的工作卡。 這是 skills。
再往上走，當問題本身可以拆成幾個互不干擾的小面向，你會找幾位專職助手平行去看。 這是 subagents。
最後，當一件事已經穩到不用你盯著做，例如每天掃一次最近 commit 的風險、每週草擬 release notes、每天整理 triage，你才把它排成固定班表。 這是 automations。
所以這一章你要在腦中看到的，不是四個功能，而是一條熟練度階梯：
口頭交代 → AGENTS.md：固定規則 → Skills：固定流程 → Subagents：固定分工 → Automations：固定排程
你可以把這一章的系統圖直接記成一句口訣：
同樣錯兩次，更新 AGENTS.md。 同樣 prompt 重複用，做成 Skill。 同一個大問題可平行拆，才用 Subagents。 同一條流程手動已穩，再排 Automation。 這正符合 OpenAI 官方最佳實務：同樣錯誤反覆出現，就更新 AGENTS.md；同樣 workflow 一再重複，就升級成 skill；subagents 用來把有界、可平行的工作從主線移出去；automations 則應該建立在手動已可靠的流程上。
錨點句：越來越懂你，不靠更長對話，靠更穩的外化。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這一章最重要的四個名詞，翻成人腦真的能用的版本。
AGENTS.md。 白話講，它不是補充說明文件，而是 Codex 開工前會自動讀進來的工作規則。官方文件明寫，Codex 在做任何工作前會先讀 AGENTS.md，而且它會在啟動時建立 instruction chain；通常是一個 run 一次，在 TUI 裡則通常是一個 launched session 一次。這個 instruction chain 先讀全域層級的 ~/.codex/AGENTS.md 或 AGENTS.override.md，再從專案根目錄一路走到你目前工作目錄；越靠近你目前目錄的規則，會因為排在後面而覆蓋前面的廣域規則。
所以 AGENTS.md 的口語定義是：永遠先載入的家規。 它最適合放 repo 版圖、啟動方式、build / test / lint 指令、工程慣例、PR 期望、禁止事項，以及「done 到底長什麼樣子」。OpenAI 官方甚至直接把這些列成一份好的 AGENTS.md 應該涵蓋的內容。CLI 還提供 /init 去快速產生 starter AGENTS.md，但官方也提醒，產生完一定要改成你團隊真的在用的做法。
再往下一層是 Skills。 白話講，它不是家規，而是可重用的工作流程包。官方把 skill 定義成一個目錄，裡面至少有 SKILL.md，還可以加 scripts、references、assets 與 agents/openai.yaml；skill 的本質，是把 instructions、resources 和可選腳本封成可重複使用的 workflow。更重要的是，skills 用的是 progressive disclosure：Codex 一開始只看 skill 的 metadata，例如 name、description 和檔案路徑；只有在它決定要用這個 skill 時，才把整份 SKILL.md 載進來。
所以 Skill 的口語定義是：按需載入的 SOP。 它可以顯式叫用，也可以隱式觸發。官方文件寫得很清楚：你可以在 prompt 裡直接指定 skill；在 CLI / IDE 裡也可以用 /skills 或輸入 $ 來點名 skill。另一方面，Codex 也可能根據 skill 的 description 隱式選用它，所以官方特別提醒，description 一定要把觸發邊界寫清楚。
Skill 和 AGENTS.md 的最大差別，是它不是一直都進上下文。 AGENTS.md 是開工前就上桌的規則。 Skill 是需要時才拿出的工作卡。 官方也明說，skills 是 reusable workflows 的 authoring format；如果你想把一個成熟的 skill 更廣泛分享給別的開發者安裝，應該進一步把它包成 plugin。Skills 目前可用於 CLI、IDE extension 與 Codex App。
第三個名詞是 Subagents。 白話講，它不是「多開幾個聊天」，而是讓 Codex 啟動幾個專職工作者平行處理 bounded work，再把結果回收到主線。官方現在把 subagent workflows 定義成：Codex 會平行啟動 specialized agents，等待結果，再回傳 consolidated response；它的好處是把探索、測試、triage、log analysis 這種容易讓主線變吵的工作移出去，避免 context pollution 與 context rot。
所以 Subagent 的口語定義是：平行分工，不是平行亂改。 而且官方講得很明白：Codex 不會自動生 subagents，只有在你明確要求「spawn two agents」「delegate this work in parallel」這類指令時才會做；同時，它也提醒你，subagents 比單一 agent 更花 token，並且較適合 read-heavy 的探索、測試、摘要、triage，對 write-heavy 的平行改檔要更小心，因為會增加衝突與協調成本。
這裡還要再分清一個很容易混的字：custom agent。 Subagent 是執行時跑出來的 worker。 Custom agent 則是你替某一類 worker 寫好的角色定義。官方文件現在寫得很清楚：你可以在 ~/.codex/agents/ 放個人 custom agents，在 .codex/agents/ 放專案範圍的 custom agents；每個檔案是一個 TOML，至少要有 name、description、developer_instructions，其他像 model、model_reasoning_effort、sandbox_mode、mcp_servers、skills.config 則可以繼承 parent session。OpenAI 也內建了 default、worker、explorer 這幾種 agent。
第四個名詞是 Automations。 白話講，就是把已經穩定的重複工作排成背景班表。官方現在把 automations 定義成在 Codex App 裡 schedule recurring tasks 的功能；結果如果有 findings，就進 triage inbox，沒有要回報的，就可以自動 archive。它也支援把 skill 顯式塞進 automation prompt 裡，例如直接用 $skill-name。
Automations 的口語定義是：背景值班，不是即時決策。 而且它的使用前提非常實際：它跑在 Codex App 背景裡，所以 App 必須開著，而且選定的 project 必須真的在磁碟上。對 Git repo 而言，你還可以選它跑在 main checkout，也可以跑在 dedicated background worktree；官方建議，如果你要避免影響未完成的本地工作，優先用 worktree。Automations 也沿用你的預設 sandbox 設定；若背景 automation 在 full access 下跑，官方直接提醒風險會升高。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
如果你想讓 Codex 真正「越來越懂你」，第一步不是先做 skill。 第一步應該先把這個 repo 的基本世界觀寫進 根目錄 AGENTS.md。
這份 AGENTS.md 最適合放的，不是空泛口號，而是你未來每次都不想重講的東西。 例如：
這個專案的主要區塊是前端 UI、slot 規則、booking / appointment 流程、route.ts / API、資料庫存取、Google Calendar 同步。 本地啟動要跑哪些指令。 修改前端後至少要做哪些驗證。 改 API 後要跑哪些測試。 Google Calendar 同步如果失敗，要留下可追蹤錯誤，不准靜默吞掉。 不可以碰 production secrets。 這次任務 done 的標準是什麼。
這種內容，正是官方建議放進 AGENTS.md 的範圍：repo layout、run 方法、build / test / lint、工程慣例、do-not rules、以及 what done means。
如果你的 Calendar 同步邏輯集中在某個子目錄，例如 lib/calendar/ 或 integrations/google-calendar/，你甚至可以在那個目錄再放一份更近的 AGENTS.md 或 AGENTS.override.md，讓那一區的特殊規則壓過 repo root 的大規則。官方的 AGENTS discovery 規則就是這樣運作：它從 project root 一路走到 current working directory，越靠近你目前目錄的檔案越晚被串進 prompt，因此也越能覆蓋前面的廣域指令。
接著，當你發現某些 prompt 你一直在重複講，就該把它們升級成 Skills。
例如，你很可能會反覆遇到這兩種工作：
第一種是： 「slot 規則改了，但 selected 樣式和實際資料不同步，請從 state、資料 shape、UI 渲染三層去查。」
第二種是： 「Google Calendar 沒建立事件，請按 API route、payload、token / auth、env、權限 scope、同步流程順序，逐層排查。」
這兩種工作，已經不是單純的 repo 家規，而是固定排查流程。 它們很適合分別做成類似 $slot-debug 和 $calendar-sync-triage 這種 skill，放在 .agents/skills/；如果是你個人習慣，也可以先放在 $HOME/.agents/skills。OpenAI 官方最佳實務直接說，如果你一直重複同一個 prompt 或一直糾正同一個 workflow，它就應該變成 skill；而 skills 目前也正是放在這兩個主要位置。
然後你會遇到第三種情況： 不是流程重複，而是問題本身可以平行拆。
像「API route 寫了，但 Google Calendar 沒建立事件」這件事，就很適合拆成三個 read-heavy 子問題：
一個 subagent 查 route.ts 和 payload shape。 一個 subagent 查 token、auth、env、scope。 一個 subagent 去核對文件或既有整合邏輯，確認到底是 API 行為不符預期，還是你以為的欄位其實不是這樣定義。
這種拆法，正符合官方對 subagents 的建議：把 exploration、tests、triage 這類可平行的 bounded work 分出去，讓主線保留需求、決策與最後結論。重點是，它要由你明確要求，不是等 Codex 自己亂生一堆 worker。
最後，當某條流程已經成熟到你手動做很多次都穩了，才輪到 Automations。
例如，你可以排一條每天早上跑的 automation：
「掃描預約系統最近 24 小時的變更，找出可能影響 booking、slot 顯示、Calendar 同步的風險，若有發現就送到 triage inbox。」
或者一條每週五跑的 automation：
「根據本週和 booking / appointment 有關的變更，草擬 release note。」
這些都很合理，但前提是它們已經是手動可靠的工作。官方明白建議：在你 schedule automation 之前，先在一般 thread 裡手動測 prompt，確認 prompt 清楚、模型與工具行為如預期、產出的 diff 可 review；真的開始排程後，前幾次輸出還要特別密切看。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把這四層，重新放回你每天的 Codex 工作流。
你可以把它想成一條「從短期記憶走向組織記憶」的路：
Prompt 是今天這次要做什麼。 AGENTS.md 是這個 repo 一直怎麼做。 Skill 是這類工作一向怎麼做。 Subagent 是這次拆出去平行做哪幾塊。 Automation 是哪條穩定流程該自己定時跑。
這不是文青比喻，而是官方最佳實務的核心順序：從 right task context，到 AGENTS.md durable guidance，到 skills，再到 automations。
如果你把它放進不同工作表面，畫面又會更清楚。
AGENTS.md 是一啟動就載入的規則鏈。 你改了之後，不是等它神奇熱更新；官方文件說 instruction chain 是 run 啟動時建立的，所以如果你覺得規則沒生效，做法通常是 restart Codex 或開一個新 run。
Skills 則是跨表面可用的任務工具箱。 官方文件明寫，skills 可用在 CLI、IDE extension 和 Codex App。也因此，skills 很適合承接「我不想每次都重新描述這個流程」的痛點。你在 CLI / IDE 裡還可以用 /skills 或 $ 來點名 skill。
Subagents 是分工層。 【版本敏感】官方目前說 current releases 已預設啟用 subagent workflows，activity 現在會顯示在 Codex App 和 CLI，IDE visibility is coming soon。也就是說，subagents 不是未來功能，但不同表面的可見度今天並不完全一樣。更重要的是，subagents 會繼承你目前的 sandbox policy 與 live runtime overrides，所以它們不是權限逃脫工具。
Automations 則是目前屬於 App 的背景排程層。 官方寫得很清楚：它們在 Codex App 背景跑，App 要開著，project 要在磁碟上；在 Git repo 裡，automation 還可以選跑 local project 或 dedicated background worktree。這很像你把本來的人工工作，轉成一個在 App 裡定時上班的背景 worker。
所以，如果你問：
Codex 怎麼從「會寫」變成「越來越懂」？
最好的答案不是「多聊幾輪」。 而是這四句：
規則寫進 AGENTS.md。 流程封成 Skill。 分工交給 Subagents。 穩定工作排成 Automation。
這也正是 OpenAI 官方最佳實務一直在推的方向：把 repeated friction 變成 durable guidance、把 repeated workflow 變成 skill、把 bounded parallel work 交給 subagents、把 stable workflow 變成 automation。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
AGENTS.md 就是比較長的 prompt。
不是。 Prompt 是這次任務的交代。 AGENTS.md 是 Codex 開工前自動讀入的指令鏈，而且有全域與專案層次，越靠近當前目錄的規則越能覆蓋前面的規則。這不是「多打一點字」，而是把規則放進固定的載入機制。
第二個誤解是：
Skill 和 AGENTS.md 是同一種東西。
不是。 AGENTS.md 是 always-on 的家規。 Skill 是 on-demand 的 workflow 包，而且用 progressive disclosure 控制上下文成本：先只看 metadata，決定要用時才讀完整 SKILL.md。Skill 也可以被顯式點名或由 description 隱式匹配。
第三個誤解是：
Subagents 會自己冒出來，任務大一點就自然平行。
不是。 官方文件講得非常直接：Codex 不會自動 spawn subagents，只有你明確要求平行 agent work 時才會這樣做；而且它更適合 read-heavy 的探索、測試、triage，對平行寫很多 code 要更小心。Custom agent 也不是 subagent 本身，而是你預先定義好要怎麼 spawn 的角色檔。
第四個誤解是：
Automation 就像 CI，一排好就自己穩定運轉。
不完全對。 官方目前的 automations 是在 Codex App 背景跑，所以 App 必須開著，project 要在磁碟上；它還沿用預設 sandbox，full access 背景跑的風險也更高。官方甚至明講，在 schedule 前先手動測 prompt，前幾次輸出還要密切 review。這不是「交出去就忘了」，而是「先手動跑穩，再慢慢值班化」。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，重點不是「Codex 會不會寫這些檔」，而是哪一層可以放心讓它幫你沉澱，哪一層只能讓它協助，哪一層不能讓它自己定。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是先用 /init 產生一份 AGENTS.md 初稿、幫你把經常重複的排查 prompt 變成 skill 骨架、替你建立 read-only 的 explorer / reviewer 型 custom agents、用 subagents 去平行做 codebase exploration、tests、triage、summaries，或在 App 裡排一條「只回報、不直接改主 checkout」的 automation。這些事情都有一個共通點：它們在幫你把工作方法外化，但最後仍然可 review、可修改、可停用。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 AGENTS.md 到底要寫哪些 repo 規則、什麼算 done、Skill 的 description 邊界要怎麼畫、是否要把某個 workflow 從個人 skill 升成 repo skill、這次問題到底要不要拆 subagents、要拆成幾個、automation 應該跑 local 還是 worktree、跑多頻繁、是否真的已經穩到可以 schedule。這些都不是機械生成問題，而是你在設計團隊的工作語言與治理邊界。官方最佳實務也正是這樣建議：把 repeated mistakes 和 repeated workflows 外化，但何時外化、外化成什麼，仍是人的判斷。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是把 production secret handling、法規與資安規則、正式 release gate、schema migration、真實資料庫操作、權限旋轉、或會直接修改你目前主 checkout 的高風險 unattended automation，全都寫成「讓它自己跑」。尤其 automations 背景跑時沿用預設 sandbox；如果你把它放到 full access，本來就有 elevated risk。AGENTS.md 也不該變成一份含糊又過度授權的「反正都給 Codex 自己判斷」文件，因為那等於把治理責任埋進模糊指示裡。
所以這章真正的能力邊界，可以濃縮成一句話：
Codex 可以幫你把方法沉澱下來，但不能替你決定哪些方法有權成為規則、流程、分工與排程。
--------------------------------------------------------------------------------
八、一句帶走
讓 Codex 越來越懂你，不是靠更長對話，而是把規則寫進 AGENTS.md，把流程封成 Skills，把分工交給 Subagents，把穩定工作排成 Automations。
--------------------------------------------------------------------------------
本章記憶點
第一句：AGENTS.md 是永遠先載入的家規，Skill 是按需載入的 SOP。 第二句：Subagents 是平行分工，不會自己冒出來；Custom agent 是它的角色定義。 第三句：Automation 應該建立在手動已穩的流程上，而且目前是在 Codex App 背景跑，不是把責任丟給黑箱。
本章最小實戰動作
現在就對你的預約／排程系統做一個最小外化：
先在 repo 根目錄寫一份 AGENTS.md，只放六件事：專案版圖、啟動方式、測試方式、PR 前必做檢查、不要碰的東西、這類任務怎樣算 done。 接著，把你最常重複的一段 prompt，例如「排查 Google Calendar 沒建立事件」，升級成一個本地 skill。 Automation 先不要排；先手動把這個 skill 跑順，再考慮是不是值得 schedule。這正符合官方最佳實務：先把 durable guidance 寫進 AGENTS.md，把 repeated workflow 變成 skill，流程穩定後再 automation。
本章一句帶走
不要讓 Codex 只記得這一次；要讓它學會你一向怎麼做。

第 15 章
怎麼下對指令：讓 Codex 在架構裡工作，而不是在架構外亂長
一、這章只講一件事
這章只講一句核心：
好指令不是一句命令，而是一張工程任務單。
OpenAI 官方現在把這件事講得很清楚。Codex 在大或複雜的 repo 裡，最吃的是「正確的任務上下文」和「清楚的 done 定義」；官方給的一個好預設 prompt，至少包含四格：Goal、Context、Constraints、Done when。另一方面，官方 workflows 幾乎都再多補一格：Verification，也就是怎麼驗證結果。換句話說，真正成熟的 prompt，不是「幫我把它做好」，而是明確告訴 Codex：我要改哪一層、看哪些檔案、不准碰什麼、什麼情況才算完成、完成後要怎麼驗證。
所以這一章的目的，不是教你一句比較厲害的咒語。 而是讓你建立一個穩定習慣：
每次下指令前，先把它整理成一張五格任務單。
這五格是：
目標。 上下文。 限制。 完成條件。 驗證方式。
--------------------------------------------------------------------------------
二、先用畫面理解
先不要把 prompt 想成一句話。 先把它想成你交給工程夥伴的一張施工單。
你如果只對工班說：「把預約系統修好。」 工班不是不能做事。 但它很可能會自己補空白，自己猜你的意思，自己決定該拆哪面牆。 而在真實專案裡，最可怕的通常不是它完全不動。 而是它很認真地往錯的層走。
例如你真正想修的是：
前端 slot 的 selected 樣式和實際 availability 不一致。
但如果你只說「修好預約邏輯」，Codex 可能會一路往資料模型、API shape、甚至 booking 流程去找一個它認為比較根治的解法。那不一定是壞解法，可是它可能已經走出你這次允許的架構邊界。這正是官方一直強調明確 context、constraints 和 done definition 的原因：它們能讓 Codex 少做假設、保持 scope、讓結果更容易 review。
所以你可以把一個好 prompt，在腦中想成這張可朗讀的圖：
我要修什麼。 → 目標
這件事在哪裡。 → 上下文
哪些不能碰。 → 限制
怎樣才算做完。 → 完成條件
做完後怎麼驗。 → 驗證方式
再把我們整本書那三個檢查問題，塞進這張施工單裡：
我現在在哪一層？ 是 UI、API、資料模型、同步流程，還是部署。
我現在在改什麼？ 是哪些檔案、哪些模組、哪段互動。
誰負責記錄、同步、驗證與上線？ Codex 先做出 diff；Git 記錄；GitHub 同步與 review；你決定能不能往下一關走。
錨點句：好 prompt 不是一句願望，而是一張有邊界的工程任務單。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把這一章最重要的字，翻成人腦真的能用的版本。
Prompt。 白話講，不是願望，也不是靈感。 在 Codex 的世界裡，它更像一張任務單。官方 workflows 直接把 Codex 當成 teammate，強調它最適合接收 explicit context 和 clear definition of done。 口語定義：我要它執行的工程工作描述。
Context。 白話講，不是背景故事，而是 Codex 真的能拿來工作的材料。 官方 prompting 頁寫得很直接：送出 prompt 時，要給 Codex 可以使用的 context，例如 relevant files 和 images。IDE 會自動帶入 open files 和 selected text；CLI 則通常要自己用 @ 路徑或 /mention 指明。 口語定義：我希望它看哪裡。
Constraints。 白話講，就是邊界。 官方把它放在 prompt 四格裡，指的是 standards、architecture、safety requirements、conventions。 口語定義：你可以怎麼做，但不能亂做。
Done when。 白話講，就是驗收條件。 不是「我覺得差不多」，而是哪些事必須為真，這次任務才算結束。 口語定義：做到什麼程度，才叫完成。
Verification。 白話講，就是完成之後怎麼證明。 官方 workflows 幾乎每個例子都保留 Verification 區塊；像 bug fix 流程就明確要求 fix 後重跑 repro，若有標準檢查流程，還要跑 lint 加最小相關測試，並回報 commands 和 results。 口語定義：不是說修好了，而是證明修好了。
Repro，重現步驟。 白話講，就是把 bug 變成可重複發生的路徑。 官方 fix a bug workflow 很明確：repro steps 和 constraints，往往比一句高層描述更重要。 口語定義：讓問題不是感覺，而是可重播的現象。
Plan。 白話講，就是先想清楚再動手。 官方建議，任務如果複雜、模糊、難描述，就先讓 Codex plan，再開始 coding；做法可以是用 Plan mode，也可以直接要求 Codex 先 interview 你，把模糊想法問清楚。 口語定義：先定路線，再下施工。
Thread。 白話講，就是一條工作線。 官方最佳實務說，一條 thread 應該只承載一個 coherent unit of work；如果事情還是同一個問題，留在同一條 thread 往往比較好；真的分岔，才 fork。另一邊，prompting 文件也提醒，thread 的資訊都要塞進模型的 context window；任務太長時，Codex 會自動 compact，把較舊內容摘要化。 口語定義：一條要保持主題單純的工作線。
這裡你要記住一個非常實用的結論：
Prompt 要短，不代表資訊要少。 Prompt 要清楚，不代表要把所有長期規則都塞進這次任務裡。
官方最佳實務直接提醒，常見錯誤之一就是把 durable rules 一直塞進 prompt，而不是移去 AGENTS.md 或 skill；如果同一段工作流程一再重複，也應該升級成 skill，而不是每次重打一大段。 所以你要學的，不是把 prompt 越寫越長。 而是把這次任務需要的，和長期固定規則需要的，分開。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們整本書固定的主案例：預約／排程系統。
先看第一個你最常遇到的痛點：
slot 選取邏輯改了，selected 樣式和實際資料不同步。
很多人會這樣下指令：
把 slot 的 bug 修好。
這種 prompt 不是完全沒用。 但它太像願望，不像任務單。 它沒有說清楚是 UI 問題、資料 shape 問題，還是 API 問題；沒有說該看哪些檔案；沒有說不准碰哪些層；也沒有說怎麼驗證。
更好的版本，應該長得像這樣：
目標： 修正 slot selected 樣式與實際 availability 不一致的問題。
上下文： 請先讀 @BookingGrid.tsx @slotRules.ts。 如果需要，再看最近呼叫它們的 state hook。 我另外附一張目前錯誤畫面的截圖。
限制：
不要改 API shape
不要改 Firestore 資料模型
先重現問題，再提 patch
保持最小、高信心變更
完成條件：
disabled slot 不能被選取
selected 樣式與實際 state 一致
若可行，補一個回歸測試
驗證：
修完後重跑重現步驟
跑 lint + 最小相關測試
告訴我在 UI 裡要點哪一段流程來驗
這個寫法，幾乎就是把官方的四格 prompt 結構，再補上 workflows 一再強調的 verification。官方也特別提醒，UI 任務若有圖片參考，圖片可以提供視覺需求，但非直覺行為仍要用文字寫清楚，例如 hover、validation、keyboard interactions。
再看第二個非常經典的問題：
API route 寫了，但 Google Calendar 沒建立事件。
這種情況，很多人第一句就叫 Codex：
把 Google Calendar 同步修好。
這句話最大的問題，不是它太短。 而是它直接跳到修。 但你這類問題，常常先需要的是定位層次。
因為 Calendar 沒建立事件，問題可能在 route.ts、payload mapping、token / auth、env、scope、同步順序，甚至是你以為被呼叫的那段程式，其實根本沒被走到。
這時更成熟的 prompt，通常要先讓它解釋流程，再提 patch。官方 explain codebase workflow 就是這樣教的：打開最 relevant 的 files，要求它說清楚 request flow、模組責任、資料在哪裡被驗證，以及 changing this 時要注意的 gotchas。
你可以這樣下：
先不要直接改 code。
先讀 @app/api/booking/route.ts @lib/calendarSync.ts @lib/auth/google.ts @lib/env.ts
回答我：
booking request 到 Calendar event 的流程怎麼走
哪些欄位在哪裡被驗證
token / scope / env 依賴落在哪一層
最可能的三個失敗點是什麼
再提出最小 patch。 限制：
不要碰 production secrets
不要改 booking 資料模型
先分清已確認事實與推測
完成條件：
能明確說出問題點
若要改 code，只做最小必要修改
給我本地驗證步驟與預期結果
這種 prompt 的核心，不是比較斯文。 而是它把 Codex 鎖回架構裡：先 trace flow，再改；先區分確認與猜測，再修。這和官方對 bug fix、codebase explanation、verification 的建議是一致的。
再看第三個常見場景：
Firestore 有資料，但 UI 顯示不對。
這時很容易誤以為只是畫面 bug。 但你更應該讓 Codex 先幫你畫出資料流。 官方 explain codebase 範例就很適合這種情況：請它 explain request / response flow，說出每個模組的責任、資料在哪裡被驗證、改這裡有哪些 gotchas。對你的預約系統來說，這會比直接說「修 UI」更能避免它在架構外亂長。
所以你會發現，一個真的好的 prompt，不是比較有文采。 而是它能讓 Codex 先回答這三句：
我現在在哪一層？ 我現在在改什麼？ 誰負責記錄、同步、驗證與上線？
只要這三句沒有在 prompt 裡被暗示或明說，Codex 就更容易開始替你補空白。 而所有「它怎麼又改到別的地方去了」的抱怨，很多時候都從這裡開始。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
現在把「怎麼下對指令」放回不同的 Codex 表面。
先講 App。 如果任務複雜、模糊、跨好多層，官方建議是先 plan 再 coding。【版本敏感】今天官方文件的具體做法包括 Plan mode，或直接叫 Codex 先 interview 你，把模糊需求問清楚，再開始寫。對預約系統來說，像「booking 與 Calendar 同步要不要允許部分成功」這種不是單點 bug，而是流程設計題，就很適合先 plan。
再講 IDE extension。 IDE 最強的地方，不是它比較聰明，而是上下文離檔案最近。官方說 IDE 會自動帶入 open files 和 selected text；workflows 也一再用「先打開最 relevant 的 files、必要時選取 code」當起手式。【版本敏感】像「Add to Codex Thread」這種命令，本質上就是把你選到的函式或區段，縮成一個更準的上下文邊界。 所以在 IDE 裡，下對指令的重點常常不是多說，而是先打開對的檔，再只講這次真的要它做的事。
再講 CLI。 CLI 最適合做緊湊的 bug loop。官方 fix a bug workflow 幾乎就是一本 prompt 範本：在 repo root 開始，給明確 repro steps、加上 constraints，再要求它先 reproduce、再 propose patch、最後 run checks。官方還特別點出，對 CLI 來說，repro 與 constraints 往往比高層描述更重要；修完之後，還要重跑 repro，並執行最小相關測試，回報 commands 和 results。 所以 CLI 裡最成熟的 prompt，通常長得不像「幫我修」，而像：
問題是什麼。 怎麼重現。 不能碰什麼。 修完要重跑什麼。
再講 UI 迭代。 官方 workflows 對這一段給得很務實：如果你在做活的 UI 迭代，先用小提示讓它提 2 到 3 個方向，再用更小、更聚焦的 follow-up 收斂；如果你在這之間手動 revert 或改掉某部分，記得明講，不然 Codex 下一輪可能會把你剛剛手動修掉的東西又改回去。 這句話非常重要。 因為很多人不是 prompt 不會下，而是自己已經改了邊界，卻沒有把新邊界回報給 Codex。
如果你是做 圖片導向的 UI 任務，官方也講得很清楚：圖可以提供視覺需求，但實作限制還是要你補，例如 framework、routing、component style；而那些不容易從截圖看出的行為，也要寫成文字。 所以對你的 slot UI 問題來說，附錯誤畫面截圖很好，但你仍然要補一句：disabled 不可選、selected 必須跟 state 一致、不要改資料模型。
如果是 Cloud 背景任務，【版本敏感】你更要把 prompt 下得像任務單。官方 prompting 文件說，cloud thread 會在隔離環境裡 clone repo 並 checkout 它工作的 branch；如果你要直接讓 cloud 用 repo 工作，通常要先 push 到 GitHub。另一條路是從本地委派，這樣它可以連你目前的 working state 一起帶過去。 這代表 cloud 不是比較適合模糊任務，反而更適合邊界清楚、可背景跑、驗證方式明白的任務。
最後，再補一個很容易被忽略、但非常值錢的官方建議：
用 Git checkpoints。
官方 quickstart 在 IDE 和 CLI 兩條路都明確建議，在每個 task 前後建立 Git checkpoints，這樣要回滾時才容易。翻成人話就是： 好 prompt 不是只負責讓 Codex 開工。 好 prompt 還要和好 checkpoint 一起，讓你收得回來。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
Prompt 越長越好。
不是。 官方真正強調的是 right task context 和 clear structure，不是篇幅。更進一步，官方還直接提醒，把 durable rules 一直塞進 prompt 是常見錯誤；那些長期固定的規則，應該移到 AGENTS.md 或 skill。 所以真正好的 prompt，不是越長越厲害，而是這次任務需要的資訊夠完整，長期規則又沒有亂塞進來。
第二個誤解是：
Codex 會自己找到所有相關檔案，所以我不用講。
不一定。 官方 prompting 頁要求你主動提供 relevant files 和 images；IDE 會自動幫你帶入 open files 和 selected text，但 CLI 通常仍要你明確用 @ 或 /mention 指出路徑。 所以「它應該自己知道」這件事，最常讓它走出架構。尤其在你的預約系統裡，BookingGrid.tsx、slotRules.ts、route.ts、calendarSync.ts 根本不是同一層，少講一層，方向就可能歪。
第三個誤解是：
複雜任務就讓它直接開始寫，邊寫邊修就好。
不一定。 官方建議恰恰相反：複雜、模糊、難描述的任務，先 plan；你甚至可以要求 Codex 先 interview 你，把模糊想法問清楚，再進 implementation。 對像 booking 流程、Calendar 同步策略、auth / env 改動這種題目，先 plan 不是拖慢，而是防止它先往錯的架構長。
第四個誤解是：
同一個專案就放同一條 thread，比較省。
不是。 官方最佳實務說得很清楚：一條 thread 要保持一個 coherent unit of work；真的分岔才 fork。再加上 prompting 頁提醒，thread 的內容都要塞進 context window，長任務還會 compact。 所以把 slot UI、Firestore 顯示、Google Calendar、部署問題通通塞進同一條 thread，最後常常不是變聰明，而是變糊。
第五個誤解是：
我手動改過或 revert 過某些東西，Codex 下一輪自然會懂。
不一定。 官方 UI 迭代 workflow 直接提醒：如果你手動 revert 或 modify 了某些變更，要告訴 Codex，否則它下一輪工作時，可能又把你剛剛改回來的東西覆蓋掉。 這句話很重要，因為它直接說明了一件事：prompt 不只是在開工前下，review 過程中的邊界更新，也要靠 prompt 回報。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，不是看你會不會講 prompt 技巧。 而是看你知不知道，什麼工作可以用「工程任務單」交給 Codex 主做，什麼工作只能讓它輔助，什麼工作根本不該讓它代決。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是局部 UI 修正、slot state 與樣式對齊、加測試、補文件、解釋資料流、做最小 bug fix、產生高信心的小 diff。這類工作最適合用官方建議的 prompt 骨架：明確 Goal、Context、Constraints、Done when，再補 Verification；尤其 bug fix、寫測試、解釋 code flow 這些，官方 workflows 已經給了很成熟的模式。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 slot 規則到底要怎麼定、booking / appointment 流程要不要調整語意、Google Calendar 失敗是要 rollback 還是補償、auth / env 要不要重構、API shape 能不能動。對這些題目，官方比較推薦的姿勢不是直接「去改」，而是先讓 Codex plan、先 trace flow、先 interview 你，必要時把 bounded work 拆給 subagents，但最後的取捨仍由人拍板。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、正式 deploy、不可逆 schema migration、真實資料庫危險操作、權限設定、法規與資安判斷、商業取捨。官方最佳實務對權限的建議其實已經給了方向：先用預設 permissions，把 approval 與 sandboxing 維持得緊，再只在 trusted repo 或明確 workflow 必要時放寬。這代表「能不能放寬」和「該不該把決策也交出去」是兩件不同的事。 所以就算你 prompt 下得再漂亮，也不該把高風險責任包進一句「你自己看著辦」。
把這一章的能力邊界濃縮成一句話就是：
好 prompt 可以把 Codex 變成很強的執行者；但架構責任、風險責任、放行責任，始終不會因為 prompt 寫得漂亮就自動移轉。
--------------------------------------------------------------------------------
八、一句帶走
讓 Codex 在架構裡工作的方法，不是喊更大的命令，而是給它更清楚的任務邊界：目標、上下文、限制、完成條件、驗證。
--------------------------------------------------------------------------------
本章記憶點
好 prompt 不是一句願望，而是一張五格工程任務單：目標、上下文、限制、完成條件、驗證。
在 IDE，先打開對的檔；在 CLI，先給可重現步驟；在複雜任務，先讓 Codex plan。
prompt 下得對，Codex 會在架構裡加速；prompt 下得糊，Codex 就容易在架構外亂長。
本章最小實戰動作
拿你現在最想修的一個預約系統問題，不要先叫 Codex 開工。先把它寫成這五行：
目標： 上下文： 限制： 完成條件： 驗證：
然後再檢查一次： 我現在在哪一層？ 我現在在改什麼？ 誰負責記錄、同步、驗證與上線？
只要這八行寫完，你這次給 Codex 的，不再是一句含糊命令，而是一份真的能工作的工程任務單。這也正好對齊官方建議的 prompt 四格、verification 習慣，以及 clear definition of done。
本章一句帶走
好指令不是叫它幫你想，而是讓它知道自己現在該在哪一層、動哪幾個檔、不能越過哪些線、做到什麼才算完成。

第 16 章
用預約系統看全局：UI、slot、API、資料庫、Google Calendar、部署
一、這章只講一件事
這章只講一句核心：
一個預約系統，不是一張頁面加一支 API；它是一條從畫面、規則、伺服器、資料、外部同步到部署環境的完整鏈路。
把這條鏈看對，你才不會在每次出事時都只盯著單一函式。因為在我們這個主案例裡，前端 UI、slot 規則、route.ts／API endpoints、Firestore 類型資料庫、Google Calendar 同步、以及 deploy 環境，本來就是不同層。Cloud Firestore 是文件導向的 NoSQL 資料庫，資料放在 collections 與 documents 裡；Google Calendar 建立事件要走 events.insert()；GitHub 的 deployment environments 又把 production、staging、approval、branch restrictions、secrets 放在另一層管理。這幾件事天生就不是同一個世界。
所以這一章不是再加一堆新名詞。 而是把你前面學到的所有層次，壓回同一張真實地圖：
使用者看到什麼。 系統判定什麼。 伺服器接受什麼。 資料庫存了什麼。 外部日曆同步了什麼。 線上環境到底跑了什麼。
--------------------------------------------------------------------------------
二、先用畫面理解
先把你的預約系統想成一條六站輸送帶。
第一站是 UI 畫面層。 使用者看到 slot、點選 slot、看到 selected / disabled / loading / error。
第二站是 slot 規則層。 這一層不負責好不好看，它只負責回答：這個時段能不能選、為什麼不能選、已選和不可選的條件是什麼。
第三站是 API 邊界層。 也就是你的 route.ts 或其他 server endpoints。它接收前端提交、驗證輸入、判斷權限、決定要不要寫資料、要不要觸發外部同步。
第四站是 資料層。 如果你用的是 Firestore 類型資料庫，這裡通常會存 booking 文件、slot 佔用狀態、同步狀態、錯誤紀錄。Cloud Firestore 的世界觀就是 documents in collections，而且支援 atomic transactions / batched writes，以及即時監聽 onSnapshot() 的資料更新。
第五站是 Google Calendar 同步層。 這不是「把資料庫再存一次」，而是對外部系統做 side effect。Google Calendar 建立事件要呼叫 events.insert()，至少要提供 calendarId 與 event，而 event 至少要有 start、end；能不能成功，還取決於 OAuth 2.0 credentials、access token、granted scopes，以及你實際呼叫的是哪個 calendar。
第六站是 部署層。 就算前五站在你本地都通了，線上還是可能不通。因為 GitHub environments 本來就把 production、staging、approval、branch restrictions、environment secrets 當成部署守門點。也就是說，線上跑不跑，不只看程式碼有沒有 merge，還看環境有沒有放行。
把這張圖直接記住：
使用者點 slot → UI state 改變 → slot 規則判定是否合法 → POST 到 booking API → 伺服器驗證、寫資料 → 必要時同步 Google Calendar → 把結果回寫成同步狀態 → UI 用 response 或資料監聽更新 → 某個版本被部署到真正在跑的環境
錨點句：畫面只是入口，真正的系統在畫面後面。
--------------------------------------------------------------------------------
三、把名詞翻成白話
畫面層，User Interface，UI。 白話講，就是使用者眼前看到的狀態。 口語定義：它不是事實本身，它是事實被呈現出來的樣子。
slot 規則，availability rules。 白話講，就是系統用來判定某個時段能不能被選、為什麼不能選的業務規則。 口語定義：這個時段到底算不算可預約。
API 端點，API endpoint。 白話講，就是前端把請求送給伺服器的入口。 口語定義：畫面和伺服器交接的門口。
資料模型，data model。 白話講，就是你的 booking、slot、sync status 在資料庫裡怎麼被表示。Cloud Firestore 的資料模型是 documents 與 collections；它很自由，甚至是 schemaless，但 Firebase 官方也明說，若同一 collection 的文件欄位和型別不一致，後續查詢會更難做，所以實務上仍應保持一致。
即時同步，realtime listener。 白話講，就是 UI 不是自己猜資料變了，而是等資料層推來更新。Cloud Firestore 的 onSnapshot() 會先給一份當前初始快照，之後每次內容改變再更新一次。 口語定義：不是我猜它變了，是資料層通知我變了。
原子寫入，atomic write。 白話講，就是這批操作要嘛全成，要嘛全不成。Cloud Firestore 官方對 transactions 與 batched writes 的定義就是這樣。 口語定義：不要半套成功。
外部同步，external sync。 白話講，就是你的系統內部 booking 成功了，還要不要把它映射到外部世界，例如 Google Calendar。Google Calendar 建立事件走 events.insert()，而 Google 的 OAuth 2.0 流程又要求 credentials、access token、scope 與 token lifecycle 都正確。 口語定義：我自己系統裡成立，和外部服務裡也成立，不是同一件事。
部署環境，deployment environment。 白話講，就是某個版本真正被送去執行的地方。GitHub 官方把 production、staging、development 都視為 environment，還能掛 approval、secrets 和保護規則。 口語定義：真正會跑給人用的地方。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在把這一切放回我們的預約／排程系統。
最穩的系統，不是每一層都各自定義一次「這個 slot 可不可以選」。 而是盡量只有一個真相來源。 UI 可以有 selected state，但 selected 不應該自己發明 availability；真正的可預約性，應該來自同一套 slot 規則與同一份資料模型。否則就會出現你很熟悉的怪象：畫面亮了，送出卻失敗；或畫面看起來沒問題，資料層其實早就判它不可預約。這不是單純的 CSS 問題，而是畫面層和規則層各自長出了一套真相。這個判斷是工程設計推論，但它正好對齊 Firestore 與 API / sync 分層的官方世界觀。
如果 booking 的核心狀態都在同一個資料庫裡，那最穩的做法通常是把「建立 appointment」和「保留 slot」視為同一個資料寫入單位。Cloud Firestore 官方支援 atomic transactions 與 batched writes，這正是你避免雙重預約、避免一半成功一半失敗的重要工具。也就是說，若同一個 request 裡你既要寫 booking，又要標記 slot 已佔用，這兩件事最好不要分成兩個彼此獨立、可能一個成功一個失敗的隨手寫入。
但 Google Calendar 同步就不一樣了。 它不是你自己資料庫裡的同一個文件集合，而是外部服務。Google 官方文件很清楚：建立事件要用 events.insert()，要指定 calendarId，event 至少要有 start 和 end；而且你還得先走 OAuth 2.0，拿到正確的 access token，並確認 scopes 真正覆蓋到你需要的 Calendar 操作。這表示：booking 成立 和 Calendar event 建立成功，最好在腦中分成兩個狀態。它們可以在同一條流程裡，但不要在概念上混成同一件事。
所以一個成熟的資料設計，通常會讓 appointment 文件不只記「有沒有預約」，還記「Calendar 同步狀態是 pending、success，還是 failed」，必要時再記 calendarEventId、最後同步時間、錯誤代碼。這一段是工程設計推論，但它剛好回應了 Google Calendar 官方對事件建立與 OAuth / 授權獨立性的要求：外部同步本來就有自己的成功與失敗面向。
再看 UI。 如果你用的是 Firestore 類型資料庫，而畫面又要反映最新 booking 狀態，那 UI 最好不是靠一堆本地猜測來維持真相，而是盡量透過 API response 或資料監聽去對齊真實狀態。因為 onSnapshot() 的設計就是先回初始快照，再在資料變動時更新；同時 Firestore 也是 schemaless 的，欄位若漂移，前端 mapping 很容易出錯。這就是為什麼「Firestore 裡明明有資料，UI 還是怪」時，真正要查的常常是讀取路徑、欄位映射、query 條件、listener 綁定位置，而不只是「是不是沒寫進去」。
如果你的系統之後還要把 Calendar 的狀態回讀進來，例如使用者在外部日曆刪掉事件，你也想在自己系統裡知道，那 Google Calendar 官方另外提供 incremental synchronization 的機制。這代表「把資料寫出去」和「把外部變化再同步回來」其實又是兩條不同難度的線。很多預約系統第一版先做單向寫入就夠；只有當產品真的需要雙向一致時，才把這條線打開。
最後一層是部署。 你本地把 slot、API、Firestore、Calendar 都串好了，不代表線上就是這個樣子。GitHub 官方把 environments 定義成 deployment target，而且能要求 approval、限制 branch、限制 secrets。這代表一個功能就算已經在 GitHub 上 merge，production 仍然可能因為 environment secrets、保護規則、或部署尚未放行而沒有更新。所以「GitHub 已同步，但線上還沒變」不是神祕現象，它就是第六層還沒過。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
這張全局圖，最適合拿來指揮 Codex。
先用 ChatGPT 把層次分清楚。 你不是先問「幫我修」。 你應該先問：「這個症狀比較像 UI 呈現錯、slot 規則錯、API 邊界錯、資料模型錯，還是外部同步錯？」 這一步的價值，是先決定任務落點，不讓代理一開始就往錯層衝。
接著讓 Codex 做它最擅長的事。OpenAI 官方把 Codex 的核心能力寫得很直接：它可以理解陌生 codebase、review code、debug and fix problems、automate development tasks。Workflows 文件也明確把「Explain a codebase」和「Fix a bug」分成兩種工作流：前者適合先釐清 request flow、data model、模組責任；後者適合有可重現錯誤時，先重現、再提最小 patch、再跑驗證。對這個預約系統而言，遇到跨層問題時，先叫它 trace BookingGrid.tsx → slotRules.ts → route.ts → Firestore → calendarSync 的流程，通常比直接叫它「修好」更成熟。
【版本敏感】當變更真的做出來後，Codex App 很適合當你的收斂台。官方文件寫到，App 的 diff pane 會顯示 local project 或 worktree checkout 的 Git diff，你可以加 inline comments，stage / revert 特定 chunks 或整個檔案，然後直接 commit、push、create pull requests；更進階的 Git 任務再回 integrated terminal。放回這個專案，就是：先在 UI / slot 那條線收斂乾淨 diff，再處理 Calendar 同步那條線，最後才決定要不要一起進同一個 PR。
如果問題已經明顯分成兩條線，例如「slot selected / disabled 狀態錯」和「Google Calendar 沒建立事件」，那就不要硬塞成一團。前者更像本地 UI 與規則對齊問題；後者更像 API、auth、token、env、外部 side effect 問題。這時候你可以先用 explain codebase workflow 釐清流向，再用 fix a bug workflow 在較小範圍內做 patch。換句話說，Codex 不是拿來把整套系統一次打爛重拼，而是拿來讓你分層、分線、分批收斂。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
畫面怪怪的，就一定是資料庫錯。
不是。 如果 Cloud Firestore 的文件已經寫對了，onSnapshot() 也能正常把初始快照和後續更新推到前端，那 UI 仍可能因為欄位映射、query 條件、state 合成方式，或 selected / disabled 的呈現邏輯而顯示錯。資料存在，不等於畫面就一定用對資料。
第二個誤解是：
API route 有回應成功，就等於 Google Calendar 一定有事件。
不是。 Google Calendar 建立事件是另一個外部操作，要走 events.insert()，而且需要正確的 calendarId、event.start、event.end，以及真正可用的 OAuth token 和授權 scope。也就是說，booking API 本身可用，和外部事件真的建立成功，中間還隔著一整段外部依賴。
第三個誤解是：
Firestore 有資料，就代表 booking 已完整交付。
不是。 那通常只代表你的內部資料層成功了。若你的產品需求還包含 Google Calendar 同步、管理端顯示、線上環境部署，那些都是另外的完成條件。尤其當外部同步和部署守門都還在時，把「資料庫寫成功」誤當成「產品完成」是很常見的早收工。
第四個誤解是：
GitHub 上看得到變更，使用者就一定看得到。
不是。 GitHub environments 本來就把 deployment 和 code merge 分開，還能要求 approval、限制 branches、限制 secrets。這表示你完全可能處在「PR 已 merge，但 production 仍未更新」的狀態。對這種問題，繼續改 route.ts 往往沒有幫助，因為你卡的不是 API 層，而是部署層。
--------------------------------------------------------------------------------
七、能力邊界
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是讓它先讀 codebase、把 UI 到 API 到資料庫到 Calendar 的流程講清楚；修 BookingGrid.tsx 的 selected / disabled 呈現；補最小回歸測試；把 route.ts 裡的驗證與錯誤處理整理乾淨；草擬 commit、PR 說明；在 App 裡收斂 diff。這些都很符合 OpenAI 官方對 Codex 的定位：understand codebases、review code、debug / fix problems、run repetitive workflows。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 slot 規則到底以哪一層為唯一真相、booking 與 slot 佔用是否一定要在同一個 transaction 裡、Google Calendar 同步要同步式還是非同步、失敗時是 rollback 還是留下 failed sync status、哪些欄位應該進 appointment 文件、UI 要相信 API response 還是資料監聽。這些問題 Codex 可以幫你列方案、做 flow tracing、提出 patch，但最終是架構決策，不是文字生成。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、真實 Google Calendar 寫入策略的放行、正式 deploy、environment approvals、真實資料庫批次修正、不可逆 migration、權限設定、法規與資安判斷。理由不是「Codex 一定不行」，而是這些已經跨進外部資源、真實環境與責任歸屬。GitHub environments 把 approvals、branch restrictions、secrets 做成守門點；Google OAuth 2.0 又把 credentials、token、scope 做成授權前提。這些都不是你該外包給代理自己拍板的地方。
--------------------------------------------------------------------------------
八、一句帶走
預約系統不是一個表單送出成功就結束；它是 UI、規則、API、資料、外部同步、部署六層一起對齊，才算真的完成。
本章記憶點
第一句：slot 的 selected 樣式是畫面層，slot 可不可預約是規則層；兩者一分家，怪象就開始了。 第二句：Firestore 寫成功，最多只代表內部資料成立；Google Calendar、GitHub、Deploy 都還是下一層。 第三句：merge 是版本進主線，deploy 才是版本進環境。
本章最小實戰動作
拿你的預約系統，現在就畫一張六格圖：UI、slot 規則、API、資料庫、Google Calendar、Deploy。然後把你最近的一個 bug，硬塞進其中一格當「最先懷疑層」，再寫一句「如果不是這一層，下一個我查哪一層」。這個動作的目的，是把「一團霧」變成「有順序的排查圖」。若你排查到資料或同步層，請記得把 Firestore 的原子寫入／即時監聽，以及 Google Calendar 的事件建立／OAuth 前提，一起列進去。
本章一句帶走
先分層，再修 bug；先知道壞在哪一站，Codex 才能幫你修得又快又準。

第 17 章
常見故障的本質：slot 錯、資料不同步、token 問題、權限問題、環境問題
一、這章只講一件事
這章只講一句核心：
大多數你以為是「某個函式壞了」的故障，本質上其實是某一層說對了，另一層沒跟上。
官方文件本身就把這些故障拆成不同世界。Cloud Firestore 把「資料寫入」「即時監聽」「離線快取」「交易與批次寫入」「Security Rules」分成不同章節；Google Calendar 又把「建立事件」「OAuth scopes」「認證與授權疑難排解」「API 錯誤碼」分開講；GitHub 也把「部署環境」「deployment protection rules」「environment secrets」獨立成一套治理機制。這些官方切法其實在提醒你：slot 錯、資料不同步、token 問題、權限問題、環境問題，本來就不是同一類事故。
所以這一章真正要替你建立的，不是更多修 bug 技巧。 而是一次把「故障分層」這件事看清楚：先判斷你現在壞在哪一層，再決定要修哪一層。
--------------------------------------------------------------------------------
二、先用畫面理解
先把預約系統想成一間急診室，不是想成一個函式庫。
螢幕上看到的症狀，只是警報器響了。 真正出事的地方，可能在別站。 slot 樣式怪怪的，可能不是 CSS。 Firestore 有資料，UI 還是不對，可能不是資料沒寫進去。 Google Calendar 沒建立事件，可能不是同步函式本身。 本地完全正常，線上卻壞掉，也可能不是程式碼層，而是 deployment environment 還沒放行，或 secrets 根本沒進到那個環境。GitHub 官方文件明寫，deployment protection rules 可以要求 manual approval，也可以限制哪些 branches 能部署到某個 environment；environment secrets 也是分開建立與管理的。
你可以把這一章先記成一張文字圖：
症狀在畫面上。 → 先問是 UI 狀態、slot 規則、API 邊界、資料同步、外部同步，還是部署環境。 資料有沒有寫進 Firestore。 → 不等於 UI 一定看對。 Google Calendar 有沒有事件。 → 不等於 booking API 一定錯。 GitHub 有沒有變更。 → 不等於 production 一定在跑那個版本。
錨點句：症狀出現在畫面，根因常常躲在別層。
--------------------------------------------------------------------------------
三、把名詞翻成白話
症狀，symptom。 白話講，就是你眼前看到的不對勁。 口語定義：螢幕在告訴你有事，但沒保證它告訴你的就是根因。
根因，root cause。 白話講，就是那個真正讓系統走歪的點。 口語定義：不是哪裡最吵，而是哪裡真的先壞。
token。 白話講，就是你拿去叫用 Google API 的通行證。Google 官方 OAuth 文件把 access token、refresh token 和 scopes 拆得很清楚：應用程式先取得 credentials，再拿 access token 存取 API；token 會過期，之後要靠 refresh token 換新；scope 則決定這張票到底能做哪些操作。
scope。 白話講，就是通行證的權限範圍。Google Calendar 官方說，scope 是 OAuth 2.0 URI，用來定義你的 app 能讀什麼、改什麼，而且一般建議選最窄、最聚焦的 scope。Calendar API 也明列了像 calendar、calendar.events、calendar.readonly 這些不同範圍。 口語定義：你不是有票就能做所有事，還要看這張票寫你能做什麼。
permission。 白話講，就是就算你有 token，也不一定有權碰那個資源。Google Calendar 的建立事件文件寫得很直接：除了要用對 scope，還要確認 authenticated user 對你指定的 calendarId 真的有 write access；而 Calendar 的錯誤處理文件也指出，404 Not Found 有時不只是資源不存在，也可能是使用者對那個 calendar 沒有存取權。 口語定義：票是真的，門也可能還是進不去。
environment。 白話講，就是程式最後實際跑的那個地方，以及那個地方的設定。GitHub 官方文件把 environments 定義成像 production、staging、development 這樣的 deployment target；它們可以有 required reviewers、deployment branch restrictions、environment secrets。 口語定義：同一份 code，放在不同環境，不保證長得一樣。
cached data。 白話講，就是 UI 有可能先看到本地快取，再晚一點才跟後端對齊。Cloud Firestore 官方明寫，它支援 offline persistence，會快取 app 正在使用的資料副本；裝置回線上後，才把本機變更同步回後端，而且同一份文件多次變更時採 last write wins。另一方面，onSnapshot() 的第一次 callback 會先立刻給你當前快照，之後內容改變才再更新。 口語定義：你看到的，不一定是後端剛剛那一刻的唯一真相。
--------------------------------------------------------------------------------
四、把它放回你的專案
先看第一種最常見的：slot 錯。
你改了 slot 規則，結果 selected 樣式和實際資料不同步。 這種故障最容易被誤診成「前端樣式問題」，但本質通常是畫面層、規則層、資料同步層沒有對齊。因為 Firestore 的 onSnapshot() 會先給一份目前快照，再在內容變更時推送更新；如果你又開了 offline persistence，前端還可能先看到快取資料，等重新連線後才同步本地變更，且同一文件衝突時採 last write wins。也就是說，UI 亮不亮，不只取決於按鈕 class，還取決於你現在讀的是本地 state、即時 listener、還是快取中的舊狀態。
所以當 slot 看起來錯時，你第一個問題不要是「CSS 哪裡壞了」。 你要先問：selected 是由哪一層決定的？disabled 是由哪一層決定的？畫面現在吃的是即時資料、API response，還是舊的本地狀態？ 只要這三個答案不一致，畫面就很容易長出第二套真相。這是工程推論，但它直接建立在 Firestore 的 listener / cache 行為與你系統的分層現實上。
再看第二種：資料不同步。
你在 Firestore 明明看得到 booking 文件，UI 卻還是顯示不對。 這時候，真正要查的通常不是「有沒有寫進資料庫」，而是讀取那一層到底是怎麼拿資料的。Cloud Firestore 官方說，mobile / web client library 的每一個資料請求，都會先經過 Security Rules；如果規則拒絕任何指定文件路徑，整個 request 會失敗。更要命的是，官方同時也寫明：server client libraries 會繞過 Cloud Firestore Security Rules，改走 Google Application Default Credentials 和 IAM。這代表一個很真實的情境：你的 backend 可以成功寫入，但前端 client 因為 rules 或 auth 條件不符，仍然讀不到。
如果你最近才剛改過 Security Rules，還要再多記一件事。Firebase 官方文件說，Security Rules 的變更對新 queries 和 listeners 可能要到一分鐘才生效，對已經活著的 active listeners 則可能要到十分鐘才完全傳播。也就是說，有時你以為自己已經修好 permission，前端還是舊行為，不一定是你改錯，有可能只是規則變更還沒完全傳到所有 listener。
第三種，是你最常懷疑單一函式、但其實常常不是單一函式的：Google Calendar 沒建立事件。
Google 官方建立事件文件把最低條件寫得很直白：要呼叫 events.insert()，要提供 calendarId 和 event，而 event 至少要有 start 和 end；同時你必須設對 OAuth scope，並確認 authenticated user 對那個 calendarId 真的有 write access。這意味著「沒建立事件」至少可能卡在四層：payload 不完整、scope 不對、calendarId 不對、使用者對該 calendar 沒寫入權。
更進一步，Google Calendar 的錯誤文件提醒你，不要只看一句「失敗了」。官方說 Calendar API 會回兩層錯誤資訊：HTTP status 和 response body 裡更細的 JSON details。401 Invalid Credentials 通常代表 access token 過期或無效；Google 的 auth troubleshooting 頁也明寫，「Token has been expired or revoked」就是 token 已過期或被撤銷。404 Not Found 除了資源根本不存在，也可能是你正在存取一個使用者沒權限打開的 calendar。403 不一定是權限不夠，也可能是 quota / rate limit exceeded。 也就是說，Calendar 沒建事件，不要先問哪個函式壞了；先問是 401、403、404，還是別種 reason。
還有一個很容易被忽略、但在真實專案很值錢的點。Google 官方在建立事件文件裡特別提到：你可以自己提供 event ID，這有兩個好處，一是方便本地資料庫和 Google Calendar 對上，二是當操作在 Calendar 後端其實已成功、但你的應用在收到成功回應前失敗時，可以避免重試後重複建立事件。 翻成人話就是：有時不是「建立失敗」，而是「建立成功但你以為失敗」，結果重試又建了一次。 這種故障的本質不是 token，也不是 permission，而是同步流程缺乏 idempotency 設計。
再看更深一層的：token 問題。
Google OAuth 官方把基本流程寫得很清楚：先建立正確平台對應的 OAuth client credentials，再向 Google Authorization Server 取得 access token，之後把 token 帶去呼叫 API；access token 會過期，refresh token 也可能因使用者動作或政策而失效。這意味著「本地昨天可以、今天不行」未必是 code regression，也可能只是 token lifecycle 走完了。尤其如果你把測試環境、正式環境、桌面 OAuth、Web OAuth 混著用，client ID / redirect URI / token 來源對錯一點點，就可能在「看起來像 API 壞掉」的表面下，實際是 auth 配置錯。
再來是：權限問題。
很多人把 token 和權限混在一起。 但 Google 官方其實拆得很清楚：scope 決定你被授予哪種類型的能力；對 Calendar 來說，你還需要那個使用者對目標 calendar 真正有 accessRole，而且 create events 文件明確要求你檢查 write access。若你是用 service account，Google Workspace 官方又另外說明：如果要代表 Google Workspace 組織中的使用者呼叫 API，需要由 super administrator 設定 domain-wide delegation；而 Calendar 參考文件甚至建議，盡量以 intended data owner 身分驗證，不要直接把 service account 當成 calendar data owner，否則可能有意料外行為。 這代表「權限問題」至少可能是：scope 太小、calendar 沒授權、service account 沒 delegation、或你根本用錯身份去持有資料。
最後一種，也是最容易被誤判成「怎麼線上都不照本地來」的：環境問題。
GitHub 官方把 deployment environments 寫得非常清楚：一個 job 只要 reference 某個 environment，就可能被 deployment protection rules 卡住，例如 required reviewers、manual approval、branch restrictions。另一邊，GitHub secrets 文件也明寫，repository secret 和 environment secret 是分開建立的；更關鍵的是，如果某個 secret 根本沒設，${{ secrets.NAME }} 的結果會是空字串。 所以你看到「本地 Google Calendar 可以建立事件，線上卻完全沒反應」，不要只回去翻 calendarSync.ts。線上可能根本沒有那個 token，或 token 在錯的 environment，或部署根本還沒被批准進到那個 environment。
這裡你要建立一個很穩的排查順序：
slot 錯，先查畫面層和規則層有沒有兩套真相。 Firestore 有資料 UI 不對，先查 listener / query / rules / cache。 Calendar 沒建事件，先看 HTTP code、error reason、scope、calendar access。 本地好線上壞，先查 deployment environment、secrets、approval、branch rules。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
這種跨層故障，最不適合的 prompt 是：
「幫我修好。」
OpenAI 官方的 workflows 其實已經給了你更成熟的路。 如果你有可重現的錯誤，官方 fix a bug workflow 的建議是：在 repo root 啟動 Codex，給它明確的 repro steps、懷疑檔案、constraints，然後要求它先重現、再提 patch、最後跑驗證。官方甚至明說，對 bug 任務來說，repro steps 和 constraints 比高層描述更重要。
所以像 slot 問題，你不應該只說「selected 樣式怪怪的」。 你應該說：
「Bug：disabled slot 偶爾仍可被選，selected 樣式和實際 state 不一致。 Repro：啟動 app，進入 booking 頁，先點某個已被管理者封鎖的 slot，再切換日期。 懷疑檔案：@BookingGrid.tsx、@slotRules.ts。 限制：不要改 API shape，不要改資料模型，先最小修補。 修完後重跑 repro，並告訴我 UI 驗證步驟。」
這種 prompt 才是讓 Codex 在架構裡工作，而不是從 UI 一路亂長到資料層。這正對齊官方 workflow 的寫法。
如果你碰到的是 Google Calendar 這種跨層問題，最成熟的第一步通常不是直接 patch。 官方 explain a codebase workflow 建議先附上 relevant files，請 Codex 解釋 schema、request / response flow、required vs optional fields、gotchas。對你的預約系統來說，像這樣會更穩：
「先不要改 code。 讀 @app/api/booking/route.ts、@lib/calendarSync.ts、@lib/auth/google.ts、@lib/env.ts。 先回答 booking request 到 Calendar event 的流程怎麼走，哪些欄位在哪裡被驗證，token / scope / env 落在哪一層，再列出三個最可能的失敗點。」
這樣做的價值不是慢，而是防止它先把 patch 打在錯層。OpenAI 官方對 Codex 的定位也正是如此：它擅長 trace failures、diagnose root causes、suggest targeted fixes。
如果你懷疑是 Firestore permission 問題，不要讓 Codex 直接在 production 猜。 Firebase 官方提供 Emulator Suite 與 rules unit testing，明說你可以用 emulator 寫單元測試去驗證 Cloud Firestore Security Rules，而且 v9 的 rules unit testing library 只碰 emulator，不會碰 production resources。 所以比較成熟的工作流是：先讓 Codex 幫你定位規則路徑與可疑條件，再把那個規則案例丟進 emulator 測，別直接拿真資料庫猜。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
slot 錯，就是 CSS 問題。
不是。 只要 UI state、slot 規則、即時資料來源三者有一個沒對齊，畫面就可能亮錯。onSnapshot() 的第一次 callback 會立刻給當前快照；如果你又開了 offline persistence，前端還可能先讀到快取，再晚一點才跟後端同步。
第二個誤解是：
Firestore 有資料，所以資料層沒問題。
不一定。 寫進去，和讀出來、讀得對，是兩件事。mobile / web client 的每個資料請求都會先過 Security Rules；server client libraries 又會繞過 Rules、改走 IAM。這代表「backend 寫成功、frontend 讀失敗」完全可能是真的，而且是官方模型本來就允許的差異。
第三個誤解是：
Google Calendar 沒建立事件，就是同步函式壞了。
不一定。 Calendar API 的建立事件要求 calendarId、event.start / event.end、正確 scope，以及對目標 calendar 的寫入權；Calendar API 的錯誤處理文件又指出，401 往往是 token 無效或過期，404 可能是沒存取權，403 可能是 quota / rate limit。 所以「沒建立事件」常常只是現象，不是根因名稱。
第四個誤解是：
我剛改了 Firestore rules，現在前端還在報 permission denied，所以一定沒改對。
也不一定。 Firebase 官方明寫，Rules 更新對新 queries / listeners 可能要到一分鐘才生效，對 active listeners 則可能要到十分鐘才完全傳播。 有時你看到的是 propagation delay，不是規則邏輯本身仍然錯。
第五個誤解是：
本地測過了，所以線上也一定會過。
不是。 GitHub environments 可以要求 manual approval，也可以限制特定 branches 才能部署；environment secrets 又是另一層設定，而且若 secret 根本沒設，工作流中的 secrets 表達式會得到空字串。 這就是為什麼「本地好、GitHub 也 merge 了、線上卻還是壞」常常不是 code 問題，而是環境治理問題。
--------------------------------------------------------------------------------
七、能力邊界
這一章談能力邊界，要非常務實。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是 trace BookingGrid.tsx → slotRules.ts → route.ts → calendarSync.ts 的資料流、幫你把 bug 重現步驟寫清楚、補最小回歸測試、在 UI / API 層加可回滾的診斷 log、把 Calendar 錯誤回應整理成「HTTP code + reason + 建議下一步」。OpenAI 官方本來就把 Codex 定位成能理解 codebase、debug / fix problems、review code 的代理。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 slot 可預約性的唯一真相應該放哪一層、booking 與 slot 佔用是否要用同一個 atomic transaction、Calendar 失敗時是 rollback booking 還是留下 sync_status = failed、要不要自己指定 Calendar event ID 做 idempotency、scope 該拿 calendar 還是 calendar.events、這個 environment 要不要改成 required reviewers。這些問題 Codex 可以幫你列方案，但真正重要的是產品與架構取捨。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production secrets、真實 Google Calendar 寫入放行、Firestore IAM / Security Rules 的最終政策、deployment approvals、domain-wide delegation、正式 deploy、不可逆資料修復。因為一旦跨進 secrets、external side effects、real data、organization-level permissions，責任就不是「這個 patch 對不對」而已，而是「誰有權放行」。官方文件把 environment approval、secret 管理、OAuth credentials、domain-wide delegation 都獨立成專門治理步驟，本身就在告訴你這些不能當成普通程式碼編輯。
--------------------------------------------------------------------------------
八、一句帶走
常見故障的本質，不是某個函式突然背叛你，而是某一層說對了、另一層沒跟上；先找失配的層，再修那一層。
本章記憶點
第一句：slot 錯，不一定是 UI；Calendar 沒建事件，不一定是同步函式。 第二句：資料有沒有寫進去，和畫面有沒有看對、外部服務有沒有同步、線上有沒有放行，是三種不同完成度。 第三句：先判層，再排查；先看錯誤碼，再下結論。
本章最小實戰動作
拿你現在手上一個最煩的預約系統 bug，只做一件事：寫一張五欄故障卡。
第一欄寫：症狀。 第二欄寫：最先懷疑層，只能填 UI、slot 規則、API、資料庫、Google Calendar、Deploy 其中一格。 第三欄寫：我要先看的證據，例如 onSnapshot 回來的資料、HTTP status / error.reason、Security Rules、environment secret。 第四欄寫：如果這層沒問題，下一層查哪裡。 第五欄寫：Codex 這次只能幫我做什麼，不能替我決定什麼。
只要這張卡寫完，你就會從「一團霧」進到「一條排查路」。這種做法也正對齊 OpenAI 官方對 bug workflow 的要求：先有 repro、constraints、verification，再進 patch。
本章一句帶走
不要再問「到底哪個函式壞了」；先問「我現在看到的是哪一層的症狀」。

第 18 章
從每次都反問 GPT，到你自己腦中有一張穩定地圖
一、這章只講一件事
這章只講一句核心：
你真正要長出來的，不是更多答案，而是一張穩定地圖。
OpenAI 官方現在反覆強調，Codex 更像一個要被配置、被持續優化的隊友，而不是一次性助手；它在大型或高風險專案裡，最需要的是正確任務上下文、清楚的完成定義，以及可持續的規則與流程。Git 官方則把世界拆成 working tree、staging area、committed snapshots；GitHub 官方又把 deployment environments 獨立成另一層，附上 approval、branch restrictions 和 secrets。把這些官方骨架放在一起，你會看到一件事：成熟工程不是靠臨場問答撐起來的，而是靠分層、分責、分階段的穩定座標系。
所以，從「每次都反問 GPT」走到「我自己腦中有地圖」，不是從不會問變成不用問。真正的差別是：你再問時，已經不是在黑暗裡亂抓，而是在地圖上定位。你知道自己現在在哪一層，在改什麼，下一步該由誰負責。這一章就是把這張地圖，最後一次收束成你可以帶走的樣子。
--------------------------------------------------------------------------------
二、先用畫面理解
把你整本書學到的東西，壓成一張二維座標圖。
縱軸，是系統分層。 從上到下，你的預約系統有 UI、slot 規則、API、資料庫、Google Calendar 同步、部署環境。這是在回答：我現在改的是產品的哪一層。
橫軸，是變更生命週期。 從左到右，你會經過需求、任務、diff、commit、push、PR、merge、deploy、線上驗證。這是在回答：我現在的變更走到哪一關。
這張圖不是憑空發明的，而是把官方文件做成工程化整理。OpenAI 官方把焦點放在任務上下文、done 定義、validation、durable guidance；Git 官方把變更明確放在 working tree→staging→commit；GitHub 官方又把 deployment environment 和 approvals、branch restrictions、secrets 獨立出來。我現在在哪一層，對應縱軸；我現在做到哪一關，對應橫軸。這兩個座標一交叉，任何問題都比較不容易變成一團霧。
你還可以在這張圖外面，再畫一圈角色分工。
ChatGPT 幫你思考與定義任務。 Codex 幫你理解 codebase、review code、debug 問題、產生變更。 Git 幫你把變更記成可追溯的本地快照。 GitHub 幫你把本地 commits 發佈到遠端、開 PR、review、merge。 部署平台與 deployment environment 決定哪個版本真的被送去跑。 而你，負責最後的取捨與放行。OpenAI 官方把 Codex定位成能理解 codebase、review、debug、automate workflows 的 coding agent；Git 官方明確定義本地版本三狀態；GitHub 官方則把 remote collaboration、PR、deployment environments 拆成不同階段。
把這張圖直接記成一句話：
縱向看系統，橫向看變更，外圈看責任。
錨點句：你不是在記一堆工具名，而是在建立一張有座標、有角色、有流程的工程地圖。
--------------------------------------------------------------------------------
三、把名詞翻成白話
先把「穩定地圖」翻成白話。
它不是指你把所有 Git 指令背起來。 也不是指你以後都不用問 ChatGPT。 它真正的意思是：你遇到問題時，能先定位，再提問。
OpenAI 官方最佳實務說得很直白：Codex 在大型或高風險 repo 裡，最大的提效來自正確任務上下文與清楚結構；而且它更適合被當成可持續配置與改進的 teammate。這句話翻成人話就是：你每次都要重新問，不一定是因為你不夠聰明，很多時候是因為你的上下文、規則、流程都還沒被外化成穩定結構。
所以這裡有三個你要重新理解的詞。
第一個叫座標。 口語定義是：我知道問題現在落在哪一格。 例如「slot selected 樣式怪」不是一句完整診斷，它至少還要補一個座標：這比較像 UI 呈現、slot 規則、資料監聽，還是 API 寫回之後的同步延遲。這一點可以從 Firestore 的官方行為看得更清楚：onSnapshot() 先回當前快照，之後才在內容變動時更新；如果你把資料監聽和本地 UI state 混在一起，畫面就很容易長出第二套真相。
第二個叫穩定規則。 口語定義是：這些不是每次任務才想到，而是這個 repo 一直這樣做。 OpenAI 官方明寫，Codex 在做任何工作前就會讀 AGENTS.md，並把全域與專案層規則疊成 instruction chain；越靠近當前工作目錄的規則，越能覆蓋前面的廣域規則。這表示，成熟團隊不應該把所有長期規則都塞回每一次 prompt，而是讓規則先變成 always-on 的家規。
第三個叫可重用流程。 口語定義是：這類工作我不想每次從頭講。 OpenAI 官方把 skills 定義成可重用 workflow 的 authoring format，而且只在需要時才載入完整 SKILL.md；subagents 則是你明確要求時才會啟動的平行工作者，用來做 bounded、可並行的探索與分析。換句話說，真正讓你不必反覆重問的，不是更長的聊天紀錄，而是把規則做成 AGENTS.md，把流程做成 skills，把可平行的探索交給 subagents。
所以「每次都反問 GPT」這件事，本質上常常不是你理解力差。 更像是你腦中的座標還沒穩，規則還沒外化，流程還沒沉澱。 一旦這三件事開始成形，你就不會每次都從零問起，而是從某個確定的位置往前推。
--------------------------------------------------------------------------------
四、把它放回你的專案
現在回到我們固定的主案例：預約／排程系統。
先看第一個場景：slot 選取邏輯改了，selected 樣式卻怪怪的。
沒有地圖時，你很容易說：「是不是這個 className 寫錯了？」 有地圖時，你先找座標： 縱向，它落在 UI 層、slot 規則層，可能還碰到資料同步層。 橫向，它通常還在本地 diff 與驗證階段，不是 GitHub 或 deploy 問題。 這時你會先查的是：畫面到底吃哪份 state，slot 規則在哪裡判定，資料更新是靠 API response、listener，還是本地快取。Firestore 官方文件說 onSnapshot() 會先立即給你當前快照，之後內容變更再更新；交易與批次寫入又提供了原子操作，讓你能把互相關聯的讀寫作為同一個成功／失敗單位。這些都在提醒你：slot 看起來怪，常常不是樣式單點事故，而是規則、資料、呈現沒有對齊。
再看第二個場景：本地改好了，GitHub 上看不到。
沒有地圖時，你會覺得 GitHub 怪怪的。 有地圖時，你一眼就知道這不是產品層問題，而是生命週期橫軸的問題。 Git 官方把 committed 定義成資料已安全存到本地資料庫；GitHub 官方則明說 git push 是把本地 branch 上的 commits 推到 remote repository，而 PR 是提議把變更合進主線的協作機制。 所以這個問題的白話答案就是：你可能只走到 commit，還沒走到 push；或你只更新了 feature branch，還沒走到 PR / merge。
第三個場景：GitHub 已同步，但線上環境還沒變。
沒有地圖時，你會繼續改 code。 有地圖時，你會先把座標挪到最右邊：這已經不是單純的 GitHub 同步問題，而是 deployment environment 問題。GitHub 官方明寫，environment 可以要求 approval、限制哪些 branches 能觸發部署、掛 deployment protection rules、限制 secrets；而且 referencing 某個 environment 的 job，必須先通過那些規則，之後才能真正執行並取得該 environment 的 secrets。 所以這種情況常常不是 code 還沒寫好，而是：線上那一關根本還沒放行。
第四個場景：API route 寫了，但 Google Calendar 沒建立事件。
沒有地圖時，你只會追著 createCalendarEvent() 跑。 有地圖時，你先把縱向座標定到「外部同步層」。 你會先問：這是 payload 問題、scope 問題、calendarId 問題、還是外部權限與環境問題？Google Calendar 官方建立事件文件明寫，要呼叫 events.insert()，event 至少要有 start 和 end，而 OAuth 2.0 scope 又決定了你的 app 到底被授予哪些能力。 所以這時候你腦中會自然長出一個排查順序：先確認 API 真的走到同步；再看 request payload；再看 OAuth scope；再看外部資源與環境設定。 這時你不再只是盯著單一函式，而是在地圖上往下一格一格排。
第五個場景：Firestore 有資料，但 UI 顯示不對。
沒有地圖時，你會在「資料有了」和「畫面不對」之間陷入情緒。 有地圖時，你知道這代表資料層和畫面層的真相尚未對齊。Firestore 官方說它是用來 store and sync client- and server-side data 的；listener 會先送當前快照，再在內容變動時更新。這意味著你真正要查的，常常是 query、listener、欄位映射、pending writes，或者畫面有沒有混用本地狀態與資料層真相，而不是只盯著「資料庫裡有沒有那筆文件」。
你會發現，一旦這張圖成形，很多過去像迷霧的問題，會變成一句很務實的座標題：
這是縱向哪一層的事故？ 這是橫向哪一關卡住？
只要這兩句先答出來，你後面問 ChatGPT 或指揮 Codex 的品質，就會直接上升。
--------------------------------------------------------------------------------
五、把它放回 Codex 工作流
這張穩定地圖，最終會改變你和 Codex 合作的方式。
OpenAI 官方 workflows 明說，Codex 最適合被當成一個有 explicit context 和 clear definition of done 的 teammate；每個 workflow 都會把 surface、步驟、context notes 和 verification 一起交代清楚。換句話說，你不是在對 Codex 丟一個模糊問題，而是在把某個座標點，翻成一張工程任務單。
所以你之後不再只是問：
「幫我修好預約系統。」
你會先用 ChatGPT 把任務定成座標。 例如：「這次是 UI 與 slot 規則對齊問題，不碰 API shape，不碰 Firestore schema；先讀 BookingGrid.tsx 和 slotRules.ts，先重現，再做最小 patch，最後跑最小驗證。」 這正是 OpenAI 官方建議的姿勢：先給 right task context，再給 constraints、done 定義和 verification。
然後，Codex 才真正出場。 官方首頁把 Codex 的核心角色寫得很清楚：它能理解陌生 codebase、review code、debug and fix problems、automate repetitive development tasks。對你來說，這代表它最強的地方不是「永遠直接產生答案」，而是幫你在正確座標上加速閱讀、加速收斂、加速驗證。
當變更開始長出來時，穩定地圖又會在 review 階段救你一次。 OpenAI 官方的 review pane 文件寫得很直接：review pane 看的不是「Codex 改了什麼」，而是「整個 Git repository 現在差了什麼」；你可以看 uncommitted changes、all branch changes、last turn changes，也可以在單一行留 inline comments，對整份 diff、單一檔案、單一 hunk 做 stage、unstage、revert。這正好對應我們前面說的：地圖不是讓你記得所有細節，而是讓你知道先看哪個視角、先收哪一塊差異。
而當你發現某類問題一再重複，例如你每次都要重新解釋「Google Calendar 沒建立事件時，要先查 API 路徑、payload、scope、calendar access、env」，那就不是再多開一條 thread 的問題了。OpenAI 官方最佳實務明寫，重複的工作應該變成 durable guidance、skills、甚至 stable workflows 的 automations。AGENTS.md 先把 repo 的固定規則沉澱下來；skills 再把固定流程封成按需載入的 SOP；subagents 則把高度平行的探索拆出去。 也就是說，當你腦中地圖穩了，你不會問得更辛苦，你反而會越問越少、越準、越有結構。
--------------------------------------------------------------------------------
六、這一章最容易誤解的地方
第一個誤解是：
我每次都要再問一次，代表我其實沒懂。
不一定。 OpenAI 官方反而一直在提醒，正確上下文、明確結構、可持續規則，會顯著提高 Codex 在大型或高風險 repo 裡的可靠性。這表示很多反覆提問，不是你笨，而是你還沒把地圖、家規、流程外化；問題不在智力，而在結構。
第二個誤解是：
只要我把 Git 指令背熟，我就不會再糊。
不是。 Git 官方的 working tree、staging、commit 模型很重要，但它只處理「本地版本如何被記錄」這一條軸。GitHub 的 remote collaboration、PR、deployment environment 又是另一條軸。也就是說，Git 指令是骨架的一部分，不是整張地圖。
第三個誤解是：
我和 Codex 聊越久，它就越懂我。
不完全對。 真正會長期穩定生效的，不是單純拉長 thread，而是把 repo 的固定規則放進 AGENTS.md，把重複工作變成 skills，把可平行的 bounded work 交給 subagents。聊天長度可以保留局部上下文，但 durable guidance 和 reusable workflow 才是你之後不用一直重講的核心。
第四個誤解是：
只要 Codex 很強，我就可以不必先定位。
不是。 官方 workflows 的結構剛好反過來：先交代 context、surface、步驟、verification，再讓 Codex 動手。換句話說，工具越強，越值得先定位；不定位，強工具只會更快地在錯層長出更多變更。
--------------------------------------------------------------------------------
七、能力邊界
這一章的能力邊界，要用「地圖穩不穩」來看，而不是只看「它會不會寫 code」。
第一層：可以放心交給 Codex 主做、人做 review 的事。 像是先 explain codebase、把 BookingGrid.tsx → slotRules.ts → route.ts → calendarSync.ts 的流程講清楚、把 bug 重現步驟寫清楚、做小範圍高信心 patch、補最小回歸測試、草擬 commit message、整理 PR 說明、在 review pane 裡按 hunk 細切收斂。OpenAI 官方對 Codex 的定位本來就包括理解 codebase、review、debug / fix、automate repetitive tasks；review pane 也正是為了幫你看清差異、給 targeted feedback、決定留下什麼。
第二層：Codex 可以協助，但人必須主導決策的事。 像是 slot 可預約性的唯一真相要放哪一層、booking 與 slot 佔用是否要同一個 atomic operation、Google Calendar 失敗時到底 rollback booking 還是保留 sync_status = failed、這次 PR 要切成幾條、什麼時候從 Draft 轉 Ready、哪一段重複工作值得升級成 skill。這些都不是單純生成問題，而是產品、架構、歷史與流程治理。Firestone 的原子操作、GitHub 的 PR review、OpenAI 的 skills / AGENTS / workflows，都在支持這種「代理協助、人主導」的分工。
第三層：不該讓 Codex 自行決定或自動執行的事。 像是 production deploy、environment approvals、production secrets、真實外部服務放行、不可逆資料修正、法規與資安判斷、商業責任邊界。GitHub 官方把 deployment environments、approvals、branch restrictions、environment secrets 做成獨立守門點，本身就在提醒你：這些不是「可以再順手讓代理按掉」的小事，而是要有人站在最後那一道門口。
所以這一章真正要你帶走的邊界感，是這一句：
Codex 可以幫你在地圖上跑得很快，但地圖怎麼畫、哪一格可以過、哪一格不能放行，還是你在決定。
--------------------------------------------------------------------------------
八、一句帶走
你不是離開 GPT 就會糊掉；你只是以前還沒有把問題放進座標。當你有了穩定地圖，你問的每一句話都會更準，做的每一步也會更穩。
--------------------------------------------------------------------------------
本章記憶點
真正讓你不必每次從零問起的，不是更多答案，而是更穩的座標、規則與流程。
縱向看系統層，橫向看變更生命週期，外圈看責任分工；任何問題都可以先放進這張圖。
AI 負責產生變更，Git 負責記錄變更，GitHub 負責同步變更，我負責決定變更。這四句不是口號，而是你不再迷路的定位器。
本章最小實戰動作
現在就拿你最近最常反覆問 GPT 的那個問題，例如「為什麼 Calendar 沒建事件」或「為什麼 selected 樣式又怪了」，不要先問工具。先拿紙寫三列：
第一列寫縱向座標：UI、slot 規則、API、資料庫、Google Calendar、Deploy。 第二列寫橫向座標：需求、diff、commit、push、PR、merge、deploy、線上驗證。 第三列寫責任人：ChatGPT、Codex、Git、GitHub、部署平台、我。
然後把那個問題硬塞進其中一格，再寫一句：「我接下來先看哪個證據？」只要這一步做出來，你就已經不是在求答案，而是在用地圖導航。這個動作也正對齊 OpenAI 官方強調的 task context、clear done、verification，以及 Git / GitHub 對版本與部署分層的官方模型。
本章一句帶走
我不是在學一堆工具。我是在建立一套 AI 工程操作系統。 ChatGPT 幫我思考，Codex 幫我執行，Git 幫我記錄，GitHub 幫我同步，部署平台幫我交付。 我真正要學會的，不是按哪個按鈕，而是知道自己現在在哪一層、在改什麼、要由誰負責。

附錄 A　全書術語白話字典
這份字典只做一件事：把全書反覆出現的術語，壓成你聽一次就能在腦中叫出來的白話。Git 的詞以 Git 官方與 GitHub 官方定義為骨架；Codex 的詞以 OpenAI 官方產品文件為準；專案案例裡涉及 Firestore、Google Calendar、OAuth 的字，則以 Google 官方文件對齊。
A.1 角色與工作表面
ChatGPT：對話式思考台，適合拿來釐清需求、比較方案、探索想法、整理脈絡。Codex：OpenAI 的 coding agent，本質是能讀、改、跑程式碼的工程代理。Codex App：桌面總控台，主打平行 threads、worktrees、automations 與內建 Git。Codex CLI：終端機裡的本地代理，直接在你選定的資料夾讀 repo、改檔、跑命令。Codex IDE extension：貼在編輯器裡的同一個 agent，和 CLI 共用 agent 與設定。Codex Cloud：遠端背景工地，讓 Codex 在自己的雲端環境裡平行做事；它是任務執行位置，不是你的 production 環境。
A.2 Codex 工作空間與治理
Thread：一條工作線；官方定義是一個 session，也就是你的 prompt 加上後續模型輸出與 tool calls。Session：你當下打開、延續、或恢復中的那次工作會話；在實務上，你可以把它理解成「正在使用中的 thread」。Local：你的前景主桌，也就是平常就在用的那份本地 checkout。Worktree：同一個 Git repo 的另一份 checkout，是背景副桌，不是另一個 repo。Handoff：把同一條 thread 在 Local 與 Worktree 之間安全搬動，不是 commit，也不是 push。
Review pane：Codex App 裡的本地審稿桌，看的不是「只有 Codex 改了什麼」，而是整個 Git repository 目前的差異。Inline comments：直接貼在某一行 diff 旁邊的精準回饋。AGENTS.md：Codex 開工前會先讀的家規，支援全域與專案層級疊加。Skill：按需載入的 SOP，把 instructions、resources 和可選腳本打包成可重用 workflow。Subagent：你明確要求時才會啟動的平行工作者，適合 bounded、可並行的探索與分析。Automation：在 Codex App 背景排程跑的固定工作，建立在已穩定的手動流程上。
Approval policy：Codex 什麼時候必須先停下來問你。Sandbox mode：Codex 技術上碰得到哪裡，例如只能讀、只能在工作區內寫，或完全拆掉圍欄。Network access：shell 命令與工具能不能真的出網。Full Access：高風險模式；本質上是把 sandbox 與 approval 的保護大幅放寬，不是把責任轉給代理。
A.3 Git 與 GitHub 的本地骨架
Repository／repo：裝著程式碼與版本歷史的盒子。Local：你電腦上的那份 repo 現場。Working tree：你眼前正在改的檔案。Staging area／Index：下一次 commit 的候選清單。Commit：把 index 當下內容記成一個新的本地版本點。Commit history：一條由 commits 串起來、可回頭查的版本鏈。Diff：兩個狀態之間的差異。
Branch：一條開發線；Git 官方說它是 line of development，branch head 會隨新 commits 往前移。HEAD：你現在腳踩在哪條 branch 或哪個 commit 上。Checkout：老字；既可能切 branch，也可能把檔案還原成某個版本。Switch：比較乾淨的新動詞，專門把你移到另一條 branch，並更新 working tree 和 index。Git worktree：同一個 repository 的另一個 linked checkout，共享大部分 Git metadata，但有自己的 HEAD、index 等 per-worktree 狀態。
Remote：你正在追蹤的另一個 repository。Origin：clone 時預設給第一個 remote 的名字，不是宇宙主線。Remote-tracking branch：像 origin/main 這種本地書籤，用來記你上次看到遠端 branch 在哪裡。Fetch：把遠端 refs 抓回本地，先更新遠端書籤，不直接動你手上的 branch。Pull：先 fetch，再把抓回來的遠端線整合進你目前 branch。Push：把你本地 branch 上的 commits 送到遠端。
A.4 GitHub 的共享世界與版本救援
Pull Request／PR：提議把某條 branch 的變更合進另一條 branch 的申請，不是 merge 本身。Draft PR：先攤出來給人看，但還不能 merge 的 PR。Protected branch：受規則保護的分支，可要求 approving reviews、passing status checks、線性歷史，或禁止 force push。Deployment environment：像 staging、production 這種真正部署的目標環境，可掛 approvals、branch restrictions 與 environment secrets。
Conflict：兩股變更撞在同一處，Git 不知道該替你留哪個版本，所以停下來等你決定。Restore：把檔案或 index 還原成某個來源版本，不移動 branch。Reset：改變 HEAD 或 staged 狀態；--hard 會連 working tree 一起覆寫。Revert：新增一個反向 commit，去抵銷某個舊 commit 的效果，不重寫共享歷史。Rollback：白話總稱；可能用 restore、reset、revert 或部署層回退來完成。Reflog：本地黑盒子，記錄 refs 曾經指到哪裡。
A.5 專案案例常用字
slot：可預約時段。booking／appointment：預約資料本身；在產品語意上，booking 比較偏「建立預約這個動作」，appointment 比較偏「那筆已存在的預約」。route.ts：在本書案例裡，用來代表 API route handler 的伺服器入口檔。Token：拿去呼叫外部 API 的通行證。Scope：這張通行證被授權能做的事情範圍。env：環境設定與祕密值的載入位置，不等於 repo 裡的普通程式碼檔。onSnapshot：Firestore 的即時監聽器，第一次會先給目前快照，之後資料變更再推更新。Transaction：要嘛全成、要嘛全不成的一組資料操作。
--------------------------------------------------------------------------------
附錄 B　每天開工前、中、後的 AI 工程工作流檢查表
這份檢查表，是把 OpenAI 官方對 task context、validation、Git checkpoints、thread 管理與 review 的建議，加上 Git / GitHub 對本地記錄、遠端同步、PR 與部署環境守門的分層，壓成你每天能照著走的最小節奏。
B.1 開工前
開工前，你只做三件大事：先定位、再開線、最後才下任務。這一段最容易救你，因為它能把「今天到底在做什麼」先釘住。官方文件對這段的精神很一致：先把任務上下文講清楚，再選對工作表面，再用 Git checkpoints 保留回頭路。
一，先寫今天的座標。 先回答三句：我現在在哪一層？我現在在改什麼？誰負責記錄、同步、驗證與上線？
二，打開 repo 先做三看。 先看 git status；再看 git log --oneline --decorate --graph --all；再做 git fetch origin，先更新你對遠端的認知。
三，決定今天的工作線。 這件事要放同一條 thread，還是要 fork？要住 Local，還是 Worktree？
四，選工位。 要在 App 管多條線？在 CLI 進 repo 現場？在 IDE 貼著檔案改？還是把長任務丟 Cloud 背景跑？
五，讀規則。 先看 AGENTS.md；如果這類工作已有 skill，就直接用 skill，不要再重打一大段 prompt。
六，檢查權限。 這次需要出網嗎？需要碰 repo 外嗎？需要 secrets 嗎？如果答案接近外部資源或不可逆風險，就先縮回比較保守的 sandbox 與 approval。
七，最後才寫任務單。 至少把目標、上下文、限制、完成條件、驗證方式寫出來。
B.2 進行中
進行中最重要的，不是一直叫 Codex 再做一點，而是讓它一直待在你畫好的邊界裡。OpenAI 官方建議一條 thread 只承載一個 coherent unit of work，並反覆強調 verification、line-level feedback 與 review pane 的收斂價值；Git 官方又清楚把 working tree、index、commit 分成不同狀態。這些東西合起來，就是一條很穩的中段節奏。
一，先重現，再修。 先讓問題變成可重播，不要先靠感覺改。
二，一次只收斂一件事。 如果 slot UI 和 Calendar 同步已經分岔，就不要硬塞同一條 thread。
三，小步驟前進。 改一小段、看一小次 diff、跑一小次驗證。
四，review 先於 commit。 先看 review pane；必要時留 inline comments；不要一上來就 Stage all。
五，只 stage 你真心要主張的東西。 同一個檔案可以同時有 staged 和 unstaged 內容，這是正常的，不要怕切細。
六，每做完一層，就在那一層驗。 UI 問題先驗畫面與互動；API 問題先驗 request / response；資料問題先驗 listener、query、transaction；外部同步先看 HTTP status、reason、scope、權限。
七，遇到重複摩擦就外化。 同樣錯兩次，更新 AGENTS.md；同樣 prompt 用三次，做成 skill。
八，遇到 side effect 就慢下來。 只要牽涉 production secrets、真實資料、部署放行、權限設定，就不要讓代理自己拍板。
B.3 收工後
收工後不要只問「有沒有改完」。要問「這批變更現在走到哪一關」。Git 官方把 commit 定義成本地版本點；GitHub 官方把 push、PR、protected branch、deployment environment 各自拆成不同階段。收工真正要做的，就是把這些階段說清楚。
一，跑最小但夠用的驗證。 至少跑這次直接相關的 lint、測試、重現步驟或手動驗證。
二，把變更切成乾淨 commit。 commit message 要能回答：這一張快照到底主張什麼。
三，push 到正確 branch。 不是所有東西都該直奔主線；多數情況先 push 到功能分支。
四，決定 PR 形態。 還在做就開 Draft PR；真的 ready 再轉正式 review。
五，明講完成度。 你今天是做到 diff 完成、commit 完成、push 完成、PR 完成、merge 完成，還是 deploy 完成？不要再用一句「我做完了」把層次抹平。
六，記下未完成風險。 像 token 還沒驗、environment secret 還沒補、deployment approval 還沒過，這些都應該被寫出來，不要留在腦內。
--------------------------------------------------------------------------------
附錄 C　Codex 能做、半能做、不能交給它做的決策矩陣
這份矩陣不是產品功能表，而是依 OpenAI 官方對 Codex 能力、review / Git 工作流、approvals / sandboxing / network controls 的設計，再加上 GitHub 對 protected branches、deployment environments、approvals 與 secrets 的守門邏輯，整理出的實務分級。它在回答的不是「它會不會」，而是「這件事該不該讓它主做、協助，或根本不能代決」。
C.1 第一層：可以放心交給 Codex 主做，你做 review
這一層有一個共同特徵：範圍明確、回頭檢查成本低、做錯了通常容易回滾。
改 UI：局部畫面、文案、loading / error state、selected / disabled 呈現、表單互動這類，通常可以讓 Codex 主做，你 review diff。 寫測試：補單元測試、最小回歸測試、失敗案例測試，通常非常適合。 補文件：README、操作步驟、PR 說明、變更摘要。 局部重構：函式切小、型別整理、同檔案內重複邏輯抽出。 解釋 codebase：trace 資料流、整理 request / response flow、列出可疑失敗點。 草擬 commit message / PR description：特別適合讓它先起草，你再修成你要的語氣。 在功能分支上 commit、push、開 Draft PR：當邊界清楚、保護規則沒有被繞過時，這些都可以當作加速器。OpenAI 官方已明確把 commit、push、create pull requests 放進 App 內建 Git 工作流。
C.2 第二層：Codex 可以協助，但人必須主導決策
這一層的共同特徵，是它牽涉產品語意、架構邊界、歷史邊界或風險取捨。
改 API：如果只是小範圍 handler 修補，常可接近第一層；但只要牽涉 API 契約、欄位語意、錯誤處理策略、人就必須拍板。 重構跨模組邏輯：一旦跨 UI、API、資料模型，就不只是「整理 code」，而是重新定義相依關係。 改 slot 規則：這常是業務規則，不只是技術實作。 commit 邊界、PR 邊界：Codex 可以幫你切 diff，但哪幾塊應該成為同一個 commit、同一個 PR，最後是你在定義歷史。 push 到共享分支、正式開 PR、決定何時 merge：這些都已進共享治理層，不只是本地操作。 schema migration 設計：Codex 可以幫你草擬 migration 與驗證步驟，但是否改 schema、如何 rollout、怎麼回滾，要由人主導。 token / env 設計：它可以幫你整理載入點、檢查缺漏、設計 fallback，但哪些變數該存在、怎麼注入、怎麼隔離 staging / production，是人的責任。 Automations 上線前評估：Codex 可以幫你把流程自動化，但是否穩定到可 schedule、是否該跑在 Local 或 Worktree、頻率多高，應由人拍板。OpenAI 官方對 skills、subagents、automations、AGENTS.md 的定位，本來就是「幫你把流程外化」，不是讓它自行定義治理。
C.3 第三層：不該讓 Codex 自行決定或自動執行
這一層不是因為 Codex 完全不懂，而是因為它們的後果超過「一個 diff 對不對」。
Production secrets：不能讓代理自己決定怎麼處理、如何暴露、何時注入。 真實資料庫危險操作：大規模刪改、補資料、不可逆 migration、手術式修正。 正式發版 / Deploy：尤其有 required reviewers、environment approvals、branch restrictions 的情況。 權限設定：GitHub branch protection、deployment environment policy、OAuth scopes、Calendar access、IAM 與 Security Rules 的最終放行。 法規、資安、商業決策：是否合規、是否接受風險、是否改產品承諾，這些不屬於代理應自行決定的範圍。 Force push 改寫共享歷史：即使工具做得到，也不應讓代理自動判斷何時該做。OpenAI 官方對 full access、danger-full-access、force push 類選項都明示要謹慎；GitHub 對 protected branches 與 deployment environments 也明確設了守門點，這些設計本身就在告訴你：越靠近共享歷史、真實環境、敏感權限，越應該由人站在最後一道門。
一句總結這個矩陣
第一層是「可回看、可回滾、可局部驗收」；第二層是「可協作，但要由人定義方向」；第三層是「後果超過程式碼本身，所以不能把放行責任外包」。
--------------------------------------------------------------------------------
附錄 D　最小但完整的 Git / GitHub / Codex 指令與操作語彙表
這份附錄只保留你每天最值得熟到像反射的那一批命令與操作。Git 官方把版本世界拆成 working tree、index、commit、branch、remote、fetch、pull、push；GitHub 官方再加上 PR、protected branches 與 deployment environments；OpenAI 官方則把 Codex 的 review、worktrees、/review、/resume、/fork、permissions 放進不同表面。這裡不求大全，只求一拿就能上手。
D.1 定位你現在在哪裡
git status：看 working tree 和 staging area 現在是乾淨、已暫存、未暫存，還是有衝突。 git log --oneline --decorate --graph --all：看 commit history、branch、HEAD、remote-tracking branches 的形狀。 git diff：看 working tree 相對 index 的差異。 git diff --staged：看 staging area 相對 HEAD 的差異，也就是下一次 commit 會送進歷史的內容。
D.2 開一條新的工作線
git switch -c feature/slot-rules-sync：建立並切到新 branch。 git switch main：切回主線。 git checkout ...：老字；既能切 branch，也能拿來還原檔案，所以能懂它，但日常更建議用 switch 和 restore 分工。 git worktree add ../proj-slot-fix feature/slot-rules-sync：開一份新的 linked worktree，在另一個目錄平行工作。
D.3 把很多差異收成乾淨 commit
git add -p：只把部分 hunks 放進 staging area。 git add <file>：把某個檔案目前內容放進 index。 git commit -m "fix slot selected state sync"：用 index 內容建立新 commit，branch 會往前指向它。 在 Codex App 裡對應的操作是：進 review pane，看 diff，先留 inline comments，再 stage 某個 chunk 或整個檔案，最後 commit。
D.4 把本地歷史送去共享世界
git fetch origin：更新遠端書籤，例如 origin/main。 git pull --rebase：先 fetch，再把你目前 branch 上的 commits 重新套到最新 upstream 上。 git pull：先 fetch，再整合；整合方式可能受設定影響。 git push -u origin feature/slot-rules-sync：把本地功能分支推到遠端，並建立 upstream 關聯。 Create pull request：在 GitHub 或 Codex App 裡，對某條遠端 branch 提出「請合進 base branch」的申請。 Draft pull request：先提案、先討論，但還不能 merge。
D.5 合併、回退與救援
git merge origin/main：把最新主線整合進你目前 branch。 git rebase origin/main：把你目前 branch 的 commits 重新套到最新主線上。 git restore --staged <file>：把檔案從 staging 拿掉，但保留 working tree 內容。 git restore <file>：把 working tree 裡這個檔案還原。 git reset：調整 HEAD 或 staged 狀態；--hard 要非常小心。 git revert <commit>：新增一個反向 commit，撤回某個已在歷史裡的錯誤。 git reflog：看黑盒子，找回你剛剛 branch / HEAD 走過哪些位置。
D.6 GitHub 共享治理的最小語彙
Approve：PR reviewer 認為這批變更可以往前走。 Request changes：PR reviewer 認為這批變更還不能往前走。 Protected branch：主線或關鍵分支的守門規則。 Deployment environment：真正要部署到哪個環境，以及這個環境要先過哪些保護規則。 Environment secret：只在指定 environment 的 jobs 可用的祕密值；和 repository secret 不是同一層。
D.7 Codex 最值得先熟的操作語彙
Review pane：看差異、留 inline comments、stage / revert。 Handoff：把 thread 在 Local 與 Worktree 間搬動。 /review：在 CLI 啟動 reviewer，看 diff、回報風險，不直接碰 working tree。 codex resume：接回上一條工作線。 codex fork：保留原 thread，另開一條新線。 /permissions 或對應的權限選單：調整 sandbox、approval、network 等行為邊界。 Git checkpoints：每個 task 前後先留版本點，讓自己收得回來。
--------------------------------------------------------------------------------
附錄 E　當架構模糊時，你應該先問自己的 12 個問題
這 12 題，是把 OpenAI 官方對「明確 task context、clear done、verification、durable guidance」的建議，加上 Git / GitHub 對本地版本、遠端同步、PR、部署環境的分層，整理成一份可以在腦中直接拿來定位的自問清單。當你先問完這 12 題，你對 ChatGPT 與 Codex 下的每一個任務，品質都會明顯升一級。
E.1 先把問題放進座標
第一題：我現在在哪一層？ 是 UI、slot 規則、API、資料庫、Google Calendar，還是 Deploy？
第二題：我現在看到的是症狀，還是根因？ 畫面亮錯，不一定是 CSS；Calendar 沒建事件，不一定是同步函式；先分清螢幕上的現象和背後哪一層真的先壞。
第三題：這次改動的唯一真相應該在哪裡？ selected 狀態、availability 規則、booking 狀態，到底該以哪一層為準？
第四題：我現在需要的是 explain、plan、fix，還是 review？ 不要每次都一上來就 patch；有些事先 trace flow 才對。
E.2 再把變更放進生命週期
第五題：這件事現在卡在需求、diff、commit、push、PR、merge，還是 deploy？ 你不先回答這題，就很容易把「本地改好了」誤當成「GitHub 已更新」，再把「GitHub 已更新」誤當成「線上已上線」。
第六題：我現在要記錄的是一件事，還是兩件事？ 這一批改動應該是一個 commit，還是兩個乾淨 commit？
第七題：這次應該先開 Draft PR，還是已經 Ready for review？ 還沒驗完，不要假裝 ready。
第八題：如果今天要回頭，最小安全點在哪裡？ 我的 Git checkpoint 在哪？reflog 找不找得到？這次是該 restore、reset，還是 revert？
E.3 最後把責任放回人身上
第九題：這件事可以放心交給 Codex 主做嗎？ 還是只能讓它協助，最後方向一定要我定？
第十題：這次如果做錯，代價是可逆還是不可逆？ UI 小修和 production secret 洩漏，不在同一個等級。
第十一題：這次需要哪些外部條件？ 需要 token、scope、calendar access、environment secret、deployment approval 嗎？如果需要，哪些不是代理該自己決定的？
第十二題：這個摩擦是一次性的，還是已經值得外化？ 如果我已經連續兩次重講同一規則，它該不該進 AGENTS.md？如果我已經反覆用同一個排查流程，它該不該升級成 skill？如果它手動已經很穩，它該不該變成 automation？
E.4 這 12 題最實用的用法
最好的用法，不是把 12 題背起來，而是在你要問 ChatGPT、要交任務給 Codex、要開 PR、要按 deploy 之前，先停三十秒，把自己卡住的點硬塞進這 12 題裡。只要你做得到這一步，你就會明顯感覺到：你問的問題更準，review 的焦點更清楚，commit 邊界更乾淨，什麼該讓代理主做、什麼不該放手，也會更自然。這其實就是 OpenAI 官方一直在說的那件事：把 Codex 當作可配置、可持續優化的 teammate，而不是一次性幫手。
--------------------------------------------------------------------------------
收束
到這裡，整本書真的收完了。
你可以把它最後壓成這三句：
先分層。 再分階段。 最後分責任。
然後把全書只留下這段，放進腦中反覆播：
我不是在學一堆工具。 我是在建立一套 AI 工程操作系統。 ChatGPT 幫我思考，Codex 幫我執行，Git 幫我記錄，GitHub 幫我同步，部署平台幫我交付。 我真正要學會的，不是按哪個按鈕，而是知道自己現在在哪一層、在改什麼、要由誰負責。