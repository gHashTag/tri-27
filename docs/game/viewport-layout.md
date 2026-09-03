# STUDY 3 - it must fit on the screen

Viewport layout for the Queen supervisor surface: the tab set, the height chain,
and the numbers that are never allowed to scroll away.

Measured 2026-09-03T07:15Z-07:26Z against the live deployment
`https://trios-agent-server-production.up.railway.app`.

---

## 1. Method, before any number

Every number below came from one of three places. Nothing here is estimated
unless the sentence says so.

**(a) The public runtime endpoints, over curl.**

```
curl -s -w "%{http_code} %{size_download}" .../queen/public-board   -> 200  12313 bytes
curl -s                                    .../queen/status         -> 200
```

`/queen/public-board` and `/queen/status` are unguarded (mounted at
`agent-server/apps/server/src/api/server.ts:322-323`). They return the real
board and the real scheduler state, so the layout below was measured against
production data, not fixtures.

**(b) Layout, measured in real Chromium at exact CSS pixel widths.**

I could not resize the operator's window, so I measured inside `srcdoc` iframes
created in the live `/queen/kanban` page. An iframe of `width=1280 height=720`
gives its document a CSS viewport of exactly 1280x720: media queries, `vw`
units and `clamp()` all resolve against the iframe, so the layout is the real
one. Into each iframe I injected a prelude script that replaces `window.fetch`
so the page's own request to the guarded `/queen/board` is answered with the
body of `/queen/public-board`. The shipped CSS runs, the shipped `draw()` runs,
the shipped markup is produced. Nothing on the server was touched and nothing
was written to disk.

Then per iframe: `documentElement.scrollWidth`, `clientWidth`, `scrollHeight`,
the resolved `grid-template-columns` of `#board`, the document offset of every
column section, and a sweep of every element whose `getBoundingClientRect()`
crossed the viewport edge.

**(c) The operator's own browser.** Read from the live tab:
`innerWidth 1272`, `innerHeight 806`, `screen 1512x982`, `devicePixelRatio 2`,
root font-size `16px`. So the real working viewport is **1272x806 CSS px at
2x**, not 1280x720. `outerHeight` read `0` on a background tab, so I could not
measure the browser's own chrome height.

**Live board contents at the time of measurement** (from `/queen/public-board`,
86 cards): done 41, backlog 23, in review 12, dropped 8, running 2.
`/queen/status`: `scheduler.enabled true`, `intervalSeconds 300`,
`dispatches.total 42`, `finished 40`, `running 2`, last tick decided
`2026-09-03T07:07:30Z`, and the latest dispatch outcome string reads
`4 provider key(s) configured: 2 carrying a bee and 2 refused by the provider`.

---

## 2. Raw measurements

### 2.1 `/queen/kanban`, public card shape (no `paths`, no `worker`, no `detail`)

| viewport | doc scrollWidth | h-overflow | doc scrollHeight | screens tall | grid tracks |
|---|---|---|---|---|---|
| 1272x806 | 1272 | **0** | 9809 | 12.2 | 4 x 293px |
| 1280x720 | 1280 | **0** | 9790 | 13.6 | 4 x 295px |
| 1440x900 | 1440 | **0** | 7075 | 7.9 | 5 x 265px |
| 1600x806 | 1600 | **0** | 6330 | 7.9 | 6 x 245px |
| 1920x1080 | 1920 | **0** | 5980 | 5.5 | 6 x 298px (+1 collapsed 0px) |
| 768x1024 | 768 | **0** | 11397 | 11.1 | 2 x 350px |
| 390x844 | 390 | **0** | 13733 | 16.3 | 1 x 338px |

Column geometry at the operator's real 1272x806:

| column | cards | top (doc px) | left | width | height |
|---|---|---|---|---|---|
| backlog | 21 | 660 | 26 | 293 | 3758 |
| blocked | 0 | 660 | 335 | 293 | 122 |
| running | 1 | 660 | 644 | 293 | 202 |
| in review | 13 | 660 | 953 | 293 | 2054 |
| **done** | 43 | **4433** | 26 | 293 | 5255 |
| **dropped** | 8 | **4433** | 335 | 293 | 1145 |

