#!/usr/bin/env python3
"""Validate handoff files, indexes, fixture and optional SHA-256 manifest."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse
from case_checks import validate_case

ROOT=Path(__file__).resolve().parents[1]

def package_files(root: Path) -> list[str]:
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*")
                  if p.is_file() and "__pycache__" not in p.parts and p.suffix!=".pyc")

def checksum_errors(root: Path) -> list[str]:
    p=root/"06_quality/checksums.sha256"; errors=[]
    if not p.is_file(): return ["校驗碼檔不存在"]
    listed=[]
    for line in p.read_text(encoding="utf-8").splitlines():
        if not line.strip(): continue
        try: digest,rel=line.split("  ",1)
        except ValueError:
            errors.append("校驗碼格式錯誤");continue
        q=(root/rel).resolve()
        if not q.is_relative_to(root.resolve()): errors.append("校驗碼路徑越界");continue
        listed.append(rel)
        if not q.is_file(): errors.append(f"校驗碼檔案缺失：{rel}");continue
        if hashlib.sha256(q.read_bytes()).hexdigest()!=digest: errors.append(f"校驗碼不符：{rel}")
    expected=set(package_files(root))-{ "06_quality/checksums.sha256" }
    if set(listed)!=expected or len(listed)!=len(set(listed)):
        errors.append("校驗清單與實際檔案集合不符")
    return errors

def validate_handoff(root: Path, check_hashes: bool=True) -> dict:
    errors=[]; warnings=[]; chapter_count=0;source_count=0;term_count=0
    try:
        spec=json.loads((root/"06_quality/required_files.json").read_text(encoding="utf-8"))
        for rel in spec["files"]:
            p=root/rel
            if not p.is_file() or p.stat().st_size==0: errors.append(f"必要檔案不存在或空白：{rel}")
        state=json.loads((root/"00_project/project_state.json").read_text(encoding="utf-8"))
        chapters=state["chapters"];chapter_count=len(chapters)
        if chapter_count!=16 or [c["id"] for c in chapters]!=list(range(1,17)):
            errors.append("章節數或順序不一致")
        if sum(c["target_visible_characters"] for c in chapters)!=state["chapter_target_visible_characters"]:
            errors.append("章預算加總不一致")
        if state["chapter_target_visible_characters"]+state["front_back_target_visible_characters"]!=state["book_target_visible_characters"]:
            errors.append("全書預算不一致")
        if state["author"]!="李詩民": errors.append("作者姓名不一致")
        for c in chapters:
            text=(root/c["brief_file"]).read_text(encoding="utf-8")
            for heading in ("唯一任務","讀者前後轉變","摘要與論證順序","案例與情境","證據任務","與前後章的關係","課程學習目標與練習","不得與其他章重複"):
                if heading not in text: errors.append(f"第 {c['id']} 章缺少 {heading}")
        records=json.loads((root/"02_research/sources.json").read_text(encoding="utf-8"))["sources"]
        source_count=len(records)
        if source_count<26 or len({x['id'] for x in records})!=source_count: errors.append("來源 ID 重複或少於初始 26 筆")
        for x in records:
            for key in ("id","title","source_type","reading_depth","limitations","locator","accessed_on"):
                if not x.get(key):errors.append(f"來源 {x.get('id')} 缺少 {key}")
            u=urlparse(x.get("url",""))
            if u.scheme!="https" or not u.netloc: errors.append(f"來源 {x.get('id')} 不是有效 HTTPS 格式")
        terms=json.loads((root/"00_project/terminology.json").read_text(encoding="utf-8"))
        term_count=len(terms["terms"])
        if term_count!=terms["term_count"] or term_count<72: errors.append("術語數量不一致")
        for x in terms["terms"]:
            for key in ("english","chinese","plain_explanation","example","boundary"):
                if not x.get(key): errors.append(f"術語 {x.get('id')} 缺少 {key}")
        data=json.loads((root/"04_cases/example_data.json").read_text(encoding="utf-8"))
        errors.extend(validate_case(data))
        actual=sum((root/c["manuscript_file"]).is_file() for c in chapters)
        if state["manuscript_chapters_completed"]>actual: errors.append("宣稱章完成數超過實際檔案數")
        if state["book_status"]=="DELIVERED" and actual!=16: errors.append("錯把交接標記為全書完成")
        if actual==0: warnings.append("正式章稿為 0／16；這是交接包，非完整書稿。")
        warnings.append("未連網驗證來源可用性，也未自動驗證論點、引用或音訊品質。")
        manifest=root/"06_quality/delivery_manifest.txt"
        if check_hashes:
            errors.extend(checksum_errors(root))
            if not manifest.is_file(): errors.append("交付清單不存在")
            else:
                lines=manifest.read_text(encoding="utf-8").splitlines()
                if lines!=package_files(root): errors.append("交付清單與實際檔案不符")
    except (OSError,ValueError,KeyError,TypeError) as e:
        errors.append(f"無法完成驗證：{e}")
    return {"scope":"handoff_only","passed":not errors,"chapter_briefs":chapter_count,
            "seed_sources":source_count,"terms":term_count,"checksums_checked":check_hashes,
            "errors":errors,"warnings":warnings}

def main() -> int:
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root",type=Path,default=ROOT)
    ap.add_argument("--no-checksums",action="store_true",help="僅供打包前檢查；交付使用預設完整檢查")
    args=ap.parse_args();result=validate_handoff(args.root,not args.no_checksums)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 0 if result["passed"] else 1

if __name__=="__main__":raise SystemExit(main())
