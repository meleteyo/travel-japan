#!/usr/bin/env python3
"""Generate app icons (warm torii ⛩ on orange) as PNGs — pure stdlib, no deps."""
import os, zlib, struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON = os.path.join(ROOT, "assets", "icons")
os.makedirs(ICON, exist_ok=True)

BG = (232, 116, 59, 255)      # --primary
INK = (255, 255, 255, 255)    # white torii

def png(path, N):
    buf = bytearray(BG * (N * N))
    def rect(x0, y0, x1, y1, c=INK):
        xa, xb = int(x0 * N), int(x1 * N)
        ya, yb = int(y0 * N), int(y1 * N)
        for y in range(max(0, ya), min(N, yb)):
            row = y * N
            for x in range(max(0, xa), min(N, xb)):
                i = (row + x) * 4
                buf[i:i+4] = bytes(c)
    # torii: top roof beam (kasagi) with overhang, second beam (nuki), two pillars, center post
    rect(0.15, 0.235, 0.85, 0.265)   # roof overhang (thin top edge)
    rect(0.18, 0.265, 0.82, 0.335)   # kasagi (main top beam)
    rect(0.255, 0.425, 0.745, 0.485) # nuki (second beam)
    rect(0.305, 0.335, 0.345, 0.425) # center post (gakuzuka)
    rect(0.30, 0.335, 0.375, 0.79)   # left pillar
    rect(0.625, 0.335, 0.70, 0.79)   # right pillar
    # raw -> filtered scanlines (filter 0)
    raw = bytearray()
    for y in range(N):
        raw.append(0)
        raw += buf[y*N*4:(y+1)*N*4]
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)
    out = b"\x89PNG\r\n\x1a\n"
    out += chunk(b"IHDR", struct.pack(">IIBBBBB", N, N, 8, 6, 0, 0, 0))
    out += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    out += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(out)
    print("wrote", os.path.relpath(path, ROOT), f"({len(out)} bytes, {N}px)")

png(os.path.join(ICON, "icon-192.png"), 192)
png(os.path.join(ICON, "icon-512.png"), 512)
png(os.path.join(ICON, "apple-touch-icon-180.png"), 180)
png(os.path.join(ROOT, "favicon-32.png"), 32)
print("done.")
