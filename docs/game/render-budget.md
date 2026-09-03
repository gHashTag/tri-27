# Does canvas2D survive the Mission-Control GAME brief?

Measured 2026-09-03 on this Mac. 50 timed browser runs, 5 bundle builds, 2 live network reads.
Every number below was produced today unless it is labelled as quoted from the committed docs.

---

## 0. The short answer

**Yes, canvas2D survives — at 2,794 bytes brotli for the entire game — but only if the psionic
glow is a cached sprite instead of `ctx.shadowBlur`. Written the naive way the close zoom runs at
17 fps.**

And the argument that decided the original study is dead. **`https://t27.ai/#/queen` already
downloads `three-C7rSOEFP.js`, 249,526 bytes encoded, and the Queen chunk itself imports it.**
The 43.7x byte advantage is not available on this page any more. canvas2D still wins, but on
different grounds: it meets the frame budget at every zoom level with 5x fill headroom, and it
draws text, which three.js cannot.

Two crossing points, both measured:

| axis | canvas2D breaks at |
| --- | --- |
| live `shadowBlur` glows per frame | **4** (3 is already stuttering, 2 is clean) |
| cached glow sprites per frame | **> 256** (still 8.3 ms p50, 2.4 ms CPU) |
| screen-fulls of gradient-filled alpha polygon per frame | **~34** (measured clean at 21.6, marginal at 43.1) |
| filled territories per frame | **~3,900** at a half-frame CPU budget (2,048 measured at 120 fps) |
| animated nodes per frame | **~16,000** at a half-frame CPU budget (9,600 measured at 120 fps) |

The design's closest zoom uses **6.68 screen-fulls of fill, 6 structures, 3 territories, 24 nodes,
32 bees.** That is 5.1x inside the fill ceiling and 40x inside the cached-glow ceiling.

---

## 1. Browser automation on this machine, established before measuring

Asked for first, so reported first.

| thing | state today |
| --- | --- |
| `mcp__browseros__*` | **ConnectionRefused** — "Unable to connect. Is the computer able to access the url?" |
| `mcp__browseros-neo__*` | **ConnectionRefused**, same error |
| `mcp__tri-mcp-browser__*` | **ENOENT** — `/Users/playra/tri-mcp/run-mcp.sh` does not exist |
| `mcp__claude-flow__*` | `-32000 Connection closed` |
| Playwright CLI | **present**, `/Users/playra/.bun/bin/playwright`, **version 1.60.0** |
| Playwright node module | `/Users/playra/.bun/install/global/node_modules/playwright` |
| Playwright browser cache | `~/Library/Caches/ms-playwright/` holds **chromium-1208** and **chromium_headless_shell-1208** |
| Playwright/browser mismatch | 1.60.0 wants **chromium-1223**; launching `chromium` fails with `Executable doesn't exist at .../chromium-1223/...` |
| Puppeteer | `~/.cache/puppeteer` **empty**; puppeteer not in the global npm list |
| chromedriver | not found |
| Google Chrome | `/Applications/Google Chrome.app`, **152.0.7977.66** |
| BrowserOS neo | `/Applications/BrowserOS neo.app`, **148.0.7988.97** |
| BrowserOS (old) | `/Applications/BrowserOS.app` |
| node / bun / deno | v22.22.0 / 1.3.12 / present |
| `brotli` | `/opt/homebrew/bin/brotli` |
| outbound `curl` | **blocked** — `curl https://t27.ai/` returns `http=000, bytes=0` |
| outbound from the launched browser | **works** — the browser reached `https://t27.ai/#/queen` |

**So I could drive a browser**, via `chromium.launch({ channel:'chrome' })`, which uses the
installed Chrome 152 rather than the missing chromium-1223. All frame numbers below are measured,
none are estimated.

The rig, read out of the page rather than off a spec sheet:

| property | measured |
| --- | --- |
| UA | `Chrome/152.0.0.0`, `Macintosh; Intel Mac OS X 10_15_7` |
| GPU | `ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro, Unspecified Version)` |
| logical cores | 8 |
| deviceScaleFactor | **2** (set on the Playwright context; `--force-device-scale-factor` alone gave DPR 1 and was discarded) |
| viewport | 1272 x 806 CSS px = **4,100,928 device px** |
| idle rAF | median **8.3 ms**, p95 9.3 ms, min 7.4 ms — **120 Hz, the budget is 8.33 ms** |
| WebGL2 / WebGPU | yes / **no** (`navigator.gpu` absent under Playwright; the committed study saw it present in BrowserOS neo) |

