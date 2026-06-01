#!/usr/bin/env python3
"""Scan static assets and inject the precache list + a content-based VERSION
into service-worker.js. Idempotent — safe to re-run after any asset change."""
import os, re, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW = os.path.join(ROOT, "service-worker.js")

ROOT_FILES = ["index.html", "manifest.webmanifest", "404.html", "offline.html", "favicon-32.png"]
DIRS = ["css", "js", "data", "assets/icons", "assets/maps", "assets/img"]
EXCLUDE_EXT = {".py", ".md"}
EXCLUDE_NAME = {"service-worker.js"}

paths = []
for f in ROOT_FILES:
    if os.path.exists(os.path.join(ROOT, f)):
        paths.append(f)
for d in DIRS:
    dp = os.path.join(ROOT, d)
    if not os.path.isdir(dp):
        continue
    for name in sorted(os.listdir(dp)):
        rel = d + "/" + name
        full = os.path.join(ROOT, rel)
        if not os.path.isfile(full):
            continue
        if os.path.splitext(name)[1].lower() in EXCLUDE_EXT or name in EXCLUDE_NAME:
            continue
        paths.append(rel)

paths = sorted(set(paths))
entries = ["./"] + paths

# version = hash of (path:size)
h = hashlib.sha1()
for p in paths:
    h.update((p + ":" + str(os.path.getsize(os.path.join(ROOT, p))) + ";").encode())
version = h.hexdigest()[:10]

arr = "const PRECACHE = [\n" + "".join(f"  '{p}',\n" for p in entries) + "];"

src = open(SW, encoding="utf-8").read()
src = re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{version}';", src, count=1)
src = re.sub(r"const PRECACHE = \[[\s\S]*?\];", arr, src, count=1)
open(SW, "w", encoding="utf-8").write(src)

print(f"VERSION={version}  ({len(entries)} entries precached)")
