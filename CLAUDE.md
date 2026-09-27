# British Empire Over Time — Project Context

## What this is
An interactive web map of the British Empire and its sphere of influence, from 1600 to the present (v1 covers 1900–2026). A year slider (with a play/pause animation) recolours the world map to show which territories were under British rule, and in what form, in the selected year.

This is a portfolio piece by Hafiz (MSc Data Science and Analytics, University of Leeds; background in economics, politics and international relations). It will be:
- a public GitHub repository, pinned on his profile
- a live demo hosted on GitHub Pages
- shared on LinkedIn with a short screen-recorded video of the slider

The audience includes recruiters in political risk, intelligence and data science, so the data pipeline, methodology and sourcing matter as much as the visuals.

## Writing conventions
- Use British English spelling in all user-facing text, the README and the docs (colonise, colour, centre, etc.).
- Keep code comments concise.

## Key decisions already made
- **Stack:** static site, vanilla JS + D3.js v7, TopoJSON geometry. No front-end framework. The Python data pipeline (pandas, geopandas) lives in `/pipeline`.
- **Hosting:** GitHub Pages, deployed via a GitHub Actions workflow.
- **Rendering:** a vector choropleth drawn with D3, not a tile-based map.
- **Borders:** Phase 1 uses modern borders (Natural Earth admin-0) as an acknowledged simplification. Phase 3 moves to historical borders (CShapes 2.0 and/or Historical Basemaps).
- **Status data backbone:** the ICOW Colonial History dataset (Hensel), supplemented where needed.
- **Year convention:** status in year *y* = status on 31 December of *y*. Periods are half-open `[start, end)` in integer years; optional exact `start_date`/`end_date` (ISO) where known.
- **Territorial scope:** British-ruled territories only; other empires are shown as "Independent / not British".
- **Time scope (v1):** slider runs 1900–2026, covering every British territory in that window. The data model still supports earlier periods.
- **Source hierarchy:** ICOW → primary legal texts (legislation.gov.uk, treaties) → academic reference works (e.g. Olson, *Historical Dictionary of the British Empire*) → CIA World Factbook. Wikipedia only as a lead, never as a citation. Assess COLDAT (Becker) as a start-date supplement, pending licence check.
- **Licences:** code MIT; curated data CC BY 4.0 (subject to upstream licence compatibility). Raw data whose redistribution terms are unclear stays gitignored.
- **Palette:** imperial pink for crown colonies within a set checked all-pairs for colour-vision separation (see `site/js/statuses.js`). The closest colour-blind pair is backed by legend-hover highlighting and tooltip labels.
- **Curated data:** hand-researched tables live in `/data/curated` (territories, periods, sources), separate from raw and processed. They are the single source of truth; ICOW is cited per period and used as a cross-check (`03_crosscheck_icow.py`), not to generate rows.
- **ICOW:** not redistributed (authors' request); fetched by `01_fetch.py` and gitignored.
- **CIA World Factbook:** discontinued in February 2026, so it cannot be cited as a live source. A replacement for that tier of the source hierarchy is pending Hafiz's decision.
- **Geometry scale:** Natural Earth 1:50m, plus point markers for very small territories.
- **Borders in Phase 1:** modern borders only, with whole modern countries filled. Colonial-unit borders (dashed for British units inside partly British countries, dotted between units under different British statuses) are deferred until the first map has been inspected.
- **United Kingdom:** shown in its own colour (metropole), distinct from the status categories.
- **Ireland:** treated as part of the United Kingdom from 1900 to 1922.
- **Partly British modern countries (Phase 1):** filled with a lighter shade of the status colour, with a tooltip note naming the British part (e.g. British Somaliland within Somalia).
- **Formal-status rule:** a territory counts as British only where a legal instrument (treaty, Act of Parliament, royal charter, League of Nations mandate) placed it under British rule. Otherwise it is "Independent / not British". Example: Egypt 1900–1914 is not British.
- **Informal influence:** dropped from Phase 1. The README explains the formal-status rule and why; may return later as an optional hatched layer.

## Data model
Each territory has a geometry and an ordered list of status periods:

```json
{ "id": "", "name": "", "periods": [{ "start": 0, "end": 0, "status": "", "notes": "", "source": "" }] }
```

Status categories, each with its own colour and a legend entry:
- Crown colony
- Protectorate
- Dominion / self-governing
- League of Nations mandate
- Condominium (e.g. Anglo-Egyptian Sudan)
- Chartered-company rule (e.g. East India Company before 1858)
- Informal influence (deferred; if reinstated, shown as hatching, not solid fill, with a short justification per case)
- Independent / not British
- United Kingdom (metropole; own colour)

Ambiguous transitions are represented as successive periods rather than a single independence date. For example, Canada runs colony, then dominion from 1867, then Statute of Westminster 1931, then patriation 1982.

## Data rules (important)
- Never invent or guess dates.
- Every period must cite a source.
- Flag uncertain or contested cases in `notes` and log them in `DATA_ISSUES.md` for Hafiz to review, rather than silently choosing an answer.
- Record each dataset's licence in the README. Gitignore raw data that is large or licence-restricted.

## Phases
1. **MVP:** world map on modern borders; year slider; play/pause; hover tooltip; legend; responsive layout.
2. **Detail:** click panel with each territory's full timeline and sources; event markers on the slider (1783, 1858, 1884–85, 1919, 1947, the 1960s, 1997); a counter showing the number of territories and the approximate share of world land area.
3. **Accuracy:** historical borders; a methodology page.

## Repo standards
- **Structure:** `/pipeline`, `/data/raw`, `/data/curated`, `/data/processed`, `/site`, `/docs`.
- **README:** a GIF of the slider, a live demo link, motivation, methodology, sources and licences, known limitations (anachronistic borders in v1, the subjectivity of the informal-influence category), and how to run the pipeline.
- **Validation script:** checks for overlapping or gapped periods, missing sources, and territories with no geometry match.
- **Commits:** small and meaningful.

## Working style
- Propose a plan before writing code for each phase, and wait for approval.
- When a new decision is made, add it to this file under "Key decisions already made".
