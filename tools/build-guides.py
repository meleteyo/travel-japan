#!/usr/bin/env python3
"""Merge guide objects from one or more workflow output files into data/guides.json.
Idempotent: re-running with new outputs adds/updates guides. Adds a `hero` place key."""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO = {
    "narita-arrival": "keisei-skyliner", "skyliner": "keisei-skyliner", "hotel-checkin": "hotel",
    "yanaka-ginza": "yanaka-ginza", "ueno-ameyoko": "ameyoko",
    "shibuya-parco": "pokemon-center-shibuya", "shibuya-loft": "shibuya-loft",
    "harajuku": "harajuku-takeshita", "omotesando": "omotesando",
    "yodobashi-akiba": "yodobashi-akiba", "akihabara-gacha": "akihabara",
    "ginza-itoya": "ginza-itoya", "checkout-luggage": "hotel",
    "tokyo-character-street": "tokyo-character-street", "departure": "keisei-skyliner",
}

p = os.path.join(ROOT, "data", "guides.json")
doc = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {"guides": {}}
doc.setdefault("guides", {})

def collect(out):
    data = json.load(open(out, encoding="utf-8"))
    res = data.get("result", data)
    gs = res.get("guides", res if isinstance(res, list) else [])
    return [g for g in gs if isinstance(g, dict) and g.get("id")]

added = []
for out in sys.argv[1:]:
    for g in collect(out):
        gid = g["id"]
        if gid in HERO:
            g["hero"] = HERO[gid]
        doc["guides"][gid] = g
        added.append(gid)

json.dump(doc, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("merged:", ", ".join(added) if added else "(none)")
print("total guides now:", len(doc["guides"]), "->", sorted(doc["guides"].keys()))
