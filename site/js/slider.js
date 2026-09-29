const STEP_MS = 150; // ~19 s for the full 1900–2026 run
const EVENT_PAUSE_MS = 1400; // extra dwell on event years while playing
const TICKS = [1900, 1925, 1950, 1975, 2000, 2025];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function createSlider({ input, button, ticks, eventsEl, caption, events = [], min, max, onChange }) {
  input.min = min;
  input.max = max;
  let timer = null;
  const pos = (year) => `${((year - min) / (max - min)) * 100}%`;
  const byYear = new Map(events.map((e) => [e.year, e]));

  for (const year of TICKS.filter((y) => y >= min && y <= max)) {
    const span = document.createElement("span");
    span.textContent = year;
    span.style.left = pos(year);
    ticks.append(span);
  }

  // Event markers: small buttons above the track. Hover or focus previews the caption; click jumps.
  function showCaption(e) {
    caption.innerHTML = e ? `<strong>${e.year}: ${esc(e.label)}.</strong> ${esc(e.description)}` : "";
    caption.hidden = !e;
  }
  for (const e of events) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "event-mark";
    b.style.left = pos(e.year);
    b.setAttribute("aria-label", `${e.year}: ${e.label}`);
    b.addEventListener("click", () => { stop(); set(e.year); });
    b.addEventListener("pointerenter", () => showCaption(e));
    b.addEventListener("focus", () => showCaption(e));
    b.addEventListener("pointerleave", () => showCaption(byYear.get(+input.value)));
    b.addEventListener("blur", () => showCaption(byYear.get(+input.value)));
    eventsEl.append(b);
  }

  function set(year) {
    const y = Math.max(min, Math.min(max, Math.round(year)));
    input.value = y;
    input.setAttribute("aria-valuetext", byYear.has(y) ? `${y}: ${byYear.get(y).label}` : String(y));
    eventsEl.querySelectorAll(".event-mark").forEach((b, i) => b.classList.toggle("active", events[i].year === y));
    showCaption(byYear.get(y));
    onChange(y);
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
    button.classList.remove("playing");
    button.setAttribute("aria-label", "Play");
  }

  function tick() {
    if (+input.value >= max) return stop();
    set(+input.value + 1);
    timer = setTimeout(tick, byYear.has(+input.value) ? STEP_MS + EVENT_PAUSE_MS : STEP_MS);
  }

  function play() {
    if (+input.value >= max) set(min);
    button.classList.add("playing");
    button.setAttribute("aria-label", "Pause");
    timer = setTimeout(tick, STEP_MS);
  }

  button.addEventListener("click", () => (timer ? stop() : play()));
  input.addEventListener("input", () => { stop(); set(+input.value); });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, button, textarea, summary, a, [contenteditable]")) return;
    if (e.key === " ") { e.preventDefault(); timer ? stop() : play(); }
    if (e.key === "ArrowRight") { stop(); set(+input.value + 1); }
    if (e.key === "ArrowLeft") { stop(); set(+input.value - 1); }
  });

  return { set, get value() { return +input.value; } };
}
