import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model: string;
  size: string;
  deck: string;
  ceramic: string;
  hasWaterfall: boolean;
  hasStairs: boolean;
  stairType: "corner" | "wide";
}

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} shaped fiberglass pool`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const isRoma = model.toUpperCase() === "ROMA";

  // ROMA modelinin şekli diğer model açıklamalarından bağımsız olarak
  // referans görseldeki özel organik formu takip eder.
  const effectiveShapeDesc = isRoma
    ? `
ROMA is an asymmetric organic freeform fiberglass pool.
MATCH THE EXACT OUTER SILHOUETTE OF IMAGE 2.
The pool has a large wide smoothly rounded end and a narrower rounded opposite end.
Its long sides are continuously curved and asymmetric, creating a flowing natural shape.
The outline must match the distinctive ROMA model shown in Image 2.

Image 2 is the ABSOLUTE SOURCE OF TRUTH for the ROMA pool shape.
Do not redesign, simplify, stretch, or reinterpret the ROMA silhouette.
ABSOLUTELY NOT rectangular.
ABSOLUTELY NOT square.
ABSOLUTELY NOT a generic symmetrical oval.
NO straight sides and NO 90-degree corners.
`
    : shapeDesc;

  const shapeRule = isRoma
    ? `
EXACT ROMA FREEFORM SHAPE REQUIRED.
Copy the outer silhouette and proportions of Image 2 as accurately as possible.
Asymmetric flowing curved sides, wide rounded end, narrower rounded opposite end.
`
    : `
Strictly rectangular — straight sides and 90-degree corners.
ABSOLUTELY NOT oval or curved.
`;

  return `
You are a professional architectural visualization AI.
Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo.

The result must look exactly like a real photograph taken after the pool was professionally built and installed.

REFERENCE IMAGES:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2: ${modelName} pool model — USE THIS EXACT POOL SHAPE
${config.hasWaterfall ? "- Image 3: Waterfall style reference — ADD THIS WATERFALL TO POOL EDGE" : ""}

---

MOST IMPORTANT RULE — IN-GROUND INSTALLATION

This is a PROFESSIONAL IN-GROUND swimming pool built INTO the ground.

The water surface must be at the SAME LEVEL as the surrounding ground.
The pool goes down into the earth.
Only a thin flush edge may be visible at ground level.
The pool must look permanent and professionally installed.

NEVER show:
- Pool sitting above ground
- Visible exterior pool walls
- Raised pool sides
- Gaps between pool and surrounding surface

Pool above ground = INVALID OUTPUT.

---

RULE 1 — PRESERVE THE ORIGINAL SCENE

Keep all existing buildings, houses, trees, plants, fences, walls and landscaping unchanged.
Only add the pool to the available open ground area.
Do not alter the architecture.
Do not remove existing objects unnecessarily.
Do not block the main building.

---

RULE 2 — POOL SHAPE: ${modelName.toUpperCase()}

${effectiveShapeDesc}

Shape rule:
${shapeRule}

Size: ${size} meters — maintain realistic proportions.

The pool must be reasonably sized for the visible garden.
It must be smaller than the house/building.
Do not fill the entire garden with the pool.

---

RULE 3 — POOL WATER

Clear bright blue water.
Realistic depth, natural reflections, light shimmer and subtle color variation.
The pool interior must visibly go down into the ground.

---

${
  ceramicColor
    ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY)

Add a ceramic tile walkway following the ENTIRE OUTER SHAPE of the pool.

IMPORTANT:
- The ceramic surround must FOLLOW THE EXACT CURVED OUTLINE of the pool.
- For ROMA, tiles must follow the asymmetric freeform curved pool shape.
- Do not force the ROMA pool into a rectangular tile border.

Exactly 2 rows of ceramic tiles around the pool.
Total surround width: 120cm.
Each row: 60cm wide.

Tile size:
- Rectangular 33cm x 66cm
- 2:1 ratio
- NEVER square tiles
- Long side parallel to the nearest pool edge
- For curved ROMA edges, orient tiles naturally along the curve
- Visible 2-3mm grout lines

Tile color: ${ceramicColor.name} colored ceramic tiles.

Tiles sit completely flush at ground level.
Clean, professional, realistic finish.
The ceramic surround replaces the original grass directly around the pool.

DO NOT add any extra white border, coping, or raised rim.
Ceramic tiles are MANDATORY.
`
    : deckColor
      ? `
RULE 4 — DECK SURROUND (MANDATORY)

Add a composite wood deck around the ENTIRE pool.

IMPORTANT:
- The deck must FOLLOW THE EXACT OUTER SHAPE of the pool.
- For ROMA, the deck edge must follow the asymmetric curved pool outline.
- Do not place a rectangular deck around a curved ROMA pool.

Exactly 3 deck boards around the pool.
Total width: 60cm.
Each board: 20cm wide.

Deck boards follow the nearest pool edge.
For curved ROMA edges, boards must naturally follow the pool's curved outline.

Deck color: ${deckColor.name} colored composite wood deck.

The deck sits flush at ground level.
Clean modern finish with tight gaps.
The deck replaces the grass directly around the pool.

DO NOT add any extra white border, coping, or raised rim.
Deck is MANDATORY.
`
      : `
RULE 4 — POOL SURROUND

The original ground meets the pool edge directly.

Do not add:
- Deck
- Ceramic tiles
- Stone
- Pavers
- Extra border
- White coping
- Raised rim

The pool shell must remain completely below ground.
Only the water surface and a thin flush edge are visible.
`
}

---

${
  config.hasStairs
    ? `
RULE 5 — POOL LADDER (MANDATORY)

A 3-step stainless steel pool entry ladder MUST be visible.
Polished chrome stainless steel.
Mounted on one short end of the pool.
Steps go down into the water.

OMITTING THE LADDER = INVALID OUTPUT.
`
    : ""
}

${
  config.hasWaterfall
    ? `
RULE 6 — WATERFALL BLADE (MANDATORY)

A small elegant stainless steel cobra waterfall blade MUST be visible.

Approximately 35cm wide and 40cm tall.
Polished brushed stainless steel.
Mounted directly on the pool edge.
Water flows in a smooth sheet into the pool.

OMITTING THE WATERFALL = INVALID OUTPUT.
`
    : ""
}

---

RULE 7 — PHOTOREALISTIC QUALITY

Match the original camera angle and perspective exactly.
Match the original lighting, shadows and time of day.
The result must look like a real professional photograph.
Luxury villa quality.
Clean, realistic, premium finish.

---

ABSOLUTE PROHIBITIONS:

❌ Pool above ground
❌ Visible exterior pool walls
❌ Raised pool sides
❌ Changing existing buildings or landscaping
❌ Wrong pool shape
❌ For ROMA: rectangular, square, generic oval, or symmetrical pool shape
❌ For ROMA: ignoring the exact Image 2 silhouette
❌ Cartoon, CGI, 3D render, illustration style
${ceramicColor ? "❌ Missing ceramic tile surround" : ""}
${deckColor ? "❌ Missing deck surround" : ""}
${config.hasStairs ? "❌ Missing pool ladder" : ""}
${config.hasWaterfall ? "❌ Missing waterfall" : ""}
`.trim();
}