Same GPU, same core count, same DPR, same refresh rate as the machine in the committed benchmark.
Differences from it: Chrome 152 not 148, a clean profile with **no wallet extension** (the confound
the committed study could not remove), and no WebGPU.

Two harness bugs I hit and fixed rather than reported as engine behaviour: a `34*s` where `s` was
an object and not its scale, which produced `NaN` geometry and hung the renderer; and a
`page.goto` reuse pattern that closed the target. One browser per run now.

---

## 2. The scene I measured

The committed benchmark measured a **wireframe** — 150 dots, 1,872 line segments, no fill. The
brief now adds filled territories, four zoom levels, ornate close-zoom structures, per-node state
animation and evolving bees. I built exactly that, seeded with the same seed (20260903).

**The committed docs define no zoom ladder** — `viewport-layout.md` defines a *tab* set (SITUATION
/ BOARD / HQ / RESEARCH / SWARM), not zoom levels. So I defined one and I state it, rather than
implying it was already agreed:

| level | territories | fill / screen | nodes | arcs | structures | detail | bees | labels |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L0 CONSTELLATION | 64 | 0.93 | 150 | 40 | 0 | – | 8 | 8 |
| L1 REGION | 24 | 1.26 | 60 | 16 | 8 | 1 | 14 | 20 |
| L2 SITE | 8 | 2.69 | 24 | 8 | 16 | 2 (glow) | 24 | 24 |
| L3 STRUCTURE (Protoss close) | 3 | **6.68** | 24 | 6 | 6 | 3 (glow) | 32 | 24 |

Every territory is a 6–8 sided polygon, `createLinearGradient` gold→bronze / teal / violet,
alpha-pulsed, filled **and** stroked. Every structure is a hexagonal plinth with a linear gradient,
1–4 concentric rings with 6–24 rotating spokes each, an 8–10-gon floating crystal with a radial
gradient, four quadratic buttresses, and 8–16 psionic filaments. Bees have five evolution stages;
stage k adds thorax segments, wing pairs, a shield ring (k≥3) and six rotating spikes (k≥4).
`fill/screen` is analytic: Σ|polygon area| × DPR², divided by 4,100,928.

**I screenshotted every configuration.** A blank canvas benchmarks beautifully; these are not
blank. `/tmp/qgbench/shot_z_2_s_3.png` and `/tmp/qgbench/shot_z_2_s_3_cache_1.png` show filled
overlapping territories, 16 glowing ornate structures, bees at several evolution stages, node
labels reading `node-N <state> glm-5.3`, and three metric panels.

Sampling: 3 s of rAF per run, **first second discarded**, foregrounded window
(`page.bringToFront()`), one fresh browser per run. Reported: frame delta p50/p95/p99/max, count
of frames over 16.7 ms, and CPU ms measured inside my own `frame()`.

---

## 3. The four zoom levels, measured

### 3.1 Written the obvious way — `ctx.shadowBlur` for the psionic glow

| level | d50 | d95 | d99 | max | frames > 16.7 ms | CPU p50 | CPU p95 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L0 CONSTELLATION | **8.3** | 9.0 | 9.3 | 9.3 | 0 | 0.3 | 0.5 |
| L1 REGION | **8.3** | 9.1 | 9.3 | 9.3 | 0 | 0.3 | 0.5 |
| L2 SITE | **58.1** | 58.9 | **200.7** | 200.7 | 30 | 0.4 | 0.5 |
| L3 STRUCTURE | **24.5** | 25.4 | 25.8 | 25.8 | 72 | 0.3 | 0.4 |

L2 is **17 fps** with a 200.7 ms hitch. L3 is **41 fps**. Both miss the 8.33 ms budget by 3x–7x.

Note the shape of the failure: **CPU p50 stays at 0.3–0.4 ms while frames arrive 24–58 ms apart.**
My own JavaScript is not the problem. The work is in the rasterizer.

### 3.2 With the glow as a cached sprite

One offscreen canvas, blurred once at boot, `drawImage`'d with `globalCompositeOperation:'lighter'`.
Nothing else changed. Repeats: L0 x3, L1 x3, L2 x3, L3 x2.

