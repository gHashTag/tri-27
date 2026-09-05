# The Queen game — where it stands, 2026-09-03

Read this first. Everything else under `docs/game/` is evidence for what is
stated here. Nothing below is recalled; each line names the measurement or the
commit behind it.

## What the user asked for, in order

1. t27.ai/#/queen as a Mission-Control GAME in the shape of XCOM (2012), with
   every log surface in tabs that fit the screen height.
2. Instead of Earth, the map is the network of contributed compute - CPU, FPGA,
   GPU - and the lands and their colours are the community's resources. A proof
   of compute game. Actors: the Queen (supervisor) and her bees (workers).
3. Colours and style like the main page.
4. Zoomed in, it reads like Protoss - but with technological bees that evolve.
5. A 3D map you can rotate.
6. The logo: its 27 cells can each be a node, floating in the air.
7. The favicon rectangle is the minimal map cell; the whole map is logos joined
   together - a Flower of Life made only of the mark. Vertices connected.
8. The reference image: silver line-work on black, colour only in the vertices,
   dense, pressed together, monolithic like a honeycomb - triangles ARE the
   comb, not sitting in one.
9. Then: real ground and characters, agents mining TRI, "maybe Unity?", study
   the best engines for maximum platform reach. Then: "characters are stupid,
   do it in Unity." Then: "slots, merge the PR, draw the characters" - done.

## DIRECTED (2026-09-05 08:05-08:40Z, the user, two messages + plan answers): the honeycomb foundation and the castle of rings

"Не город, а соты с мёдом; у каждой задаче своя сота." Then: "Kenney
Hexagon Kit — это фундамент; жёлтый гекс появляется после решения GitHub
issue; так пчела поднимается на первую ступень иерархии; у каждой пчелы свои
скилы и опыт; застройка от центра по кругу — первый слой; второй слой —
кольца (модуль RING решает свою уникальную задачу и не дублирует другие;
аудит колец; в каждом кольце башня замка; башня строится эпиком; эпики —
башни замка); включая и выключая слои 3D-карты, видим, как пчёлы создают
фундамент для города над; спроецировать механику на все функции GitHub."

Decided in plan mode (his answers): resolved = closed on GitHub; epic = the
`epic` label, until then a title starting with EPIC; rings = the directories
trios/rings/* (21); honey stays (a hex is a cell, honey is the yellow); epic
→ ring by labels `ring:<NAME>` (he creates them), until then the ring named
in the title, else unassigned at the keep; the rings audit (D1–D11, evidence
in the tree) becomes the first epics with children the Queen can dispatch.

The plan (approved 2026-09-05 ~08:45Z, `~/skills/queen-game-loop/_state/plan-honeycomb.md`):
a pointy-top hex spiral from the hub (ring n holds 6n cells; 1009 closed
issues = 18 rings, 1027 cells), one honey hex per closed issue in closed_at
order from a dated snapshot `public/queen/foundation.json` the loop makes
with gh (the wire carries no closed_at/labels/epics; the server reads only
number/title/body); modules keep the ledger on the same grid from cell 1
(CODE layer); the castle on spiral ring 7 (21 plinths + 21 walls, towers by
epic stage: plinth / walls / tower / wizard tower, height by closed
children); three toggleable layers FOUNDATION / CASTLE / CODE (bees always);
picks by (kind, number); bees' ranks honest under the server's anonymity.
Slices A, B, C1, C2, D, E, F, K0–K5, L1, L2, S1 in the loop backlog (H-*/K-*).
The city of Space Kit buildings is the CODE layer, not the field.

DIRECTED (2026-09-04 13:20-13:55Z, the user, four messages): modules in rings, unique from their code

"Our modules are in rings from the centre by the Flower of Life architecture;
make a more real game world: light, materials, best practices; study the
engine." "Find a way for every module to be unique and its visual generated
from the code it is written in, so the images match; how?" "Study mesh
shaders, maybe that is what suits us." "The bees (agents) ARE the GitHub
issues; the modules in the rings are the modules for visualisation."

The design, recorded as tasks M-1..M-4 in the loop backlog:

- The unit of place is a code MODULE of the repository, not a board card.
  Modules lie on hexagonal rings around the Queen's hub, placed by a stable
  ledger keyed by module path (the same rule as P1-20). Bees are the issues:
  they walk between the modules their activity events touch (the feed's
  paths already name them).
