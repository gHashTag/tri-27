# Study 1: which browser engine for the Proof-of-Compute situation room

Decided by measurement on 2026-09-03. Every number below was produced by a run
I made on this machine, on this day. Where I could not measure, the sentence
says so.

Scope: the rendering engine for a Mission-Control style page - a rotating globe
of contributed compute nodes (CPU / FPGA / GPU), arcs between them, crisp text
labels, and slow-changing panels drawn on top. Not a particle demo.

---

## 0. The short answer

**Use no engine. Hand-written canvas2D.**

The number that decides it: **2,506 bytes brotli** for the whole scene
implementation versus **109,407 bytes brotli** for the smallest engine that can
draw the same thing (three.js r185, tree-shaken to ten named imports). That is
**43.7x** the transfer, bought for a scene in which canvas2D never missed a
single 8.33 ms frame across three runs of ~240 frames each.

Runner-up: **three.js r185**. Take it the day the globe has to become a real 3D
globe - lit, textured, depth-correct - or the day node count goes past a few
thousand. See section 8 for the exact conditions.

Do not take PlayCanvas. It was the only candidate that visibly stuttered at the
real scene size.

---

## 1. The machine, measured

Read from the page, not from a spec sheet:

| Property | Measured value |
| --- | --- |
| Browser | Chrome 148.0.0.0 (BrowserOS neo), reported UA `Macintosh; Intel Mac OS X 10_15_7` |
| GPU | `ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro, Unspecified Version)` |
| Logical cores | 8 |
| devicePixelRatio | 2 |
| Viewport | 1272 x 806 CSS px (2544 x 1612 device px) |
| Screen | 1512 x 982 |
| WebGL1 / WebGL2 / WebGPU | yes / yes / yes (`navigator.gpu` present) |
| Idle rAF interval | median 8.3 ms, p95 9.2 ms, min 6.4 ms |

**The display is 120 Hz.** The frame budget on this machine is 8.33 ms, not
16.7 ms. Every "120 fps" below means "hit vsync"; it is a ceiling, not a score.

Two confounds I did not remove, constant across all runs: a wallet extension
injects a content script into every page (it emits `MaxListenersExceeded`
warnings), and the tab had to be foregrounded because Chrome throttles
`requestAnimationFrame` in background tabs to ~1 Hz. My first measurement run
was ruined by exactly that and was discarded.

---

## 2. Method

I did not compare vendor demos against each other. Vendor demos render
different scenes, so a frame time from one says nothing about another. Instead I
wrote **one harness that renders the identical scene in all seven candidates**
and measured that. Vendor demos are reported separately in section 7 as
sanity checks only.

### 2.1 The scene, identical in every candidate

Deterministic (seeded PRNG, seed 20260903), so every engine draws the same
geometry in the same places:

- **150 nodes** on a Fibonacci sphere, three classes (CPU / FPGA / GPU), varying
  radius, drawn as dots.
- **40 arcs**, each 24 segments of a lifted great-circle path between two nodes,
  each carrying one moving pulse marker.
- **Globe wireframe**: 12 meridians + 7 parallels x 48 segments = **912
  segments**. With the arcs: **1,872 line segments** per frame.
- Globe rotates about Y at 0.25 rad/s.
- **An identical 2D overlay canvas in every variant**, redrawn every frame:
  a text label for every front-facing node (~75 of 150 at any instant) plus 3
  panels containing 30 text rows and 30 animated bars.

Putting labels and panels in the same overlay for all seven candidates is
deliberate. It means the measured difference between engines is the *scene*
cost only, and text crispness is identical by construction. Section 6 measures
the overlay on its own.

Screenshots confirmed each variant actually draws the scene - a benchmark of a
blank canvas is the classic way to get a beautiful wrong number. three.js,
canvas2D and retained-mode PlayCanvas were visually verified; the last draws
nodes as small crosses rather than filled dots, noted as a fidelity difference.

### 2.2 Sampling

Per run: 3 seconds of `requestAnimationFrame` (~360 frames at 120 Hz), **first
second discarded as warmup**, percentiles computed over the rest. Three repeats
per candidate. Two quantities recorded per frame:

