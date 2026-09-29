"""Status categories and curated-table columns. Single source of truth for pipeline and validator."""

# Codes stored in periods.csv, in legend order. Colours live in site/js/statuses.js.
STATUSES = {
    "uk": "United Kingdom",
    "crown_colony": "Crown colony / overseas territory",
    "protectorate": "Protectorate",
    "dominion": "Dominion / self-governing",
    "mandate": "League of Nations mandate",
    "condominium": "Condominium",
    "chartered_company": "Chartered-company rule",
    "not_british": "Independent / not British",
}

COVERAGE = {"full", "partial", "point"}

TERRITORY_COLUMNS = ["territory_id", "name", "icow_code", "notes"]
PERIOD_COLUMNS = [
    "territory_id", "start", "end", "start_date", "end_date",
    "status", "unit", "coverage", "marker", "notes", "source_ids", "issue",
]
SOURCE_COLUMNS = ["source_id", "type", "citation", "url", "accessed", "licence"]
EVENT_COLUMNS = ["year", "label", "description", "source_ids"]
SOURCE_TYPES = {"dataset", "primary", "reference", "factbook"}
