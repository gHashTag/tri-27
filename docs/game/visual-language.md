# Study 4 — the visual language

The ink, the chrome, the type, the globe, the motion and the contrast for
`t27.ai/#/queen` as a Mission-Control game over the network of contributed
compute.

Written 2026-09-03. Companion to, and deliberately non-overlapping with:

- `/Users/playra/tri-27/docs/game/engine-benchmark.md` — engine choice (canvas2D, no engine)
- `/Users/playra/tri-27/docs/game/queen-mission-control.md` — the XCOM shape mapped to what the supervisor measures
- `/Users/playra/tri-27/docs/game/viewport-layout.md` — the tab set and the height chain

Those three say *what is drawn, from what data, in what box*. This says *what it
looks like*. Every colour, weight and rate below was either read out of the
site's shipped CSS or produced by a run I made today. Where I did not measure, the
sentence says so.

Working prototype and specimens (scratch, will not survive a reboot):
`/tmp/vislang/shell.html`, `/tmp/vislang/globe3.html`, `/tmp/vislang/globe-core.js`,
`/tmp/vislang/glyphs.html`, `/tmp/vislang/frames.html`, `/tmp/vislang/cascade.html`.

---

## 0. The reconciliation, in one paragraph

XCOM's Mission Control is *volumetric* — the globe emits cyan, the panels glow,
light is the medium and everything is made of it. The author's canon is
*reflective* — pale cream-silver ink catching light on matte near-black, one
burnished-gold element per page, and `canon-cover-style` bans "neon", "halos",
"glow effects" and "any third colour" by name. Taken whole, either one destroys
the other: all-cyan and the Queen stops belonging to t27.ai; all-canon and you
get a beautiful copperplate that cannot show a state change. **So XCOM wins the
geometry and the canon wins the ink.** XCOM decides what is on the plate and how
it is arranged — one object that is the entire strategic state, a limb that
blooms, a terminator that sweeps, rings round the nodes, arcs with travelling
pulses, a right-hand rail of events, a strip of numbers that never scrolls. The
canon decides what those marks are made of — every *structural* mark (graticule,
limb, bezel, panel rules, panel titles, labels, frame corners) is cream `#D8CDB0`
at engraving weights on matte `#080A0C`, and gold `#C9A24B` is spent on exactly
one channel per surface, the way a canon cover spends it on exactly one title.
Colour is admitted only where it carries a reading — a node's hardware class, a
node's health, a key's state — and never decoratively. Glow is admitted in
exactly one place, the limb, at an alpha low enough to be a haze rather than a
halo, because without it the object is a wireframe ball and the whole XCOM read
collapses; that single exception is the price of the substitution the operator
asked for, and it is cheap because it is one `createRadialGradient` fill and it
never pulses.

| Question | Winner | Why |
|---|---|---|
| Background | canon | `#080A0C`, matte near-black. Canon forbids pure `#000`; the site's `--bg` is `#000000`. Near-black gives the limb bloom something to sit on. |
| Structural line colour | canon | cream `#D8CDB0`. Cyan graticule is the single biggest "sci-fi dashboard" tell. |
| Globe silhouette | XCOM | limb bloom, not a hard circle. This is the whole hologram read. |
| Accent | canon | one gold channel per surface (`#C9A24B`), not `#FFD700` and not cyan-everything. |
| Semantic colour | XCOM (constrained) | ok/warn/crit exist and are the site's own greens/oranges/reds — but only on marks that carry a reading. |
| Hardware classes | both | XCOM gives them colour; canon gives them *shape*, and shape is primary (§6.3 measures why). |
| Corner radius | canon | 2px, not the site's 8–14px. An engraved plate has no rounded card corners. |
| Type | site | Outfit + JetBrains Mono, unchanged. Neither aesthetic gets to import a font. |
| Motion | operator | §5. Both references animate more than a read surface may. |

---

## 1. Tokens

### 1.1 What the site actually has today (measured)

`/Users/playra/tri-27/apps/website/src/index.css:2-11` is the only live `:root`:

```
--bg #000000 · --accent #00FF88 · --accent-dark #00CC66 · --text #FFFFFF
--muted #888888 · --border rgba(255,255,255,0.08) · --golden #FFD700
--font 'Outfit', system-ui, -apple-system, sans-serif
```

`App.css` declares a second, contradicting `:root` (`--bg:#0a0a0a`,
`--border:#222`, `--accent:#00d4ff`). **`grep -rn "App.css" src/` returns zero
hits** — it is imported by nothing, so `#00d4ff` is dead. Do not build on it.

Nine components hard-code the same six-name palette, which is the real house
standard (`components/TrinityStatusWidget.tsx:13-18` and eight siblings):

```
GOLD #ffd700 · CYAN #00ccff · PURPLE #aa66ff · GREEN #00ff88 · RED #ff4444 · ORANGE #ff8833
```

Hex frequency across `apps/website/src` (`grep -rhoE '#[0-9a-f]{6}' | sort | uniq -c`):
`#ffd700` 277, `#00ccff` 142, `#00e599` 115, `#aa66ff` 100, `#00ff88` 100,
`#d4af37` 70, `#ff4444` 47, `#ff8833` 23.

Canon, from `~/skills/canon-cover-style/SKILL.md:63-64`: background "near-#0A0A0A,
**NEVER** pure black"; title gold `#C9A24B`; every other mark pale silver-cream
`#D8CDB0`.

### 1.2 The Queen token set

All prefixed `--q-` and scoped to `.queen-shell`, so nothing here can leak into
the 233 website commits' worth of pages that already work.

**Surfaces**

| token | hex | oklch | role | status |
|---|---|---|---|---|
| `--q-bg` | `#080A0C` | `oklch(14.3% 0.006 246)` | page canvas, globe plate | **NEW** — site is `#000000`, canon asks for near-`#0A0A0A` |
| `--q-panel` | `#0F1113` | `oklch(17.6% 0.005 248)` | panel fill. Equals `rgba(255,255,255,.03)` over `--q-bg`; declared as a solid hex so contrast is computable | **NEW** (Queen.css uses `#131318` via a `--bg-subtle` fallback) |
| `--q-panel-hi` | `#17191B` | `oklch(21.2% 0.005 248)` | hovered/active row, selected card | **NEW** |

**Rules**

