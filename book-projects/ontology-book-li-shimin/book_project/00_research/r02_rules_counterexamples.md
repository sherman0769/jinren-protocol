# R-02｜規則分層反例與逐步核對

版本 1.0｜查閱及推導：2026-09-28｜用途：第 5–8 章及技術附錄的證據底稿。

結論：必要來源及三組反例已完成**代理逐步語意演繹與案例核對**。未執行 OWL 推理器或 SHACL 驗證器；沒有真實報名／退款端點測試。這三層證據必須在章稿和附錄延續標示，不可簡寫為「引擎實測通過」。

## 來源與讀取深度

R04：[OWL 2 Primer 第二版](https://www.w3.org/TR/2012/REC-owl2-primer-20121211/)，2012-12-11；重新讀 §2、§4.6–4.8，補讀 §5.3 的最大／最小／精確基數及有無限定類別的差異。Primer 是 informative；以同套標準的 [OWL 2 Direct Semantics](https://www.w3.org/TR/2012/REC-owl2-direct-semantics-20121211/) §2.2.3 表 4、§2.3.1 表 5、§2.3.6 表 10、§2.4–2.5 核對本次精確基數與同一性推導。只查相關公式，未宣稱整份語意規範精讀。

R05：[SHACL 固定版](https://www.w3.org/TR/2017/REC-shacl-20170720/)，2017-07-20 Recommendation；讀 §1.5、§2.1.2–2.1.3.2、§3–3.6.1、§4.1.1–4.1.3、§4.2、§4.3.2 的相關定義。重點是 focus node／target、資料圖／形狀圖、minCount／maxCount／datatype、驗證報告與處理失敗的差別。本次不使用 SHACL-SPARQL、自訂函式、遞迴或擴充規則。

本機檢查：當前 Python 找不到 rdflib、pyshacl、owlrl；未安裝依賴。以標準語意列出可重算步驟，足以完成本研究任務允許的非引擎推導路徑。以後若使用引擎，需另記引擎／版本／設定及原始報告，不能回填為本次已測。

## 共同設定與適用邊界

下列 E900、E901、S901、S902 是**獨立反例用的新名字**，不屬 SNAP-001，不追加至 example_data.json。前兩組只比較一項報名到班別關係，不冒充完整企業模型。

OWL 使用以下公理片段，前綴 `ex:` 指向本書自設教學名稱；正式語法的外層 Ontology／宣告在真正執行檔中才需補齊，此處是可核對的公理片段：

```text
SubClassOf(ex:Enrollment ObjectExactCardinality(1 ex:session))
ObjectPropertyRange(ex:session ex:Session)
```

這裡刻意採**未限定類別的精確基數**：對每筆 Enrollment，只允許恰好一個 session 關係對象，另以 range 說明其為 Session。若改用只計算 Session 的限定基數，別的類別對象如何處理便可能不同；不得省略這項差別。

兩組相應 SHACL 形狀的完整 Turtle 片段如下。資料圖只取各組寫出的陳述；不預先作 OWL 推理、不合併不同 IRI、不加入外部資料、不從邏輯存在要求生成新連結。使用明確 targetNode，避免把漏掉 class 標記而未成為 target 的情況誤認為資料合格。

```turtle
@prefix ex: <https://example.org/ontology-book/r02/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .

ex:OneSessionShape a sh:NodeShape ;
    sh:targetNode ex:E900, ex:E901 ;
    sh:property [
        sh:path ex:session ;
        sh:minCount 1 ;
        sh:maxCount 1
    ] .
```

這個形狀只管關係值的數量，沒有假裝同時查核身分、付款、班別真實存在與使用權限。逐組核對時只保留當組的 targetNode；若一次驗證合併資料，兩個 target 都會被檢查，不能忘記不存在於其中一組的另一個 target 也可能產生結果。

## 組 A：知道必須有班別，卻沒提供哪一班

資料只有：

```turtle
@prefix ex: <https://example.org/ontology-book/r02/> .
ex:E900 a ex:Enrollment .
```

OWL 演繹：因為 E900 是 Enrollment，公理要求它有恰好一個 session 對象。構造一個解釋：E900 對應 e，另有沒有在資料中命名的對象 s；Enrollment 的成員為 e、Session 的成員為 s，session 關係只有 (e,s)。這滿足所有已列前提，因此這組前提可一致。沒有顯式班別連結，不會單獨使它不一致；但也不能由此回答具體班別編號。

SHACL 手算：只驗證 E900 時，資料圖中沿 session 路徑的值集合為空，數量 0 小於 minCount 1，故應有 MinCountConstraintComponent 違規；maxCount 1 不違規。形狀不會因 OWL 的存在要求就自行編造一筆班別資料。

業務後果：若查詢需要確定班別以計算名額，應回報缺班別，不將它猜成 S101。操作層若以「已有完整班別資料」作必要條件，還必須自行拒絕或轉人工。OWL 的一致性結果不等於這筆資料已可用。

## 組 B：兩個班別名字，與兩個不同班別，不是一回事

資料：

```turtle
@prefix ex: <https://example.org/ontology-book/r02/> .
ex:E901 a ex:Enrollment ; ex:session ex:S901, ex:S902 .
ex:S901 a ex:Session .
ex:S902 a ex:Session .
```

OWL 演繹：精確基數 1，加上兩個 session 陳述，要求兩個名字指向同一個對象。可令 S901、S902 都對應 s，session 關係集合仍只有 (e,s)，因而前提可一致，並蘊含兩名字所指個體同一。這不表示工具查證了現實中真的是同一班。

反事實變體：再加入 `DifferentIndividuals(ex:S901 ex:S902)`。現在兩者被要求不同，session 後繼至少為 2，與精確基數 1 衝突；這組前提不一致。這個否定結論來自「最多 1」與「至少 2 個不同對象」不能同時成立，並非只列舉少數解釋而猜測沒有模型。

SHACL 手算：在原始資料圖、未做身分正規化的設定下，沿 session 有 S901、S902 兩個不同 RDF 項，數量 2 大於 maxCount 1，故 MaxCountConstraintComponent 違規；minCount 不違規。就算另外記下 sameAs，不能含糊宣稱所有 SHACL 處理器會自動把兩個值折成一個。若前處理改成單一標準 IRI，那是不同輸入，必須另留紀錄。

業務後果：不能為了讓模型通過就把固定案例 S101／S102 合併。本組新名字是獨立假例；真實對象是否相同要有身分證據。反例說明 OWL 名稱語意和既有資料識別規則需要明確對接。

## 組 C：資料符合條件，仍沒有執行授權

只取固定案例 S101 容量 3 的一項資料，用於以下另外設定的驗證條件；不是宣稱已把整份案例轉成 RDF。

```turtle
@prefix ex: <https://example.org/ontology-book/r02/> .
ex:S101 ex:capacity 3 .
```

形狀只要求容量恰有一個整數且不小於零：

```turtle
@prefix ex: <https://example.org/ontology-book/r02/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
ex:CapacityShape a sh:NodeShape ;
    sh:targetNode ex:S101 ;
    sh:property [
        sh:path ex:capacity ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:integer ; sh:minInclusive 0
    ] .
```

SHACL 手算：容量值集合只有整數 3，數量 1、型別及數值條件皆滿足；就這個形狀應無違規。反例變體若寫字串 `"3"`，字串的 datatype 不合 xsd:integer，不能只因文字看起來像數字就當通過。這是預期結果，沒有引擎實際報告。

業務規則另外核對：POL-001 只有 confirmed 佔位。S101 的 E001、E002 是 confirmed，E003 候補與 E005 取消不佔位，故快照剩餘 3−2＝1。容量形狀本身沒有計算這個答案，也沒有防止多位使用者同時搶最後一席。真正提交仍需執行時檢查與合適的並行控制，第 12 章再處理。

授權再另外核對：固定案例的 AI 只允許 read／propose，沒有 refund 動作權限。即使資料驗證通過、有人想退款，這個 AI 也不能執行。POL-001 的「退款需人類主管核准」是必要條件，不是充分授權；**即使取得主管核准，也不能擅自擴充此 AI 的 read／propose 權限**。退款資格政策本身未定義，更不能虛構批准後必定退款的結果。

本組只核對案例政策所應導出的拒絕，不是端點已拒絕的實測。若有人只在提示詞寫「不得退款」，卻沒有執行端權限檢查，實際安全性仍未得到證明。

## 反向校正與使用限制

不能把「OWL 不適合當必填檢查」寫成「OWL 永遠抓不到錯誤」。組 B 加上明確不同即可不一致；矛盾公理也可能揭露建模錯誤。也不能把 SHACL 宣稱成萬用真相檢查：它只檢查指定輸入與條件；形狀未涵蓋的事情、輸入的真實性及實際操作權限另有責任。

SHACL 驗證違規、處理器不支援某推理設定所報 failure、以及沒有跑到正確 targets，是不同結果。後續章稿不可把它們都寫成「驗證沒過」而省略原因，也不可把空報告當所有業務資料都已被檢查。

本任務的可用主張：三組反例有固定前提、步驟、預期結論與失效邊界，足以支撐規則分工。未知／未驗收：特定工具的 parser、推理完整性、SHACL 實測輸出、正式寫入端點、支付或並行控制。若正文只使用中文反例，無須為了通過閘門捏造軟體測試。
