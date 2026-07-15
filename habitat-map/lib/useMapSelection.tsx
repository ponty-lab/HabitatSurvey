// lib/useMapSelection.ts
import { useCallback, useRef, useState } from "react";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import type { MapboxGeoJSONFeature } from "mapbox-gl";

export type SelectedFeature = {
    sourceId: string;
    featureId: string | number;
    props: Record<string, unknown>;
} | null;

export function useMapSelection(opts: {
    mapRef: React.RefObject<MapRef | null>;
    interactiveLayerIds: string[];
}) {
    const { mapRef, interactiveLayerIds } = opts;

    const [selected, setSelected] = useState<SelectedFeature>(null);
    const prevRef = useRef<SelectedFeature>(null);

    const clearSelection = useCallback(() => {
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
                clearSelection();
                return;
            }

            if (hit.id == null) {
                // feature-state needs feature.id — fix by ensuring IDs in your data load step
                return;
            }

            const next = {
                sourceId: String(hit.source),
                featureId: hit.id as string | number,
                props: (hit.properties ?? {}) as Record<string, unknown>,
            } satisfies NonNullable<SelectedFeature>;

            // clear previous
            const prev = prevRef.current;
            if (prev) {
                map.setFeatureState({ source: prev.sourceId, id: prev.featureId }, { selected: false });
            }

            // set new
            map.setFeatureState({ source: next.sourceId, id: next.featureId }, { selected: true });

            prevRef.current = next;
            setSelected(next);
        },
        [mapRef, interactiveLayerIds, clearSelection]
    );

    return { selected, onClick, clearSelection };
}