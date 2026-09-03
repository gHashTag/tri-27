# STUDY 4 — the logs in tabs at screen height, against the real component tree

Implementation spec for the tab shell on `t27.ai/#/queen`. It replaces the parts of
`docs/game/viewport-layout.md` §4, §5, §10 and §11 that were written before the
supervisor surface was rewritten, and it names elements that exist in the file that
ships rather than idealized ones.

Measured 2026-09-03T16:05Z–16:25Z. Read-only throughout: nothing in
`/Users/playra/tri-27` or `/Users/playra/trinity` was edited, staged, committed or
checked out. Scratch under `/tmp/queenspec`, 376 KB.

---

## 0. Two corrections before anything else, because they move the target

**(a) `viewport-layout.md` did not measure this page.** Sections 2, 3, 7 and 9 of that
study measured `/queen/kanban`, `/queen/hq`, `/queen/tree` and `/queen/dashboard` —
server-rendered HTML from `agent-server/apps/server/src/api/routes/queen-*.ts`, served
from `trios-agent-server-production.up.railway.app`. Those four routes are still alive
(probed today: 200 / 17578 B, 200 / 13975 B, 200 / 60204 B, 200 / 11829 B). They are a
different program at a different origin from the React page at `t27.ai/#/queen`. The
`y = 4433` column wrap, the `1572px` six-column threshold, the 219px table overflow at
`queen-tree.ts:251` — all of that is true of the agent-server pages and none of it is a
statement about `Queen.tsx`. The tab set in §4 of that doc is a tab set over those four
HTML routes. This document is the tab set over the React page, which is the surface a
visitor actually reaches.

**(b) The file to edit is not the file in either working tree.** Three different
`Queen.tsx` exist on this machine right now:

| location | lines | root class | ships? |
|---|---|---|---|
| `/Users/playra/trinity/apps/website/src/pages/Queen.tsx` (working tree, local `main`) | 361 | `queen-page` | no — local `main` is 2 ahead / **62 behind** `origin/main` |
| `/Users/playra/tri-27/apps/website/src/pages/Queen.tsx` (committed `main`, cd1ad56) | 443 | `queen-page` | no |
| `trinity refs/remotes/origin/main:apps/website/src/pages/Queen.tsx` | **1787** | `queen27-page` | **yes** |

I confirmed the third one is what production serves, not by inference: `https://t27.ai/`
loads `assets/index-Dv6Ogf4x.js`, which dynamically imports `./Queen-CXq47Md-.js` and
`./Queen-zHzyRD7K.css`. That CSS chunk contains
`.queen27-kanban{…grid-template-columns:repeat(6,minmax(210px,1fr));…}` and
`.queen27-city-stage{…height:580px…}` byte-for-byte from `origin/main`'s `Queen.css`,
and the JS chunk contains `queenReviewPending` and all four `queen/public-*` paths.

Consequence for whoever writes the diff: **the trinity working tree contains a Queen page
three generations older than the deployed one, and it has no `queenReviewLifecycle.ts`
and no `QueenFactory.tsx` at all.** Editing `/Users/playra/trinity/apps/website/src/pages/Queen.tsx`
as it sits today edits the wrong file. `git fetch && git checkout origin/main -- apps/website/src/pages/`
(or a rebase) has to happen first. That tree also carries another agent's uncommitted work
(`apps/website/src/App.tsx`, `Footer.tsx`, `package.json`, an untracked `ServiceEntry.tsx`),
but **not** in `Queen.tsx` or `Queen.css`, so the two files this spec touches are clean.

Fifteen commits touched `Queen.tsx` between the tri-27 ancestor (`104363a4d` / `89b9fff`,
"Localize /queen into Russian (#766)" (title quoted in translation; the issue itself is in Russian)) and `origin/main`, all between 2026-09-01 and
2026-09-02. The diff between the two committed versions is 2201 lines — it is a rewrite,
not an edit.

---

## 1. What data surfaces exist in each version

### 1.1 tri-27 `main` — six surfaces, two feeds

`/Users/playra/tri-27/apps/website/src/pages/Queen.tsx` (443 lines) +
`Queen.css` (261 lines). Two `useProbe` hooks:

| # | surface | element | source | poll |
|---|---|---|---|---|
| 1 | Liveness — brain status, scheduler on/interval, running, finished | `LivenessPanel` L226–272, `.queen-card` | `/queen/status` | **15 s** |
| 2 | Last decision — `decidedAt`, allowed/refused, `refusal`, `skippedCount` | L257–264 | `/queen/status` | 15 s |
| 3 | Latest bee — issue #, dispatched→finished, `outcome` prose verbatim | `LatestBeePanel` L274–301 | `/queen/status` | 15 s |
| 4 | Board — repo, pulse (rounds/bees/verdicts/lastRoundAt), six columns | `BoardPanel` L303–367, `.queen-board` | `/queen/public-board` | **30 s** |
| 5 | Brain-offline diagnostic — the probed origin and the translated failure reason | `BrainOffline` L187–208 | derived | — |
| 6 | Kingdom tabs brain / body / spirit | L397–410 | static prose for 2 of 3 | — |

Two properties of the old board matter for layout and are gone in the new one:
`cards.slice(0, 12)` per column (L342) capped every column at twelve cards, and
`.queen-board` used `grid-template-columns: repeat(auto-fit, …)` so columns wrapped.

### 1.2 trinity `origin/main` — what was added

`Queen.tsx` 1787 lines, `Queen.css` 2953 lines, plus five new modules:
`pages/queenReviewLifecycle.ts` (87), `components/QueenFactory.tsx` (327),
`components/QueenResearchCity.tsx` (738), `components/queenResearchCityModel.ts` (163),
`components/queenConstructionModel.ts` (108), `components/queenHardwareRegistry.ts` (216).

