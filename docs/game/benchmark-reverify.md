# Re-verification of `docs/game/engine-benchmark.md`

Run on 2026-09-03 on the same machine, in the same browser family, at the same
display refresh. Everything below marked **measured** was produced by a run I made
today; everything marked **carried** is quoted from the document and was not
re-run by me.

Scratch lived at `/tmp/eb2` and has been deleted (see §6).

---

## 0. First, a correction to the brief

The task asked me to read "whichever section records the canvas2D 9,600-node
anomaly (55.9 fps on one run vs 65.8 fps on a rerun, flagged as one run on a
loaded machine)."

**That section does not exist.** I read all 497 lines and grepped the file.
`55.9` appears exactly twice — in the §3/§4 results table at line 188 and in the
§11 flip-condition list at line 418. The string `65.8` does not appear in any of
the three study documents. Neither does "loaded machine", nor "anomaly". The
document presents 55.9 fps as a plain single-value result with no rerun and no
caveat, and §12 ("What I could not measure") does not list it. There is no
recorded rerun that failed to reproduce.

So the premise "one number did not reproduce" was not in the document. It is,
however, **correct** — just not for the reason given. I could not reproduce 55.9
fps at all, and by a wide margin. That is §3 below.

Also worth stating plainly: §4 of the document reports **one run per candidate**
at n=9,600 (unlike §3, which reports three). The 55.9 fps figure is a single
sample. The document does not say so; the shape of the table gives it away
(single values instead of the `a / b / c` triples used in §3).

---

## 1. BYTES — reproduced from scratch

Method: fresh `/tmp/eb2`, `bun add three@0.185.1`, one entry file per candidate,
`bun build --minify --target=browser`, `brotli -q 11`. Same tool versions the
document names (bun 1.3.12), brotli 1.2.0.

I wrote the canvas2D implementation from the document's §2.1 scene spec, not from
its source (which was deleted with `/tmp/enginebench`): seeded PRNG at seed
20260903, 150 nodes on a Fibonacci sphere in three classes, 40 arcs of 24
lifted great-circle segments each with a moving pulse marker, a 12-meridian ×
7-parallel × 48-segment wireframe (1,872 line segments total with the arcs),
Y rotation, plus the identical overlay — a label per front-facing node, 3 panels,
30 text rows, 30 animated bars. It was screenshotted at 2544×1612 and draws the
scene; it is not a blank canvas.

| Bundle | raw | gzip -9 | **brotli -q 11** | document says (carried) |
| --- | --- | --- | --- | --- |
| canvas2D, no engine, whole scene | **3,796** | **1,884** | **1,665** | 5,992 / 2,857 / **2,506** |
| three.js r185, 10 named imports, engine only | **528,135** | **132,093** | **109,376** | 528,143 / 132,086 / **109,407** |
| three.js r185, same 10 imports **+ the same scene and overlay code** | **531,194** | **133,531** | **110,512** | not reported |

### The three.js number reproduced almost exactly

**109,376 measured vs 109,407 carried — 31 bytes apart, 0.03 %.** Raw was 8 bytes
apart. That is as close as two independently written ten-import entry files can
land. The document's three.js figure is sound.

### The canvas2D number did not, and it is *smaller*

**1,665 measured vs 2,506 carried — mine is 66 % of the document's.** Both are
correct measurements of different code. The scene spec in §2.1 constrains what is
drawn, not how many bytes it takes to say it; my line and arc drawing batches
every segment into two `beginPath()`/`stroke()` pairs, and I did not write a
resize path as elaborate as theirs. An implementation of the same scene can
plausibly land anywhere from ~1.6 KB to ~3 KB brotli.

**Conclusion on bytes: the claim survives, the exact figure does not.** The
document's own ratio, 109,407 / 2,506 = 43.7×, is arithmetically right for its
own pair. My pair gives **65.7×**. The like-for-like comparison — engine plus the
same scene code on both sides — is **110,512 / 1,665 = 66.4×**.

### An asymmetry in the document's headline ratio

