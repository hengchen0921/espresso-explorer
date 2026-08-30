# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run preview    # serve dist/
npm run lint       # oxlint
npx tsc -b --force # typecheck alone (fast; run this after any edit)
```

There is no test runner. Typecheck is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`,
`erasableSyntaxOnly`, `verbatimModuleSyntax`) and is the main safety net — `erasableSyntaxOnly`
rules out enums and parameter properties, and `verbatimModuleSyntax` means type-only imports must
be written `import type`.

`@/*` is aliased to `src/*` in both `tsconfig.app.json` and `vite.config.ts`; changing it means
changing both.

## The one architectural idea

Three concerns are kept deliberately separate, and most mistakes in this codebase come from
blurring them:

| Concern | Lives in | Example |
| --- | --- | --- |
| **Content** — prices, prose, specs | `src/data/*.json` | "58 mm is the commercial standard…" |
| **Geometry** — how a machine is drawn | `src/models/machines/*.tsx` | boiler cylinder at `[0, 0.226, 0.05]` |
| **Presentation** — how it is laid out | `src/components`, `src/pages` | the viewer, the panel, the matrix |

`src/models/registry.ts` is the seam the whole app is designed around. Every machine resolves to a
`MachineModelDefinition`, and nothing downstream knows whether the geometry came from primitives or
a file. Swapping in a real asset is one entry:

```ts
source: {
  kind: 'gltf',
  url: '/models/rancilio-silvia.glb',
  partNodes: { GroupHead_01: 'group-head', Wand: 'steam-wand' },
}
```

…plus re-measuring that machine's `anchors` against the new asset. `GltfMachineModel.tsx` already
implements selection, dimming and x-ray for loaded scenes by mutating cloned materials. It has
never run against a real file — there is no `.glb` in the repo yet — so treat it as untested code,
not as a guarantee.

## Model conventions

- **Units are metres, at real-world scale.** The Barista Express really is 0.33 × 0.31 × 0.40. The
  comparison view stands machines side by side and depends on this; do not normalise sizes.
- **Origin** is the centre of the footprint at counter level. `+Z` is the front of the machine,
  `+X` its right. The viewer lifts the whole model by `GROUND_OFFSET` (10 mm) so the rubber feet
  land on the contact-shadow plane.
- **Anchors** (`PartAnchor`) carry a `normal`. Hotspots fade as that normal turns away from the
  camera — a deliberate substitute for raycast occlusion, which flickers badly on thin geometry
  like a steam wand. A wrong normal means a hotspot floating over the back of the case.
- **Camera positions are never written by hand.** `models/framing.ts` `frame(target, azimuth°,
  elevation°, distance)` produces them, with azimuth 0° facing the front. This is what makes the
  transitions feel like one system.
- **Authored distances are relative, not absolute.** `MachineViewer` solves the resting distance
  from the model bounds and the live canvas aspect, then scales every focused part camera by the
  same ratio. Do not reintroduce fixed per-breakpoint distances; they crop at aspect ratios you
  did not test.
- **Realism comes from three layers, not from geometry alone.** `primitives/textures.ts`
  generates brushed-metal and moulded-grain roughness/normal maps into a canvas at runtime (no
  asset, no licence) and `Surface` attaches them per finish. `primitives/Details.tsx` supplies the
  shut lines, fascias, vents, badges, trim rings, cup rails, spouts and power cords that make a box
  read as an assembly. `CastShadows` turns on self-shadowing for the model subtree, scoped by ref
  so the ground plane and lights are untouched.
- **Materials only come from `<Surface finish="…">`.** Never write a bare `<meshStandardMaterial>`
  in a machine or primitive — `Surface` is what applies hover, selection, dimming and x-ray. A mesh
  with its own material simply will not respond to selection.
- **`<Part id="…">` is what makes geometry addressable.** `id="chassis"` marks structural geometry:
  dimmable and x-rayable, never clickable. Several `<Part>` blocks may share an id (the Breville
  grinder is a hopper plus a dial plus a chute); they resolve to the same state.

### Part copy is layered, on purpose

`parts.json` holds one entry per component *class* — `fn` (how the mechanism works) and
`whyItMatters` (what a buyer should take from it). Those are written once and shared.

Each machine's `parts[]` entry in `machines.json` then carries everything specific to the part it
actually ships: `component` (the part as fitted), `figures[]` (hard numbers for that exact part),
`capability` (what this one can and cannot do), `spec` (a compact line for the component list) and
`note` (the buying trade-off). `PartPanel` renders the machine-specific layer first and the shared
layer beneath it — someone cross-shopping wants the difference before the lesson.

