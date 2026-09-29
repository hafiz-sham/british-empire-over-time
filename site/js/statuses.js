// Legend order. Codes match pipeline/schema.py; colours are CSS variables
// (--status-<code>) in site/css/style.css, with separate light and dark sets.
export const STATUSES = [
  { code: "uk", label: "United Kingdom" },
  { code: "crown_colony", label: "Crown colony / overseas territory" },
  { code: "protectorate", label: "Protectorate" },
  { code: "dominion", label: "Dominion / self-governing" },
  { code: "mandate", label: "League of Nations mandate" },
  { code: "condominium", label: "Condominium" },
  { code: "chartered_company", label: "Chartered-company rule" },
];

export const NOT_BRITISH = { code: "not_british", label: "Independent / not British" };

export const BY_CODE = Object.fromEntries([...STATUSES, NOT_BRITISH].map((s) => [s.code, s]));

export const colour = (code) => `var(--status-${code})`;

// Partial coverage: same hue, fainter.
export const PARTIAL_OPACITY = 0.45;