Because my bare three.js entry landed within 31 bytes of the document's, the
document's 109,407 is demonstrably **engine only** — the scene code is not in it.
Its 2,506 is **all scene code**. The 43.7× therefore compares "engine with no
scene" against "scene with no engine". The honest like-for-like figure is 66.4×,
which is worse for three.js, not better. The direction of the argument is
unaffected; the number in §0 and §11 is the wrong one to quote.

---

## 2. FRAMES — browser automation is available, and I used it

### What is on this machine right now

| Thing | State |
| --- | --- |
| `mcp__browseros__*` | **ConnectionRefused** — server failed to connect this session |
| `mcp__browseros-neo__*` | **ConnectionRefused** — same |
| `mcp__tri-mcp-browser__*` | **ENOENT** — `/Users/playra/tri-mcp/run-mcp.sh` does not exist |
| puppeteer | not installed (no `~/.cache/puppeteer`, not in the global npm list) |
| playwright browsers | **installed**: `~/Library/Caches/ms-playwright/chromium-1208` + `chromium_headless_shell-1208`, 520 MB, dated 2026-08-23 |
| playwright npm package | not installed anywhere I could find; I installed `playwright-core@1.56.1` into `/tmp` |
| Google Chrome | **`/Applications/Google Chrome.app`, version 152.0.7977.66** |
| BrowserOS / BrowserOS neo | both present as apps, but their MCP endpoints refuse connections |

`playwright-core@1.56.1` pins chromium-**1194** and the cache holds **1208**, so
the bundled-browser path was broken. I used `channel: 'chrome'` instead, which
drives the installed Google Chrome 152 directly. That is a **real browser on the
real GPU**: `ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro, Unspecified
Version)` — the exact renderer string the document records in §1. Not SwiftShader.

### Headless is the wrong environment and I say so

Headless Chrome pins rAF to **60 Hz**: idle rAF p50 16.7 ms, p95 17.4–17.6 ms.
The document's machine is 120 Hz with an 8.33 ms budget. Every frame-delta
percentile from headless is therefore incomparable, and the document's key metric
"frames over 16.7 ms" degenerates to "every frame". I ran headless first, saw
this, and switched.

`--disable-frame-rate-limit --disable-gpu-vsync` lifted rAF to ~1,585 fps but
made the numbers worse, not better: canvas2D reported 0.1 ms CPU at n=150 against
0.3 ms vsync-limited, which means canvas commands were being coalesced rather than
rasterized. Discarded.

### Headed Chrome reaches the real 120 Hz panel and matches the document exactly

| Idle rAF | measured today (headed) | document §1 (carried) |
| --- | --- | --- |
| p50 | **8.3 ms** | 8.3 ms |
| p95 | **9.2–9.4 ms** | 9.2 ms |

That is the same environment. Viewport 1272 × 806 CSS px at `deviceScaleFactor: 2`
→ canvas 2544 × 1612 device px, identical to §1. Sampling identical to §2.2:
3-second runs, first second discarded, percentiles over the rest.

**Machine load during the runs: `uptime` reported 1-minute load averages of 7.35,
10.40, 8.86, 8.39 and 7.62 on 8 logical cores.** This machine was loaded while I
measured. That makes my numbers pessimistic, not optimistic, and strengthens the
finding below.

### 2.1 The product scene, n=150, overlay ON, 120 Hz, three runs each

| Candidate | frame p50 | frame p95 | frame p99 | max | > 16.7 ms | CPU p50 | CPU p95 | fps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| canvas2D | 8.3 / 8.3 / 8.3 | 9.2 / 9.3 / 9.1 | 9.7 / 9.5 / 9.3 | 11.4 / 11.3 / 9.4 | **0 / 0 / 0** | 0.2 / 0.3 / 0.2 | 0.4 / 0.8 / 0.3 | 120.5 |
| three.js r185 | 8.3 / 8.3 / 8.3 | 9.1 / 9.2 / 9.2 | 9.2 / 9.7 / 10.0 | 9.3 / 10.5 / 10.3 | **0 / 0 / 0** | 0.2 / 0.2 / 0.2 | 0.4 / 0.8 / 0.4 | 120.5 |

Document (carried): canvas2D CPU p50 0.3/0.4/0.4, p95 0.7/0.7/1.1, frame p95
9.2/9.1/9.3, zero long frames; three.js CPU p50 0.3/0.4/0.4.