At 1920x1080 all six sit on one row at top 660.

Chrome above the board, identical at every desktop width measured:
`#verdict` top 240 h 139, `#flow` top 389 h 29, `#explain` top 444 h 143,
`#pulse` top 629 h 21, `#board` **top 660**.

### 2.2 `/queen/kanban`, authenticated card shape - SYNTHESIZED, not live

The public projection strips `paths`, `worker` and `detail`. Those are the
widest things a card carries, so I re-ran the same harness with those fields
filled in with realistic values (1-3 repo paths per card, the longest being
`agent-server/packages/queen-core/src/supervisor/dispatch-worker-runner.ts`,
64 chars). **This is a simulation of the authenticated view, not a measurement
of it** - I have no bearer token.

| viewport | h-overflow | doc scrollHeight | screens tall |
|---|---|---|---|
| 1280x720 | **0** | 17613 | 24.5 |
| 1920x1080 | **0** | 11216 | 10.4 |
| 320x568 | **0** | 25525 | 44.9 |

### 2.3 The other three surfaces

| page | viewport | h-overflow | doc scrollHeight | screens tall |
|---|---|---|---|---|
| /queen/tree | 1280x720 | 0 | 11185 | 15.5 |
| /queen/tree | 1920x1080 | 0 | 11185 | 10.4 |
| /queen/tree | **390x844** | **+219px** | 27346 | **32.4** |
| /queen/hq | 1280x720 | 0 | 1244 | 1.73 |
| /queen/hq | 1280x600 | 0 | 1244 | 2.07 |
| /queen/hq | 1920x1080 | 0 | 1244 | 1.15 |
| /queen/hq | 390x844 | 0 | 2126 | 2.52 |
| /queen/dashboard | 1280x720 | 0 | 720 | 1.0 - **not a valid reading, see 9** |

---

## 3. What actually breaks, which is not what it looks like

**There is no horizontal overflow on the board. At any width. I looked for it
and did not find it.** `.board` is
`grid-template-columns:repeat(auto-fit,minmax(240px,1fr))`
(`agent-server/apps/server/src/api/routes/queen-kanban.ts:776-777`), and
`auto-fit` does not overflow - it wraps. The card internals that could have
forced a track wider than its share (`code` path chips) carry
`word-break:break-all` (`queen-kanban.ts:817-820`), and the sweep for elements
crossing the right edge returned **0 offenders** at all seven widths, in both
the public and the synthesized-path card shape.

So "ne vlazit" is a **vertical** failure with a horizontal cause:

1. Six columns at a 240px floor with a 16px gap and 25.89px page padding need
   `6*240 + 5*16 + 2*25.89 = 1571.8` -> **1572 CSS px** to sit on one row.
   That threshold is derived from the CSS, not bisected, but it is consistent
   with all four measured points (1272 -> 4 tracks, 1440 -> 5, 1600 -> 6,
   1920 -> 6).
2. The operator's viewport is 1272. Two columns short.
3. `done` and `dropped` therefore wrap onto grid row 2 - which begins at
   **y = 4433**, because row 1's height is set by the tallest column in it
   (backlog, 3758px). At 806px of viewport that is **5.5 screens of scrolling
   before the word "done" exists**. The operator has no way to know those
   columns are down there.
4. The board itself does not begin until **y = 660**. On an 806px viewport that
   leaves **146px** for cards - less than one card. On a 720px viewport the
   board is effectively below the fold entirely.
5. The whole document is 9809px, **12.2 screens**. With authenticated cards
   (which carry the path chips) the simulation says 17613px at 1280 wide -
   24.5 screens.

The one true horizontal overflow I found is elsewhere: **`/queen/tree` at 390px
overflows by 219px**. Cause, measured: an unstyled `<table>` of skill audit rows
(`queen-tree.ts:251-252`) laid out at **584px inside a 338px content box**. The
rule `table{width:100%}` at `queen-tree.ts:216` does not save it - a table with
`table-layout:auto` cannot be narrower than its min-content width, and
`width:100%` loses to that silently. That page is also 27346px tall on a phone,
32.4 screens.

