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

  // ============================================================
  // MODEL
  // ============================================================

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);

  const modelName = poolModel?.name || model;

  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} shaped fiberglass swimming pool`;

  // ============================================================
  // COLORS
  // ============================================================

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  // ============================================================
  // COLOR DETAILS
  // ============================================================

  const ceramicColorText = ceramicColor
    ? `${ceramicColor.name}${
        ceramicColor.hex ? ` (exact color HEX: ${ceramicColor.hex})` : ""
      }`
    : "";

  const deckColorText = deckColor
    ? `${deckColor.name}${
        deckColor.hex ? ` (exact color HEX: ${deckColor.hex})` : ""
      }`
    : "";

  // ============================================================
  // PROMPT
  // ============================================================

  return `
You are a professional architectural visualization AI.

Your task is to realistically install the selected fiberglass swimming pool into the customer's original garden photograph.

The final image must look like a REAL PHOTOGRAPH taken after the pool was professionally installed.

============================================================
REFERENCE IMAGES
============================================================

IMAGE 1:
Original customer garden/property photograph.

IMAGE 2:
Exact ${modelName} fiberglass pool model reference.

IMAGE 2 is the PRIMARY AUTHORITY for the pool model.

The pool must preserve the exact geometry, silhouette, proportions, curves, corners, steps and overall design shown in Image 2.

The pool model must NOT be redesigned because of the garden, ceramic, deck, waterfall or other options.

============================================================
MODEL IDENTITY — CRITICAL
============================================================

SELECTED MODEL:
${modelName}

MODEL DESCRIPTION:
${shapeDesc}

IMPORTANT:

Use ONLY the geometry of the selected ${modelName} model.

Do NOT replace this model with a generic swimming pool shape.

Do NOT assume every model is rectangular, oval, stadium-shaped, kidney-shaped or pill-shaped.

Different pool models have different geometries.

The selected model's own reference image and model description always determine its shape.

The presence of ceramic, deck, stairs or waterfall MUST NEVER change the basic pool geometry.

The pool must remain recognizable as the exact ${modelName} model after all selected options are added.

============================================================
POOL SHAPE — HIGHEST PRIORITY
============================================================

Preserve the exact silhouette of Image 2.

Do NOT:
- straighten curved sections
- remove rounded sections
- create new curves
- remove model-specific curves
- add random curves
- turn the pool into a generic oval
- turn the pool into a generic rectangle
- turn the pool into a stadium shape unless the selected model itself is stadium-shaped
- make the pool symmetrical if the reference model is intentionally asymmetrical
- make the pool asymmetrical if the reference model is symmetrical
- add random protrusions
- remove model-specific protrusions
- change the width-to-length ratio
- change the location or shape of built-in steps
- change the shape of the pool because ceramic or deck is selected

The selected pool model must remain visually identical in design to Image 2.

============================================================
POOL SIZE
============================================================

Specified pool size:

${size} meters

Maintain the correct proportions of the selected model.

Scale the pool realistically according to the specified size.

Do not stretch or compress the pool unnaturally.

============================================================
POOL PLACEMENT
============================================================

Place the pool in the MOST SUITABLE OPEN AREA of the original garden.

Choose the location based on:
- available open ground
- realistic pool dimensions
- house position
- existing landscaping
- trees and plants
- walls and fences
- camera perspective
- natural walking space

The pool should look like it was intentionally planned for this garden.

Do NOT simply place the pool in the center of the image.

Do NOT place the pool where it blocks the house.

Do NOT place the pool over buildings, trees, walls or existing structures.

Do NOT destroy important landscaping just to fit the pool.

The pool may replace only the necessary open grass/ground area.

Maintain realistic clearance from:
- house
- walls
- fences
- trees
- major plants
- existing structures

The pool must fit naturally into the garden at the specified size.

============================================================
IN-GROUND INSTALLATION
============================================================

This is a PROFESSIONAL IN-GROUND FIBERGLASS POOL.

The pool must be physically installed INTO the ground.

The water surface should naturally align with the surrounding finished ground level.

The pool must NOT appear above ground.

