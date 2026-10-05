"""驗證交接檔案結構與資料引用；不是書稿品質評分。僅使用標準函式庫。"""
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def check_package(root: Path, verify_manifest: bool=False) -> dict:
    errors=[]; checks=[]
    def check(condition: bool,message: str) -> None:
        (checks if condition else errors).append(message)
    required=['00_START_HERE.md','README.md','AGENTS.md','book.json','work.json',
      'START_HERE.html','OUTLINE/chapter_plan.json','GLOSSARY/terms.json',
      'CODEX_INSTRUCTIONS/MASTER_PROMPT.md','CODEX_INSTRUCTIONS/RESUME_PROMPT.md',
      'SAMPLE_CHAPTER/CH04_圓點為什麼會動.md','RESEARCH/sources.json',
      'CASE_STUDY/evidence/QA_REPORT_original.md','examples/motion_core.py',
      'examples/build_examples.py','examples/render_demo.py','tests/test_motion_core.py',
      'qa/HANDOFF_QA.md']
    for name in required: check((root/name).is_file(),f'必要檔案：{name}')
    if errors:return {'status':'FAIL','passed_checks':len(checks),'errors':errors}
    def load(name):return json.loads((root/name).read_text(encoding='utf-8'))
    try:
        plan=load('OUTLINE/chapter_plan.json'); terms=load('GLOSSARY/terms.json')['terms']
        sources=load('RESEARCH/sources.json')['sources']; state=load('work.json')
        chapters=plan['chapters']; ids={c['id'] for c in chapters}
        check(len(plan['parts'])==6,'六部架構')
        check(len(chapters)==24 and len(ids)==24,'二十四個不重複章節')
        check(ids=={f'CH{i:02d}' for i in range(1,25)},'章節編號完整')
        source_ids={s['id'] for s in sources}; term_names={t['english'] for t in terms}
        check(len(term_names)==len(terms),'術語英文主名稱不重複')
        check(len({t['id'] for t in terms})==len(terms),'術語 ID 不重複')
        check(set(state['chapter_states'])==ids,'續寫狀態涵蓋全部章節')
        for c in chapters:
            check(all(d in ids for d in c['depends_on']),f"{c['id']} 先備章節存在")
            check(all(t in term_names for t in c['core_terms']),f"{c['id']} 核心術語有卡片")
            check(all(s in source_ids for s in c['source_ids']),f"{c['id']} 來源 ID 存在")
            check((root/c['brief_path']).is_file(),f"{c['id']} 寫作任務卡存在")
        graph={c['id']:c['depends_on'] for c in chapters}; visiting=set(); visited=set()
        def visit(n):
            if n in visiting:raise ValueError('章節依賴形成循環：'+n)
            if n in visited:return
            visiting.add(n)
            for d in graph.get(n,[]):visit(d)
            visiting.remove(n);visited.add(n)
        for n in graph:visit(n)
        check(True,'章節依賴無循環')
        fields=['id','english','chinese','plain_language','example_or_analogy','analogy_limit','first_chapter','source_ids']
        for t in terms:
            check(all(t.get(f) for f in fields),f"{t['id']} 術語卡欄位完整")
            check(t['first_chapter'] in ids,f"{t['id']} 首次出現章節存在")
            check(all(s in source_ids for s in t['source_ids']),f"{t['id']} 來源 ID 存在")
        check(len(list((root/'examples/output').glob('*.svg')))==6,'六張可重建 SVG 存在')
        check((root/'examples/output/principles_demo.mp4').stat().st_size>0,'示範 MP4 非空')
        forbidden=[p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file() and
            (p.suffix.lower() in {'.ttf','.otf','.ttc','.woff','.woff2','.pem','.key'} or p.name=='.env')]
        check(not forbidden,'未附字型檔、私鑰與 .env')
        if forbidden:errors.extend(forbidden)
        if verify_manifest:
            manifest=load('MANIFEST.json')
            for item in manifest['files']:
                path=root/item['path'];digest=hashlib.sha256(path.read_bytes()).hexdigest()
                check(digest==item['sha256'] and path.stat().st_size==item['bytes'],'雜湊：'+item['path'])
    except (OSError,ValueError,KeyError,TypeError) as exc:
        errors.append(f'讀取或驗證失敗：{exc}')
    return {'status':'PASS' if not errors else 'FAIL','passed_checks':len(checks),
            'errors':errors,'scope':'結構／引用／檔案完整性；不代表正文完成、技術全對或初學者已看懂'}

def main() -> int:
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--verify-manifest',action='store_true')
    args=ap.parse_args();result=check_package(ROOT,args.verify_manifest)
    print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['status']=='PASS' else 1
if __name__=='__main__':sys.exit(main())
