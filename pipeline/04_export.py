"""Join curated periods with geometry and write the site's data files.

Outputs (written to data/processed and copied to site/data):
  world.topojson    geometry, from 02_build_geometry.py
  territories.json  statuses, sources and each territory's ordered periods

Usage: python pipeline/04_export.py
"""

import json
import shutil

import pandas as pd

from config import CURATED, PROCESSED, SITE_DATA, YEAR_MAX, YEAR_MIN
from schema import STATUSES


def read(name):
    return pd.read_csv(CURATED / name, dtype=str, keep_default_na=False)


def period_record(p):
    rec = {
        "start": int(p["start"]),
        "end": int(p["end"]) if p["end"] else None,
        "status": p["status"],
        "coverage": p["coverage"],
        "sources": [s.strip() for s in p["source_ids"].split(";") if s.strip()],
    }
    for col in ("start_date", "end_date", "unit", "notes", "issue"):
        if p[col]:
            rec[col] = p[col]
    if p["coverage"] == "point":
        rec["marker"] = [float(v) for v in p["marker"].split()]
    return rec


def main():
    territories, periods, sources = read("territories.csv"), read("periods.csv"), read("sources.csv")
    events = read("events.csv")
    geometry = pd.read_csv(PROCESSED / "geometry_index.csv").set_index("id")

    out_territories = []
    for _, t in territories.sort_values("territory_id").iterrows():
        g = geometry.loc[t["territory_id"]]
        p = periods[periods["territory_id"] == t["territory_id"]].copy()
        p = p.assign(_start=p["start"].astype(int)).sort_values("_start")
        out_territories.append({
            "id": t["territory_id"],
            "name": t["name"],
            "area_km2": float(g["area_km2"]),
            "label": [float(g["label_lon"]), float(g["label_lat"])],
            "periods": [period_record(r) for _, r in p.iterrows()],
        })

    data = {
        "world_area_km2": round(float(geometry["area_km2"].sum())),  # all mapped land (no Antarctica)
        "year_min": YEAR_MIN,
        "year_max": YEAR_MAX,
        "statuses": STATUSES,
        "sources": {
            s["source_id"]: {k: s[k] for k in ("type", "citation", "url") if s[k]}
            for _, s in sources.iterrows()
        },
        "events": [
            {"year": int(e["year"]), "label": e["label"], "description": e["description"],
             "sources": [s.strip() for s in e["source_ids"].split(";") if s.strip()]}
            for _, e in events.sort_values("year", key=lambda y: y.astype(int)).iterrows()
        ],
        "territories": out_territories,
    }

    path = PROCESSED / "territories.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8", newline="\n")

    SITE_DATA.mkdir(parents=True, exist_ok=True)
    for name in ("world.topojson", "territories.json"):
        shutil.copy2(PROCESSED / name, SITE_DATA / name)

    n_periods = sum(len(t["periods"]) for t in out_territories)
    print(f"{len(out_territories)} territories, {n_periods} periods -> territories.json; copied to site/data")


if __name__ == "__main__":
    main()