- **frame delta** - wall time between rAF callbacks. This is what a player
  feels. Reported as p05 / p50 / p95 / p99 / max, plus a count of frames over
  16.7 ms.
- **CPU ms** - time spent inside my own `render()` + overlay call. This is the
  headroom number: at vsync every candidate shows 8.3 ms deltas, so the delta
  alone cannot rank them.

On the brief's "5th-percentile frame time": the 5th percentile of frame *time*
is the fastest frame, which hides stutter. I report it, but the stutter metric I
rank on is the **95th-percentile frame time**, which is the same thing as the
5th-percentile frame rate.

### 2.3 Candidate list and version

All seven were measured. None was dropped.

| Candidate | Version | Implementation shape |
| --- | --- | --- |
| canvas2D, no engine | - | immediate: CPU projects and re-emits every vertex per frame |
| raw WebGL2, no engine | - | retained: static VBOs, rotation matrix uniform, `LINES` + `POINTS` |
| three.js | 0.185.1 (r185) | retained: `LineSegments` + `Points`, rotate a `Group` |
| PixiJS | 8.20.1 | immediate: `Graphics` cleared and rebuilt per frame + 150 batched `Sprite` |
| Phaser | 3.90.0 | immediate: `Graphics` rebuilt per frame + 150 `Image`, manual `game.step()` |
| Babylon.js | 9.23.0 | retained: `CreateLineSystem` + thin instances, rotate a `TransformNode` |
| PlayCanvas | 2.21.4 | measured **twice**: immediate (`app.drawLines`) and retained (`pc.Mesh` + rotating entity) |

Phaser 4.2.1 exists and is the current `latest` on npm; I measured its transfer
size but ran the frame benchmark on Phaser 3.90.0, because 3.x is the version
with the API this scene maps onto. That is a gap.

Harness location as of this writing: `/tmp/enginebench/index.html` and
`/tmp/enginebench/bench.js`, served by `python3 -m http.server 8931`; the bundle
project is `/tmp/enginebundle`. These are temporary paths and will not survive a
reboot. Section 9 has enough to rebuild them.

---

## 3. Result at the real scene size (150 nodes, 40 arcs, 1,872 line segments)

Three repeats each. The overlay is ON, exactly as the product would run.

**Every candidate held 120 fps. p50 frame time was 8.3 ms for all seven.** So the
ranking is by CPU headroom and by dropped frames.

| Candidate | CPU p50 (ms) | CPU p95 (ms) | frame p95 (ms) | frame p99 (ms) | frames > 16.7 ms (per 3 s) |
| --- | --- | --- | --- | --- | --- |
| raw WebGL2 | 0.2 / 0.2 / 0.2 | 0.5 / 0.5 / 0.5 | 9.2 / 9.3 / 9.3 | 9.5 / 9.8 / 10.0 | 0 / 0 / 0 |
| canvas2D | 0.3 / 0.4 / 0.4 | 0.7 / 0.7 / 1.1 | 9.2 / 9.1 / 9.3 | 9.7 / 9.3 / 12.3 | 0 / 0 / 0 |
| three.js r185 | 0.3 / 0.4 / 0.4 | 0.7 / 0.8 / 0.7 | 9.2 / 9.4 / 9.2 | 10.2 / 15.5 / 9.4 | 0 / 1 / 0 |
| Phaser 3.90 | 0.6 / 0.6 / 0.6 | 1.2 / 1.2 / 1.4 | 9.2 / 9.2 / 9.2 | 9.8 / 13.6 / 9.8 | 0 / 0 / 0 |
| PlayCanvas 2.21 (retained) | 0.7 / 0.6 / 0.7 | 2.0 / 2.2 / 3.2 | **12.1 / 14.5 / 16.6** | 17.2 / 22.2 / 22.2 | **3 / 5 / 10** |
| Babylon 9.23 | 0.9 / 0.7 / 0.8 | 1.9 / 1.3 / 1.3 | 9.3 / 9.2 / 9.3 | 15.2 / 9.3 / 9.5 | 1 / 0 / 0 |
| PixiJS 8.20 | 1.9 / 2.0 / 2.1 | 3.2 / 3.0 / 2.5 | 9.5 / 9.3 / 9.2 | 13.4 / 9.6 / 9.4 | 2 / 0 / 0 |

