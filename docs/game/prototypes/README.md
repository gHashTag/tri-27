# Map prototypes

Three self-contained pages, no build step and no dependencies. Open one with any
static server; `file://` works too, except that some browsers throttle
`requestAnimationFrame` on a hidden tab, which makes a frame-interval reading
meaningless. Measure with `__bench()` instead — it drives the same `render()`
synchronously and so does not depend on the display at all.

```bash
python3 -m http.server 8846   # any free port; 8791 is already taken on this machine
```

| file | what it demonstrates |
| --- | --- |
| `01-rings-orbit.html` | the 27 logo petals as nodes; the three rings pushed apart in depth, so the mark reads as itself from the front and as three floating shells when orbited |
| `02-tiled-logos.html` | the logo as the minimal map cell, tiled edge to edge on a square field, with three levels of detail |
| `03-flower-of-life.html` | the same tiles on the Flower-of-Life lattice, one 27-trit word per tile |
| `06-comb.html` | the comb: every cell IS the mark, a triangular tiling where neighbours share walls — no hexagon, no second outline. Fog keeps its walls at a tenth of the weight |
| `05-swarm-field.html` | the playable field: hex ground, held / neutral / unscouted territory, one structure per cell, bees in transit, click to select |
| `04-silver-lattice.html` | the reference style: hairline silver line-work on black, colour only in the vertices, triangles interlocked into one continuous web |

## Where the geometry comes from

Nothing here is invented.

- The 27 petal paths are copied verbatim from
  `apps/website/public/trinity-logo-with-label.svg` (paths 1-27; the 28th is the
  word TRINITY). Measured centroid `(541.9, 454.0)`; three rings at mean radii
  154.4 / 98.1 / 51.2; nine bearings repeated in every ring, forming three
  triads 120 degrees apart.
- The tile is `apps/website/public/favicon.svg` — a rounded black square,
  `rx=64` on a 512 viewBox, carrying the 27 paths in a single colour.
- The lattice follows `trinity/src/tri/geometry/sacred.zig`, `cmdFlower`: each
  ring adds `6k` circles, so the total after k rings is `1 + 3k(k+1)` — 1, 7
  (Seed of Life), 19 (Flower of Life), 37, 61, 91. The prototype's tile counts
  were checked against that formula for k=1..5 and match exactly.
- 27 cells per tile is `WORD_SIZE` from `t27/specs/isa/ternary_bitwise.t27`: one
  ternary word is 27 trits.

## What the mark is made of, counted

Parsed from the SVG rather than assumed: 27 petals, every one of them a
five-point polygon, so **135 edges** meeting at **108 unique vertices** (27 of
those shared between two or more petals). At the canonical Flower of Life - 19
tiles - that is 2,565 edges and 2,052 lit vertices carrying 513 trits.

`04-silver-lattice.html` draws that as line work: one silver hairline pass for
every edge, then one glint sprite per vertex. Neighbouring tiles alternate the
mark by 180 degrees on the parity of their axial coordinates `(q-r)&1`, which is
what closes the hexagonal voids and turns separate marks into a continuous web.

## The encoding, which is not decorative

Hue says which ring a petal belongs to — gold CPU outermost, cyan FPGA in the
middle, green GPU innermost. Value says which trit it holds: `+1` working burns
full, `0` idle draws only its outline, `-1` refused nearly goes out.

In `04` this becomes nine glint colours rather than three: one per (ring, trit)
pair, so the iridescence of the reference image carries information instead of
being sparkle. `-1` is cold rather than invisible — an earlier pass dimmed it so
far that the field read as two colours. Colours are
the site's own: `#FFD700`, `#00CCFF`, `#00FF88` on `#000000`, with `#d4af37` for
the flower substrate.

## On the numbers these pages print

The HUD reports DRAW time, not frame interval. Comparing a frame interval to the
8.33 ms budget only tells you the monitor is 120 Hz; an earlier version of this
HUD did exactly that and reported OVER BUDGET while the renderer was using about
1% of the budget.

Readings are only as quiet as the machine. A sweep taken while this laptop was
running a 30-agent workflow (load averages 6.68 / 10.06 / 14.20 on 8 cores) put
p95 at 8-24 ms and was not even monotone in tile count; the same sweep on an idle
machine put medians at 0.1-0.6 ms for 7 to 61 tiles. Record the load with the
measurement or the measurement means nothing.

One known defect, left in deliberately so it is not forgotten: `render()`
allocates a fresh array of tile records and sorts it every frame. On the larger
square fields that shows up as 45-64 ms outliers which are garbage collection,
not drawing. Preallocate before using any of this in the page.

## Where the frame actually goes, measured per pass

Guessing was wrong twice, so the passes are timed separately. On the dense
lattice at 91 tiles the split was: circles 0.0 ms, edges 0.4 ms, glints 8.0 ms.
The line work is free — 12,285 edges strokes in under half a millisecond as one
batched path. The whole frame was the vertex blits, and the fix that mattered
was not batching state but drawing fewer of them.

The first attempt baked alpha into 27 sprites (9 colours x 3 brightnesses) to
avoid a `globalAlpha` write per vertex. That improved p95 at k=4 from 16.3 to
10.9 ms and left the median at 6.6 — so context state changes were not the cost,
volume was.