`/queen/hq` is the only surface close to fitting already: 1244px, 1.73 screens
at 720. It is the right shape to build on.

---

## 4. The tab set

Five panes, one shell, one page, no page scroll.

| # | tab | key | what is in it | fills from |
|---|---|---|---|---|
| 1 | **SITUATION** | `1` | the game view: the compute topology in place of the globe, contributor nodes (CPU / FPGA / GPU) as the council nations, per-node panic meters, the round timer as the mission clock | `/queen/status`, `/queen/public-board` |
| 2 | **BOARD** | `2` | the six-column kanban, as a real rail with per-column scroll | `/queen/board` (token) or `/queen/public-board` |
| 3 | **HQ** | `3` | the control room: hive cells, gauges, run-a-round-now, in-flight rows | `/queen/board` (token) |
| 4 | **RESEARCH** | `4` | the technology tree | `/queen/tree` data |
| 5 | **SWARM** | `5` | the dashboard: leases, credentials, history | `/queen/lease` (token) |

SITUATION is the default landing tab. It is the only tab that answers "what is
happening right now" without reading anything, and it is the only one that
renders fully from public endpoints - so it is not blank before the operator
pastes a token.

Ordering rationale: the two tabs an operator opens under pressure are 1 and 2;
they get the first two positions and the first two digit keys. RESEARCH and
SWARM are reference surfaces and go last.

Nothing is removed. `/queen/kanban`, `/queen/hq`, `/queen/tree`,
`/queen/dashboard` keep working as standalone URLs; the shell mounts the same
render functions and syncs the hash (`#/board`, `#/situation`, ...) so a tab is
linkable and reload-safe.

---

## 5. The height chain

The rule: **the document is exactly one viewport tall and never scrolls. Every
scroll in the product happens inside a named element that owns it.**

```css
/* 1. The root pair. Both, not one. */
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;          /* backstop, not the mechanism - see section 6 */
  overscroll-behavior: none; /* kills rubber-band on the shell */
}

/* 2. The shell. This is the containing block for everything below. */
#shell {
  height: 100vh;             /* fallback for engines without dvh */
  height: 100dvh;            /* dynamic viewport: mobile URL bar collapse */
  display: grid;
  grid-template-rows:
      auto        /* #statusbar - the numbers that never scroll */
      auto        /* #tabbar */
      minmax(0, 1fr)  /* #panes - THE ONLY FLEXIBLE ROW */
      auto;       /* #footer, desktop only */
  overflow: hidden;
}

/* 3. The pane host. minmax(0,1fr) above already did the important half; this
      is the other half. A grid item's default min-height is auto, which means
      "at least my content" - it will refuse to shrink and push the row past
      the viewport. */
#panes {
  position: relative;
  min-height: 0;
  overflow: hidden;
}

/* 4. A pane. Inactive panes are display:none so they cost no layout. */
.pane { display: none; height: 100%; min-height: 0; }
.pane[data-active] {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);  /* pane header, pane body */
}

/* 5. The scroll owner. Exactly one per pane, and it is always this class. */
.pane-scroll {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;   /* scroll does not chain to the shell */
  scrollbar-gutter: stable;       /* no 15px reflow when content crosses the
                                     scroll threshold */
  -webkit-overflow-scrolling: touch;
}
```

Containing block, stated plainly: `#shell` is the only element with a definite
height derived from the viewport. Every descendant gets its height from grid
track sizing, not from percentages. `minmax(0, 1fr)` + `min-height: 0` is the
chain; `height: 100%` appears only on `.pane`, where its parent `#panes` has a
definite grid-resolved height.

Prefer this to a `height: 100%` chain everywhere. The reason is section 6.

### Which element owns the scroll, per pane

| pane | scroll owner(s) | what does NOT scroll |
|---|---|---|
| SITUATION | the right rail `.sit-rail.pane-scroll`; the canvas never scrolls | canvas, node ring, mission clock |
| BOARD | one `.cards.pane-scroll` **per column**, plus `.board` scrolling on X | column headers, counts, board toolbar |
| HQ | one `.pane-scroll` for the whole body | pane header, hive strip |
| RESEARCH | one `.pane-scroll` for the tier list | pane header, tier filter |
| SWARM | one `.pane-scroll` | pane header |