| level | d50 (all repeats) | d95 | d99 | max | frames > 16.7 ms | CPU p50 | CPU p95 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L0 CONSTELLATION | 8.3 / 8.3 / 8.3 | 9.2 / 9.2 / 9.2 | 9.3–9.4 | 9.4 | **0 / 0 / 0** | 0.4 | 0.6–1.1 |
| L1 REGION | 8.3 / 8.3 / 8.3 | 9.2 / 9.2 / 9.2 | 9.3–9.4 | 9.4 | **0 / 0 / 0** | 0.3–0.4 | 0.5–0.8 |
| L2 SITE | 8.3 / 8.3 / 8.3 | 9.3 / 9.2 / 9.1 | 9.3–9.4 | 9.4 | **0 / 0 / 0** | 0.4–0.5 | 0.5–0.8 |
| L3 STRUCTURE | 8.3 / 8.3 | 9.1 / 9.1 | 9.3 | 9.4 | **0 / 0** | 0.4–0.5 | 0.8–1.1 |

**All four zoom levels at vsync, zero long frames, 0.3–0.5 ms of main-thread work.**

---

## 4. Where the 58 ms went — isolated, not guessed

Turning off one thing at a time at L2 (16 structures):

| variant | d50 | d95 | verdict |
| --- | --- | --- | --- |
| L2 as built | 58.1 | 58.9 | broken |
| L2, **`glow=0`** (identical geometry, no `shadowBlur`) | **8.3** | 9.3 | **fixed** |
| L2, `glow=0` **and `sdetail=3`** (max ornate detail, 4,731 path ops/frame) | **8.3** | 9.3 | **fixed** |
| L2, `struct=0` (no structures at all) | 8.3 | 9.3 | fixed |
| L2, `bees=0` (bees removed, glow kept) | 66.7 | 74.0 | still broken |
| L2, `terr=0` (all territory fill removed, glow kept) | 66.5 | 67.0 | still broken |
| L3, `glow=0` | **8.3** | 9.2 | **fixed** |

Removing the fill made it **worse**. Removing the bees made it **worse**. Removing the blur fixed
it completely — and raising ornate path detail to maximum with the blur off cost nothing.

**The cause is `ctx.shadowBlur`, and only `ctx.shadowBlur`.** Not fill rate, not path count, not
sprite count, not the ornateness the brief asks for.

### 4.1 How many live `shadowBlur` glows fit in 8.33 ms

Bisected:

| glowing structures | d50 | d95 | frames > 16.7 ms |
| --- | --- | --- | --- |
| 0 | 8.3 | 9.3 | 0 |
| 1 | 8.3 | 9.2 | 0 |
| 2 | **8.3** | **9.2** | 1 |
| **3** | 8.5 | **16.9** | **19** |
| 4 | 16.1 | 17.3 | 47 |
| 5 | 16.7 | 24.7 | 59 |
| 6 | 24.4 | 25.4 | 73 |
| 8 | 25.1 | 33.4 | 76 |
| 16 | 58.1 | 58.9 | 30 |

**The ceiling is 2. Three already stutters (p95 16.9 ms). Four is over the budget outright.**

The arithmetic: at 16 structures, (58.1 − 8.3) / 16 = **3.11 ms per glowing structure**; at 8,
(25.1 − 8.3) / 8 = 2.10 ms; at 4, (16.1 − 8.3) / 4 = 1.95 ms. Each structure at `sdetail=2` issues
**11 draw operations inside the shadow state** (plinth fill, plinth stroke, 3 ring strokes,
3 spoke strokes, crystal fill, buttress stroke, filament stroke), so the unit cost is
**~0.18–0.28 ms per blurred draw op** at `shadowBlur ≈ 18 CSS px`, DPR 2. An 8.33 ms budget buys
**about 30 blurred draw operations per frame** — which is 2 to 3 structures, exactly what the
bisection found.

### 4.2 How many cached glow sprites fit

| cached glow sprites | d50 | d95 | frames > 16.7 ms | CPU p50 | path ops/frame |
| --- | --- | --- | --- | --- | --- |
| 16 | 8.3 | 9.1 | 0 | 0.4 | 3,211 |
| 64 | 8.3 | 9.1 | 0 | 0.8 | 10,647 |
| 128 | 8.3 | 9.2 | 0 | 1.3 | 20,746 |
| **256** | **8.3** | **9.1** | **0** | **2.4** | **40,936** |
| 64, at L3's 6.68-screen fill | 8.3 | 9.3 | 0 | 1.0 | 16,790 |