**This reproduces.** My canvas2D is marginally cheaper (0.2–0.3 vs 0.3–0.4 ms),
consistent with the leaner implementation that also explains the byte difference.

n=1,200, overlay ON, three runs: canvas2D 120.5 fps, CPU p50 **0.9 ms**, frame
p95 9.1–9.2 ms, zero long frames. Document carried 1.6 ms. Same conclusion,
cheaper.

### 2.2 n = 9,600 — the number that does not reproduce

Overlay OFF, exactly as §4 specifies, three runs each. n=9,600 nodes, 2,560 arcs,
62,352 line segments.

| Candidate | frame p50 | frame p95 | frame p99 | max | > 16.7 ms | CPU p50 | **fps** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **canvas2D, measured today** | **8.3 / 8.3 / 8.3** | 9.2 / 9.3 / 9.2 | 9.3 / 9.3 / 9.4 | 9.4 / 9.5 / 9.4 | **0 / 0 / 0** | **3.5 / 3.5 / 3.5** | **120.5** |
| canvas2D, document (carried) | 17.9 | 21.2 | 22.0 | 73.9 | — | 10.3 | **55.9** |
| **three.js, measured today** | 8.3 / 8.3 / 8.3 | 9.3 / 9.3 / 9.2 | 9.4 / 9.4 / 9.3 | 9.4 / 9.4 / 9.3 | 0 / 0 / 0 | **0.1 / 0.1 / 0.1** | **120.5** |
| three.js, document (carried) | 8.3 | 9.3 | 9.5 | 11.0 | — | 0.6 | 120.5 |

**canvas2D held 120.5 fps at 9,600 nodes with 3.5 ms of main-thread work and not
one frame over 16.7 ms, in three consecutive runs, on a machine carrying a load
average of 8.9.** The document's 55.9 fps did not reproduce — not as 65.8, not as
anything below 120.

The document's own arithmetic is self-consistent: 10.3 ms of CPU on an 8.33 ms
budget forces a two-vsync frame, 16.7 ms, which is 60 fps; 17.9 ms p50 and 55.9
fps follow. So the 55.9 is not a measurement error. **It is a property of that
implementation, not of canvas2D.** Mine is 2.9× cheaper at the same scene, and
3.5 ms fits inside 8.33 ms with room to spare. The most likely cause is path
batching: I emit all 62,352 line segments as two `beginPath()`/`stroke()` pairs.

### 2.3 Where canvas2D actually breaks (the document did not bisect this; I did)

Overlay OFF, 120 Hz, single runs above 9,600.

| n | canvas2D CPU p50 | canvas2D frame p50 | canvas2D **fps** | three.js CPU p50 | three.js fps |
| --- | --- | --- | --- | --- | --- |
| 9,600 | 3.5 | 8.3 | **120.5** | 0.1 | 120.5 |
| 19,200 | 7.0 | 9.1 | **109.9** | — | — |
| 24,000 | 8.8 | 10.3 | **97.1** | — | — |
| 28,800 | 10.5 | 12.5 | **80.0** | — | — |
| 33,600 | 12.4 | 14.0 | **71.4** | — | — |
| 38,400 | 14.4 | 16.3 | **61.3** | 0.1 | **120.5** |

canvas2D's per-node cost above 4,800 is a clean **≈ 0.36 µs/node**. It exhausts
the 8.33 ms budget at **n ≈ 23,000**. It reaches the document's 55.9 fps at
**n ≈ 40,000** — **4.2× further out than the document places it**.

three.js is flat at 0.1 ms all the way to 38,400 and never left 120.5 fps.

### 2.4 The finding that actually matters: the labels, not the globe

The overlay is canvas2D **in both candidates** — the document's §6 explains why
(three.js has no text; sprite/SDF text blurs at DPR 2). So I measured the shipping
configuration, overlay ON:

| n | canvas2D CPU p50 / fps | three.js CPU p50 / fps |
| --- | --- | --- |
| 1,200 | 0.9 / **120.5** | 0.6 / 120.5 |
| 9,600 | 6.9 / **87.7** | 3.2 / **120.5** |
| 19,200 | 13.8 / **43.9** | **6.4 / 69.0** |
| 24,000 | 17.6 / **34.7** | — |

