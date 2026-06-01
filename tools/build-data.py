#!/usr/bin/env python3
"""Transform the research-workflow output into final data/*.json files."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = "/private/tmp/claude-501/-Users-luna-projects-my-apps-travel-japan/cb0bad6e-05a3-44ea-bfc7-48f07f7ce603/tasks/wwmn36rz2.output"

def w(name, obj):
    p = os.path.join(ROOT, "data", name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    print("wrote", name, "(", os.path.getsize(p), "bytes )")

with open(OUT, encoding="utf-8") as f:
    data = json.load(f)
res = data["result"]

# ---- restaurants: regroup by dayId ----
def day_of(area):
    m = re.search(r"D([1-4])", area)
    if m:
        return "d" + m.group(1)
    if "닛포리" in area or "우에노" in area:
        return "d1"
    return "d1"

AREA_LABEL = {"d1": "닛포리 · 우에노", "d2": "시부야 · 하라주쿠", "d3": "아키하바라 · 긴자", "d4": "도쿄역 · 공통(체인)"}
buckets = {d: [] for d in ["d1", "d2", "d3", "d4"]}
for group in res["restaurants"]:
    did = day_of(group["area"])
    for r in group["restaurants"]:
        r.setdefault("heroImageUrl", "")
        r.setdefault("menu", [])
        buckets[did].append(r)
restaurants = {"days": [{"dayId": d, "area": AREA_LABEL[d], "restaurants": buckets[d]} for d in ["d1", "d2", "d3", "d4"]]}
w("restaurants.json", restaurants)

# ---- musteat ----
w("musteat.json", {"items": res["foods"]["items"]})

# ---- places (keyed lookup) ----
w("places.json", {"items": res["places"]["items"]})

# ---- photospots: scenic subset referencing place keys ----
SPOTS = ["shibuya-scramble", "hachiko", "harajuku-takeshita", "cat-street", "omotesando",
         "ueno-park", "ameyoko", "yanaka-ginza", "tokyo-station", "akihabara", "ginza"]
SPOT_DAY = {"yanaka-ginza": "d1", "ameyoko": "d1", "ueno-park": "d1",
            "shibuya-scramble": "d2", "hachiko": "d2", "harajuku-takeshita": "d2", "cat-street": "d2", "omotesando": "d2",
            "akihabara": "d3", "ginza": "d3", "tokyo-station": "d4"}
pmap = {p["key"]: p for p in res["places"]["items"]}
spots = []
for k in SPOTS:
    if k in pmap:
        p = pmap[k]
        spots.append({"key": k, "name": p["name"], "nameJa": p.get("nameJa", ""), "area": p.get("area", ""),
                      "note": p.get("note", ""), "gmapUrl": p.get("gmapUrl", ""), "dayId": SPOT_DAY.get(k, ""),
                      "imageUrl": p.get("imageUrl", "")})
w("photospots.json", {"items": spots})

# ---- medical (agent returned a string with a preamble) ----
mraw = res["medical"]
if isinstance(mraw, str):
    js = mraw[mraw.index("{"):]
    medical = json.loads(js)
else:
    medical = mraw
w("medical.json", medical)

print("done.")
