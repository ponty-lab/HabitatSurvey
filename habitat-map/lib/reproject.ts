import proj4 from "proj4";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export type LayerManifest = { id: string; name: string, url: string };
export type LayersJson = { layers: LayerManifest[] };

type Props = Record<string, unknown>;
export type FC = FeatureCollection<Geometry, GeoJsonProperties>;

const P1_CODE_KEY = "p1 code";
const P1_HABITAT_KEY = "p1 habitat";

// Define EPSG:27700 once
proj4.defs(
    "EPSG:27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs"
);

export function normCode(v: unknown) {
    return String(v ?? "").trim().toUpperCase();
}

type F = Feature<Geometry, Props>;
function hasGeometry(f: F): f is F & { geometry: Geometry } {
    return f.geometry !== null;
}

function reprojectCoord27700ToWgs84(coord: number[]) {
    const [lon, lat] = proj4("EPSG:27700", "WGS84", [coord[0], coord[1]]);
    return [lon, lat] as [number, number];
}

function reprojectGeometry(g: Geometry): Geometry {
    const t = g.type;
    const c: any = (g as any).coordinates;

    switch (t) {
        case "Point":
            return { ...g, coordinates: reprojectCoord27700ToWgs84(c) };

        case "MultiPoint":
            return { ...g, coordinates: c.map(reprojectCoord27700ToWgs84) };

        case "LineString":
            return { ...g, coordinates: c.map(reprojectCoord27700ToWgs84) };

        case "MultiLineString":
            return {
                ...g,
                coordinates: c.map((line: any[]) => line.map(reprojectCoord27700ToWgs84)),
            };

        case "Polygon":
            return {
                ...g,
                coordinates: c.map((ring: any[]) => ring.map(reprojectCoord27700ToWgs84)),
            };

        case "MultiPolygon":
            return {
                ...g,
                coordinates: c.map((poly: any[]) =>
                    poly.map((ring: any[]) => ring.map(reprojectCoord27700ToWgs84))
                ),
            };

        default:
            return g;
    }
}

export function reprojectFeatureCollection(fc: FC, layer?: LayerManifest): FC {

    const features = fc.features
        .map((f) => {
            const props: Props = { ...(f.properties ?? {}) };

            if (props[P1_CODE_KEY]) props[P1_CODE_KEY] = normCode(props[P1_CODE_KEY]);
            if (props[P1_HABITAT_KEY]) props[P1_HABITAT_KEY] = String(props[P1_HABITAT_KEY]).trim();

            if (layer) {
                props._layer_id = layer.id;
                props._layer_name = layer.name;
            }

            // Feature.geometry is Geometry | null (never undefined in valid GeoJSON)
            if (f.geometry === null) return { ...f, properties: props };

            return {
                ...f,
                properties: props,
                geometry: reprojectGeometry(f.geometry),
            };
        })
        // optional: drop null-geometry features so later bounds/fit/popup logic is simpler
        .filter(hasGeometry);

    return { ...fc, features };
}