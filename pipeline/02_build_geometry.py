"""Build the simplified world TopoJSON and a geometry index from Natural Earth.

Outputs:
  data/processed/world.topojson     one feature per territory, keyed by id (ADM0_A3)
  data/processed/geometry_index.csv id, name, sovereign, type, area_km2, label point

Usage: python pipeline/02_build_geometry.py
"""

import json

import geopandas as gpd
import pandas as pd
import topojson as tp
from shapely.geometry.polygon import orient
from shapely.geometry import MultiPolygon, Polygon

from config import (
    DROP,
    EQUAL_AREA_CRS,
    FROM_10M,
    NE_10M_SHP,
    NE_50M_SHP,
    PROCESSED,
    QUANTIZATION,
    SIMPLIFY_TOLERANCE,
)

KEEP = {"ADM0_A3": "id", "NAME": "name", "NAME_LONG": "name_long", "SOVEREIGNT": "sovereign", "TYPE": "type"}


def load():
    base = gpd.read_file(NE_50M_SHP)
    extra = gpd.read_file(NE_10M_SHP)
    extra = extra[extra["ADM0_A3"].isin(FROM_10M)]
    missing = set(FROM_10M) - set(extra["ADM0_A3"])
    if missing:
        raise SystemExit(f"Not found in 1:10m data: {sorted(missing)}")

    gdf = pd.concat([base, extra], ignore_index=True)
    gdf = gdf[~gdf["ADM0_A3"].isin(DROP)]
    gdf = gdf[list(KEEP)].rename(columns=KEEP).join(gdf.geometry)
    gdf = gpd.GeoDataFrame(gdf, geometry="geometry", crs=base.crs)

    if not gdf["id"].is_unique:
        raise SystemExit(f"Duplicate ids: {gdf.loc[gdf['id'].duplicated(), 'id'].tolist()}")
    return gdf.sort_values("id").reset_index(drop=True)


def clockwise(geom):
    # d3-geo treats clockwise rings as exteriors; counter-clockwise would fill the whole globe.
    if isinstance(geom, Polygon):
        return orient(geom, sign=-1.0)
    if isinstance(geom, MultiPolygon):
        return MultiPolygon([orient(p, sign=-1.0) for p in geom.geoms])
    return geom


def decode_arcs(topo):
    """Absolute quantised coordinates for each arc (TopoJSON arcs are delta-encoded)."""
    out = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x, y = x + dx, y + dy
            pts.append((x, y))
        out.append(pts)
    return out


def ring_signed_area(ring, arcs):
    pts = []
    for i in ring:
        seg = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(seg if not pts else seg[1:])
    return sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1])) / 2


def fix_winding(topo):
    """Make exteriors clockwise and holes counter-clockwise (d3-geo convention).

    The topojson package can reuse a shared arc in the wrong direction, e.g. for
    Lesotho, whose border is also South Africa's hole. Returns ids that were fixed.
    """
    arcs = decode_arcs(topo)
    fixed = set()
    for geom in topo["objects"]["territories"]["geometries"]:
        polys = {"Polygon": [geom.get("arcs", [])], "MultiPolygon": geom.get("arcs", [])}.get(geom["type"], [])
        for poly in polys:
            for k, ring in enumerate(poly):
                exterior = k == 0
                if (ring_signed_area(ring, arcs) < 0) != exterior:
                    poly[k] = [~i for i in reversed(ring)]
                    fixed.add(geom["properties"]["id"])
    return sorted(fixed)


def build_index(gdf):
    area = gdf.to_crs(EQUAL_AREA_CRS).area / 1e6
    pts = gdf.representative_point()
    return pd.DataFrame({
        "id": gdf["id"],
        "name": gdf["name"],
        "name_long": gdf["name_long"],
        "sovereign": gdf["sovereign"],
        "type": gdf["type"],
        "area_km2": area.round(1),
        "label_lon": pts.x.round(3),
        "label_lat": pts.y.round(3),
    })


def main():
    PROCESSED.mkdir(parents=True, exist_ok=True)
    gdf = load()

    index = build_index(gdf)
    index.to_csv(PROCESSED / "geometry_index.csv", index=False, lineterminator="\n")

    gdf["geometry"] = gdf.geometry.apply(clockwise)
    out = tp.Topology(
        gdf[["id", "name", "geometry"]],
        prequantize=QUANTIZATION,
        toposimplify=SIMPLIFY_TOLERANCE,
        prevent_oversimplify=True,
        object_name="territories",
    ).to_dict()
    fixed = fix_winding(out)
    if fixed:
        print(f"Corrected ring winding for: {', '.join(fixed)}")
    path = PROCESSED / "world.topojson"
    path.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8", newline="\n")

    print(f"{len(gdf)} territories -> {path.name} ({path.stat().st_size / 1024:.0f} KB)")
    print(f"Geometry index -> geometry_index.csv")


if __name__ == "__main__":
    main()
