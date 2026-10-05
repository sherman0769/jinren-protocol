"""書稿初學者閱讀的提示器：只提出線索，不替代人工閱讀與技術審查。"""
from __future__ import annotations
import argparse,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def main() -> int:
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('paths',nargs='*',help='可選：待檢查的 Markdown 檔案。預設正式章節資料夾。')
    args=ap.parse_args()
    paths=[Path(x).resolve() for x in args.paths] if args.paths else sorted((ROOT/'MANUSCRIPT/chapters').glob('*.md'))
    if not paths:
        print(json.dumps({'status':'NOT_STARTED','message':'尚無正式章節；沒有把空書稿標成通過。'},ensure_ascii=False,indent=2));return 0
    terms=json.loads((ROOT/'GLOSSARY/terms.json').read_text(encoding='utf-8'))['terms']
    results=[]
    for p in paths:
        if not p.is_file():
            results.append({'path':str(p),'error':'檔案不存在'});continue
        raw=p.read_text(encoding='utf-8');text=re.sub(r'```.*?```','',raw,flags=re.S)
        hints=[]
        for para in re.split(r'\n\s*\n',text):
            english=re.findall(r'\b[A-Za-z][A-Za-z0-9_-]+\b',para)
            if len(english)>20 and not para.lstrip().startswith(('|','http','[S')):
                hints.append({'kind':'英文密度','excerpt':para[:120],'message':'有較多英文詞；確認是否先給讀者中文理解。不是自動判錯。'})
        for t in terms:
            hit=re.search(r'(?<![A-Za-z])'+re.escape(t['english'])+r'(?![A-Za-z])',text,re.I)
            if hit:
                nearby=text[max(0,hit.start()-450):hit.end()+450]
                names=re.split('[；;/]',t['chinese'])
                if not any(n.strip() in nearby for n in names):
                    hints.append({'kind':'術語首次解釋','term':t['english'],'message':'附近未找到術語卡的中文名稱；請確認先前章節是否已教過，或此處是否需補解釋。'})
        for token in ('TODO','待補正文','此處插入內容'):
            if token in raw:hints.append({'kind':'未完成標記','text':token})
        results.append({'path':str(p),'chinese_character_count':len(re.findall(r'[\u3400-\u9fff]',text)),
                        'hints':hints,'status':'REVIEW_REQUIRED'})
    print(json.dumps({'scope':'啟發式提示，不是語意驗收分數。每個提示可由人工判定不適用。','files':results},ensure_ascii=False,indent=2))
    return 1 if any('error' in r for r in results) else 0
if __name__=='__main__':sys.exit(main())
