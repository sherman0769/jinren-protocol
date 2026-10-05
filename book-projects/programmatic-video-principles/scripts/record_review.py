"""Record scoped model review and executed numerical evidence."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
checks = json.loads((root / 'qa/chapter_checks.json').read_text(encoding='utf-8'))
focus = ['末幀與片長', '圓心與外緣', '作品時間與耗時', '端點與截斷進度', '緩動與累加錯誤', '半開區間與局部時間', '控制點與弧長', '字框偏移與字元', '固定亂數與身份', '重建遮罩與配對', '正弦非Perlin', '半隱式步長與誤差', '假資料與過渡', '關係非佈局距離', '鏡頭與近裁切', '著色階段與CPU範圍', '取樣聲道與資料量', '語音窗與假值範圍', '渲染編碼封裝', '歷史證據與本輪分層', '可驗收規格', '工具閱讀非實跑', '入口語義驗證', '四幕遷移與真人驗收']
reviews = []
for number in range(1, 25):
    manuscript = root / f'MANUSCRIPT/chapters/chapter_{number:02d}_main.md'
    text = manuscript.read_text(encoding='utf-8')
    assert all(word in text for word in ['第一題', '第二題', '第三題', 'AI', 'examples/'])
    opening = next(part for part in text.split('\n\n') if not part.startswith('#'))
    reviews.append({'chapter': number, 'reviewerType': '模型自審', 'scope': '逐章正文復讀與實際數值檢查，非獨立專家或真人試讀', 'manuscriptSha256': hashlib.sha256(manuscript.read_bytes()).hexdigest(), 'mechanismFocus': focus[number-1], 'readerOpeningQuote': opening, 'numericalEvidence': checks['chapters'][f'CH{number:02d}'], 'technicalStatus': 'passed-with-stated-scope', 'beginnerRoleSimulation': '核對純中文因果、數值預測、錯誤定位及三題答案', 'humanReaderValidation': False})
report = {'reviewedAt': '2026-10-05', 'status': 'model-review-complete', 'chapters': reviews, 'correctionsBeforeSourceLock': ['CH08錯開時間改為直接描述0.2秒', '區域性改局部；畫素改像素；引數改參數', '不透明度的零到一描述', 'CH04移除校準草稿狀態語'], 'limits': ['未進行人類試讀或整章真人聽審', '沒有原案例完整引擎原碼或五套框架實跑', '區域繁體詞彙可留待後續編輯；NotebookLM現行來源以鎖定TXT為準']}
(root / 'qa/manuscript-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
work = json.loads((root / 'work.json').read_text(encoding='utf-8'))
work.update(phase='audio_generation', current_task='NotebookLM 24章批次生成及來源身份核對', next_action='逐卡標誌與來源核對、媒體驗證、Blob與production')
for item in ['24_chapter_manuscript', '24_chapter_model_review', '24_chapter_numerical_checks', 'reader_publication_package', '24_txt_exports', '60_second_transfer_baseline', 'Windows_Python_FFmpeg_baseline']:
    if item not in work['completed']: work['completed'].append(item)
work['not_completed'] = ['human_reader_validation', 'human_audio_content_acceptance', 'full_case_source_inspection', 'NotebookLM_24_validated_downloads', 'Blob_24_public_assets', 'production_release']
for n in range(1, 25):
    work['chapter_states'][f'CH{n:02d}'] = {'status': 'manuscript_imported_audio_pending', 'file': f'MANUSCRIPT/chapters/chapter_{n:02d}_main.md', 'technical_review': 'model-reviewed-numerical-check-passed', 'reader_review': 'model-role-simulation-only', 'human_approved': False}
(root / 'work.json').write_text(json.dumps(work, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(root / 'qa/visual-assets-review.json').write_text(json.dumps({'status': 'asset-selection-passed', 'checks': ['封面主標、副標及作者可讀', '影片面板正面朝鏡头；無反面透字', '無人物，地域設定不適用', '四幕代表幀0015/0465/0975/1425已查看，數值與因果相符'], 'secondGate': 'reader mobile preview pending'}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('24 scoped chapter reviews recorded')
