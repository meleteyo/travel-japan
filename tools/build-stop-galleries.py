#!/usr/bin/env python3
"""Add photo galleries to the 15 stop detail guides. Reuses existing local images
(places/photospots/musteat + buy-guide galleries) and fetches only the few missing
scene photos from Wikimedia Commons. Idempotent."""
import json, os, hashlib, subprocess, tempfile, urllib.request, urllib.parse, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "TokyoFamilyGuide/1.0 (https://github.com/meleteyo/travel-japan; cyes74@gmail.com)"

def load(f):
    return json.load(open(os.path.join(ROOT, "data", f), encoding="utf-8"))

PL = {p["key"]: p.get("imageUrl", "") for p in load("places.json")["items"]}
PL.update({p["key"]: p.get("imageUrl", "") for p in load("photospots.json")["items"] if p.get("imageUrl")})
ME = {m["key"]: m.get("imageUrl", "") for m in load("musteat.json")["items"]}
gdoc = load("guides.json"); G = gdoc["guides"]

def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=30)

def commons(term):
    u = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
         "&gsrsearch=" + urllib.parse.quote(term) + "&gsrnamespace=6&gsrlimit=12"
         "&prop=imageinfo&iiprop=url|mime&iiurlwidth=900&format=json")
    d = json.loads(get(u).read())
    out = []
    for p in (d.get("query", {}) or {}).get("pages", {}).values():
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") in ("image/jpeg", "image/png"):
            out.append(ii.get("thumburl") or ii.get("url"))
    return out

def webp(url):
    rel = "assets/img/" + hashlib.sha1(url.encode()).hexdigest()[:16] + ".webp"
    dst = os.path.join(ROOT, rel)
    if os.path.exists(dst):
        return rel
    raw = get(url).read()
    if len(raw) < 1500:
        raise RuntimeError("small")
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(raw); tmp = tf.name
    r = subprocess.run(["cwebp", "-quiet", "-q", "80", "-resize", "900", "0", tmp, "-o", dst], capture_output=True)
    os.unlink(tmp)
    if r.returncode != 0:
        raise RuntimeError("cwebp")
    return rel

_fetch_cache = {}
def fetch(term):
    if term in _fetch_cache:
        return _fetch_cache[term]
    for url in commons(term):
        try:
            rel = webp(url); _fetch_cache[term] = (rel, url); time.sleep(0.8); return rel, url
        except Exception:
            continue
    _fetch_cache[term] = (None, None); return None, None

# stop guide id -> [(caption, ref)]  ref: p:KEY | m:KEY | g:GUIDE:N | f:TERM
GAL = {
    "narita-arrival": [("스카이라이너", "p:keisei-skyliner"), ("Welcome Suica 카드", "p:welcome-suica"), ("나리타 제2터미널", "f:Narita International Airport Terminal 2 interior")],
    "skyliner": [("스카이라이너", "p:keisei-skyliner"), ("닛포리역", "f:Nippori Station platform")],
    "yanaka-ginza": [("야나카긴자", "p:yanaka-ginza"), ("멘치카츠 간식", "f:menchi katsu")],
    "ueno-ameyoko": [("아메요코 시장", "p:ameyoko"), ("우에노 공원", "p:ueno-park")],
    "shibuya-parco": [("닌텐도 TOKYO", "p:nintendo-tokyo"), ("포켓몬센터", "p:pokemon-center-shibuya"), ("시부야 스크램블", "p:shibuya-scramble")],
    "shibuya-loft": [("마스킹테이프", "g:buy-loft:0"), ("스티커·문구", "g:buy-loft:1")],
    "harajuku": [("다케시타도리", "p:harajuku-takeshita"), ("캣스트리트", "p:cat-street"), ("하라주쿠 크레페", "m:harajuku-crepe")],
    "omotesando": [("오모테산도", "p:omotesando"), ("메이지신궁", "p:meiji-jingu"), ("파르페", "m:parfait")],
    "yodobashi-akiba": [("이어폰·헤드폰", "g:buy-yodobashi:0"), ("게임 주변기기", "g:buy-yodobashi:2"), ("요도바시 매장", "p:yodobashi-akiba")],
    "akihabara-gacha": [("가챠폰 기계", "g:buy-gacha:0"), ("캡슐토이", "g:buy-gacha:1"), ("아키하바라", "p:akihabara")],
    "ginza-itoya": [("만년필", "g:buy-itoya:0"), ("노트·문구", "g:buy-itoya:1"), ("긴자 이토야", "p:ginza-itoya")],
    "checkout-luggage": [("도쿄역", "p:tokyo-station"), ("코인락커", "f:coin locker train station Japan")],
    "tokyo-character-street": [("캐릭터스트리트", "p:tokyo-character-street"), ("츠케멘(라멘스트리트)", "m:tsukemen"), ("에키벤·주먹밥", "m:onigiri")],
    "departure": [("스카이라이너", "p:keisei-skyliner"), ("나리타 출국·체크인", "f:Narita Airport departure terminal check-in")],
    "ride-shibuya": [("시부야 스크램블", "p:shibuya-scramble"), ("하치코 출구", "p:hachiko")],
    "ride-akihabara": [("아키하바라 전기가", "p:akihabara"), ("요도바시 아키바", "p:yodobashi-akiba")],
}

def resolve(ref):
    kind, _, rest = ref.partition(":")
    if kind == "p":
        return PL.get(rest, "")
    if kind == "m":
        return ME.get(rest, "")
    if kind == "g":
        gid, _, n = rest.partition(":")
        gl = (G.get(gid, {}) or {}).get("gallery", [])
        i = int(n)
        return gl[i]["src"] if i < len(gl) else ""
    if kind == "f":
        rel, _ = fetch(rest)
        return rel or ""
    return ""

log = []
for gid, items in GAL.items():
    g = G.get(gid)
    if not g:
        print("  -- no guide:", gid); continue
    gal = []
    for caption, ref in items:
        src = resolve(ref)
        if src:
            gal.append({"src": src, "caption": caption})
            print(f"  ok {gid}: {caption} -> {src}")
            if ref.startswith("f:"):
                log.append((gid, src, ref[2:]))
        else:
            print(f"  XX {gid}: {caption} ({ref})")
    if gal:
        g["gallery"] = gal

json.dump(gdoc, open(os.path.join(ROOT, "data", "guides.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
if log:
    with open(os.path.join(ROOT, "assets", "img-sources.md"), "a", encoding="utf-8") as f:
        for gid, rel, term in log:
            f.write(f"- `{rel}` (guide:{gid} fetch:{term})\n")
print("\nDONE. stop guides with gallery:", sum(1 for gid in GAL if G.get(gid, {}).get('gallery')))
