// src/MapView.tsx
import "mapbox-gl/dist/mapbox-gl.css";

import { useRef, useEffect, useMemo, useState } from "react";
import type { FC, LayerManifest, LayersJson } from "../lib/reproject";
import {
    reprojectFeatureCollection,
    boundsFromFeatureCollection,
    HabitatKeyMenu,
    P1_CODE_KEY,
    PHASE1_COLORS,
    PHASE1_NAMES,
    normCode,
    hashColor,
    useMapPopup,
    PopupView,
} from "../lib";
import MapTopNav from "./Navbar";
import Map, { Layer, type LayerProps, Source, type MapMouseEvent, type MapRef } from "react-map-gl/mapbox";
import type { ExpressionSpecification } from "mapbox-gl";
import { useNavigate } from "react-router-dom";

const OS_TILES =
    "https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=" +
    import.meta.env.VITE_OS_KEY;
const BASE_URL = import.meta.env.BASE_URL;

type Bounds = [[number, number], [number, number]];


export function MapView() {
    const mapRef = useRef<MapRef | null>(null);
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

    const [manifest, setManifest] = useState<LayerManifest[]>([]);
    const [data, setData] = useState<Record<string, FC>>({});
    const [didFit, setDidFit] = useState(false);
    const [renderPopup, setRenderPopup] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);



    if (!token) throw new Error("Missing VITE_MAPBOX_TOKEN in .env.local");


    // Load manifest + all geojson (reprojecting 27700 -> WGS84)
    useEffect(() => {
        (async () => {
            const m = (await (await fetch(`${BASE_URL}data/layers.json`)).json()) as LayersJson;
            setManifest(m.layers);

            const loaded = await Promise.all(
                m.layers.map(async (layer) => {
                    const resp = await fetch(`${BASE_URL}${layer.url}`);
                    if (!resp.ok) throw new Error(`Failed to load ${layer.url}`);
                    const fc27700 = (await resp.json()) as FC;
                    const fcWgs84 = reprojectFeatureCollection(fc27700, layer);
                    return [layer.id, fcWgs84] as const;
                })
            );

            setData(Object.fromEntries(loaded));
        })().catch((e) => {
            console.error(e);
            alert(e?.message ?? String(e));
        });
    }, []);

    function splitCode(code: string) {
        const m = code.match(/^([A-Z]+)(.*)$/);
        return { group: m?.[1] ?? code, rest: m?.[2] ?? "" };
    }

    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

    const allCodes = useMemo(() => {
        const s = new Set<string>();
        for (const fc of Object.values(data)) {
            for (const f of fc.features) {
                const p = (f.properties ?? {}) as Record<string, unknown>;
                const code = normCode(p[P1_CODE_KEY]);
                if (code) s.add(code);
            }
        }

        return [...s].sort((a, b) => {
            const A = splitCode(a);
            const B = splitCode(b);
            const g = collator.compare(A.group, B.group);
            if (g !== 0) return g;
            return collator.compare(A.rest, B.rest);
        });
    }, [data]);

    // Mapbox expression: match p1 code -> colour
    const fillColorExpr = useMemo<ExpressionSpecification>(() => {
        const expr: any[] = ["match", ["get", P1_CODE_KEY]];
        for (const code of allCodes) expr.push(code, PHASE1_COLORS[code] ?? hashColor(code));
        expr.push("#cccccc");
        return expr as ExpressionSpecification;
    }, [allCodes]);

    // Layers (note: react-map-gl nests under <Source>, but Mapbox layer typing wants source; we avoid
    // the strict spec typing by letting <Layer> accept the object)
    const selectedFillOpacity: ExpressionSpecification = [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        0.85,
        0.55,
    ];

    const selectedLineColor: ExpressionSpecification = [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        "#FFF",
        "#FFF",
    ];

    const selectedLineWidth: ExpressionSpecification = [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        3,
        0.5,
    ];

    const makeFillLayer = (id: string, fillColorExpr: ExpressionSpecification): LayerProps => ({
        id: `fill-${id}`,
        type: "fill",
        paint: {
            "fill-color": fillColorExpr, // already ExpressionSpecification
            "fill-opacity": selectedFillOpacity,
        },
    });

    const makeLineLayer = (id: string): LayerProps => ({
        id: `line-${id}`,
        type: "line",
        paint: {
            "line-color": selectedLineColor,
            "line-width": selectedLineWidth,
        },
    });

    const interactiveIds = useMemo(() => manifest.map((l) => `fill-${l.id}`), [manifest]);

    const onMouseMove = (e: MapMouseEvent) => {
        const map = mapRef.current?.getMap();
        if (!map) return;
        const hit = map.queryRenderedFeatures(e.point, { layers: interactiveIds }).length > 0;
        map.getCanvas().style.cursor = hit ? "pointer" : "";
    };

    const { popup, onClick, close } = useMapPopup({
        mapRef,
        interactiveLayerIds: interactiveIds,
    });

    const navigate = useNavigate();

    // Combined bounds (once we have data)
    const fitBounds = useMemo<Bounds | null>(() => {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        for (const fc of Object.values(data)) {
            const b = boundsFromFeatureCollection(fc);
            if (!b) continue;
            const [[x0, y0], [x1, y1]] = b;
            if (x0 < minX) minX = x0;
            if (y0 < minY) minY = y0;
            if (x1 > maxX) maxX = x1;
            if (y1 > maxY) maxY = y1;
        }

        if (!Number.isFinite(minX)) return null;
        return [
            [minX, minY],
            [maxX, maxY],
        ];
    }, [data]);

    const baseStyle = useMemo(
        () => ({
            version: 8 as const,
            sources: {},
            layers: [],
        }),
        []
    );

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;
        if (didFit) return;
        if (!fitBounds) return;

        map.fitBounds(fitBounds, { padding: 40, duration: 0 });
        setDidFit(true);
    }, [fitBounds, didFit]);

    useEffect(() => {
        if (popup) {
            setRenderPopup(true);
            setPopupOpen(false);
            const t = window.setTimeout(() => setPopupOpen(true), 0);
            return () => window.clearTimeout(t);
        } else {
            setPopupOpen(false);
            const t = window.setTimeout(() => setRenderPopup(false), 200);
            return () => window.clearTimeout(t);
        }
    }, [popup]);


    return (
        <div className="relative h-screen w-screen" >
            <Map
                ref={mapRef}
                mapboxAccessToken={token}
                mapStyle={baseStyle}
                initialViewState={{ longitude: -2.93, latitude: 54.61, zoom: 13 }}
                style={{ width: "100%", height: "100%" }}
                interactiveLayerIds={interactiveIds}
                onClick={onClick}
                onMouseMove={onMouseMove}
                dragRotate={false}
                touchZoomRotate={false}
                keyboard={false}
                onLoad={(e) => {
                    const map = e.target; // Mapbox GL JS map instance
                    const canvas = map.getCanvas();

                    // Allow the browser context menu (so you can Inspect)
                    canvas.addEventListener(
                        "contextmenu",
                        (ev) => {
                            ev.stopImmediatePropagation(); // block Mapbox's handler
                            // NOTE: do NOT call preventDefault()
                        },
                        true // capture phase is the key
                    );
                }}
            >
                <Source id="os-maps" type="raster" tiles={[OS_TILES]} tileSize={256} >
                    <Layer id="os-maps" type="raster" />
                </Source>

                {/* Add all sources/layers */}
                {
                    manifest.map((layer) => {
                        const fc = data[layer.id];
                        if (!fc) return null;

                        return (
                            <Source key={layer.id} id={`src-${layer.id}`
                            } type="geojson" data={fc} generateId>
                                <Layer {...makeFillLayer(layer.id, fillColorExpr)} />
                                <Layer {...makeLineLayer(layer.id)} />
                            </Source>
                        );
                    })}

            </Map>

            {renderPopup && (
                <div className="pointer-events-none absolute left-4 top-[72px] z-40">
                    <div
                        className={[
                            "pointer-events-auto origin-top transition-all duration-200 ease-out",
                            "motion-reduce:transition-none motion-reduce:transform-none",
                            popupOpen
                                ? "opacity-100 translate-y-0 scale-100"
                                : "opacity-0 -translate-y-2 scale-[0.98]",
                        ].join(" ")}
                    >
                        <PopupView popup={popup} onClose={close} />
                    </div>
                </div>
            )}
            {/* {keyOpen && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setKeyOpen(false)}
                />
            )} */}
            <HabitatKeyMenu
                allCodes={allCodes}
                PHASE1_COLORS={PHASE1_COLORS}
                PHASE1_NAMES={PHASE1_NAMES}
                hashColor={hashColor}
            />

            <MapTopNav
                brand="Matterdale Nature Watch Group"
                onAbout={() => {
                    // open modal, route navigate, etc.
                    navigate(`/about`);
                }}
                allCodes={allCodes}
                PHASE1_COLORS={PHASE1_COLORS}
                PHASE1_NAMES={PHASE1_NAMES}
                hashColor={hashColor}
            />

        </div >
    );
}
