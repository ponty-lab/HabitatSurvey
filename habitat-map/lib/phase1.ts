import type { ExpressionSpecification } from "mapbox-gl";

export const P1_CODE_KEY = "p1 code";
export const P1_HABITAT_KEY = "p1 habitat";

export const PHASE1_NAMES: Record<string, string> = {
    // A — Woodland & scrub
    "A1.1.1": "Broadleaved woodland — semi-natural",
    "A1.1.2": "Broadleaved woodland — plantation",
    "A1.2.1": "Coniferous woodland — semi-natural",
    "A1.2.2": "Coniferous woodland — plantation",
    "A1.3.1": "Mixed woodland - semi-natural",
    "A1.3.2": "Mixed woodland - plantation",
    "A2.1": "Scrub — dense/continuous",
    "A2.2": "Scrub - scattered",
    "A3.1": "Broad leaved scattered trees/parkland",

    // B — Grassland
    "B1.1": "Acid grassland — unimproved",
    "B1.2": "Acid grassland - semi-improved",
    "B2": "Neutral grassland",
    "B2.2": "Neutral grassland - semi-improved",
    "B5": "Marsh/marshy grassland",

    // C — Bracken
    "C1.1": "Bracken — continuous",
    "C3.1": "Tall ruderal",

    // D — Heath
    "D2": "Wet dwarf shrub heath",
    "D6": "Wet heath/ acid grassland mosaic",

    // E — Bog
    "E1.6.1": "Blanket bog",
    "E1.7": "Wet modified bog",
    "E2.1": "Acid/neutral flush",

    "G2": "Running water",

    "J3.6": "Building",
    "J4": "Bare ground"
};

export const PHASE1_COLORS: Record<string, string> = {
    // A — Woodland & scrub (greens)
    "A1.1.1": "#2E7D32", // semi-natural broadleaf
    "A1.1.2": "#1B5E20", // plantation broadleaf
    "A1.2.1": "#388E3C", // semi-natural conifer
    "A1.2.2": "#2E7D32", // plantation conifer
    "A1.3.1": "#43A047", // mixed semi-natural
    "A1.3.2": "#33691E", // mixed plantation
    "A2.1": "#4CAF50", // dense scrub
    "A2.2": "#66BB6A", // scattered scrub
    "A3.1": "#81C784", // scattered trees

    // B — Grassland (yellow-green)
    "B1.1": "#C0CA33", // unimproved acid
    "B1.2": "#D4E157",
    "B2": "#E6EE9C",
    "B2.2": "#F0F4C3",
    "B5": "#AED581", // marshy

    // C — Bracken / Ruderal (orange / earthy)
    "C1.1": "#D18B47",
    "C3.1": "#BF6A2A",

    // D — Heath (purples)
    "D2": "#9575CD",
    "D6": "#B39DDB",

    // E — Bog (brown peat tones)
    "E1.6.1": "#8D6E63",
    "E1.7": "#6D4C41",
    "E2.1": "#A1887F",

    // G — Water
    "G2": "#4FC3F7",

    // J — Artificial / bare
    "J3.6": "#9E9E9E",
    "J4": "#BDBDBD"
};
// "A1.1.1": "#2e7d32",
//     "A1.1.2": "#1b5e20",
//         "A1.2.1": "#3aa66a",
//             "A1.2.2": "#4fa3a5",
//                 "A2.1": "#4caf50",
//                     "B1.1": "#cddc39",
//                         "B2": "#dce775",
//                             "B5": "#4dd0e1",
//                                 "C1": "#d18b47",
//                                     "C1.1": "#d18b47",
//                                         "D2": "#9575cd",
//                                             "D6": "#b39ddb",
//                                                 "E1.6.1": "#8d6e63",
//                                                     "E1.7": "#6d4c41",
//};

export function normCode(v: unknown) {
    return String(v ?? "").trim().toUpperCase();
}

export function hashColor(code: string) {
    let h = 0;
    for (let i = 0; i < code.length; i++) h = (Math.imul(31, h) + code.charCodeAt(i)) | 0;

    const r = (h >>> 0) & 255;
    const g = (h >>> 8) & 255;
    const b = (h >>> 16) & 255;

    const rr = Math.floor((r + 200) / 2);
    const gg = Math.floor((g + 200) / 2);
    const bb = Math.floor((b + 200) / 2);

    return `rgb(${rr},${gg},${bb})`;
}

export function colorForP1(code: unknown) {
    const c = normCode(code);
    if (!c) return "#cccccc";
    return PHASE1_COLORS[c] ?? hashColor(c);
}

export function buildPhase1FillExpression(allCodes: string[]): ExpressionSpecification {
    const expr: any[] = ["match", ["get", P1_CODE_KEY]];

    for (const raw of allCodes) {
        const code = normCode(raw);
        expr.push(code, PHASE1_COLORS[code] ?? hashColor(code));
    }

    expr.push("#cccccc");
    return expr as ExpressionSpecification;
}

export function sortPhase1Codes(codes: string[]) {
    return [...codes].sort((a, b) => {
        const pa = a.split(".").map(Number);
        const pb = b.split(".").map(Number);

        const len = Math.max(pa.length, pb.length);

        for (let i = 0; i < len; i++) {
            const na = pa[i] ?? 0;
            const nb = pb[i] ?? 0;
            if (na !== nb) return na - nb;
        }

        return 0;
    });
}