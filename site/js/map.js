import { NOT_BRITISH, PARTIAL_OPACITY, colour } from "./statuses.js";

const WIDTH = 960;
const HEIGHT = 440;
const MARKER_MAX_KM2 = 15000; // territories smaller than this also get a point marker
const MARKER_R = 3.5;
const MAX_ZOOM = 12;

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
  const features = topojson.feature(world, world.objects.territories).features;

  // Every map feature gets a territory record; uncurated ones have no periods (never British).
  const byId = new Map(features.map((f) => [f.properties.id, { id: f.properties.id, name: f.properties.name, periods: [] }]));
  for (const t of data.territories) byId.set(t.id, t);

  // Fit to the land rather than the sphere: Antarctica is not drawn.
  const projection = d3.geoEqualEarth().fitExtent([[8, 8], [WIDTH - 8, HEIGHT - 8]], { type: "FeatureCollection", features });
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("role", "img")
    .attr("aria-label", "World map coloured by British status in the selected year");

  const layer = svg.append("g").attr("class", "map-layer");

  const land = layer.append("g").selectAll("path")
    .data(features)
    .join("path")
    .attr("class", "territory")
    .attr("d", path);

  // One marker per small territory, plus one per point-coverage period (e.g. Weihaiwei in China).
  const markerData = [
    ...data.territories.filter((t) => t.area_km2 < MARKER_MAX_KM2).map((t) => ({ t, at: t.label, point: null })),
    ...data.territories.flatMap((t) => t.periods.filter((p) => p.coverage === "point").map((p) => ({ t, at: p.marker, point: p }))),
  ];
  const markers = layer.append("g").selectAll("circle")
    .data(markerData)
    .join("circle")
    .attr("class", "marker")
    .attr("r", MARKER_R)
    .attr("transform", (d) => `translate(${projection(d.at)})`);

  // Touch has no hover: a tap opens the panel directly instead of showing a tooltip first.
  const hover = (event, t, onPoint = false) => { if (event.pointerType !== "touch") handlers.hover(event, t, onPoint); };

  land
    .on("pointerenter pointermove", (event, f) => hover(event, byId.get(f.properties.id)))
    .on("pointerleave", () => handlers.leave())
    .on("pointerenter.hl", function () { d3.select(this).classed("hovered", true).raise(); })
    .on("pointerleave.hl", function () { d3.select(this).classed("hovered", false); })
    .on("click", (event, f) => handlers.select(f.properties.id));
  markers
    .on("pointerenter pointermove", (event, d) => hover(event, d.t, !!d.point))
    .on("pointerleave", () => handlers.leave())
    .on("click", (event, d) => handlers.select(d.t.id));

  // Zoom and pan. Mouse-wheel zoom needs Ctrl/Cmd so the page still scrolls; on touch,
  // one finger scrolls the page until the map is zoomed in, and two fingers pinch.
  let k = 1;
  const zoom = d3.zoom()
    .scaleExtent([1, MAX_ZOOM])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .filter((event) => {
      if (event.type === "wheel") {
        if (!(event.ctrlKey || event.metaKey)) { handlers.wheelHint?.(); return false; }
        return true;
      }
      if (event.type.startsWith("touch")) return event.touches.length > 1 || k > 1;
      return !event.button;
    })
    .on("zoom", (event) => {
      k = event.transform.k;
      layer.attr("transform", event.transform);
      markers.attr("r", MARKER_R / Math.sqrt(k));
      svg.style("touch-action", k > 1 ? "none" : "pan-y");
      handlers.zoomed?.(k);
    });
  svg.call(zoom).style("touch-action", "pan-y");

  function zoomTo(transform, ms = 600) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    svg.transition().duration(reduce ? 0 : ms).call(zoom.transform, transform);
  }

  function zoomBy(factor) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    svg.transition().duration(reduce ? 0 : 250).call(zoom.scaleBy, factor);
  }

  // Fit a territory's shape (or its marker, for small places) in view.
  // insetRight: fraction of the map width hidden by an overlay (the side panel), so the
  // territory is centred in the part of the map that is still visible.
  function zoomToTerritory(id, insetRight = 0) {
    const f = features.find((x) => x.properties.id === id);
    const t = byId.get(id);
    let [[x0, y0], [x1, y1]] = f ? path.bounds(f) : [[0, 0], [0, 0]];
    const small = !f || (x1 - x0) * (y1 - y0) < 25 || (t.area_km2 ?? 0) < MARKER_MAX_KM2 || x1 - x0 > WIDTH * 0.9;
    if (small && t?.label) {
      const [x, y] = projection(t.label);
      [x0, y0, x1, y1] = [x - 20, y - 12, x + 20, y + 12];
    }
    const visibleW = WIDTH * (1 - insetRight);
    const scale = Math.min(MAX_ZOOM * 0.75, 0.8 / Math.max((x1 - x0) / visibleW, (y1 - y0) / HEIGHT));
    zoomTo(d3.zoomIdentity.translate(visibleW / 2, HEIGHT / 2).scale(Math.max(1, scale)).translate(-(x0 + x1) / 2, -(y0 + y1) / 2));
  }

  function paint(el, p) {
    el.style("fill", colour(p ? p.status : NOT_BRITISH.code))
      .attr("fill-opacity", p && p.coverage === "partial" ? PARTIAL_OPACITY : 1)
      .attr("data-status", p ? p.status : NOT_BRITISH.code);
  }

  return {
    territory: (id) => byId.get(id),
    territories: () => [...byId.values()],
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
    zoomIn: () => zoomBy(1.6),
    zoomOut: () => zoomBy(1 / 1.6),
    zoomReset: () => zoomTo(d3.zoomIdentity),
    zoomToTerritory,
    setSelected(id) {
      land.classed("selected", (f) => f.properties.id === id);
      markers.classed("selected", (d) => d.t.id === id);
      land.filter(".selected").raise();
    },
  };
}
