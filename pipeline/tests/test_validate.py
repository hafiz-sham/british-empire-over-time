import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from validate import validate  # noqa: E402

GEOMETRY = pd.DataFrame({"id": ["CAN", "GIB", "GBR"], "name": ["Canada", "Gibraltar", "United Kingdom"],
                         "sovereign": ["Canada", "United Kingdom", "United Kingdom"]})
SOURCES = pd.DataFrame([{"source_id": "icow", "type": "dataset", "citation": "Hensel 2018", "url": "", "accessed": "", "licence": ""}])
TERRITORIES = pd.DataFrame([
    {"territory_id": "CAN", "name": "Canada", "icow_code": "20", "notes": ""},
    {"territory_id": "GIB", "name": "Gibraltar", "icow_code": "", "notes": ""},
])


def period(**kw):
    row = {"territory_id": "CAN", "start": "1900", "end": "1931", "start_date": "", "end_date": "",
           "status": "dominion", "unit": "", "coverage": "full", "notes": "", "source_ids": "icow", "issue": ""}
    row.update(kw)
    return row


def run(*rows, territories=TERRITORIES):
    return validate(territories, pd.DataFrame(list(rows)), SOURCES, GEOMETRY)


def messages(findings, level):
    return [f.message for f in findings if f.level == level]


def test_clean_data_has_no_errors():
    findings = run(period(), period(territory_id="GIB", status="crown_colony", end=""))
    assert messages(findings, "error") == []


@pytest.mark.parametrize("kw, expected", [
    ({"status": "colony"}, "unknown status"),
    ({"coverage": "most"}, "coverage must be"),
    ({"start": "1931", "end": "1931"}, "not before end"),
    ({"start": "19OO"}, "not a year"),
    ({"source_ids": ""}, "no source cited"),
    ({"source_ids": "wikipedia"}, "not in sources.csv"),
    ({"territory_id": "XXX"}, "not in territories.csv"),
    ({"start_date": "1899-12-31"}, "does not fall in year 1900"),
])
def test_row_errors(kw, expected):
    errors = messages(run(period(**kw)), "error")
    assert any(expected in e for e in errors), errors


def test_overlap_is_error():
    errors = messages(run(period(), period(start="1930", end="1982")), "error")
    assert any("overlaps" in e for e in errors)


def test_gap_is_warning_not_error():
    findings = run(period(), period(start="1935", end="1982"))
    assert messages(findings, "error") == []
    assert any("gap 1931–1935" in w for w in messages(findings, "warning"))


def test_open_ended_period_followed_by_another_overlaps():
    errors = messages(run(period(end=""), period(start="1950", end="1960")), "error")
    assert any("overlaps" in e for e in errors)


def test_territory_without_geometry_is_error():
    territories = pd.concat([TERRITORIES, pd.DataFrame([{"territory_id": "ZZZ", "name": "Nowhere", "icow_code": "", "notes": ""}])])
    errors = messages(run(period(), territories=territories), "error")
    assert any("no matching geometry" in e for e in errors)


def test_uncurated_british_dependency_is_warning():
    warnings = messages(run(period(), territories=TERRITORIES.iloc[:1]), "warning")
    assert any("Gibraltar" in w for w in warnings)