Figures are manufacturer-published specs and widely documented owner knowledge. Deliberately
absent: OEM part numbers and SKUs, which are easy to get subtly wrong and would read as
authoritative. Keep it that way unless you can source them.

### Adding a machine

1. Add an entry to `src/data/machines.json` — specs plus a `parts[]` entry per component carrying
   `component`, `spec`, `figures`, `capability` and `note`. Every `partId` must exist in
   `parts.json`, and `specs.instrumentation` must be one of `gauge | lcd | switches | buttons`
   (it drives both the comparison row and the control glyph on the elevation drawing).
2. Add `src/models/machines/<Name>.tsx` exporting a model component plus a
   `MachineModelDefinition` with `size`, `home` and `anchors`.
3. Register it in `src/models/registry.ts`.

Nothing else needs to change: pages, hotspots, the elevation drawing, the comparison matrix, the
homepage grid rhythm and the prose counts ("Eight machines, honestly described") are all derived.
`MachineElevation` reads `specs.instrumentation` rather than inferring it from a combination of
other fields, and the card grid picks its own row rhythm from the filtered count, so an odd number
of machines never leaves a ragged row.

A new `Category` value also needs adding to the union in `data/types.ts` and to `CATEGORIES` in
`HomePage.tsx` — those two are the only places the category list is enumerated.

**Watch the enum-valued fields.** `machines.json` is imported through a blunt `as Machine[]` cast,
so `"finish": "brushedSteel"` (instead of `"brushed-steel"`) type-checks perfectly and then takes
the whole page down the moment something indexes a palette with it — which is exactly what happened
when the portraits landed. `data/index.ts` now validates `finish`, `category`, `skillFloor` and
`instrumentation` in development and warns by machine id. Add any new enum-valued spec to that
check rather than trusting the cast.

## Pictures

Three drawings of the same machine, all generated from `specs`:

- **`MachinePortrait`** — the shaded product picture used on cards and the lineup dashboard. Filled
  in the machine's own finish palette, colour-matched to the 3D materials.
- **`MachineElevation`** — the blueprint line drawing, used on the detail page where a technical
  drawing suits the context, and carrying the dimension callouts.
- **The 3D model** — the definitive one, on the detail, comparison and lineup pages.

The caller sizes the frame (`className="h-[150px]"`) and the drawing fills it. Do not merge the
caller's class onto the `<svg>` itself: two competing height utilities land in the same stylesheet
and tiles come out at different heights depending on rule order.

There is deliberately **no product photography and no image assets at all**. A rendered image
pipeline was tried — one off-screen canvas capturing each machine with `toDataURL` — and abandoned:
that canvas mounts but its React children never render, so it silently produced nothing. If you
revisit it, prove the children mount before building on it.

## Units

`src/lib/units.ts` converts and formats; `useUnits` holds the choice (localStorage, defaulting to
imperial for `en-US`). Anything that renders a measurement takes the system as an argument rather
than assuming — including `SpecRow.value(machine, units)` and the finder's generated reasoning,
which would otherwise say "24.5 cm" while the header says inches.

**Portafilter sizes stay in millimetres in both systems.** "58 mm" is the name of a standard, not a
measurement to convert; US tamper and basket makers all say 58 mm. `formatPortafilter` exists to
make that deliberate rather than an oversight.

## The finder

`src/data/finder.ts` scores every machine against six answers and returns both matches and
rejections. It is a transparent rule engine, not an LLM, and that is a constraint of the
architecture rather than a shortcut: this is a static build with no server, so calling a model would
mean shipping an API key to the browser. A rule engine is also the only version that can show its
working, which for a buying guide matters more than fluency.

Two things to preserve if you extend it:

- **Collect every blocker, not the first.** An earlier version overwrote them, so the "nothing fits"
  case listed the widest machines rather than the closest ones.
- **Blockers are weighted by how fixable they are** (`blockerWeight`): a counter is a fixed size, a
  budget can stretch, a preference for a built-in grinder is the easiest to reconsider. That
  ordering is what makes the near-miss list useful.

Exercise it after changes — `npx tsx` a script that calls `findMachines` with a few realistic
profiles and read the answers. Wrong weights produce plausible-looking nonsense that a type checker
will never catch.

## Retailer links

All of it lives in `src/data/retailers.ts`. Put real affiliate ids in `AFFILIATE_TAGS`; paste
verified product URLs into `DIRECT_URLS` as you check them. Nothing else needs touching.