What fixed it was a correction of meaning rather than a trick: of the 108
vertices, exactly **27 are shared between petals — one per petal**. Those are
the nodes; one lit vertex per trit of the tile's 27-trit word. The other 81 are
structure and stay dark. Lighting 27 instead of 108 cut the k=4 median from
6.6 ms to 1.1 ms, and 127 tiles / 3,429 nodes now draw in 2.2 ms median on a
machine under load.

| rings | tiles | nodes | edges ms | glints ms | median | p95 |
| --- | --- | --- | --- | --- | --- | --- |
| 2 | 19 | 513 | 0.1 | 0.4 | 0.4 | 0.7 |
| 3 | 37 | 999 | 0.2 | 0.6 | 0.7 | 4.0 |
| 4 | 61 | 1,647 | 0.3 | 0.8 | 1.1 | 4.3 |
| 5 | 91 | 2,457 | 0.4 | 1.4 | 1.9 | 5.7 |
| 6 | 127 | 3,429 | 0.4 | 1.6 | 2.2 | 5.8 |

Also corrected here: the lattice spacing. The Flower of Life places circle
centres ON each other's circumference, so the triangular spacing is the RADIUS,
not `sqrt(3)*R`. The earlier pass used `sqrt(3)*R`, which is ordinary hex
packing of non-overlapping circles, and that is what left gaps between tiles.

## The palette was read from the wrong file, twice

First pass: four files of the local checkout, giving `#ffd700` 27 uses. Second
pass: all of `apps/website/src`, giving 277. Both were the LOCAL `trinity`
checkout, which is 62 commits behind what t27.ai serves.

The live Queen route ships its own code-split stylesheet,
`https://t27.ai/assets/Queen-zHzyRD7K.css` — 49,430 B, 499 occurrences of
`queen27`, **87 distinct `.queen27-*` selectors**, opening with
`--q-green: var(--accent, #00ff88); --q-gold: var(--golden, #ffd700)`.

Measured over that file, the colours in use are:

| literal | uses | note |
| --- | --- | --- |
| `#64DCFF` | 12 | the page's working cyan — not `#00CCFF` |
| `#080808` `#020806` `#030403` `#010706` | 5 4 4 3 | near-blacks with a green-blue cast, not `#000000` |
| `#FF6B6B` | 4 | |
| `#FFD45A` | 3 | warmer than `#FFD700` |

The tokens confirm gold and green are right by intent; the literals say the
working cyan and the ground are not what a homepage grep suggests. `04` now uses
these.

There is a larger consequence than colour. Those 87 selectors include
`queen27-factory-viewport`, `queen27-city-canvas`, `queen27-map-sectors`,
`queen27-hardware-foundry` and `queen27-core-orbit` — a map, a city, a foundry
and an orbit already shipped and live. Anything built from these prototypes must
extend that vocabulary rather than introduce a second one beside it. Read the
served CSS, not the checkout.


## 04 and 05 are two different pictures, deliberately

`04` is the dense sacred lattice: marks scaled past their own cell so their
edges interlock into one continuous web, which is what the reference image of
the 64-tetrahedron grid looks like. `05` is a game field: the mark is scaled to
`R/sqrt(3)` so it fits INSIDE its own hexagon, and the hexagon — the Voronoi
cell of the triangular lattice — becomes the ground you look down on.

They cannot both be true at once. Interlocking requires the mark to overflow its
cell; a readable tile requires it not to. `04` answers "make it like the sacred
geometry picture", `05` answers "make it a real game field like StarCraft, out
of our tiles". Pick one per zoom level: `05` far out where territory matters,
`04` close in where one cell fills the screen.

Two projection numbers matter and were tuned by looking, not by theory: the
camera pitch (0.74 rad reads as a strategy view; 0.86 flattens it) and the
perspective offset in `proj()` — at `+1400` the field occupied a third of the
frame, at `+430` it fills it.

Field cost, measured on a loaded machine: 37 tiles 0.7 ms median, 61 tiles
0.9 ms median / 4.2 ms p95, about half the 8.33 ms budget.


## 06: the triangles are the comb, not in the comb

The mark's silhouette is a point-down triangle — flat base at y=320.8 from
x=319.9 to 769.6, apex at (544, 717.8) — with h/w = 0.881 against 0.866 for an
equilateral. Normalised to an exact equilateral of side 1, the 1.8% rides and
the tiling closes.

A triangular tiling is strips of alternating down/up cells. What took three
attempts, all solved in Python before touching the page:

1. Rows are NOT shifted by half a cell. Row r owns the strip y in
   [r*HH, (r+1)*HH]; a down cell has its base on the strip's top line, an up
   cell on its bottom line. Alternate orientation on `(c+r)&1` and every
   interior vertex is the meeting point of exactly six cells — verified on a
   6x14 field: 30 interior vertices, all degree 6.
2. The ground triangle and the mark drifted by a third of a cell because
   `corners()` re-derived the corners from the centroid with a different
   formula than `build()` had used. Corners now come from the SAME strip lines.
3. The mark is normalised so its centroid, not its bounding-box centre, is at
   the origin: base at y=-HT/3, apex at +2HT/3.

The camera sways instead of spinning — a full orbit turns horizontal rows into
diagonals and the comb stops reading as rows.

Fog of war dims a place, it does not delete it: unscouted cells keep every wall
at a tenth of the weight and only the light goes out. Removing them tore holes
in the comb.

Cost on a loaded machine: 90 cells 1.5 ms median / 4.9 p95, 152 cells 2.3 / 5.7
— under 70% of budget. The vertex glints remain the whole cost; walls are 0.3 ms.
