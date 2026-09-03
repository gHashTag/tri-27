# The t27.ai palette, measured — and the Protoss layer that fits inside it

## 0. Two facts that change the target before anything else

**0.1 — `/Users/playra/trinity` on branch `main` is NOT what t27.ai serves.**

I fetched the live CSS and compared it to the checkouts. `main` (`9ff2bdcd8`) does not contain commit `33d93ea88`, and the deployed bundle does. `git branch -a --contains 33d93ea88` lists `feat/queen-game-cabinet`, `feat/queen-language-contract`, `fix/center-queen-cycle-logo`, `feat/queen-factory-game` and others — but not `main`. `origin/main` is 389 commits behind local `main` and also lacks it.

Concretely:

| file | `/Users/playra/trinity` (main) | worktree `trinity-queen-factory-game` (`feat/queen-game-cabinet`) | live t27.ai |
|---|---|---|---|
| `pages/Queen.css` | 162 lines, `.queen-page` vocabulary, purple fallbacks | 2 953 lines, 87 `.queen27-*` classes | `assets/Queen-zHzyRD7K.css`, 49 430 B, **94 `queen27-*` classes** |
| `index.css` blog links | `var(--accent, #00ff88)` | `#d8bc7a` / `#f0d79a` / `#8f7a50` | `#d8bc7a` / `#f0d79a` / `#8f7a50` |

**So the worktree the other agent is editing is the deployed lineage.** The 162-line `Queen.css` in the main checkout is a dead ancestor. Every line number I cite below is from the worktree, i.e. from what users actually see. The served CSS was built today (`last-modified: Thu, 03 Sep 2026 06:16:07 GMT`).

**0.2 — `App.css` is dead.** `/Users/playra/trinity/apps/website/src/App.css` declares `--bg: #0a0a0a`, `--accent: #00d4ff`, `--border: #222`. `grep -rn "App.css" src/` returns **zero importers**; only `main.tsx:5` imports `./index.css`. Those three values are not the site palette and must not be inherited. Anyone who reads `App.css` first will build the wrong thing.

---

## 1. The measured palette

### 1.1 The canonical token block — verified byte-identical in repo and on the wire

`index.css:1-13` (worktree) and the served `assets/index-CfRJQE_c.css` `:root{...}` agree exactly. Also confirmed live in the browser: `getComputedStyle(document.documentElement).getPropertyValue('--accent')` → `#00FF88`.

| token | value | uses across `src/` (`*.css` + `*.tsx`) | line |
|---|---|---:|---|
| `--bg` | `#000000` — **pure black, on `html` not `body`** | 9 | `index.css:2` |
| `--accent` | `#00FF88` | **217** | `index.css:3` |
| `--accent-dark` | `#00CC66` | 0 direct `var()` refs | `index.css:4` |
| `--text` | `#FFFFFF` | 124 | `index.css:5` |
| `--muted` | `#888888` | **210** | `index.css:6` |
| `--border` | `rgba(255,255,255,0.08)` | **165** | `index.css:7` |
| `--golden` | `#FFD700` | 24 | `index.css:8` |
| `--font` | `'Outfit', system-ui, -apple-system, sans-serif` | 1 (`body`) | `index.css:9` |
| `--max-w` / `--narrow-w` | `1200px` / `680px` | 2 / 1 | `index.css:10-11` |
| `--section-padding` | `clamp(2rem,8vw,6rem)` → `clamp(3rem,12vw,4rem)` ≤768px | 1 | `index.css:12`, `:945` |

That is the whole tokenised palette. **Seven colours.** Everything else on the site is a literal hex.

### 1.2 The literal-hex census — how the real palette differs from the tokenised one

`grep -rhoiE '#[0-9a-f]{6}\b'` over the worktree `src/`, case-folded, counted:

