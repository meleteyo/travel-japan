#!/usr/bin/env python3
"""Download every remote image referenced in data/*.json, convert to WebP for
offline use, and rewrite the JSON to local relative paths. Best-effort: on any
failure the field is blanked so the app falls back gracefully."""
import json, os, re, hashlib, subprocess, urllib.request, urllib.error, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGDIR = os.path.join(ROOT, "assets", "img")
os.makedirs(IMGDIR, exist_ok=True)
IMG_KEYS = {"imageUrl", "heroImageUrl"}
UA = "TokyoFamilyGuide/1.0 (https://github.com/meleteyo/travel-japan; personal family travel guide; contact: cyes74@gmail.com) Python-urllib"

cache = {}     # url -> relpath or ""
sources = []   # (relpath, url)
ok = fail = 0

def fetch(url):
    global ok, fail
    if url in cache:
        return cache[url]
    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    rel = f"assets/img/{h}.webp"
    dst = os.path.join(ROOT, rel)
    if os.path.exists(dst):
        cache[url] = rel; sources.append((rel, url)); return rel
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://www.google.com/"})
            raw = urllib.request.urlopen(req, timeout=30).read()
            if len(raw) < 800:
                raise ValueError("too small")
            with tempfile.NamedTemporaryFile(delete=False) as tf:
                tf.write(raw); tmp = tf.name
            r = subprocess.run(["cwebp", "-quiet", "-q", "78", tmp, "-o", dst], capture_output=True)
            os.unlink(tmp)
            if r.returncode != 0 or not os.path.exists(dst):
                raise RuntimeError("cwebp failed: " + r.stderr.decode()[:50])
            cache[url] = rel; sources.append((rel, url)); ok += 1
            print("  ok ", rel, "<-", url[:64], flush=True)
            time.sleep(1.8)   # be polite to wikimedia
            return rel
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:
                time.sleep(6 * (attempt + 1)); continue
            last = f"HTTP {e.code}"
        except Exception as e:
            if attempt < 2:
                time.sleep(3); continue
            last = str(e)[:50]
        break
    cache[url] = ""; fail += 1
    print("  XX ", url[:72], "::", last)
    return ""

def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in IMG_KEYS and isinstance(v, str) and v.startswith("http"):
                o[k] = fetch(v)
            else:
                walk(v)
    elif isinstance(o, list):
        for it in o:
            walk(it)

for name in ["restaurants.json", "musteat.json", "places.json", "photospots.json"]:
    p = os.path.join(ROOT, "data", name)
    obj = json.load(open(p, encoding="utf-8"))
    print("==", name)
    walk(obj)
    json.dump(obj, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

with open(os.path.join(ROOT, "assets", "img-sources.md"), "w", encoding="utf-8") as f:
    f.write("# 이미지 출처 (가족 비공개·사전 다운로드용)\n\n")
    f.write("아래 로컬 이미지는 표기된 원본 URL에서 가져왔습니다. 일부는 해당 식당 고유 사진이 아닌 '음식 종류/장소' 대표 사진일 수 있습니다.\n\n")
    for rel, url in sources:
        f.write(f"- `{rel}` ← {url}\n")

print(f"\nDONE: {ok} ok, {fail} failed, {len(set(s[0] for s in sources))} files")
