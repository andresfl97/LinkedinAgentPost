import argparse
import html
import json
import os
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

W, H = 1080, 1350

CHROMES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]

THEMES = {
    "light": {
        "bg": "#FBFBFD", "ink": "#1D1D1F", "sub": "#6E6E73",
        "muted": "#86868B", "line": "#D2D2D7", "accent": "#0071E3",
    },
    "dark": {
        "bg": "#000000", "ink": "#F5F5F7", "sub": "#A1A1A6",
        "muted": "#86868B", "line": "#2C2C2E", "accent": "#2997FF",
    },
}


def esc(t):
    return html.escape(str(t))


def css_vars(t):
    return f"""
    --bg:{t['bg']}; --ink:{t['ink']}; --sub:{t['sub']};
    --muted:{t['muted']}; --line:{t['line']}; --accent:{t['accent']};
    """


def base_style(t):
    return f"""
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html,body {{ width:{W}px; height:{H}px; }}
  body {{ background:var(--bg); color:var(--ink); overflow:hidden;
    font-family:'Segoe UI','Helvetica Neue',Arial,system-ui,sans-serif;
    -webkit-font-smoothing:antialiased; }}
  .slide {{ width:{W}px; height:{H}px; padding:96px 104px; display:flex; flex-direction:column; }}
  .kicker {{ font-size:16px; font-weight:600; letter-spacing:.20em; text-transform:uppercase; color:var(--muted); }}
  .accent-line {{ width:56px; height:6px; border-radius:6px; background:var(--accent); margin-top:26px; }}
  .spacer {{ flex:1 1 auto; }}
  .hairline {{ height:1px; background:var(--line); width:100%; }}
  .footer {{ display:flex; justify-content:space-between; align-items:center;
    font-size:16px; letter-spacing:.04em; color:var(--muted); padding-top:22px; }}
  .footer .r {{ display:flex; align-items:center; gap:10px; }}
  .dot {{ width:8px; height:8px; border-radius:50%; background:var(--accent); display:inline-block; }}
  """


def render_statement(cfg, t):
    note = f'<div class="note">{esc(cfg["note"])}</div>' if cfg.get("note") else ""
    sub = f'<div class="sub">{esc(cfg["sub"])}</div>' if cfg.get("sub") else ""
    return f"""
  .headline {{ font-size:{cfg.get('headline_size',104)}px; font-weight:700;
    letter-spacing:-.035em; line-height:1.02; color:var(--ink); max-width:920px; }}
  .sub {{ font-size:33px; font-weight:400; line-height:1.34; color:var(--sub); margin-top:40px; max-width:880px; }}
  .note {{ font-size:22px; color:var(--muted); margin-top:34px; }}
  .slide {{ justify-content:space-between; }}
  .mid {{ display:flex; flex-direction:column; justify-content:center; flex:1 1 auto; padding:40px 0; }}
</style></head><body><div class="slide">
  <div><div class="kicker">{esc(cfg.get('kicker',''))}</div></div>
  <div class="mid">
    <div class="headline">{esc(cfg.get('headline',''))}</div>
    {sub}
    {note}
  </div>
  <div class="hairline"></div>
  <div class="footer"><span>{esc(cfg.get('footer_left',''))}</span>
    <span class="r">{esc(cfg.get('footer_right',''))}<span class="dot"></span></span></div>
</div></body></html>"""


def render_list(cfg, t):
    rows = ""
    for i, it in enumerate(cfg.get("items", []), 1):
        rows += f"""
      <div class="row">
        <div class="idx">{i:02d}</div>
        <div class="txt">{esc(it)}</div>
      </div>"""
    return f"""
  .headline {{ font-size:{cfg.get('headline_size',66)}px; font-weight:700;
    letter-spacing:-.03em; line-height:1.06; color:var(--ink); max-width:900px; }}
  .list {{ margin-top:60px; }}
  .row {{ display:flex; gap:36px; align-items:baseline; padding:38px 0; border-top:1px solid var(--line); }}
  .row:last-child {{ border-bottom:1px solid var(--line); }}
  .idx {{ font-family:Consolas,'SF Mono',monospace; font-size:26px; color:var(--muted); min-width:56px; }}
  .txt {{ font-size:37px; font-weight:500; letter-spacing:-.01em; line-height:1.2; color:var(--ink); }}
  .mid {{ display:flex; flex-direction:column; justify-content:center; flex:1 1 auto; padding:30px 0; }}
</style></head><body><div class="slide">
  <div class="kicker">{esc(cfg.get('kicker',''))}</div>
  <div class="mid">
    <div class="headline">{esc(cfg.get('headline',''))}</div>
    <div class="list">{rows}</div>
  </div>
  <div class="hairline"></div>
  <div class="footer"><span>{esc(cfg.get('footer_left',''))}</span>
    <span class="r">{esc(cfg.get('footer_right',''))}<span class="dot"></span></span></div>
</div></body></html>"""