| hex | count | where it actually lives | tokenised? |
|---|---:|---|---|
| `#FFD700` | **279** | everywhere; duplicate of `--golden` | yes, but 279 sites bypass the token |
| `#00CCFF` | 142 | `StargateDrum`, `KoscheiStatusWidget`, `TrinityStatusWidget`, `Navigation` (Dashboard nav colour), 24 files | no |
| `#00E599` | 115 | `SwarmStatusWidget`, `GovernanceRulesWidget`, `MarketplaceSection`, 13 files | no |
| `#AA66FF` | 100 | `KoscheiStatusWidget`, `ProductionDashboard`, 20 files | no |
| `#00FF88` | 97 | duplicate of `--accent` | yes, bypassed 97× |
| `#D4AF37` | 72 | `Blog.tsx`, `Resources.tsx`, two blog bodies — antique gold | no |
| `#FF4444` | 47 | `chatApi`, `ConnectionStatus`, `ChatMessage` — error red | no |
| `#FF6B6B` | 32 | `content/tnf.ts`, `Queen.css:452/528/965`, "retracted" label | no |
| `#FFAA00` / `#FF8800` | 23 / 23 | `ConsciousnessMonitorWidget`, `TrinityCanvas` | no |
| `#64DCFF` | **19** (12 in `Queen.css`, 7 in `QueenResearchCity.tsx`) | the Queen page's own cyan | no |
| `#FFD45A` | 7 | `Queen.css` hardware foundry | no |
| `#D8BC7A` | 4 | `index.css:1253/1261/1271/1275` — **blog links, LIVE** | no |
| `#F0D79A` | 2 | `index.css:1254/1270` — blog link hover, **LIVE** | no |
| `#8F7A50` | 1 | `index.css:1211` — blog-card hover border, **LIVE** | no |
| `#C9A24B` | 1 | `Navigation.tsx:38` — "Golden Foundry" nav colour | no |

**The single most important line in this table is `#D8BC7A` / `#F0D79A` / `#8F7A50`.** It is a three-step warm parchment-to-bronze ramp, it shipped this year, and the commit that introduced it carries its own justification in the source: *"Blog links use warm parchment: neither browser-blue nor the site's green accent."* The site has already begun moving off pure neon green toward bronze — on its own, before this task existed. That ramp is the Protoss bronze, and it is **not an import**.

Second most important: `#C9A24B` in `Navigation.tsx:38` is the nav colour for `#/foundry`, "Golden Foundry — a club for people who build on silicon". It is also, exactly, the burnished gold of `~/skills/canon-cover-style` §1.2. **The site already associates that specific gold with silicon.** Only three of the nav entries carry a colour at all: Foundry `#C9A24B`, Dashboard `#00CCFF`, Research Lab `#FFD700`.

### 1.3 The Queen page's own layer

`Queen.css` scopes two tokens and then goes literal:

| token / value | where | count |
|---|---|---:|
| `--q-green: var(--accent, #00ff88)` | `Queen.css:2` | 47 `var()` refs |
| `--q-gold: var(--golden, #ffd700)` | `Queen.css:3` | 36 `var()` refs |
| `--station-color` (default `#738078`) | `Queen.css:1802` | 14 |
| `--tech-color` (never given a default) | `Queen.css:2415` | 6 |
| `--construction-color` (fallback `#64dcff`) | `Queen.css:1312` | 3 |
| `--mono` | `Queen.css:2303, 2354, 2417, 2653` | 4 — **defined nowhere** (see §2.2) |

Its dark grounds, all literal: `#010706` (3), `#020806` (4), `#030403` (4), `#050705` (3), `#050505` (3), `#080808` (5).

Its `var()` totals inside `Queen.css`: `--muted` 49, `--border` 48, `--q-green` 47, `--q-gold` 36, `--text` 25.

**Geometry, measured:** `Queen.css` has 448 rule blocks and exactly **11 `border-radius` declarations — 10 of them `50%` (dots) and one `999px` (the nav pill)**. `index.css` has 12 `border-radius` values led by `12px` (`.premium-card`) and `999px`. So the Queen page is already **square-cornered while the rest of the site is rounded**. That is the largest existing violation of "style like the main page" — and it is a violation of geometry, not colour.

---

## 2. The type system

### 2.1 What is loaded

`apps/website/index.html:108-134`. Self-hosted, variable, subsetted — the comment records the reason (Google Fonts cost 59 `@font-face`, 15 files, 324 kB; this is 72 kB, one origin, no blocking stylesheet).

| family | weights | files | subsets |
|---|---|---|---|
| **Outfit** | `400 800` variable | `public/fonts/outfit-latin.woff2` (32 228 B) | Latin only — *Outfit has no Cyrillic on Google Fonts at all; Russian already falls back to `system-ui`* |
| **JetBrains Mono** | `400 500` variable | `jetbrains-mono-latin.woff2` (31 340 B) + `jetbrains-mono-cyrillic.woff2` (8 892 B) | Latin + Cyrillic |

Body: `font-family: var(--font)` → Outfit. Headings `h1 clamp(1.9rem,5.5vw,2.8rem)/600/-0.02em`, `h2 clamp(1.8rem,6vw,3.5rem)/500/-0.05em`, `h3 clamp(1.2rem,4vw,2rem)/500` (`index.css:77-96`).