- A module's visual is a pure function of its code: signature = {path,
  language, files, lines, functions, imports, exports, last touched, open
  issues}; seed = hash(path); a shape grammar turns the signature into a
  building (footprint from lines, height from functions, wings from exports,
  antennae from imports, colour from language, damage from open issues),
  assembled from Kenney parts or generated geometry; a contract proves the
  same signature yields the same mesh. This is the "code city" idea
  (Wettel and Lanza's CodeCity; Software Cities) applied to a live repo.
- The signature must come from the code: a server endpoint
  /queen/public-modules (M-1, needs `railway up`); until then the client
  derives modules and counts from the activity feed's paths.
- Mesh shaders are not in WebGPU or any browser in 2026; uniqueness goes
  through thin instances with per-instance custom attributes read by a
  NodeMaterial/ShaderMaterial (M-4), which the field already uses for
  placement.

The Kenney Space Kit (CC0) is on the field since #912; the pack was the
user's "download it yourself, open source".

## DIRECTED (2026-09-04 11:10Z, the user, with the StarCraft screenshot): "I want a field like THIS"

After the Babylon comb reached parity with the canvas diagram (islands,
line-work, glints) the user said "where is the game in this view?" and
"hear me, I want a field like THIS". The field is now a GAME FIELD: one
continuous steel-tile platform (the mark engraved faintly per tile keeps
"the tile is our drawing"), a sun with shadows, low-poly buildings with
volume per card column (procedural until an asset pack is named), the
Queen's hub, bees as ground units with selection rings, a fixed RTS camera.
The floating-island diagram is gone from the Babylon comb; `?engine=canvas`
still shows it for one release. Do not port line-work back.

## DECIDED (2026-09-04 09:52Z, the user, one word: "Babylon"): the engine is Babylon.js

Asked after the measured spike (below), the user chose Babylon. Consequences:
the field stays generated from the wire (no cloud editor); the default comb
stays canvas2D until the Babylon comb reaches visual parity AND passes the
pick, placement and touch contracts on `?engine=babylon` (`check:queen-babylon`),
then the default flips and three.js is replaced by Babylon in the research
city and factory (one engine chunk). Open, assumed until he says otherwise:
sprites on a 3D ground (StarCraft's own way) rather than 3D models; a mesh
pipeline (fal.ai Tripo/Hunyuan3D) is a later epic. The migration is tracked
as tasks B-1.. in the loop backlog.

## The question as it was opened (2026-09-04 09:24Z): an engine for a 3D map?

The user woke during loop cycle 010 and asked, with a StarCraft Terran-base
screenshot, for "a browser engine where everything is thought out and making
the game is simple, with a 3D map". He also pasted a third-party research
answer recommending PlayCanvas. The standing decision above (no engine,
canvas2D, measured) is NOT overturned by this; it is re-opened by the user,
and the answer given in chat was:

- The reference itself is 2D isometric sprites on a tiled ground; the comb
  already does that projection in canvas2D. What an engine buys is real 3D
  models with light and shadow, unit pathfinding, camera and picking systems,
  a GUI layer.
- Best fit for THIS repo (React + Vite + TypeScript, GitHub Pages with no
  custom headers, headless-Chrome contracts, a field generated from the wire,
  not hand-placed): **Babylon.js 9** - Apache-2, npm/ESM, WebGL2 + WebGPU,
  glTF/PBR/shadows, sprite billboards for the 24 PNG sprites, Havok (wasm)
  physics, Recast navmesh + crowd agents (RTS unit movement out of the box),
  inspector, Playground. Our own benchmark: 120 fps, 0.7-0.9 ms CPU, 0-1 long
  frames, 263,385 B brotli with selective imports.
- **PlayCanvas 2.x** only if the user wants a visual level editor in the
  browser: the engine is MIT and npm-installable, but the editor is a cloud
  service (free = public projects only; Personal $15/mo for private;
  Organization $50/seat), and it has no built-in pathfinding. Our benchmark
  measured a frame stutter in its retained mode (p99 17-22 ms, 3-10 long
  frames per 3 s) that no other candidate showed.
- **Godot 4.7 web**: WebGL2 only, 33 MB wasm stock (5.4 MB with custom
  templates), single-threaded on GitHub Pages (threads need COOP/COEP headers
  Pages cannot send); an opaque canvas that cannot host the HUD's React
  contracts. **Unity 6 web**: 2.0 MB brotli empty, proprietary. Both out.
- **three.js** is already in the bundle (919 KB raw chunk for the research
  city) but is a renderer, not an engine; Babylon would REPLACE it, not add
  to it. **Phaser** is 2D only.

MEASURED (loop cycle 011, draft PR trinity #907 = `a5b59b581`, not merged):
the same 189-island field in Babylon.js 9.25 behind `?engine=babylon`, on an
M1 Pro in headless Chrome with ANGLE/Metal at 60 Hz vsync, 4 s of rAF: both
engines at vsync at 1440x900 and 390x844 in the second run (p50 16.7, p99
<= 33.4, 0-5 missed of 240; canvas2D's first cold run at 1440x900 stalled to
half rate once). Chunks brotli: babylon 218,532 B, three.js shipped today
204,197 B, so Babylon costs +14 KB if it replaces three.js and +218 KB if
added. The engine buys systems, not frames. `tri game-spike` reruns it.

The step that was proposed before measuring, kept for the record: one loop cycle builds a Babylon spike of the same 189-island field
(orthographic isometric camera, the mark as a mesh with the engraved texture,
structures and bees as billboards, picking) and measures brotli delta, frame
p95/p99 at the five gate sizes under swiftshader, and first paint; the user
decides on the numbers. Two questions only he can answer: (1) 3D models
(needs a model pipeline: Blender, Meshy or Tripo; kie.ai makes images, not
meshes) or sprites on a 3D ground as StarCraft itself did; (2) does he want
to place things by hand in an editor (then PlayCanvas) or keep the field
generated from the wire (then Babylon).

## Decisions taken, each with its ground

**No engine. Hand-written canvas2D.** Measured three times, never refuted:
`engine-benchmark.md` (7 engines, one seeded scene: three.js 109,407 B brotli
vs ~2 KB canvas2D), `benchmark-reverify.md` (the 55.9 fps row did NOT
reproduce - same geometry holds 120 fps, that row measured one implementation),
`render-budget.md`. Unity 6 empty web build is 2.0 MB brotli after six
stripping steps, Godot 4.3 is 5 MB (first-party figures, `platform-reach.md`).
The comb prototype is 6 KB. Unity is not installed on this machine, nor Godot,
and the disk had 9 GB free. The user's "do it in Unity" was answered honestly:
Unity does not fix the complaint that provoked it - see the open item on
characters below.

**The mark is the map cell.** 27 petals from
`trinity/apps/website/public/trinity-logo-with-label.svg`, parsed: every petal
a pentagon, 135 edges, 108 unique vertices of which exactly 27 are shared
between petals - one per petal. Those 27 are the nodes; the other 81 are
structure. `WORD_SIZE = 27` in `t27/specs/isa/ternary_bitwise.t27` makes one
tile one 27-trit word: hue = ring (gold CPU outer, cyan FPGA middle, green GPU
inner), value = trit (+1 working, 0 idle, -1 refused).

**The field is a triangular tiling where every cell IS the mark** -
`prototypes/06-comb.html`. Rows are NOT shifted; orientation alternates on
`(c+r)&1`; every interior vertex is degree 6 (verified on 6x14). Fog of war
keeps its walls at a tenth of the weight. 90 cells draw in 1.5 ms median,
152 in 2.3 ms, on a machine under load (8.33 ms budget at 120 Hz).
`04-silver-lattice.html` is the alternative reading of the reference image
(marks overflow their cell and interlock); the README explains why 04 and 05
cannot both be true and assigns them to zoom levels.

**Palette from the LIVE stylesheet, not the checkout.** The local `trinity`
checkout is 62 commits behind t27.ai. The live Queen route ships
`Queen-*.css` with 87 `queen27-*` selectors: working cyan `#64DCFF`, warm
gold `#FFD45A`, cold `#FF6B6B`, ground `#020806`; tokens `--q-gold #ffd700`,
`--q-green #00ff88`. Those selectors already include `queen27-map-sectors`,
`queen27-city-canvas`, `queen27-hardware-foundry`, `queen27-core-orbit` - a
map, a city, a foundry and an orbit are ALREADY LIVE. Anything built from the
prototypes must extend that vocabulary, not add a second one.

**The city on the comb (the user, 2026-09-04, three messages in a row).** "A city
whose tile IS our drawing" - not a city instead of the comb. Then: "remove the
up-pointing triangles; what is left is islands floating in weightlessness, where
27 cells are the field of one unit". Then, with a StarCraft platform screenshot:
"islands with structure, like soil through which the drawing is visible - I want
this". Built as: `buildCells` keeps only the down cells (the mark alone, touching
neighbours at vertices); every island floats on its own phase (`zc()`), with a
dark underside and side faces nine units below, the engraved ground plate on top
at alpha .85/.7/.35 (held/neutral/fog), a lit rim, and the mark's 135 edges drawn
OVER the soil so the drawing shows through; one structure sprite per card by
column (`structure-{backlog,running,review,done,blocked,dropped}`, tinted dim
silver / cyan / silver / gold / cold / dark), one crystal per verified hardware
device by family (`crystal-{cpu,fpga,gpu}`, gold / cyan / green), painter-sorted
by depth, under the bees. Nine renders via kie.ai in the house engraving idiom,
all nine accepted on the first submission (prompts in `sprites/prompts/`,
masters in `sprites/`). The context panel shows a picked card's structure.

**Mining economy: in-game resource, wall to TRI stays up.** `TrinityToken.sol`
exists (ERC20 + vesting, Sepolia deployment). `territory-economy.md` §4.5 ends
in a prohibition: do not attach a transferable token to a proof unit, because
attack A4 (rented compute claimed from your holding) is invisible to the
design. `mining-economy.md`: MINERALS = accepted turns (44 lifetime measured),
GAS = proof units (0 today, stays 0 until a second-trust-domain replay exists).
Every spend is WATCH-ONLY today - no public write endpoint exists.

**The three dead endpoints are live now.** The page polled
`/queen/public-research`, `/queen/public-hardware`, `/queen/public-activity`
into 404s for two days after `#1313` closed. Root causes, stacked: routes
merged but Railway is not linked to the repo (deploys are `railway up` from a
local tree); mounted without `publicReadCorsMiddleware()`; the hardware route
derived a signing key from `TRIOS_API_TOKEN` when none was set, and the key
the page pinned had NO private half anywhere. Fixed in order: page re-pinned
FIRST (trinity `67623aa60`, live), then the operator's new key installed on
Railway, then deployed. All five answer 200 with CORS for t27.ai; the
production envelope verifies under the page's own verifier
(`wukong-xc7a200t: programmed`). PR #105 on `gHashTag/BrowserOS` carries the
CORS fix, the key guard, a `server.ts` scan test that fails if a public route
lacks CORS, and an entrypoint fix.

**The deploy took the server down for ten minutes, and it was not the code.**
41 unpruned bee worktrees - 45 GB, 2.98M inodes, 99% of the volume - and an
unconditional `chown -R` in the entrypoint outlasted the 300 s healthcheck.
Cleaned by rule (issue closed AND no uncommitted files): 21 removed,
45 GB -> 12 GB. The chown is now conditional. Nothing in code prunes a bee's
worktree when its issue closes - that reaper is still unwritten.

## What is open, and what each needs

| item | state | needs |
| --- | --- | --- |
| **Characters** | 24 PRODUCED: 17 characters (Queen/LARVA/3 lines/12 stages) plus 4 portraits plus 3 ground tiles. Pipeline + two caught defects in `sprites/PIPELINE.md` | demotion wiring once `queen_dispatch` gets a `failure_kind` |
| **IN THE REAL PAGE** | `QueenComb.tsx` MERGED as trinity #894 = `83b38287a` (2026-09-03 17:3xZ) and PUBLISHED by the apex publisher (`ghashtag.github.io` `1a39ad464`, entry `index-DkZwajUe.js`, chunk `Queen-B9JCD1s3.js`). Seen live at t27.ai/#/queen: 73 held / 23 neutral / 56 fog, 4/4 bees, the Queen on the centre cell. Cells = board cards; bees = `workers.slots[]`; click binds a card + portrait | - |
| Slots or aggregates | **DECIDED: slots** (user, 2026-09-03) | bind `workers.slots[]` to cells |
| Flower ring / field size | undecided | k=2 (19 tiles) is the canonical Flower and costs nothing; 37 and 61 both fit |
| 108 lit vertices vs 27 | undecided | 108 needs four 27-trit words per tile; only worth it if those 108 quantities mean something |
| PR #105 merge + `railway up` | **MERGED** `441b46e5d` 12:53Z (over pre-existing red CI: pg-migrate has no Postgres in CI, server-tools dies on D-Bus, cla needs the owner's signature); redeployed from the merge | - |
| Worktree reaper | unwritten | prune `.worktrees/queen-N` when issue N closes and the tree is clean |
| **Swarm fed** | 2026-09-03 13:13Z: 14 briefless backlog issues rewritten by `queen-briefing` (two, #957 and #380, as operator-only records - their sources are not in the bees' tree). First tick: 4 dispatches on 2 live keys. #1279 accepted 4/4 criteria, 0 strays, at 13:28Z | keep the backlog briefed; the Queen cannot write her own briefs yet (#1327) |
| Z.AI keys | 2 live (`dced…w8LF`, `ff6f…Ii78`); 2 exhausted on both hosts, deleted | top up or leave |
| **Review queue (17)** | not "no review": accept=34 of 49 finished. Three valves: `wait` was terminal (fixed), a `## VERDICT` header torn across transcript rows read as no verdict (fixed, `fix/queen-review-torn-verdict`), and `sendBack` never re-dispatches (#1329, open). 6 escalations genuinely need a person or a rewritten issue | merge + deploy the fix; decide #1329 |
| Map bound to live data | not started | `06-comb.html` is seeded; `public-hardware` (one board today) and `public-activity` (120 events/24h) are the sources |
| **THE LOOP** (2026-09-04, the user: run a continuous improvement cycle every 15 min while he sleeps) | Skill `~/skills/queen-game-loop` (contract, LESSONS, `_state/` with loop.py lock+state+journal, anomaly scan with self-healing, Claude Code style dashboard), `tri game-*` (12 commands), research workflow `~/BrowserOS/.claude/workflows/queen-game-cycle.js` (6 agents: two audits, two competitor sweeps, an anomaly hunt, a planner). Cycle 001: 47-task plan ingested; shipped the P0 honesty pass as trinity #897 = `a50e080ea` (apex `e84ed1b18`, `Queen-DOXks2jv.js`): ALLOW line says what the round did, rounds/24h is a dash (lease-row count), tiles name their window and wire source, FOUNDRY online/total, COPY TO AGENT no longer hands out api.t27.ai. Reports: `_state/cycle-NNN.md`. Cycle 002: P0-3 shipped as trinity #898 = `e7b74fb7a` (apex `92eb5f31d`): no count reads 0 while its endpoint is silent, proven by a new `check:queen-dead-api` probe that was shown to fail on one reverted line Cycle 003: P0-7 shipped as trinity #899 = `e47ac6d19` (apex `4947908de`): a tap picks a cell on touch, a drag never picks (mouse too, an unplanned defect), `touch-action: none`; `check:queen-touch` written first and shown to fail on the previous build. All seven P0 done Cycle 004: P1-1 shipped as trinity #900 = `5b1d8db18` (apex `f1484759a`, `Queen-DU8EjYuf.js`): when `lastTick.decidedAt` changes the round tile and the gold block flash 6 s with a strip of status fields (clock · ALLOW/REFUSE · what the round did · skipped count); skip reasons are the wire's keys as spaced words, no meaning added (server P3-8); `check:queen-round` intercepts /queen/status with CDP Fetch and was shown to fail first. Cycle 4 also re-ran the research workflow (6 agents) against the 40 open tasks Cycle 005 (directed live by the user): THE CITY ON THE COMB shipped as trinity #901 = `974ec9ee4` (apex `2376514cc`): islands of the mark as floating soil slabs, a structure per card, a crystal per device, nine sprites. Cycle 4's plan ingested (34 tasks, 16 findings; 85 tasks total, 12 done). Cycle 006: P0-13 shipped as trinity #902 = `9a0302f8f` (apex `b83eb5b01`, `Queen-B3kXDHnZ.js`): the pick is derived from the card number every render, so a reordered board keeps the outline, SELECTED and OPEN ISSUE on the same card, and a card that leaves the board clears the pick; `check:queen-pick` rotates the board by seven through CDP Fetch and was shown to fail on the index logic first. 13/85 done. Cycle 007: P0-8 shipped as trinity #903 = `1b1d95d88` (apex `a83fdaca7`, `Queen-BJf-xP_w.js`): an absent reviewState reads as a dash on the card and null in every queue (17/17 review cards lack the field on the wire), the REVIEW QUEUE menu carries "N no state on the wire"; `check:queen-review` inverted and shown red on nine assertions first; the blog's [proven] claim about the old fallback corrected in both languages; `tri game-wire` and `tri game-prove` added. 14/85 done. Cycle 008: P0-12 shipped as trinity #904 = `65cc3e126` (apex `3a0cbff42`, `Queen-BSEbAR41.js`): no content slot prints a raw fetch error (KANBAN/MISSION MAP empty columns, FACTORY slots and footer, MENU SOURCE note print their copy word; the raw text lives in title attributes on the slot and its header, for the P1-12 stale badge); `check:queen-dead-api` scans content slots for error words and was 19/25 on the old code; `tri game-gates fast|full` runs the whole chain; the loop's 5-minute light-tick rule removed (fires are serial in one session, the lock is the guard). 15/85 done. Cycle 009: P1-20 shipped as trinity #905 = `4e8b73b3c` (apex `daa941b52`, `index-DDpd0tbz.js`, `Queen-L-J3i435.js`): a placement ledger keyed by card number (pure `placeCards` + `fieldShape` in queenHud.ts, adjusted during render in Queen state): a known card keeps its cell across polls, a new card takes the first free cell, a departed card leaves it empty, so structures and bees no longer jump on a head insert; `check:queen-placement` (head insert + rotation) shown red on the old dist first; the pick contract no longer asserts that the index must move. Placement policy assumed stable-by-number (variant C unanswered); P1-11 sectors would now be a one-time sort at first placement. `tri game-ship`, `tri game-prove --entry`. 16/85 done. Cycle 010: P1-12 (badge half) shipped as trinity #906 = `64978ec4e` (apex `ebd24d3be`, `Queen-ByuTZR7c.js`): the viewport head carries STALE · HH:MM:SS once a board or research poll fails after a first success (age since the last success, raw error as the title, `data-stale`); `check:queen-stale` (first board poll passes, every later one fails; badge within 10 s while the pill stays LIVE) shown red on the old dist first; P1-30 split out (server-clock countdown); `tri game-close`. 17/85 done. Cycle 011: engine spike measured (draft #907). Cycle 012: the user decided "Babylon" (09:52Z), then "make it look like a game" (StarCraft screenshot) and "find top open-source figures"; B-1 parity shipped to draft #908 = `75568a188`: the Babylon comb draws every canvas layer, passes pick/placement/touch on `?engine=babylon` (`check:queen-babylon`), 480/480 frames at vsync; still behind the flag. Asset shortlist (CC0 glTF): Kenney Space Kit / Space Station Kit, Quaternius Ultimate Space Kit / Modular Sci-Fi MegaKit / Sci-Fi Essentials, KayKit Space Base Bits. 18/85 done + B-1. Cycle 013: B-3 (bee flights, event glints) and B-2 (the flip) shipped as trinity #908 = `d643f327f` (apex `78c05f41a`, `index-DLCfuEAH.js`, Babylon chunk ``): THE COMB ON t27.ai IS BABYLON.JS BY DEFAULT; `?engine=canvas` keeps canvas2D one release; every gate runs on the Babylon comb; one viewport flake at 390x844 RESEARCH recorded. B-4 scope: the Queen page only (three.js also serves five science viewers). 20/90 done. Cycle 014: the user ("hear me, I want a field like THIS", StarCraft) re-targeted the picture; B-6 (selection flare, territory-coloured dashed hover, flight lines) and THE GAME FIELD shipped as trinity #909 = `9bc0c4a77` (apex `caf63cbb6`, `index-DHAlv9Zs.js`, `QueenCombBabylon-Ch90MSLm.js`): a continuous steel-tile platform with the mark engraved per tile, sun and shadows, thin-instanced low-poly buildings per column, the Queen's hub, bees as ground units with rings, a fixed RTS camera; 19 gate rows green; 479/479 at vsync. 22/93 done. Cycle 015: B-7 shipped as trinity #910 = `90d80112c` (three done silhouettes by number, roads on a 0.4 S footprint, S-wide plates, hazard rails, the OVERVIEW minimap as a top-down map of the platform); the user, from the in-app pane: "why is the map cut on the right, why do the graphics suck": the clip was a stale canvas size after a hidden/fullscreen change, fixed in #911 = `27fdcb148` (per-frame box check + visibility/fullscreen handlers), apex `5057dfbbb`; the graphics answer is the asset pack (B-5, waits for his word). `tri game-local` (vite preview on 4173 + open in the default browser; the in-app pane is document.hidden and freezes the loop). Two viewport flakes: the RESEARCH console overflow at 390x844 is now P1-31; a 'sectors=0' readiness flake under load recorded. 23/94 done. Cycle 016: the user said "download it yourself, open source"; Kenney Space Kit 2.0 (CC0, 6.7 MB archive, 14 GLB = 284 KB served) replaced the procedural buildings, hub, crystals and units, with tone mapping, vignette, fog and a glow layer (B-8, B-5, P1-31) as trinity #912 = `63f1e52d0` (apex `0ccd678d0`, `index-BtJgdu3X.js`); the viewport gate found three defects on the way (the tree console scroller, a loader touching a disposed scene, PBR's async BRDF texture on a dead engine, cured by StandardMaterial). He then directed the M epic (modules in rings, unique from their code, bees are the issues, mesh shaders studied: not in browsers). 26/98 done. Cycle 017: M-2 shipped as trinity #913 = `3dd742fbd` (apex `b06742a1d`, `index-DjsccCAJ.js`): THE FIELD'S CELLS ARE THE REPOSITORY'S MODULES (114 from a loop scan of trios at c4c502b2e, `public/queen/modules.json`, polled every 15 s until /queen/public-modules exists), laid in rings from the Queen's hub by the placement ledger, column and territory from facts (issue in progress, open issue, touched within 30 days, dormant 180), building by language, footprint by lines, a quarter-turn by hash, a red fence for open issues; bees are the issues in progress walking to the module their title names; the context panel shows the module; `fieldShape` cell count fixed (195 slots for 189 cells since P1-20); pick and placement contracts now mutate modules.json. 27/99 done. Cycle 018: M-3 shipped as trinity #914 = `b2ec393ca` (apex `575fd108c`, `index-Za6t80dQ.js`): `buildingPlan(module)` is the shape grammar (core by language, footprint by lines, height by function density up to 1.6x, an annex per export band, a dish per import band, a quarter-turn by the path's hash, the red fence on open issues) and `planHash` pins it: the same code yields the same building; the field draws the parts as thin instances of the Kenney models. `tri game-plan [path]` prints a module's plan. 28/100 done. Cycle 019: M-4 shipped as trinity #915 = `0c0dc0b8e` (apex `a66503878`, `index-CEfZVCAR.js`, Pages deployment queued at close): a per-instance tint through Babylon's thin-instance colour attribute (recency warms and brightens, dormancy cools and dims, open issues wear the paint, floor 0.55) and lit window bands per function band in the grammar; no two modules share a facade; the facade PATTERN in a shader stays M-5. 29/101 done. Cycle 020: M-1 on both sides: the server route /queen/public-modules (trios agent-server, local commit `3dca32702` on feat/queen-supervisor, deployed by the operator's `railway up`; a scan of the checkout beside the server, cached ten minutes, stamped with the commit read from .git, files only) and the website reading the wire first and the loop's snapshot second, labelling the source, with open issues filled from the board's cards for both (trinity #916 = `7438749a7`, apex `index--wm36luZ.js`). The cycle-019 Pages build took 37 min; the scan reports a queued Pages build as GitHub's lag. 30/102 done. Cycle 021: B-4 shipped as trinity #917 = `f4e865a5a` (apex `f3e50b1e4`, `index-D6MTppPL.js`): the research city (TECHNOLOGY TREE / FACTORY) draws with Babylon through a plain canvas (`queenResearchCityScene.ts`: spire, laboratories on thin-instanced foundations, construction rings at 12 FPS, hardware foundry, routes by state, on-demand rendering, DPR cap 1.5, click selection); React Three Fiber, drei and three left the Queen page (the served Queen chunk references no three.js chunk; the blog's five science viewers keep theirs); the city, construction and hardware contracts now assert facts on the Babylon scene instead of R3F props. ONE ENGINE ON THE GAME'S PAGE. 31/103 done. Cycle 022: P1-30 shipped as trinity #918 = `78865e44c` (apex `d635f1140`, `index-BI3gVyoO.js`, `Queen-BoQ2Mniu.js`): the NEXT QUEEN ROUND clock follows the server's clock, not the visitor's: the status fetch reads the answer's `Date` header into an NTP-midpoint offset (`serverOffsetMs`, `countdownFor` in queenHud.ts, honesty 48 -> 52), `#stat-round[data-clock=server|client]` says which clock it follows; `Date` is not CORS-safelisted, so the server exposes it on both CORS branches (trios local commit `c5bc03f53` on feat/queen-supervisor, the user's `railway up`; test shown failing first); `tri game-clock` proved the live API answers t27.ai on the TRUSTED branch with expose absent (offset -262 ms Mac vs Railway), so the page reads `data-clock=client` until the redeploy. 32/103 done. Cycle 023: P0-9 shipped as trinity #919 = `aeb63b4f0` (apex `a31f4ae36`, `index-0PdQE9FR.js`, `Queen-Dsc8P5sb.js`): the activity merge is a pure `mergeActivity(previous, next, nowMs)` in queenHud.ts (newest poll first in wire order, dedupe by id with the newest copy winning, stable sort by time, cap 120, the bell's alerts aged by the window against the clock it is handed; honesty 52 -> 56); the inline rule had let the older buffer win same-second ties. Finding: the wire carries no server sequence, so wire-order ties are the spec but not reproducible across polls (a `seq` or `(at,id)` cursor on the server). `tri game-branch NAME` cuts a cycle branch from origin/main after a fetch (a diverged local main had started this cycle one commit behind). 33/103 done. Cycle 024: P1-10 shipped as trinity #920 = `de1a4d35a` (apex `64e980c63`, `index-sqbcDw24.js`, `Queen-Ceq0_SNN.js`): a cell with no module is EMPTY GROUND: a click there clears the selection (the RTS convention; the field had picked cardless cells, 75 of 189, with a null module), the hover ring answers only modules and the hub, the host reports `data-hit=off|void|module|queen`; `check:queen-void` (21st gate row, red on the previous build with data-hit absent) sweeps for a void hit and requires the pick cleared. `tri game-contract NAME` scaffolds a contract from the pick harness with a failing tail; the gate chain now keeps one HEADLESS list so a new contract runs once, after the build (void had run twice, once before dist was rebuilt). 34/103 done. Cycle 025: P0-10 shipped as trinity #921 = `18094cdc2` (apex `158e1fe4c`, `index-nY1Y8Jat.js`, `Queen-DnbS2VcG.js`): a review verdict's identity is (issue, state): the wire re-issues every pending verdict with a new id each round (measured live: #1471 `wait` as `review-1471-1788552916000-0` at 20:15:16Z and `review-1471-1788553216000-0` at 20:20:16Z, six per tick), so by id the bell, the INTEL FEED and the cell glints saw six pieces of news every five minutes; `eventIdentity` keys the merge, the bell count and the glint memory (Alertmanager's rule: identity from labels, never from a volatile value); a state change still rings; honesty 56 -> 59. `tri game-activity [HOURS]` is the wire measurement. 35/103 done. Cycle 026: P1-18 shipped as trinity #922 = `2992f2fc0` (apex `fc30fb68d`, `index-CfG-YPh_.js`, `Queen-DyeT_Shs.js`): the window under a tile's value is never cut: measured first with the new `check:queen-windows` (2 languages x 5 sizes; on the previous build 1440/1272/1280 cut DONE "+119 Bees started / 24h" and FOUNDRY "1 programmed · queen-fpga-…", and the Russian rows needed three lines), then the sub-line wraps to two lines before any ellipsis (pill excluded), the copy is shorter with the wire field first ("+119 started / 24h", "старт / 24ч", "прошито"), the FOUNDRY key id lives in the title and the FOUNDRY view, the RESEARCH loading sentence fits in every state ("Загрузка графа…"). Design-system rule applied: wrap first, truncate second, abbreviate with caution (Fiori, Carbon, PatternFly, Maersk). `tri game-measure NAME` runs one headless contract and refuses while the chain holds dist. 36/103 done. Cycle 027: P0-11 shipped as trinity #923 = `d84132195` (apex `d16a9f62c`, `index-oUrwI138.js`, `Queen-DvYDZ44X.js`): the ALERTS bell names the span it observed: the activity buffer carries `observedFrom` (the oldest moment any poll showed, never later), `alertSpan` clips the 60-minute window to it, and the bell says "ALERTS · 14 min" on its label line from 1500 px (title and `data-span-seconds`/`data-span-clipped` at every size) instead of implying an hour the wire's newest-120 answer never covered; honesty 59 -> 61; the windows gate measures the bell line. Two overflows measured on the way: a fourth bell line made the 62 px bar 70 px (viewport gate red at 20 of 25), and the label line squeezed two Russian tiles at 1440 to three lines, hence the 1500 px rule. Badge guidance applied: a badge is a promise; a time-bound count names its window. `tri game-copy KEY`. 37/103 done. Cycle 028: the bar's widths shipped as trinity #924 = `524af1d1c` (apex `4b1b8c538`, `index-DoquhqV3.js`, `Queen-DY1T7V31.js`): a bar probe (`qa/queen-bar-probe.mjs`, `tri game-bar`) showed the brand's `auto` column taking 388-400 px at 1440 for its eyebrow sentence and leaving the five stat tiles 98-109 px, the container defect behind two cycles of copy shortening; the eyebrow now hides from 1499 px down (the 1280 px rule fired 160 px too late), tiles at 1440 have 150 px (en) / 138 (ru); the windows gate floors flexible tiles at 100 px on desktop and prints the narrowest each run, red first on the previous build. Priority+ in its simplest form: the lowest-priority item on the bar goes first. 38/103 done. Cycle 029: P1-29 shipped as trinity #925 = `53e05c50c` (apex `a056dc506`, `index-Q5Yg1fgD.js`, `Queen-DeLaiO_C.js`): the round tile is a bound, not a promise: it reads public-board's pulse only (a dash without it; the fallbacks to the status interval and the last decision's moment are gone), its value counts up since the last round ("+04:27", label SINCE ROUND), its sub-line names the moment and the interval as a bound ("since 04:34 · ≤ 05:00"), OVERDUE past the bound on the server clock; honesty 61 -> 64; the dead COPY key `every` removed. The practice behind it: Primer shows elapsed time for a running task, Airflow's "Next Run" misled users for years, GitHub shows no next-run for cron, the monitors treat the schedule as an alerting threshold. `tri game-round` prints the same fact from the wire. 39/103 done. Cycle 030: P1-28 shipped as trinity #926 = `6bcbc54ee` (apex `9f6016d51`, `index-H5-AQrmI.js`, `Queen-BlMhzctN.js`): the status pill says what the swarm is doing, "LIVE · WORKING", the wire's `swarmState` through four COPY keys in both languages (an unfamiliar state printed as the wire word, an absent one as the unknown key; the tone classes the gates read unchanged); the VERDICTS window adds "· N ready" from `dispatches.unreviewed` only when the field exists. The windows gate found two cuts on the way and both are fixed: every tile's window now spans the glyph column (62 -> ~95 px at 1272, the constraint three cycles of copy shortening had designed around) and the gold block's decision line leads with the wire field under a two-line clamp (the refusal had been the cut segment at 1280x600 in Russian, the P1-18 line). Honesty 64 -> 68. Finding: the server's swarmState union is not discoverable from the client. `tri game-status`. 40/103 done. Cycle 031: P1-27 shipped as trinity #927 = `d113bfedb` (apex `9a70bd6e0`, `index-B8mCFqSL.js`, `Queen-DbI94jLB.js`): the INTEL FEED header states what it holds from its own rows, "LIVE · 120 rows · 6 h 25 min" (`feedCoverage` pure in queenHud.ts: rows, span between the oldest and newest row, both moments in the title, `data-rows`/`data-span-seconds`; no span under two datable rows), Grafana's meaning (what the list holds), not Kibana's (total hits); honesty 68 -> 70. The windows gate caught the gold block's decision line at three lines in Russian with a long refusal: the stood-down copy is shorter in both languages. A flake recorded: the gate reads the live refusal, one run green and one red; the fix is to intercept /queen/status with a long refusal in the contract. `tri game-feed`. 41/103 done. Cycle 032: P1-24 shipped as trinity #928 = `d882cdff1` (apex `1c32ca6da`, `index-B7dNkyhj.js`, `Queen-FqNpciL_.js`): verdict and finish rows print their wire state after the kind word, "Queen issued a verdict · wait" (measured: 63 of the newest 120 rows are verdicts with wait / sendBack / accept), a state equal to the kind word adds nothing ("finished · finished" stays one word), no state no suffix; GitHub's status-plus-conclusion rendered as one phrase; honesty 70 -> 71. The windows gate now pins its input: every /queen/status answer is rewritten to a refused tick with a 96-character reason, the gate proves the reason reached the gold block and waits out the six-second round strip; stable 4/4 before the chain (cycle 031's flake closed). `tri game-events KIND`. 42/103 done. Cycle 033: P1-23 shipped as trinity #929 = `0128e78e6` (apex `96b0c61e2`, `index-Yak8xL2-.js`, `Queen-CJ_XUAd9.js`): BEE QUEUE rows append the age of each bee's last word ("· 42 s", "· 6 min") and cool (dimmed `is-cold`, `data-silence-seconds`) once the silence outlasts one round, the pulse's roundSeconds, no other threshold invented; no last word no age, no round length never cold; `beeSilence` pure, honesty 71 -> 73; the practice: Kubernetes flips a node after ~4-5 missed heartbeats, Celery after 2x, Dask colours rows by last-seen age, Sidekiq expires stale rows. Three chains ran: the gate chain's load made the windows gate's 30 s ready wait and the round gate's 8 s resolve window flake (both green standalone); the waits are now 60 s and 20 s and the windows gate names its problems. `tri game-bees`. 43/103 done. Cycle 034 (the honeycomb plan, slice H-A): the hex spiral shipped as trinity #935 = `f60ca42eb` (apex `1fa594851`, `index-Cxvlwihn.js`, `Queen-BFntmjNp.js`): pure math in queenHud.ts (a pointy-top spiral from the hub, cell 0 the hub, ring k = 6k cells from 3k(k-1)+1, 1009 closed issues + hub = 18 rings / 1027 cells; axial <-> index <-> world, O(1) hit test by cube rounding, corners, centres, spiral order), the foundation helpers (order by closed_at, cells, honey tone by age) and the layer helpers; `placeCards` honours a shorter order (the hub is nobody's, caught by a check); honesty 73 -> 82, red first; no pixel changed on purpose. `tri game-foundation` (the loop's gh snapshot: 1009 closed, 17 epics with 419 children, 21 rings, 2 releases, 284 KB raw / 40 KB brotli; every epic's ring is null until the `ring:<NAME>` labels exist) and the operator's label commands drafted in `_state/drafts/labels.sh`. 44/119 done | next: H-B the field goes hex, H-C1 the foundation snapshot on the page, H-C2 the honey renderer, H-D layers, the operator's labels and the audit epics (drafts in `_state/drafts/issues/`), railway up (user) |
| **Bees on cards** (trinity #896 = `2b3fd61c2`, 2026-09-04 01:18Z, published) | The comb's bees mean something now. Pairing is positional and the code says so: the k-th busy worker slot flies to the k-th running card and hovers there; a busy slot with no running card hovers at the Queen's cell; an idle slot is a larva on the ring around her. No public endpoint links a slot to an issue, so this is the only consistent reading of both. Bee objects are keyed by the slot SET, so the 5 s poll no longer resets flight (it did before: every poll rebuilt the array). New activity events glint a ring on the cell of their issue in the kind's colour; a card that changes column flashes its cell. Proven in headless Chrome with two endpoints mocked (3 running, 2 busy): a click sweep read SLOT 01 BUSY on #1385 and SLOT 02 BUSY on #1383, both running, the third running card bare | a real slot-to-issue field in `/queen/public-research` would make the pairing exact instead of positional |
| Zoom / Protoss interior / bee evolution | designed in `zoom-and-lod.md`, `evolving-bees.md`; the 12 stage sprites exist but the React comb draws only base line sprites for busy slots - stage needs a per-slot ledger the API does not emit yet | |
| **ONE SCREEN** (the user, 2026-09-04, in Russian: why is the screen so long - put everything into one HUD on one screen) | BUILT on trinity `feat/queen-command-screen`, the 4X command HUD in the user's two reference images with the live palette: top resource bar (BEES, ACCEPTED, VERDICTS, RESEARCH, FOUNDRY, NEXT ROUND, ALERTS, status pill + MENU), left command panel (COMB / KANBAN / MISSION MAP / FACTORY / TECHNOLOGY TREE, digit keys 1-5, collapsible), centre viewport (`SECTOR: repo`, FIT / − / + / FULLSCREEN) with the CONTEXT DETAILS overlay (BEE QUEUE = running cards + their latest event; SELECTED = the Queen's portrait and stats or the picked cell), right column (INTEL FEED = public-activity, OVERVIEW = flat minimap of the same cells, SECTORS = the six columns as territories), bottom (ACTIVE SECTOR, QUICK COMMANDS: copy A2A / open repo / open issue / fit / fullscreen / EN-RU, and the gold NEXT QUEEN ROUND clock with the decision popover). No page scroll: the height chain of `tabs-at-height.md` §3.3 is applied under `body.queen-shell` / `.queen27-page.is-shell`, and `qa/queen-viewport-contract.mjs` (§5 adapted) runs 5 sizes × 5 views in headless Chrome: 25/25. DATA-HONESTY RULE: every number on screen is an endpoint field or a COPY key, absent data reads as a dash, the gold block is a clock and is never labelled END TURN - no public write endpoint exists. Built by three parallel panel builders + one integrator + four verifiers (two adversarial reviews found 25 items, 5 blockers all "0 rendered while the endpoint is silent") + a fix loop, then five fixes by hand from the screenshots: fit-to-box camera with a bottom inset for the context panel, context panel open only on the comb (and never by default on a phone), six sector rows fit at 900px, active-sector stats as a 2x2 grid behind the mark instead of a ground tile, and the minimap pick reaching the context panel. **MERGED as trinity #895 = `4f06bddcf`** (2026-09-03 19:16Z) and **PUBLISHED**: apex `6b1b82041` (19:20Z), entry `index-uZ48wLf1.js`, chunk `Queen-C3eVNqWh.js` (107,527 B) carries `queen-shell`, `queen27-hud-top`, `queen27-hud-command`, `queen27-context`, `queen27-intel`, `queen27-minimap`, `fitInset` - grepped from the served file, not from dist | open items below: bee evolution stages, worktree reaper, `failure_kind` |

## Where things are

```
tri-27/docs/game/           13 studies + this file
tri-27/docs/game/prototypes 01-06 + README (geometry provenance, the defects found, per-pass timings)
BrowserOS  feat/queen-supervisor     a0df36cd5 routes (superseded by origin's merge of #99)
BrowserOS  fix/queen-public-cors-and-key  f03afa01a + 851d77008  -> PR #105
trinity    main 83b38287a            #894 comb merged and published (apex 1a39ad464)
trinity    main 4f06bddcf / 2b3fd61c2  #895 the one-screen HUD, #896 bees on cards (clean clone at /tmp/trinity-comb)
ghashtag.github.io  publish-website.yml   THE publisher: builds trinity@main every 15 min IF the cron fires
                                          (it stalled 2.5 h on 2026-09-03); `gh workflow run publish-website.yml
                                          --repo gHashTag/ghashtag.github.io` publishes in ~3 min. trinity's own
                                          deploy-site.yml is dead (needs a GHIO_TOKEN nobody created; 6/6 failed)
Railway    trios-agent-server        QUEEN_FPGA_SIGNING_PRIVATE_KEY set; deploy 7b381c42 live
~/queen-fpga-signing.key             the private half, 0600, never committed
```

## Corrections made along the way, so they are not re-learned

- The command-HUD prototype (09) was written in plain HTML; the user was
  right that the page is React + Vite. It was a throwaway; the component is
  `QueenComb.tsx`. Do not port 09 - port its data bindings, which are already
  the page's own hooks.
- Three React lint rules fired on the first component draft and each was
  correct: derive cells and bees with useMemo, never read a ref during
  render, keep the one ref clamp inside the effect that owns it.
- `grep -c` on a built chunk printed a 1 from the wrong line once; the browser
  was serving a cached older chunk with a different hash. Prove a served
  bundle by fetching it from the preview server and grepping THAT.

- **Camera distance is perspective, not zoom.** The comb's projection is
  `f = dist / (dist + Z + 430)`; at the minimum dist the 189-cell field is
  still 1030 px wide (measured in Node), so a fit that bisects dist collapses
  to the floor and the field sticks out. A separate `scale` factor in the
  projection is what the fitter bisects and what the wheel and the ± buttons
  drive; dist stays 420. The first fit was shipped to the harness before this
  was measured and every screenshot showed a field overflowing its band.
- The viewport harness once captured a black comb at 1280x600 while a real
  browser at the same size drew the field in the band (lit-pixel rows 0.1-0.4
  of the canvas, none below, on a resize without reload and on cold reloads).
  A harness screenshot is not a browser; when the two disagree, measure the
  browser before touching the code.
- **A hidden browser pane runs no animation frames.** The Claude Browser
  pane reported `document.hidden = true`; the comb's loop was frozen there,
  so a pixel scan found every bee at home and nearly proved a false defect.
  Animation tests go through the headless harness (visible page, frames
  run) or a fronted tab, never a hidden pane.
- **A synthetic click must yield before the DOM shows the pick.** React
  flushes a native-listener update after the task, so a sweep that
  dispatches a click and reads the panel synchronously sees the old text
  160 times. `await setTimeout(8)` between clicks turned 1 distinct cell
  into 23 and found both bees.
- The 55.9 fps figure was one implementation, not canvas2D.
- The palette was read from the wrong file twice (checkout, not live site).
- "Gold has 27 uses" was four files; whole-tree count is 277.
- A frame-interval HUD compared vsync period to the budget and printed OVER
  BUDGET at 1% utilisation.
- The Flower of Life spacing is R, not sqrt(3)*R - the latter is hex packing
  and leaves gaps.
- Rows in a triangular tiling are not half-shifted; shifting them opened the comb.
- `queen-contract-check.mjs` was not blind because its list was short; it was
  blind because it lives in a repo that publishes nothing.
- A `railway deployment list` SUCCESS does not mean the server started.
