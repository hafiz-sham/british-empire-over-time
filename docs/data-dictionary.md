# Data dictionary

The curated tables in `data/curated/` are the project's source of truth for British status. They are researched by hand, every period cites a source, and `pipeline/validate.py` checks them before each build.

## `territories.csv`

One row per map territory. In Phase 1 a territory is a modern country or dependency from Natural Earth.

| Column | Required | Description |
|---|---|---|
| `territory_id` | yes | Natural Earth `ADM0_A3` code, e.g. `IND`, `GIB`. Must exist in `data/processed/geometry_index.csv`. |
| `name` | yes | Display name. |
| `icow_code` | no | ICOW / Correlates of War state code, used to cross-check dates against ICOW. |
| `notes` | no | Anything that applies to the territory as a whole. |

## `periods.csv`

One row per status period. Periods for a territory must not overlap.

| Column | Required | Description |
|---|---|---|
| `territory_id` | yes | Links to `territories.csv`. |
| `start` | yes | First year the status applies (integer). |
| `end` | no | First year the status no longer applies. Blank means it still applies in 2026. |
| `start_date` | no | Exact date of the change, where known: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Must fall in `start`. |
| `end_date` | no | As above, for `end`. |
| `status` | yes | One of the codes below. |
| `unit` | no | The historical unit this refers to, e.g. `Aden Colony` within modern Yemen. |
| `coverage` | yes | `full` if the status covers all of the modern territory, `partial` if only part (shown in a lighter shade). |
| `notes` | no | Context shown in the tooltip, including other statuses present at the same time. |
| `source_ids` | yes | One or more ids from `sources.csv`, separated by `;`. |
| `issue` | no | Number of the related entry in `DATA_ISSUES.md`. |

### Year convention

A territory's status in year *y* is its status on **31 December** of *y*. Periods run from `start` up to, but not including, `end`. So a change dated 15 August 1947 is recorded as `end = 1947` for the old period and `start = 1947` for the new one.

Where a status was already in place before 1900 but the source gives no clear start date, the period starts at 1900 (the start of the map) and the notes say so.

A year with no period means the territory is shown as not British. Where a gap between British periods is real, record it as an explicit `not_british` period, so the validator can tell it apart from missing data.

### Status codes

| Code | Legend label | Meaning |
|---|---|---|
| `uk` | United Kingdom | Part of the United Kingdom itself (including all of Ireland until 1922). |
| `crown_colony` | Crown colony / overseas territory | Ruled directly by the British Crown, including British India (1858–1947) and today's British Overseas Territories. |
| `protectorate` | Protectorate | A local ruler kept by treaty, with Britain controlling defence and foreign affairs (includes protected states). |
| `dominion` | Dominion / self-governing | Self-governing under the Crown. |
| `mandate` | League of Nations mandate | Administered by Britain, or a dominion, under a League of Nations mandate or UN trusteeship. |
| `condominium` | Condominium | Ruled jointly with another power, e.g. Anglo-Egyptian Sudan. |
| `chartered_company` | Chartered-company rule | Governed by a company under royal charter, e.g. the British South Africa Company. |
| `not_british` | Independent / not British | Used only to document a gap or give context in the notes. |

**Formal-status rule:** a period may use a British status only where a legal instrument placed the territory under British rule: a treaty, an Act of Parliament, a royal charter or a League of Nations mandate.

## `sources.csv`

| Column | Required | Description |
|---|---|---|
| `source_id` | yes | Short id cited from `periods.csv`, e.g. `icow`, `statute_westminster_1931`. |
| `type` | yes | `dataset`, `primary` (legislation, treaty), `reference` (academic work) or `factbook`. |
| `citation` | yes | Full citation. |
| `url` | no | Link, where one exists. |
| `accessed` | no | Date accessed (ISO), for online sources. |
| `licence` | no | Licence or terms, where relevant. |

Source preference: ICOW, then primary legal texts, then academic reference works, then the CIA World Factbook. Wikipedia is never cited.
