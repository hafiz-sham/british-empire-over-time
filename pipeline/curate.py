"""Helper for adding researched rows to the curated tables without hand-editing CSV quoting.

Usage (from a batch script):
    from curate import add_sources, add_territories, add_periods
Rows replace any existing rows with the same key (source_id / territory_id).
"""

import csv

from config import CURATED
from schema import PERIOD_COLUMNS, SOURCE_COLUMNS, TERRITORY_COLUMNS

BRITANNICA_LICENCE = "Copyright Encyclopaedia Britannica; cited for facts only"
OGL = "Open Government Licence v3.0"
ACCESSED = "2026-09-27"


def _rewrite(name, columns, rows, key):
    path = CURATED / name
    with open(path, encoding="utf-8", newline="") as f:
        existing = list(csv.DictReader(f))
    new_keys = {r[key] for r in rows}
    existing = [r for r in existing if r[key] not in new_keys]
    merged = existing + [{c: str(r.get(c, "")) for c in columns} for r in rows]
    merged.sort(key=lambda r: (r[key], int(r["start"]) if "start" in r and r["start"] else 0))
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=columns, lineterminator="\n")
        w.writeheader()
        w.writerows(merged)


def britannica(source_id, article, sections, slug):
    return {
        "source_id": source_id,
        "type": "reference",
        "citation": f'Encyclopaedia Britannica, "{article}", online edition; sections: {"; ".join(sections)}.',
        "url": f"https://www.britannica.com/place/{slug}",
        "accessed": ACCESSED,
        "licence": BRITANNICA_LICENCE,
    }


def act(source_id, title, url, provision="section 1"):
    return {
        "source_id": source_id,
        "type": "primary",
        "citation": f"{title}, {provision}.",
        "url": url,
        "accessed": ACCESSED,
        "licence": OGL,
    }


def add_sources(rows):
    _rewrite("sources.csv", SOURCE_COLUMNS, rows, "source_id")


def add_territories(rows):
    _rewrite("territories.csv", TERRITORY_COLUMNS, rows, "territory_id")


def add_periods(rows):
    """Replaces all periods of each territory present in `rows`."""
    _rewrite("periods.csv", PERIOD_COLUMNS, rows, "territory_id")


def period(territory_id, start, end, status, source_ids, unit="", coverage="full",
           notes="", start_date="", end_date="", issue=""):
    return {
        "territory_id": territory_id, "start": start, "end": "" if end is None else end,
        "start_date": start_date, "end_date": end_date, "status": status, "unit": unit,
        "coverage": coverage, "notes": notes, "source_ids": ";".join(source_ids), "issue": issue,
    }


FLOOR_NOTE = "Status already in place before 1900; shown from 1900, the start of the map."
