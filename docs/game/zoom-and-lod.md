# The zoom for the Queen's Proof-of-Compute map

Four levels on one camera, sized from the constants that are already in the source, and
from label widths I measured on this machine today.

Everything here is a change to `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/components/QueenResearchCity.tsx`
and its two model files. Nothing here proposes a new view. The zoom's whole job is to
be the thing that connects the five surfaces that already exist.

---

## 0. Six things that changed under the three docs. Read this before the design.

### 0.1 The canvas2D verdict has already been voided by its own escape clause

`engine-benchmark.md` §11 lists four conditions that would change the answer. Condition 4
is *"The page moving into the t27.ai React SPA. three.js is already there at a measured
249,526 bytes; its marginal cost would drop toward zero and the 43.7x argument would
collapse. Today the Queen pages are not on that host."*

That condition has fired. Measured today:

| fact | measurement |
| --- | --- |
| `https://t27.ai/assets/three-C7rSOEFP.js` | **249,526 bytes** served, same figure as §9 |
| `https://t27.ai/assets/index-Dv6Ogf4x.js` | 265,409 bytes, contains the route `path:"/queen"` |
| the real Queen page | `apps/website/src/pages/Queen.tsx`, in the SPA, **1,790 lines** |
| `apps/website/package.json` | `"three": "^0.183.2"`, `"@react-three/fiber": "^9.5.0"`, `"@react-three/drei": "^10.7.7"` |
| `QueenResearchCity.tsx:1-2` | `import { Line, OrbitControls } from "@react-three/drei"` |

And two QA contracts in the same worktree *require* it by regex:

- `qa/queen-research-city-contract.mjs:44` — `/from\s+["']@react-three\/fiber["']/`, message
  "City must use React Three Fiber"
- `qa/queen-game-cabinet-contract.mjs` — `/data-engine="react-three-fiber"/`, message
  "Cabinet must name the existing web-native 3D engine"

So the runner-up won, on the benchmark's own stated terms. **This design targets three.js
r183 via R3F. It is not a rejection of `engine-benchmark.md`; it is that document's
clause 4, executed.** Section 7 is where canvas2D still wins, and it is exactly one level.

### 0.2 Three of the five endpoints are 404, so three of the four zoom levels have no data

Re-verified today against `https://trios-agent-server-production.up.railway.app`:

```
/queen/status            200   600 B
/queen/public-board      200   11,715 B
/queen/public-research   404   13 B
/queen/public-hardware   404   13 B
/queen/public-activity   404   13 B
```

Grepping the server confirms it: `/queen/public-board` is the **only** `public-` route in
`trios/agent-server/apps/server/src/api/server.ts` (lines 327, 331). The other three exist
in no source.

Consequence, and it is severe: `useQueenResearch()` returns null → `researchNodes = []` →
`buildResearchCityModel` returns `unavailableModel()` → the city renders
`<section className="queen27-city is-offline">`. And `QueenFactory.tsx:119` does
`const effectiveWorkers = researchError ? null : workers`, so `buildWorkerHangars(null)`
returns `lockedDeck()` — **eight locked hangars, capacity 0**. The FPGA foundry is null too.

**In production right now, the research city, the construction queue, the hangar deck and
the signed foundry are all dark, and the only reason is that one route was never written.**
The zoom cannot fix that. Level 1 below is the only level buildable on data that exists.

### 0.3 The 3D scene bypasses the palette it is supposed to inherit

The user's binding direction 1 is "colours and style like on the main page". Measured live
from `https://t27.ai/assets/index-CfRJQE_c.css`:

```css
:root{--bg:#000000;--accent:#00FF88;--accent-dark:#00CC66;--text:#FFFFFF;
      --muted:#888888;--border:rgba(255,255,255,.08);--golden:#FFD700;
      --font:"Outfit",system-ui,-apple-system,sans-serif}
```

`Queen.css:2-3` binds correctly: `--q-green: var(--accent, #00ff88)` /
`--q-gold: var(--golden, #ffd700)`. But the 3D scene does not read CSS at all. It hardcodes:

| role | scene hex | site variable | drift |
| --- | --- | --- | --- |
| live/complete | `#00f5a0` (`QueenResearchCity.tsx:78`) | `--accent` `#00FF88` | G −10, **B +24** |
| available/gold | `#ffd45a` (`:80`) | `--golden` `#FFD700` | **B +90** |
| background | `#010706` (`:420`) | `--bg` `#000000` | near-black, fine |

`#ffd45a` against `#FFD700` is a 90-point blue shift — a visibly paler, creamier gold. The
scene has drifted from the identity while the CSS around it has not. Fix before adding any
zoom: read the three variables once via `getComputedStyle(document.documentElement)` at
`<Canvas>` mount and feed them into `STATE_COLORS` / `CONSTRUCTION_COLORS` /
`HARDWARE_COLORS`. This is also what makes the Protoss teal legitimate — `#64dcff` is the
*only* colour in the scene with no counterpart on the main page, and it should stay,
declared as the one new token (`--q-psi`), rather than smuggled in as five unrelated hexes.

### 0.4 The current camera cannot reach three of the four levels, and its target cannot move

`QueenResearchCity.tsx:481-490`:

```jsx
<OrbitControls makeDefault enableDamping={motionMode === "interactive"}
  enablePan={false} minDistance={10} maxDistance={34}
  minPolarAngle={0.4} maxPolarAngle={1.35} target={[0, 1.2, 0]} />
```