**At n=19,200 with labels on, three.js is 69.0 fps.** Its scene cost is 0.1 ms;
the other 6.3 ms is the label overlay, which it pays identically. The marginal
label cost is **≈ 0.65 µs per label in both candidates**.

Extrapolating the two linear fits: canvas2D exhausts the 8.33 ms budget at
**n ≈ 11,500** with labels on; three.js at **n ≈ 25,000**. **three.js buys 2.2×,
not an order of magnitude**, because past a few thousand labelled nodes the
bottleneck is `fillText`, which no 3D engine removes.

I did not re-measure PixiJS, Phaser, Babylon.js, PlayCanvas or raw WebGL2. Every
number the document reports for those five stands unverified by me.

---

## 3. THE RIGHT SCENE — filled territories, measured not reasoned

The document's scene is a wireframe. The game as now specified needs coloured
filled regions, many more labels, and per-node state changes. I built that scene
in both candidates and measured it.

**What I added, identical in both:** the sphere partitioned into a lat/lon grid of
territories, each a closed spherical polygon sampled at 8 points per edge (32-point
ring), filled with an `hsl()` colour **recomputed every frame** from a per-territory
load value (the state change), stroked with a 1 px border, back-face culled;
**one extra text label per visible territory** on top of the existing per-node
labels, the 3 panels, the 30 rows and the 30 bars. canvas2D fills paths; three.js
triangulates each cell as a centroid fan into one vertex-coloured `Mesh` and
rewrites the whole colour `BufferAttribute` every frame. Both were screenshotted
and both draw the filled, labelled, coloured globe.

120 Hz, overlay ON, n=150 nodes + 40 arcs + panels:

| territories | visible/frame | canvas2D CPU p50 | canvas2D **fps** | three.js CPU p50 | three.js **fps** | ratio |
| --- | --- | --- | --- | --- | --- | --- |
| 288 | ~144 | **0.5** (0.5/0.5/0.5, three runs) | **120.5** | **0.4** (0.4/0.4/0.4) | 120.5 | 1.25× |
| 1,152 | ~576 | 1.3 | **120.5** | 1.1 | 120.5 | 1.2× |
| 2,048 | ~1,024 | 2.1 | **120.5** | 1.2 | 120.5 | 1.75× |
| 4,608 | ~2,304 | 4.3 | **120.5** | 2.5 | 120.5 | 1.7× |
| 8,192 | ~4,096 | 7.7 | **90.1** | 3.9 | **120.5** | 2.0× |
| 12,800 | ~6,400 | 11.7 | **58.5** | 5.9 | **106.4** | 2.0× |

canvas2D fill cost is linear at **≈ 0.90 µs per territory** and crosses the
8.33 ms budget at **≈ 9,000 territories** (≈ 4,500 visible after back-face cull).

**The canvas2D verdict survives filled territories, and it is not close.** XCOM's
map is 16 countries in 5 continents. Even a very fine community map — one
territory per contributed machine plus regional grouping — is a few hundred.
**288 filled, coloured, per-frame-updating, individually-labelled territories cost
canvas2D 0.5 ms out of an 8.33 ms budget: 6 % of the frame, 30× headroom.**

Two things to keep honest about this:

1. **three.js's advantage here is only 1.2–2.0×, and my three.js number is JS-bound,
   not GPU-bound.** Its per-frame cost scales with territory count because I rewrite
   the vertex-colour attribute in JavaScript. Moving the state into a shader uniform
   or a data texture would flatten it to ~0.1 ms and make the ratio unbounded above
   ~8,000 territories. I did not write that. So three.js's *measured* fill advantage
   is a floor, not a ceiling.
2. **Where canvas2D genuinely loses on filled territories is fidelity, not speed.**
   My canvas2D uses an orthographic projection and centroid back-face culling; the
   screenshots show sliver artefacts where cells cross the limb, and there is no
   perspective and no painter's-algorithm depth sort. three.js produced correct
   occlusion for free. This is the document's flip condition #2, and filling the
   territories makes it *more* visible than a wireframe did, because a wrong
   z-order in a wireframe is a crossed line and a wrong z-order in a filled map is
   a country drawn on top of the wrong hemisphere.