Three rules the code enforces rather than trusts:

- **Links are built from search queries, not invented product ids.** A wrong ASIN does not 404 — it
  silently sends the reader to a different machine, which is worse than no link. `brand + name +
  modelCode` resolves correctly and survives retailer URL changes.
- **Disclosure is derived, never declared.** `HAS_AFFILIATE_LINKS` and each link's `sponsored` flag
  come from whether a tag is actually set, so the page cannot claim a relationship it does not have
  or hide one it does. With no tags configured the copy says plainly that nothing earns a
  commission.
- **Compensated links carry `rel="sponsored nofollow noopener noreferrer"`** and disclosure sits
  next to the link itself — beside the top buy button as well as in the panel lower down, because
  FTC guidance wants it adjacent to the link, not only in a footer.

`BuyButton` is the primary action beside the price; `BuyLinks` is the fuller panel with the full
statement. Editorial order and verdicts are independent of commission, and the homepage copy says
so — keep that true.

## Interaction model

`MachinePage` owns `activePart` and `hoveredPart` and passes both down. Hover is controlled rather
than local so the component list beside the viewer can light up geometry — that link is the reason
the list reads as a legend for the model.

`PartInteractionContext` carries the state into the scene; `xray` is derived from the selected
anchor's `internal` flag, and only `chassis` surfaces turn to glass.

`CameraRig` animates by lerping camera position and controls target over 0.85 s. Grabbing the model
cancels the flight (`onStart` sets progress to 1) rather than disabling the controls, so the
interaction never feels stuck. Transitions are keyed by `framingKey`, not by value, so re-selecting
the same part re-frames it after the user has orbited away. They are started inside `useFrame`
rather than in an effect, which guarantees the OrbitControls instance exists before any framing is
applied — an effect can run before that ref is populated and leave the camera at its mount position
with the target still at the origin.

**Wheel zoom is opt-in.** `enableZoom` is false until the viewer is engaged with a pointer-down and
goes false again on pointer-leave. Without this a 78vh canvas swallows the page's scroll and traps
the reader on the way past it. The same rule applies on the comparison stage; the homepage hero
never zooms at all.

**Debugging note:** in an unfocused or automated browser tab, Chrome throttles `requestAnimationFrame`
hard enough that the R3F scene may not mount or animate until the tab is interacted with. A model
that appears frozen behind the "Building model" veil, or a camera that looks stuck partway through
a transition, is usually that — not an app bug. Interact with the canvas once before judging.

## Comparison state

Two stores, on purpose. `useCompare` (session storage) is the shortlist the tray and cards write
to. `ComparePage` reads its machines from `?ids=` — the URL is authoritative there so a comparison
is shareable, and the tray is mirrored from it. Do not make the context authoritative on that page;
it reintroduces a sync loop.

## Design system

Tokens are defined once in `@theme` in `src/index.css`: `ink`/`espresso`/`bark`/`ash`/`stone`/
`mist` (warm neutrals), `crema`/`paper`/`linen` (grounds), and `copper` as the single accent. Type
is Fraunces (display), Inter (body), JetBrains Mono (labels, specs, numbers) from Google Fonts.
The `.eyebrow` class is the mono label used above nearly every heading.

**Tailwind v4:** the important modifier is a *suffix* (`absolute!`), not a prefix. A stray
`!absolute` is silently a no-op class.

## Known lint warnings

`oxlint` reports `react(only-export-components)` on every file in `src/models/machines/` and on
`useCompare.tsx`. These are deliberate: a machine's geometry and its anchors belong in one file,
and splitting them to satisfy Fast Refresh granularity would break the "one file per machine"
property that makes swapping in a `.glb` a single-file change. Do not "fix" them by splitting.

## Performance

`three` + `drei` are ~1.2 MB and are bundled into a single `three-stack` chunk. Both 3D routes and
the homepage hero canvas are `React.lazy`, so the landing page's initial payload is the app shell
only. Keep it that way — a static `import` of `MachineViewer` from `App.tsx` or `HomePage.tsx` would
pull the whole stack back onto the critical path.

The studio lighting in `viewer/Stage.tsx` is built from drei `<Lightformer>`s inside `<Environment>`
rather than an HDRI, so there is no network fetch and the viewer works offline. Metals are
deliberately *not* mirror-finish (`metalness` ≈ 0.85, not 1.0) — against a dark stage a true mirror
reflects almost nothing and reads as black plastic.