Five hooks, **five endpoints**, two poll rates (`LIVE_POLL_MS = 5_000`,
`ACTIVITY_POLL_MS = 2_000`, both at L26–27):

| # | new surface | element / component | source | poll |
|---|---|---|---|---|
| 7 | Live badge, three states + provenance strip | `.queen27-live` L1236–1248 | `/queen/status` | 5 s |
| 8 | Four metric tiles | `.queen27-metrics` L1251–1278 | `/queen/status` | 5 s |
| 9 | Round countdown + progress bar, 1 Hz clock | `.queen27-queen-core` L1293–1321, `useNow` L683 | `pulse.roundSeconds` + `lastRoundAt` | 1 s render / 5 s data |
| 10 | Running-bee list, ≤4, linked to GitHub issues | `.queen27-bee-list` L1334–1347 | `/queen/public-board` | 5 s |
| 11 | **Review lifecycle queues** — four named states, counts, ≤8 linked cards each tagged | `.queen27-review-queue` L1351–1378; `queenReviewLifecycle.ts` | `board.reviewQueues` or per-card `reviewState` | 5 s |
| 12 | **Live activity ledger** — cursor-based, id-deduped, 120-event ring, renders 6, 8 event kinds | `.queen27-activity-stream` L1379–1421, `useQueenActivity` L533 | `/queen/public-activity?since=` | **2 s** |
| 13 | Board view switch: KANBAN / MISSION MAP / FACTORY | `.queen27-view-switch` L1453–1490 | local state | — |
| 14 | Kanban, six fixed tracks, **no per-column cap** | `.queen27-kanban` L1493–1565 | `/queen/public-board` | 5 s |
| 15 | Mission map — six sectors, every card | `.queen27-mission-map` L1567–1628 | same | 5 s |
| 16 | Factory — stations, bee bays, module inspector | `QueenFactory` | board + research | 5 s |
| 17 | Research city + construction protocol | `QueenResearchCity` (738 lines) | `/queen/public-research` | 5 s |
| 18 | **Signed FPGA foundry** — Ed25519 envelope verified against a public key pinned in source at L28–29 | `.queen27-hardware-foundry` | `/queen/public-hardware` | 5 s |
| 19 | **Technology tree** — nodes/edges/layers/summary, SVG bezier edges, node detail panel | `TechnologyTree` L825–1157 | `/queen/public-research` | 5 s |
| 20 | A2A bootstrap copy-to-clipboard | `.queen27-agent-connect` L928–945 | research `agentBootstrap` or `fallbackBootstrap()` | — |
| 21 | Worker-pool slots busy/idle | `.queen27-worker-pool` L959–975 | research `workers` | 5 s |
| 22 | **Localized issue titles** — `publicIssueTitle` / `publicResearchText` substitute a linked identifier when a title is in the wrong language | used at L1344, 1373, 1412, 1545, 1609, 1613, 1074, 1093 | derived | — |
| 23 | Two-locale `COPY` object, 129 keys each, enforced by `qa/queen-language-contract.mjs` | L161–448 | — | — |

Removed relative to tri-27: the `BrainOffline` panel that named the probed origin and the
reason, and the brain/body/spirit kingdom tabs. The new page's failure copy is
`BACKEND UNAVAILABLE` plus the raw error string in the footer (L1783).

### 1.3 Three of the five feeds are 404 in production right now

Probed directly, 2026-09-03T16:14Z:

```
/queen/status                       200    600 B
/queen/public-board                 200  11715 B
/queen/public-activity?since=…      404     13 B
/queen/public-research              404     13 B
/queen/public-hardware              404     13 B
/queen/board                        403  (token)
/queen/lease                        403  (token)
```

And confirmed in the live DOM at `t27.ai/#/queen`:

- `.queen27-activity-stream` → `"LIVE BEE ACTIVITY · 2 SECOND PULSE · Waiting for the next recorded Bee event."` — permanently.
- `.queen27-tech-loading` → `"RESEARCH GRAPH OFFLINE · HTTP 404"`.
- `.queen27-city` → `class="queen27-city is-offline"`, 180 px tall.
- Worker pool, factory bays, foundry: all offline branches.

The page therefore issues **0.9 requests/second forever** (0.5 activity + 0.2 research +
0.2 hardware) against three routes that do not exist, plus 0.4 s⁻¹ against the two that do.
These hooks are mounted at page level, not per pane, so a tab shell does not reduce that on
its own — see §6, follow-up 3.

### 1.4 The review-lifecycle surface is live but degenerate

`/queen/public-board` today returns 83 cards and **no `reviewQueues` key and no
`reviewState` on any card**. `reviewStateOf()` (`queenReviewLifecycle.ts`) is explicit that
an unclassified card is an anomaly rather than Queen debt, so the live screen reads:

```
0 QUEEN REVIEW PENDING   0 CHANGES REQUESTED   0 HUMAN ESCALATION   13 LEDGER ANOMALY
```

and the swarm header reads `0 EXECUTING NOW · 0 QUEEN REVIEW PENDING`. That is the code
behaving as designed against a server that has not shipped the additive field. Any tab
labelled from `reviewQueueCounts.queenReviewPending` will read zero today. Say so in the
pane rather than letting a zero look like a quiet queue.

Also from the live payload: 29 of 83 titles are Cyrillic, so in English mode 29 cards
render the 62-character substitute string, and in Russian mode the other 54 render the
51-character one. Card height is not driven by real titles for roughly a third of the board
in either language — which matters when you are budgeting a column body.

---

## 2. The final tab set

Five panes, one shell, one page, no page scroll. Each pane owns whole existing
sections, so the first diff is re-parenting rather than component surgery.