5th-percentile frame time (the *fastest* 5%), from the first pass at this size:
canvas2D 6.7, raw WebGL2 6.5, three 6.6, PlayCanvas 7.1, Pixi 7.4, Phaser 7.4,
Babylon 7.4 ms. It separates nothing and is included only because it was asked
for.

### The PlayCanvas stutter is real and is not the overlay

I suspected the two-canvas composite. It is not that. Same scene, overlay
disabled, three more runs:

| PlayCanvas retained, n=150 | frame p95 | frame p99 | frames > 16.7 ms | CPU p95 |
| --- | --- | --- | --- | --- |
| overlay OFF | 12.1 / 10.5 / 11.3 | 17.3 / 15.3 / 17.7 | 3 / 1 / 3 | 2.2 / 0.8 / 1.6 |
| overlay ON | 10.6 / 10.8 / 16.6 | 13.8 / 16.6 / 26.8 | 2 / 2 / 9 | 1.7 / 1.7 / 0.9 |

Its main-thread work stays under 2.2 ms while frames arrive 12-17 ms apart. The
jitter is inside PlayCanvas's own frame pipeline, not in my code. Every other
candidate ran the same scene with 0 or 1 long frames. Pixi's immediate-mode
PlayCanvas twin behaved similarly (p99 13.2 ms, max 27.2 ms, 3 long frames in
one run).

---

## 4. Headroom: where each one breaks

Same scene scaled 64x: **n = 9,600 nodes, 2,560 arcs, 62,352 line segments**.
Overlay disabled so this isolates the engine. 3 s runs.

| Candidate | fps (from p50) | p50 (ms) | p95 (ms) | p99 (ms) | max (ms) | CPU p50 (ms) |
| --- | --- | --- | --- | --- | --- | --- |
| three.js r185 | 120.5 | 8.3 | 9.3 | 9.5 | 11.0 | 0.6 |
| Babylon 9.23 | 120.5 | 8.3 | 9.3 | 9.4 | 11.0 | 2.3 |
| PlayCanvas (retained) | 120.5 | 8.3 | 9.3 | 9.5 | 9.7 | 1.4 |
| raw WebGL2 | 119.0 | 8.4 | 9.3 | 11.3 | 15.7 | 0.4 |
| Phaser 3.90 | 83.3 | 12.0 | 13.6 | 18.0 | 28.5 | 11.6 |
| PlayCanvas (immediate) | 74.1 | 13.5 | 22.3 | 36.6 | 48.9 | 13.0 |
| **canvas2D** | **55.9** | **17.9** | **21.2** | **22.0** | **73.9** | **10.3** |
| PixiJS 8.20 | 15.9 | 62.7 | 91.2 | 198.7 | 198.7 | 62.1 |

An intermediate point, overlay ON, **n = 1,200** (320 arcs, 8,592 line
segments): canvas2D 120.5 fps, CPU p50 1.6 ms, p95 frame 9.2 ms, zero long
frames. Raw WebGL2 the same at 0.8 ms CPU.

So canvas2D's measured envelope on this machine is: **comfortable at 1,200
nodes, broken at 9,600**. I did not bisect the crossover; the honest statement
is that it lies somewhere between those two. The design target is 50-200 nodes,
which is 6x to 24x inside the last point I measured as clean.

**Read this table as a measurement of implementation shape, not of brand.** The
three fastest are the three that put static geometry in GPU buffers and rotate a
scene node. The four slowest re-emit every vertex from JavaScript each frame.
PlayCanvas appears in both halves because I wrote it both ways: 74.1 fps
immediate, 120.5 fps retained, same engine, same scene. Pixi's and Phaser's
numbers could be improved the same way, by writing a custom mesh with a
persistent vertex buffer - at which point you are hand-writing WebGL inside an
engine and paying its bundle for the privilege.

---

## 5. Transfer size