Do NOT show:
- exposed fiberglass pool walls
- a pool sitting on the ground
- a container-like pool
- a floating pool
- large gaps around the pool
- an elevated pool
- an above-ground swimming pool

The pool shell must disappear naturally below ground.

The final installation must look permanent and physically realistic.

============================================================
ORIGINAL PROPERTY — PRESERVE
============================================================

Keep the original customer photograph unchanged except for the pool installation and its selected immediate surround.

Preserve:
- house
- villa
- buildings
- windows
- doors
- balconies
- walls
- fences
- trees
- hedges
- plants
- garden structures
- existing landscaping
- camera position
- camera angle
- perspective

Do NOT redesign the property.

Do NOT generate a different garden.

Do NOT move the house.

Do NOT remove trees unnecessarily.

Do NOT change the architecture.

============================================================
POOL WATER
============================================================

The pool must contain realistic clean swimming-pool water.

Water should have:
- realistic blue color
- natural depth
- realistic reflections
- realistic sunlight
- subtle underwater light patterns
- realistic transparency
- natural water surface variation

The water must look physically present inside the fiberglass pool.

Do NOT make the water look like a flat blue graphic.

============================================================
CERAMIC SURROUND
============================================================

${
  ceramicColor
    ? `
CERAMIC IS SELECTED.

CERAMIC COLOR:
${ceramicColorText}

This exact selected ceramic color MUST be used.

The ceramic color is an independent material choice and MUST NOT change the pool model.

CERAMIC REQUIREMENTS:

- Add ceramic tiles around ALL 4 sides of the pool.
- Exactly 2 rows of tiles.
- Total surround width: 120 cm.
- Each tile: 33 cm wide x 66 cm long.
- Tile proportions MUST remain 2:1.
- Tiles MUST be rectangular.
- DO NOT use square tiles.
- Long side of each tile runs parallel to the nearest pool edge.
- Straight organized tile rows.
- Realistic 2-3 mm grout lines.
- Tiles sit flush with ground level.
- Professional outdoor ceramic installation.
- Realistic ceramic texture.
- Realistic shadows and reflections.

EXACT COLOR RULE:

The selected ceramic color is:
${ceramicColorText}

Use this exact color.

Do NOT replace the selected color with:
- white
- off-white
- cream
- beige
- light gray
- generic gray
- another blue
- another color

If the selected ceramic is blue, the final ceramic must visibly remain blue.

If the selected ceramic is dark, it must remain dark.

If the selected ceramic is light, it must remain the selected light color.

The ceramic must NOT inherit the color of the pool water.

The ceramic must NOT become white because of sunlight.

The ceramic must NOT be confused with the pool coping.

IMPORTANT:

Adding ceramic tiles must NOT change the shape, proportions or silhouette of the selected ${modelName} pool.

The pool shape is locked independently from the ceramic surround.

Do NOT reshape the pool to follow the ceramic.

Do NOT turn the pool into an oval because ceramic is selected.

Do NOT turn the pool into a rectangular pool because ceramic is selected.

Do NOT add a white border between the pool and ceramic unless it is physically part of the selected pool reference.

Do NOT add a wood deck when ceramic is selected.
`
    : `
NO CERAMIC IS SELECTED.

Do NOT add ceramic tiles.

Do NOT invent a ceramic surround.
`
}

============================================================
COMPOSITE WOOD DECK
============================================================

${
  deckColor
    ? `
COMPOSITE WOOD DECK IS SELECTED.

DECK COLOR:
${deckColorText}

This exact selected deck color MUST be used.

The deck is an independent material choice and MUST NOT change the pool model.

DECK REQUIREMENTS:

- Add composite wood deck around ALL 4 sides of the pool.
- Exactly 3 deck boards on each side.
- Total deck width: approximately 60 cm.
- Each board approximately 20 cm wide.
- Boards run parallel to the nearest pool edge.
- Tight realistic gaps between boards.
- Deck sits flush with ground level.
- Realistic composite wood texture.
- Professional outdoor installation.

EXACT COLOR RULE:

The selected deck color is:
${deckColorText}

Use this exact selected deck color.

Do NOT replace it with:
- gray
- white
- beige
- generic brown
- another wood color
- another material color

The deck must visibly preserve the selected color.

IMPORTANT:

Adding the deck must NOT change the shape, proportions or silhouette of the selected ${modelName} pool.

The pool geometry is locked independently from the deck.

Do NOT reshape the pool to fit the deck.

Do NOT turn the pool into an oval or rectangle because deck is selected.

Do NOT add ceramic tiles when deck is selected.
`
    : `
NO COMPOSITE WOOD DECK IS SELECTED.

Do NOT add a wood deck.
`
}

