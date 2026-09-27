# British Empire Over Time

An interactive map of British rule from 1900 to 2026. Move the year slider, or press play, and the world map recolours to show which territories were under British rule in that year, and in what form: crown colony, protectorate, dominion, League of Nations mandate, condominium or chartered-company rule.

> **Status:** in development (Phase 1). The live demo link and a GIF of the slider will be added here.

## Motivation

_To be written._

## Methodology

### What counts as British
A territory counts as British only where a legal instrument placed it under British rule: a treaty, an Act of Parliament, a royal charter or a League of Nations mandate. Places where Britain held real power without such an instrument (for example, Egypt from 1900 to 1914) are shown as not British. An "informal influence" layer is deliberately left out of this version, because where influence ends is a matter of judgement.

### Year convention
A territory's status in a given year is its status on 31 December of that year. So the 1947 frame shows India as independent, and the 1997 frame shows Hong Kong after the handover.

### Changes of status
Changes of status are recorded as successive periods rather than a single independence date. For example, Canada is a dominion and then gains legislative independence under the Statute of Westminster (1931).

### Sources
Every period cites a source. Uncertain or contested cases are flagged in the data and listed in [`DATA_ISSUES.md`](DATA_ISSUES.md).

## Data sources and licences

| Dataset | Used for | Licence |
|---|---|---|
| [Natural Earth](https://www.naturalearthdata.com/), Admin 0 – Countries, 1:50m (v5.1.1) | Base geometry | Public domain |
| [ICOW Colonial History Data Set](http://www.paulhensel.org/icowcol.html), v1.1 (Hensel, 2018) | Colonial ruler and independence dates | No open licence; the authors ask that it is not redistributed. Downloaded by `pipeline/01_fetch.py`, not committed. Only individual cited dates appear in this repository. |

## Known limitations

- **Modern borders.** This version draws today's borders. Where only part of a modern country was British (for example, British Somaliland within Somalia), the country is shown in a lighter shade, with a note in the tooltip. Colonial-era borders are planned for a later version.
- **One status per country.** Where one modern country contained several British statuses at once (for example, colony and protectorates in Malaya), the main status is shown and the others are listed in the notes.
- **No informal influence.** See the methodology above.
- **No Antarctica.** Territorial claims there are frozen under the Antarctic Treaty, so Antarctica is left off the map.

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

_To be written._

## Licence

The code is released under the [MIT licence](LICENSE). The curated data in `data/curated/` will be released under CC BY 4.0, subject to the terms of the upstream datasets.