Unmeasured on the filled scene: alpha-blended glow and overdraw, gradients,
shadows, per-territory clipping, and hover/click picking. My fills are flat with a
1 px stroke over roughly 1.2 M device pixels. A design that stacks translucent
layers over the whole 4.1 M-pixel canvas is fill-rate work I did not exercise, and
fill rate is the one axis where canvas2D and WebGL genuinely differ in kind.

---

## 4. VERDICT

**"No engine, canvas2D" still holds for the game as now specified, and it holds
more strongly than the document argued.**

- Filled territories, the thing the study never drew, cost **0.5 ms at 288
  territories** — 6 % of a 120 Hz frame, with per-frame colour state changes and a
  label on every visible one. Measured, three runs, all 120.5 fps, zero long frames.
- The document's own flip condition #1 — *"node count sustained above roughly
  2,000"* — is **measured false by an order of magnitude**. Its basis, 55.9 fps at
  9,600 nodes, did not reproduce: I measured 120.5 fps and 3.5 ms at that load.
- The bytes argument survives: **1,665 vs 109,376 brotli, 65.7×** (like-for-like,
  66.4×). The document's 43.7× understates it and compares two unlike things.

### The numbers that would flip it

| # | Condition | The number | Status |
| --- | --- | --- | --- |
| 1 | Simultaneously drawn nodes, each with a label (the shipping config) | canvas2D exhausts 8.33 ms at **n ≈ 11,500**; three.js at **n ≈ 25,000** | measured/extrapolated today. Only a **2.2× extension** — `fillText` is the bottleneck in both, and no 3D engine removes it. This is the weakest flip condition of the four. |
| 2 | Filled territories on screen | canvas2D exhausts 8.33 ms at **≈ 9,000 territories** (≈ 4,500 visible) | measured today. A community map needs ~10² of these. **Not a live risk.** |
| 3 | Depth-correct 3D — a territory that must be *occluded* by the globe rather than centroid-culled, a lit or textured sphere, an orbiting perspective camera | **no number; it is a yes/no** | This is the real flip condition. Filling the territories raises its visual cost sharply versus a wireframe, and my screenshots show the artefact. Take three.js the day the map must be a solid sphere with correct occlusion. |
| 4 | The page lives inside the t27.ai React SPA | **three.js is already a dependency of the deployment target** | The study's §9 checked the wrong page. See below. |

### Flip condition #4 is already true of the real target

The study's §9 concluded three.js's "already bundled, so free" advantage does not
transfer, on the basis that the Queen pages are Hono routes emitting hand-written
HTML strings in `trios/agent-server/apps/server/src/api/routes/queen-hq.ts`. But
the page the user's brief names is **`t27.ai/#/queen`**, a React SPA route, and its
deployment target is `/Users/playra/trinity/apps/website`.

That package.json already declares `three@^0.183.2`, `@react-three/fiber@^9.5.0`
and `@react-three/drei@^10.7.7`; five components under `src/components/` already
`import ... from 'three'`; and `vite.config.ts` has an explicit
`manualChunks` rule emitting a dedicated `three` chunk. **The dependency, the
build step and the bundler all already exist on the real target.** The study's
argument that adding an engine means "introducing a bundler into a server that
currently emits string literals" does not apply to `/#/queen`.

What that does **not** settle, and I did not measure because I was read-only and
could not build: whether the `/#/queen` route actually *loads* the `three` chunk.
`Queen.tsx` contains no 3D import, and with a dedicated manual chunk the ~250 KB
would be paid only if something on that route pulls it. So the marginal byte cost
of taking three.js on this page is somewhere between **0 and ~110 KB brotli**, and
which end it lands on is a `vite build && ls dist/assets` away. **That is the one
measurement that would legitimately move this decision, and nobody has made it.**

### Recommendation

Build it in canvas2D. The measured headroom for the game as specified — filled
territories, dense labels, per-node state — is 15–30× on this machine, and the
byte argument is stronger than the study claimed. Revisit only if the globe has
to become a solid, occluding, perspective-correct 3D sphere (condition 3), or if
a `vite build` shows the `three` chunk is already on the `/#/queen` critical path
anyway (condition 4). Do not revisit it for node count; that fear was based on a
number that does not reproduce.