### 5.1 Prebuilt files off the CDN, measured over the wire

`fetch()` with a cache-busting query and `cache: 'no-store'` against
cdn.jsdelivr.net; bytes from `PerformanceResourceTiming.encodedBodySize`, which
is the post-brotli count the user actually pays.

| Package | encoded (br) | decoded | fetch (ms, this connection) |
| --- | --- | --- | --- |
| three 0.185.1 (`three.module.min.js` + `three.core.min.js`) | **188,401** | 750,938 | 267 |
| pixi.js 8.20.1 (`pixi.min.mjs`) | 224,610 | 819,517 | 140 |
| phaser 3.90.0 | 320,588 | 1,196,122 | 192 |
| phaser 4.2.1 | 358,725 | 1,375,976 | 226 |
| playcanvas 2.21.4 | 594,823 | 2,373,408 | 1,069 |
| babylonjs 9.23.0 (UMD) | 1,619,555 | 8,291,835 | 1,585 |

The fetch times are one sample each on one connection and should not be quoted
as a property of the CDN.

### 5.2 Tree-shaken to the minimum this scene needs

For each engine I wrote an entry file importing only the symbols the globe scene
uses, bundled with `bun build --minify --target=browser` (bun 1.3.12), then
compressed with `brotli -q 11`. **Every bundle was then loaded in the browser
and its `boot()` called; all five booted without error**, so these are sizes of
working code, not of code that tree-shaking broke.

| Bundle | raw | gzip -9 | brotli -q 11 |
| --- | --- | --- | --- |
| **no engine, canvas2D only** | 5,992 | 2,857 | **2,506** |
| **no engine, canvas2D + raw WebGL2** | 9,005 | 4,000 | **3,539** |
| three.js (10 named imports) | 528,143 | 132,086 | **109,407** |
| pixi.js (`Application, Graphics, Sprite, Texture`) | 510,285 | 148,296 | 121,561 |
| playcanvas | 1,220,409 | 318,752 | 236,311 |
| @babylonjs/core (deep selective imports) | 1,499,355 | 343,541 | 263,385 |
| phaser 3.90.0 | 1,226,172 | 331,463 | 265,198 |

Two things worth carrying forward. Babylon's selective ES imports cut it from
1,619,555 to 263,385 bytes - **6.2x** - so anyone quoting Babylon's UMD size is
quoting the wrong number. And three.js tree-shaken (109,407) is *smaller* than
three.js prebuilt (188,401), so the build step pays for itself if you take
three.

The no-engine bundles are the actual scene code from the harness (scene
generation, projection, canvas2D drawing, labels, panels) put through the same
minifier and compressor. They are not a strawman "hello world".

---

## 6. The overlay: text and panels cost almost nothing

Scene disabled, only the label + panel overlay running, 3 s runs at 120 Hz:

| labels drawn per frame | CPU p50 (ms) | CPU p95 (ms) | frame p50 | fps |
| --- | --- | --- | --- | --- |
| 0 (3 panels, 30 rows, 30 bars only) | 0.1 | 0.3 | 8.3 | 120.5 |
| ~75 (n=150, the product scene) | 0.2 | 0.5 | 8.3 | 120.5 |
| ~300 (n=600) | 0.4 | 0.9 | 8.3 | 120.5 |
| ~600 (n=1,200) | 1.0 | 1.3 | 8.3 | 120.5 |

`fillText` at DPR 2 gives crisp, hinted, selectable-looking text for free and it
costs 0.2 ms at the product's label count. This matters for the engine choice
more than it looks: **three.js has no text.** Any 3D engine forces you either
into a DOM overlay, or into sprite/SDF text that blurs under rotation and at
DPR 2. The overlay is therefore in the design regardless of engine - which
removes one of the reasons to bring an engine at all.

Caveat, stated because it changes how the CPU column should be read: Chrome
records 2D canvas commands on the main thread and rasterizes them elsewhere.
These CPU numbers are recording cost, not total cost. The check on total cost is
the frame delta, which stayed at 8.3 ms p50 and under 9.5 ms p95 through
n=1,200.

---

## 7. Running without WebGL2