============================================================
CERAMIC / DECK MUTUAL EXCLUSION
============================================================

Only the selected surround material may be used.

If CERAMIC is selected:
→ ceramic only.

If DECK is selected:
→ composite wood deck only.

If neither is selected:
→ no artificial surround material.

NEVER combine ceramic and deck unless explicitly requested.

============================================================
BUILT-IN ENTRY STEPS
============================================================

${
  config.hasStairs
    ? `
BUILT-IN ENTRY STEPS ARE REQUIRED.

Add the selected pool's built-in fiberglass entry steps.

The steps must follow the actual design of the ${modelName} reference.

Requirements:
- integrated directly into the fiberglass pool shell
- realistic underwater appearance
- clearly visible
- 2-3 descending levels where applicable
- correct proportions
- realistic shadows and water distortion

STAIR TYPE:
${config.stairType}

If the selected model reference shows wide steps:
→ preserve the wide integrated step design.

If the selected model reference shows corner steps:
→ preserve the corner step design.

For models such as RELAX, the model-specific built-in steps shown in the reference must remain clearly visible.

Do NOT replace built-in fiberglass steps with a metal ladder.

Do NOT add a separate stainless-steel ladder.

Do NOT remove the model's characteristic steps.
`
    : `
Do NOT add a separate pool ladder.

Do NOT invent additional entry stairs.

If the selected model reference itself contains permanent integrated steps, preserve those model-specific steps.
`
}

============================================================
WATERFALL
============================================================

${
  config.hasWaterfall
    ? `
WATERFALL IS REQUIRED.

Add one small elegant stainless-steel waterfall blade.

- approximately 35 cm wide
- approximately 40 cm tall
- brushed/polished stainless steel
- mounted directly at the pool edge
- positioned naturally on one long side
- smooth sheet of water flowing into the pool
- realistic water flow
- realistic reflections
- realistic shadows

The waterfall must look physically connected to the pool.

The waterfall must NOT change the pool's original shape.
`
    : `
No waterfall is selected.

Do NOT add a waterfall or decorative water feature.
`
}

============================================================
FINAL PHOTOREALISM
============================================================

The final result must look like a REAL PROFESSIONAL PHOTOGRAPH.

Match the original garden photograph's:
- camera angle
- perspective
- lighting
- sunlight direction
- shadows
- weather
- time of day
- image quality

The newly installed pool must have:
- realistic contact shadows
- realistic reflections
- realistic water
- realistic depth
- realistic material texture
- realistic ground integration

The pool must look physically present in the garden.

It must NOT look pasted onto the image.

It must NOT look like:
- CGI
- 3D render
- illustration
- cartoon
- game graphics
- artificial concept art

============================================================
FINAL PRIORITY ORDER
============================================================

Follow these priorities in this exact order:

1. Preserve the original customer garden.
2. Preserve the EXACT selected pool model from Image 2.
3. Preserve the model's exact geometry and proportions.
4. Place the pool in the most suitable available garden area.
5. Install the pool realistically underground.
6. Preserve all model-specific built-in steps.
7. Apply the EXACT selected ceramic OR deck color and geometry.
8. Add waterfall only if selected.
9. Match the original camera, lighting and perspective.
10. Produce a photorealistic final photograph.

MOST IMPORTANT:

CERAMIC OR DECK MUST NEVER CHANGE THE POOL MODEL.

The ${modelName} pool must still look like the exact ${modelName} reference even after ceramic, deck, stairs or waterfall are added.

Do NOT simplify the model into a generic oval.

Do NOT convert the model into a generic stadium pool.

Do NOT change the pool shape because of the surround material.

The selected model identity is LOCKED.
`.trim();
}