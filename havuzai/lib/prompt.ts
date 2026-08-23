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
  const isRoma = model.toUpperCase() === "ROMA" || modelName.toUpperCase() === "ROMA";

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

  // ---- POOL SHAPE section (isRoma'ya göre ayrılmış — önceden HER modele
  // aynı sabit "stadium/pill" metni gidiyordu, bu yanlıştı ve Relax'e bile
  // uygulanıyordu). ----
  const shapeSection = isRoma
    ? `The pool MUST match Image 2 exactly.

For the ROMA model:

- The outline is an elongated, gently curved shape — NOT a symmetric stadium, NOT a symmetric pill, NOT a perfect oval.
- The two ends are NOT identical to each other:
  - The end WITHOUT steps is a plain, smooth, fully rounded curve.
  - The end WITH the molded entry steps has a subtle stepped-out shoulder where the staircase block meets the pool walls — the silhouette flares slightly wider right at the top of the steps before curving into the rounded cap. This end is NOT a plain semicircle.
- The two long sides bow gently outward (slightly convex), not perfectly straight, not perfectly parallel.
- One continuous seamless fiberglass shell, no sharp corners, no rectangular corners, no kidney shape, no random extra bulges or protrusions beyond what is described above.

Do not redesign or reinterpret the pool shape. Do not default to a generic symmetric stadium/pill assumption — copy Image 2's actual silhouette, including its asymmetry between the two ends.

The reference image is more important than generic pool-shape assumptions.`
    : `The pool MUST match Image 2 exactly.

Copy Image 2's silhouette faithfully as shown — its proportions, corner style, and overall outline.

Do not turn it into a stadium shape, pill shape, oval, or any curved silhouette unless Image 2 itself shows curves. Do not redesign or reinterpret the pool shape.

The reference image is more important than generic pool-shape assumptions.`;

  // ---- ENTRY STEPS section (model bazlı konum: Roma = uçta, diğerleri =
  // köşede — önceden model ayrımı yapılmıyordu, sadece "one short end"
  // deniyordu). ----
  const stepsSection = config.hasStairs
    ? isRoma
      ? `
Add wide BUILT-IN FIBERGLASS ENTRY STEPS.

- Located at the rounded, shouldered end of the pool described in the POOL SHAPE section above (the end with the stepped-out silhouette).
- 2-3 visible descending levels, spanning most of that end's width.
- Integrated directly into the fiberglass shell, same color as the shell.
- Clearly visible underwater, with soft light and shadow defining each step edge.
- Match the reference model exactly.

IMPORTANT:
Do NOT add a stainless-steel ladder.
Do NOT add an external staircase.
`
      : `
Add BUILT-IN FIBERGLASS ENTRY STEPS.

- Located in ONE CORNER of the pool, in the same corner as shown in the reference image — not centered on a short end, not spanning the full width.
- 2-3 visible descending levels, compact and corner-fitted.
- Integrated directly into the fiberglass shell, same color as the shell.
- Clearly visible underwater, with soft light and shadow defining each step edge.
- Match the reference model exactly.

IMPORTANT:
Do NOT add a stainless-steel ladder.
Do NOT add an external staircase.
`
    : `
Do not add additional pool stairs or a pool ladder.
`;

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

${shapeSection}

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
CERAMIC SURROUND (MANDATORY):

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
Do NOT add any white border, coping, or rim around the pool.
Do NOT skip the ceramic tiles — they are MANDATORY when selected.
`
    : deckColor
    ? `
COMPOSITE WOOD DECK (MANDATORY):

Add a composite wood deck around the pool.

- Total width: approximately 60 cm.
- Exactly 3 boards.
- Each board approximately 20 cm wide.
- Boards parallel to the nearest pool edge.
- Deck color: ${deckColor.name}.
- Flush with ground level.
- Realistic material texture and gaps.

Do NOT add ceramic tiles.
Do NOT add any white border, coping, or rim around the pool.
Do NOT skip the deck — it is MANDATORY when selected.
`
    : `
NO SURROUND MATERIAL:

Do not add ceramic tiles, wood deck, paving stones or decorative borders.

The existing ground should naturally meet the pool edge.
Do NOT add any white border, coping, or rim around the pool.
`
}

==================================================
ENTRY STEPS
==================================================

${stepsSection}

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
2. Match Image 2 pool shape exactly, including asymmetry where present.
3. Do not force a symmetric stadium/pill silhouette unless Image 2 actually shows one.
4. Install the pool underground.
5. Do not expose fiberglass walls.
6. Apply the selected deck or ceramic surround.
7. Use integrated fiberglass steps in the correct position (end for Roma, corner for other models) when selected.
8. Do not add a metal ladder.
9. Add the waterfall only when selected.
10. Do not change the camera perspective.
11. Produce a photorealistic photograph.
12. Never add a white border, coping, or rim around the pool.

The pool shape and reference image have the highest priority.
`.trim();
}