The BOARD pane is the only one with two scroll axes, and both are inside the
pane. That is what makes the wrap at y=4433 impossible: columns cannot wrap
because the board is `grid-auto-flow: column`, so a column that does not fit is
reached by scrolling the rail sideways, not by scrolling the page down past
3758px of backlog.

```css
.board {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
}
.board > section {
  scroll-snap-align: start;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr); /* head, blurb, cards */
  min-height: 0;
  min-width: 0;      /* the horizontal twin of min-height:0 */
}
.board > section > .cards { /* also .pane-scroll */ }
```

With `1fr` as the max, six columns stretch to fill any viewport at or above
1572px and never scroll sideways. Below that they hold the 240px floor and the
rail scrolls. Measured evidence that 240px is a floor worth keeping: at 1600 the
current page resolves tracks to 244.7px and the cards read fine; at 1920 it is
298px.

---

## 6. The trap, named

**A `height: 100%` chain breaks silently if one ancestor forgets it.**

A percentage height resolves against the parent's *definite* height. If any
ancestor between the scroller and the viewport has `height: auto` - a wrapper
`div` somebody added to hold a banner, a `<main>`, a fragment root that a
framework inserted - then that percentage resolves to `auto`. The child grows
to its content. The growth propagates up. `body` grows. The page scrolls.

There is no error. No console warning. Nothing turns red. And it will not show
up on an empty board, because an empty board is short enough to fit anyway: the
bug appears the first time real data arrives, which is to say in production, on
the operator's screen, at 12 screens tall.

Three mitigations, in order of how much they actually help:

1. **Do not build a percentage chain.** Use grid track sizing
   (`minmax(0, 1fr)`) as above. A grid track's size is computed by the parent
   and cannot be silently defeated by an intermediate `height: auto`, because
   an intermediate wrapper is either a grid item (sized by the track) or it is
   not in the chain at all.
2. **`min-height: 0` on every flex/grid item in the chain.** The default is
   `min-height: auto`, which means "never smaller than my content". This is the
   sibling bug and it produces the identical symptom - a `1fr` row that refuses
   to shrink and pushes the page taller than the viewport. Its horizontal twin
   is `min-width: 0`, which is what keeps a long unbroken path chip from
   widening a board column.
3. **`overflow: hidden` on `html, body` is a backstop, not a fix.** It stops the
   page scrolling, but if the chain is broken the bottom of the content is now
   simply unreachable - which is worse than a scrollbar, because it looks fine.
   Keep it, but never rely on it: pair it with the check in section 11.

The diagnostic, when it does break - walk up from the scroller and print the
first ancestor that is taller than its own box:

```js
function findBrokenLink(el) {
  const chain = [];
  for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
    const cs = getComputedStyle(n);
    chain.push({
      el: n.tagName + '.' + (n.className || ''),
      cssHeight: cs.height,
      minHeight: cs.minHeight,
      overflowY: cs.overflowY,
      client: n.clientHeight,
      scroll: n.scrollHeight,
      overflowing: n.scrollHeight > n.clientHeight + 1,
    });
  }
  console.table(chain);
  // The culprit is the lowest entry with overflowing:true and overflowY:visible.
}
findBrokenLink(document.querySelector('.pane-scroll'));
```

Two more traps specific to this shell:

- **`100vh` is not the viewport on a phone.** On mobile Safari and Chrome
  Android, `100vh` is the height with the URL bar *retracted*, so a `100vh`
  shell is taller than the visible area and the page scrolls by exactly the
  toolbar height. `100dvh` is the fix; keep the `100vh` line above it as the
  fallback. **I did not measure this** - my phone-width measurements were CSS
  viewports in a desktop Chromium iframe at 390x844, not a real phone. Verify
  on device before believing the phone column of section 7.