| # | tab | key | hash | DOM it owns today (`origin/main` line range) | data source | refresh |
|---|---|---|---|---|---|---|
| 1 | **SITUATION** | `1` | `#/queen` (default) | `header.queen27-hero` L1225–1249, `section.queen27-metrics` L1251–1278, `section.queen27-decision` L1684–1713 | `/queen/status` | 5 s (countdown re-renders at 1 Hz) |
| 2 | **BOARD** | `2` | `#/queen/board` | `section.queen27-board` L1426–1682 — carries the whole KANBAN / MAP / FACTORY switch | `/queen/public-board`; factory sub-view additionally `/queen/public-research` + `/queen/public-hardware` | 5 s |
| 3 | **LOGS** | `3` | `#/queen/logs` | `section.queen27-command` L1280–1424 — round clock, running bees, review queue, activity stream | `/queen/public-activity` (2 s) + `/queen/public-board` (5 s) + `/queen/status` (5 s) | **2 s** |
| 4 | **RESEARCH** | `4` | `#/queen/research` | `<TechnologyTree>` L1753–1758, rendering `section.queen27-tech` L912–1155 | `/queen/public-research` | 5 s |
| 5 | **SWARM** | `5` | `#/queen/swarm` | `section.queen27-flow` L1715–1751, `section.queen27-latest` L1760–1779 | `/queen/status` | 5 s |

Outside every pane, in fixed grid rows of the shell:

- `nav.queen27-nav` L1218–1223 (58 px) — brand, φ formula, and the tab bar goes here or immediately below it.
- **`#queen-statusbar`** — new, 40 px desktop / 32 px phone. Four slots, all from `/queen/status`, which is 600 bytes and never refused:

| slot | value | field | live reading today |
|---|---|---|---|
| `stat-bees` | running / ceiling | `dispatches.running`; ceiling parsed from the outcome string | `0` |
| `stat-keys` | payable / configured | parsed from `dispatches.latest.outcome` | **`1 / 4`** |
| `stat-round` | since last tick, to next | `lastTick.decidedAt` + `scheduler.intervalSeconds` (300) | last 09:13:19Z |
| `stat-decision` | the Queen's own sentence, one line, ellipsised, full text on hover | `lastTick.refusal` | *"the swarm has spent about $11 today, $1.37 past its $10 daily limit (raise it with `TRIOS_SWARM_DAILY_CAP_USD`)"* |

  `viewport-layout.md` §8 recorded `2 / 4` payable keys and a key-shortage refusal. Today it
  is `1 / 4` and the refusal is a spend cap, not a key. The strip must render whatever
  string is there, not a parse of last week's string.
- `footer.queen27-footer` L1781–1784 (41 px), desktop only.

`.queen27-hero` is 740 px tall today and cannot survive inside a 694 px pane body at
1272×806. In SITUATION it collapses: `TrinityLogo` height goes from
`clamp(180px, 24vw, 300px)` to a fixed 96 px, `h1` from `clamp(2.2rem, 5.2vw, 4.4rem)` to
`clamp(1.2rem, 2.4vw, 1.8rem)`, section padding from 96 px to 0.

---

## 3. The height chain for the real tree

### 3.1 The tree, as it exists

```
html                                     ← index.css:29-31 — background only
└ body                                   ← index.css:33-42 — overflow-x:hidden, padding-bottom:80px
  └ div#root                             ← NO CSS ANYWHERE IN THE REPO
    ├ div.phi-starfield                  ← index.css:52-55 position:fixed, inset:0  (harmless, out of flow)
    └ main.queen27-page                  ← Queen.css:1-8 width:min(1240px,100%-40px); margin:0 auto; padding:24px 0 64px
      ├ nav.queen27-nav                  58px
      ├ header.queen27-hero              740px
      ├ section.queen27-metrics          484px  ← 60vh floor, content is ~290px
      ├ section.queen27-command          1340px
      ├ section.queen27-board            5693px
      │ └ div.queen27-kanban             5262px  ← the rail
      │   └ article.queen27-column ×6    5260px each
      │     └ div.queen27-cards          done: 5149px of content, uncapped
      ├ section.queen27-decision         484px  ← 60vh floor, content is ~180px
      ├ section.queen27-flow             724px
      ├ section.queen27-tech             1605px
      ├ section.queen27-latest           933px
      └ footer.queen27-footer            41px
```

Measured at 1272×806 on the live page. The budget closes exactly: the ten children sum to
12102, `main`'s 24+64 padding makes 12190, `body`'s 80 px bottom padding makes 12270 against
a measured `documentElement.scrollHeight` of **12269**. At 1920×1080 the same sum gives
12638 + 88 + 80 = **12806**, which is the measured value to the pixel.

### 3.2 Every ancestor that currently lacks `min-height:0` or overflow control

Nothing in this chain has a height derived from the viewport. All of it must be added.

