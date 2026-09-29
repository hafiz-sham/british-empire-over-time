# British Empire Over Time

An interactive map of British rule from 1900 to 2026. Move the year slider, or press play, and the world map recolours to show which territories were under British rule in that year, and in what form: crown colony, protectorate, dominion, League of Nations mandate, condominium or chartered-company rule.

**Live demo:** [hafiz-sham.github.io/british-empire-over-time](https://hafiz-sham.github.io/british-empire-over-time/)

> A GIF of the slider will be added here.

New to the project? Start with [How it works](docs/how-it-works.md): the definitions, data sources and pipeline in plain language.

## Motivation

Want to see how the British Empire spread over time, since the 1900s.

## Methodology

### What counts as British
A territory counts as British only where a legal instrument placed it under British rule: a treaty, an Act of Parliament, a royal charter or a League of Nations mandate. Places where Britain held real power without such an instrument (for example, Egypt from 1900 to 1914) are shown as not British. An "informal influence" layer is deliberately left out of this version, because where influence ends is a matter of judgement.

### Year convention
A territory's status in a given year is its status on 31 December of that year. So the 1947 frame shows India as independent, and the 1997 frame shows Hong Kong after the handover.

### Changes of status
Changes of status are recorded as successive periods rather than a single independence date. For example, Zimbabwe runs from British South Africa Company rule, to a self-governing colony from 1923, to its legal position as a British colony after the Unilateral Declaration of Independence (1965–1980).

### When British status ends
British status ends at independence. For the older dominions this is the Statute of Westminster (11 December 1931), or its adoption for Australia (Act of 1942, effective from 1939) and New Zealand (1947). For later states it is the date in the independence Act, even where the new state was a dominion or kept the British monarch as head of state. Mandates and territories held by a dominion count as British only while the dominion itself does.

### Partial coverage
Borders are today's. Where a substantial part of a modern country was British, the country is shaded more lightly; where the British part was small (for example, Weihaiwei in China), a dot marks it instead and the country is not shaded.

### Data at a glance
92 territories, 123 status periods and 116 cited sources (20 primary legal texts, 95 reference entries and the ICOW dataset). The pipeline cross-checks every independence date against ICOW; there are currently no mismatches.

### Sources
Every period cites a source. Uncertain or contested cases are flagged in the data and listed in [`DATA_ISSUES.md`](DATA_ISSUES.md).

## Data sources and licences

| Dataset | Used for | Licence |
|---|---|---|
| [Natural Earth](https://www.naturalearthdata.com/), Admin 0 – Countries, 1:50m (v5.1.1) | Base geometry | Public domain |
| [legislation.gov.uk](https://www.legislation.gov.uk/) | Primary legal texts (Acts of Parliament) cited for individual dates | Open Government Licence v3.0 |
| [Encyclopaedia Britannica](https://www.britannica.com/) | Status types and dates of change, cited per article | Copyright; only facts are cited, no text is reproduced |
| [UN Trusteeship Council research guides](https://research.un.org/en/docs/tc/territories) (Dag Hammarskjöld Library) | Trusteeship agreements and terminations | Cited for facts |
| Australian and New Zealand legislation | Statute of Westminster Adoption Acts 1942 and 1947 | Cited for facts |
| [ICOW Colonial History Data Set](http://www.paulhensel.org/icowcol.html), v1.1 (Hensel, 2018) | Colonial ruler and independence dates | No open licence; the authors ask that it is not redistributed. Downloaded by `pipeline/01_fetch.py`, not committed. Only individual cited dates appear in this repository. |

Front-end libraries, vendored in `site/lib/`: [D3.js](https://d3js.org/) v7.9.0 and [topojson-client](https://github.com/topojson/topojson-client) v3.1.0, both under the ISC licence.

## Known limitations

- **Modern borders.** This version draws today's borders, with lighter shading or a dot where only part of a modern country was British (see Partial coverage above). Colonial-era borders are planned for a later version.
- **One status per country.** Where one modern country contained several British statuses at once (for example, colony and protectorates in Malaya), the main status is shown and the others are listed in the notes.
- **No informal influence.** See the methodology above.
- **No Antarctica.** Territorial claims there are frozen under the Antarctic Treaty, so Antarctica is left off the map.
- **Judgement calls.** The status categories do not fit every arrangement (for example, Cyprus under Ottoman sovereignty 1878–1914, leased Weihaiwei, or the West Indies Associated States). Each such case is listed in [`DATA_ISSUES.md`](DATA_ISSUES.md) with the handling used.
- **Gaps.** A few holdings are not yet mapped because no source has been found for their status or dates: Jubaland (now in Somalia) before 1925, the British Cameroons mandate before 1946, and several small territories administered by Australia or New Zealand. They are listed in `DATA_ISSUES.md`.

## Repository structure

```
pipeline/         Python scripts that build the site data
data/raw/         downloaded source data (gitignored; provenance in SOURCES.md)
data/curated/     hand-researched territories, periods and sources
data/processed/   pipeline output
site/             the static website served by GitHub Pages
docs/             data dictionary and methodology notes
```

## Running the pipeline locally

Requires Python 3.13.

```bash
python -m venv .venv
.venv/Scripts/activate        # Windows; on macOS/Linux: source .venv/bin/activate
pip install -r pipeline/requirements.txt

python pipeline/01_fetch.py            # download Natural Earth and ICOW into data/raw
python pipeline/02_build_geometry.py   # simplified world.topojson + geometry_index.csv
python pipeline/validate.py            # check the curated tables
python pipeline/03_crosscheck_icow.py  # compare curated dates with ICOW
python pipeline/04_export.py           # write territories.json and copy both files to site/data
python -m pytest pipeline/tests        # validator tests
```

To view the site, run `python pipeline/serve.py` (a local server with caching turned off) and open http://localhost:8000.

The curated tables in `data/curated/` are documented in [`docs/data-dictionary.md`](docs/data-dictionary.md). Pushing to `main` runs the validator in GitHub Actions and deploys `site/` to GitHub Pages.

## Licence

The code is released under the [MIT licence](LICENSE). The curated data in `data/curated/` will be released under CC BY 4.0, subject to the terms of the upstream datasets.
