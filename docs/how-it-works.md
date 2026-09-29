# How this project works

A plain-language guide to *British Empire Over Time*: what the map shows, where the data comes from, how it becomes a website, and the definitions every decision rests on. For column-by-column detail see [`data-dictionary.md`](data-dictionary.md); for open questions see [`DATA_ISSUES.md`](../DATA_ISSUES.md).

---

## 1. What the map shows

For each year from 1900 to 2026, the map colours every modern country (or dependency) by the form of British rule it was under on **31 December of that year**, or grey if it was not British.

There are eight colours in the legend:

| Colour | Status | One-line meaning | Example |
|---|---|---|---|
| Blue | United Kingdom | The UK itself (plus the Crown Dependencies) | Ireland until 1922 |
| Pink | Crown colony / overseas territory | Ruled directly by the British Crown | Kenya 1920–63; Gibraltar today |
| Amber | Protectorate | Kept its own ruler, but Britain controlled defence and foreign affairs by treaty | Bahrain 1861–1971 |
| Plum | Dominion / self-governing | Governed itself under the Crown | Canada 1867–1931 |
| Green | League of Nations mandate | Former German or Ottoman territory administered for the League (later UN trusteeship) | Palestine 1920–48 |
| Brown | Condominium | Ruled jointly with another power | Anglo-Egyptian Sudan 1899–1956 |
| Violet | Chartered-company rule | Governed by a company under royal charter | Southern Rhodesia to 1923 |
| Grey | Independent / not British | Everything else | Egypt 1900–14; Canada after 1931 |

The site has a light and a dark theme. It follows the viewer's device setting, and the button in the top-right corner switches between them. The dark theme uses darker or brighter versions of the same colours, so each status keeps its identity.

As of this writing the data holds **92 territories, 123 status periods, 12 key events and 116 sources**.

### What you can do on the map

- **Move through time.** Drag the slider, press play, or use the arrow keys. Dots above the slider mark 12 key events (for example, 1931: Statute of Westminster); the current year's event is captioned below the slider, and playback lingers on each one.
- **See a territory's full history.** Click or tap a country, or use *Find a territory*. A panel shows its status in the chosen year, a 1900–2026 timeline strip, every period with exact dates and notes, the sources behind each period, and a link to any related judgement call in `DATA_ISSUES.md`.
- **Zoom.** Use the + and − buttons, double-click or double-tap, pinch on a phone, or hold Ctrl (⌘ on Mac) and scroll. Picking a territory zooms to it.
- **Share a view.** The address updates as you go, e.g. `#year=1947&t=IND` opens 1947 with India's panel showing.

### The counter

Under the year, two figures summarise that year:

- **Territories:** today's countries and territories that were wholly or partly under British rule on 31 December. It leaves out the United Kingdom and the Crown Dependencies, and small holdings shown only as a dot (such as Weihaiwei in China).
- **Share of world land:** shown as a range, and includes the UK. The lower figure counts only countries that were wholly British; the higher one adds partly British countries at their full modern area. Areas are measured on an equal-area projection, and "world land" excludes Antarctica.

For example, 1920 reads *84 territories · 25.9%–26.8% of world land*, matching the usual "quarter of the world" figure for the Empire at its peak. 1938 drops to about 16%, because this project stops counting Canada, Australia and South Africa as British once they gained legislative independence (section 2.3).

---

## 2. The key definitions

These rules decide what colour a country gets. They were agreed before any data was entered, so that each case is decided by rule rather than by feel.

### 2.1 The formal-status rule: what counts as "British"
A territory counts as British **only where a legal instrument placed it under British rule**: a treaty, an Act of Parliament, a royal charter or a League of Nations mandate.

- Real power without a legal basis does **not** count. Egypt 1900–14 was occupied by Britain but legally Ottoman, so it is grey. Iraq 1917–20 was under military occupation, so it is grey until the mandate.
- A treaty that hands Britain a country's foreign relations **does** count, as a protectorate. Kuwait from 1899 and Afghanistan 1879–1919 (Treaty of Gandamak) are examples.
- "Informal influence" (economic or military sway without a legal instrument) is deliberately left out, because where influence ends is a judgement call.

### 2.2 The year convention: 31 December
A territory's colour in year *y* is its status on **31 December of *y***. A change during a year shows from that year onwards:

- India became independent on 15 August 1947, so the **1947** frame shows it as independent.
- Hong Kong was handed over on 1 July 1997, so the **1997** frame shows it as Chinese.

In the data, each period runs from `start` up to, but **not including**, `end`.

### 2.3 When British status ends
British status ends at **independence**, even where the new state kept the British monarch or called itself a dominion.

- **Older dominions** (Canada, South Africa, the Irish Free State) end with the **Statute of Westminster, 11 December 1931**. Australia and New Zealand end when they adopted it: 1942 (with effect from 1939) and 25 November 1947.
- **Later states** end on the date in their **independence Act**. For example, the Indian Independence Act 1947 made India an independent *Dominion* on 15 August 1947, and India is grey from then on.
- Anything held by a dominion (a mandate such as South West Africa, or a territory such as Papua) counts as British only while that dominion does.