`minDistance={10}` is the ceiling on how close you can get. `enablePan={false}` with a
fixed `target` means **the camera can only ever orbit the origin**. There is no way to fly
to a laboratory on the outer ring. Both are the blockers for SITE and INTERIOR, and both are
one prop each plus an animated target.

### 0.5 Raising `maxDistance` will erase the outer district, because of the fog

`:421` — `<fog attach="fog" args={["#010706", 18, 42]} />`, `far: 80` on the camera.

At the current `maxDistance={34}`, a node on the far side of the interface ring (r = 14.15)
is 34 + 14.15 = **48.15** world units from the camera. Fog far is 42. That node is already
100% fog colour today — **the outermost district is invisible at the current maximum zoom-out.**
Any NETWORK level at d ≥ 34 makes this worse, uniformly. Fog far must become a function of
camera distance (§6), not a constant.

### 0.6 The `map` view is not a map, and the cabinet shell does not exist yet

`Queen.tsx:1568` — `boardView === "map"` renders `.queen27-mission-map`, a DOM grid of six
`<section>` sectors, one per kanban column, with a CSS starfield. It is the kanban with
different chrome. There is nothing spatial in it to zoom.

And the other agent's `qa/queen-game-cabinet-contract.mjs` requires `QueenCabinetView`
(five views: command/kanban/map/factory/tech), `queen27-game-cabinet`,
`queen27-cabinet-viewport`, `queen27-cabinet-hud`, `100dvh`. Grep of `Queen.tsx` for
`QueenCabinetView`, `queen27-game-cabinet`, `react-three-fiber`: **0 matches**. Grep of
`Queen.css` for `100dvh`: 0 matches. That contract is a target they have written and not yet
met. The zoom lives inside `queen27-cabinet-viewport` when it lands; until then it lives in
`.queen27-city-stage`, which is `height: 580px`, fixed.

**580 px tall and ~920 px wide** (`.queen27-page` is `min(1240px, 100% - 40px)`;
`.queen27-city-stage` is `minmax(0,1fr) minmax(260px,320px)`). Every pixel number below is
computed against that box.

---

## 1. The four levels

### 1.0 The arithmetic they are derived from

From the shipped constants: `fov: 42` → `visibleHeight(d) = 2·d·tan(21°) = 0.76773·d` world
units; the box is 580 px tall, so **px per world unit = 755.47 / d**.

Ring radii are `3.4 + layerIndex · 2.15` (`queenResearchCityModel.ts:130`). Node counts are
measured from `/Users/playra/BrowserOS/trios/.trinity/dashboard/tech-tree.json` — **40 nodes,
48 edges, 12 conflicts** — which is what `/queen/public-research` would serve if it existed:

| district (layer) | nodes | radius (wu) | arc between neighbours (wu) |
| --- | --- | --- | --- |
| seed | 6 | 3.40 | 3.560 |
| **ring** | **12** | **5.55** | **2.906  ← tightest** |
| silicon | 1 | 7.70 | — |
| runtime | 7 | 9.85 | 8.841 |
| supervisor | 11 | 12.00 | 6.854 |
| interface | 3 | 14.15 | 29.636 |

Statuses: 13 shipped, 13 blocked, 11 partial, 3 planned. Max in-degree 4, max out-degree 8.