| # | element | where it is defined | what it has | what breaks | required |
|---|---|---|---|---|---|
| 1 | `html` | `index.css:29-31` | background only; `overflow: visible` | no definite height, so every `%` below resolves to `auto` | `height:100%` |
| 2 | `body` | `index.css:33-42` | `overflow-x:hidden`, `padding-bottom:80px`, no height | the 80 px alone guarantees an 80 px page scroll even if everything else is fixed | `height:100%; padding-bottom:0; overflow:hidden; overscroll-behavior:none` |
| 3 | `div#root` | **nowhere** — `grep "#root"` matches no rule in `index.css`; `App.css` defines `main{min-height:100vh}` but **`App.css` is imported by no module** (`git grep "App.css"` over `origin/main` returns nothing), so it is dead CSS and never loaded | nothing at all | the single missing link between `body` and the shell | `height:100%; min-height:0; overflow:hidden` |
| 4 | `main.queen27-page` | `Queen.css:1-8` | width cap, `margin:0 auto`, `padding:24px 0 64px`; no height, no `min-height`, no `overflow`, `display:block` | this is the element that must become the shell | `height:100dvh` (with `100vh` above it), `display:grid`, `grid-template-rows: auto auto minmax(0,1fr) auto`, `overflow:hidden`, `width:100%`, `max-width:none`, `margin:0`, `padding:0` |
| 5 | **`section` (element selector)** | **`index.css:107-118`** | `display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; max-width:1200px; margin:0 auto; padding: clamp(2rem,8vw,6rem) 20px;` **`min-height:60vh`** | **the single largest defect.** Seven `<section>` on this page inherit a 60vh floor: 7 × 483.6 = **3385 px at 806 tall, 4.2 screens, before any data exists.** Two of them (`metrics`, `decision`) measured *exactly* 483.6 px — held open entirely by this rule. It also caps every pane at 1200 px, which is why the kanban rail measures 1198 px wide at 1920 as well as at 1272. `Queen.css` overrides `padding` and sometimes `display` for these sections but never `min-height`, `max-width`, `align-items` or `justify-content`. | inside the shell: `min-height:0; max-width:none; align-items:stretch; justify-content:flex-start; padding-block:0` |
| 6 | `div.queen27-flow-grid` | `Queen.css:2119-2125` | `display:grid`, `overflow-x:auto`, `min-width:auto` (default) | a flex item of #5 with `min-width:auto` refuses to shrink below min-content. At 390 the `@media (max-width:760px)` rule makes the tracks `repeat(6, minmax(78vw,1fr))` = 1827 px min-content, so the element itself becomes **1827 px wide inside a 362 px parent, centred at left −719**. `overflow-x:auto` never engages because there is nothing to scroll — the box *is* the content. **This is the entire cause of the 718 px horizontal page overflow at 390.** | `min-width:0` |
| 7 | `div.queen27-factory-viewport` | `Queen.css:1714-1718` | `overflow:auto`, `min-width:auto` | identical bug, on the desktop. `.queen27-factory-floor` has `min-width:1480px`, so the viewport becomes 1480 px wide inside the 1200 px section, centred at left **−104**. `.queen27-factory{overflow:hidden}` clips it. Measured station rects at 1272: `backlog` `[-80, 144]`, `dropped` `[1128, 1352]` against a section edge at 1236. Two of six stations are permanently half-cut and **unreachable** — `scrollWidth === clientWidth === 1480`, so the scroller has nothing to scroll. | `min-width:0` |
| 8 | `article.queen27-column` | `Queen.css:695-700` | `min-width:0`, `min-height:420px`, plain block | the column is a block, so `header` / `small` / `.queen27-cards` stack and the column's height is its content | `display:grid; grid-template-rows:auto auto minmax(0,1fr); height:100%; min-height:0` (drop the 420 px floor in shell mode) |
| 9 | `div.queen27-cards` | `Queen.css:736-739` | `display:grid; gap:.65rem` — **no height cap, no overflow** | the only reason the rail is 5262 px tall. Measured content: backlog 2946, blocked 49, running 49, review 1883, **done 5149**, dropped 1032 | `min-height:0; overflow-y:auto; overscroll-behavior:contain; scrollbar-gutter:stable` |
| 10 | `div.queen27-kanban` | `Queen.css:682-693` | `width:100%; grid-template-columns:repeat(6,minmax(210px,1fr)); overflow-x:auto` — already correct on X | but no `height`, so it takes its height from the tallest column | `height:100%; min-height:0; overflow-y:hidden` |
| 11 | `div.queen27-command-grid` | `Queen.css:199-206` | `grid-template-columns: minmax(300px,0.82fr) minmax(0,1.18fr)` | items `.queen27-queen-core` / `.queen27-swarm-live` have default `min-height:auto` and measured 889 px each | `min-height:0` on the grid and both items; `grid-template-rows: minmax(0,1fr)` |
| 12 | `div.queen27-mission-map` | `Queen.css:825-839` | `min-height:650px; overflow:auto` | 650 px exceeds a 694 px pane body minus the 60 px view switch and 130 px board head | `min-height:0; height:100%` in shell mode |
| 13 | `div.queen27-factory-floor` | `Queen.css:1725-1736` | `min-height:690px; min-width:1480px` | same | keep `min-width` (it is the rail), drop the height floor in shell mode |
| 14 | `div.queen27-tech-console` | `Queen.css:2377-2384` | `min-height:720px` | exceeds the pane body at 806 and at 720 | `min-height:0; height:100%` |
| 15 | `div.queen27-tech-map` | `Queen.css:2386-2400` | `max-height:780px; overflow:auto` | correct in kind, wrong in number — must be pane-relative | `max-height:none; height:100%; min-height:0` |
| 16 | `div.queen27-tech-loading` | `Queen.css:2443-2452` | `min-height:720px` | the **offline** state is 720 px tall, and offline is the live state today | `min-height:0; height:100%` |
| 17 | `.queen27-city-stage` / `-canvas` / `-console` | `Queen.css:1500-1540` | three hard `height:580px` | 580 fits a 694 px pane body only barely, and not at all at 720 or 600 viewport height | make the stage `height:100%; min-height:0` and let the canvas/console inherit |
| 18 | `article.queen27-queen-core` | `Queen.css:213-221` | `min-height:420px` (`380px` ≤760) | 420 + the swarm column's own content sets the LOGS pane floor | `min-height:0` in shell mode |
| 19 | `.queen27-flow-grid article` | `Queen.css:2127-2132` | `min-height:270px` (`250px` ≤760) | six of them; harmless once the pane scrolls, listed for completeness | leave |
| 20 | `.queen27-agent-connect button` | `Queen.css:2265-2270` | `min-height:176px` | inside RESEARCH; leave, the pane scrolls | leave |

