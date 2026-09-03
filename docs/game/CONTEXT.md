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
| Zoom / Protoss interior / bee evolution | designed in `zoom-and-lod.md`, `evolving-bees.md`; the 12 stage sprites exist but the React comb draws only base line sprites for busy slots - stage needs a per-slot ledger the API does not emit yet | |
| **ONE SCREEN** (the user, 2026-09-04, in Russian: why is the screen so long - put everything into one HUD on one screen) | BUILT on trinity `feat/queen-command-screen`, the 4X command HUD in the user's two reference images with the live palette: top resource bar (BEES, ACCEPTED, VERDICTS, RESEARCH, FOUNDRY, NEXT ROUND, ALERTS, status pill + MENU), left command panel (COMB / KANBAN / MISSION MAP / FACTORY / TECHNOLOGY TREE, digit keys 1-5, collapsible), centre viewport (`SECTOR: repo`, FIT / − / + / FULLSCREEN) with the CONTEXT DETAILS overlay (BEE QUEUE = running cards + their latest event; SELECTED = the Queen's portrait and stats or the picked cell), right column (INTEL FEED = public-activity, OVERVIEW = flat minimap of the same cells, SECTORS = the six columns as territories), bottom (ACTIVE SECTOR, QUICK COMMANDS: copy A2A / open repo / open issue / fit / fullscreen / EN-RU, and the gold NEXT QUEEN ROUND clock with the decision popover). No page scroll: the height chain of `tabs-at-height.md` §3.3 is applied under `body.queen-shell` / `.queen27-page.is-shell`, and `qa/queen-viewport-contract.mjs` (§5 adapted) runs 5 sizes × 5 views in headless Chrome: 25/25. DATA-HONESTY RULE: every number on screen is an endpoint field or a COPY key, absent data reads as a dash, the gold block is a clock and is never labelled END TURN - no public write endpoint exists. Built by three parallel panel builders + one integrator + four verifiers (two adversarial reviews found 25 items, 5 blockers all "0 rendered while the endpoint is silent") + a fix loop, then five fixes by hand from the screenshots: fit-to-box camera with a bottom inset for the context panel, context panel open only on the comb (and never by default on a phone), six sector rows fit at 900px, active-sector stats as a 2x2 grid behind the mark instead of a ground tile, and the minimap pick reaching the context panel. **MERGED as trinity #895 = `4f06bddcf`** (2026-09-03 19:16Z) and **PUBLISHED**: apex `6b1b82041` (19:20Z), entry `index-uZ48wLf1.js`, chunk `Queen-C3eVNqWh.js` (107,527 B) carries `queen-shell`, `queen27-hud-top`, `queen27-hud-command`, `queen27-context`, `queen27-intel`, `queen27-minimap`, `fitInset` - grepped from the served file, not from dist | open items below: bee evolution stages, worktree reaper, `failure_kind` |

## Where things are

```
tri-27/docs/game/           13 studies + this file
tri-27/docs/game/prototypes 01-06 + README (geometry provenance, the defects found, per-pass timings)
BrowserOS  feat/queen-supervisor     a0df36cd5 routes (superseded by origin's merge of #99)
BrowserOS  fix/queen-public-cors-and-key  f03afa01a + 851d77008  -> PR #105
trinity    main 83b38287a            #894 comb merged and published (apex 1a39ad464)
trinity    feat/queen-command-screen  the one-screen HUD (clean clone at /tmp/trinity-comb)
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
