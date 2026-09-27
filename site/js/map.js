import { BY_CODE, NOT_BRITISH, PARTIAL_OPACITY } from "./statuses.js";

const WIDTH = 960;
const HEIGHT = 440;
const MARKER_MAX_KM2 = 15000; // territories smaller than this also get a point marker

// Status in `year` under the 31 December convention: start <= year < end.
export function periodAt(territory, year) {
  if (!territory) return null;
  const p = territory.periods.find((p) => p.start <= year && (p.end === null || year < p.end));
  return p && p.status !== NOT_BRITISH.code ? p : null;
}

// Periods with coverage "point" are drawn as a marker, not as a fill of the whole country.
const fillPeriodAt = (t, year) => { const p = periodAt(t, year); return p && p.coverage !== "point" ? p : null; };
const pointPeriodAt = (t, year) => { const p = periodAt(t, year); return p && p.coverage === "point" ? p : null; };

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

  // One marker per small territory, plus one per point-coverage period (e.g. Weihaiwei in China).
  const markerData = [
    ...data.territories.filter((t) => t.area_km2 < MARKER_MAX_KM2).map((t) => ({ t, at: t.label, point: null })),
    ...data.territories.flatMap((t) => t.periods.filter((p) => p.coverage === "point").map((p) => ({ t, at: p.marker, point: p }))),
  ];
  const markers = svg.append("g").selectAll("circle")
    .data(markerData)
    .join("circle")
    .attr("class", "marker")
    .attr("r", 3.5)
    .attr("transform", (d) => `translate(${projection(d.at)})`);

  land
    .on("pointerenter pointermove", (event, f) => handlers.hover(event, byId.get(f.properties.id) ?? { id: f.properties.id, name: f.properties.name, periods: [] }))
    .on("pointerleave", () => handlers.leave())
    .on("pointerenter.hl", function () { d3.select(this).classed("hovered", true).raise(); })
    .on("pointerleave.hl", function () { d3.select(this).classed("hovered", false); });
  markers
    .on("pointerenter pointermove", (event, d) => handlers.hover(event, d.t))
    .on("pointerleave", () => handlers.leave());

  function paint(el, p) {
    el.attr("fill", p ? BY_CODE[p.status].colour : NOT_BRITISH.colour)
      .attr("fill-opacity", p && p.coverage === "partial" ? PARTIAL_OPACITY : 1)
      .attr("data-status", p ? p.status : NOT_BRITISH.code);
  }

  return {
    update(year) {
      land.each(function (f) { paint(d3.select(this), fillPeriodAt(byId.get(f.properties.id), year)); });
      markers.each(function (d) {
        const p = d.point ? (pointPeriodAt(d.t, year) === d.point ? d.point : null) : fillPeriodAt(d.t, year);
        paint(d3.select(this), p);
        d3.select(this).attr("fill-opacity", 1).attr("display", p ? null : "none");
      });
    },
    highlight(code) {
      const root = d3.select(container).classed("dimmed", !!code);
      root.selectAll(".territory, .marker").classed("highlight", function () { return code && this.dataset.status === code; });
    },
  };
}
