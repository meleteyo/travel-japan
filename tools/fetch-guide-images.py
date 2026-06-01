#!/usr/bin/env python3
"""Fetch representative product/category photos for the buy-* shopping guides
from Wikimedia Commons, convert to WebP, and write hero + gallery into guides.json.
Best-effort: missing images are skipped. Idempotent (skips already-downloaded)."""
import json, os, hashlib, subprocess, tempfile, urllib.request, urllib.parse, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "TokyoFamilyGuide/1.0 (https://github.com/meleteyo/travel-japan; cyes74@gmail.com)"

# guide id -> [(caption, commons search term), ...]
GAL = {
    "buy-nintendo": [("슈퍼마리오 굿즈", "Super Mario merchandise"), ("amiibo 피규어", "amiibo figure"), ("닌텐도 스토어", "Nintendo Tokyo store")],
    "buy-pokemon": [("포켓몬 인형", "Pokemon plush toy"), ("포켓몬 카드(TCG)", "Pokemon Trading Card Game cards"), ("포켓몬센터", "Pokemon Center store")],
    "buy-loft": [("마스킹테이프", "washi masking tape"), ("스티커·문구", "Japanese stationery"), ("다이어리 꾸미기", "sticker decoration notebook")],
    "buy-gacha": [("가챠폰 기계", "Gashapon vending machines"), ("캡슐토이", "capsule toy gashapon"), ("피규어 매장", "figure shop Akihabara")],
    "buy-yodobashi": [("이어폰·헤드폰", "wireless earphones headphones"), ("전자제품 매장", "Yodobashi Camera store interior"), ("게임 주변기기", "game controller accessories")],
    "buy-itoya": [("만년필", "fountain pen"), ("노트·문구", "notebook stationery"), ("편지지·종이", "letter paper stationery")],
    "buy-character-street": [("캐릭터 굿즈", "Sanrio character goods shop"), ("도쿄 캐릭터스트리트", "Tokyo Character Street"), ("기념품 과자", "Japanese souvenir sweets")],
}

def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=30)

def commons_search(q):
    u = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
         "&gsrsearch=" + urllib.parse.quote(q) + "&gsrnamespace=6&gsrlimit=12"
         "&prop=imageinfo&iiprop=url|mime&iiurlwidth=900&format=json")
    d = json.loads(get(u).read())
    pages = (d.get("query", {}) or {}).get("pages", {}) or {}
    # prefer landscape-ish jpg/png
    cands = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") in ("image/jpeg", "image/png") and (ii.get("thumburl") or ii.get("url")):
            cands.append(ii.get("thumburl") or ii.get("url"))
    return cands

def download_webp(url):
    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    rel = f"assets/img/{h}.webp"
    dst = os.path.join(ROOT, rel)
    if os.path.exists(dst):
        return rel
    raw = get(url).read()
    if len(raw) < 1500:
        raise RuntimeError("too small")
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(raw); tmp = tf.name
    r = subprocess.run(["cwebp", "-quiet", "-q", "80", "-resize", "900", "0", tmp, "-o", dst], capture_output=True)
    os.unlink(tmp)
    if r.returncode != 0 or not os.path.exists(dst):
        raise RuntimeError("cwebp failed")
    return rel

p = os.path.join(ROOT, "data", "guides.json")
doc = json.load(open(p, encoding="utf-8"))
guides = doc["guides"]
used = set()
src_log = []
for gid, items in GAL.items():
    g = guides.get(gid)
    if not g:
        print("  -- no guide:", gid); continue
    gallery = []
    for caption, term in items:
        got = None
        for url in commons_search(term):
            if url in used:
                continue
            try:
                rel = download_webp(url)
                got = rel; used.add(url); src_log.append((gid, rel, url))
                time.sleep(0.8)
                break
            except Exception:
                continue
        if got:
            gallery.append({"src": got, "caption": caption})
            print(f"  ok {gid}: {caption} -> {got}")
        else:
            print(f"  XX {gid}: {caption} (no image)")
    if gallery:
        g["gallery"] = gallery
        g["heroImg"] = gallery[0]["src"]

json.dump(doc, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
with open(os.path.join(ROOT, "assets", "img-sources.md"), "a", encoding="utf-8") as f:
    for gid, rel, url in src_log:
        f.write(f"- `{rel}` (guide:{gid}) <- {url}\n")
print(f"\nDONE: {len(src_log)} images across buy guides")
