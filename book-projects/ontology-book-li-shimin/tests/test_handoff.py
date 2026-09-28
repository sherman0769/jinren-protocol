"""Local deterministic tests; no network, paid API or real business actions."""
from __future__ import annotations
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from count_text import count_body,extract_body
from case_checks import capacity_snapshot,payment_answer,validate_case
from validate_manuscript import validate_manuscript
from validate_handoff import checksum_errors,validate_handoff
from refresh_manifest import refresh

def marked(text: str) -> str:
    return '<!-- BODY_START -->\n'+text+'\n<!-- BODY_END -->'

class WordCountTests(unittest.TestCase):
    def test_no_markers_fails(self):
        with self.assertRaises(ValueError):count_body('# 只有大綱')
    def test_duplicate_markers_fail(self):
        with self.assertRaises(ValueError):extract_body(marked('甲')+marked('乙'))
    def test_order_fails(self):
        with self.assertRaises(ValueError):extract_body('<!-- BODY_END --><!-- BODY_START -->')
    def test_chinese_and_english(self):
        x=count_body(marked('本體 AI。'))
        self.assertEqual(x['body_visible_characters'],5)
        self.assertEqual(x['cjk_characters'],2)
    def test_excludes_appendix(self):
        self.assertEqual(count_body(marked('正文')+'\n金句與網址')['body_visible_characters'],2)
    def test_excludes_heading_code_url_citation(self):
        body='## 不算的標題\n本體[R04]\n```python\nprint(123)\n```\nhttps://example.com/x'
        self.assertEqual(count_body(marked(body))['body_visible_characters'],2)
    def test_keeps_link_label(self):
        self.assertEqual(count_body(marked('[本體](https://example.com)'))['body_visible_characters'],2)

class CaseTests(unittest.TestCase):
    def setUp(self):self.data=json.loads((ROOT/'04_cases/example_data.json').read_text(encoding='utf-8'))
    def test_fixture_valid(self):self.assertEqual(validate_case(self.data),[])
    def test_available_counts(self):
        for sid in ('S101','S102'):self.assertEqual(capacity_snapshot(self.data,sid)['available_seats'],1)
    def test_capacity_preserves_time(self):
        self.assertEqual(capacity_snapshot(self.data,'S101')['observed_at'],self.data['observed_at'])
    def test_unknown_payment_not_false(self):self.assertEqual(payment_answer(self.data,'E002'),'unknown')
    def test_settled_payment_record(self):self.assertEqual(payment_answer(self.data,'E001'),'settled_record_exists')
    def test_unknown_session_rejected(self):
        with self.assertRaises(ValueError):capacity_snapshot(self.data,'X000')
    def test_unknown_status_rejected(self):
        self.data['enrollments'][0]['status']='new_unmapped_status'
        with self.assertRaises(ValueError):capacity_snapshot(self.data,'S101')
    def test_incomplete_scope_rejected(self):
        self.data['complete_scopes']=[]
        with self.assertRaises(ValueError):capacity_snapshot(self.data,'S101')
    def test_duplicate_id_detected(self):
        self.data['persons'].append(copy.deepcopy(self.data['persons'][0]))
        self.assertTrue(any('重複識別碼' in x for x in validate_case(self.data)))
    def test_same_name_different_people(self):
        people={p['id']:p for p in self.data['persons']}
        self.assertEqual(people['P001']['name'],people['P003']['name'])
        self.assertNotEqual(people['P001']['id'],people['P003']['id'])
    def test_null_room_is_not_online(self):
        self.assertIsNone(self.data['sessions'][1]['room'])
        self.assertEqual(self.data['expected']['S102_delivery_mode'],'unknown')
    def test_refund_policy_not_engine_test(self):
        self.assertTrue(self.data['policy']['refund_requires_human_manager_approval'])
        self.assertNotIn('execute_refund',self.data['policy']['agent_allowed_actions'])

class PackageTests(unittest.TestCase):
    def test_handoff_structure(self):self.assertTrue(validate_handoff(ROOT,check_hashes=False)['passed'])
    def test_manuscript_guard_rejects_missing_body(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'00_project').mkdir()
            state=json.loads((ROOT/'00_project/project_state.json').read_text(encoding='utf-8'))
            (root/'00_project/project_state.json').write_text(json.dumps(state),encoding='utf-8')
            result=validate_manuscript(root)
            self.assertFalse(result['structure_passed'])
            self.assertEqual(result['chapters_present'],0)
    def test_tampering_detected(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'sample.md').write_text('原稿',encoding='utf-8');refresh(root)
            self.assertEqual(checksum_errors(root),[])
            (root/'sample.md').write_text('不同稿',encoding='utf-8')
            self.assertTrue(any('校驗碼不符' in x for x in checksum_errors(root)))

if __name__=='__main__':unittest.main()
