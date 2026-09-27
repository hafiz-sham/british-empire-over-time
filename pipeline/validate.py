"""Validate the curated tables before export.

Errors (exit code 1): schema problems, unknown ids or statuses, bad year ranges,
overlapping periods, missing or unknown sources, territories with no geometry.
Warnings: gaps between periods, territories with no periods, British dependencies
in the geometry with no curated territory.

Usage: python pipeline/validate.py
"""

import sys
from dataclasses import dataclass

import pandas as pd

from config import CURATED, PROCESSED, YEAR_MAX
from schema import (
    COVERAGE, PERIOD_COLUMNS, SOURCE_COLUMNS, SOURCE_TYPES, STATUSES, TERRITORY_COLUMNS,
)

YEAR_FLOOR = 1500  # the data model allows pre-1900 periods; anything earlier is a typo


@dataclass
class Finding:
    level: str  # "error" or "warning"
    where: str
    message: str

    def __str__(self):
        return f"{self.level.upper():7} {self.where}: {self.message}"


def read_csv(path):
    return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8")


def check_columns(df, expected, name):
    missing = [c for c in expected if c not in df.columns]
    return [Finding("error", name, f"missing columns {missing}")] if missing else []


def parse_year(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def check_sources(sources):
    out = check_columns(sources, SOURCE_COLUMNS, "sources.csv")
    if out:
        return out
    for dup in sources.loc[sources["source_id"].duplicated(), "source_id"]:
        out.append(Finding("error", f"source {dup}", "duplicate source_id"))
    for _, s in sources.iterrows():
        where = f"source {s['source_id'] or '(blank)'}"
        if not s["source_id"]:
            out.append(Finding("error", where, "blank source_id"))
        if s["type"] not in SOURCE_TYPES:
            out.append(Finding("error", where, f"type '{s['type']}' not in {sorted(SOURCE_TYPES)}"))
        if not s["citation"]:
            out.append(Finding("error", where, "missing citation"))
    return out


def check_territories(territories, geometry_ids):
    out = check_columns(territories, TERRITORY_COLUMNS, "territories.csv")
    if out:
        return out
    for dup in territories.loc[territories["territory_id"].duplicated(), "territory_id"]:
        out.append(Finding("error", dup, "duplicate territory_id"))
    for tid in territories["territory_id"]:
        if tid not in geometry_ids:
            out.append(Finding("error", tid, "no matching geometry in geometry_index.csv"))
    return out


def check_period_rows(periods, territory_ids, source_ids):
    out = check_columns(periods, PERIOD_COLUMNS, "periods.csv")
    if out:
        return out
    for i, p in periods.iterrows():
        where = f"{p['territory_id'] or '(blank)'} row {i + 2}"
        if p["territory_id"] not in territory_ids:
            out.append(Finding("error", where, "territory_id not in territories.csv"))
        if p["status"] not in STATUSES:
            out.append(Finding("error", where, f"unknown status '{p['status']}'"))
        if p["coverage"] not in COVERAGE:
            out.append(Finding("error", where, f"coverage must be one of {sorted(COVERAGE)}"))

        start, end = parse_year(p["start"]), parse_year(p["end"]) if p["end"] else None
        if start is None:
            out.append(Finding("error", where, f"start '{p['start']}' is not a year"))
        elif not YEAR_FLOOR <= start <= YEAR_MAX:
            out.append(Finding("error", where, f"start {start} outside {YEAR_FLOOR}–{YEAR_MAX}"))
        if p["end"] and end is None:
            out.append(Finding("error", where, f"end '{p['end']}' is not a year"))
        if start is not None and end is not None and start >= end:
            out.append(Finding("error", where, f"start {start} is not before end {end}"))

        # 31 December convention: a change dated in year Y takes effect in year Y.
        for col, year in (("start_date", start), ("end_date", end)):
            if p[col] and year is not None and parse_year(p[col][:4]) != year:
                out.append(Finding("error", where, f"{col} {p[col]} does not fall in year {year}"))

        cited = [s.strip() for s in p["source_ids"].split(";") if s.strip()]
        if not cited:
            out.append(Finding("error", where, "no source cited"))
        for s in cited:
            if s not in source_ids:
                out.append(Finding("error", where, f"source '{s}' not in sources.csv"))
    return out


def check_sequences(periods):
    """Overlaps are errors; gaps are warnings (they may be real, but should be explicit)."""
    out = []
    df = periods.assign(
        _start=periods["start"].map(parse_year),
        _end=periods["end"].map(lambda v: parse_year(v) if v else YEAR_MAX + 1),
    ).dropna(subset=["_start", "_end"])
    for tid, group in df.groupby("territory_id"):
        rows = group.sort_values("_start")
        prev_end = None
        for _, p in rows.iterrows():
            if prev_end is not None:
                if p["_start"] < prev_end:
                    out.append(Finding("error", tid, f"period starting {p['_start']} overlaps the previous one (ends {prev_end})"))
                elif p["_start"] > prev_end:
                    out.append(Finding("warning", tid, f"gap {prev_end}–{p['_start']}; add a not_british period if intended"))
            prev_end = max(prev_end or 0, p["_end"])
    return out


def check_coverage(territories, periods, geometry):
    out = []
    with_periods = set(periods["territory_id"])
    for tid in territories["territory_id"]:
        if tid not in with_periods:
            out.append(Finding("warning", tid, "territory has no periods"))
    curated = set(territories["territory_id"])
    uk_deps = geometry[(geometry["sovereign"] == "United Kingdom") & (geometry["id"] != "GBR")]
    for _, g in uk_deps.iterrows():
        if g["id"] not in curated:
            out.append(Finding("warning", g["id"], f"British-sovereign feature '{g['name']}' has no curated territory"))
    return out


def validate(territories, periods, sources, geometry):
    findings = check_sources(sources)
    findings += check_territories(territories, set(geometry["id"]))
    findings += check_period_rows(periods, set(territories["territory_id"]), set(sources["source_id"]))
    if not any(f.level == "error" and f.where == "periods.csv" for f in findings):
        findings += check_sequences(periods)
        findings += check_coverage(territories, periods, geometry)
    return findings


def main():
    findings = validate(
        read_csv(CURATED / "territories.csv"),
        read_csv(CURATED / "periods.csv"),
        read_csv(CURATED / "sources.csv"),
        read_csv(PROCESSED / "geometry_index.csv"),
    )
    for f in findings:
        print(f)
    errors = sum(f.level == "error" for f in findings)
    warnings = len(findings) - errors
    print(f"\n{errors} error(s), {warnings} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
