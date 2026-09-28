#!/usr/bin/env python3
"""Fail-closed manuscript presence/body checks. Does not certify editorial quality."""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path
from count_text import count_body,extract_body

ROOT=Path(__file__).resolve().parents[1]

def validate_manuscript(root: Path) -> dict:
    state=json.loads((root/"00_project/project_state.json").read_text(encoding="utf-8"))
    errors=[];warnings=[];details=[];present=0;body_total=0
    for ch in state["chapters"]:
        p=root/ch["manuscript_file"]
        if not p.is_file():
            errors.append(f"第 {ch['id']:02d} 章正式正文不存在")
            continue
        try:
            text=p.read_text(encoding="utf-8"); body=extract_body(text);counts=count_body(text)
            size=counts["body_visible_characters"]
            present+=1;body_total+=size
            if size<1000: errors.append(f"第 {ch['id']:02d} 章未達最低結構檢查量；不是正式長章")
            if re.search(r"【(?:填入|待補|待寫|自然小標|寫完整|正文以|完成情境)",body):
                errors.append(f"第 {ch['id']:02d} 章正文殘留範本／佔位文字")
            if size<ch["target_visible_characters"]*.85 or size>ch["target_visible_characters"]*1.25:
                warnings.append(f"第 {ch['id']:02d} 章偏離編輯預算，需記錄理由；不自動判定內容失敗")
            if ch["status"] not in {"EDITED","DERIVED","VERIFIED"}:
                errors.append(f"第 {ch['id']:02d} 章尚未記錄編輯完成")
            details.append({"id":ch["id"],**counts})
        except (OSError,ValueError) as e: errors.append(f"第 {ch['id']:02d} 章：{e}")
    for name in ("preface.md","reading_guide.md","conclusion.md","full_book.md"):
        p=root/"book_project/01_master"/name
        if not p.is_file() or p.stat().st_size==0: errors.append(f"整書來源缺少 {name}")
    return {"scope":"manuscript_structure_only_not_publication_certification",
            "chapters_present":present,"chapters_expected":state["chapter_count"],
            "chapter_body_visible_characters":body_total,"details":details,
            "errors":errors,"warnings":warnings,"structure_passed":not errors,
            "note":"未檢驗全文深度、引文支持、DOCX 或 Podcast；通過也不等於正式出版完成。"}

def main() -> int:
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument("--root",type=Path,default=ROOT);args=ap.parse_args()
    try: result=validate_manuscript(args.root)
    except (OSError,ValueError,KeyError,TypeError) as e:
        result={"structure_passed":False,"errors":[str(e)]}
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 0 if result["structure_passed"] else 1

if __name__=="__main__": raise SystemExit(main())
