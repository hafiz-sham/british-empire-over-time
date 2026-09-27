"""Shared paths, year range and upstream dataset definitions for the pipeline."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
CURATED = ROOT / "data" / "curated"
PROCESSED = ROOT / "data" / "processed"
SITE_DATA = ROOT / "site" / "data"

YEAR_MIN = 1900
YEAR_MAX = 2026

# Upstream datasets. Raw files are gitignored; 01_fetch.py downloads them and
# records provenance in data/raw/SOURCES.md.
DATASETS = {
    "natural_earth_admin0_50m": {
        "title": "Natural Earth, Admin 0 – Countries, 1:50m",
        "url": "https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip",
        "homepage": "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/",
        "licence": "Public domain (https://www.naturalearthdata.com/about/terms-of-use/)",
        "citation": "Natural Earth. Free vector and raster map data @ naturalearthdata.com.",
    },
    "icow_colonial_history": {
        "title": "ICOW Colonial History Data Set, version 1.1",
        "url": "http://www.paulhensel.org/Data/colhist.zip",
        "homepage": "http://www.paulhensel.org/icowcol.html",
        "licence": (
            "No open licence. The authors ask users not to redistribute the data "
            "and to download it from the official site, so it is not committed here."
        ),
        "citation": (
            'Paul R. Hensel (2018). "ICOW Colonial History Data Set, version 1.1." '
            "Available at http://www.paulhensel.org/icowcol.html."
        ),
    },
}