Note on #3 and the `.queen27-city{display:block}` rule at `Queen.css:1137-1142`:
`QueenResearchCity` renders `<section className="queen27-city">`, and somebody already
had to write `display:block` there to undo `index.css:109`. That is the global rule being
patched once, locally, by symptom. This spec undoes it once, scoped, by cause.

### 3.3 The chain as it must be written

```css
/* Scoped to the shell so nothing else on t27.ai changes.
   Applied by a body class the page adds on mount — see §6. */
html:has(body.queen-shell) { height: 100%; }
body.queen-shell {
  height: 100%;
  padding-bottom: 0;          /* index.css:41 */
  overflow: hidden;
  overscroll-behavior: none;
}
body.queen-shell > #root { height: 100%; min-height: 0; overflow: hidden; }

/* 4. The shell. main.queen27-page becomes it. */
.queen27-page.is-shell {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  height: 100vh;              /* fallback */
  height: 100dvh;             /* mobile URL-bar collapse */
  display: grid;
  grid-template-rows:
      auto            /* nav.queen27-nav          58px */
      auto            /* #queen-statusbar         40px */
      auto            /* #queen-tabbar            44px */
      minmax(0, 1fr)  /* #queen-panes  THE ONLY FLEXIBLE ROW */
      auto;           /* footer.queen27-footer    41px, desktop */
  overflow: hidden;
}

#queen-panes { position: relative; min-height: 0; overflow: hidden; }

.queen27-pane { display: none; min-height: 0; height: 100%; }
.queen27-pane[data-active] {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
}

/* 5. Undo the two global rules, only inside the shell. */
.queen27-page.is-shell section {
  min-height: 0;
  max-width: none;
  align-items: stretch;       /* repairs #6 and #7 in one declaration */
  justify-content: flex-start;
  padding-block: 0;
}
.queen27-page.is-shell .queen27-flow-grid,
.queen27-page.is-shell .queen27-factory-viewport { min-width: 0; }
```

`align-items: stretch` is the load-bearing line. It is what makes `.queen27-flow-grid` and
`.queen27-factory-viewport` fill their parent instead of shrink-wrapping to min-content,
which is what makes their own `overflow-x: auto` finally engage. `min-width: 0` is belt and
braces for the case where a future track minimum still exceeds the parent.

Do **not** write `.queen27-page.is-shell section { display: block }`. Its specificity
(0,2,1) beats `.queen27-metrics{display:grid}` (0,1,0) and would flatten four layouts.
Leave `display` alone.

---

## 4. Which single element owns the scroll, per tab

| pane | scroll owner(s) | axis | what must never scroll |
|---|---|---|---|
| SITUATION | `.queen27-pane[data-pane="situation"] > .pane-scroll` | Y | nav, status bar, tab bar, the four metric tiles |
| **BOARD** | **six** `.queen27-cards` (one per column), **plus** `.queen27-kanban` on X | Y ×6, X ×1 | board head, view switch, all six column headers and counts |
| BOARD / map sub-view | `.queen27-mission-map` (already `overflow:auto`) | X + Y | the view switch |
| BOARD / factory sub-view | `.queen27-factory-viewport` (once `min-width:0` lands) | X | station headers, bee bays, inspector footer |
| LOGS | `.queen27-activity-stream ol` | Y | round countdown, progress bar, the four review-state counters, the running-bee header |
| RESEARCH | `.queen27-tech-map` (X + Y, graph canvas) and `.queen27-tech-details` (Y) — two, because they are two independent columns of `.queen27-tech-console` | X + Y | the tech head, the score, the worker slots |
| SWARM | `.queen27-pane[data-pane="swarm"] > .pane-scroll` | Y | nothing above it |

BOARD is the only pane with more than one owner, and that is deliberate: six independent
column scrollers are what stop `done` (5149 px of content) from setting the height of a
grid row. If the pane itself owns one scroll instead, the operator is back to scrolling
5262 px to reach the bottom of `done` — the failure this whole exercise exists to remove,
relocated one element inward.

RESEARCH having two owners is a property of the existing two-column console; if that is
unacceptable, collapse `.queen27-tech-console` to one column below 1100 px and the count
drops to one.

Every owner gets `overscroll-behavior: contain` so a flick at the end of a column does not
chain to the shell, and `scrollbar-gutter: stable` so a column does not reflow by ~15 px
the moment its content crosses the scroll threshold.

**Redraw rule.** `useQueenBoard` sets state every 5 s. React reconciles rather than
`innerHTML = ''`, and `.queen27-card` carries `key={card.number}` and
`layoutId={"queen-card-" + card.number}`, so nodes are stable and `scrollTop` survives a
refresh — the defect `viewport-layout.md` §9 predicted for the server-rendered board does
not exist here. It **will** appear the moment someone re-keys by index, and it will appear
for `.queen27-activity-stream ol` if the 2 s poll ever starts returning data, because
`motion.ol layout` re-animates on every list change. Capture and restore `scrollTop` for
the activity list specifically.

---

## 5. The acceptance test

Written as assertions, not descriptions. Ship it as
`apps/website/qa/queen-viewport-contract.mjs` and wire it as
`"check:queen-viewport"` beside the seven `check:queen-*` scripts that already exist in
`apps/website/package.json`.

**Use the harness that is already there.** `apps/website/scripts/render-check.mjs` (561
lines) builds, serves `dist` over `node:http`, launches the installed Chrome with
`--headless=new`, and speaks CDP over Node 22's built-in WebSocket — no Playwright, no
Puppeteer. It already calls `Emulation.setDeviceMetricsOverride` (line 534) and
`Runtime.evaluate … returnByValue` (line 223). The viewport contract is the same
scaffolding with a different probe, at three device metrics instead of two.

### 5.1 The probe, run at every size with real data loaded