| d (wu) | visible height (wu) | visible width (wu) | px/wu | tightest node pitch (px) |
| --- | --- | --- | --- | --- |
| 60 | 46.06 | 73.05 | 12.6 | 36.6 |
| 34 (today's max) | 26.10 | 41.40 | 22.2 | 64.6 |
| 26.63 (today's start) | 20.44 | 32.43 | 28.4 | 82.4 |
| 18 | 13.82 | 21.92 | 42.0 | 122.0 |
| 10 (today's min) | 7.68 | 12.18 | 75.5 | 219.5 |
| 6 | 4.61 | 7.31 | 125.9 | 365.9 |
| 3.2 | 2.46 | 3.90 | 236.1 | 686.1 |
| 1.8 | 1.38 | 2.19 | 419.7 | 1219.5 |

---

### L1 — NETWORK · `d ∈ [34, 60]` · "the contributed compute"

**Requires `maxDistance: 34 → 60`, `far: 80 → 140`, fog far → 90.**

**A node is a machine.** Not a card, not a research topic — a physical contributor. Today
that population is four, from `queen-mission-control.md` §3, and drawing four is the whole
point:

| hex | state | what lights it |
| --- | --- | --- |
| THE MAC | lit, gold + green apex | M1 Pro / 8 cores / arm64; capabilities `swift-build`, `make`, `screen`, `git-push` |
| THE CONTAINER | lit, gold + green apex | Railway `oven/bun:1.3.6`; capabilities `typescript`, `docs`, `git-commit` |
| FPGA | **drawn, dark, wireframe** | claimed over JTAG, nothing measured; `verilog-synthesis` / `bitstream-load` = nobody |
| GPU | **an empty foundation ring, no building** | there is no GPU anywhere in the supervisor path |

Each machine is one hexagonal warp-plate on a 40 wu grid, with a beam to its **key pylon**.
Four pylon slots (`ZAI` / `ANTHROPIC` / `OPENROUTER` / `MOONSHOT`+): live pylons hum teal,
refused pylons are cracked and dark. Measured today from `/queen/status`: *"1 carrying a bee
and 3 refused"* — so **one lit pylon, three cracked**, and that is the visual answer to "why
is nothing happening".

Between machines: one arc per dispatch route. `pulse.bees = 15`, `pulse.verdicts = 16`.

- **Legible at this level:** machine name (4 labels, max), the `n / 8` bee count on each,
  the pylon count, the round clock. Nothing else. At d = 60 you have 12.6 px per world unit —
  a 0.62-radius crystal is 15 px across.
- **Disappears:** every one of the 40 laboratories, all 48 routes, the construction stages,
  the hangar bays, the foundry devices, the grid helper. A machine's whole city collapses into
  one glowing hex whose emissive intensity is `active / capacity` and whose *height* is its
  count of completed dispatches (43 total today, all on one machine).
- **Data source:** `/queen/status` + `/queen/public-board`. **Both 200 today.** This is the
  only level that is not blocked on a missing route.
- **This level does not exist yet in any form.** The `map` boardView is a DOM sector grid
  (§0.6). Building L1 is the largest single piece of new work in this design, and it is the
  smallest piece of new *data*.

---

### L2 — REGION · `d ∈ [16, 34]` · "one machine's city"

This is the shipped `QueenResearchCity` scene, unchanged in substance. Entering it from
NETWORK is the hex opening: the plate splits along six radial seams and the six district
rings rise out of it.

**A node is a research laboratory** — one tech-tree node, its `state` giving the crystal
colour and the tower height (`STATE_HEIGHTS`: researched 1.5, researching 2.25, available 1.8,
locked 0.9), its `ConstructionStage` giving the shell (complete = solid gold; assembling =
solid + three counter-rotating teal tori; blueprint = 62%-opacity wireframe; sealed =
28%-opacity wireframe).

- **Legible:** the six **district** names (seed / rings / silicon / runtime / supervisor /
  interface) as ring labels, and per-district counts. **Not** the 40 node labels — see §5, they
  do not fit until d ≤ 5.56.
- **Disappears:** node-level text; the hangar deck; the individual pylon states (they
  aggregate into the CommandSpire's apex crystal).
- **Survives from L1:** the machine's own name, pinned to the CommandSpire.
- **New at this level:** the 48 dependency routes, coloured `energized` / `assembling` /
  `dormant` by `buildConstructionPlan`, and the **12 conflicts** drawn as a red seam between
  the two nodes that disagree. Conflicts are counted in `tech-tree.json` and currently shown
  nowhere in 3D; a "the disagreement is the interesting part" graph that hides its
  disagreements is the exact defect the tree's own header comment was written against.
- **Data source:** `/queen/public-research` — **404**. Level dark today.

---

### L3 — SITE · `d ∈ [6, 16]` · "one district"

Requires `minDistance: 10 → 1.8` and an animatable `target` (§0.4).

The camera's target leaves the origin and settles on the chosen district's ring centre. At
d = 16 the visible width is 21.9 wu; the ring district (r = 5.55, 12 nodes, 2.906 wu apart)
puts **7 of its 12** in frame. At d = 6 it is 7.31 wu wide → **2 to 3 in frame**.

**A node is a building on a street.** You see its foundation octagon
(`cylinderGeometry [0.7, 0.92, 0.24, 8]`), its six-sided tapering tower, its floating
octahedral crystal, and the ground torus that marks selection.

- **Legible:** the node **label, truncated to 18 characters + ellipsis** — measured 101.0 px
  median / 116.7 px max at 11 px Outfit, against a 122–366 px node pitch across this band.
  This fits. Also: `dependenciesReady / dependenciesTotal`, the construction stage word, and
  the maturity (`shipped` / `partial` / `blocked` / `planned`).
- **Disappears:** the other five districts fade to unlit silhouettes at 20% opacity (they are
  still there — that is what tells you where you are); the CommandSpire's worker cubes; the
  foundry.
- **Survives:** the district name, now a ground-plane inscription rather than a floating label.
- **Data source:** `/queen/public-research` — 404.

---

### L4 — INTERIOR · `d ∈ [1.8, 6]` · "inside one compute node"

At d = 3.2 the frame is 3.90 × 2.46 wu. One laboratory's foundation is 1.84 wu across. So a
single building fills roughly half the frame, and its interior is the subject.

**What the interior of a compute node looks like, as a Protoss structure.** The vocabulary is
already half-written in the file — `metalness: 0.9–0.95`, `roughness: 0.14–0.28`, gold
`#6f5725` / `#9a792d` / `#a98735`, teal `#64dcff` emissive, `octahedronGeometry`,
`torusGeometry`, six- and eight-sided cylinders, and no mechanical parts anywhere. That is
Protoss grammar. What is missing is the inside. Every element below is bound to a field that
exists or is named as absent:

| element | geometry | bound to |
| --- | --- | --- |
| **The nave** | hexagonal gold hall, six faces, floor a bronze inlay disc; the building's outer shell dissolves to 12% wireframe on entry rather than opening — a Protoss structure is not hinged | the six tech-tree layers, one per face; the face for this node's own layer glows |
| **The core crystal** | one large floating octahedron on the axis, slowly rotating, held in a triad of teal beams | `workers.utilization`. **Today: 0%.** The crystal is dark and still. It should be, and a design that animates it anyway is a lying instrument |
| **Warp conduits** | gold ribs entering through the wall, one per incoming edge (max in-degree 4) and leaving per outgoing edge (max out-degree 8) | `buildConstructionPlan().routes` — energized (teal, flowing), assembling (teal, pulsing at the 12 fps `ConstructionClock`), dormant (unlit `#263a32`) |
| **Hangar alcoves** | **eight** recesses around the wall, at the same 45° spacing as `CommandSpire`'s worker cubes | `QUEEN_WORKER_POLICY_LIMIT = 8`. `capacity` are powered; `8 - capacity` are visibly sealed with a bronze lattice. **Today the deck is `lockedDeck()` — all eight sealed** |
| **The bee in the alcove** | a small four-winged crystalline drone, folded when idle, unfolded and teal-lit when busy | `slots[i].state`. **Today: 0 running.** No unfolded bee is honest |
| **The pylon socket** | a floor-level column of four sockets, one per provider key; a live key is a standing teal crystal, a refused key is a cracked stub | `/queen/status` `dispatches.latest.outcome`, measured today: 1 live, 3 refused. This is why the alcoves are dark, and putting the two things in one room is the entire point |
| **The stasis cells** | wall niches holding a suspended card, gold-lit | `column === "review"`. **Measured today: 13.** A cell past `REVIEW_BOUNDARY_HOLD_HOURS = 48` cracks — the panic mechanic from §4.1, made architectural |
| **The seal plinth** | a raised hexagonal plinth in the floor, with an **empty socket** | `tree_sha`. `queen-mission-control.md` §5: no commit identity is recorded, `grep -rn "commit_sha\|commitSha"` returns nothing. **The socket is empty and stays empty until step 1 of §5 ships.** An empty socket in the middle of the floor is the most honest drawing of "there is no proof of compute" that this architecture can produce, and it is the thing that makes the game's title true when it is filled |
| **The evolution frieze** | a band of engraved glyphs around the nave's upper wall, one glyph per completed dispatch, the newest brightest | `dispatches.finished = 43`. This is where "bees that evolve" lives: a bee is one model turn, so a bee does not evolve — **the hive does**, and the frieze is the record of it. Per-bee evolution needs `send_backs` on a public route; that column exists in `queen_dispatch` and is exposed nowhere. Say so on the wall rather than inventing a level-up |

- **Legible:** the **full node label** — measured 276.6 px median / 387.1 px max at 11 px,
  against a 686–1220 px node pitch at this distance. Also the full evidence string, the
  criteria count, the dependency ratio, and the issue number.
- **Disappears:** the entire rest of the city. Everything outside this building is culled by
  the near-field fog, which at this level is `[4, 12]` (§6).
- **Data source:** `/queen/public-research` + `/queen/public-hardware` — both 404. Level dark.

---

## 2. The transition

**Continuous camera. Discrete content, with hysteresis and a one-way fade-in.**

The camera dolly is already continuous (OrbitControls dollies multiplicatively, 0.95 per
wheel notch) and must stay so. The **content set** switches at a threshold.

### Why, on readability rather than taste

A label is readable or it is not; there is no useful intermediate. The measured floor for
Outfit at DPR 2 is about 9 px, below which the hinting collapses. If label size scaled
continuously with `d`, there would be a band of camera distances in which every label sits
between 6 and 9 px — a band in which the operator can see that there is text and cannot read
it, which is worse than no text, because it invites squinting instead of zooming.

The same argument applies to geometry. A blueprint-stage laboratory is a 62%-opacity
wireframe; at a continuous transition there is a range where it is 31% and reads as neither
"planned" nor "absent".

And a **cross-fade is the wrong instrument specifically because it is symmetric**. During a
300 ms cross-fade both label sets are at partial opacity, so for 300 ms the operator can read
neither. Fade the **entering** set in over ~180 ms; cut the **leaving** set instantly. You are
never worse off than at the level you just left.

### Hysteresis, so a trackpad cannot flip the world

| boundary | descend when | ascend when | gap |
| --- | --- | --- | --- |
| NETWORK ↔ REGION | d < 34.0 | d > 38.1 | 12% |
| REGION ↔ SITE | d < 16.0 | d > 17.9 | 12% |
| SITE ↔ INTERIOR | d < 6.0 | d > 6.7 | 12% |

12% is one and a half wheel notches at 0.95 per notch (0.95⁻²·⁴ ≈ 1.12), so a single stray
notch at a boundary cannot oscillate the scene, and a deliberate two-notch move always
crosses.

### Frame cost of each option

I counted draw calls from the source rather than guessing, because in three.js at this scene
size the cost is JS-side draw submission, not fill or vertices. At the 40 measured nodes
(13 complete, 11 assembling, 3 blueprint, 13 sealed):

```
InstancedLaboratoryFoundations   1     (one instanced mesh, all 40)
ResearchLaboratory bodies       40×3 = 120   (tower + crystal + ground torus)
  assembling extra tori         11×3 =  33
drei <Line> routes                48    (Line2 + its own LineMaterial each)
layer rings                        6
CommandSpire                       5    (+1 per worker slot; 0 today)
gridHelper                         1
                              -------
REGION total                     214    (258 with a 4-device foundry)
```

| option | steady-state cost | peak cost | verdict |
| --- | --- | --- | --- |
| **A. Continuous scale, one set always drawn** | 214–258 calls at *every* level, including INTERIOR | same | Rejected. Never drops, and it is the option with the unreadable band |
| **B. Discrete snap, hard cut both ways** | entering set only (L1 ≈ 25, L3 ≈ 40, L4 ≈ 55) | 214 + 40 for one frame if you build before you tear down | Cheapest. Rejected only on the jarring cut, not on cost |
| **C. Discrete + fade-in of the entering set (recommended)** | same as B | union for ~22 frames at 120 Hz (180 ms): REGION→SITE peak ≈ 254 calls | Recommended |
| **D. Cross-fade both sets** | same as B | union held for the whole fade, **and** every material in both sets must be `transparent: true`, which puts them in three.js's transparent list: per-frame depth sort of ~250 objects and no early-Z | Rejected on both counts |

The fade must set `transparent: false` when it completes. Leaving 120 laboratory meshes
permanently transparent costs a sort every frame forever, for an effect that lasted 180 ms.

### The demand loop is what makes all of this nearly free at rest

`frameloop="demand"` (`QueenResearchCity.tsx:674`) means the scene costs **zero** when nothing
changes. The zoom is one of only three things that turn the renderer on — the others are
`OrbitControls` damping and `ConstructionClock`, which forces `invalidate()` at 12 fps
whenever `summary.assembling > 0` and motion is interactive.

Two consequences to write down:

1. `enableDamping` uses OrbitControls' default `dampingFactor = 0.05`, which at 120 Hz takes
   about 1.4 s to settle — 168 rendered frames after the operator stops moving. Set
   `dampingFactor = 0.12` (≈ 0.35 s, ≈ 42 frames). The scene stops sooner and looks no less
   smooth.
2. At INTERIOR the `ConstructionClock` should stop. There is one building on screen; a 12 fps
   global invalidate to animate assembly tori that are not in frame is pure cost.

---

## 3. What survives every level

`viewport-layout.md` §8 names four — BEES, KEYS, ROUND, DECISION — in a 40 px `#statusbar`
outside every pane. Those four are correct and I am not restating them. The zoom creates four
*new* ways to lose the operator, so it owes four more slots. All eight sit in the same strip
and are identical at all four levels.

| # | slot | value | source | today's reading |
| --- | --- | --- | --- | --- |
| 5 | **LEVEL** | level name + what fraction of the world is in frame | client-side | `SITE · ring · 7 of 40` |
| 6 | **OFF-SCREEN** | count of nodes with panic ≥ 4 outside the frustum, with a direction chevron per cluster | board `created_at` + `review` age | the reason to zoom in is usually the reason you must not lose the rest; XCOM keeps its panic list visible over the globe for exactly this |
| 7 | **CAP** | daily spend against the cap, as a bar | `/queen/status` `lastTick.refusal` | **`$11.00 / $10.00 — refusing`.** DECISION already carries the sentence, but the sentence changes wording; a bar does not. Today the scheduler is `enabled: true` and ticking every 300 s and doing nothing, and this is the only slot that says why |
| 8 | **PROOF** | dispatches carrying a `tree_sha`, over total | not exposed; the column does not exist | **`0 / 43`.** The game is called Proof of Compute. If the score is zero it is on screen at every zoom level, or the map is a claim the system cannot back |

A ninth, which is per-level rather than global and belongs in the pane header, not the strip:

| **SOURCE** | which endpoint fed *this* level, and its age | measured | `L2 · /queen/public-research · 404 · no data` |

Three of five endpoints are 404. A level whose data source is missing must say so **in that
level**, in that level's own language, and must not render an empty city that looks like a
city with nothing in it. `buildResearchCityModel` already fails closed correctly
(`unavailableModel()`); what is missing is that the failure is invisible at the map, showing
only as a small offline strapline.

---

## 4. Selection and focus

### Entering

| at level | single click | double click / Enter | what the camera does |
| --- | --- | --- | --- |
| NETWORK | select machine → right rail shows its capability set and pylon states | descend to REGION for that machine | target lerps to the machine's plate; d animates 45 → 24 over 420 ms, ease-out cubic |
| REGION | select laboratory → rail shows label, layer, state, maturity, **evidence string** (this is what `selectedNode.evidence` already does at `:713`) | descend to SITE centred on that node's **district** | target lerps to the district ring centre, **not** the node — a district is the readable unit at SITE; d → 11 |
| SITE | select laboratory | descend to INTERIOR for that node | target lerps to the node position (this is the step that needs the animatable target from §0.4); d → 3.2, polar → 1.30 (near ground) |
| INTERIOR | select a hangar alcove / pylon socket / stasis cell / frieze glyph → rail shows the dispatch, the key, the card, the commit | — | camera does not move; INTERIOR is the floor |

Single click never moves the camera. Double click always does. This matters because the rail
list at `:717-733` is the accessible path to the same selection, and a keyboard user pressing
Down through 40 laboratories must not be flown around the world 40 times.
`onFocus`/`onMouseEnter` selection as used in `QueenFactory.tsx:282-283` must **not** be
extended to the camera for the same reason.

### Getting back out

| control | effect |
| --- | --- |
| `Escape` / `Backspace` | one level out, restoring the exact `(target, distance, polar, azimuth)` you left from — a LIFO stack, max depth 4 |
| double click on empty space | one level out (mirror of double-click-to-enter) |
| `H` or `0` | **home**: NETWORK, target `[0, 1.2, 0]`, d = 45, polar 0.9. Unconditional, from any state, ignoring the stack |
| browser Back | one level out |

The hash carries the level, so a level is linkable and reload-safe:
`#/queen/network`, `#/queen/region/container`, `#/queen/site/ring`,
`#/queen/interior/<node-id>`. This is the rule `viewport-layout.md` §4 already sets for tabs
("the shell mounts the same render functions and syncs the hash"), applied one level deeper.

Two things that must not happen: a level change must not remount the `<Canvas>` (that
reallocates the WebGL context and costs the 51–91 ms three.js construct time
`engine-benchmark.md` §12 measured); and a level change must not reset the rail's `scrollTop`
(§9 of `viewport-layout.md` — the board's 30 s redraw already does this and it is a named
defect).

---

## 5. The label problem

### Measured, not estimated

I loaded the real 40 tech-tree labels into a canvas at DPR 2 in Chrome 148 on this machine
today, with Outfit loaded via `document.fonts.load`, and called `measureText` on each. Label
lengths: median 58.5 characters, max 78 (*"Raise the bee ceiling: cap 4 -> 19, after key
rotation and process-group kills"*).

| font px | full: median | full: p95 | full: max | 18-char + ellipsis: median / max | 6-char id: median / max |
| --- | --- | --- | --- | --- | --- |
| 9 | 226.3 | 295.5 | 316.7 | 82.6 / 95.5 | 32.7 / 38.4 |
| 10 | 251.4 | 328.3 | 351.9 | 91.8 / 106.1 | 36.3 / 42.6 |
| **11** | **276.6** | **361.2** | **387.1** | **101.0 / 116.7** | **40.0 / 46.9** |
| 12 | 301.7 | 394.0 | 422.3 | 110.2 / 127.3 | 43.6 / 51.2 |
| 13 | 326.9 | 426.8 | 457.4 | 119.4 / 137.9 | 47.2 / 55.4 |
| 15 | 377.2 | 492.5 | 527.8 | 137.7 / 159.1 | 54.5 / 64.0 |
| 18 | 452.6 | 591.0 | 633.4 | 165.3 / 190.9 | 65.4 / 76.8 |

### The collision numbers

Add an 8 px gutter and compare against the tightest node pitch — the 12-node ring district at
2.906 wu, whose on-screen pitch is `2195.4 / d` px.

| label form | pitch needed (worst case, 11 px) | fits at camera distance | fits across the 920 px box |
| --- | --- | --- | --- |
| full label | 395.1 px | **d ≤ 5.56** — below today's `minDistance: 10`, i.e. **unreachable today** | **2** side by side (3 at the median) |
| 18-char truncation | 124.7 px | d ≤ 17.6 | **7** |
| 6-char id / glyph | 54.9 px | d ≤ 40.0 — the whole current range | **16** |

Three decisive readings:

1. **Full labels are physically unreachable in the shipped build.** They need d ≤ 5.56 and the
   camera stops at 10. This is not a labelling policy problem; it is the `minDistance` from §0.4.
2. **At most three full labels fit across the box at once**, and in the worst case two.
   That is not a threshold to tune. It is the geometry of a 58-character median label in a
   920 px canvas.
3. Sixteen 6-character codes fit across, so a code-only scheme survives the entire zoom range.

### The de-collision rule

Labels are not spread evenly across the width — they land where nodes project, on rings, which
cluster. So a global count is the wrong test. The rule is a **per-band greedy sweep**:

1. Project every in-frustum node to screen space. Cull anything outside the box plus a 40 px
   margin.
2. Bucket by `y` into bands of `1.45 × fontSize` (16 px at 11 px type) — the line box height.
3. Within each band, sort by `x` and place greedily left to right: place a label if its left
   edge clears the previous label's right edge plus an 8 px gutter, otherwise **demote** it.
4. Demotion ladder, one step per failure: full → 18-char truncation → 6-char id → dot only.
5. The focused node and its direct dependency neighbours (max in-degree 4, max out-degree 8 —
   so at most 13 nodes) are **exempt from demotion** and are placed first, in step 3's ordering.
   Everything else yields to them.
6. Ties broken by panic descending, then by `state` (`researching` > `available` > `researched`
   > `locked`), then by node id, so the sweep is deterministic and does not shimmer frame to
   frame while the camera moves.

### The number at which you stop labelling everything

**Sixteen.** Above 16 nodes in the frustum, stop labelling all and label only the focused node
plus its direct neighbours (≤ 13, and typically 2–3, since the median in-degree is 1).

The number is not a preference: 16 is `floor(920 / 54.9)` — the count at which even the
shortest usable form, a 6-character id at 11 px with an 8 px gutter, stops fitting across the
box in a single band. Below 16 the sweep resolves. Above it, the sweep would demote more than
half the labels to dots, which is the same as not labelling them while still paying to lay
them out.

Mapped onto the levels, with in-frustum counts computed from the ring geometry above:

| level | nodes in frustum | label policy |
| --- | --- | --- |
| NETWORK | 4 machines + 4 pylons | full labels for all 8 |
| REGION | ~25–40 laboratories | **over 16** → district names only; node labels only for the focused node + neighbours |
| SITE | 4–8 | 18-char truncation for all |
| INTERIOR | 1–2 | full label, full evidence string, full criteria |

### Where labels live

`.queen27-city-canvas` is `aria-hidden="true"` today (`:672`). **The 3D canvas currently
carries no text at all** — every label is in the DOM rail. Three.js has no text, which
`engine-benchmark.md` §6 names as a reason not to bring a 3D engine. Since one is here
anyway, labels must be a DOM overlay positioned from projected coordinates: `transform:
translate3d(...)` on absolutely positioned spans in a `pointer-events: none` layer over the
canvas, so text stays real text — selectable, translatable, in Outfit, hinted at DPR 2, and
reachable by a screen reader. Not sprites, not an SDF atlas, both of which blur under rotation
at DPR 2.

---

## 6. Camera limits

```jsx
<OrbitControls
  makeDefault
  enableDamping={motionMode === "interactive"}
  dampingFactor={0.12}          // was default 0.05: 1.4s of invalidated frames at 120Hz
  enablePan={false}             // unchanged: panning is how you get lost
  minDistance={1.8}             // was 10 - INTERIOR is unreachable without this
  maxDistance={60}              // was 34 - NETWORK is unreachable without this
  minPolarAngle={level === "interior" ? 0.25 : 0.4}
  maxPolarAngle={level === "interior" ? 1.45 : 1.35}   // never >= PI/2: the floor has no underside
  target={animatedTarget}       // was the constant [0,1.2,0]
/>
```

Plus, on the camera and scene:

- `far: 80 → 140`. At d = 60 with a 28 wu world radius, the far plane must clear 90.
- **Fog by level, or the outer district vanishes** (§0.5). The constant `[18, 42]` already
  erases the interface ring at today's `maxDistance` of 34. Make it
  `[d × 0.65, d × 1.9]`: NETWORK `[39, 114]`, REGION `[16, 47]`, SITE `[7, 21]`,
  INTERIOR `[2.1, 6.1]`. Fog then always does its job — depth cueing — and never eats content.
- **Target clamp**: `|target.xz| ≤ 16.5`. The outermost content is the foundry at radius 16.1;
  beyond it there is nothing, and an unclamped target is the standard way to end up staring at
  empty grid. Clamp before the lerp, not after.
- **Distance clamp is the level clamp.** Because the levels are defined on `d`, the OrbitControls
  min/max *is* the world boundary; there is no separate bounds check to keep in sync.

### Inertia

Damping stays on for pointer feel, at 0.12. It goes **off entirely** under
`prefers-reduced-motion`, which the file already reads correctly
(`useReducedMotion` → `motionModeFromPreference`, contract-enforced at
`queen-research-city-contract.mjs:48-49`). Under reduced motion the level transitions also
become instant cuts with no fade — the fade is the only motion in the transition, so removing
it removes all of it, and the level system still works.

### The wheel is not enough, measured

OrbitControls dollies by 0.95 per notch. Going from d = 60 to d = 1.8 is
`ln(60/1.8) / ln(1/0.95) = 68 notches`. A trackpad pinch covers that; a mouse wheel does not,
and a 68-notch scroll is how a player decides the map is stuck. So:

- **Four level buttons** (`1` `2` `3` `4`) that animate `d` directly to the level's centre —
  45 / 24 / 11 / 3.2 — over 420 ms. This is the primary navigation; the wheel is the fine
  adjustment inside a level.
- `H` / `0` for home, per §4.
- Double-click to descend, `Escape` to ascend, per §4.

### The thing that stops you getting lost

Not a minimap. The **rail already is one**: `QueenResearchCity.tsx:717-733` renders all 40
laboratories as an `<ol>` of `aria-pressed` buttons. Mark the in-frustum ones and scroll the
focused one into view. That costs no new geometry, no second render target, and it keeps the
keyboard path and the pointer path looking at the same list — which is also why it satisfies
the "every tab renders at 400 pt wide" rule from `queen-mission-control.md` §11, where a
minimap would not fit at all.

---

## 7. What this costs to draw

### The honest note first

**I tried to measure frame time today and the measurement failed.** I built a harness, served
it from `/tmp`, and ran it in the browser pane. Every `requestAnimationFrame` interval came
back between **1,283 ms and 2,509 ms** — the tab was throttled to roughly 0.5 Hz, across two
runs, including one after explicitly fronting the tab. That is precisely the confound
`engine-benchmark.md` §1 names ("my first measurement run was ruined by exactly that and was
discarded"), and I discard mine for the same reason. **No frame-time number below is mine.**
The `measureText` numbers in §5 are synchronous and unaffected, and they are the ones I quote.

So this section is a **draw-call count from the source** plus the benchmark's numbers, and it
names the measurement that has to be run in a foregrounded tab before any of it is trusted.

### Budget

`engine-benchmark.md` §1: the display is 120 Hz, so the frame budget is **8.33 ms**, and the
idle rAF interval measured 8.3 ms median. Three.js in retained mode costs roughly 5–15 µs of
JS per draw call on this class of machine; the benchmark's three.js row at n = 150 was 0.3–0.4
ms CPU p50, and 0.6 ms at 62,352 line segments — but that scene was **two** draw calls
(one `LineSegments`, one `Points`). The city is not that shape.

| level | draw calls (counted from source) | share of 8.33 ms at 10 µs/call | notes |
| --- | --- | --- | --- |
| **NETWORK** | ~25 | 0.25 ms · **3%** | 4 machines × ~3 meshes, 4 pylons × 2, plate, grid |
| **REGION** | **214** (258 with a 4-device foundry) | 2.14–2.58 ms · **26–31%** | 120 lab meshes + 33 assembly tori + **48 drei `<Line>`** + 6 rings + spire + grid |
| **SITE** | ~40 | 0.40 ms · **5%** | three.js frustum-culls the out-of-frame labs by default; only the instanced foundation mesh has `frustumCulled` set explicitly, and it is one call regardless |
| **INTERIOR** | ~55 target | 0.55 ms · **7%** | one building, merged shell + 8 alcoves + 4 pylon sockets + crystal + conduits |
| **transition peak** (REGION→SITE, 180 ms) | 254 | 2.54 ms · **30%** | union of both sets, one-way fade |

**REGION is the only level at risk**, and the risk is concentrated in two places, neither of
which is vertex count:

1. **48 `drei <Line>` instances.** Each `<Line>` is a `Line2` with its own `LineMaterial`
   instance — 48 materials, 48 shader binds, 48 uniform uploads per frame, and `Line2` expands
   each segment into instanced quads. This is 22% of the REGION draw calls for content that is
   48 straight segments. **Replace with one `LineSegments2`/`LineSegments` carrying all 48 in a
   single buffer, colour per vertex.** 48 calls → 1.
2. **120 separate `meshStandardMaterial` instances**, one per lab mesh, PBR-lit by three lights.
   Batch by state: there are exactly 4 `ResearchState` values and 4 `ConstructionStage` values,
   so 16 shared materials cover every laboratory, and the towers/crystals/tori become three
   `InstancedMesh` groups with per-instance colour — the shape
   `InstancedLaboratoryFoundations` already uses for the foundations.

Applying both: REGION falls from 214 to roughly **20 draw calls**, which puts it in the same
band as the other three levels and removes the whole risk. That is one refactor of one file,
and it is the single highest-value performance change in this design.

### Where the canvas2D verdict is at risk

`engine-benchmark.md`'s canvas2D recommendation survives at exactly one level and dies at two:

| level | canvas2D verdict |
| --- | --- |
| **NETWORK** | **Holds, and holds easily.** 4 machines and 4 pylons on a plane is far inside the "comfortable at 1,200 nodes" envelope, and this is the one level that could ship today from the two live endpoints with 2,506 brotli bytes and no bundler. If NETWORK is built before the SPA merge lands, build it in canvas2D |
| **REGION** | **At risk.** Not on node count — 40 is nothing — but on §11 condition 2: *"A real 3D globe… correct occlusion… canvas2D would need a painter's-algorithm depth sort that I did not write and did not measure."* Forty lit, beveled, six-sided towers of four different heights on six concentric rings, seen from a 42° orbiting perspective camera, is exactly that unmeasured depth sort. **This is where the verdict becomes unsafe** |
| **SITE** | **Broken.** Occlusion between adjacent towers is now the main visual cue for depth |
| **INTERIOR** | **Dead.** A room seen from inside is nothing but occlusion. There is no painter's algorithm for a concave interior |

Which is consistent, not contradictory: the benchmark measured a wireframe globe of dots and
lines and correctly recommended canvas2D for it. This design is not that scene from REGION
inward, and the benchmark said so in advance.

### The measurement to run before building

In a **foregrounded** tab, per `engine-benchmark.md` §13 step 3: instrument `useFrame` in the
existing `ResearchCityScene`, force `frameloop="always"`, and record `renderer.info.render.calls`
alongside frame delta for 3 s at each of d = 45 / 24 / 11 / 3.2 and across one full
REGION↔SITE transition, three repeats, first second discarded. Two numbers decide everything:
the draw-call count at REGION (my count says 214; the renderer's own counter is the truth), and
the p95 frame delta during the 180 ms fade. If the fade's p95 exceeds 9.5 ms, drop the fade to
a hard cut — option B was never rejected on cost.

---

## 8. Order of work

1. **Read the palette from CSS** into the three colour maps (§0.3). One function, no new data.
   This is the user's binding direction 1 and the scene currently violates it.
2. **Batch REGION to ~20 draw calls** (§7): one `LineSegments2` for the 48 routes, 16 shared
   materials, three `InstancedMesh` groups. Do this before adding levels, not after.
3. **Free the camera**: `minDistance` 1.8, `maxDistance` 60, `far` 140, distance-derived fog,
   animatable clamped target. Five props and one lerp. Nothing is visible yet.
4. **Level state machine + hysteresis + the 4/H/Escape controls + hash sync** (§2, §4, §6).
5. **The DOM label overlay and the greedy band sweep** (§5). SITE and INTERIOR become readable.
6. **Statusbar slots 5–8** (§3). LEVEL, OFF-SCREEN, CAP, PROOF.
7. **Build NETWORK** (§L1) — the largest new surface, and the only one whose data exists today.
8. **INTERIOR geometry** (§L4) — and the empty seal socket stays empty until
   `queen-mission-control.md` §5 step 1 (`commit_sha`, `tree_sha`) ships.

Steps 1–6 are changes to a file that already renders. Step 7 is new. Step 8 is the one that
makes the page's title true, and it is gated on a database migration, not on any of this.

**And one thing that is not in this list because it is not mine to do:** write
`/queen/public-research`. Levels 2, 3 and 4 render nothing until it exists, however good the
zoom is.
