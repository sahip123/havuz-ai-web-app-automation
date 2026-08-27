import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model:        string;
  size:         string;
  deck:         string;
  ceramic:      string;
  hasWaterfall: boolean;
  hasStairs:    boolean;
  stairType:    "corner" | "wide";
}

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const isRelax = model.toUpperCase() === "RELAX";

  const shapeDesc = isRoma
    ? "Stadium-shaped fiberglass pool with two straight parallel long sides and rounded semicircular ends. Smooth continuous shape with no sharp corners or seams. Horizontal ribbing on the interior walls. One short end has wide built-in entry steps with 2-3 visible tiers descending into the water."
    : isRelax
    ? "Strictly rectangular fiberglass pool with straight parallel sides and four sharp 90-degree corners. Horizontal ribbing on the interior walls. One corner has a built-in staircase with 3-4 clearly visible rectangular steps descending into the water."
    : poolModel?.prompt_description ||
      poolModel?.description ||
      `${model} shaped fiberglass pool`;

  const shapeRule = isRoma
  ? "ROMA is ONE fixed pool design. Copy the EXACT silhouette and proportions from Image 2. NEVER make it a generic oval, capsule, ellipse, or symmetrical pool. Image 2 is the absolute shape authority."
  : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved." ; isRelax
    ? `STRICT RELAX SHAPE: strictly rectangular with four sharp 90-degree corners and straight parallel sides. NEVER round, curve, oval, stadium-shape, or modify any corner.`
    : `The selected pool model description defines the exact pool geometry. Do not change or reinterpret the pool shape.`;

  const surroundRule = isRoma
    ? `The surround must follow the exact rounded stadium-shaped perimeter of the ROMA pool. Keep both straight sides and both equal rounded ends. NEVER reshape the pool to make the surround rectangular.`
    : isRelax
    ? `The surround must follow the exact rectangular perimeter of the RELAX pool while preserving all four sharp 90-degree corners.`
    : `The surround must follow the exact pool perimeter. The pool shape must never change to fit the surround.`;

  return `
You are a professional architectural visualization AI. Place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after professional installation.

REFERENCE IMAGES:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2: ${modelName} pool model — USE THIS EXACT POOL SHAPE
${config.hasWaterfall ? "- Image 3: Waterfall reference — ADD THIS WATERFALL TO THE POOL EDGE" : ""}

---

MOST IMPORTANT — IN-GROUND INSTALLATION:
This is a professional IN-GROUND swimming pool.
- Pool water surface is at the same level as the surrounding ground
- Pool goes down into the earth
- No visible pool walls above ground
- No gaps or raised pool structure
- The pool must look permanently built into the garden

Pool above ground = completely wrong output.

---

RULE 1 — PRESERVE THE SCENE
Keep everything in the original photo exactly as it is:
- Do not change buildings, trees, plants, fences, walls or paths
- Only add the pool to available open ground
- Pool must not block the main building

---

RULE 2 — EXACT POOL SHAPE: ${modelName.toUpperCase()}

${shapeDesc}

${shapeRule}

Size: ${size} meters — maintain exact proportions.
The pool must be smaller than the house and fit naturally into the available garden.
Do not fill the entire garden with the pool.

IMPORTANT PRIORITY:
Create the exact pool shape FIRST.
Lock that shape.
Nothing added later may change, simplify, stretch, round, or reinterpret the pool shape.

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Realistic depth, light shimmer and natural color variation.
The pool interior goes visibly deep into the ground.

---

${ceramicColor ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY)

First create and LOCK the exact pool shape above.
Only then add the ceramic surround outside the completed pool.

${surroundRule}

Add exactly 2 rows of ${ceramicColor.name} ceramic tiles around the entire pool perimeter.
- Total width: 120cm
- Tile size: rectangular 33x66cm, 2:1 ratio
- NEVER use square tiles
- Long side follows the nearest pool edge
- On ROMA's rounded ends, tiles follow the curved pool contour
- Visible 2-3mm grout lines
- Tiles sit flush with the ground
- No white border, coping, or raised rim
- Ceramic replaces the grass directly around the pool

The ceramic must adapt to the pool shape.
The pool must NEVER change to fit the ceramic.
DO NOT skip the ceramic surround.
` : deckColor ? `
RULE 4 — DECK SURROUND (MANDATORY)

First create and LOCK the exact pool shape above.
Only then add the deck outside the completed pool.

${surroundRule}

Add exactly 3 rows of ${deckColor.name} composite deck boards around the entire pool perimeter.
- Total width: 60cm
- Each board: 20cm wide
- Boards follow the nearest pool edge
- On ROMA's rounded ends, the boards follow the curved pool contour
- Tight gaps between boards
- Deck sits flush at ground level
- No white border, coping, or raised rim
- Deck replaces the grass directly around the pool

The deck must adapt to the pool shape.
The pool must NEVER change to fit the deck.
DO NOT skip the deck.
` : `
RULE 4 — POOL SURROUND
The original ground material meets the pool edge directly.
Do not add deck, ceramic, stone, pavers, walkway or border.
Do not add any white coping or rim.
`}

---

${config.hasStairs ? `
RULE 5 — POOL LADDER (MANDATORY)
A 3-step polished stainless steel pool entry ladder MUST be visible.
Position it on one short end, with the steps descending into the water.
OMITTING THE LADDER = INVALID OUTPUT.
` : ""}

${config.hasWaterfall ? `
RULE 6 — WATERFALL BLADE (MANDATORY)
A small stainless steel cobra waterfall blade MUST be visible.
Approximately 35cm wide and 40cm tall.
Mount it directly on the pool edge on one long side.
Water must flow in a smooth sheet into the pool.
OMITTING THE WATERFALL = INVALID OUTPUT.
` : ""}

---

RULE 7 — PHOTOREALISTIC QUALITY
- Real professional photograph, not a render
- Match original camera angle and perspective
- Match original lighting and shadows
- Pool must look naturally installed
- Luxury villa quality

PRIORITY ORDER:
1. Preserve original garden
2. Create the exact ${modelName.toUpperCase()} pool shape
3. LOCK the pool shape
4. Add deck or ceramic around the locked shape

ABSOLUTE PROHIBITIONS:
❌ Pool above ground
❌ Visible exterior pool walls
❌ Changing buildings or landscaping
❌ Changing the pool shape to fit ceramic or deck
❌ Cartoon, 3D render, illustration style
${isRoma ? "❌ Rectangular, square, teardrop, asymmetric or Relax-shaped ROMA pool" : ""}
${isRelax ? "❌ Rounded, oval, stadium-shaped or curved RELAX pool" : ""}
${ceramicColor ? "❌ Missing ceramic surround" : ""}
${deckColor ? "❌ Missing deck surround" : ""}
${config.hasStairs ? "❌ Missing pool ladder" : ""}
${config.hasWaterfall ? "❌ Missing waterfall" : ""}
  `.trim();
}