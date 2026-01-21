export const P1_CODE_KEY = "p1 code";
export const P1_HABITAT_KEY = "p1 habitat";

export const PHASE1_COLORS = {
  "A1.1.1": "#2e7d32", // Semi-natural broadleaved woodland
  "A1.1.2": "#1b5e20", // Broad-leaved woodland - plantation
  "A1.2.1": "#3aa66a", // Semi-natural coniferous woodland
  "A1.2.2": "#4fa3a5", // Coniferous woodland - plantation
  "A2.1":   "#4caf50", // Dense scrub
  "B1.1":   "#cddc39", // Acid grassland, unimproved
  "B2":     "#dce775",
  "B5":     "#4dd0e1", // Marsh / marshy grassland
  "C1.1":   "#d18b47", // Bracken
  "D2":     "#9575cd", // Wet heath
  "D6":     "#b39ddb", // Dry heath
  "E1.6.1": "#8d6e63", // Blanket bog
  "E1.7":   "#6d4c41"
};

/** Deterministic fallback colour for any unknown p1 codes */
export function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  const r = (h >>>  0) & 255;
  const g = (h >>>  8) & 255;
  const b = (h >>> 16) & 255;
  // soften it
  const rr = Math.floor((r + 200) / 2);
  const gg = Math.floor((g + 200) / 2);
  const bb = Math.floor((b + 200) / 2);
  return `rgb(${rr},${gg},${bb})`;
}

export function buildPhase1FillExpression(allCodes) {
  // Use explicit colours where we have them, else fall back deterministically.
  const expr = ["match", ["get", P1_CODE_KEY]];
  for (const code of allCodes) {
    expr.push(code, PHASE1_COLORS[code] ?? hashColor(code));
  }
  expr.push("#cccccc"); // if p1 code missing
  return expr;
}
