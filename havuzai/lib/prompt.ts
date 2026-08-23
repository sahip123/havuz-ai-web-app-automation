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

  const poolShape = isRoma
    ? `ROMA is an asymmetric freeform pool. Copy the EXACT outer silhouette, curves, proportions and shape from Image 2. Image 2 is the absolute shape reference. Do not redesign it. NOT rectangular, NOT square, NOT a generic oval, and NO straight sides.`
    : shapeDesc;

  return `
Edit Image 1 professionally and add the pool from Image 2.

IMAGE 1: Garden/property photo — preserve the scene.
IMAGE 2: Pool model — copy its EXACT shape and proportions.

POOL:
Model: ${modelName}
Size: ${size} meters
Shape: ${poolShape}

The pool must be a professionally built IN-GROUND pool.
Water level and surrounding ground must be flush.
No above-ground walls, no visible exterior sides, no gaps.
Do not change buildings, trees, plants, fences or existing landscaping.

${
  ceramicColor
    ? `
CERAMIC SURROUND:
Add exactly 2 rows of ${ceramicColor.name} ceramic tiles around the entire pool.
Total width: 120cm.
Tiles are rectangular 33x66cm, never square.
Tiles and grout lines must follow the exact pool outline, including curved ROMA edges.
Tiles sit flush with the ground.
No white border or raised coping.
`
    : deckColor
      ? `
DECK SURROUND:
Add exactly 3 composite deck boards around the entire pool.
Total width: 60cm.
Board color: ${deckColor.name}.
The deck follows the exact pool outline, including curved ROMA edges.
Deck sits flush with the ground.
No white border or raised coping.
`
      : `
No deck or tiles. The original ground meets the pool edge directly.
`
}

${
  config.hasStairs
    ? `
Add a visible 3-step stainless steel pool ladder on a short end, descending into the water.
`
    : ""
}

${
  config.hasWaterfall
    ? `
Add a small polished stainless steel cobra waterfall blade on the pool edge with water flowing into the pool.
`
    : ""
}

Match the original photo's camera angle, perspective, lighting and shadows.
Photorealistic professional real-estate photography.

ABSOLUTE RULES:
- Exact pool shape from Image 2
- Especially for ROMA: do not simplify or reinterpret the silhouette
- Pool must be completely in-ground
- Do not modify the existing scene
- No cartoon, CGI or illustration style
`.trim();
}