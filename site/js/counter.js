import { periodAt } from "./map.js";

// Territories: modern countries/territories wholly or partly under British rule, excluding the
// UK and Crown Dependencies and small "point" holdings. Land share (UK included) is a range:
// fully British countries only, up to fully plus partly British countries.
export function createCounter(el, data) {
  const pctFmt = (x) => `${(x * 100).toFixed(1)}%`;

  function stats(year) {
    let count = 0, full = 0, partial = 0;
    for (const t of data.territories) {
      const p = periodAt(t, year);
      if (!p || p.coverage === "point") continue;
      if (p.status !== "uk") count += 1;
      if (p.coverage === "full") full += t.area_km2;
      else partial += t.area_km2;
    }
    return { count, low: full / data.world_area_km2, high: (full + partial) / data.world_area_km2 };
  }

  return {
    update(year) {
      const { count, low, high } = stats(year);
      const share = pctFmt(low) === pctFmt(high) ? pctFmt(low) : `${pctFmt(low)}–${pctFmt(high)}`;
      el.innerHTML = `<strong>${count}</strong> ${count === 1 ? "territory" : "territories"} · <strong>${share}</strong> of world land`;
    },
  };
}