### One correction the document should carry regardless of the verdict

Line 188 and line 418 should not state 55.9 fps without qualification. It is a
single unrepeated sample, it is the only row in §4 measured once where §3 was
measured three times, and an independent implementation of the same specified
scene runs the same load at 120.5 fps and 3.5 ms. The honest sentence is that
canvas2D's ceiling is implementation-dependent by at least 3× and that the study
measured one implementation.

---

## 5. What I could not measure

- **One machine, one browser, again.** Chrome 152 on the same M1 Pro at 120 Hz and
  DPR 2. The document's condition #3 (a weaker target, Firefox, Safari, Windows,
  an integrated GPU, a 60 Hz panel) is exactly as unmeasured after my run as
  before it.
- **The machine was loaded**, load average 7.4–10.4 on 8 cores, for every run.
  This biases against canvas2D, which is the candidate I am reporting as fast, so
  it does not threaten the conclusion — but the absolute CPU figures would likely
  improve on an idle machine.
- **Five of the seven candidates were not re-run.** PixiJS, Phaser, Babylon.js,
  PlayCanvas and raw WebGL2 keep the document's numbers, unverified by me. In
  particular the PlayCanvas stutter (§3) and the no-WebGL2 failures (§7) are
  carried, not confirmed.
- **Bundle sizes for those five were not reproduced either.** Only the canvas2D
  and three.js rows of §5.2 were re-measured.
- **CDN transfer sizes (§5.1) were not re-measured.** No network fetches were made.
- **canvas2D CPU is still recording cost only.** Chrome rasterizes 2D canvas off
  the main thread. Frame delta is the check, as in the original, and it agreed.
- **Fill-rate-bound rendering was not exercised.** Flat fills only; no glow,
  no translucent stacking, no shadows, no full-canvas overdraw.
- **The `/#/queen` bundle graph was not built.** Read-only constraint. Whether the
  `three` chunk is already loaded on that route is unknown and is the single
  highest-value unmeasured number in this report.
- **The three.js filled-territory implementation is deliberately naive** — per-frame
  JS colour-attribute rewrite. Its measured fill cost is a floor.
- **No 120 Hz measurement is possible headlessly on this machine.** Headless Chrome
  is pinned to 60 Hz. Every frame number above came from a headed window.

---

## 6. Scratch, and its deletion

Everything lived in **`/tmp/eb2`**, created and destroyed within this session.
Nothing outside `/tmp` was written. `git status --porcelain` in
`/Users/playra/tri-27` is empty and `engine-benchmark.md` has md5
`9cde500b9be5cc41090b14bd7b6eb83c`, unchanged.

Contents at deletion, **43 MB total** (peak; the 300 MB ceiling was never
approached — I avoided a browser download entirely by driving the already-installed
Google Chrome via `channel: 'chrome'` instead of letting playwright fetch its own):

- `node_modules/` — `three@0.185.1`, `playwright-core@1.56.1` (~34 MB)
- `src/` — 8 hand-written modules: `scene.js`, `overlay.js`, `territory.js`,
  `entry-canvas2d.js`, `entry-three.js`, `entry-three-bare.js`,
  `entry-c2d-fill.js`, `entry-three-fill.js`, `bench.js`
- `www/` — `index.html`, built `bench.js` (0.92 MB), served on 127.0.0.1:8932
- `out-canvas2d.js`, `out-three.js`, `out-three-bare.js` — the measured bundles
- `run.js`, `run-headed.js` — the playwright drivers
- 6 verification screenshots (`shot-canvas2d-150.png`, `shot-three-150.png`,
  `shot-c2dfill-150-0.png`, `shot-threefill-150-0.png`, and two at n=9,600)
- `package.json`, `bun.lock`, `http.log`, `http.pid`

The `python3 -m http.server 8932` process was killed before deletion.
`rm -rf /tmp/eb2` confirmed: `ls -d /tmp/eb2` → No such file or directory.
Root volume after: 12 Gi available, 58 % capacity.
