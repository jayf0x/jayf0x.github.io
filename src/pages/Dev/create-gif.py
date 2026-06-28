#!/usr/bin/env python3
"""Local GIF-capture API for the Dev page loop.

Run it, then click "capture gif" on the Dev page (http://localhost:5173/dev).
The frontend renders one loop per theme and POSTs every frame here; we assemble
one GIF per theme and write them next to this file.

    python3 create-gif.py

Endpoints:
    GET  /config  -> {"fps": N}                  (frontend asks how many fps)
    POST /frame   <- {mode, index, total, fps, data, isFinal}
                     data is a "data:image/png;base64,..." canvas read.
                     On isFinal we save loop-<mode>.gif.

Reliable, not fast. stdlib http.server + Pillow.
"""

import base64
import io
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from PIL import Image

PORT = 8723
FPS = 18  # frame config lives here; the frontend just follows
OUT_DIR = Path(__file__).resolve().parent

# Accumulated frames per mode, reset after each GIF is written.
_frames: dict[str, list[Image.Image]] = {}


def _save_gif(mode: str, fps: int) -> Path:
    frames = _frames.get(mode, [])
    if not frames:
        raise ValueError(f"no frames for mode {mode!r}")
    out = OUT_DIR / f"loop-{mode}.gif"
    duration = round(1000 / fps)
    # Quantize to a shared 256-color palette so file size stays in the MB range.
    pal = [f.convert("RGB").quantize(colors=256, method=Image.MEDIANCUT) for f in frames]
    pal[0].save(
        out,
        save_all=True,
        append_images=pal[1:],
        duration=duration,
        loop=0,
        optimize=True,
        disposal=2,
    )
    _frames[mode] = []
    return out


def _decode(data_url: str) -> Image.Image:
    b64 = data_url.split(",", 1)[1] if "," in data_url else data_url
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGBA")


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code: int, body: dict):
        payload = json.dumps(body).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/config"):
            self._json(200, {"fps": FPS})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        if not self.path.startswith("/frame"):
            self._json(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        msg = json.loads(self.rfile.read(length))
        mode = msg.get("mode", "dark")
        _frames.setdefault(mode, []).append(_decode(msg["data"]))

        if msg.get("isFinal"):
            out = _save_gif(mode, int(msg.get("fps", FPS)))
            size_mb = out.stat().st_size / 1e6
            print(f"  ✓ {out.name}  ({len(_frames.get(mode, [])) or msg['total']} frames, {size_mb:.2f} MB)")
            self._json(200, {"ok": True, "saved": out.name, "size_mb": round(size_mb, 2)})
        else:
            self._json(200, {"ok": True, "received": msg.get("index")})

    def log_message(self, *_):
        pass  # quiet — we print our own saves


def main():
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"create-gif API on http://localhost:{PORT}  (fps={FPS})")
    print("Click 'capture gif' on the Dev page. Ctrl-C to stop.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")


if __name__ == "__main__":
    main()
