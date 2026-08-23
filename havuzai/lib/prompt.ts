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
    `${model} shaped fiberglass swimming pool`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  return `
You are a professional architectural visualization AI.

Edit the provided garden photo by realistically installing the specified fiberglass swimming pool.

The final result must look like a real photograph of the same property after a professional pool installation.

REFERENCE:
- Image 1 = original customer garden photo. Preserve this environment.
- Image 2 = exact ${modelName} pool model. This is the PRIMARY reference for the pool shape.

POOL MODEL:
${shapeDesc}

==================================================
POOL SHAPE — HIGHEST PRIORITY
==================================================

The pool MUST match Image 2 exactly.

For this stadium-shaped model:

- Two long straight parallel sides.
- Two short rounded ends.
- Smooth continuous transition from the straight sides into the rounded ends.
- Symmetrical stadium / pill-shaped silhouette.
- One continuous seamless fiberglass shell.
- No sharp corners.
- No rectangular corners.
- No kidney shape.
- No random curves.
- No bulges.
- No extra protrusions.
- No asymmetrical extensions.

Do not redesign or reinterpret the pool shape.

The reference image is more important than generic pool-shape assumptions.

SIZE:
${size} meters

Maintain the correct proportions of the reference model.

==================================================
INSTALLATION
==================================================

The pool is a professional IN-GROUND fiberglass pool.

The pool must be installed INTO the ground, not placed on top of it.

The water surface must naturally align with the surrounding finished ground level.

Only the selected pool edge/surround may be visible.

Never show:
- an above-ground pool
- exposed fiberglass walls
- a floating pool
- a pool sitting like a container
- large gaps between the pool and ground

The pool must look permanently installed and physically believable.

==================================================
ORIGINAL PROPERTY
==================================================

Preserve the original photograph.

Do NOT change:
- house
- buildings
- windows
- doors
- fences
- walls
- trees
- plants
- hedges
- existing landscaping
- camera angle
- perspective

Only modify the necessary ground area where the pool is installed.

Place the pool naturally in the most suitable open garden area.

Keep the pool proportional to the house and garden.

==================================================
WATER
==================================================

Use realistic clean blue pool water.

The water must have:
- realistic depth
- natural reflections
- subtle sunlight
- realistic underwater light patterns
- natural color variation

Do not make the water look flat or artificial.

==================================================
POOL SURROUND
==================================================

${
  ceramicColor
    ? `
CERAMIC SURROUND:

Add a ceramic tile surround around the pool.

- Total width: 120 cm.
- Exactly 2 rows.
- Tile size: 33 x 66 cm.
- Rectangular 2:1 proportions.
- Long side parallel to the pool edge.
- Visible realistic grout lines.
- Tile color: ${ceramicColor.name}.
- Tiles flush with ground level.
- Professional outdoor installation.

Do NOT use square tiles.
Do NOT add a wood deck.
`
    : deckColor
    ? `
COMPOSITE WOOD DECK:

Add a composite wood deck around the pool.

- Total width: approximately 60 cm.
- Exactly 3 boards.
- Each board approximately 20 cm wide.
- Boards parallel to the nearest pool edge.
- Deck color: ${deckColor.name}.
- Flush with ground level.
- Realistic material texture and gaps.

Do NOT add ceramic tiles.
`
    : `
NO SURROUND MATERIAL:

Do not add ceramic tiles, wood deck, paving stones or decorative borders.

The existing ground should naturally meet the pool edge.
`
}

==================================================
ENTRY STEPS
==================================================

${
  config.hasStairs
    ? `
Add wide BUILT-IN FIBERGLASS ENTRY STEPS.

- Located on one short end of the pool.
- 2-3 visible descending levels.
- Wide and proportional to the pool.
- Integrated directly into the fiberglass shell.
- Clearly visible underwater.
- Match the reference model.

IMPORTANT:
Do NOT add a stainless-steel ladder.
Do NOT add an external staircase.
`
    : `
Do not add additional pool stairs or a pool ladder.
`
}

==================================================
WATERFALL
==================================================

${
  config.hasWaterfall
    ? `
Add one small stainless-steel waterfall blade.

- Approximately 35 cm wide.
- Approximately 40 cm tall.
- Brushed/polished stainless steel.
- Mounted directly on one long pool edge.
- Smooth sheet of water flowing into the pool.
- Realistic connection, reflections and shadows.

Do not create a large decorative waterfall structure.
`
    : `
Do not add a waterfall or other water feature.
`
}

==================================================
PHOTOREALISM
==================================================

The final result must look like a real professional photograph.

Match the original image's:
- camera angle
- perspective
- lighting
- shadows
- weather
- time of day
- image quality

The pool must have realistic:
- shadows
- reflections
- depth
- material texture
- contact with the ground

The pool must look physically present in the original garden.

Do NOT make it look like:
- CGI
- 3D render
- illustration
- cartoon
- game graphics

==================================================
ABSOLUTE RULES
==================================================

1. Preserve the original property.
2. Match Image 2 pool shape.
3. Keep the stadium/pill silhouette.
4. Keep the pool symmetrical.
5. Install the pool underground.
6. Do not expose fiberglass walls.
7. Apply the selected deck or ceramic surround.
8. Use integrated fiberglass steps when selected.
9. Do not add a metal ladder.
10. Add the waterfall only when selected.
11. Do not change the camera perspective.
12. Produce a photorealistic photograph.

The pool shape and reference image have the highest priority.
`.trim();
}