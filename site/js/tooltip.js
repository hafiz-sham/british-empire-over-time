import { BY_CODE, NOT_BRITISH, colour } from "./statuses.js";
import { periodAt } from "./map.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function createTooltip(el, panel) {
  function render(territory, year) {
    const p = periodAt(territory, year);
    const status = p ? BY_CODE[p.status] : NOT_BRITISH;
    const years = p ? `${p.start}–${p.end === null ? "present" : p.end}` : "";
    return `
      <h3>${esc(territory.name ?? territory.id)}</h3>
      <div class="status"><span class="swatch" style="background:${colour(status.code)}"></span>${esc(status.label)}</div>
      ${years ? `<div class="years">${years}</div>` : ""}
      ${p?.unit && p.unit !== territory.name ? `<div class="unit">${esc(p.unit)}${{ partial: " (part of today's territory)", point: " (a small part of today's territory, marked with a dot)" }[p.coverage] ?? ""}</div>` : ""}
      ${p?.notes ? `<p class="notes">${esc(p.notes)}</p>` : ""}`;
  }

  return {
    show(event, territory, year) {
      el.innerHTML = render(territory, year);
      el.hidden = false;
      const box = panel.getBoundingClientRect();
      const tip = el.getBoundingClientRect();
      let x = event.clientX - box.left + 14;
      let y = event.clientY - box.top + 14;
      if (x + tip.width > box.width) x = event.clientX - box.left - tip.width - 14;
      if (y + tip.height > box.height) y = Math.max(4, box.height - tip.height - 4);
      el.style.left = `${Math.max(4, x)}px`;
      el.style.top = `${y}px`;
    },
    hide() { el.hidden = true; },
  };
}