```js
// Run after: location.hash = '#/queen'; await settle(4000)   ← board must have arrived
const de = document.documentElement;
const fail = [];
const A = (cond, msg, ...ctx) => { if (!cond) fail.push([msg, ...ctx].join(' ')); };

// 1. The shell is exactly one viewport tall and does not scroll. The whole contract.
A(de.scrollHeight <= de.clientHeight + 1, 'PAGE SCROLLS Y', de.scrollHeight, de.clientHeight);
A(de.scrollWidth  <= de.clientWidth  + 1, 'PAGE SCROLLS X', de.scrollWidth,  de.clientWidth);
A(document.body.scrollHeight <= de.clientHeight + 1, 'BODY SCROLLS Y', document.body.scrollHeight);
A(document.body.scrollWidth  <= de.clientWidth  + 1, 'BODY SCROLLS X', document.body.scrollWidth);

// 2. The shell owns the viewport height, within one device pixel.
const shell = document.querySelector('.queen27-page.is-shell');
A(!!shell, 'SHELL MISSING');
A(Math.abs(shell.getBoundingClientRect().height - de.clientHeight) <= 1, 'SHELL NOT ONE VIEWPORT');
A(getComputedStyle(document.body).paddingBottom === '0px', 'body padding-bottom:80px SURVIVES');

// 3. The 60vh floor is gone from every section inside the shell.
[...shell.querySelectorAll('section')].forEach(s =>
  A(getComputedStyle(s).minHeight === '0px', 'SECTION KEEPS 60vh FLOOR', s.className));

// 4. Exactly one active pane, and every scroller inside it is declared.
const pane = shell.querySelector('.queen27-pane[data-active]');
A(shell.querySelectorAll('.queen27-pane[data-active]').length === 1, 'NOT EXACTLY ONE ACTIVE PANE');
const DECLARED = '.pane-scroll, .queen27-cards, .queen27-kanban, .queen27-mission-map, ' +
                 '.queen27-factory-viewport, .queen27-tech-map, .queen27-tech-details, ' +
                 '.queen27-activity-stream ol';
[...pane.querySelectorAll('*')]
  .filter(n => n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1)
  .forEach(n => A(n.matches(DECLARED), 'UNDECLARED SCROLLER', n.className || n.tagName));

// 5. Nothing crosses the viewport edge unless a scrolling ancestor clips it.
const clipper = el => { for (let n = el.parentElement; n && n !== de; n = n.parentElement) {
  const o = getComputedStyle(n); if (o.overflowX !== 'visible' || o.overflowY !== 'visible') return n; } return null; };
[...shell.querySelectorAll('*')].forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.width > 0 && (r.right > de.clientWidth + 0.5 || r.left < -0.5) && !clipper(el))
    A(false, 'ESCAPES VIEWPORT', el.className || el.tagName, Math.round(r.left), Math.round(r.right));
});

// 6. Every horizontal rail can actually reach its own ends.
[['.queen27-factory-viewport', '.queen27-factory-floor'],
 ['.queen27-kanban', null],
 ['.queen27-flow-grid', null]].forEach(([sel, inner]) => {
  const el = pane.querySelector(sel); if (!el) return;
  A(el.getBoundingClientRect().width <= el.parentElement.getBoundingClientRect().width + 1,
    'RAIL WIDER THAN ITS PARENT — overflow:auto is a no-op', sel,
    Math.round(el.getBoundingClientRect().width));
  const content = inner ? el.querySelector(inner) : el.firstElementChild;
  if (content && content.getBoundingClientRect().width > el.clientWidth + 1)
    A(el.scrollWidth > el.clientWidth + 1, 'CONTENT WIDER THAN RAIL BUT RAIL DOES NOT SCROLL', sel);
});

// 7. The status numbers are on screen on every tab.
['bees','keys','round','decision'].forEach(id => {
  const n = document.getElementById('stat-' + id);
  A(!!n, 'STATUS SLOT MISSING: ' + id);
  if (!n) return;
  const r = n.getBoundingClientRect();
  A(r.top >= -0.5 && r.bottom <= de.clientHeight + 0.5 && r.width > 0, 'STATUS OFF SCREEN: ' + id);
});
A(document.getElementById('stat-decision').scrollHeight
  <= document.getElementById('stat-decision').clientHeight + 1
  || getComputedStyle(document.getElementById('stat-decision')).textOverflow === 'ellipsis',
  'DECISION SLOT CAN WRAP THE STRIP TO TWO LINES');

// 8. No board column is below the fold by wrapping.
if (pane.dataset.pane === 'board') {
  const tops = [...pane.querySelectorAll('.queen27-column')]
                 .map(s => Math.round(s.getBoundingClientRect().top));
  A(new Set(tops).size <= 1, 'COLUMNS WRAPPED', JSON.stringify(tops));
  A([...pane.querySelectorAll('.queen27-cards')].every(c => c.clientHeight <= de.clientHeight),
    'A COLUMN BODY IS TALLER THAN THE VIEWPORT');
}
```

Run it once per tab: `for (const t of ['situation','board','logs','research','swarm'])`,
click the tab, `await settle(800)`, probe. And once more per BOARD sub-view
(kanban / map / factory), because the factory rail defect only exists in one of the three.

### 5.2 What must be true at each size, and the reading it must replace

