import { createMap } from "./map.js";
import { createTooltip } from "./tooltip.js";
import { createLegend } from "./legend.js";
import { createSlider } from "./slider.js";
import { createPanel } from "./panel.js";
import { initThemeToggle } from "./theme.js";

const DEFAULT_YEAR = 1920;

// URL hash holds shareable state, e.g. #year=1947&t=IND
function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const year = /^\d{4}$/.test(params.get("year") ?? "") ? +params.get("year") : null;
  return { year, id: params.get("t") };
}

initThemeToggle(document.getElementById("theme-toggle"));

async function init() {
  const [world, data] = await Promise.all([
    d3.json("data/world.topojson"),
    d3.json("data/territories.json"),
  ]);

  const mapPanel = document.querySelector(".map-panel");
  const yearLabel = document.getElementById("year-label");
  const tooltip = createTooltip(document.getElementById("tooltip"), mapPanel);
  let hovered = null;
  let lastEvent = null;
  let selectedId = null;

  function writeHash() {
    const params = new URLSearchParams({ year: slider.value });
    if (selectedId) params.set("t", selectedId);
    history.replaceState(null, "", `#${params}`);
  }

  function select(id) {
    const t = id && map.territory(id);
    selectedId = t ? id : null;
    map.setSelected(selectedId);
    if (t) {
      tooltip.hide();
      panel.open(t, slider.value);
    } else {
      panel.close();
    }
    writeHash();
  }

  const map = createMap(document.getElementById("map"), world, data, {
    hover(event, territory) { hovered = territory; lastEvent = event; tooltip.show(event, territory, slider.value); },
    leave() { hovered = null; tooltip.hide(); },
    select,
  });

  const panel = createPanel(document.getElementById("detail-panel"), { data, onClose: () => select(null) });

  createLegend(document.getElementById("legend"), (code) => map.highlight(code));

  const slider = createSlider({
    input: document.getElementById("year"),
    button: document.getElementById("play"),
    ticks: document.getElementById("slider-ticks"),
    min: data.year_min,
    max: data.year_max,
    onChange(year) {
      yearLabel.textContent = year;
      map.update(year);
      panel.update(year);
      if (hovered) tooltip.show(lastEvent, hovered, year);
      writeHash();
    },
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && selectedId) select(null); });

  function applyHash() {
    const { year, id } = readHash();
    slider.set(year ?? slider.value ?? DEFAULT_YEAR);
    if (id !== selectedId) select(id);
  }

  slider.set(readHash().year ?? DEFAULT_YEAR);
  if (readHash().id) select(readHash().id);
  window.addEventListener("hashchange", applyHash);
}

init().catch((err) => {
  console.error(err);
  document.getElementById("map").textContent = "The map data could not be loaded.";
});