A **second, φ-based scale** exists in `components/sections/tnf/tnf.css:10-39` and is emitted into the served CSS as a third `:root` block: `--phi:1.618`, `--f-3 … --f6` (`0.75rem` → `6.854rem`), `--sp-1 … --sp5`. It carries an explicit, load-bearing rule in its own comment: **13 px is the readability floor**, and the two smallest steps are deliberately pushed off pure φ to respect it.

### 2.2 Three measured defects in the type system

**(a) `--mono` is used four times and defined zero times.** `Queen.css:2303, 2354, 2417, 2653` say `font-family: var(--mono)` with **no fallback**. I grepped the whole website `src/` and `index.html`, and the two served stylesheets: no definition anywhere. Those four elements silently inherit Outfit. They were meant to be monospace.

**(b) JetBrains Mono is shipped and the Queen page never uses it.** `Queen.css` writes `font-family: ui-monospace, SFMono-Regular, Menlo, monospace` **23 times** — the OS mono, not the webfont. The live page confirms it: the one monospace element I could sample computed to `ui-monospace, Menlo, monospace`. The Cyrillic mono subset is downloaded and unreferenced by this page.

**(c) 81 % of the Queen page's type is below the site's own readability floor.** Of 108 `font-size: Nrem` declarations in `Queen.css`, **87 are under 13 px**:

```
 1 × 0.42rem =  6.72px      11 × 0.58rem =  9.28px
 2 × 0.43rem =  6.88px       8 × 0.62rem =  9.92px
 1 × 0.44rem =  7.04px      11 × 0.68rem = 10.88px
 2 × 0.46rem =  7.36px       8 × 0.72rem = 11.52px
 3 × 0.48rem =  7.68px       ...
TOTAL 108, below the 13px floor: 87 (81%)
```

Twelve declarations are under 9 px. `tnf.css` states the floor and explains that ignoring it made "the most important thing on the site" the smallest type. The Queen page ignores it 87 times.

**(d) Tabular figures were lost in the rewrite.** The old `Queen.css` had `.queen-metric-value { font-variant-numeric: tabular-nums; }` (main-branch `Queen.css:100`). `grep -c tabular-nums` on the deployed `Queen.css` and `index.css`: **0 and 0**. Every ticking number on a mission-control page now reflows on each update.

---

## 3. The Protoss layer: what already exists, what is an import

Protoss reads as five things. Measured against the site:

| Protoss trait | status in t27.ai | evidence |
|---|---|---|
| **Warm gold plating** | **EXISTS, twice over** | `#8F7A50/#D8BC7A/#F0D79A` shipped in `index.css:1211-1275`; `#C9A24B` = Foundry/silicon in `Navigation.tsx:38`; `--golden #FFD700` 279 uses; `#D4AF37` 72 uses |
| **Teal/cyan psionic energy** | **EXISTS** | `#64DCFF` 19 uses, incl. `Queen.css:1173/1486/1497/1562/1582/1617/1621/1639` and `QueenResearchCity.tsx:79,88,95,253,424`; `#00CCFF` 142 uses site-wide |
| **Dark voids between structures** | **EXISTS, purer than Protoss** | `--bg: #000000`. Protoss art sits on deep blue-black; t27 is *pure* black, with a `.phi-starfield` behind it (`index.css:52-63`, visible in the live screenshot) |
| **Crystalline faceted geometry** | **PARTLY EXISTS** | `Queen.css:1450-1457` — the hardware-foundry chip glyph is an 8 px square, gold border, `transform: rotate(45deg)`. That is a facet. And the page is already 0-radius in 437 of 448 rules |
| **Ornate symmetric frames** | **IMPORT** | Nothing on the site draws a bracketed or bevelled frame. Every panel is a plain 1 px `var(--border)` rectangle |
| **Glow / bloom / halo** | **BANNED — the site wins** | See §3.1 |

### 3.1 Where the site overrides Protoss, and why

**Override 1 — no glow, no bloom, no halo.** This is not taste; it is the written house identity. `~/skills/canon-cover-style` §1, "Absolute bans": *photo-realism, neon, pastel, halos, glow effects, gradient meshes*. StarCraft II's Protoss look is built on bloom. **The site wins: no bloom.** The Protoss reading has to come from *geometry, plating and hairlines*, not from light. See §7 for what this costs and what replaces it.

