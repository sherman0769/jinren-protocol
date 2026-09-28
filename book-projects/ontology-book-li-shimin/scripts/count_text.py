#!/usr/bin/env python3
"""Conservative visible-character counts for marked Markdown manuscript bodies."""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

START = "<!-- BODY_START -->"
END = "<!-- BODY_END -->"

def extract_body(markdown: str) -> str:
    if markdown.count(START) != 1 or markdown.count(END) != 1:
        raise ValueError("正文必須恰有一組 BODY_START／BODY_END，不能把整份規格當正文。")
    a, b = markdown.index(START), markdown.index(END)
    if b <= a:
        raise ValueError("正文標記順序錯誤。")
    return markdown[a + len(START):b].strip()

def plain_body(markdown: str) -> str:
    text = extract_body(markdown)
    text = re.sub(r"```[^\n]*\n.*?```", "", text, flags=re.S)
    text = re.sub(r"~~~[^\n]*\n.*?~~~", "", text, flags=re.S)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"^\s{0,3}#{1,6}\s+.*$", "", text, flags=re.M)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"\[\^[^\]]+\]", "", text)
    text = re.sub(r"\[R\d{2,3}(?:[、,，\s-]+R?\d{2,3})*\]", "", text)
    text = re.sub(r"https?://[^\s<>]+", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"^\s*(?:[-*+]\s+|\d+[.)]\s+|>\s*)", "", text, flags=re.M)
    text = re.sub(r"[*_`~|]", "", text)
    return text

def count_body(markdown: str) -> dict:
    plain = plain_body(markdown)
    visible = "".join(c for c in plain if not c.isspace())
    cjk = sum('\u3400' <= c <= '\u9fff' or '\U00020000' <= c <= '\U0002FA1F' for c in visible)
    letters_digits = sum(c.isalnum() for c in visible)
    return {
        "body_visible_characters": len(visible),
        "cjk_characters": cjk,
        "letters_and_digits_including_cjk": letters_digits,
        "punctuation_and_other_visible": len(visible)-letters_digits,
        "method": "BODY 內移除標記、空白、標題、程式區塊、圖片、網址、引用代號；主計數含標點，另報中文字與字母數字；非英語 word count。",
    }

def main() -> int:
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("files", nargs="+", type=Path)
    args=ap.parse_args()
    results=[]; errors=[]
    for p in args.files:
        try:
            results.append({"file":str(p), **count_body(p.read_text(encoding="utf-8"))})
        except (OSError, ValueError) as e:
            errors.append({"file":str(p),"error":str(e)})
    print(json.dumps({"files":results,"errors":errors,
                      "total_body_visible_characters":sum(x["body_visible_characters"] for x in results)},ensure_ascii=False,indent=2))
    return 1 if errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
