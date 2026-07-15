// src/lib/popup.tsx
import { useCallback, useRef, useState } from "react";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import type { MapboxGeoJSONFeature } from "mapbox-gl";

export type Selected = {
    sourceId: string; // e.g. "src-gmf22"
    featureId: string | number; // feature.id (REQUIRED for feature-state)
    props: Record<string, unknown>;
} | null;

type UsePopupArgs = {
    mapRef: React.RefObject<MapRef | null>;
    interactiveLayerIds: string[];
};

function fmt(n?: number) {
    if (n == null || Number.isNaN(n)) return "–";
    return Math.round(n).toLocaleString();
}

function fmtDate(d?: string) {
    if (!d) return "–";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "–";
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function DataItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[11px] text-gray-500 tracking-wide">{label}</div>
            <div className="text-[14px] font-medium">{value}</div>
        </div>
    );
}

/**
 * Fixed selection (no popup). Also highlights the selected polygon using feature-state.
 *
 * IMPORTANT:
 * - feature-state requires feature.id to be present.
 * - Ensure you set f.id when you load your GeoJSON (e.g. `${layer.id}-${i}`).
 */
export function useMapPopup({ mapRef, interactiveLayerIds }: UsePopupArgs) {
    const [selected, setSelected] = useState<Selected>(null);
    const prevRef = useRef<Selected>(null);

    const clear = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const prev = prevRef.current;
        if (prev) {
            map.setFeatureState({ source: prev.sourceId, id: prev.featureId }, { selected: false });
        }

        prevRef.current = null;
        setSelected(null);
    }, [mapRef]);

    const onClick = useCallback(
        (e: MapMouseEvent) => {
            const map = mapRef.current?.getMap();
            if (!map) return;

            const hit = map.queryRenderedFeatures(e.point, { layers: interactiveLayerIds })[0] as
                | MapboxGeoJSONFeature
                | undefined;

            if (!hit) {
                clear();
                return;
            }

            // Always clear previous highlight
            const prev = prevRef.current;
            if (prev?.featureId != null) {
                map.setFeatureState({ source: prev.sourceId, id: prev.featureId }, { selected: false });
            }

            // If Mapbox has given us an id, highlight the new one
            if (hit.id != null) {
                map.setFeatureState({ source: String(hit.source), id: hit.id }, { selected: true });
                prevRef.current = {
                    sourceId: String(hit.source),
                    featureId: hit.id as string | number,
                    props: (hit.properties ?? {}) as Record<string, unknown>,
                };
            } else {
                prevRef.current = null; // no highlight possible
            }

            setSelected({
                sourceId: String(hit.source),
                featureId: (hit.id ?? "") as string | number,
                props: (hit.properties ?? {}) as Record<string, unknown>,
            });
        },
        [mapRef, interactiveLayerIds, clear]
    );

    return { popup: selected, onClick, close: clear, setPopup: setSelected };
}

type PopupViewProps = {
    popup: Selected;
    onClose: () => void;
    p1CodeKey?: string;
    p1HabitatKey?: string;
};

export function PopupView({
    popup,
    onClose,
    p1CodeKey = "p1 code",
    p1HabitatKey = "p1 habitat",
}: PopupViewProps) {
    if (!popup) return null;

    const p = popup.props;

    const habitat = String(p[p1HabitatKey] ?? "");
    const area = Number(p["area m2"] ?? p["area"] ?? NaN);
    const perimeter = Number(p["perimeter m"] ?? p["perimeter"] ?? NaN);
    const code = String(p[p1CodeKey] ?? "");
    const survey = String(p["survey code"] ?? "");
    const name = String(p["survey name"] ?? "");
    const date = String(p["survey date"] ?? "");

    return (
        <div className="w-[360px] rounded-xl bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
                <div className="text-[18px] font-semibold leading-tight">
                    {habitat || "Habitat"}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            <div className="mt-3 rounded-lg bg-gray-100 p-3">
                <div className="grid grid-cols-2 gap-3">
                    <DataItem label="Habitat area (m²)" value={fmt(area)} />
                    <DataItem label="Perimeter (m)" value={fmt(perimeter)} />
                    <DataItem label="P1 code" value={code || "–"} />
                    <DataItem label="Survey code" value={survey || "–"} />
                    <DataItem label="Survey name" value={name || "–"} />
                    <DataItem label="Survey date" value={fmtDate(date)} />
                </div>
            </div>
        </div>
    );
}