- **The canvas backing store is not the CSS box.** On this machine
  `devicePixelRatio` measured **2**. A canvas sized only with CSS renders at
  half resolution. Size it from the pane's measured content box in a
  `ResizeObserver`: `canvas.width = Math.round(rect.width * dpr)`,
  `canvas.height = Math.round(rect.height * dpr)`, then
  `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. Never `width: 100%; height: 100%`
  on a canvas alone - it stretches pixels and it also makes the canvas a
  content-sized element that can push the grid row open.

---

## 7. What happens at each size

Fixed chrome budget: status bar 40px, tab bar 44px, footer 28px on desktop.
Pane body height = viewport height - 112px on desktop.

### 1920x1080

- Pane body **968px**.
- BOARD: all six columns on one rail, no horizontal scroll (needs 1572, has
  1920). Track width lands near 298px, which is what the current page already
  resolves at this width. Each column scrolls independently; `done` (43 cards,
  5216px of content measured) scrolls inside its own 968px box instead of
  setting the height of a grid row.
- SITUATION: canvas 1520x968 with a 320px right rail with its own scroll. The
  rail holds the council list (contributor nodes) and the round log.
- RESEARCH: two-up tier columns.

### 1280x720 (and the operator's real 1272x806)

- Pane body **608px** at 720; **694px** at 806.
- BOARD: 1272 is below the 1572 threshold, so the rail scrolls horizontally.
  Four full columns plus a sliver of the fifth are visible; `scroll-snap-type:
  x proximity` snaps to column starts, and an edge fade plus a
  `[< 4 of 6 >]` chip in the board toolbar says out loud that two columns are
  off to the right. This is the entire fix for the y=4433 problem: the columns
  that used to be 5.5 screens down are now one sideways flick away, at the same
  vertical position as every other column.
- The pre-board chrome that currently eats 660px is demoted: the verdict
  sentence and the five stat tiles move into the status bar (section 8) and the
  SITUATION pane. Nothing above `.cards` is allowed to exceed **96px** in the
  BOARD pane - a single header row: column title, count, filter.
- HQ fits with room: measured 1244px of content today, and its pane body is
  608-694px, so it scrolls about one screen inside `.pane-scroll` rather than
  scrolling the page.
- RESEARCH: single tier column, internal scroll. 11185px of content today, so
  this pane will always scroll; that is fine, it is a reference surface.

### Phone (measured as 390x844 CSS viewport; NOT verified on a device)

- Status bar collapses to **32px**, one line, three numbers (section 8).
- Tab bar moves to the **bottom**, 56px, five icons with labels, inside
  `padding-bottom: env(safe-area-inset-bottom)`.
- Pane body = `100dvh - 32 - 56 - safe-area`.
- BOARD: `grid-auto-columns: 88%` so the next column peeks; `scroll-snap-type:
  x mandatory`. One column at a time, snapped, with the column name and count
  in the 40px pane header. The current page at 390 gives a single 338px track
  and 13733px of document - 16.3 screens; the snapped rail replaces that with
  six scrollers of at most one column each.
- RESEARCH: the `<table>` at `queen-tree.ts:251` must get
  `table-layout: fixed` plus `word-break: break-word` on its cells, or be
  replaced by a definition list below 640px. This is the **only measured
  horizontal overflow in the product**: 584px of table in a 338px box, 219px of
  page scrolled sideways. Do not ship the tab shell without fixing it, or the
  page will scroll horizontally *around* the shell and the tab bar will slide
  off screen with it.
- SITUATION: canvas takes at most 52% of pane height, rail stacks below it and
  owns the scroll.

---

## 8. The numbers that are never allowed to scroll away

`#statusbar` is a direct child of `#shell`, above `#tabbar`, outside every
pane. It is 40px tall on desktop, 32px on phone, and it is identical on all
five tabs. A tab that hides the state is how an operator ends up asking "why is
nothing happening", so the state is not in a tab.

Contents, left to right, all four from **public** endpoints so the strip is
populated before any token is pasted:

| slot | value | source | today's live reading |
|---|---|---|---|
| BEES | running / ceiling | `/queen/status` `dispatches.running`; ceiling from key count | `2` |
| KEYS | keys that can pay / configured | `/queen/status` latest dispatch outcome | `2 / 4` |
| ROUND | time since last tick, and time to next | `/queen/status` `lastTick.decidedAt` + `scheduler.intervalSeconds` (300) | last 07:07:30Z, every 5 min |
| DECISION | the Queen's own last sentence, truncated to one line, full text on hover and on tap | `/queen/status` `lastTick.refusal` or the latest dispatch `outcome` | "4 provider key(s) configured: 2 carrying a bee and 2 refused by the provider - top those up rather than adding another, a refused key is not extra capacity." |