**Override 2 — the ground stays pure black, not blue-black.** Protoss maps are indigo/void-purple. `--bg` is `#000000` and the starfield is painted on the root element deliberately (`index.css:21-31` documents a measured bug where `body`'s opaque black hid the star layer: "maximum luminance 0 across an empty 390×340 region"). Tinting the ground would break that layer and the canon. **Site wins.**

**Override 3 — green stays the primary accent.** `--accent: #00FF88` has 217 `var()` references. Protoss has no green. **Site wins:** green keeps its meaning (the Queen's own running state, `Queen.css:1814`) and gold is *chrome plus one state*, not the primary.

**Override 4 — corners are chamfered, not rounded, and not right-angled.** The main page is `12px` rounded; the Queen page is `0`. Pure Protoss is a hard bevel. I am overriding *both*: a 12 px **chamfer** (a 45° cut) on one diagonal. It reads as cut plating, it keeps the "the corner is not a right angle" quality of `.premium-card`, and it does not require restoring a radius the Queen page abandoned in 437 places. This is the one place I am knowingly matching neither the main page nor Protoss exactly, and it is the smallest step from where the code already is.

**Not an override — the facet already won.** `Queen.css:1456` already rotates a square 45° for the hardware chip glyph. The crystalline vocabulary is present, undernamed and used once.

---

## 4. Deliverable 1 — the token set

All contrast ratios are WCAG 2.x, computed by me today against `#050505`, which is the **measured composite** of the Queen page's real card background `rgba(255,255,255,0.018)` over `--bg #000000` (`Queen.css:756, 1306, 1611, 1951`). The live page reports `rgba(255, 255, 255, 0.02)` for `.queen27-card` — same colour, rounded by `getComputedStyle`.

```css
/* ═══ SURFACES ═══════════════════════════════════════════════════════════ */
.queen27-page {
  --q-void:        #000000;   /* EXISTING  index.css:2  (--bg) */
  --q-panel:       #050505;   /* EXISTING (composite) Queen.css:756 rgba(255,255,255,.018) over --bg
                                 NEW only as a *named* token; the colour already ships */
  --q-panel-deep:  #020806;   /* EXISTING  Queen.css:1356, 1538  console / foundry ground */
  --q-panel-bay:   #030403;   /* EXISTING  Queen.css:1809         factory-station ground */

/* ═══ PLATING (the Protoss bronze — all four already ship) ════════════════ */
  --q-frame:       #8F7A50;   /* EXISTING  index.css:1211   4.92:1 on --q-panel  (non-text) */
  --q-frame-lit:   #C9A24B;   /* EXISTING  Navigation.tsx:38 + canon-cover §1.2   8.50:1 */
  --q-plate:       #D8BC7A;   /* EXISTING  index.css:1253                        11.06:1 */
  --q-plate-hi:    #F0D79A;   /* EXISTING  index.css:1254                        14.45:1 */

/* ═══ ENERGY ══════════════════════════════════════════════════════════════ */
  --q-green:       var(--accent, #00FF88);  /* EXISTING Queen.css:2   15.20:1 */
  --q-gold:        var(--golden, #FFD700);  /* EXISTING Queen.css:3   14.53:1 */
  --q-psi:         #64DCFF;                 /* EXISTING Queen.css:1173 …  12.83:1 */
  --q-psi-veil:    color-mix(in srgb, var(--q-psi) 7%, transparent);   /* NEW (derived) */

/* ═══ TEXT ════════════════════════════════════════════════════════════════ */
  --q-text:        var(--text,  #FFFFFF);   /* EXISTING index.css:5   20.38:1 */
  --q-muted:       var(--muted, #888888);   /* EXISTING index.css:6    5.75:1 */

/* ═══ HAIRLINES ═══════════════════════════════════════════════════════════ */
  --q-hair:        var(--border, rgba(255,255,255,.08));  /* EXISTING index.css:7 — see warning */
  --q-hair-lit:    color-mix(in srgb, var(--q-frame) 42%, transparent);  /* NEW (derived) */

/* ═══ TYPE ════════════════════════════════════════════════════════════════ */
  --q-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
            /* NEW as a token. The FONT is EXISTING: index.html:120-134, three woff2
               files in public/fonts/. This definition fixes the four dangling
               var(--mono) at Queen.css:2303,2354,2417,2653 and lets the 23
               hardcoded ui-monospace stacks collapse onto the shipped webfont. */
  --q-num: tabular-nums;  /* NEW as a token; regression-fix, was main-branch Queen.css:100 */
}
```

**One warning on an EXISTING token.** `--border` is `rgba(255,255,255,0.08)`; over `--bg` it composites to `#141414`, which is **1.14:1 against the page void and 1.11:1 against the card panel it encloses.** Queen.css leans on it 48 times. It is, in practice, an invisible edge — which is why the live page reads as unframed text floating on black. `--q-frame` at 4.92:1 is not decoration; it is the first visible panel edge this page would have.

---

## 5. Deliverable 2 — panel chrome

Protoss-flavoured, zero new colours, no glow, no animation, no extra DOM beyond one wrapper.

```css
/* ─── Protoss plate. Two nested elements: the outer IS the 1px frame. ────────
   <div class="q-plate"><div class="q-plate__face"> … </div></div>
   clip-path clips outer box-shadow, so no drop shadow is used here — which is
   also correct, see §7.4. */

.q-plate {
  --q-cut: 12px;                 /* the chamfer. 12px, matching index.css:148
                                    .premium-card's 12px radius — same corner
                                    budget, cut instead of curved. */
  display: block;
  padding: 1px;                  /* this padding is the frame's thickness */
  background: linear-gradient(
      160deg,
      var(--q-frame-lit) 0%,
      var(--q-frame)     38%,
      color-mix(in srgb, var(--q-frame) 40%, var(--q-void)) 100%);
  clip-path: polygon(
      var(--q-cut) 0, 100% 0,
      100% calc(100% - var(--q-cut)), calc(100% - var(--q-cut)) 100%,
      0 100%, 0 var(--q-cut));
}

.q-plate__face {
  padding: 0.85rem 1rem;         /* = Queen.css:754 .queen27-card padding */
  background:
    /* 1 · corner brackets on the two SQUARE corners only — the chamfer marks
         one diagonal, the brackets mark the other. 4 layers, no pseudo-elements,
         no DOM, nothing to animate. */
    linear-gradient(var(--q-plate),var(--q-plate)) 100%   0 / 22px 1px no-repeat,
    linear-gradient(var(--q-plate),var(--q-plate)) 100%   0 /  1px 22px no-repeat,
    linear-gradient(var(--q-plate),var(--q-plate))   0 100% / 22px 1px no-repeat,
    linear-gradient(var(--q-plate),var(--q-plate))   0 100% /  1px 22px no-repeat,
    /* 2 · plate sheen: a single top-down wash, 6% — the same idea as
         Queen.css:1354 linear-gradient(90deg, rgba(255,212,90,.065), transparent 62%) */
    linear-gradient(180deg,
        color-mix(in srgb, var(--q-frame-lit) 6%, transparent),
        transparent 42%),
    /* 3 · ground */
    var(--q-panel);
  clip-path: polygon(
      var(--q-cut) 0, 100% 0,
      100% calc(100% - var(--q-cut)), calc(100% - var(--q-cut)) 100%,
      0 100%, 0 var(--q-cut));
}

/* ─── The psionic seam. A left-edge inset rule, EXACTLY the technique already in
   Queen.css:1360 (inset 3px 0 #ffd45a) and :1621 (inset 2px 0 #64dcff).
   Static. It marks *class*, never liveness. ───────────────────────────────── */
.q-plate__face { box-shadow: inset 2px 0 var(--q-hair-lit); }
.q-plate.is-fpga  .q-plate__face { box-shadow: inset 2px 0 var(--q-hw-fpga); }
.q-plate.is-gpu   .q-plate__face { box-shadow: inset 2px 0 var(--q-hw-gpu); }
.q-plate.is-cpu   .q-plate__face { box-shadow: inset 2px 0 var(--q-hw-cpu); }

/* ─── Type inside a plate ─────────────────────────────────────────────────── */
.q-plate__face      { color: var(--q-text); font-size: 0.8125rem; } /* 13px floor */
.q-plate__label     { color: var(--q-plate); font-size: 0.75rem;
                      letter-spacing: 0.14em; text-transform: uppercase; }
                      /* 0.14em = the modal tracking in Queen.css (6 uses) */
.q-plate__value     { font-family: var(--q-mono); font-variant-numeric: var(--q-num); }

/* ─── Hover: the plate lights, it does not bloom. Border-colour only, the same
   move as index.css:355 .premium-card:hover. ─────────────────────────────── */
@media (hover: hover) {
  .q-plate:hover { background: linear-gradient(160deg,
      var(--q-plate-hi) 0%, var(--q-frame-lit) 38%, var(--q-frame) 100%); }
}
.q-plate:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
/* ↑ matches index.css:1172-1182 site-wide focus, do not invent a new one */
```

Why this still looks like t27.ai: the ground is the page's own `#050505`, the type is Outfit + the site's own JetBrains Mono, the tracking and padding are lifted from `Queen.css`, the hover is `.premium-card`'s hover, the focus ring is the site's global focus ring, and every colour in it already ships. The only new *shape* is the chamfer and the four bracket hairlines.

---

## 6. Deliverable 3 — semantic colours and hardware classes, with ratios

### 6.1 The six states — all six already exist in the deployed CSS

Nothing here is invented. Ratios computed against `--q-panel #050505` and against `--q-panel-deep #020806`.

| token | value | meaning | source | vs `#050505` | vs `#020806` |
|---|---|---|---|---:|---:|
| `--q-ok` | `#00FF88` | running / healthy | `Queen.css:1814` `.is-running` → `--q-green` | **15.20:1** | 15.06:1 |
| `--q-done` | `#00CC66` | finished | **substituted** — see §6.2; `--accent-dark`, `index.css:4` | **9.54:1** | 9.45:1 |
| `--q-busy` | `#64DCFF` | dispatched / researching | `Queen.css:1639` `.is-researching` | **12.83:1** | 12.72:1 |
| `--q-warn` | `#FFD700` | needs review / refused | `Queen.css:1818` `.is-review` → `--q-gold` | **14.53:1** | 14.40:1 |
| `--q-critical` | `#FF665F` | blocked / dropped | `Queen.css:1823` `.is-blocked,.is-dropped` | **7.10:1** | 7.04:1 |
| `--q-offline` | `#738078` | idle / no key / unpowered | `Queen.css:1802` default `--station-color` | **4.94:1** | 4.89:1 |

Note that `--q-warn` is gold **because the code already says so**: `.queen27-factory-station.is-review` sets `--station-color: var(--q-gold)`. Gold on this page already means "a human has to look at this". That is exactly warn. It also means gold cannot double as a hardware class — hence §6.3.

`--q-offline` at 4.94:1 clears AA for normal text but must never carry text below 14 px. Given §2.2(c), on this page that means: **`--q-offline` is a hairline and glyph colour, not a text colour.** When an offline row needs a readable label, the label is `--q-muted` (5.75:1) and the *state* is carried by the glyph.

### 6.2 The measured problem: hue alone cannot encode state on this ground

I computed every pairwise contrast inside the state set. On a near-black ground every bright accent hue lands in the same luminance band, so pairs collapse:

| pair | as shipped |
|---|---:|
| `done #58AA7A` vs `critical #FF665F` | **1.02:1** |
| `ok #00FF88` vs `warn #FFD700` | **1.05:1** |
| `busy #64DCFF` vs `warn #FFD700` | **1.13:1** |
| `ok #00FF88` vs `busy #64DCFF` | **1.18:1** |

**"Done" and "blocked" are the same colour in greyscale, and for a deuteranope.** On a board whose entire purpose is telling finished work from stuck work, that is a live defect, not a theoretical one.

I searched the site's existing palette for a substitution that fixes it and **there is none**: the best candidate raises done-vs-critical from 1.02:1 to only 1.34:1 (`#00CC66`), and no existing colour lifts ok-vs-warn past 1.42:1 without leaving the family. So:

1. `--q-done` moves `#58AA7A` → **`#00CC66`** (`--accent-dark`, already in `:root`, currently unreferenced). 1.02 → **1.34:1** against critical, and it keeps done inside the green family. Cheap, uses an existing token, does not fix the problem alone.
2. **Colour is demoted to the secondary channel.** Every state MUST also carry a glyph. This is WCAG 1.4.1 and here it is also just legibility:

| state | glyph | rationale |
|---|---|---|
| ok / running | `◆` filled facet | the page's existing 45°-rotated square, `Queen.css:1456` |
| done | `◆` with a notch / `✓` | filled, closed |
| busy | `◈` facet with a hollow centre | "energy passing through" |
| warn | `△` | the site's own mark is an inverted triangle |
| critical | `▲` filled, inverted | mass, not hue |
| offline | `◇` hollow outline | absence of fill = absence of power |

The glyph is the primary encoding; colour reinforces it. This also survives `prefers-reduced-motion` and greyscale printing.

### 6.3 The three hardware classes — a lightness ramp, not a hue

Measured: **no CPU/FPGA/GPU colour exists anywhere in the codebase.** I grepped every `.ts/.tsx/.css` for a hex within 60 characters of `cpu|fpga|gpu`, case-insensitive: zero hits. `queenHardwareRegistry.ts` (216 lines) types `HardwareState` and `family: string` but assigns no colour.

So all three are new *assignments* — but not new colours. All three hues that a naive design would reach for (green, cyan, gold) are already taken by state. **Encoding class in a fourth hue would collide; encoding it as a lightness step of the bronze plating cannot.** That is also exactly Protoss: the plating is one metal at different polish.

| token | value | class | source | vs `#050505` | vs `#020806` |
|---|---|---|---|---:|---:|
| `--q-hw-cpu` | `#C9A24B` | **CPU** — the commodity substrate | `Navigation.tsx:38`; canon-cover §1.2 burnished gold | **8.50:1** | 8.42:1 |
| `--q-hw-gpu` | `#D8BC7A` | **GPU** | `index.css:1253` (live blog links) | **11.06:1** | 10.96:1 |
| `--q-hw-fpga` | `#F0D79A` | **FPGA** — brightest, the site's flagship | `index.css:1254` (live blog hover) | **14.45:1** | 14.32:1 |

FPGA gets the brightest step because the site itself already privileges silicon: the only gold nav entry is "Golden Foundry — a club for people who build on silicon."

**Honest limitation, measured.** Pairwise inside the ramp: CPU↔GPU **1.30:1**, GPU↔FPGA **1.31:1**, CPU↔FPGA **1.70:1**. Three lightness steps of one hue are *not* separable by contrast alone. That is deliberate — they are not supposed to compete with state — but it means **class must be carried primarily by shape too**:

- **CPU** — a plain square node, flat top.
- **GPU** — a square node with a doubled right edge (two parallel 1 px rules).
- **FPGA** — the 45° facet already in `Queen.css:1456`.

Plus the left-seam token from §5 (`inset 2px 0 var(--q-hw-*)`), plus a text label. Three redundant channels: shape, seam, label. Colour is the fourth.

`--q-frame #8F7A50` (**4.92:1** on panel, **5.07:1** on the void) is the plating for *unclassified* / structural chrome. As a non-text UI boundary it needs 3:1 under WCAG 1.4.11 and clears it — unlike `--border`'s 1.11:1.

---

## 7. Deliverable 4 — what must NOT glow, pulse or animate

Current state, measured on the served `assets/Queen-zHzyRD7K.css`: **32 `box-shadow` declarations, 27 of them in the `0 0 Npx` bloom form** (21 in the repo source), and **11 infinite animations**.

### 7.1 Nothing glows. Full stop.

`~/skills/canon-cover-style` §1 bans "halos, glow effects, gradient meshes" as one of ten non-negotiable points of the house identity. `0 0 16px var(--q-green)` (`Queen.css:126`) is a halo. So the rule is: **`box-shadow: 0 0 Npx <colour>` is not available on this page.** The replacements, all of which already ship in `Queen.css`:

- `inset Npx 0 <colour>` — the left seam (`:1360`, `:1621`). Marks without bleeding.
- a 1 px `<colour>` hairline at 100 % opacity — reads brighter than a 16 px bloom at 20 %, and does not move the element's apparent size.
- `color-mix(in srgb, <colour> 8-14%, transparent)` as a fill (`Queen.css` uses `color-mix` 12×).

### 7.2 Numbers must never animate, and must never be non-tabular

Every dispatch count, cost, token total and utilisation percentage. Reasons, in order:
1. They are the page's only receipts. §2.2(d): `font-variant-numeric` is absent, so today they already reflow on every poll. Adding motion on top makes them unreadable.
2. `queen-mission-control.md` records that `input_tokens`/`output_tokens` are nullable and that **a token count of 0 means "the provider sent no usage", not "zero"**. A number that pulses when it changes will pulse when a null becomes a zero, and will assert activity that did not happen.

### 7.3 Liveness indicators may only animate when bound to a measured heartbeat

Three of the five endpoints the page polls — `/queen/public-research`, `/queen/public-hardware`, `/queen/public-activity` — return **404 and exist in no server source**. A dot that pulses because a CSS class is present, rather than because a byte arrived, is a lie about a dead endpoint.

The live code demonstrates the failure mode exactly:

> **`Queen.css:2374` — `.queen27-worker-slots .is-busy i { animation: queen27-pulse 1.2s ease-in-out infinite; }`**
> `@keyframes queen27-pulse` **is never defined.** I cross-checked defined-vs-referenced keyframes in the *served* stylesheet: eight defined (`queen27-spin`, `-orbit`, `-signal`, `-research`, `-bee-flight`, `queen-factory-bus`, `-gear`, `-bee-pulse`), nine referenced. The busy-bee dot has never pulsed on the live site, and nobody has noticed.

That is the argument in one line: an animation nobody misses when it is broken was carrying no information. Rule: **any animation must be removable without loss of meaning.** If removing it loses meaning, the meaning was encoded wrongly and belongs in a glyph or a number.

### 7.4 Black drop shadows on a black page

`Queen.css:1810` — `box-shadow: 0 10px 40px rgba(0,0,0,0.35)` on a `#030403` station sitting on `#000000`. The panel-vs-void contrast is already **1.03:1**; a black shadow on black conveys nothing and costs a paint layer. Delete. Elevation on this page is expressed by the plating hairline, not by shadow. (This is also why §5 can use `clip-path`, which would clip a drop shadow anyway.)

### 7.5 Nothing may animate that the site's own kill switch would silence

`index.css:499-515` sets `animation-duration: 0.01ms !important; animation-iteration-count: 1 !important` on `*, *::before, *::after` under `prefers-reduced-motion: reduce`. Anything animated therefore **snaps to its 100 % keyframe** for those users. `queen27-signal` ends at `opacity: 0.45` — so a "live" dot would sit permanently *dimmer* than a dead one. The `queen27-*` block guards itself with `@media (prefers-reduced-motion: no-preference)` (11 animations), which is correct; but `queen27-pulse` (`:2374`) and `queen27-spin` (`:2459`) sit **outside** that guard. `queen27-spin` is harmless (its end state is `rotate(360deg)` = identity). `queen27-pulse` is the undefined one. Rule: **every animation lives inside the `no-preference` guard, and its 100 % keyframe must be a valid resting state.**

### 7.6 The short list

| never | reason |
|---|---|
| any `box-shadow: 0 0 Npx` bloom | canon-cover §1 absolute ban; replaced by inset seams and 1 px hairlines |
| numbers, counters, costs, percentages | they are receipts; and `0` may mean "not reported" |
| the hardware map's node colours | class is a fact, not an event |
| any indicator on a 404 endpoint | three of five are 404 |
| black drop shadows on the black ground | 1.03:1 — zero information, one paint layer |
| anything outside the `no-preference` guard | the site's global switch snaps it to its 100 % frame |
| the `.phi-starfield` behind the page | already static; it is the void, and a twinkling void competes with the live dots |

**What may move**, sparingly: a bee's position between stations when a dispatch actually changes state; a one-shot 160 ms transition on a value that changed (the site's own `transition: border-color 160ms ease` idiom, `Queen.css:759`); the loading spinner, which is bounded and self-cancelling.

---

## 8. Defects found while measuring

Ranked, all in `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/`, all live on t27.ai now:

1. **`done` and `critical` are the same colour in greyscale.** `#58AA7A` vs `#FF665F` = **1.02:1**. `src/pages/Queen.css:1823,1827`.
2. **`@keyframes queen27-pulse` is referenced and never defined.** The busy-worker dot does not pulse. `src/pages/Queen.css:2374`.
3. **`--mono` is used 4× and defined 0×.** Four elements silently fall back to Outfit. `src/pages/Queen.css:2303,2354,2417,2653`.
4. **81 % of the Queen page's type is below the site's own 13 px floor** (87 of 108 declarations; 12 under 9 px). The floor is stated with its rationale in `src/components/sections/tnf/tnf.css:20-26`.
5. **`font-variant-numeric: tabular-nums` was lost in the rewrite.** Present in the old `Queen.css:100`, absent from both deployed stylesheets.
6. **JetBrains Mono is downloaded and never used by this page**; 23 hardcoded `ui-monospace` stacks in `Queen.css` bypass it. The Cyrillic subset is pure dead weight for this route.
7. **`--border` at 1.11:1 is an invisible edge**, used 48× in `Queen.css`.
8. **`src/App.css` is dead** and declares a conflicting `:root` (`--accent: #00d4ff`). It is a trap for the next person.
9. **`three.js` is already shipped** (`assets/three-C7rSOEFP.js`, and `QueenResearchCity.tsx` uses `meshBasicMaterial` / `pointLight`). `/Users/playra/tri-27/docs/game/engine-benchmark.md` concludes "no engine, canvas2D, 2 506 B brotli vs 109 407 B three.js" — that verdict was reached against a tree that does not reflect what t27.ai actually loads today.