| assertion | 1920×1080 | 1272×806 | 390×844 |
|---|---|---|---|
| `de.scrollHeight === de.clientHeight` | **12806 → 1080** | **12269 → 806** | **12186 → 844** |
| screens tall | 11.86 → 1.00 | 15.22 → 1.00 | 14.44 → 1.00 |
| `de.scrollWidth - de.clientWidth` | 0 → 0 | 0 → 0 | **+718 → 0** |
| `body.scrollWidth` | 1920 | 1272 | **1109 → 390** |
| `.queen27-flow-grid` width vs parent | 1200 ≤ 1200 ✓ | 1200 ≤ 1200 ✓ | **1827 in a 362 box → ≤ 362** |
| `.queen27-factory-viewport` width vs `.queen27-factory` | **1480 in 1200 → ≤ 1200** | **1480 in 1200 → ≤ 1200** | 1480 in 362, `scrollWidth > clientWidth` |
| every `section` `min-height` | 648px → `0px` | 483.6px → `0px` | 506.4px → `0px` |
| `.queen27-cards` (done) `clientHeight` | 5149 → ≤ 968 | 5149 → ≤ 694 | 5149 → ≤ 700 |
| `.queen27-kanban` `clientWidth` | 1198 → ≥ 1880 (shell drops the 1200 cap) | 1198 → ~1232 | 360, `scrollWidth` 1830 ✓ already |
| six column `top` values all equal | ✓ already | ✓ already | ✓ already |
| pane body height | 1080 − 58 − 40 − 44 − 41 = **897** | 806 − 58 − 40 − 44 − 41 = **623** | 844 − 50 − 32 − 56 − safe-area |
| tab bar position | top | top | **bottom**, inside `env(safe-area-inset-bottom)` |
| `.queen27-tech-console` `min-height` | 720 → 0 | 720 → 0 | 720 → 0 |
| `.queen27-city-stage` `height` | 580 → 100% | 580 → 100% | already `auto` ≤820 |

Add 1280×600 to the matrix — a laptop with docked devtools lands there, and it is the size
where a 623 px pane body becomes 417 px and the 420 px `.queen27-column` floor
(`Queen.css:697`) starts pushing on its own.

### 5.3 The check that the check ran

Follow the discipline already at the bottom of `render-check.mjs`: a probe that silently
matches nothing reports a clean page. Assert positively that the harness found the shell,
found five panes, found six columns and found four status slots — and fail if any count is
zero, as a broken selector rather than a clean page.

---

## 6. The smallest possible first diff

Two files. Nothing outside `apps/website/src/pages/`. No change to `index.css`, no change
to `App.tsx`, no change to `main.tsx`, no new dependency, no component rewritten, no JSX
sub-tree edited — only re-parented.

All line numbers are against `trinity refs/remotes/origin/main`.

### File 1 — `apps/website/src/pages/Queen.css` (2953 lines today)

**One appended block, ~110 lines, after line 2953.** No existing rule is edited, so the
diff is pure addition and reverting is deleting a contiguous block.

Contents, in order: the `body.queen-shell` / `#root` / `.queen27-page.is-shell` chain and
the `section` neutralizer from §3.3; then the pane and tab-bar rules; then the per-pane
scroll owners:

```
.queen27-page.is-shell .queen27-column   { display:grid; grid-template-rows:auto auto minmax(0,1fr);
                                           height:100%; min-height:0; }
.queen27-page.is-shell .queen27-cards    { min-height:0; overflow-y:auto;
                                           overscroll-behavior:contain; scrollbar-gutter:stable; }
.queen27-page.is-shell .queen27-kanban   { height:100%; min-height:0; overflow-y:hidden; }
.queen27-page.is-shell .queen27-mission-map,
.queen27-page.is-shell .queen27-tech-console,
.queen27-page.is-shell .queen27-tech-loading,
.queen27-page.is-shell .queen27-factory-floor { min-height:0; }
.queen27-page.is-shell .queen27-tech-map { max-height:none; height:100%; min-height:0; }
.queen27-page.is-shell .queen27-city-stage,
.queen27-page.is-shell .queen27-city-canvas,
.queen27-page.is-shell .queen27-city-console { height:100%; min-height:0; }
.queen27-page.is-shell .queen27-queen-core   { min-height:0; }
.queen27-page.is-shell .queen27-command-grid { min-height:0; grid-template-rows:minmax(0,1fr); }
.queen27-page.is-shell .queen27-activity-stream ol { min-height:0; overflow-y:auto;
                                                     overscroll-behavior:contain; }
.queen27-page.is-shell .queen27-hero .queen27-logo svg { height:96px; }
@media (max-width:760px) { .queen27-page.is-shell { grid-template-rows:auto auto minmax(0,1fr) auto; }
                           #queen-tabbar { order:9; padding-bottom:env(safe-area-inset-bottom); } }
```

Every selector is prefixed `.queen27-page.is-shell`, so removing the `is-shell` class
restores today's page byte-identically. That is the rollback.

### File 2 — `apps/website/src/pages/Queen.tsx` (1787 lines today)

Six hunks. Roughly **+95 lines, −1 line**, plus re-indentation of the seven sections that
move inside pane wrappers.

