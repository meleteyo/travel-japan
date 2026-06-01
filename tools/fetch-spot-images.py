#!/usr/bin/env python3
"""Fetch a real representative photo for the new photospots via the Wikipedia
REST summary API (returns a direct upload.wikimedia.org URL), convert to WebP,
and write the local path back into data/photospots.json. Best-effort."""
import json, os, hashlib, subprocess, tempfile, urllib.request, urllib.parse, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGDIR = os.path.join(ROOT, "assets", "img")
os.makedirs(IMGDIR, exist_ok=True)
UA = "TokyoFamilyGuide/1.0 (https://github.com/meleteyo/travel-japan; personal family guide; cyes74@gmail.com)"

# photospot key -> English Wikipedia article title (list = try in order until an image is found)
TITLES = {
    "teamlab": ["teamLab Borderless", "teamLab Planets Tokyo", "Mori Building Digital Art Museum", "teamLab"],
    "shibuya-sky": "Shibuya Scramble Square",
    "meiji-jingu": "Meiji Shrine",
    "ueno-science": "National Museum of Nature and Science",
}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30)

def image_url(title):
    api = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title, safe="")
    data = json.loads(get(api).read())
    for k in ("originalimage", "thumbnail"):
        if data.get(k, {}).get("source"):
            return data[k]["source"]
    return None

def download_webp(url):
    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    rel = f"assets/img/{h}.webp"
    dst = os.path.join(ROOT, rel)
    if os.path.exists(dst):
        return rel
    raw = get(url).read()
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(raw); tmp = tf.name
    r = subprocess.run(["cwebp", "-quiet", "-q", "80", "-resize", "1280", "0", tmp, "-o", dst], capture_output=True)
    os.unlink(tmp)
    if r.returncode != 0 or not os.path.exists(dst):
        raise RuntimeError("cwebp failed")
    return rel

p = os.path.join(ROOT, "data", "photospots.json")
spots = json.load(open(p, encoding="utf-8"))
sources = []
for item in spots["items"]:
    key = item["key"]
    if key not in TITLES or item.get("imageUrl"):
        continue
    try:
        cands = TITLES[key]
        cands = cands if isinstance(cands, list) else [cands]
        url = None
        for tt in cands:
            try:
                url = image_url(tt)
                if url:
                    break
            except Exception:
                continue
        if not url:
            print("  -- no image:", key); continue
        rel = download_webp(url)
        item["imageUrl"] = rel
        sources.append((key, rel, url))
        print("  ok", key, "<-", url[:70])
        time.sleep(1.0)
    except Exception as e:
        print("  XX", key, "::", str(e)[:70])

json.dump(spots, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
# append provenance
with open(os.path.join(ROOT, "assets", "img-sources.md"), "a", encoding="utf-8") as f:
    for key, rel, url in sources:
        f.write(f"- `{rel}` (photospot:{key}) <- {url}\n")
print(f"\nDONE: {len(sources)} spot image(s) added")