Rules for the strip:

- It is `position: static` inside the grid, not `position: fixed`. Fixed
  positioning would work, but it takes the strip out of flow and then the pane
  height has to be corrected by hand - which is exactly the class of arithmetic
  that goes stale. A grid row cannot go stale.
- One line, `white-space: nowrap`, `min-width: 0` on each slot, and the
  DECISION slot gets `overflow: hidden; text-overflow: ellipsis` so a long
  refusal can never wrap the strip to two lines and steal a row from the panes.
- On phone, only BEES, KEYS and ROUND survive; DECISION becomes a dot that
  expands over the pane when tapped.
- KEYS turns amber when `can pay < configured` and red at `0`. Today it is
  amber: 2 of 4. That amber is the answer to "why is nothing happening" in the
  case the system is actually in right now.
- The strip refreshes on its own timer from `/queen/status` (small: a few
  hundred bytes) independently of the heavy `/queen/board` refresh, so it stays
  live even when the board request is slow or refused.

---

## 9. Redraw rules, because a 30s timer can undo all of this

The current board calls `setInterval(load, 30000)` and `draw()` does
`board.innerHTML = ''` (`queen-kanban.ts:870`). With per-column scrollers that
becomes a visible defect: every 30 seconds each column jumps back to the top
under the operator's cursor.

Required:

1. Before a redraw, capture `scrollTop` for every `.pane-scroll` and
   `scrollLeft` for `.board`, keyed by column key; restore after.
2. Keep the existing discipline from the source comments: `draw()` assigns into
   permanent nodes and never inserts a sibling. The file already records what
   happened when it did - the board top measured 4135px down the document after
   five refreshes (`queen-kanban.ts:846-852`), and an hour-old HQ tab carried
   120 copies of the legend (`queen-hq.ts:148-151`).
3. Only the active pane redraws. Inactive panes are `display: none` and get
   their data on activation. This also means an inactive pane contributes no
   layout, so a broken height chain in a hidden pane cannot push the shell.

Note on `/queen/dashboard`: I could not measure it populated. Its data comes
from `/queen/lease`, which is guarded and whose response shape differs from the
board's, so my fetch stub drew nothing and the 720px / "1.0 screens" reading in
section 2.3 is the empty shell, not the dashboard. Treat SWARM's pane budget as
unmeasured.

---

## 10. The SITUATION pane, sized

This is the game view; its content is specified elsewhere. What belongs here is
only its box.

```
+--------------------------------------------------------------+
| #statusbar                                             40px   |
+--------------------------------------------------------------+
| #tabbar   SITUATION | BOARD | HQ | RESEARCH | SWARM    44px   |
+---------------------------------------+----------------------+
|                                       | .sit-rail  320px      |
|  <canvas> compute topology            |  (.pane-scroll)       |
|  sized by ResizeObserver              |  council nodes        |
|  never scrolls                        |  panic meters         |
|  minmax(0,1fr)                        |  round log            |
|                                       |  min-height: 0        |
+---------------------------------------+----------------------+
| #footer                                                28px   |
+--------------------------------------------------------------+
```

```css
.pane[data-pane="situation"][data-active] {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
}
@media (max-width: 1100px) { /* rail narrows before it stacks */
  .pane[data-pane="situation"][data-active] {
    grid-template-columns: minmax(0, 1fr) 280px;
  }
}
@media (max-width: 820px) {  /* stack: canvas on top, rail below, rail scrolls */
  .pane[data-pane="situation"][data-active] {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 52%) minmax(0, 1fr);
  }
}
```

The canvas element itself: `display: block; width: 100%; height: 100%;` and its
`width`/`height` **attributes** set from a `ResizeObserver` on its parent, times
`devicePixelRatio` (measured 2 on this machine). Debounce the observer to one
resize per animation frame; a canvas reallocation per resize event during a
window drag is the usual source of a stutter.

