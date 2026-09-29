import { BY_CODE, NOT_BRITISH, PARTIAL_OPACITY, colour } from "./statuses.js";
import { periodAt } from "./map.js";

const ISSUES_URL = "https://github.com/hafiz-sham/british-empire-over-time/blob/main/DATA_ISSUES.md";
const COVERAGE_NOTE = {
  partial: "Part of today's territory",
  point: "A small part of today's territory (marked with a dot)",
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Readable date from "1947-08-15", "1947-08" or "1947".
function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!m) return String(y);
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  return d ? `${d} ${month} ${y}` : `${month} ${y}`;
}

export function createPanel(el, { data, onClose }) {
  const min = data.year_min;
  const max = data.year_max;
  const pct = (y) => ((Math.min(Math.max(y, min), max + 1) - min) / (max + 1 - min)) * 100;
  let current = null;

  function timeline(t, year) {
    const segs = t.periods
      .filter((p) => p.status !== NOT_BRITISH.code && (p.end === null || p.end > min))
      .map((p) => {
        const left = pct(p.start), right = pct(p.end ?? max + 1);
        const faint = p.coverage !== "full" ? `;opacity:${PARTIAL_OPACITY}` : "";
        return `<span class="seg" title="${esc(BY_CODE[p.status].label)}, ${p.start}–${p.end ?? "present"}" style="left:${left}%;width:${right - left}%;background:${colour(p.status)}${faint}"></span>`;
      }).join("");
    return `
      <div class="timeline" aria-hidden="true">
        <div class="track">${segs}<span class="now" style="left:${pct(year) + 100 / (max + 1 - min) / 2}%"></span></div>
        <div class="axis"><span style="left:0">${min}</span><span style="left:${pct(1950)}%">1950</span><span style="left:${pct(2000)}%">2000</span><span style="right:0;left:auto">${max}</span></div>
      </div>`;
  }

  function periodItem(p) {
    const s = BY_CODE[p.status];
    const exact = [p.start_date && `from ${fmtDate(p.start_date)}`, p.end_date && `to ${fmtDate(p.end_date)}`].filter(Boolean).join(" ");
    const sources = p.sources.map((id) => {
      const src = data.sources[id];
      if (!src) return "";
      return `<li>${src.url ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.citation)}</a>` : esc(src.citation)}</li>`;
    }).join("");
    return `
      <li class="period">
        <div class="period-head">
          <span class="swatch" style="background:${colour(p.status)}"></span>
          <strong>${esc(s.label)}</strong>
          <span class="period-years">${p.start}–${p.end ?? "present"}</span>
        </div>
        ${p.unit ? `<div class="period-unit">${esc(p.unit)}${COVERAGE_NOTE[p.coverage] ? ` · ${COVERAGE_NOTE[p.coverage]}` : ""}</div>` : ""}
        ${exact ? `<div class="period-dates">${esc(exact)}</div>` : ""}
        ${p.notes ? `<p class="period-notes">${esc(p.notes)}</p>` : ""}
        ${p.issue ? `<p class="period-issue">Judgement call: see <a href="${ISSUES_URL}" target="_blank" rel="noopener">data issue #${esc(p.issue)}</a>.</p>` : ""}
        <details class="period-sources"><summary>Sources (${p.sources.length})</summary><ul>${sources}</ul></details>
      </li>`;
  }

  function render(t, year) {
    const p = periodAt(t, year);
    const status = p ? BY_CODE[p.status] : NOT_BRITISH;
    const periods = t.periods.filter((q) => q.status !== NOT_BRITISH.code);
    el.innerHTML = `
      <div class="panel-head">
        <div>
          <h2 id="panel-title">${esc(t.name)}</h2>
          <p class="panel-now"><span class="swatch" style="background:${colour(status.code)}"></span>In ${year}: ${esc(status.label)}</p>
        </div>
        <button class="panel-close" type="button" aria-label="Close details">×</button>
      </div>
      <div class="panel-body">
        ${periods.length ? timeline(t, year) : ""}
        ${periods.length
          ? `<ol class="periods">${periods.map(periodItem).join("")}</ol>`
          : `<p class="panel-empty">Not under British rule at any point from ${min} to ${max} in this dataset.</p>`}
      </div>`;
    el.querySelector(".panel-close").addEventListener("click", onClose);
  }

  return {
    get territory() { return current; },
    open(t, year) {
      const wasOpen = !el.hidden;
      current = t;
      render(t, year);
      el.hidden = false;
      if (!wasOpen) el.querySelector(".panel-close").focus({ preventScroll: true });
    },
    update(year) {
      if (!current || el.hidden) return;
      const p = periodAt(current, year);
      const status = p ? BY_CODE[p.status] : NOT_BRITISH;
      el.querySelector(".panel-now").innerHTML = `<span class="swatch" style="background:${colour(status.code)}"></span>In ${year}: ${esc(status.label)}`;
      const now = el.querySelector(".now");
      if (now) now.style.left = `${pct(year) + 100 / (max + 1 - min) / 2}%`;
    },
    close() { el.hidden = true; current = null; },
  };
}