def render_split(cfg, t):
    cols = ""
    for c in cfg.get("cols", []):
        accent = c.get("accent", False)
        lbl_color = "var(--accent)" if accent else "var(--muted)"
        cols += f"""
      <div class="col">
        <div class="lbl" style="color:{lbl_color}">{esc(c.get('label',''))}</div>
        <div class="big">{esc(c.get('big',''))}</div>
        <div class="txt">{esc(c.get('text',''))}</div>
      </div>"""
    return f"""
  .headline {{ font-size:{cfg.get('headline_size',54)}px; font-weight:700;
    letter-spacing:-.03em; line-height:1.08; color:var(--ink); max-width:920px; }}
  .split {{ display:flex; margin-top:70px; }}
  .col {{ flex:1; padding:0 48px; }}
  .col:first-child {{ padding-left:0; }}
  .col:last-child {{ border-left:1px solid var(--line); padding-right:0; }}
  .lbl {{ font-size:22px; font-weight:600; letter-spacing:.10em; text-transform:uppercase; margin-bottom:26px; }}
  .big {{ font-size:74px; font-weight:700; letter-spacing:-.035em; line-height:1; color:var(--ink); margin-bottom:22px; }}
  .txt {{ font-size:29px; line-height:1.34; color:var(--sub); }}
  .mid {{ display:flex; flex-direction:column; justify-content:center; flex:1 1 auto; padding:30px 0; }}
</style></head><body><div class="slide">
  <div class="kicker">{esc(cfg.get('kicker',''))}</div>
  <div class="mid">
    <div class="headline">{esc(cfg.get('headline',''))}</div>
    <div class="split">{cols}</div>
  </div>
  <div class="hairline"></div>
  <div class="footer"><span>{esc(cfg.get('footer_left',''))}</span>
    <span class="r">{esc(cfg.get('footer_right',''))}<span class="dot"></span></span></div>
</div></body></html>"""


def render_chain(cfg, t):
    nodes = cfg.get("nodes", [])
    parts = []
    for i, n in enumerate(nodes):
        parts.append(f"""
      <div class="node">
        <div class="n">{i + 1:02d}</div>
        <div class="nt">{esc(n)}</div>
      </div>""")
        if i < len(nodes) - 1:
            parts.append('<div class="arrow">&#8594;</div>')
    chain = "".join(parts)
    return f"""
  .headline {{ font-size:{cfg.get('headline_size',54)}px; font-weight:700;
    letter-spacing:-.03em; line-height:1.08; color:var(--ink); max-width:920px; }}
  .chain {{ display:flex; align-items:stretch; margin-top:74px; }}
  .node {{ flex:1; border:1.5px solid var(--line); border-radius:22px; padding:34px 26px;
    display:flex; flex-direction:column; gap:16px; }}
  .n {{ font-family:Consolas,'SF Mono',monospace; font-size:20px; color:var(--muted); }}
  .nt {{ font-size:29px; font-weight:600; letter-spacing:-.01em; line-height:1.18; color:var(--ink); }}
  .arrow {{ display:flex; align-items:center; justify-content:center; color:var(--muted);
    font-size:34px; padding:0 14px; }}
  .mid {{ display:flex; flex-direction:column; justify-content:center; flex:1 1 auto; padding:30px 0; }}
</style></head><body><div class="slide">
  <div class="kicker">{esc(cfg.get('kicker',''))}</div>
  <div class="mid">
    <div class="headline">{esc(cfg.get('headline',''))}</div>
    <div class="chain">{chain}</div>
  </div>
  <div class="hairline"></div>
  <div class="footer"><span>{esc(cfg.get('footer_left',''))}</span>
    <span class="r">{esc(cfg.get('footer_right',''))}<span class="dot"></span></span></div>
</div></body></html>"""


def render_html(cfg):
    t = THEMES.get(cfg.get("theme", "light"), THEMES["light"])
    if cfg.get("accent"):
        t = dict(t, accent=cfg["accent"])
    style = base_style(t)
    s = cfg.get("style")
    if s == "list":
        body = render_list(cfg, t)
    elif s == "split":
        body = render_split(cfg, t)
    elif s == "chain":
        body = render_chain(cfg, t)
    else:
        body = render_statement(cfg, t)
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>:root {{ {css_vars(t)} }}{style}{body}</html>"""


def find_chrome():
    for p in CHROMES:
        if os.path.exists(p):
            return p
    raise SystemExit("No encontre Chrome ni Edge.")


def screenshot(html_text, out_png, chrome):
    workdir = tempfile.mkdtemp(prefix="liimg-")
    html_path = Path(workdir) / "slide.html"
    html_path.write_text(html_text, encoding="utf-8")
    tmp_out = Path(workdir) / "shot.png"
    cmd = [
        chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--hide-scrollbars", "--force-device-scale-factor=1",
        f"--window-size={W},{H}", f"--user-data-dir={workdir}/prof",
        f"--screenshot={tmp_out}", html_path.as_uri(),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    img = Image.open(tmp_out).convert("RGB")
    if img.size != (W, H):
        img = img.resize((W, H))
    os.makedirs(os.path.dirname(os.path.abspath(out_png)), exist_ok=True)
    img.save(out_png)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--config", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    with open(args.config, encoding="utf-8") as f:
        cfg = json.load(f)
    chrome = find_chrome()
    screenshot(render_html(cfg), args.out, chrome)
    print(f"saved {args.out} {W}x{H} via {Path(chrome).name}")


if __name__ == "__main__":
    main()
