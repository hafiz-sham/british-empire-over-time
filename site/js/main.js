import { createMap } from "./map.js";
import { createTooltip } from "./tooltip.js";
import { createLegend } from "./legend.js";
import { createSlider } from "./slider.js";

const DEFAULT_YEAR = 1920;

function yearFromHash() {
  const m = location.hash.match(/year=(\d{4})/);
  return m ? +m[1] : null;
}

async function init() {
  const [world, data] = await Promise.all([
    d3.json("data/world.topojson"),
    d3.json("data/territories.json"),
  ]);

  const panel = document.querySelector(".map-panel");
  const yearLabel = document.getElementById("year-label");
  const tooltip = createTooltip(document.getElementById("tooltip"), panel);
  let hovered = null;
  let lastEvent = null;

  const map = createMap(document.getElementById("map"), world, data, {
    hover(event, territory) { hovered = territory; lastEvent = event; tooltip.show(event, territory, slider.value); },
    leave() { hovered = null; tooltip.hide(); },
  });

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
      if (hovered) tooltip.show(lastEvent, hovered, year);
      history.replaceState(null, "", `#year=${year}`);
    },
  });

  slider.set(yearFromHash() ?? DEFAULT_YEAR);
  window.addEventListener("hashchange", () => { const y = yearFromHash(); if (y) slider.set(y); });
}

init().catch((err) => {
  console.error(err);
  document.getElementById("map").textContent = "The map data could not be loaded.";
});