**2 → more than 256. A 128x improvement in the ceiling, from one technique change, at a cost of
zero bytes** (the sprite is generated at boot from the same path code).

Marginal cost per cached structure: (2.4 − 0.4) / 256 = **7.8 µs**. At half the frame budget that
is **~530 fully ornate glowing structures on screen at once.**

Fidelity caveat, stated because it is a real difference: one pre-blurred sprite scaled to each
structure is not pixel-identical to a per-structure `shadowBlur` — the halo scales with the
structure instead of holding a constant blur radius, and it is visibly larger in
`shot_z_2_s_3_cache_1.png` than in `shot_z_2_s_3.png`. Restoring exact parity needs one sprite per
(colour, radius) bucket: 3 classes x 3 buckets = 9 sprites at 512x512 RGBA = **9.4 MB of texture
memory**, generated once. I did not measure the 9-sprite version.

---

## 5. Fill rate, which is what "filled coloured territories" actually costs

Territory fill area multiplied 1x → 64x, glow off, everything else identical:

| overdraw | device px filled/frame | d50 | d95 | frames > 16.7 ms | CPU p50 |
| --- | --- | --- | --- | --- | --- |
| 2.69 screens (L2 as designed) | 11,051,549 | 8.3 | 9.3 | 0 | 0.4 |
| 5.39 | 22,103,098 | 8.3 | 9.3 | 0 | 0.6 |
| 10.78 | 44,206,195 | 8.3 | 9.2 | 0 | 0.5 |
| **21.56** | **88,412,391** | **8.3** | **9.0** | **0** | 0.7 |
| **43.12** | **176,824,782** | **9.1** | **17.2** | **30** | 0.6 |
| 86.24 | 353,649,563 | 23.5 | 30.3 | 78 | 0.6 |
| 172.47 | 707,299,127 | 43.6 | 50.8 | 47 | 0.9 |

**Clean at 21.6 screen-fulls. Marginal at 43.1. Broken at 86.**

Throughput, from the three points that are not vsync-clamped:
176.8 Mpx / 9.1 ms = 19.4 Gpx/s; 353.6 / 23.5 = 15.0; 707.3 / 43.6 = 16.2. Mean **~16.9 Gpx/s** of
gradient-filled, alpha-blended, stroked polygon.

Therefore the budget is 8.33 ms x 16.9 Gpx/s = **~141 Mpx per frame = 34.3 screen-fulls** at
1272x806 DPR 2. The observed break lies between 21.6 (clean) and 43.1 (marginal). **The arithmetic
and the measurement agree**, which is the only reason I trust either.

**L3, the closest zoom, draws 27,381,403 px = 6.68 screens. Headroom: 5.1x.**

---

## 6. Count sweeps: territories and nodes

Territory **count** at roughly constant total fill area (each territory shrinks as count rises), so
this isolates path and draw-call cost from fill rate:

| territories | fill/screen | d50 | d95 | CPU p50 | CPU p95 | path ops/frame |
| --- | --- | --- | --- | --- | --- | --- |
| 64 | 0.93 | 8.3 | 9.0 | 0.3 | 0.5 | 1,766 |
| 128 | 1.00 | 8.3 | 9.3 | 0.4 | 0.6 | 2,211 |
| 256 | 1.03 | 8.3 | 9.0 | 0.5 | 0.7 | 3,081 |
| 512 | 1.08 | 8.3 | 9.3 | 0.8 | 1.0 | 4,894 |
| 1,024 | 1.08 | 8.3 | 9.0 | 1.3 | 1.5 | 8,462 |
| **2,048** | 1.12 | **8.3** | **9.2** | **2.5** | 4.0 | 15,589 |

2,048 gradient-filled, stroked, alpha-pulsed territories at 120 fps. Marginal cost
(2.5 − 0.3) / 2048 = **1.07 µs per territory**; a half-frame CPU budget gives **~3,900 territories**.

Node count, with per-node state animation (four states, pulse frequency varying by state, state-3
nodes carry a second stroked ring):