| token | value | vs `--q-panel` | role | status |
|---|---|---|---|---|
| `--q-rule-soft` | `rgba(216,205,176,.14)` → `#2B2B29` | 1.33 : 1 | inner hairlines, row separators | **NEW** |
| `--q-rule` | `rgba(216,205,176,.26)` → `#43423C` | 1.88 : 1 | panel border, strip/tab/footer edges | **NEW** (site's `--border` is `rgba(255,255,255,.08)` → 1.21 : 1, a neutral grey; this is warm and one stop stronger) |
| `--q-rule-strong` | `#6B675B` | **3.35 : 1** | any boundary that carries meaning: active-pane edge, focus ring underlay, column divider on BOARD | **NEW** — exists solely to satisfy WCAG 1.4.11 |

**Text**

| token | hex | oklch | on `--q-panel` | role | status |
|---|---|---|---|---|---|
| `--q-text` | `#F2EFE6` | `oklch(95.2% 0.012 91)` | **16.46 : 1** | primary text, log messages, node names | **NEW** — a warm cream-white; site uses `#FFFFFF` (18.92 : 1), which next to cream ink reads blue |
| `--q-dim` | `#A79E8C` | `oklch(70.2% 0.028 85)` | **7.13 : 1** | labels, blurbs, inactive tabs | **NEW** — site's `--muted #888888` gives only 5.34 : 1 and is hue-neutral |
| `--q-off` | `#7A8590` | `oklch(61.1% 0.021 248)` | **5.03 : 1** | offline / empty / absent. Deliberately the one cool grey, so "not there" is the only cool neutral on the plate | **NEW** |

**Gold — one channel per surface**

| token | hex | oklch | on `--q-panel` | role | status |
|---|---|---|---|---|---|
| `--q-gold` | `#C9A24B` | `oklch(73.1% 0.115 85)` | 7.89 : 1 | the round clock, its bezel arc, the active-tab underline. Nothing else. | **NEW to CSS**; it is `canon-cover-style`'s exact burnished gold |
| `--q-gold-hi` | `#FFD700` | `oklch(88.7% 0.182 95)` | 13.49 : 1 | a 600 ms colour hold on a number that just changed, and nothing else | **ALREADY** — `index.css:8 --golden`, 277 uses site-wide |

Why both: at 13.49 : 1 `#FFD700` sits between cream (16.46) and white — used as
the resting accent it reads as a second white, not as gold. It earns its keep as
the *momentary* state, where higher luminance is exactly the point.

**Semantic**

| token | hex | oklch | on `--q-panel` | meaning | status |
|---|---|---|---|---|---|
| `--q-ok` | `#00FF88` | `oklch(87.6% 0.228 152)` | 14.11 : 1 | live, accepted, round decided | **ALREADY** — `index.css:3 --accent`; `GREEN` in 9 components |
| `--q-warn` | `#FF8833` | `oklch(74.6% 0.171 52)` | 7.95 : 1 | degraded, refused key, panic 3–4, needs a boundary | **ALREADY** — `ORANGE` in 9 components |
| `--q-crit` | `#FF4444` | `oklch(66.4% 0.223 26)` | 5.55 : 1 | blackout, panic 5, escalation unanswered | **ALREADY** — `RED` in 9 components, 47 hex uses |
| `--q-off` | `#7A8590` | — | 5.03 : 1 | offline (see Text) | **NEW** |

**Hardware classes**

| token | hex | oklch | on `--q-panel` | glyph | status |
|---|---|---|---|---|---|
| `--q-cpu` | `#D8CDB0` | `oklch(85.0% 0.041 90)` | 11.96 : 1 | **square** | **NEW to CSS** — the canon cream; appears as a literal in 4 files (`pages/Resources.tsx`, `pages/Blog.tsx`, two blog bodies) as `#d4af37`'s neighbour |
| `--q-fpga` | `#00CCFF` | `oklch(78.6% 0.148 224)` | 9.98 : 1 | **hexagon** | **ALREADY** — `CYAN` in 12+ files, 142 hex uses |
| `--q-gpu` | `#AA66FF` | `oklch(65.6% 0.219 301)` | 5.45 : 1 | **triangle, point up** | **ALREADY** — `PURPLE` in 8+ files, 100 hex uses |

CPU is cream because CPU is the baseline — today it is two of the four slots
(study 2 §3), and the baseline should be made of the plate's own ink. FPGA takes
cyan because cyan is the one glow colour already admitted (the limb), and the
FPGA is the branch that will grow. GPU takes purple because it is the empty slot
and purple is the site's furthest-from-everything hue.

**Type**

| token | value | status |
|---|---|---|
| `--q-font` | `'Outfit', system-ui, -apple-system, sans-serif` | **ALREADY** — `index.css:9 --font`, self-hosted variable 400–800, latin subset only |
| `--q-mono` | `'JetBrains Mono', 'SFMono-Regular', ui-monospace, monospace` | **ALREADY** — self-hosted 400–500, latin + cyrillic subsets, in `index.html` |

Neither aesthetic gets a new font. Canon asks for baroque italic-serif; that is a
*rendered engraving* convention and it does not survive at 10 px in a browser at
DPR 2. The canon's typographic contribution here is the wide uppercase tracking
and the small caps-height labels, not the face.

**Declaration block**

```css
.queen-shell {
  --q-bg:#080A0C; --q-panel:#0F1113; --q-panel-hi:#17191B;
  --q-rule-soft:rgba(216,205,176,.14);
  --q-rule:rgba(216,205,176,.26);
  --q-rule-strong:#6B675B;
  --q-text:#F2EFE6; --q-dim:#A79E8C; --q-off:#7A8590;
  --q-gold:#C9A24B; --q-gold-hi:#FFD700;
  --q-ok:#00FF88; --q-warn:#FF8833; --q-crit:#FF4444;
  --q-cpu:#D8CDB0; --q-fpga:#00CCFF; --q-gpu:#AA66FF;
  --q-font:'Outfit',system-ui,-apple-system,sans-serif;
  --q-mono:'JetBrains Mono','SFMono-Regular',ui-monospace,monospace;
  --q-strip:40px; --q-tabs:44px; --q-foot:28px;
}
```

### 1.3 Three collisions in the shipped Queen CSS, measured

I loaded the real `index.css` and the real `Queen.css` together in a browser and
read `getComputedStyle` (`/tmp/vislang/cascade.html`). All three are live today:

1. **The Queen page is green, not purple.** `Queen.css` writes
   `var(--accent, #7c5cff)` in seven places. `--accent` *is* defined
   (`index.css:3` = `#00FF88`), so the purple fallback never renders. Measured:
   active-tab border `rgb(0,255,136)`, active-tab background
   `color(srgb 0 1 0.533 / 0.14)`, `.queen-board-count` `rgb(0,255,136)`,
   `.queen-board-card code` `rgb(0,255,136)`. Anyone reading `Queen.css` to learn
   the page's colour learns the wrong one.
2. **`--text-muted`, `--surface` and `--bg-subtle` are defined nowhere.** Measured:
   both resolve to the empty string, so `Queen.css`'s inline fallbacks are the
   real values — `#9a9aa2` (metric labels, measured `rgb(154,154,162)`) and
   `#131318` (column background, measured `rgb(19,19,24)`).
3. **`.queen-board-needs` never renders amber.** `Queen.css` ends with
   `.queen-board-needs { color:#ff9800 }` — specificity `(0,1,0)` — but the
   earlier rule `.queen-board-card em { color: var(--text-muted,#9a9aa2) }` is
   `(0,1,1)` and wins. Measured on that exact markup: `rgb(154,154,162)`. The
   marker that says "this card cannot be delegated" is grey. This block exists
   only in `tri-27`; `trinity`'s `Queen.css` does not carry it at all.

None of this is a reason to keep or discard anything above; it is the reason the
new tokens are `--q-`-prefixed and declared on one element, and the reason §2's
CSS uses class selectors of uniform specificity.

---

## 2. Panel chrome

A panel is a **plate**: a flat fill, a hairline border, two engraved corner marks
diagonally opposite, and a title rule. It is not a card. No shadow, no blur, no
gradient, no `backdrop-filter`, no radius above 2 px.

The corner marks are the canon's "full baroque engraved frame around page edge"
reduced to the two marks that survive at 10 px. Verified legible in the 400 pt
capture.

```css
.q-panel {
  position: relative;
  min-width: 0;                       /* horizontal twin of min-height:0 */
  background: var(--q-panel);
  border: 1px solid var(--q-rule-soft);
  border-radius: 2px;
}

/* Two 9x9 engraved corner brackets, top-left and bottom-right. They sit ON the
   border (-1px), so at DPR 2 they land on the same device row as the hairline
   and do not double. */
.q-panel::before,
.q-panel::after {
  content: ''; position: absolute; width: 9px; height: 9px;
  border: 1px solid var(--q-rule); pointer-events: none;
}
.q-panel::before { top: -1px;  left: -1px;  border-right: 0; border-bottom: 0; }
.q-panel::after  { bottom:-1px; right:-1px; border-left: 0;  border-top: 0;    }

/* Title bar: the name on the left, the number on the right, a rule under both. */
.q-panel > h2 {
  margin: 0; padding: 7px 10px 6px;
  display: flex; justify-content: space-between; align-items: baseline; gap: 10px;
  font: 600 10px/1 var(--q-font);
  letter-spacing: .20em; text-transform: uppercase;
  color: var(--q-text);
  border-bottom: 1px solid var(--q-rule-soft);
}
.q-panel > h2 .n {
  font: 500 11px/1 var(--q-mono);
  letter-spacing: 0; font-variant-numeric: tabular-nums;
  color: var(--q-dim);                /* NOT gold — see the one-gold rule below */
}
.q-panel > h2 .n[data-act] { color: var(--q-gold); }  /* only the number the
                                                         operator is being asked
                                                         to act on */
.q-panel-body { padding: 8px 10px; }

/* The pane that has keyboard focus gets a MEANINGFUL boundary, so it uses the
   3:1 rule, not the hairline. */
.q-panel:focus-within { border-color: var(--q-rule-strong); }

/* Focus ring. 16.46:1 against the panel, and it does not move layout. */
.queen-shell :focus-visible {
  outline: 2px solid var(--q-text); outline-offset: 2px; border-radius: 2px;
}

/* Machine-generated strings. queen-hq.ts contains ZERO word-break or
   overflow-wrap declarations (study 2 §10) and renders a 176-character refusal
   inside a <code>. Every such element carries this. */
.queen-shell code,
.queen-shell .q-machine,
.queen-shell .log .ms { overflow-wrap: anywhere; }

/* The hidden attribute is a UA rule and loses to any author display rule.
   That exact bug left a token form on screen with 57 cards behind it. */
.queen-shell [hidden] { display: none !important; }
```

**The one-gold rule, made implementable.** Gold marks exactly one *channel* per
surface, and that channel is always "time and attention":

- the active tab's 2 px bottom border,
- the `ROUND` value in the status strip,
- the round-progress arc on the globe bezel,
- and, transiently, a panel count that the operator is being asked to act on
  (`[data-act]`).

Everything else that would have been gold is `--q-dim` or `--q-text`. In the
verified 1272×806 capture, four gold marks appear and three of them are the same
reading (the round) drawn three ways; that is the rule working.

**Panel variants** — only three, distinguished by the *left* edge, never by fill:

```css
.q-panel[data-tone="warn"] { box-shadow: inset 2px 0 0 var(--q-warn); }
.q-panel[data-tone="crit"] { box-shadow: inset 2px 0 0 var(--q-crit); }
.q-panel[data-tone="off"]  { box-shadow: inset 2px 0 0 var(--q-off);
                             color: var(--q-off); }
```

`inset box-shadow` rather than `border-left-width`, because changing a border
width changes the content box and reflows the panel's children — a panel that
changes tone must not change geometry (§5).

---

## 3. Typography

One family for words, one for numbers. **Every number the operator reads is in
`--q-mono`**, and that is not a style preference — it is measured:

> Outfit at 40 px, default figures: `11111` = **69.30 px**, `00000` = **131.20 px**.
> A 61.9 px difference over five digits — **0.31 em of horizontal shift per digit**.
> With `font-variant-numeric: tabular-nums`: 118.0 px = 118.0 px. JetBrains Mono
> at 500: 120.0 px = 120.0 px (0.60 em advance).
> (`/tmp/vislang/fonttest.html`, real self-hosted woff2 from
> `apps/website/public/fonts/`, both faces reported `loaded`.)

So Outfit *does* ship a working `tnum`, and the site's 13 existing
`tabular-nums` declarations are effective. But a strip number in Outfit without
it moves ~4.6 px per digit at 15 px every time a `1` becomes a `0` — a number
that visibly twitches every round. Mono removes the failure mode instead of
depending on a feature flag.

| element | family | size | weight | tracking | colour | notes |
|---|---|---|---|---|---|---|
| **strip value** (`BEES 2/2`, `KEYS 2/4`, `ROUND 02:41`) | mono | 15px | 500 | `.01em` | `--q-text`; warn→`--q-warn`, round→`--q-gold` | `font-variant-numeric: tabular-nums` anyway, belt and braces; `white-space:nowrap` |
| **strip label** | Outfit | 10px | 400 | `.16em` | `--q-dim` | uppercase; `.10em` / 9px below 820px |
| **strip DECISION** | Outfit | 12px | 400 | `0` | `--q-dim` | `overflow:hidden; text-overflow:ellipsis`; the whole slot is `display:none` below 820px — the label too (§6.4) |
| **tab label** | Outfit | 11px | 500 | `.18em` | `--q-dim`; active `--q-text` | uppercase; `.12em` and `padding:0 10px` below 820px |
| **tab keycap** | mono | 9px | 400 | `0` | `--q-off` | `display:none` below 820px |
| **panel title** | Outfit | 10px | 600 | `.20em` | `--q-text` | uppercase |
| **panel count** | mono | 11px | 500 | `0` | `--q-dim` / `--q-gold` when `[data-act]` | tabular |
| **log timestamp** | mono | 11px | 400 | `0` | `--q-off` | tabular; `HH:MM:SS`, no date |
| **log level** | mono | 11px | 400 | `.06em` | `ok/warn/crit/dim` | padded to 4 chars (`OK  `, `WARN`, `CRIT`, `····`) so the message column never shifts |
| **log message** | mono | 11px | 400 | `0` | `--q-text` | `line-height:1.45`; `overflow-wrap:anywhere` |
| **rail node name** | Outfit | 12px | 400 | `0` | `--q-text` | `text-overflow:ellipsis` |
| **rail node state** | mono | 10px | 400 | `.08em` | semantic | uppercase |
| **body / blurb** | Outfit | 12px | 400 | `0` | `--q-dim` | `line-height:1.5`, `max-width:60ch` |
| **globe node label** | Outfit | 10px | 500 | `.02em` | `--q-text` live / `--q-off` otherwise | canvas `ctx.font = "500 10px 'Outfit', system-ui, sans-serif"` |
| **globe value chip** | mono | 10px | 500 | `0` | class colour | tabular by construction |

**Log rows are a three-column grid, not a flowed line:**

```css
.log { display: grid; grid-template-columns: auto auto minmax(0,1fr); gap: 0 8px;
       font: 400 11px/1.45 var(--q-mono); }
```

A wrapped message must indent under the message column, not under the timestamp.
Verified at 400 pt: a 64-character repo path wraps four times inside its own
column and the timestamps stay in a straight line.

**Canvas fonts have a load race.** `ctx.fillText` does not wait for a web font.
In the animated case the rAF loop repaints and you never see it; **under
`prefers-reduced-motion` there is no loop**, so the one and only paint can land
in the fallback face and stay there. Gate the first paint:

```js
await document.fonts.load("500 10px 'Outfit'");
await document.fonts.load("500 10px 'JetBrains Mono'");
```

**Cyrillic.** Outfit's self-hosted subset is latin-only (`index.html:118`) —
the site's own comment records that Russian already falls back to `system-ui`.
JetBrains Mono ships a cyrillic subset. So: the Queen page's Russian strings
(`Queen.tsx` carries a full `RU` map) render in `system-ui`, and any Russian in a
mono context renders correctly. Do not set tracking above `.10em` on a label
that can be Russian — `system-ui` at 10 px with `.20em` tracking is unreadable.

---

## 4. The globe

Hand-written canvas2D, per study 1. Orthographic projection, rotation about Y,
fixed tilt of **−20°** about X so the parallels curve and the pole is visible —
without the tilt an orthographic sphere reads as a disc with lines on it.

Built and measured: `/tmp/vislang/globe3.html`. On this M1 Pro, Chrome 148,
DPR 2, a 952×806 CSS canvas (1904×1612 backing store), 8 nodes, 2 arcs,
12 meridians + 5 parallels + equator + terminator + 72-tick bezel:
**1305 frames sampled, CPU p50 1.2 ms, p95 1.5 ms, max 2.6 ms; frame delta
p50 8.3 ms, p95 9.0 ms; zero frames over 16.7 ms.** That is the whole scene
including labels, at the product's real node count.

### 4.1 The six moves that make it a hologram and not a wireframe ball

1. **The limb blooms.** A wireframe ball has a hard silhouette. A radial gradient
   ring straddling `R` is the single strongest cue and it is one fill.
2. **The interior is a medium.** A faint radial wash, offset up-left, drawn
   *between* the back-face lines and the front-face lines. That layer order is
   the trick: the back lines are then literally seen *through* something.
3. **Back faces are drawn, not culled.** Culling makes a solid ball. Drawing them
   at ~18 % of front alpha and half the width makes a shell.
4. **Line weight varies with depth.** A wireframe strokes at constant width. Here
   both alpha and `lineWidth` are functions of |z|, so lines gain toward the
   centre and vanish at the limb — which is what an orthographic projection of a
   real surface does.
5. **There is a bezel.** A cream ring outside the limb with 72 ticks. This is the
   canon's engraved-instrument move, and it is what stops the object reading as a
   planet and starts it reading as an instrument.
6. **Nothing uses `ctx.shadowBlur`.** It is the naive route to glow, it is
   expensive, and it blurs `fillText`. The site uses it in exactly one place
   (`components/QuantumCanvas.tsx:812`). All softness here is gradients.

### 4.2 Drawing order — exact, and the order is load-bearing

```
 0  ctx.clearRect(0,0,W,H); ctx.fillStyle=--q-bg; ctx.fillRect(0,0,W,H)
 1  graticule(back)        z <  0   cream, α 0.055 + 0.030|z|, lw 0.5
 2  nodes(back)            z <  0   glyph outline only, α 0.18, r 3.7
 3  interior wash          createRadialGradient(cx-0.30R, cy-0.34R, 0.05R, cx, cy, R)
                             0.00 cream α .085 · 0.55 cream α .034 · 1.00 cyan α 0
                           arc(cx,cy,R) → fill
 4  graticule(front)       z >= 0   cream, α (0.10 + 0.20|z|) x boost, lw 0.8 + 0.5|z|
 5  night cap              save(); arc(cx,cy,R); clip();
                           terminator polyline closed out on the anti-sun side;
                           fill rgba(0,0,0,0.34); restore()
 6  terminator             pass A lw 5   cyan  α .075 front / .02 back
                           pass B lw 1.4 --q-text α .55 front / .12 back
 7  arcs + pulses          per running bee
 8  nodes(front) + panic rings
 9  limb bloom             createRadialGradient(cx,cy,0.90R, cx,cy,1.07R)
                             0.00 α 0 · 0.62 α .10 · 0.78 α .16 · 1.00 α 0   (cyan)
                           arc(cx,cy,1.07R) → fill
10  limb hairline          arc(cx,cy,R); lw 1; cream α .30; stroke
11  bezel                  ring at 1.22R + 72 ticks + the gold round arc
12  labels                 leader tick + fillText, front hemisphere only
```

Two order facts that are not interchangeable: **the wash must sit between the
back and front graticules** (step 3 between 1 and 4) or the shell reads as flat
line art; and **the limb bloom must be last, over the nodes** (step 9 after 8) or
nodes near the limb punch through the haze and the silhouette hardens again.

### 4.3 Geometry and the exact 2D operations

```js
const TILT = -20 * Math.PI/180, ct = Math.cos(TILT), st = Math.sin(TILT);

// rotate about Y by th, then about X by TILT; z' > 0 is toward the viewer
function proj(x, y, z, th, cx, cy, R) {
  const c = Math.cos(th), s = Math.sin(th);
  const X  =  x*c + z*s;
  const Z  = -x*s + z*c;
  const Y2 =  y*ct - Z*st;
  const Z2 =  y*st + Z*ct;
  return [cx + R*X, cy - R*Y2, Z2];
}
function ll(latDeg, lonDeg) {                       // lat/lon -> unit sphere
  const la = latDeg*Math.PI/180, lo = lonDeg*Math.PI/180;
  return [Math.cos(la)*Math.cos(lo), Math.sin(la), Math.cos(la)*Math.sin(lo)];
}
```

`cx = W/2`, `cy = H/2`, **`R = Math.min(W,H) * 0.335`** — the 0.335 leaves room
for the bezel at `1.22R` plus its 9 px major ticks plus a label gutter. At the
operator's 1272×806 with a 320 px rail that is `R = 232`; at 400 pt stacked it is
`R = 127` and still legible (verified capture).

**Sizing.** Never `width:100%;height:100%` on a canvas alone — it stretches
pixels *and* makes the canvas content-sized, which can push the `1fr` grid row
open. A `ResizeObserver` on the parent, debounced to one resize per animation
frame:

```js
canvas.width  = Math.round(rect.width  * dpr);   // dpr = min(devicePixelRatio, 2)
canvas.height = Math.round(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

**Graticule.** 12 meridians every 30°, 4 parallels at ±30 / ±60, plus the
equator. Not 7 parallels — fewer lines is more instrument, less ball. 48 segments
per circle. Each segment is its own `beginPath/moveTo/lineTo/stroke`, because
alpha and width vary per segment and a stroke cannot carry per-vertex alpha.

Weight boosts, measured against each other in the specimen sheet:

| line | boost | front α | front lw |
|---|---|---|---|
| meridian at 0/90/180/270° | 1.30 | 0.13 → 0.39 | 1.04 → 1.69 |
| other meridians | 0.72 | 0.07 → 0.22 | 0.58 → 0.94 |
| parallels ±30° | 0.95 | 0.10 → 0.29 | 0.76 → 1.24 |
| parallels ±60° | 0.62 | 0.06 → 0.19 | 0.50 → 0.81 |
| equator | 1.35 | 0.14 → 0.41 | 1.08 → 1.76 |
| any line, back face | — | 0.055 → 0.085 | 0.5 flat |

(range shown limb → centre; α = `(0.10 + 0.20·|z|)·boost`, lw = `(0.8 + 0.5·|z|)·boost`.)

**Terminator.** In an orthographic projection a great circle projects to an
ellipse; rather than solve it, sample the great circle at 96 points and stroke a
polyline. Build the basis from the plane normal:

```js
function greatCirclePts(n, th, cx, cy, R, N) {      // n = unit normal
  let t = Math.abs(n[1]) < 0.9 ? [0,1,0] : [1,0,0];
  let u = cross(n, t); u = normalise(u);
  const v = cross(n, u);
  const out = [];
  for (let i = 0; i <= N; i++) {
    const a = i/N * Math.PI*2;
    const p = [u[0]*Math.cos(a)+v[0]*Math.sin(a),
               u[1]*Math.cos(a)+v[1]*Math.sin(a),
               u[2]*Math.cos(a)+v[2]*Math.sin(a)];
    out.push(proj(p[0],p[1],p[2], th, cx, cy, R));
  }
  return out;
}
const sweep = ((tMs/1000) % 300) / 300 * Math.PI*2;         // ROUND = 300 s
const sun   = normalise([Math.cos(sweep), 0.34, Math.sin(sweep)]);
```

The terminator is **not decoration**: its normal is the round phase, so the
shadow edge crossing the map *is* the five-minute round measured live at
299.94 s (study 2 §2). It is drawn in two passes — a 5 px cyan underglow at
α 0.075 and a 1.4 px `--q-text` core at α 0.55 — because a single cream line at
graticule weight disappears into the graticule. Verified: in the v2 capture with
one cream pass the terminator was indistinguishable; in v3 with two passes it is
the brightest structural line on the plate.

**Night cap.** Clip to the limb circle, trace the terminator polyline, then close
it by extending both endpoints `3R` along the anti-sun direction, fill
`rgba(0,0,0,0.34)`. Drawn *after* the front graticule so it dims the lines it
covers — that is what makes it read as shadow rather than as a translucent lens.

**Node glyphs.** Radius `r = 4.6` CSS px. Every glyph is **outline-dominant**:
1.5 px stroke at full class alpha, plus a fill of the same colour at `α·0.34`.
A solid fill at 4.6 px is a blob and the shape is lost — verified on the specimen
sheet, where all three shapes read at 1× and at 2×.

| class | path | why |
|---|---|---|
| CPU | `rect(x-r, y-r, 2r, 2r)` | a chip package |
| FPGA | 6 points at `i·π/3`, radius `1.12r` | a lattice cell |
| GPU | triangle up, `k = 1.35r`: `(x, y-k) (x+0.87k, y+0.5k) (x-0.87k, y+0.5k)` | point-up, so it does not collide with the canon's inverted-triangle mark |

| state | treatment |
|---|---|
| live | filled + stroked, α 0.95 |
| offline | outline only α 0.42, **plus a 1 px `--q-off` diagonal strike** from `(x−1.5r, y−1.5r)` to `(x+1.5r, y+1.5r)` |
| empty (declared slot, no machine) | `setLineDash([2,2])`, outline only, α 0.30 |
| back face | outline only, α 0.18, `r·0.8`, no label, no panic ring |

**Panic ring.** The XCOM 1..5 scale, drawn as a gauge at radius `r + 4.4`,
starting at −90° and sweeping `panic/5 · 2π`, `lineWidth 1.4`, `lineCap 'butt'`.
The unfilled remainder is drawn as a `--q-cpu` α 0.13 track so 0 and 5 are not
confusable by "is there a ring". Band colours: `1 → --q-ok`, `2 → --q-cpu`,
`3,4 → --q-warn`, `5 → --q-crit`. **At panic 5, draw a second concentric ring at
`r + 6.6`** — see §6.3 for the measurement that requires it.

**Arcs.** One arc per *running* bee. Today that is **2** (study 2 §2), not 40 —
study 1's 40-arc scene was a stress harness, not the product. Slerp between the
two node vectors, 24 segments, lifted:

```js
const lift = 1 + 0.22 * chordLength;
const h    = 1 + (lift - 1) * Math.sin(Math.PI * t);      // per segment
```

A hologram arc is not a uniform line: it fades into both endpoints. Canvas2D has
no per-vertex stroke alpha, so use one `createLinearGradient` between the two
projected endpoints, four stops — `0.00 α 0`, `0.22 α a`, `0.78 α a`,
`1.00 α 0`, where `a = 0.55` front / `0.14` back. `lineWidth` 1.2 front / 0.7
back. `lineJoin: 'round'`. One gradient per arc.

**Pulse.** A `--q-text` head disc of radius 2.1 plus six `--q-fpga` tail discs of
radius 1.1 spaced 0.9 segments behind, alpha `(1 − j/7)·0.9`, times 0.25 on the
back face. **2.4 s per traversal**, phase-offset per arc by `k·0.37` so two bees
do not pulse in lockstep. When `dispatches.running == 0` there are no arcs, so
there are no pulses, so nothing on the plate moves except the terminator. That is
correct and it is the honest reading.

**Bezel.** Ring at `1.22R`, cream α 0.13. 72 ticks at 5°: major every 90°
(9 px, lw 1.4, α 0.55), minor every 30° (5 px, lw 1.0, α 0.34), the rest
2.5 px lw 1.0 α 0.18. Then the round-progress arc — `lineWidth 2.4`,
`--q-gold` α 0.95, from −90° sweeping `frac·2π`, with a 2.6 px filled head disc.
**This is the one gold mark on the canvas.**

**Labels.** Front hemisphere only, and only above `z > 0.06` so nothing flickers
at the limb; alpha ramps over `z ∈ [0.06, 0.28]`. `textAlign` flips at `cx` so
labels lean outward. A 1 px cream α `0.28·alpha` leader tick runs from `r+10` to
the text. Labels never move relative to their node.

### 4.4 What a node looks like in the rail

The rail's node rows carry the **same glyph as an inline 14×14 SVG**, same
colours, same treatments. That is the legend, and it costs nothing because it is
four `<svg>` elements. Verified in the shell capture: the strike-through on
`XC7Z020 · JTAG` and the dashed triangle on the empty GPU slot both read at
14 px.

---

## 5. Motion

### 5.1 What animates, and at what rate

| thing | rate | note |
|---|---|---|
| globe rotation | **0.055 rad/s = 3.15°/s**, one revolution in 114 s | slow drift, not spin. Anything faster and the labels become unreadable while they cross. |
| terminator + bezel gold arc | **1.2°/s**, one revolution per **300 s** | this is the round, measured live at 299.94 s. It is the only clock on the plate. |
| arc pulse | **2.4 s** per traversal, phase offset `k·0.37` | exists only while a bee runs. Zero bees → zero motion apart from the terminator. |
| a node appearing or leaving | 180 ms opacity ramp | opacity only. It must not slide, scale or bounce. |
| a changed number | 600 ms hold at `--q-gold-hi`, then back | **colour only.** No count-up, no odometer, no size change. |

### 5.2 What must not animate — each named, with the defect it would be

- **The four status-strip numbers.** No count-up, no odometer, no roll. This
  strip exists to be read under pressure; a number that animates cannot be read
  while it animates. And in Outfit without `tnum` an odometer would shift the
  layout by 0.31 em per digit (§3, measured). Mark a change with colour, never
  with movement.
- **Panel geometry.** No panel grows, slides, fades in on mount, or reflows. In a
  `100dvh` grid a panel that animates its height re-runs track sizing and can
  transiently open the shell taller than the viewport — and `overflow:hidden` on
  `html,body` will hide that rather than report it.
- **Log rows.** No entry animation, no auto scroll-into-view while the operator
  is reading. A row that slides in moves the text under the eye. New rows appear
  instantly; the follow behaviour is the one already specified in study 3.
- **The tab bar.** The active underline changes colour in one frame. No sliding
  indicator — during the slide, which tab is active is ambiguous.
- **Globe labels.** They ramp alpha across the `z ∈ [0.06, 0.28]` band and do
  nothing else. They never move relative to their node, and they never reposition
  to avoid collisions — a label that dodges is a label whose position is not a
  reading.
- **Panic rings.** Arc length changes in one step when the band changes. An
  easing tween on a panic gauge draws intermediate values that were never
  measured. That is the "instrument lies" failure (study 2 §10) implemented as an
  animation.
- **The limb bloom.** Constant. A pulsing limb is the commonest sci-fi-dashboard
  tell and it makes the plate read as decorative — precisely the read this page
  must not have.
- **Nothing blinks.** Blink is conventionally reserved for "act now", and every
  failure state in study 2 §9 is a state you *read*, not one you must interrupt.
- **The globe does not re-project on data arrival.** New data changes node state
  and arc count; it never changes `R`, `TILT`, or the rotation phase. A globe
  that jumps when the poll returns teaches the operator that the poll is the
  event, which it is not — the round is.

### 5.3 The redraw discipline

From study 3 §9, restated because it is a visual defect and not only a layout
one: `draw()` assigns into permanent nodes and never inserts a sibling. The
precedent is in the tree — an hour-old HQ tab carried 120 copies of its legend.
Before any redraw, capture `scrollTop` for every `.pane-scroll` and `scrollLeft`
for `.board` and restore after. Only the active pane redraws.

---

## 6. Accessibility

### 6.1 Text contrast on `--q-panel` `#0F1113`

Computed by the WCAG 2.x relative-luminance formula (`/tmp/vislang/c2.py`).

| token | hex | on `--q-panel` | on `--q-panel-hi` | on `--q-bg` | AA normal (4.5) | AAA normal (7.0) |
|---|---|---|---|---|---|---|
| `--q-text` | `#F2EFE6` | **16.46** | 15.33 | 17.25 | pass | pass |
| `--q-cpu` | `#D8CDB0` | **11.96** | 11.15 | 12.54 | pass | pass |
| `--q-dim` | `#A79E8C` | **7.13** | 6.64 | 7.47 | pass | pass |
| `--q-off` | `#7A8590` | **5.03** | 4.69 | 5.27 | pass | fail |
| `--q-gold` | `#C9A24B` | **7.89** | 7.35 | 8.27 | pass | pass |
| `--q-gold-hi` | `#FFD700` | **13.49** | 12.57 | 14.14 | pass | pass |
| `--q-ok` | `#00FF88` | **14.11** | 13.14 | 14.79 | pass | pass |
| `--q-warn` | `#FF8833` | **7.95** | 7.40 | 8.33 | pass | pass |
| `--q-fpga` | `#00CCFF` | **9.98** | 9.30 | 10.46 | pass | pass |
| `--q-crit` | `#FF4444` | **5.55** | 5.17 | 5.82 | pass | fail |
| `--q-gpu` | `#AA66FF` | **5.45** | 5.08 | 5.72 | pass | fail |

Every token clears AA at every text size. Three clear AA but not AAA
(`--q-off` 5.03, `--q-crit` 5.55, `--q-gpu` 5.45). Consequence, stated as a rule:
**`--q-crit`, `--q-gpu` and `--q-off` may not carry a sentence.** They carry
labels, states and glyphs. The one long string on the page — the Queen's own
refusal in the DECISION slot — is `--q-dim` at 7.13, and a critical variant of it
is `--q-text` at 16.46 with a `--q-crit` left rule, not `--q-crit` text.

For reference, if you kept the site's tokens instead: `--muted #888888` gives
**5.34** and `--text #FFFFFF` gives 18.92. The new dim is 1.3 stops better and
the new text is one stop warmer.

### 6.2 Non-text contrast (WCAG 1.4.11, threshold 3.0)

| mark | effective colour | vs `--q-panel` | verdict |
|---|---|---|---|
| `--q-rule-soft` (row separators) | `#2B2B29` | 1.33 | **decorative only** — never the sole indicator of anything |
| `--q-rule` (panel border, strip edges) | `#43423C` | 1.88 | **decorative only** |
| `--q-rule-strong` (meaningful boundary) | `#6B675B` | **3.35** | pass |
| focus ring `--q-text` | `#F2EFE6` | 16.46 | pass |
| CPU / FPGA / GPU glyph stroke | see §6.1 | 11.96 / 9.98 / 5.45 | pass |
| panic ring, all five bands | ok / cpu / warn / crit | 14.11 / 11.96 / 7.95 / 5.55 | pass |
| terminator core | `--q-text` α .55 over the wash | ~5.5 (estimated, not measured — it composites over a gradient) | pass at the estimate; **verify on the built page** |

The rule that falls out: a panel border may never be the only thing that says
"this is the active pane" — it is 1.88 : 1. Active is said with
`--q-rule-strong` *and* the gold tab underline *and* `aria-selected`.

### 6.3 Colour is never the only channel — and here is the measurement

I ran a Viénot 1999 dichromacy simulation over the semantic and class tokens and
measured the separation of every pair in OKLab (`ΔE` = Euclidean distance in
OKLab; ~0.02 is at the edge of discriminability):

| pair | normal ΔE | deuteranopia ΔE | protanopia ΔE |
|---|---|---|---|
| `--q-warn` vs `--q-crit` | 0.131 | **0.028** | 0.152 |
| `--q-ok` vs `--q-gpu` | 0.402 | **0.060** | 0.348 |
| `--q-warn` vs `--q-gold` | **0.100** | 0.238 | **0.038** |
| `--q-fpga` vs `--q-gpu` | 0.279 | 0.106 | 0.192 |
| `--q-cpu` vs `--q-gold` | 0.140 | 0.105 | 0.154 |

So: **under deuteranopia, warn and critical are the same colour** (0.028), and
green and purple are nearly the same colour (0.060). Under protanopia, warn and
gold are the same colour (0.038). Even in normal vision, warn vs gold is only
0.100 — the two warmest tokens are close.

This is not a reason to change the palette; it is the site's own palette and the
canon's own gold, and swapping them would trade one collision for another. It is
the reason every channel carries a non-colour encoding, and it makes those
encodings requirements rather than niceties:

| channel | primary (non-colour) | secondary (colour) |
|---|---|---|
| hardware class | **shape**: square / hexagon / triangle | cream / cyan / purple |
| node state | **glyph treatment**: filled / outline+strike / dashed | class colour / `--q-off` |
| panic 1–5 | **arc length** 72°/144°/216°/288°/360°, **plus a second concentric ring at 5** | ok → cpu → warn → warn → crit |
| log level | **4-char literal** `OK  ` / `WARN` / `CRIT` / `····` | ok / warn / crit / dim |
| strip slot health | **leading glyph** `·` / `▲` / `■` in the same mono cell, so the column does not shift | text / warn / crit |
| key state | the count itself, `2 / 4` | amber when `can pay < configured` |

The second ring at panic 5 exists specifically because 288° and 360° differ by
only 20 % of arc length and their colours collapse to ΔE 0.028 for a deuteranope
— without it, "the node is at maximum panic" and "the node is nearly there" are
indistinguishable.

Also, from the table: **gold must never appear adjacent to warn in the same
visual channel** (ΔE 0.100 normal, 0.038 protanopic). The one-gold rule already
prevents this — the round clock is never next to the KEYS slot's amber, because
they are separate slots with their own labels.

### 6.4 `prefers-reduced-motion`

The site already ships a global block at `index.css:499` that clamps
`animation-duration` and `transition-duration` to `0.01ms`. **That block does not
stop a `requestAnimationFrame` loop**, and the globe is a rAF loop. This is the
trap; three components already handle it correctly by reading `matchMedia`
directly (`PhiStarfield.tsx:45`, `Navigation.tsx:53`, `Footer.tsx:12`) and the
globe must do the same.

Under reduced motion:

1. **The rAF loop does not start.** Repaint is driven by data arrival plus a
   5 s interval. Between repaints CPU is zero.
2. **Rotation is frozen** at `θ = 0.62 rad` — chosen because at that phase both
   hemispheres carry nodes, so the frozen view is not accidentally empty.
3. **The terminator and the bezel arc step**, they do not sweep: one repaint every
   5 s, moving 6°. That is legible as a clock and is not perceived as motion.
4. **Pulses are removed entirely.** The arc keeps its gradient, so an in-flight
   bee is still visible as a link; it simply does not travel. A static
   `--q-text` dot marks the arc midpoint instead, so "a bee is on this link" is
   still readable.
5. **Node appear/leave ramps are removed** — state changes in one repaint.
6. **The 600 ms gold hold on a changed number is kept.** It is a colour change
   with no movement and no flashing; it does not meet any reduced-motion
   trigger, and removing it would leave a changed number silently changed.

```css
@media (prefers-reduced-motion: reduce) { .q-pulse { display: none; } }
```

```js
const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if (reduced) { paint(FROZEN_PHASE); setInterval(() => paint(clockPhase()), 5000); }
else         { requestAnimationFrame(loop); }
```

### 6.5 Keyboard and structure

- The tab bar is `role="tablist"` with `aria-selected`; digits `1`–`5` activate
  panes, as study 3 specifies. The active state is said three ways: gold
  underline, `--q-text` label, `aria-selected="true"`.
- `:focus-visible` is a 2 px `--q-text` outline at `outline-offset: 2px`, 16.46 : 1
  against the panel, and `outline` does not affect layout.
- The globe canvas is `role="img"` with an `aria-label` regenerated on each data
  arrival — e.g. *"Compute map: 3 nodes live, 1 offline, 1 slot empty; 2 bees in
  flight; 2 minutes 41 seconds into the round."* The rail immediately to its
  right carries the same information as text, so the canvas is never the only
  source of anything.
- Everything on SITUATION is reachable without the canvas.

---

## 7. Verification I ran

Prototype: `/tmp/vislang/shell.html` + `/tmp/vislang/globe-core.js`, served from
`127.0.0.1:8935`, driven in Chrome 148 (BrowserOS neo) at DPR 2.

**Study 3 §11 acceptance checks, at 1272×806:** `scrollWidth 1272 = clientWidth`,
`scrollHeight 806 = clientHeight`, **zero** elements crossing the viewport edge,
**zero** undeclared scroll owners. Check 5 (all column tops equal) is not
applicable to SITUATION.

**Sizes, via `srcdoc`-free iframes at exact CSS pixel sizes** (`/tmp/vislang/frames.html`):

| viewport | scrolls X | scrolls Y | elements crossing the edge |
|---|---|---|---|
| 1280 × 600 | no | no | **0** |
| 400 × 780 | no | no | **0** |
| 390 × 844 | no | no | **0** |

**A defect the checks caught, and it is instructive.** My first pass omitted the
responsive rules from study 3 §10. At 400×780 the page still reported *no scroll
in either axis* — and **42 elements were crossing the viewport edge, clipped and
unreachable.** At 390×844 it was 45. That is exactly the trap named in study 3
§6 mitigation 3: `overflow:hidden` on `html,body` is a backstop, and when the
layout is wrong it makes the failure *invisible* rather than visible. The cause
was a 320 px rail against a 400 px viewport, plus a fourth status-strip slot
whose value I had hidden while leaving its label in an implicit grid column.
Adding the `max-width:820px` stack, hiding **the whole DECISION slot** rather
than its value, shrinking the strip gap to 16 px and dropping the tab keycaps
took all three sizes to zero. **Ship the acceptance sweep, not just the scroll
assertion** — the scroll assertion passed the whole time.

One thing still wrong at 400 pt and not fixed in the prototype: the four-item
footer wraps to two lines inside a 28 px row and is clipped vertically (a
vertical clip, which the edge-crossing sweep does not catch). Below 820 px the
footer should carry one item or be hidden.

**Frame cost** (§4): 1305 frames, CPU p50 1.2 ms / p95 1.5 ms / max 2.6 ms,
frame delta p50 8.3 ms / p95 9.0 ms, zero frames over 16.7 ms, on a 1904×1612
backing store. This machine's display is 120 Hz, so 8.3 ms is vsync, not a score.

**Font metrics** (§3) and **contrast / dichromacy** (§6) as tabulated.

---

## 8. Correction to the brief

The brief states that `/Users/playra/trinity` holds "57 website commits NEWER
than tri-27" and that its `Queen.tsx` is the real deployment target. Measured by
comparing commit subjects touching `apps/website` in both repositories:

```
trinity: 233 unique subjects      tri-27: 236 unique subjects
in trinity and not in tri-27:  0
in tri-27 and not in trinity:  3
   Game design and measurements, and the language gate now sees the whole repo
   Link the Queen's face to the Queen, and gate what that link promises
   ci: Node 22, because the render gate needs a WebSocket Node 20 does not have
```

`tri-27` is a strict superset. Both `HEAD`s sit on the same commit content
(`hero: TRI PHONE flagship strip above the TRI CLAW banner`), and `tri-27` has
three commits on top. `diff -rq` over the two `apps/website/src` trees shows five
differing paths, three of which are the other agent's uncommitted work in
`trinity` (`App.tsx`, `Footer.tsx`, an untracked `ServiceEntry.tsx`). The other
two are `Queen.tsx` and `Queen.css`, where **`tri-27` is ahead** — it carries the
whole `.queen-board*` block (99 lines) that `trinity` does not have.

I did not verify what `t27.ai` currently serves; I did not fetch it. But the
premise that `trinity`'s website is newer is not true as of today, and building
this on `trinity`'s `Queen.css` would start from a file missing the board.

---

## 9. What I did not measure

- **The live supervisor.** Every runtime figure here (2 bees, 2 of 4 keys, 300 s
  rounds, 86 cards) is quoted from studies 2 and 3, which measured them today. I
  did not re-poll.
- **The real page.** The prototype is a standalone HTML file with the same tokens
  and the same CSS; it is not `Queen.tsx` mounted inside the site's shell, so I
  have not measured how `--q-` tokens behave under the site's `.subpage-layout`
  `nth-child(3n)` rules, the `.quantum-bg` / `.phi-starfield` fixed layers at
  `z-index:-10/-5`, or `body { padding-bottom: 80px }`. **The Queen shell must
  opt out of all four**, and that is untested.
- **Any browser but Chrome 148 on an M1 Pro at 120 Hz, DPR 2.** No Firefox, no
  Safari, no Windows, no 60 Hz panel, no integrated GPU. `-webkit-font-smoothing`
  and the 0.5 px hairlines are the two things most likely to differ.
- **Any real phone.** 390×844 was a CSS viewport in desktop Chromium.
  `100dvh`, URL-bar collapse and `env(safe-area-inset-*)` are unverified on
  device.
- **The terminator's composited contrast.** It strokes `--q-text` at α 0.55 over
  a gradient, so its 1.4.11 figure is an estimate, not a computation over two
  solid colours. Sample it on the built page.
- **Outfit's `tnum` in every weight.** I measured 400 at 40 px. The variable font
  covers 400–800; I did not check that `tnum` holds at 600 and 800.
- **Cyrillic rendering of the tracked labels.** Outfit has no Cyrillic subset, so
  Russian falls to `system-ui`; I did not render the Russian strings from
  `Queen.tsx`'s `RU` map at `.20em` tracking to confirm they are legible.
- **Whether `#080A0C` is distinguishable from `#000000` on a matte panel.** On
  this display it is; on a glossy OLED at low brightness it may not be, in which
  case the canon's "never pure black" rule buys nothing visually — though the
  limb bloom still needs a non-zero floor to gradient into.
- **The three `Queen.css` collisions in §1.3 as they appear on `t27.ai`.** I
  measured them by loading the two shipped stylesheets together in a browser,
  which reproduces the cascade exactly; I did not load the deployed page.
