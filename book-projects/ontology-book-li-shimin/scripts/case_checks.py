#!/usr/bin/env python3
"""Offline fixture checks only; not an ontology reasoner or an action engine."""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def capacity_snapshot(data: dict, session_id: str) -> dict:
    sessions={x["id"]:x for x in data["sessions"]}
    if session_id not in sessions:
        raise ValueError("未知班別")
    if "enrollments in this fixture" not in data.get("complete_scopes",[]):
        raise ValueError("報名資料未宣告完整，不能計算可用席位")
    all_status={"confirmed","waitlisted","cancelled"}
    rows=[e for e in data["enrollments"] if e["session_id"]==session_id]
    if any(e["status"] not in all_status for e in rows):
        raise ValueError("存在未定義狀態，不可默默當作不佔位")
    count=sum(e["status"] in data["policy"]["seat_consuming_statuses"] for e in rows)
    return {"session_id":session_id,"capacity":sessions[session_id]["capacity"],
            "confirmed_count":count,"available_seats":sessions[session_id]["capacity"]-count,
            "observed_at":data["observed_at"],"policy_version":data["policy"]["version"],
            "source_ids":[data["snapshot_id"]]+[e["id"] for e in rows],
            "warning":"只描述快照，不是當下操作授權。"}

def payment_answer(data: dict, enrollment_id: str) -> str:
    if not any(e["id"]==enrollment_id for e in data["enrollments"]):
        raise ValueError("未知報名")
    rows=[p for p in data["payments"] if p["enrollment_id"]==enrollment_id]
    return "settled_record_exists" if any(p["status"]=="settled" for p in rows) else "unknown"

def validate_case(data: dict) -> list[str]:
    errors=[]
    if data.get("fictional") is not True: errors.append("必須明確標記虛構案例")
    for group in ("persons","courses","sessions","enrollments","payments"):
        ids=[x["id"] for x in data[group]]
        if len(ids)!=len(set(ids)): errors.append(f"{group}: 重複識別碼")
    persons={x["id"] for x in data["persons"]}; courses={x["id"] for x in data["courses"]}
    sessions={x["id"] for x in data["sessions"]}; enrollments={x["id"] for x in data["enrollments"]}
    for s in data["sessions"]:
        if type(s["capacity"]) is not int or s["capacity"]<0: errors.append("容量必須是非負整數")
        if s["course_id"] not in courses or s["instructor_id"] not in persons: errors.append("班別連結不存在")
    for e in data["enrollments"]:
        if e["person_id"] not in persons or e["session_id"] not in sessions: errors.append("報名連結不存在")
    active=[(e["person_id"],e["session_id"]) for e in data["enrollments"] if e["status"]=="confirmed"]
    if len(active)!=len(set(active)): errors.append("同一人同一班有重複佔位")
    for p in data["payments"]:
        if p["enrollment_id"] not in enrollments: errors.append("付款對應報名不存在")
    try:
        for sid in sessions:
            cap=capacity_snapshot(data,sid)
            if cap["available_seats"]<0: errors.append("快照已超額")
        if capacity_snapshot(data,"S101")["available_seats"] != data["expected"]["S101_available"]: errors.append("S101 答案不一致")
        if capacity_snapshot(data,"S102")["available_seats"] != data["expected"]["S102_available"]: errors.append("S102 答案不一致")
        if payment_answer(data,"E002") != data["expected"]["E002_payment_answer"]: errors.append("付款未知語意不一致")
    except (KeyError, ValueError) as e: errors.append(str(e))
    return errors

if __name__=="__main__":
    try:
        data=json.loads((ROOT/"04_cases/example_data.json").read_text(encoding="utf-8"))
        errors=validate_case(data)
        print(json.dumps({"errors":errors,"passed":not errors,"scope":"offline_fixture_only"},ensure_ascii=False,indent=2))
        raise SystemExit(1 if errors else 0)
    except (OSError,KeyError,TypeError,ValueError) as e:
        print(json.dumps({"passed":False,"error":str(e)},ensure_ascii=False))
        raise SystemExit(1)