| nodes | d50 | d95 | CPU p50 | CPU p95 |
| --- | --- | --- | --- | --- |
| 150 | 8.3 | 9.0 | 0.3 | 0.5 |
| 600 | 8.3 | 9.0 | 0.6 | 0.9 |
| 1,200 | 8.3 | 9.3 | 0.6 | 0.8 |
| 2,400 | 8.3 | 9.1 | 0.9 | 1.1 |
| 4,800 | 8.3 | 9.2 | 1.6 | 1.7 |
| **9,600** | **8.3** | **9.1** | **2.6** | 2.8 |

**0.24 µs per animated node**; half-frame budget → **~16,000 nodes**.

**This is not comparable to the committed study's canvas2D 55.9 fps at n=9,600**, and I will not
pretend it is. Their n=9,600 case also scaled arcs to 2,560 and line segments to 62,352 and
re-projected every one of them through a rotating 3D transform in JavaScript. Mine holds arcs at 40
and draws in 2D. Different axis, different number. What my sweep establishes is narrower and still
useful: **2D dot count with per-node animation is not what breaks this scene.**

---

## 7. The two byte claims, rebuilt from scratch

Tooling: `bun 1.3.12`, `bun build --minify --target=browser`, `brotli -q 11`.

### 7.1 three.js r185 tree-shaken — CLAIM CONFIRMED

Fresh `bun add three@0.185.1` (verified `0.185.1` in the installed package.json), one entry file
importing ten named symbols (`WebGLRenderer, Scene, PerspectiveCamera, Group, BufferGeometry,
Float32BufferAttribute, LineBasicMaterial, LineSegments, PointsMaterial, Points`) and building the
1,872-segment scene.

| | committed doc | measured today | delta |
| --- | --- | --- | --- |
| raw | 528,143 | **528,330** | +187 (+0.04%) |
| gzip -9 | 132,086 | **132,173** | +87 (+0.07%) |
| **brotli -q 11** | **109,407** | **109,287** | **−120 (−0.11%)** |

**Reproduced.** The 0.11% is my entry file's own body differing from theirs; the claim stands.

### 7.2 canvas2D 2,506 bytes — NOT reproduced exactly; their number is conservative

The original harness is gone — `/tmp/enginebench` and `/tmp/enginebundle` did not survive, exactly
as their §2.3 warned. So I re-implemented the described scene from the spec: Fibonacci-sphere 150
nodes, 40 arcs x 24 lifted great-circle segments with pulse markers, 12 meridians + 7 parallels x 48
= 912 wireframe segments (**1,872 total, arithmetic checked**), Y rotation, depth-scaled projection,
back-face culling, a second overlay canvas with per-node labels and 3 panels x 10 rows x 10 bars,
DPR handling and a resize path.

| | committed doc | my re-implementation |
| --- | --- | --- |
| raw | 5,992 | **3,010** |
| gzip -9 | 2,857 | **1,435** |
| brotli -q 11 | **2,506** | **1,294** |

I get **1,294 bytes, 1.94x smaller than their 2,506.** I cannot call this a reproduction — it is a
different implementation of the same specification, and theirs plainly carried more (their harness
had engine-switching plumbing and richer panels). **The direction of the claim is confirmed and
their number is if anything an over-estimate of canvas2D's cost.** Ratio to three.js:
109,287 / 2,506 = 43.6x using their number, 84.5x using mine.

### 7.3 The number that actually matters now — the GAME, not the wireframe

The whole thing the user asked for — filled gradient territories, four zoom presets, ornate Protoss
structures with cached glow, five-stage evolving bees, per-node state animation, labels and panels —
stripped of benchmark instrumentation and built the same way:

| | raw | gzip -9 | **brotli -q 11** |
| --- | --- | --- | --- |
| **the full game scene** | 7,794 | 3,159 | **2,794** |
| minimal WebGL2 close-view renderer (§9) | 2,267 | 1,131 | **1,019** |
| the two concatenated | 10,061 | – | **3,765** |
| three.js r185, 10 imports | 528,330 | 132,173 | **109,287** |

**Everything the brief adds to the committed benchmark's scene costs 288 bytes brotli**
(2,794 − 2,506). Filled territories, four zoom levels, ornate crystalline geometry, evolving bees,
psionic glow: 288 bytes.

---

## 8. The fact that changes the decision: three.js is already on that page

`curl` is blocked from this shell, but the launched browser reached the network. Live reads:

**`https://t27.ai/#/queen` — six JavaScript requests, encoded bytes from the response headers:**

