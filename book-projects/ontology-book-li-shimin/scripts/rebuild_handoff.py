#!/usr/bin/env python3
"""Regenerate the derived single-file Markdown handoff from canonical files."""
from __future__ import annotations
import argparse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def source_paths(root: Path) -> list[Path]:
    paths=[root/"START_HERE.md",root/"AGENTS.md"]
    for folder in ("00_project","01_plan","02_research","03_podcast","04_cases","05_execution"):
        paths.extend(sorted((root/folder).rglob("*.md")))
    return paths

def rebuild(root: Path) -> Path:
    paths=source_paths(root)
    chunks=["# 《讓 AI 看懂一家公司》｜Codex 完整交接檔\n\n版本 1.0.0｜作者：李詩民｜交接基準：2026-09-28。\n\n本檔是已完成交接規格的彙編，不是正式書稿。分項 Markdown 是規格的正式來源；本檔由 scripts/rebuild_handoff.py 產生，修改時先改分項再重建。\n\n單檔可供閱讀與傳遞。可執行驗證腳本、單元測試、來源 JSON 與全部檔案清單請使用完整 ZIP。以下包含完整章規格、中文術語與來源筆記；最後附可計算案例 JSON。\n\n## 彙編索引"]
    for i,p in enumerate(paths,1):chunks.append(f"{i}. [{p.relative_to(root).as_posix()}](#handoff-section-{i:02d})")
    for i,p in enumerate(paths,1):
        chunks.append(f'\n---\n\n<a id="handoff-section-{i:02d}"></a>\n\n## 分項來源：{p.relative_to(root).as_posix()}\n\n'+p.read_text(encoding="utf-8").strip())
    for rel in ("00_project/project_state.json","04_cases/example_data.json","03_podcast/speech_lexicon.json"):
        chunks.append(f"\n---\n\n## 附錄資料：{rel}\n\n```json\n{(root/rel).read_text(encoding='utf-8').strip()}\n```")
    target=root/"CODEX_HANDOFF.md";target.write_text("\n\n".join(chunks)+"\n",encoding="utf-8")
    return target

if __name__=="__main__":
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument("--root",type=Path,default=ROOT);args=ap.parse_args()
    print(rebuild(args.root))
