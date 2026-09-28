#!/usr/bin/env python3
"""Refresh integrity files after intentional edits; does not certify content quality."""
from __future__ import annotations
import argparse
import hashlib
from pathlib import Path
from validate_handoff import package_files

ROOT=Path(__file__).resolve().parents[1]

def refresh(root: Path) -> int:
    folder=root/"06_quality";folder.mkdir(parents=True,exist_ok=True)
    manifest=folder/"delivery_manifest.txt";hashes=folder/"checksums.sha256"
    manifest.touch(exist_ok=True);hashes.touch(exist_ok=True)
    files=package_files(root)
    manifest.write_text("\n".join(files)+"\n",encoding="utf-8")
    lines=[]
    for rel in files:
        if rel=="06_quality/checksums.sha256":continue
        lines.append(hashlib.sha256((root/rel).read_bytes()).hexdigest()+"  "+rel)
    hashes.write_text("\n".join(lines)+"\n",encoding="utf-8")
    return len(files)

if __name__=="__main__":
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument("--root",type=Path,default=ROOT);args=ap.parse_args()
    print(f"manifest files: {refresh(args.root)}; 只更新完整性，不代表研究或正文已通過審稿。")