| hunk | at | change | ~lines |
|---|---|---|---|
| **A** | `COPY.en` L296–302 and `COPY.ru` L440–446 | add five tab labels to **both** locales — `tabSituation`, `tabBoard`, `tabLogs`, `tabResearch`, `tabSwarm` — plus `statBees`, `statKeys`, `statRound`. `qa/queen-language-contract.mjs` enforces exact key parity between `COPY.en` (129 keys) and `COPY.ru` (129 keys), rejects Cyrillic in any `en` value, and requires ≥ half of `ru` values to contain Cyrillic (121 of 129 today, so there is room for 113 Latin-only additions — but parity is absolute). | +16 |
| **B** | after L1187 (`const [boardView, setBoardView] = …`) | `const [tab, setTab] = useState<QueenTab>(() => hashTab())` plus a `useEffect` that syncs `window.location.hash` and adds/removes `document.body.classList.toggle('queen-shell', true)` with a cleanup that removes it. The body class, not `:has()`, so the change works in every engine and cannot leak to another route. | +22 |
| **C** | L1217 | `<main className="queen27-page">` → `` <main className="queen27-page is-shell"> `` | 1 changed |
| **D** | after L1223 (`</nav>`) | `<div id="queen-statusbar">` with four `<span id="stat-…">` slots reading `data.dispatches.running`, the parsed key ratio from `data.dispatches.latest.outcome`, `formatCountdown(roundRemaining)`, and `decision.refusal`. All four values already exist in scope at L1189–1210 — nothing new is fetched. Then `<nav id="queen-tabbar">` with five `<button>`s, `aria-pressed`, and `onKeyDown` for digits 1–5. | +38 |
| **E** | L1225, L1280, L1426, L1684, L1715, L1753, L1760 | insert `<div id="queen-panes">` then five `<div className="queen27-pane" data-pane="…" data-active={tab==='…'||undefined}>` wrappers. Section→pane mapping from §2: **situation** = L1225–1249 + L1251–1278 + L1684–1713; **board** = L1426–1682; **logs** = L1280–1424; **research** = L1753–1758; **swarm** = L1715–1751 + L1760–1779. `queen27-decision` (L1684–1713) is the one block that moves out of document order — it is cut from between `board` and `flow` and pasted into the situation pane. | +12 open/close, 1 block moved |
| **F** | L1781–1784 | leave `footer.queen27-footer` exactly where it is; it becomes the last shell row for free. | 0 |

**Total: two files, ~110 CSS lines appended and ~90 TSX lines inserted.**

### What this first diff does not do, on purpose

1. **It does not touch `index.css`.** `section{min-height:60vh}` at line 107 harms every
   long page on the site, not just this one, and fixing it globally is a different review
   with a different blast radius. It is neutralized here inside `.is-shell` only.
2. **It does not split the LOGS pane.** The round clock, the running-bee list, the review
   queue and the activity stream stay in one `section.queen27-command` with one scroll
   owner. Promoting the clock into the status bar is the second diff.
3. **It does not change polling.** All five hooks stay mounted at page level, so an
   inactive pane still polls. With three endpoints 404ing at 0.9 req/s that is the same
   waste as today, neither better nor worse. Moving each hook behind its pane is the third
   diff, and it needs a decision about whether SITUATION should keep the board poll alive
   for the status strip (it should — the strip reads `/queen/status`, which is separate and
   600 bytes).
4. **It does not fix the review-lifecycle degeneracy.** `13 LEDGER ANOMALY / 0 everything
   else` is a server-side gap (`/queen/public-board` emits no `reviewQueues` and no
   per-card `reviewState`), not a layout gap. The pane should carry one line saying the
   ledger has not been classified yet, so the three zeros are not read as three empty
   queues.
5. **It does not fix the three 404s.** Those are `agent-server` routes that were never
   deployed. Until they are, RESEARCH renders `RESEARCH GRAPH OFFLINE / HTTP 404` inside a
   pane instead of inside 1605 px of page — which is an improvement in framing and nothing
   more.

### What to run before believing it

```
cd apps/website
npm run typecheck
npm run lint
npm run check:queen-languages     # key parity — hunk A is the one that fails here
npm run check:queen-cycle
npm run check:queen-factory
npm run check:queen-city
npm run check:queen-construction
npm run check:queen-hardware
npm run check:queen-review
npm run check:render
npm run check:queen-viewport      # new, from §5
```

The seven `check:queen-*` scripts are source-text regex checks over `Queen.tsx` and the
component files (`requirePattern(/reviewStateOf\(card\)/, …)` and similar), so re-parenting
JSX and adding wrappers should pass all of them unchanged. `check:queen-languages` is the
one that will fail if hunk A adds a key to one locale and not the other, and it should.

---

## 7. What I could not measure, stated plainly

- **The authenticated board.** `/queen/board` and `/queen/lease` returned 403. Every board
  number here is the public projection: 83 cards, no `paths`, no `worker`, no `detail`.
  A token-loaded board has wider cards and taller columns than anything measured above.
- **Three of the five panes with real data.** `/queen/public-activity`,
  `/queen/public-research` and `/queen/public-hardware` are 404, so LOGS, RESEARCH and the
  factory/city/foundry sub-views were measured in their **offline** states only. The
  RESEARCH pane budget in §5.2 is a budget for `queen27-tech-loading`, not for a populated
  graph. `.queen27-tech-canvas` geometry is computed from `graph.layers.length` and the
  largest layer (`TechnologyTree` L857–890) and could be any size.
- **Any real phone.** 390×844 was Chrome device emulation at `deviceScaleFactor 2`, not a
  device. `100dvh`, URL-bar collapse, momentum scrolling and `env(safe-area-inset-*)` are
  all unverified on hardware. The 718 px overflow reading is solid; the mobile-Chrome
  shrink-to-fit response to it (`innerWidth` reported 1108 against `clientWidth` 390) is
  emulator behaviour and may differ on a device.
- **Frame rate, for anything.** No rendering benchmark was run. The research city uses
  `@react-three/fiber` and `three` (both in `dependencies`), and whether it holds a frame
  budget inside a pane is unmeasured. `engine-benchmark.md`'s canvas2D verdict is about the
  SITUATION game view, which does not exist yet.
- **Whether `.queen27-tech-details` really needs its own scroller.** I measured the console
  at `min-height:720px` with the offline placeholder in it; with a selected node the detail
  panel's height is content-driven and unmeasured.
- **The 1240 px page cap at ultrawide.** `.queen27-page{width:min(1240px, calc(100% - 40px))}`
  plus `section{max-width:1200px}` means the board rail is 1198 px at 1920 and would be
  1198 px at 3840. I measured 1920 and 1272 and both gave 1198; I did not test above 1920.
- **One transient:** the first `curl` of `/queen/public-activity` took 11.4 s to return its
  404, and `/queen/public-hardware` 5.4 s. Both are 13-byte bodies. I have no measurement of
  what that was and it is not treated as a finding.
