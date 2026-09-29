"""Serve the site locally with caching disabled, so edits show on reload.

Usage: python pipeline/serve.py [port]   (default 8000)
"""

import functools
import http.server
import sys

from config import ROOT


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = functools.partial(NoCacheHandler, directory=str(ROOT / "site"))
    print(f"Serving site/ at http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), handler).serve_forever()


if __name__ == "__main__":
    main()