**I did not measure any frame rate, and I am not quoting one.** t27.ai already
ships three.js in its bundle, but whether a topology view holds a frame budget
on this machine is unmeasured; if the SITUATION pane is built on WebGL, measure
it before claiming anything about smoothness, and give the pane a
`prefers-reduced-motion` and a static-SVG fallback path.

---

## 11. Acceptance checks

These are the checks that would have caught the current state. Run them in the
page console, at each width, **with real data loaded**.

```js
// 1. The page never scrolls. This is the whole contract.
const de = document.documentElement;
console.assert(de.scrollHeight <= de.clientHeight + 1, 'PAGE SCROLLS VERTICALLY', de.scrollHeight, de.clientHeight);
console.assert(de.scrollWidth  <= de.clientWidth  + 1, 'PAGE SCROLLS HORIZONTALLY', de.scrollWidth, de.clientWidth);

// 2. Nothing crosses the viewport edge.
[...document.querySelectorAll('*')].forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.right > de.clientWidth + 0.5 || r.left < -0.5) {
    console.warn('OVERFLOWS', el, Math.round(r.left), Math.round(r.right));
  }
});

// 3. Exactly one scroll owner per active pane, and it is a .pane-scroll.
const pane = document.querySelector('.pane[data-active]');
const owners = [...pane.querySelectorAll('*')].filter(n => n.scrollHeight > n.clientHeight + 1);
owners.forEach(n => console.assert(n.matches('.pane-scroll, .cards, .board'), 'UNDECLARED SCROLLER', n));

// 4. The status numbers are on screen on every tab.
['bees','keys','round','decision'].forEach(id => {
  const r = document.getElementById('stat-' + id).getBoundingClientRect();
  console.assert(r.top >= 0 && r.bottom <= de.clientHeight, 'STATUS OFF SCREEN: ' + id);
});

// 5. No column is below the fold by wrapping. (Every column top is equal.)
const tops = [...document.querySelectorAll('.board > section')].map(s => Math.round(s.getBoundingClientRect().top));
console.assert(new Set(tops).size === 1, 'COLUMNS WRAPPED', tops);
```

Check 5 is the one that fails today: at 1272 the tops are
`[660, 660, 660, 660, 4433, 4433]`.

Widths to run at: 390, 768, 1272, 1280, 1440, 1600, 1920. Heights: 600, 720,
806, 1080. The 1280x600 case matters because a laptop with a docked devtools
panel lands there, and HQ already measured 2.07 screens at that height.

---

## 12. What I could not measure, stated plainly

- **The authenticated board.** I have no bearer token. Section 2.2 is a
  simulation: real CSS, real `draw()`, real card count and titles from
  `/queen/public-board`, but `paths`, `worker` and `detail` invented by me. The
  zero-horizontal-overflow result there is therefore weaker than the
  section 2.1 result, which is fully live.
- **`/queen/dashboard` populated.** Guarded behind `/queen/lease` with a
  different response shape. Only the empty shell was measured. SWARM's height
  budget is unknown.
- **`/queen/hq` populated at 1920.** It measured 1244px at every desktop width,
  which is suspicious in the sense that it did not vary at all - the value is
  real but HQ's hive strip renders 5 cells and 15 rows from board data whose
  `pulse` lacks `workerKeys`, so a token-loaded HQ may be taller. Unmeasured.
- **Any real phone.** All phone numbers are CSS viewports in desktop Chromium
  iframes at 390x844 and 320x568. `100dvh`, the URL-bar collapse, momentum
  scrolling and `env(safe-area-inset-*)` are all unverified on device.
- **The operator's browser chrome height.** `outerHeight` read 0 on a
  background tab, so I know the viewport is 806px but not what the window
  height is.
- **The exact 6-column threshold.** 1572px is arithmetic from the CSS, not a
  bisection. It is consistent with four measured widths but I did not test
  1571 and 1573.
- **Any frame rate, for anything.** No rendering benchmark was run. No number
  about animation performance appears in this document.
- **One transient I saw and did not chase:** a first `curl` of `/queen/hq` did
  not return within roughly 100 seconds; an immediate retry returned 200 in
  0.63s. I have no measurement of what that was and it is not treated as a
  layout finding.