A supervisor dashboard gets opened on whatever machine is nearby. Test: before
the engine loads, patch `HTMLCanvasElement.prototype.getContext` to return
`null` for `'webgl2'` and `'webgpu'`, and remove `navigator.gpu`. Then run the
same scene at n=150 for 2 s.

| Candidate | Result without WebGL2 | frame p95 |
| --- | --- | --- |
| canvas2D | runs (never asks for WebGL) | 9.3 ms |
| raw WebGL, falls back to WebGL1 | runs on WebGL1 | 9.2 ms |
| PixiJS 8.20.1 | runs on WebGL1 | 9.1 ms |
| Phaser 3.90.0 | runs on WebGL1 | 9.3 ms |
| Babylon 9.23.0 | runs on WebGL1 | 9.5 ms |
| **three.js r185** | **FAILS**: `THREE.WebGLRenderer: Error creating WebGL context.` | - |
| **PlayCanvas 2.21.4** | **FAILS**: `WebGL not supported` | - |

The PlayCanvas failure is the engine, not my config. Its build exports exactly
`DEVICETYPE_NULL`, `DEVICETYPE_WEBGL2`, `DEVICETYPE_WEBGPU`,
`DEVICETYPE_WEBGPU_BARE` - there is no WebGL1 constant. `createGraphicsDevice`
threw for every list I tried, including `['webgl2','webgl1']` and
`['webgpu','webgl2','webgl1']`.

Unmeasured, and it moderates this section: Chrome normally substitutes a
software GL implementation rather than removing WebGL entirely, so a machine
with literally no WebGL2 is rare. I did not verify that fallback behaviour. What
the test does establish is that two of the seven have no code path that
survives losing WebGL2, and two of the seven never wanted it.

---

## 8. Vendor demo spot checks

Reported for transparency, not used to rank anything - these are different
scenes on different sites.

Valid samples (canvas present in the sampled document, ~300-360 frames after a
warmup):

| Page | p50 | p95 | p99 | max | frames > 16.7 ms |
| --- | --- | --- | --- | --- | --- |
| threejs.org `webgl_lines_fat` | 8.3 | 9.3 | 9.4 | 9.6 | 0 / 359 |
| threejs.org `webgl_points_dynamic` (particles + postprocessing) | 9.3 | 25.1 | 33.7 | 89.8 | **108 / 359** |
| babylonjs.com `Demos/Espilit` | 8.3 | 9.3 | 9.4 | 16.7 | 1 / 299 |
| playcanv.as `apps/913374e8` (Master Archer) | 8.3 | 9.3 | 9.4 | 10.1 | 0 / 359 |

The Babylon sample was screenshotted mid-run: the scene was rendering and the
demo's own counter read 120 fps. The PlayCanvas sample was screenshotted too and
**was sitting on the title screen**, so that row measures a menu, not gameplay.

Failed attempts, reported rather than quietly turned into numbers:
`playcanv.as/p/JERg21J8` (0 canvases, 1 iframe - I had sampled the parent
document and got a meaningless 120 fps until the screenshot caught it),
`labs.phaser.io` view page (0 canvases, demo never loaded), `pixijs.com`
(0 canvases, 1 iframe). **No Pixi or Phaser vendor-demo number is reported**,
because every one I could reach would have measured an empty parent document
ticking at the display refresh rate.

---

## 9. The "three.js is already bundled" claim, checked

It is true of t27.ai and false of the page in question.

Measured at `https://t27.ai/`: it loads `three-C7rSOEFP.js` at **249,526 bytes
encoded / 918,770 decoded**, out of 469,227 bytes of JavaScript in total (with
`index` 88,247, `react` 66,069, `motion` 40,325, `router` 13,139). A canvas is
present. So three.js is genuinely paid for there - and at 249,526 bytes it is
*larger* than vanilla three (188,401), because it carries wrappers on top.

But `https://t27.ai/queen/hq` redirects to `https://t27.ai/#/`, the SPA landing
page. There is no Queen route on that host. In this repository the Queen pages
are Hono routes that return hand-written HTML strings:

- `trios/agent-server/apps/server/src/api/server.ts:342` - `.route('/queen/hq', createQueenHqRoute())`
- `trios/agent-server/apps/server/src/api/routes/queen-hq.ts` - 15,543 bytes, an inline `<style>`, `c.html(SHELL, 200, ...)`, no bundler, no CDN script tag, no canvas
- alongside `queen-kanban.ts` (46,610 bytes), `queen-tree.ts` (12,731), `queen-dashboard.ts` (13,767)

**Consequence for the decision:** three.js's "already bundled, so free" advantage
does not transfer to the page the operator is looking at. Adding any engine
there means either a new `<script src="cdn...">` tag on a page that has none
today, or introducing a bundler into a server that currently emits string
literals. The no-engine option is the only one that costs neither: 2,506 bytes
of brotli-compressed JavaScript inline in the same HTML shell that already
exists.

---

## 10. Which engines are over-specified for this

- **Babylon.js and PlayCanvas** - full 3D engines with material systems, PBR,
  asset pipelines, physics hooks, XR. 263,385 and 236,311 bytes brotli to draw
  lines and dots. Everything they are good at is unused here.
- **Phaser** - a game framework: scene manager, input, tweens, arcade physics,
  audio, loader. 265,198 bytes brotli. The dashboard has none of those needs;
  its interactions are DOM clicks on panels.
- **three.js** - the least over-specified of the 3D group, and the only one
  whose retained-mode result (120 fps and 0.6 ms CPU at 62,352 line segments)
  buys something real. Still 109,407 bytes brotli for a scene that is lines,
  points and text.
- **PixiJS** - conceptually the right fit, a 2D renderer for a 2D picture. But
  its immediate-mode `Graphics` is the wrong shape for geometry that is
  re-projected every frame: 2.0 ms CPU at n=150 where canvas2D takes 0.4 ms
  (**5x**), and 62.1 ms at n=9,600.
- **Raw WebGL2 by hand** - the fastest thing measured (0.2 ms CPU at n=150,
  0.4 ms at n=9,600) and only 3,539 bytes brotli, but you write shaders,
  buffers and a resize path yourself and you still need the 2D overlay for text.
  It is the upgrade path from canvas2D, not the starting point.

---

## 11. Recommendation

**Hand-written canvas2D, with the labels and panels on the same 2D surface.**

Deciding number: **2,506 bytes brotli against 109,407** - 43.7x - for a scene
where canvas2D measured 0.4 ms of main-thread work per frame, 8.3 ms p50 /
9.2 ms p95 frame time, and **zero frames over 16.7 ms in three runs**. The
supporting number: at 1,200 nodes (8x the top of the 50-200 design range) it was
still at 120 fps and 1.6 ms.

It is also the only option that needs no new dependency, no bundler and no CDN
tag added to `queen-hq.ts`, and it cannot fail on a machine without WebGL2
because it never asks.

**Runner-up: three.js r185.** 109,407 bytes brotli tree-shaken, 0.3-0.4 ms CPU
at n=150, and 120 fps with 0.6 ms CPU at n=9,600 because the rotation happens on
the GPU. It is the correct choice the moment the globe stops being a wireframe.

**What would change the answer:**

1. **Node count sustained above roughly 2,000.** Measured: canvas2D 55.9 fps at
   9,600, three.js 120.5 fps at the same load. The crossover is between 1,200
   and 9,600 on this machine; I did not bisect it. If the community network is
   expected to reach thousands of contributed machines on one screen, take
   three.js now rather than rewrite later.
2. **A real 3D globe** - lit and textured sphere, correct occlusion of back-face
   nodes, orbiting perspective camera. canvas2D would need a painter's-algorithm
   depth sort that I did not write and did not measure. three.js gets it free.
3. **A weaker target machine.** Everything here is one M1 Pro at 120 Hz. Nothing
   was measured on an Intel integrated GPU, on Windows, on Firefox or on Safari.
   canvas2D rasterizes on the GPU too, so a weak machine does not automatically
   favour it - that is an assumption I could not test.