| chunk | encoded bytes |
| --- | --- |
| `router-BHJoP3Ih.js` | 13,139 |
| `index-Dv6Ogf4x.js` | 88,247 |
| `react-Be6y7_DR.js` | 66,069 |
| `motion-CsGAkEsf.js` | 40,325 |
| **`three-C7rSOEFP.js`** | **249,526** (918,770 decoded) |
| `Queen-CXq47Md-.js` | 20,204 (60,188 decoded) |
| **total** | **477,510** |

I then read the chunk sources and extracted their import specifiers:

- **`Queen-CXq47Md-.js` imports `./three-C7rSOEFP.js` directly.** Not a shared vendor chunk it
  happens to sit next to — the Queen route's own chunk pulls it in.
- `index-Dv6Ogf4x.js` also imports it, so it is on the eager path for the whole site.
- The three chunk contains React-Three-Fiber (`react-three` / `useFrame` / `reconciler` all match).
- **`Queen-CXq47Md-.js` contains no `getContext('2d')`.** The live Queen page uses no canvas2D today.

**This overturns §9 of the committed benchmark**, which concluded: "`https://t27.ai/queen/hq`
redirects to `https://t27.ai/#/`… There is no Queen route on that host… three.js's 'already
bundled, so free' advantage does not transfer to the page the operator is looking at." That was
measured against `/queen/hq`, a Hono route. **`/#/queen` is a different URL, it exists, it is the
SPA, and it already ships 249,526 bytes of three.js + R3F.** The committed doc listed this exact
scenario as change-condition #4 — "The page moving into the t27.ai React SPA… the 43.7x argument
would collapse." It has moved. It has collapsed.

### 8.1 Two corrections to the brief's own premises

- **"trinity's Queen.tsx is 1787 lines."** In `/Users/playra/trinity` on `main` it is **361 lines
  / 16,536 bytes, dated Aug 22**. The 1,790-line, 65,246-byte version is in the worktree
  `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game` on branch
  **`feat/queen-game-cabinet`**. The big Queen page is the other agent's unmerged work, not `main`.
- **The local build has no three.js in it at all.** `/Users/playra/trinity/apps/website/dist` (Sep 1
  18:19, newer than every `.tsx` in `src`, so current for `main`) has **66 asset files and zero**
  containing `BufferGeometry`, `PerspectiveCamera`, `OrbitControls`, `__THREE__` or `react-three`.
  Its `Queen-B8LSua0S.js` is 10,948 bytes. The five components that `import * as THREE`
  (`biology3d/DnaHelix3D`, `cosmos3d/UniverseExpansion3D`, `molecule3d/MoleculeViewer3D`,
  `molecule3d/TemporalMoleculeViewer`, `neuro3d/BrainConnectivity3D`) are **referenced by no route
  and are tree-shaken out entirely**. So `three ^0.183.2` sits in `package.json` producing zero
  bytes locally, while the **deployed** build ships 249,526 of it on the Queen route. The deployed
  artifact is not built from local `main`.

### 8.2 What the other agent's worktree already builds

Read, so as not to duplicate: `apps/website/src/pages/Queen.tsx` (1,790 lines),
`src/components/QueenFactory.tsx` (338), the new `src/components/queenWorkerHangarModel.ts` (107)
and `qa/queen-game-cabinet-contract.mjs` (92). The uncommitted diff is small — **20 insertions
across `package.json`, `QueenFactory.tsx` and `Queen.tsx`** — with the two new files untracked.
That is a worker-hangar model plus a QA contract, not a renderer. **Nothing in it conflicts with
this study's subject**, and none of it is a canvas or WebGL scene.

---

## 9. The third option, costed

**canvas2D for L0/L1, WebGL only for L2/L3, switched at a zoom threshold.**

I wrote the WebGL half rather than guessing at it: a WebGL2 renderer sized for exactly the close
view — one shader pair, one VAO, one dynamic interleaved vertex buffer (position, uv, rgba), a
sprite atlas with mipmaps, `SRC_ALPHA`/`ONE` additive blending for the psionic halos and
`ONE_MINUS_SRC_ALPHA` for the plinths, plus viewport/DPR and clear.

**Bytes:** 2,267 raw / 1,131 gzip / **1,019 brotli**. Combined with the canvas2D game:
**3,765 bytes brotli**, i.e. **+971 bytes (+34.8%)** over canvas2D alone. Against the three.js
alternative for the same job it is **107x smaller**. If the WebGL half were three.js instead of
hand-written it would be **+109,287 brotli**, or **+0 on the live page today**, since the chunk is
already downloaded there.