### 2.4 Changes of status
A territory's history is a list of **successive periods**, not a single independence date. Zimbabwe, for example:

| Period | Status | Why |
|---|---|---|
| 1900–1923 | Chartered-company rule | British South Africa Company (chartered 1889) |
| 1923–1965 | Dominion / self-governing | Self-governing colony from 12 September 1923 |
| 1965–1980 | Crown colony | After the Unilateral Declaration of Independence, the Southern Rhodesia Act 1965 declared it still British |
| from 1980 | Grey | Independent on 18 April 1980 |

### 2.5 Coverage: full, partial or point
The map uses **today's borders**, but British rule often covered only part of a modern country. Each period records how much:

| Coverage | Meaning | How it is drawn | Example |
|---|---|---|---|
| `full` | All of the modern country | Solid colour | Kenya |
| `partial` | A substantial part | Fainter shade of the colour | South Africa 1900–02 (Cape and Natal only) |
| `point` | A small holding inside a large country | Country left grey; a dot marks the holding | Weihaiwei in China, 1898–1930 |

Very small territories (under 15,000 km², such as Gibraltar or the Falklands) also get a dot so they stay visible.

### 2.6 One status per country
Where one modern country contained several British statuses at the same time, the **main status** (by area) is shown and the others are named in the tooltip. Malaya before 1946, for example, is shown as a protectorate, while the notes mention the Straits Settlements (a crown colony) and North Borneo (company rule).

### 2.7 Statuses that began before 1900
If a status was already in place before 1900 and the source gives no clear start date, the period starts at **1900** (the start of the map), and the notes say so. No start date is invented.

### 2.8 Special cases
Some arrangements fit no category exactly. Each has a documented handling:

- **British India** is shown as a crown colony, although legally it was not one.
- The **Crown Dependencies** (Isle of Man, Jersey, Guernsey) are shown in the UK colour.
- The **West Indies Associated States** (1967 onwards) are shown as self-governing.
- **Antarctica** is left off the map, because claims there are frozen under the Antarctic Treaty.

---

## 3. Where the data comes from

### 3.1 The sources, in order of preference

| Rank | Source | What it gives | Licence / terms |
|---|---|---|---|
| 1 | **ICOW Colonial History Data Set** v1.1 (Paul Hensel, 2018) | For each modern state: its main colonial ruler and independence date (year and month) | No open licence; the authors ask that it is not redistributed. Downloaded by the pipeline, never committed |
| 2 | **Primary legal texts**: legislation.gov.uk, plus the Australian and New Zealand legislation sites | Exact dates and legal wording, e.g. "shall cease to be a protectorate" (Zambia Independence Act 1964) | Open Government Licence v3.0 (UK) |
| 3 | **Reference works**: Encyclopaedia Britannica | Status types and dates of change (when a colony became a protectorate, and so on) | Copyright; only facts are cited, no text is reproduced |
| 4 | **UN records**: Dag Hammarskjöld Library trusteeship research guides | Trusteeship agreements and termination dates | Cited for facts |
| — | **Natural Earth** Admin 0, 1:50m (with three tiny territories from 1:10m) | The map shapes | Public domain |

Wikipedia is used only as a lead to find a real source, never as a citation. The CIA World Factbook was originally in the list, but it was discontinued in February 2026.

### 3.2 Why ICOW is not enough on its own
ICOW records **when** and **from whom** a state became independent. It does **not** record the sequence of statuses (colony, then protectorate, then mandate), and it covers only today's sovereign states, so Gibraltar or the Falklands are missing. It also counts becoming a dominion as "independence" (Canada 1867). So ICOW is used to **cite and cross-check** end dates, while the status history comes from legislation and reference works.

### 3.3 The source mix
Of the 116 sources, 20 are primary legal texts, 95 are reference entries (mostly Britannica articles, plus UN guides) and one is the ICOW dataset. Each source is listed with its citation, URL, access date and licence in `data/curated/sources.csv`.

---

## 4. How the data becomes a website

```
Natural Earth, ICOW ──► 01_fetch ──► data/raw/
                                        │
data/raw/ (Natural Earth) ──► 02_build_geometry ──► world.topojson + geometry_index.csv
                                                            │
data/curated/ (hand-researched) ──► validate ──► 03_crosscheck_icow (uses ICOW)
                                                            │
                                    04_export ──► territories.json + world.topojson ──► site/data/
                                                                                          │
                                         GitHub Actions: tests + validate ──► GitHub Pages
```

