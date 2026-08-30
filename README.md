# Espresso Explorer

An interactive buyer's guide for home espresso machines. Eight machines people actually cross-shop
— from a $249 compact to a $1,599 dual boiler — rebuilt in 3D from primitive geometry at true
scale, with clickable hotspots on every major component and a side-by-side comparison view.

```bash
npm install
npm run dev
```

## What's here

- **Homepage** — the shortlist, with a live hero model and scale elevation drawings generated from
  each machine's real dimensions.
- **`/machines/:id`** — a full 3D viewer with orbit, zoom and pan; numbered hotspots on the boiler,
  group head, portafilter, steam wand, water reservoir, drip tray, grinder and controls. Selecting
  a component flies the camera to it, dims everything else, and opens a panel explaining what it
  does and why it matters when you are choosing. Internal components turn the case to glass.
- **`/finder`** — six questions, then a ranked answer with its reasoning shown, plus every machine
  it ruled out and why. A scoring model, not an LLM.
- **`/compare?ids=a,b,c`** — up to three machines in one scene, one camera, true relative scale,
  plus a specification matrix that marks a winner only in rows where "better" actually means
  something.

Measurements switch between metric and imperial from the header; the choice persists and defaults
to imperial in the US.

## Retailer links

`src/data/retailers.ts` is the single place to configure affiliate ids and product URLs. Out of the
box no tags are set, so links are plain retailer searches and the site says so; add a tag and the
`rel="sponsored"` markup and disclosure copy switch on automatically.

## Stack

React 19 · Vite · TypeScript (strict) · React Three Fiber + drei · Tailwind CSS v4 ·
React Router. No 3D assets, no image assets — every machine and every product drawing is generated.

## Structure

```
src/
  data/       machines.json, parts.json, and the typed loaders + comparison schema
  models/     3D geometry: primitives/, machines/, the registry, camera framing
  components/ viewer/, compare/, layout/, ui/
  pages/      HomePage, MachinePage, ComparePage, NotFoundPage
  hooks/      compare shortlist, media queries, element size
```

See `CLAUDE.md` for the architecture in detail, including how to add a machine and how to swap a
primitive model for a real `.glb`.