**Complexity, itemised — this is the real price, not the 971 bytes:**

1. Two renderers to keep visually identical. The same territory must be the same gold in a canvas2D
   `createLinearGradient` and in a GL fragment shader, through two different colour pipelines.
2. Two coordinate systems and two DPR/resize paths. GL is `gl.viewport` in device pixels with a
   flipped Y; canvas2D is `setTransform(dpr,...)` in CSS pixels.
3. Two hit-testing paths. canvas2D picking is `isPointInPath`; GL picking needs a colour-ID pass or
   a CPU-side spatial index you now maintain twice.
4. A visible seam at the threshold. Context creation, shader compile and atlas upload happen on the
   frame the user crosses the boundary — the one frame they are most likely to be looking at. It
   needs pre-warming at L1 and a crossfade, both of which are code.
5. A `webglcontextlost` handler with a canvas2D fallback, which the pure-canvas2D build does not
   need. The committed study's §7 measured that three.js and PlayCanvas **fail outright** without
   WebGL2; canvas2D "never asks".
6. Text stays on a canvas2D overlay regardless — GL has no `fillText` — so the hybrid does not even
   remove the 2D surface. You end up with three surfaces.
7. Two sets of animation state to keep in sync across the switch, or the bees teleport at the
   threshold.

**Verdict on option 3: correct engineering, unnecessary today.** It exists to solve the close-zoom
glow problem, and the cached sprite already solves that problem for **0 bytes** and holds **256
glowing ornate structures** where the hybrid would be needed at **4**. Build it if and when a
measurement — not a guess — shows the close view exceeding ~141 Mpx of fill per frame or ~500
ornate structures. The 1,019 bytes are cheap; items 1–7 are not.

---

## 10. The decision, with its conditions as numbers

**Keep hand-written canvas2D. Rewrite the justification.**

The committed verdict's *deciding number* — 2,506 vs 109,407 brotli, 43.7x — **no longer applies to
this page**, because `t27.ai/#/queen` already downloads 249,526 bytes of three.js and the Queen
chunk imports it. On that page the marginal byte cost of three.js is **zero**. Anyone re-arguing
the engine choice from the 43.7x figure is arguing from a fact that has expired.

The verdict survives on three grounds that were measured today:

1. **It meets the budget at every zoom level the brief asks for.** 8.3 ms p50, 9.1–9.2 ms p95,
   **zero frames over 16.7 ms**, 0.3–0.5 ms CPU, across L0/L1/L2/L3 and repeats.
2. **It is 2,794 bytes**, and the entire Protoss/territory/evolving-bee brief costs **288 bytes**
   on top of the committed wireframe figure.
3. **Text.** three.js has no `fillText`. The 2D overlay is in the design regardless, at a cost the
   committed study measured at 0.2 ms for ~75 labels. Bringing three.js does not remove a surface.

**Take three.js instead when — and only when — one of these numbers is crossed:**

| condition | threshold | measured basis | where the design sits |
| --- | --- | --- | --- |
| **Fill area per frame** | **> ~141 Mpx (≈34 screen-fulls)** at 1272x806 DPR 2 | 16.9 Gpx/s measured over three non-vsync-clamped points; clean at 21.6 screens, marginal at 43.1 | L3 uses 27.4 Mpx = 6.68 screens. **5.1x headroom** |
| **Cached glow sprites / ornate structures** | **> ~530** at a half-frame CPU budget | 256 measured clean at 2.4 ms CPU; 7.8 µs each | L3 uses 6. **88x headroom** |
| **Live `ctx.shadowBlur` glows** | **4** — already broken | bisected 0…16; 2 clean, 3 stutters, 4 = 16.1 ms | **do not write it this way** |
| **Filled territories** | **> ~3,900** | 2,048 measured at 120 fps, 2.5 ms CPU; 1.07 µs each | L0 uses 64. **60x headroom** |
| **Animated nodes** | **> ~16,000** | 9,600 measured at 120 fps, 2.6 ms CPU; 0.24 µs each | L0 uses 150. **107x headroom** |
| A genuinely 3D globe with depth-correct occlusion and a perspective camera | qualitative | unchanged from the committed study | not asked for by this brief |

