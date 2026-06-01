#!/usr/bin/env python3
"""Merge per-food restaurant recommendations (workflow output) into data/musteat.json."""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = json.load(open(sys.argv[1], encoding="utf-8"))
recos = (out.get("result", out)).get("recos", [])
by_key = {r["key"]: r.get("recos", []) for r in recos if r.get("key")}

p = os.path.join(ROOT, "data", "musteat.json")
doc = json.load(open(p, encoding="utf-8"))
n = 0
for item in doc["items"]:
    rs = by_key.get(item["key"])
    if rs:
        item["recos"] = rs
        n += 1
json.dump(doc, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"recos merged into {n} foods")
missing = [it["key"] for it in doc["items"] if not it.get("recos")]
print("no recos:", missing or "(none)")