4. **The page moving into the t27.ai React SPA.** three.js is already there at a
   measured 249,526 bytes; its marginal cost would drop toward zero and the
   43.7x argument would collapse. Today the Queen pages are not on that host.

---

## 12. What I could not measure

- **One machine, one browser.** Chrome 148 on an M1 Pro at 120 Hz and DPR 2. No
  Firefox, no Safari, no Windows, no integrated GPU, no 60 Hz panel. Every
  number here should be treated as an ordering, not an absolute.
- **canvas2D CPU is recording cost only.** Chrome rasterizes 2D canvas off the
  main thread. I used frame delta as the check, but I did not instrument the
  compositor or the raster thread.
- **Implementation shape dominates brand.** three.js, Babylon and retained
  PlayCanvas were written retained; canvas2D, Pixi, Phaser and immediate
  PlayCanvas were written immediate. Section 4 is substantially a measurement of
  that choice. A retained Pixi or Phaser implementation was not written or
  measured, and would score better than the numbers shown.
- **No end-to-end cold page load per engine.** I measured CDN fetch separately
  (section 5.1, cache-busted) and warm navigation-to-first-frame separately.
  Those two do not simply add. The warm navigation-to-first-frame numbers ranged
  105-1,224 ms across repeats on identical inputs, so I do not quote them: only
  the engine-construct-plus-scene-build time (three 51-91 ms, PlayCanvas
  104-175 ms, raw WebGL 67-86 ms, Pixi 84-279 ms, Phaser 204-328 ms, Babylon
  257-595 ms, canvas2D 0 ms) is stable enough to compare, and even that is three
  samples.
- **Phaser 4.2.1** was size-measured but not frame-measured; the frame numbers
  are Phaser 3.90.0.
- **No WebGPU path** was written for any candidate, although this machine
  supports it.
- **No in-engine text** was measured - not Pixi `BitmapText`, not Babylon GUI,
  not an SDF atlas in three. Every candidate used the same 2D overlay, so no
  engine got credit or blame for its own text system.
- **The horizontal overflow the operator reported was not measured.** `/queen/*`
  is not served from t27.ai and I had no bearer token for the running
  supervisor, so I never loaded the page that does not fit.
- **No claim about the running supervisor's data** (41 done, 12 in review, 17
  backlog, 2 bees, 4 credentials, 5-minute rounds) was verified here. Those
  figures came with the brief; nothing in this document depends on them.

---

## 13. Reproducing this

1. Serve a directory containing `index.html` (a `#host` div, an `#overlay`
   canvas, `<script type="module" src="/bench.js">`) over
   `python3 -m http.server 8931 --bind 127.0.0.1`.
2. `bench.js` reads `?e=<engine>&n=<nodes>&s=<seconds>&overlay=0|1&scene=0|1&nogl2=0|1`,
   builds the seeded scene described in 2.1, loads the engine (ESM `import()` for
   three and Pixi, a classic `<script>` tag for the UMD builds of Phaser,
   Babylon and PlayCanvas - `import()` of a UMD bundle fails with
   `Cannot set properties of undefined (setting 'Phaser')`), then runs the rAF
   loop and leaves the result on `window.__BENCH__` with `window.__DONE__`.
3. Drive it from a **foregrounded** tab. A background tab throttles rAF to about
   1 Hz and every number will be wrong.
4. Disable each engine's own loop and drive rendering from your own rAF, or you
   are timing two loops: `app.ticker.stop()` (Pixi), `game.loop.stop()` then
   `game.step(t, dt)` (Phaser), `app.autoRender = false` then `app.render()`
   (PlayCanvas), `scene.render()` (Babylon), `renderer.render()` (three).
5. Bundle sizes: `bun add` the packages, write one entry file per engine
   importing only what the scene uses, `bun build --minify --target=browser`,
   then `brotli -q 11 -c out.js | wc -c`. Load each bundle in the browser and
   call its export before trusting the size.
6. WebGL2-removal test: patch `HTMLCanvasElement.prototype.getContext` to return
   `null` for `'webgl2'` and `'webgpu'`, and drop `navigator.gpu`, **before** the
   engine script loads.
7. Screenshot every variant. A blank canvas benchmarks beautifully.