The community network would need **thousands of simultaneously visible contributed machines**, or a
close view five times more densely filled than the one I built, before any of these is crossed.
The Queen currently reports **43 dispatches, 0 running, 4 provider keys**.

**The one hard rule this study produces:** *never call `ctx.shadowBlur` inside the render loop.*
It is the single thing that turns a 120 fps scene into a 17 fps scene, it is invisible in CPU
profiling (0.4 ms while frames arrive 58 ms apart), and it is exactly the API a developer reaches
for when told "Protoss psionic energy glow". Pre-blur to an offscreen canvas at boot; `drawImage`
in the loop.

---

## 11. What I did not measure

- **One machine, one browser, one refresh rate.** M1 Pro, Chrome 152, 120 Hz, DPR 2. No Firefox,
  no Safari, no Windows, no integrated GPU, no 60 Hz panel. On a 60 Hz machine the budget doubles
  to 16.7 ms and the live-`shadowBlur` ceiling roughly doubles to 5–6 structures — **predicted, not
  measured.**
- **No WebGPU.** `navigator.gpu` was absent under Playwright although the committed study saw it in
  BrowserOS neo. I did not investigate why, and no WebGPU path was written.
- **I did not implement L3 in three.js**, so I have no direct three.js frame number for the Protoss
  close view. I did not need one: canvas2D never missed the budget there, so there was no deficit
  for three.js to close. If canvas2D had failed after the cache fix, that measurement would be the
  next step.
- **The 9-sprite exact-parity glow atlas** (§4.2) was not built or measured; only the single scaled
  sprite was.
- **The committed 2,506-byte canvas2D figure was not reproduced**, only bounded from below at 1,294
  by an independent implementation. Their source is gone.
- **CPU ms is recording cost, not total cost.** Chrome records 2D canvas commands on the main
  thread and rasterizes elsewhere — which is precisely why the `shadowBlur` failure showed up as
  58 ms frame deltas at 0.4 ms CPU. Frame delta is the metric I ranked on throughout.
- **My node-count sweep is not the committed study's node-count sweep** (§6), and their canvas2D
  55.9 fps at n=9,600 is neither confirmed nor contradicted here.
- **Nothing about the running supervisor was verified.** The $10 cap, the 43 dispatches, the three
  404 endpoints (`/queen/public-research`, `/queen/public-hardware`, `/queen/public-activity`) came
  with the brief. Nothing above depends on them — though it is worth saying plainly that **a map
  with no data source renders at 120 fps and shows nothing**, and the renderer was never the
  blocker for those three tabs.

---

## 12. Reproducing this

Everything is under `/tmp` (5.8 MB after cleanup; `node_modules` and surplus screenshots removed).

- `/tmp/qgbench/site/scene.js` — seeded generators (seed 20260903): territories, nodes, arcs,
  structures, bees; `polyArea` for the analytic fill count.
- `/tmp/qgbench/site/bench.js` — the four zoom presets, the draw code, the instrumented rAF loop.
  Query string: `?z=0..3&glow=0|1&cache=0|1&s=<sec>&terr=&nodes=&arcs=&struct=&bees=&fillmul=&sdetail=&overlay=0|1`.
  Result lands on `window.__BENCH__` with `window.__DONE__`.
- `/tmp/qgbench/run.mjs` — Playwright driver. **One fresh browser per run**, `channel:'chrome'`
  (chromium-1223 is missing), `deviceScaleFactor: 2`, `bringToFront()`, poll for `__DONE__`.
- `/tmp/qgbench/ALL.json` — all 50 runs.
- `/tmp/qgbench/shot_z_2_s_3.png`, `shot_z_2_s_3_cache_1.png` — proof the scene is not blank.
- `/tmp/qgbytes/` — `three_entry.js` / `three_out.js` (528,330 B), `c2d_globe.js` / `c2d_out.js`,
  `game_entry.js` / `game_out.js`, `gl_entry.js` / `gl_out.js`.
- Serve with `python3 -m http.server 8941 --bind 127.0.0.1` from `/tmp/qgbench/site` (stopped).

Traps that cost me a round trip each, so the next person does not pay them again: a `NaN` in the
geometry hangs the renderer rather than throwing; reusing one Playwright page across runs closes
the target; `--force-device-scale-factor=2` does **not** give DPR 2 when a viewport is set — use
`deviceScaleFactor` on the context, and DPR 2 versus 1 is a **4x** difference in every fill-rate
number on this page.
