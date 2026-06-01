#!/usr/bin/env python3
"""Attach `guide` keys to itinerary stops by matching stop names to guide ids.
Only links guides that actually exist in guides.json (no broken links). Idempotent."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
guides = set(json.load(open(os.path.join(ROOT, "data", "guides.json"), encoding="utf-8")).get("guides", {}).keys())

# (substring in stop name) -> guide id   (first match wins, order matters)
RULES = [
    ("나리타공항 도착", "narita-arrival"),
    ("스카이라이너 → 닛포리", "skyliner"),
    ("호텔 체크인", "hotel-checkin"),
    ("야나카긴자", "yanaka-ginza"),
    ("아메요코", "ueno-ameyoko"),
    ("PARCO", "shibuya-parco"),
    ("LOFT", "shibuya-loft"),
    ("캣스트리트", "harajuku"),
    ("다케시타", "harajuku"),
    ("오모테산도", "omotesando"),
    ("요도바시", "yodobashi-akiba"),
    ("가챠", "akihabara-gacha"),
    ("이토야", "ginza-itoya"),
    ("체크아웃", "checkout-luggage"),
    ("캐릭터스트리트", "tokyo-character-street"),
    ("스카이라이너 → 나리타", "departure"),
]

p = os.path.join(ROOT, "data", "itinerary.json")
itin = json.load(open(p, encoding="utf-8"))
linked, skipped = [], []
for d in itin.get("days", []):
    for s in d.get("stops", []):
        name = s.get("name", "")
        s.pop("guide", None)  # reset so removed guides don't linger
        for sub, gid in RULES:
            if sub in name:
                if gid in guides:
                    s["guide"] = gid
                    linked.append(f"{name} → {gid}")
                else:
                    skipped.append(f"{name} → {gid}(없음)")
                break

json.dump(itin, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("linked:")
for x in linked:
    print("  ✓", x)
if skipped:
    print("skipped (guide not built yet):")
    for x in skipped:
        print("  -", x)
