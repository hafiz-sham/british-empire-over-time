import { BY_CODE, NOT_BRITISH, PARTIAL_OPACITY } from "./statuses.js";

const WIDTH = 960;
const HEIGHT = 440;
const MARKER_MAX_KM2 = 3000; // territories smaller than this also get a point marker

// Status in `year` under the 31 December convention: start <= year < end.
export function periodAt(territory, year) {
  if (!territory) return null;
  const p = territory.periods.find((p) => p.start <= year && (p.end === null || year < p.end));
  return p && p.status !== NOT_BRITISH.code ? p : null;
}

export function createMap(container, world, data, handlers) {
  const byId = new Map(data.territories.map((t) => [t.id, t]));
  const features = topojson.feature(world, world.objects.territories).features;

  // Fit to the land rather than the sphere: Antarctica is not drawn.
  const projection = d3.geoEqualEarth().fitExtent([[8, 8], [WIDTH - 8, HEIGHT - 8]], { type: "FeatureCollection", features });
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("role", "img")
    .attr("aria-label", "World map coloured by British status in the selected year");

  const land = svg.append("g").selectAll("path")
    .data(features)
    .join("path")
    .attr("class", "territory")
    .attr("d", path);

  const small = data.territories.filter((t) => t.area_km2 < MARKER_MAX_KM2);
  const markers = svg.append("g").selectAll("circle")
    .data(small)
    .join("circle")
    .attr("class", "marker")
    .attr("r", 3.5)
    .attr("transform", (t) => `translate(${projection(t.label)})`);

  const hover = (sel, getId) => sel
    .on("pointerenter pointermove", (event, d) => handlers.hover(event, byId.get(getId(d)) ?? { id: getId(d), name: d.properties?.name, periods: [] }))
    .on("pointerleave", () => handlers.leave());

  hover(land, (f) => f.properties.id);
  hover(markers, (t) => t.id);

  land.on("pointerenter.hl", function () { d3.select(this).classed("hovered", true).raise(); })
    .on("pointerleave.hl", function () { d3.select(this).classed("hovered", false); });

  function fill(sel, getTerritory, year) {
    sel.each(function (d) {
      const p = periodAt(getTerritory(d), year);
      d3.select(this)
        .attr("fill", p ? BY_CODE[p.status].colour : NOT_BRITISH.colour)
        .attr("fill-opacity", p && p.coverage === "partial" ? PARTIAL_OPACITY : 1)
        .attr("data-status", p ? p.status : NOT_BRITISH.code);
    });
  }

  return {
    update(year) {
      fill(land, (f) => byId.get(f.properties.id), year);
      fill(markers, (t) => t, year);
      markers.attr("display", function () { return this.dataset.status === NOT_BRITISH.code ? "none" : null; });
    },
    highlight(code) {
      const root = d3.select(container).classed("dimmed", !!code);
      root.selectAll(".territory, .marker").classed("highlight", function () { return code && this.dataset.status === code; });
    },
  };
}
