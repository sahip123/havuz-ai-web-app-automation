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

  // Firma config'inden model bilgisini bul
  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} shaped fiberglass pool`;

  // Deck ve seramik renk bilgilerini bul
  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const isRoma = model.toUpperCase() === "ROMA";

  const shapeRule = isRoma
    ? "Use Image 2 as the exact shape reference. Do not simplify, redesign, stretch, or reinterpret the pool silhouette."
    : "Follow the selected pool model shape exactly as described above.";

  return `
You are a professional architectural visualization AI. Place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph.

REFERENCE IMAGES:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2: ${modelName} pool model — USE THIS EXACT POOL SHAPE
${config.hasWaterfall ? "- Image 3: Waterfall style reference — ADD THIS WATERFALL TO POOL EDGE" : ""}

MOST IMPORTANT — IN-GROUND INSTALLATION:
This is a professional IN-GROUND swimming pool built into the ground.
The water surface is at the same level as the surrounding ground.
No above-ground pool walls, raised sides, gaps, or visible exterior pool shell.

RULE 1 — PRESERVE THE SCENE:
Keep all existing buildings, trees, plants, fences, walls, paths and landscaping unchanged.
Only add the pool to the available open ground.
Do not block the main building's view.

RULE 2 — POOL SHAPE: ${modelName.toUpperCase()}
${shapeDesc}

Shape rule: ${shapeRule}
Size: ${size} meters — maintain exact proportions.
The pool must be realistically sized for the garden and smaller than the house.

RULE 3 — POOL WATER:
Clear, bright blue realistic water with natural reflections, depth and light shimmer.
The pool interior goes visibly down into the ground.

${
  ceramicColor
    ? `
SURROUND:
First create the EXACT pool shape from Image 2.
DO NOT change, resize, simplify or redraw the pool shape.

Then add exactly 2 rows of ${ceramicColor.name} rectangular 33x66cm ceramic tiles OUTSIDE the existing pool edge.
The tiles must follow and wrap around the exact existing pool silhouette.
The ceramic surround must adapt to the pool shape — the pool shape must NEVER adapt to the ceramic tiles.
Tiles sit flush with the ground.
No white border or raised coping.
`
    : deckColor
      ? `
SURROUND:
First create the EXACT pool shape from Image 2.
DO NOT change, resize, simplify or redraw the pool shape.

Then add exactly 3 rows of ${deckColor.name} composite deck boards OUTSIDE the existing pool edge.
The deck must follow and wrap around the exact existing pool silhouette.
The deck surround must adapt to the pool shape — the pool shape must NEVER adapt to the deck.
Deck sits flush with the ground.
No white border or raised coping.
`
      : ""
}

${
  config.hasStairs
    ? `
RULE 5 — POOL LADDER (MANDATORY):
A 3-step polished stainless steel pool entry ladder MUST be visible.
Position it on one short end of the pool, descending into the water.
`
    : ""
}

${
  config.hasWaterfall
    ? `
RULE 6 — WATERFALL BLADE (MANDATORY):
A small elegant stainless steel cobra waterfall blade MUST be visible.
Approximately 35cm wide and 40cm tall.
Mounted on the pool edge with water flowing into the pool.
`
    : ""
}

RULE 7 — PHOTOREALISTIC QUALITY:
Match the original photo's camera angle, perspective, lighting and shadows.
The result must look like a real professional photograph, not CGI, render, cartoon or illustration.

PRIORITY ORDER:
1. Preserve the original garden
2. Create the exact pool shape from Image 2
3. Keep that pool shape LOCKED
4. Add ceramic or deck around the locked pool shape

POOL SHAPE IS FIXED.
The surround must follow the pool.
The pool must never change to fit the surround.

FINAL CHECK:
The pool silhouette must be exactly the same with or without the ceramic/deck surround.
The surround must not extend, cut, reshape or reinterpret the pool outline.

ABSOLUTE PROHIBITIONS:
❌ Pool above ground
❌ Visible exterior pool walls
❌ Wrong pool shape
❌ Changing existing buildings, trees or landscaping
❌ Cartoon, render, 3D or illustration style
${ceramicColor ? "❌ Missing ceramic tile surround" : ""}
${deckColor ? "❌ Missing deck surround" : ""}
${config.hasStairs ? "❌ Missing pool ladder" : ""}
${config.hasWaterfall ? "❌ Missing waterfall" : ""}
`.trim();
}