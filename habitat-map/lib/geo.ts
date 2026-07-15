import type { FeatureCollection, Geometry } from "geojson";

export type Bounds = [[number, number], [number, number]];

export function boundsFromFeatureCollection(
    fc: FeatureCollection
): Bounds | null {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    const extend = (coord: [number, number]) => {
        const [x, y] = coord;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    };

    const walk = (g: Geometry) => {
        const t = g.type;
        const c: any = (g as any).coordinates;

        if (t === "Point") extend(c);
        else if (t === "MultiPoint" || t === "LineString") c.forEach(extend);
        else if (t === "MultiLineString" || t === "Polygon") c.flat().forEach(extend);
        else if (t === "MultiPolygon") c.flat(2).forEach(extend);
    };

    for (const f of fc.features) {
        if (f.geometry) walk(f.geometry);
    }

    if (!Number.isFinite(minX)) return null;
    return [
        [minX, minY],
        [maxX, maxY],
    ];
}