"""Cross-check curated periods against ICOW independence dates.

For each curated territory with an icow_code, the ICOW independence year (IndDate)
should appear as a period boundary. ICOW dates dominions' "independence" to when
they became dominions, so a match may be a start of a dominion period, not an end
of British status (see DATA_ISSUES.md #7). Mismatches are reported for review;
they do not fail the build.

Output: data/processed/icow_crosscheck.csv
Usage: python pipeline/03_crosscheck_icow.py
"""

import pandas as pd

from config import CURATED, PROCESSED, RAW

ICOW_CSV = RAW / "icow_colonial_history" / "ICOW Colonial History 1.1" / "coldata110.csv"
UK = 200  # Correlates of War code for the United Kingdom


def load_icow():
    icow = pd.read_csv(ICOW_CSV, encoding="utf-8-sig")
    icow = icow[icow["IndDate"] > 0]
    return icow.assign(ind_year=icow["IndDate"] // 100, ind_month=icow["IndDate"] % 100)


def main():
    territories = pd.read_csv(CURATED / "territories.csv", dtype=str, keep_default_na=False)
    periods = pd.read_csv(CURATED / "periods.csv", dtype=str, keep_default_na=False)
    icow = load_icow().set_index("State")

    rows = []
    for _, t in territories[territories["icow_code"] != ""].iterrows():
        code = int(t["icow_code"])
        if code == UK:
            continue
        if code not in icow.index:
            rows.append({"territory_id": t["territory_id"], "icow_code": code, "result": "not in ICOW"})
            continue
        rec = icow.loc[code]
        p = periods[periods["territory_id"] == t["territory_id"]]
        boundaries = {int(v) for v in pd.concat([p["start"], p["end"]]) if v}
        rows.append({
            "territory_id": t["territory_id"],
            "icow_code": code,
            "icow_ind_date": f"{rec['ind_year']}-{rec['ind_month']:02d}",
            "icow_ind_from": int(rec["IndFrom"]),
            "result": "match" if rec["ind_year"] in boundaries else "MISMATCH",
        })

    report = pd.DataFrame(rows, columns=["territory_id", "icow_code", "icow_ind_date", "icow_ind_from", "result"])
    report.to_csv(PROCESSED / "icow_crosscheck.csv", index=False, lineterminator="\n")
    print(report.to_string(index=False) if len(report) else "No territories to cross-check.")
    print(f"\n{(report['result'] == 'MISMATCH').sum()} mismatch(es) for review")


if __name__ == "__main__":
    main()