| Step | Script | What it does |
|---|---|---|
| 1 | `pipeline/01_fetch.py` | Downloads Natural Earth and ICOW into `data/raw/` and records each file's URL, licence, checksum and access date in `data/raw/SOURCES.md`. |
| 2 | `pipeline/02_build_geometry.py` | Builds the map shapes: 1:50m countries plus Gibraltar, Akrotiri and Dhekelia from 1:10m. It drops Antarctica, simplifies borders without breaking shared edges, fixes the polygon winding D3 expects, and computes each territory's land area (equal-area projection) and label point. |
| 3 | `pipeline/validate.py` | Checks the hand-curated tables (see section 5). The build stops if anything is wrong. |
| 4 | `pipeline/03_crosscheck_icow.py` | For every territory ICOW covers, checks that ICOW's independence year and month appear as a boundary in our periods. It writes `data/processed/icow_crosscheck.csv`; there are currently no mismatches. |
| 5 | `pipeline/04_export.py` | Joins periods, sources and geometry into `territories.json` and copies both data files into `site/data/`. |
| — | `site/` | A static web page: plain JavaScript, D3.js v7 and topojson-client, vendored so it needs no external servers. It draws the map with an Equal Earth projection and recolours it when the year changes. |
| — | `.github/workflows/deploy.yml` | On every push, runs the tests and the validator, then publishes `site/` to GitHub Pages. |

### Where the research lives
The **curated tables** in `data/curated/` are the single source of truth:

- `territories.csv` has one row per map territory, with its ICOW code if it has one.
- `periods.csv` has one row per status period: years, exact dates, status, historical unit, coverage, notes and the ids of its sources.
- `sources.csv` has one row per source: citation, URL, access date and licence.
- `events.csv` has one row per slider event: year, label, description and the ids of its sources.

`pipeline/curate.py` is a small helper for adding researched rows without hand-editing CSV quoting.

---

## 5. How quality is checked

**The validator** (`pipeline/validate.py`, covered by 23 tests) stops the build if it finds any of these:

- an unknown territory, status or coverage value
- a start year that is not before the end year, or an exact date that falls outside its year
- overlapping periods for the same territory
- a period with no source, or a source id missing from `sources.csv`
- a territory with no map shape
- a `point` period without a valid marker position
- an event outside 1900–2026, without a source, or sharing a year with another event

It **warns** (without stopping) on gaps between periods, and on British dependencies in the map data that have no curated territory. Both counts are currently zero.

**The ICOW cross-check** compares every independence date with an independent dataset, down to the month.

**`DATA_ISSUES.md`** is the log of judgement calls. Any case that is uncertain, contested or does not fit a category gets an entry with the proposed handling, and nothing is resolved silently. There are currently 12 decided entries and 16 open ones awaiting review.

---

## 6. Known limitations

- **Modern borders.** Colonial-era borders are planned for Phase 3. Until then, lighter shading and dots approximate partial coverage.
- **Judgement calls.** Some arrangements do not fit the eight categories (see 2.8 and `DATA_ISSUES.md`).
- **Gaps.** A few holdings are not yet mapped because no source was found. These include Jubaland before 1925, the British Cameroons before 1946, Walvis Bay, and several small Australian and New Zealand territories.
- **Reliance on Britannica.** Many status changes are cited to Britannica, a reputable reference work but a secondary source. Academic works such as Olson's *Historical Dictionary of the British Empire* would strengthen them.
- **Main status only.** A country with mixed statuses shows one colour.

---

## 7. How to change or add a period

1. Find a source that states the fact; never infer a date.
2. Add the source to `data/curated/sources.csv`.
3. Add or edit the row in `data/curated/periods.csv`, following [`data-dictionary.md`](data-dictionary.md).
4. If the case involves judgement, add an entry to `DATA_ISSUES.md` and put its number in the `issue` column.
5. Run `python pipeline/validate.py`, `python pipeline/03_crosscheck_icow.py` and `python pipeline/04_export.py`, then check the map locally.

---

## 8. Glossary

| Term | Meaning here |
|---|---|
| **Period** | One row of history: a territory, a status and the years it applied. |
| **Territory** | A shape on today's map (a country or dependency), identified by its Natural Earth code, e.g. `KEN`. |
| **Unit** | The historical entity the period refers to, e.g. "Aden" within modern Yemen. |
| **Protected state** | A state that kept its ruler but gave Britain its foreign relations by treaty; shown as a protectorate. |
| **Mandate / trust territory** | Territory administered for the League of Nations (1920s–46) or, after 1946, the UN. |
| **Dominion** | A self-governing member of the Empire (Canada, Australia, New Zealand, South Africa, the Irish Free State, Newfoundland). |
| **Statute of Westminster** | The 1931 Act giving the dominions legislative equality with Britain; where their British status ends on this map. |
| **ICOW** | Issue Correlates of War project; its Colonial History dataset is the backbone for independence dates. |
| **Natural Earth** | A free, public-domain world map dataset, used for the shapes. |
| **TopoJSON** | A compact map format that stores shared borders once, keeping the site fast. |
| **Equal Earth** | The map projection used: it keeps areas true, so large countries are not exaggerated. |
