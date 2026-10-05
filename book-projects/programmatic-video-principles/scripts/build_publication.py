"""本書專用可重建讀者版；不修改 books.json 或 TXT。"""
import hashlib,html,json,re,zipfile
from pathlib import Path
from opencc import OpenCC
ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parents[1]
SLUG='how-code-becomes-film'
public=REPO/'public/books'/SLUG
package=ROOT/'publication'
converter=OpenCC('s2t')
plan=json.loads((ROOT/'OUTLINE/chapter_plan.json').read_text(encoding='utf-8'))
terms={t['english']:t for t in json.loads((ROOT/'GLOSSARY/terms.json').read_text(encoding='utf-8'))['terms']}
checks=json.loads((ROOT/'qa/chapter_checks.json').read_text(encoding='utf-8'))['chapters']
numerals=['一','二','三','四','五','六','七','八','九','十','十一','十二']
metadata={'title':'程式如何變成影片','subtitle':'不背術語，也能看懂 AI 如何用程式寫出一部電影','author':'李詩民','description':'從影格、座標與時間開始，逐步看懂運動、粒子、資料、空間、聲音與影片輸出。用中文、數字、圖解與可重建例子學會指揮和驗收 AI，理解能跨越模型與框架。'}
package.mkdir(parents=True,exist_ok=True)
(package/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
rows={
1:[('尺寸','960 × 540 = 518,400 像素位置'),('片長與幀率','3 秒 × 30 張／秒 = 90 張'),('索引與取樣','0 … 89；最後 89/30 ≈ 2.9667 秒')],
2:[('畫布幾何中心','960/2，540/2 → (480,270)'),('外緣距離20，半徑20','圓心 → (40,40)'),('座標約定','左上原點；x 向右；y 向下')],
3:[('亂序索引','60 → 0 → 30 → 60'),('作品時間（秒）','2 → 0 → 1 → 2'),('位置（像素）','200 → 100 → 150 → 200')],
4:[('時間（秒）','0 → 0.5 → 1 → 1.5 → 2'),('位置（像素）','100 → 250 → 400 → 550 → 700'),('結束之後','把進度限制在1，保持700')],
5:[('半秒：u=0.25','等速250；緩動193.75'),('一秒：u=0.5','兩者400；只看中點不足'),('一點五秒：u=0.75','等速550；緩動606.25')],
6:[('第一幕','[0,3) 秒'),('第二幕','[3,6) 秒'),('全片4.2秒','第二幕局部時間1.2秒')],
7:[('三個控制資料','A=(0,0)，C=(50,100)，B=(100,0)'),('u=0.25','R=(25,37.5)'),('u=0.5','R=(50,50)，沒有穿過C')],
8:[('量得字框','左2，上5，右102，下45'),('繪字原點','(148,75)'),('可見中心','(200,100)；位置先固定，再改透明度')],
9:[('起點／速度','10/20；50/−10；90/0'),('兩秒位置','50；30；90 像素'),('固定初始資料','編號 → 固定起點 → 同一時間規則')],
10:[('形狀','四條矩形筆畫：自繪井形'),('取樣','本基準330個不重複目標'),('資料到運動','同数起點 → 穩定索引配對 → 插值')],
11:[('時間（秒）','0 → 0.5 → 1 → 1.5 → 2'),('偏移（像素）','0 → 10 → 0 → −10 → 0'),('條件','A=10，f=0.5，φ=0；正弦不是Perlin')],
12:[('初始條件','m=1，k=4，c=1，x=1，v=0'),('dt=0.1秒第一步','a=−4 → v=−0.4 → x=0.96'),('兩秒誤差縮小','1/60：0.00953；1/120：0.00473；1/240：0.00236')],
13:[('教學假資料','10，20，30；不是觀測'),('高度（像素）','50，100，150；零到40映射200'),('柱頂y','200，150，100；共同底線250')],
14:[('先備關係','A→B、A→C、B→D、C→D、D→E'),('資料','5節點，5邊；D有2條入邊'),('佈局與語意','交換位置不改關係；近不代表強')],
15:[('鏡頭約定','z=−4，朝+z；q=z+4'),('近点(1,1,0)','畫布(450,175)'),('遠点(1,1,4)','畫布(425,200)；q≤0.1不畫')],
16:[('單位方向內積','正對1；垂直0；背向−1'),('I=0.2+0.8max(0,d)','亮度1；0.2；0.2'),('不同分工','幾何 → 著色 → 測試與合成；CPU數值教學')],
17:[('兩秒畫面','30fps → 60張'),('兩秒單聲道聲音','48kHz → 96,000個取樣'),('共同半秒','影格索引15；音訊索引24,000')],
18:[('三句開始時間','0，2，4秒；各2秒窗口'),('教學假音長','1.6，1.8，1.9 → 結束1.6，3.8，5.9'),('第二句改長2.4秒','結束4.4；超窗0.4秒，先拒絕')],
19:[('渲染','資料與時間 → RGB影格'),('編碼','影格／聲音 → H.264／AAC資料流'),('封裝','流與時間資訊 → MP4容器')],
20:[('數值與重現','規則、邊界、同一輸入'),('媒體','中繼資料 → 完整解碼'),('觀看與聽審','構圖／正反面／發音／理解，各有證據')],
21:[('意圖拆解','輸入 → 規則 → 時間 → 限制 → 觀察點'),('五秒30fps','150張；最後索引149'),('四秒線性聚合','第60幀＝兩秒＝進度0.5')],
22:[('可遷移的契約','資料 → 時間到狀態 → 繪圖 → 輸出'),('共同位置表','第15幀250；第60幀700；第89幀700'),('證據邊界','官方文件閱讀 ≠ 五套工具實跑')],
23:[('最小場景資料','id／start／duration／type'),('連續時間','[0,4) → [4,8)；240幀'),('入口驗證','重複ID、空洞、負長度、未知欄位先拒絕')],
24:[('四幕時間帳','[0,15) → [15,30) → [30,45) → [45,60)'),('輸出規格','60秒 × 30fps = 1,800幀'),('十五秒邊界','第450幀 → 第二幕局部零秒')]
}
public.joinpath('figures').mkdir(parents=True,exist_ok=True)
manifest=[]; master=['# '+metadata['title'],'',metadata['subtitle'],'']
for chapter in plan['chapters']:
    n=chapter['number']; source=ROOT/f'MANUSCRIPT/chapters/chapter_{n:02d}_main.md'
    raw=converter.convert(source.read_text(encoding='utf-8')).replace('區域性','局部').replace('声音','聲音').replace('畫素','像素').replace('引數','參數')
    # Preserve this book's reviewed spelling after automatic conversion.
    raw=raw.replace('秒錶示','秒表示').replace('擴充套件成','擴展成').replace('変更','變更').replace('発音與聲音身份透過驗收','發音與聲音身分通過驗收')
    raw=raw.replace('第二字只是在局部時間上錯開二十分之一秒的十倍，也就是 0.2 秒','第二字只是在局部時間上錯開 0.2 秒')
    raw=raw.replace('本章依交接校準樣章修訂為正式章稿；配套均為教學重建。','本章配套為教學重建，不是原片程式碼摘錄。')
    raw=raw.replace('透明度零到一描述可見程度','不透明度從零到一描述可見程度')
    if n==2:raw=raw.replace('不需要 GPU','不需要繪圖顯示卡')
    if '## 術語回顧' not in raw:
        cards=['## 術語回顧','']
        for english in chapter['core_terms']:
            term=terms[english]
            cards.extend([term['chinese'].replace('；','／')+'（'+english+'）：'+term['plain_language'],''])
        raw+='\n'+'\n'.join(cards)
    source.write_text(raw,encoding='utf-8')
    reader=[]; code=False; section=0
    for line in raw.splitlines():
        if line.startswith('```'):
            code=not code; continue
        if re.match(r'^!\[',line): continue
        if line.startswith('|'):
            cells=[c.strip() for c in line.strip('|').split('|')]
            if all(re.fullmatch(r'[-:]+',c) for c in cells):continue
            line='；'.join(cells)+'。'
        if code:
            if not line.strip():continue
            line='程式行：'+line.strip()
        if line.startswith('## '):
            line='## '+numerals[section]+'、'+line[3:];section+=1
        reader.append(line)
    target=package/f'chapters/chapter_{n:02d}/chapter_{n:02d}_main.md';target.parent.mkdir(parents=True,exist_ok=True)
    text='\n'.join(reader)+'\n';target.write_text(text,encoding='utf-8');master.append(raw)
    title=chapter['title']; svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520">',f'<title>{html.escape(title)}</title>','<rect width="1000" height="520" rx="18" fill="#f7f5ef"/>',f'<text x="46" y="68" font-size="30" font-family="sans-serif" fill="#172b3a">第{n}章｜{html.escape(title)}</text>']
    for i,(label,value) in enumerate(rows[n]):
        y=105+i*115
        svg.extend([f'<rect x="36" y="{y}" width="928" height="98" rx="12" fill="{["#e1efea","#edf0f2","#fff0d7"][i]}"/>',f'<text x="58" y="{y+33}" font-size="21" font-family="sans-serif" fill="#0b746b">{html.escape(converter.convert(label))}</text>',f'<text x="58" y="{y+72}" font-size="22" font-family="sans-serif" fill="#172b3a">{html.escape(converter.convert(value))}</text>'])
    svg.extend(['<text x="46" y="496" font-size="18" font-family="sans-serif" fill="#60717a">原創教學對照｜數字見逐章檢查｜無原片演算法推定</text>','</svg>'])
    figure=public/f'figures/chapter_{n:02d}.svg';figure.write_text('\n'.join(svg),encoding='utf-8')
    manifest.append({'number':n,'source':str(source.relative_to(ROOT)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'readerSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'figure':f'/books/{SLUG}/figures/{figure.name}','figureAlt':converter.convert(title+'：'+ '；'.join(a+'，'+b for a,b in rows[n])),'chineseCharacters':len(re.findall(r'[\u3400-\u9fff]',raw))})
(ROOT/'MANUSCRIPT/full_book.md').write_text('\n\n'.join(master),encoding='utf-8')
(ROOT/'qa/publication-manifest.json').write_text(json.dumps({'slug':SLUG,'chapters':manifest,'chineseCharacters':sum(x['chineseCharacters'] for x in manifest),'originalHandoffPreserved':True},ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(public/'companion.zip','w',zipfile.ZIP_DEFLATED) as z:
    for folder in ('MANUSCRIPT','examples','tests','GLOSSARY','RESEARCH'):
        for p in (ROOT/folder).rglob('*'):
            if p.is_file() and '__pycache__' not in p.parts and p.suffix not in ('.pyc','.log'):
                z.write(p,p.relative_to(ROOT).as_posix())
    for name in ('examples/README.md','qa/chapter_checks.json','qa/publication-manifest.json','RIGHTS_AND_PROVENANCE.md'):
        p=ROOT/name
        if p.exists() and name not in z.namelist():z.write(p,name)
print(json.dumps({'chapters':len(manifest),'chineseCharacters':sum(x['chineseCharacters'] for x in manifest),'package':str(package),'companionBytes':(public/'companion.zip').stat().st_size},ensure_ascii=False))
