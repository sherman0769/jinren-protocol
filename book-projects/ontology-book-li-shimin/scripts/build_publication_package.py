"""Package reviewed reader sources and teaching materials; do not rewrite manuscripts."""
from pathlib import Path
import hashlib, json, shutil, zipfile, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT.parents[1]
VERSION = '1.0.3'
STAGE = APP / f'tmp/ontology-publication-v{VERSION}'
EXPORT = ROOT / 'book_project/05_exports'

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def copy(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
def archive(folder, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(dest, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for p in sorted(folder.rglob('*')):
            if p.is_file(): z.write(p, p.relative_to(folder).as_posix())
    with zipfile.ZipFile(dest) as z: assert z.testzip() is None

def main():
    assert not STAGE.exists(), 'Versioned stage exists; inspect before rebuilding'
    manifest = json.loads((EXPORT/'docx_manifest.json').read_text(encoding='utf-8'))
    assert len(manifest['entries']) == 17
    for e in manifest['entries']:
        assert e['render_status'] == 'passed_all_pages_visual_review'
        assert digest(ROOT/e['path']) == e['sha256']
    state = json.loads((ROOT/'00_project/project_state.json').read_text(encoding='utf-8'))
    for n in range(1,17):
        stem=f'chapter_{n:02}'; dst=STAGE/'02_chapters'/stem
        copy(EXPORT/f'reader_chapters/{stem}_main.md',dst/f'{stem}_main.md')
        copy(EXPORT/f'docx/{stem}_main.docx',dst/f'{stem}_main.docx')
        # Preserve editable authoring source separately; importer consumes reader main only.
        copy(ROOT/f'book_project/02_chapters/{stem}/{stem}_main.md',STAGE/f'authoring_sources/{stem}_main.md')
        for p in sorted((ROOT/f'book_project/02_chapters/{stem}').glob('*.md')):
            if p.name.endswith(('_speech_notes.md','_slide_outline.md','_quotes.md','_teaching.md','_model_canvas.md','_sheet.md','_worksheet.md','_comparison.md','_contract.md','_capstone.md')):
                copy(p,dst/'teaching'/p.name)
        for p in sorted((ROOT/f'book_project/03_podcast/episode_{n:02}').glob('*.md')):
            if p.name.endswith(('_script.md','_shownotes.md')): copy(p,dst/'podcast_text'/p.name)
        archive(dst,STAGE/f'chapter_zips/{stem}_v{VERSION}.zip')
    for p in sorted((ROOT/'book_project/01_master').glob('*')):
        if p.is_file(): copy(p,STAGE/'01_master'/p.name)
    copy(EXPORT/'docx/full_book.docx',STAGE/'01_master/full_book.docx')
    copy(APP/'tmp/ontology-docx-render/word-final/full_book.pdf',STAGE/'01_master/full_book.pdf')
    for p in sorted((ROOT/'04_cases').rglob('*')):
        if p.is_file(): copy(p,STAGE/'examples/04_cases'/p.relative_to(ROOT/'04_cases'))
    copy(ROOT/'scripts/case_checks.py',STAGE/'examples/scripts/case_checks.py')
    for p in sorted((ROOT/'book_project/00_research').glob('*.md')):
        copy(p,STAGE/'research_notes'/p.name)
    copy(EXPORT/'docx_manifest.json',STAGE/'quality/docx_manifest.json')
    copy(ROOT/'06_quality/run_20260928_round17/docx_quality.json',STAGE/'quality/docx_quality.json')
    copy(ROOT/'book_project/04_quality/whole_book_review.md',STAGE/'quality/whole_book_review.md')
    cover=APP/'public/books/let-ai-understand-a-company/cover.png'
    assert cover.exists()
    copy(cover,STAGE/'cover.png')
    readme=f'''# 讓 AI 看懂一家公司｜正式書稿出版包 {VERSION}

作者：李詩民。書稿查閱基準：2026-09-28。

本包包含十六章完整正文、全書 Markdown／可編輯 Word／閱讀 PDF、六附錄、逐章 Podcast 文字稿、演講與教學材料。封面以「本體入門」明確標示主題。本包不包含音訊檔；NotebookLM 音訊另經逐章校對與網站發布流程，實際發布狀態以詩塾書院及音訊驗證紀錄為準。

## 閱讀與匯入

- 全書：01_master/full_book.docx、full_book.pdf 或 full_book.md；包含序言、導讀、結語與附錄。
- 電子書平台匯入：02_chapters/chapter_XX/chapter_XX_main.md，共 16 章；一章對應一個 NotebookLM 來源與一集音訊。
- 逐章 ZIP：chapter_zips/；內容同 02_chapters/，不可當作額外章節重複匯入。
- 正式可編輯母稿另保存在 authoring_sources/，保留版本與 BODY 邊界；讀者版只移除編輯紀錄，不改寫正文。
- sources／research_notes 與各章附註交代查閱位置及限制；來源登錄不代表完整精讀，工程範例不代表真實企業實測。
- 範例檢查：在解壓後執行 `python examples/scripts/case_checks.py`（Python 3.10 以上）。案例為虛構；不是 OWL 推理器、SHACL 引擎或退款服務。
- 研究、自審與 Word 排版檢查已完成；未冒稱作者試讀、獨立專家審稿或實際朗讀已完成。

## 檔案驗證

publication_manifest.json 登記本包每一檔案的相對路徑、bytes 與 SHA-256（清單本身除外），以及正式章稿版本與母稿雜湊。請先驗證再匯入。未包含第三方全文、私人資料、API 金鑰或原始未完成交接包。
'''
    (STAGE/'README.md').write_text(readme,encoding='utf-8',newline='\n')
    files=[{'path':p.relative_to(STAGE).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(STAGE.rglob('*')) if p.is_file()]
    info={'title':state['working_title'],'author':'李詩民','version':VERSION,'chapter_count':16,'audio_count':0,'audio_status':'external_audio_not_bundled','canonical_chapters':[{'number':c['id'],'version':c['manuscript_version'],'sha256':c['manuscript_sha256']} for c in state['chapters']],'files':files}
    (STAGE/'publication_manifest.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    package=APP/f'books/讓AI看懂一家公司_出版包_v{VERSION}.zip'
    assert not package.exists()
    archive(STAGE,package)
    check=APP/f'tmp/ontology-publication-verified-v{VERSION}'
    assert not check.exists()
    with zipfile.ZipFile(package) as z: z.extractall(check)
    for e in files:
        p=check/e['path'];assert p.stat().st_size==e['bytes'] and digest(p)==e['sha256'],e['path']
    for p in sorted((check/'chapter_zips').glob('*.zip')):
        with zipfile.ZipFile(p) as z: assert z.testzip() is None
    r=subprocess.run([sys.executable,'-B',str(check/'examples/scripts/case_checks.py')],capture_output=True,text=True,encoding='utf-8')
    assert r.returncode==0,r.stdout+r.stderr
    report={'status':'passed','package':str(package),'bytes':package.stat().st_size,'sha256':digest(package),'files_verified':len(files),'chapter_zips':16,'extracted':str(check),'case_checks':json.loads(r.stdout),'audio_status':'pending'}
    (ROOT/'06_quality/run_20260928_round17/package_quality.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__=='__main__': main()
