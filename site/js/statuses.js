// Legend order and colours. Codes match pipeline/schema.py.
// Palette checked with an all-pairs colour-vision validator: normal-vision ΔE ≥ 16;
// the closest colour-blind pair (mandate vs crown colony, ΔE 6.1) is backed by
// legend highlighting and tooltip labels.
export const STATUSES = [
  { code: "uk", label: "United Kingdom", colour: "#2a78d6" },
  { code: "crown_colony", label: "Crown colony / overseas territory", colour: "#e87ba4" },
  { code: "protectorate", label: "Protectorate", colour: "#eda100" },
  { code: "dominion", label: "Dominion / self-governing", colour: "#9b2f6a" },
  { code: "mandate", label: "League of Nations mandate", colour: "#1baf7a" },
  { code: "condominium", label: "Condominium", colour: "#b0701a" },
  { code: "chartered_company", label: "Chartered-company rule", colour: "#4a3aa7" },
];

export const NOT_BRITISH = { code: "not_british", label: "Independent / not British", colour: "#d9d6cf" };

export const BY_CODE = Object.fromEntries([...STATUSES, NOT_BRITISH].map((s) => [s.code, s]));

// Partial coverage: same hue, lighter.
export const PARTIAL_OPACITY = 0.45;
