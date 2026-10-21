"""Builds the Pixel Team hoodie print files (SVG) and a preview mockup.

Run: python3 make_hoodie.py
Output: back-print.svg, front-print.svg, mockup.html (rendered to PNG separately).
"""
import random
from pathlib import Path

OUT = Path(__file__).parent

# Colors picked from the Pixel Team banner
LAVENDER = "#c9cfe6"
GREEN = "#3dbf8a"
YELLOW = "#f2b233"
HOODIE = "#151830"

# 5x7 pixel font, drawn by hand
FONT = {
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    "C": [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "J": ["....#", "....#", "....#", "....#", "....#", "#...#", ".###."],
    "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    ">": [".#...", "..#..", "...#.", "....#", "...#.", "..#..", ".#..."],
    ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
    "_": [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
    " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
}


def block(x, y, size, color):
    gap = size * 0.14
    s = size - gap
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{s:.1f}" height="{s:.1f}" '
            f'rx="{s * 0.22:.1f}" fill="{color}"/>')


def text_width(text, cell):
    return len(text) * 6 * cell - cell


def draw_text(text, x, y, cell, color, special_i=False):
    """Draw text in pixel blocks. special_i colors the first I green with yellow corners."""
    parts = []
    used_special = False
    for ch in text:
        glyph = FONT[ch]
        for r, row in enumerate(glyph):
            for c, on in enumerate(row):
                if on != "#":
                    continue
                col = color
                if special_i and ch == "I" and not used_special:
                    col = YELLOW if (r, c) in ((0, 4), (6, 0)) else GREEN
                parts.append(block(x + c * cell, y + r * cell, cell, col))
        if special_i and ch == "I":
            used_special = True
        x += 6 * cell
    return "\n".join(parts)


def sparkle(x, y, r, color):
    return (f'<path d="M{x} {y - r}V{y + r}M{x - r} {y}H{x + r}" '
            f'stroke="{color}" stroke-width="{r * 0.18:.1f}" stroke-linecap="round"/>')


def back_print():
    W, H = 1200, 1500
    parts = []

    # Title, stacked: THE / PIXEL / TEAM
    for word, cell, y in (("THE", 22, 90), ("PIXEL", 34, 300), ("TEAM", 34, 600)):
        x = (W - text_width(word, cell)) / 2
        parts.append(draw_text(word, x, y, cell, LAVENDER, special_i=True))

    # Divider row of small blocks
    cell = 16
    count = 40
    x0 = (W - count * cell) / 2
    for i in range(count):
        col = GREEN if i % 8 == 0 else (YELLOW if i % 8 == 4 else "#3a4170")
        parts.append(block(x0 + i * cell, 880, cell, col))

    # Terminal style list of skills
    words = ["PYTHON", "HTML", "CSS", "JAVASCRIPT", "AI", "AND MORE"]
    cell = 9
    line_h = 9 * cell
    left = 330
    for i, w in enumerate(words):
        y = 950 + i * line_h
        parts.append(draw_text(">", left, y, cell, GREEN))
        parts.append(draw_text(w, left + 2 * 6 * cell, y, cell, LAVENDER))
    # Blinking-cursor block after the last line
    last_x = left + 2 * 6 * cell + text_width("AND MORE", cell) + 2 * cell
    parts.append(f'<rect x="{last_x}" y="{950 + 5 * line_h}" width="{4 * cell}" '
                 f'height="{7 * cell - 1}" fill="{YELLOW}"/>')

    # A few sparkles, like the banner
    for x, y, r in ((120, 160, 22), (1080, 250, 18), (140, 720, 16),
                    (1070, 640, 24), (190, 1150, 14), (1010, 1250, 18)):
        parts.append(sparkle(x, y, r, LAVENDER))

    # Small dot stars (fixed seed so the file is the same every run)
    rnd = random.Random(7)
    for _ in range(40):
        x, y = rnd.uniform(40, W - 40), rnd.uniform(40, H - 40)
        if 250 < x < 950 and 60 < y < 1400:
            continue
        parts.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(2, 4):.1f}" fill="{LAVENDER}"/>')

    body = "\n".join(parts)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}">\n{body}\n</svg>\n')


def front_print():
    W, H = 600, 200
    cell = 16
    word = "PIXEL"
    x = (W - text_width(word, cell)) / 2
    body = draw_text(word, x, (H - 7 * cell) / 2, cell, LAVENDER, special_i=True)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}">\n{body}\n</svg>\n')


HOODIE_PATH = (
    "M300 120 C330 60 470 60 500 120 L560 150 C640 180 690 220 710 300 "
    "L770 760 L690 780 L640 420 L640 900 L160 900 L160 420 L110 780 "
    "L30 760 L90 300 C110 220 160 180 240 150 Z"
)


def hoodie(label, print_svg, px, py, pw):
    return f"""
<figure>
  <svg viewBox="0 0 800 960" xmlns="http://www.w3.org/2000/svg">
    <path d="{HOODIE_PATH}" fill="{HOODIE}" stroke="#2a2f55" stroke-width="4"/>
    <path d="M300 120 C320 190 480 190 500 120" fill="none" stroke="#2a2f55" stroke-width="4"/>
    <rect x="160" y="860" width="480" height="40" fill="#11132a"/>
    <image href="data:image/svg+xml;base64,{print_svg}" x="{px}" y="{py}" width="{pw}"/>
  </svg>
  <figcaption>{label}</figcaption>
</figure>"""


def mockup(front_b64, back_b64):
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
body {{ margin:0; background:#e9e6df; font:600 28px/1.3 system-ui, sans-serif; color:#222; }}
main {{ display:flex; gap:40px; padding:40px; width:1680px; }}
figure {{ margin:0; flex:1; text-align:center; }}
svg {{ width:100%; }}
</style></head><body><main>
{hoodie("Front: small chest logo", front_b64, 440, 270, 150)}
{hoodie("Back: main design", back_b64, 205, 210, 390)}
</main></body></html>"""


if __name__ == "__main__":
    import base64
    back = back_print()
    front = front_print()
    (OUT / "back-print.svg").write_text(back)
    (OUT / "front-print.svg").write_text(front)
    b64 = lambda s: base64.b64encode(s.encode()).decode()
    (OUT / "mockup.html").write_text(mockup(b64(front), b64(back)))
    print("done")
