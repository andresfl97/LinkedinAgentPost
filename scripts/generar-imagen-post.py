import argparse
import json
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
SIDEBAR = 56

BG = "#0B0F14"
PANEL = "#131A22"
PANEL_ALT = "#0F151C"
BORDER = "#243040"
TEXT = "#E6EDF3"
MUTED = "#8B98A5"
GREEN = "#3FB950"
BLUE = "#58A6FF"
AMBER = "#D29922"
FONT_DIR = r"C:\Windows\Fonts"
MONO = os.path.join(FONT_DIR, "consola.ttf")
MONO_B = os.path.join(FONT_DIR, "consolab.ttf")
SANS = os.path.join(FONT_DIR, "segoeui.ttf")
SANS_B = os.path.join(FONT_DIR, "segoeuib.ttf")

KEYWORDS = {
    "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "LEFT", "JOIN",
    "ON", "AS", "AND", "OVER", "PARTITION", "DESC", "ASC", "TOP", "INNER",
    "HAVING", "CASE", "WHEN", "THEN", "END", "WITH", "UNION", "ALL",
}
FUNCS = {
    "SUM", "COUNT", "AVG", "MIN", "MAX", "RANK", "DENSE_RANK", "ROW_NUMBER",
    "CUME_DIST", "PERCENT_RANK", "NTILE", "LAG", "LEAD",
}


def font(path, size):
    return ImageFont.truetype(path, size)


def tokenize_color(token):
    bare = token.strip("(),;")
    upper = bare.upper()
    if upper in KEYWORDS:
        return BLUE
    if upper in FUNCS:
        return GREEN
    if token.startswith("--"):
        return MUTED
    if token[:1] in ("'", '"'):
        return AMBER
    if bare.isdigit() or (bare.replace(".", "", 1).isdigit() and bare.count(".") <= 1):
        return AMBER
    return TEXT


def draw_query(draw, x, y, width, lines, max_lines):
    mono = font(MONO, 21)
    mono_b = font(MONO_B, 21)
    lh = 30
    visible = lines[: max_lines - 1]
    truncated = len(lines) > max_lines
    for i, raw in enumerate(visible):
        cx = x
        if i == 0:
            draw.text((cx, y + i * lh), str(i + 1), font=mono, fill=MUTED)
            cx += 34
        stripped = raw.lstrip()
        indent = len(raw) - len(stripped)
        cx += indent * 11
        for token in stripped.split(" "):
            if not token:
                cx += 6
                continue
            color = tokenize_color(token)
            f = mono_b if token.strip("(),;").upper() in KEYWORDS | FUNCS else mono
            draw.text((cx, y + i * lh), token, font=f, fill=color)
            cx += int(draw.textlength(token + " ", font=mono))
        if cx > x + width:
            break
    if truncated:
        draw.text((x + 34, y + len(visible) * lh), "...", font=mono_b, fill=MUTED)


def wrap(draw, text, f, max_width):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        probe = (cur + " " + w).strip()
        if draw.textlength(probe, font=f) <= max_width:
            cur = probe
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def build(cfg):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    d.rectangle([W - SIDEBAR, 0, W, H], fill="#070A0E")
    d.line([(W - SIDEBAR, 0), (W - SIDEBAR, H)], fill=BORDER, width=2)

    brand = Image.new("RGBA", (900, 60), (0, 0, 0, 0))
    bd = ImageDraw.Draw(brand)
    bf = font(SANS_B, 34)
    tw = int(bd.textlength("KIRA AI", font=bf))
    bd.text(((900 - tw) / 2, 10), "KIRA AI", font=bf, fill=GREEN)
    brand = brand.rotate(90, expand=True)
    img.paste(brand, (W - SIDEBAR - 60 + 12, (H - brand.height) // 2), brand)
    d = ImageDraw.Draw(img)

    margin = 56
    content_w = W - SIDEBAR - margin * 2
    y = 56

    label = font(MONO_B, 18)
    d.text((margin, y), cfg["label"].upper(), font=label, fill=GREEN)
    y += 34

    title_f = font(SANS_B, 40)
    title_lines = wrap(d, cfg["title"], title_f, content_w)
    for line in title_lines[:3]:
        d.text((margin, y), line, font=title_f, fill=TEXT)
        y += 50
    y += 14

    d.line([(margin, y), (margin + 64, y)], fill=GREEN, width=4)
    y += 34

    q_lines = cfg["query"][:11]
    q_h = 42 + 30 * len(q_lines) + 14
    rounded(d, [margin, y, margin + content_w, y + q_h], 14, PANEL, BORDER, 2)
    d.rectangle([margin, y, margin + 4, y + q_h], fill=GREEN)
    d.text((margin + 26, y + 16), "SQL", font=font(MONO_B, 18), fill=MUTED)
    draw_query(d, margin + 26, y + 52, content_w - 52, cfg["query"], 11)
    y += q_h + 22

    cols = cfg["columns"]
    col_w = content_w // len(cols)
    rounded(d, [margin, y, margin + content_w, y + 44], 10, PANEL_ALT, BORDER, 2)
    head_f = font(MONO_B, 17)
    for i, c in enumerate(cols):
        d.text((margin + 20 + i * col_w, y + 13), c.upper(), font=head_f, fill=MUTED)
    y += 50

    row_h = 46
    gap = 6
    take_h = 108
    take_y = H - 48 - take_h
    max_rows = max(1, int((take_y - 24 - y) // (row_h + gap)))
    rows = cfg["rows"][:max_rows]
    num_f = font(MONO, 20)
    num_b = font(MONO_B, 20)
    for r_i, row in enumerate(rows):
        top = cfg.get("highlight_rows", [])
        bg = PANEL if r_i in top else PANEL_ALT
        rounded(d, [margin, y, margin + content_w, y + row_h], 8, bg, BORDER, 1)
        if r_i in top:
            d.rectangle([margin, y, margin + 3, y + row_h], fill=GREEN)
        for i, cell in enumerate(row):
            val = str(cell)
            f = num_b if r_i in top else num_f
            color = GREEN if r_i in top else TEXT
            w_px = d.textlength(val, font=f)
            if i == 0:
                d.text((margin + 20, y + 14), val, font=f, fill=color)
            else:
                d.text((margin + 20 + i * col_w + col_w - 40 - w_px, y + 14), val, font=f, fill=color)
        y += row_h + gap

    y = max(y + 10, take_y)
    rounded(d, [margin, y, margin + content_w, y + take_h], 14, PANEL, BORDER, 2)
    d.rectangle([margin, y, margin + 4, y + take_h], fill=BLUE)
    d.text((margin + 26, y + 18), "TAKEAWAY", font=font(MONO_B, 17), fill=BLUE)
    take_f = font(SANS, 23)
    for i, line in enumerate(wrap(d, cfg["takeaway"], take_f, content_w - 60)[:2]):
        d.text((margin + 26, y + 50 + i * 30), line, font=take_f, fill=TEXT)

    return img


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--config", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    with open(args.config, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    img = build(cfg)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    img.save(args.out)
    print(f"saved {args.out} {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
