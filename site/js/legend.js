import { STATUSES, NOT_BRITISH, colour } from "./statuses.js";

export function createLegend(list, onHighlight) {
  for (const s of [...STATUSES, NOT_BRITISH]) {
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.innerHTML = `<span class="swatch" style="background:${colour(s.code)}"></span><span>${s.label}</span>`;
    const on = () => onHighlight(s.code);
    const off = () => onHighlight(null);
    li.addEventListener("pointerenter", on);
    li.addEventListener("pointerleave", off);
    li.addEventListener("focus", on);
    li.addEventListener("blur", off);
    list.append(li);
  }
}
