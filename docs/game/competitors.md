# Study 4 — What to steal, precisely

Companion to `engine-benchmark.md`, `queen-mission-control.md`, `viewport-layout.md`. Those three
established the engine, the shape and the height chain. This one answers a different question:
**what have other people already solved, and which of their devices survive contact with our data.**

Everything below is either fetched today (2026-09-03) with a URL, or explicitly marked as recall.

---

## 0. Six things I measured first, because they change the brief

**0.1 The live palette is not what the file tree suggests.** `https://t27.ai/assets/index-CfRJQE_c.css`
(20,732 B, fetched today) carries exactly this `:root`:

```
--bg:#000000  --accent:#00FF88  --accent-dark:#00CC66  --text:#FFFFFF
--muted:#888888  --border:rgba(255,255,255,.08)  --golden:#FFD700
--font:"Outfit",system-ui,-apple-system,sans-serif
```

The most-repeated *literal* colour in that whole stylesheet is **#D8BC7A** (4 uses), with **#F0D79A**
and **#8F7A50** beside it, and near-black **#0A0A0F**. I traced every one: they appear only on
`.blog-card:hover`, `.share-pill:hover` and `.share-pill:focus-visible`. So the site's real grammar is
**black ground, green accent, gold on touch**. Gold is already the interaction colour of t27.ai. The
monospace stack is `ui-monospace, SF Mono, Menlo`.

**0.2 The Protoss look is 80% already paid for.** Protoss visual language, as described by Blizzard
merchandise art and the LotV art team, is *burnished gold plate, worn, against a cool ethereal glow,
on dark, with angular points and curved ornate forms*
([starcraft.fandom.com/wiki/Protoss](https://starcraft.fandom.com/wiki/Protoss),
[displate description](https://displate.com/displate/8750468),
[Behance LotV UI](https://www.behance.net/gallery/47690517/StarCraft-II-Legacy-of-the-Void)). We
already ship `#8F7A50 → #D8BC7A → #F0D79A` (dark → burnished → highlight gold) and `#0A0A0F`. The
Queen worktree's `Queen.css` (2,953 lines) already uses **#64dcff** twelve times and `#ffd45a`/`#ffd700`
four times. That is the gold-plate-plus-psionic-cyan formula, in our repo, today. **Nothing new needs
inventing.** The only decision is which cool accent carries "psionic": the site's `#00FF88` green or
the Queen page's `#64dcff` cyan. My recommendation is below (§6).

**0.3 The deployed site is not the game.** The live `index-CfRJQE_c.css` contains **zero** occurrences
of `queen27`. The five-view game cabinet exists only on branch `feat/queen-game-cabinet` in the
worktree. `https://t27.ai/queen` is 404 (it is a hash route). `three-C7rSOEFP.js` **is** shipped on the
live site, confirming the engine study's measurement.

**0.4 The other agent's contract, read.** `qa/queen-game-cabinet-contract.mjs` in the worktree pins:
five views `command | kanban | map | factory | tech`; default view `factory`; `data-engine="react-three-fiber"`;
`100dvh` on desktop; `overflow:auto` inside the viewport; a `max-width:900px` stack; a
`prefers-reduced-motion` mode; no parallel Unity runtime. `queenWorkerHangarModel.ts` (107 lines)
builds an 8-slot hangar deck with states `busy | idle | locked` and `QUEEN_WORKER_POLICY_LIMIT = 8`.
**Two tensions worth naming, not for me to resolve:** (a) the contract mandates react-three-fiber while
`engine-benchmark.md` concluded no engine and canvas2D (2,506 B brotli vs 109,407 B three.js); (b)
`buildWorkerHangars(null)` returns `lockedDeck()` — all 8 slots locked — and its only input is
`/queen/public-research`, which I re-confirmed returns **404** today. So the factory's default view is
guaranteed to be eight locked bays until that endpoint exists. Also: `Queen.tsx` is 1,790 lines on that
branch and **361 lines on `main`** — the control room is unmerged.

**0.5 The five endpoints, re-probed today.**

| endpoint | code | bytes |
|---|---|---|
| `/queen/status` | 200 | 600 |
| `/queen/public-board` | 200 | 11,715 |
| `/queen/public-research` | 404 | 13 |
| `/queen/public-hardware` | 404 | 13 |
| `/queen/public-activity` | 404 | 13 |

**0.6 The board's real shape.** `/queen/public-board` returns `{repo, columns[6], cards[83], pulse}`.
Columns: `backlog, blocked, running, review, done, dropped`. Card distribution: **done 44, backlog 18,
review 13, dropped 8 — and `blocked` and `running` are empty.** Two of six lanes are permanently dead
on screen. `pulse` = `{rounds:1, bees:15, verdicts:16, lastRoundAt, roundSeconds:300}`. Cards carry
`{number, title, column, criteria}` — `criteria` is an integer count, e.g. card #1335 has 5.

---

## FAMILY A — games whose map *is* the interface

For each: readable at a glance / what each zoom level does / how flow is shown / how a problem demands
attention.

### A1. XCOM: Enemy Unknown (2012) — Geoscape

**Glance.** A single holographic Earth with per-nation panic and satellite coverage; nothing else
competes for the eye. Wikipedia's account of the strategy layer is precise on the mechanic that makes
it legible: *"Responding in an area decreases panic while ignoring an area causes a rise in panic,"*
a nation that leaves *"will never rejoin"*, and eight of sixteen leaving ends the game
([Wikipedia](https://en.wikipedia.org/wiki/XCOM:_Enemy_Unknown)). One number per territory, one
irreversible consequence, one loss condition. That is the whole readability trick.

**Zoom.** Geoscape has essentially one zoom — it is a globe you rotate, not a scale ladder. The
"zoom" is a *mode change* into the base cutaway and the mission. Recall (measured=false): the ant-farm
base cross-section is the second view, not a magnification of the first.

**Flow.** Interceptors and UFOs as moving marks over the globe; satellites as static coverage claims.
Recall (measured=false) for the visual specifics.

**Problem demands attention.** Firaxis designed the Geoscape explicitly as a stress engine, not a
menu: Jake Solomon said they planned to play up the *"juggle multiple events"* angle and that the
aliens *"sometimes will run missions in parallel just to make it even more explicit"*
([TIME/Techland](https://techland.time.com/2012/03/06/5-new-xcom-enemy-unknown-screens-explained/slide/the-geoscape-your-deployment-hub/)).
The failure of the original is instructive and community-patched: a mod exists purely to **pause the
Geoscape when a notification pops**, because time kept advancing while the player parsed the alert
([Nexus mod 474](https://www.nexusmods.com/xcom/mods/474)). Reviewers were not kind to the interface
either — *"very real interface design issues"* on frequently-repeated actions
([Dorkadia](https://www.dorkadia.com/2012/11/20/rekindling-the-geoscape-xcom-enemy-unknown/)).

**Take:** the irreversible loss (a nation never rejoins) is what makes a number on a map mean
something. And: **if the clock keeps running while the player reads the alert, you have built a
stressor, not an instrument.** Our clock is a 300 s tick; the pause rule matters.

### A2. XCOM 2 — the alert grammar (the single best-documented device in this study)

The XCOM 2 UI designer's own portfolio states the rule outright: *"Alien alerts needed to look 'evil'
and all match"* via a shared colour palette and edge shapes; *"XCOM alerts were all blue and had
different framing elements"*; the Alien Ruler DLC got *"a sinister green and different framing
elements"* ([jamuidesign.com/xcom-2](https://jamuidesign.com/xcom-2/)). The same page states the
density solution: *"both 3D icons and 2D flags for things on the map"* plus *"quick navigation at the
bottom center to access all the active missions."*

**Take:** the *source* of an alarm is encoded in its frame and palette, before you read a word. Our
alarms have four distinct sources and today they all look alike.

### A3. StarCraft II — the minimap and the Protoss shell

**Glance.** Fixed (non-rotating) minimap, bottom-left, showing owned units, visible enemies, terrain,
and scouted structures that persist but **darken** under fog
([Liquipedia](https://liquipedia.net/starcraft2/Minimap)). Persistence-with-desaturation is the
cheapest possible "last known state" encoding.

**Zoom.** The minimap is not zoomable; it is a permanent second scale rendered beside the first. That
is a different answer from Factorio's or EVE's, and it is the right one for a small node count.

**Flow / attention.** SC2 layers alerts across channels — campaign scripts pair `MinimapPing` with
`UIAlertPoint` and a sound ([Galaxy API](https://mapster.talv.space/galaxy/reference/minimap-ping)).
The best-documented tuning note comes from MIT Game Lab's GameHeart observer mod: a dropship carrying
a full complement triggers *a ping and exclamation mark that tracks the dropship for five seconds*,
and for orbital scans they used *a smaller ping with more transparency in the animation*
([MIT Game Lab](http://gamelab.mit.edu/sc2-notifications-gif-extravaganza/)). The counter-pressure is
real too: players have asked Blizzard for an option to disable other players' pings
([Blizzard forums](https://us.forums.blizzard.com/en/starcraft/t/add-option-to-disable-minimap-ping/515)).

**Protoss specifically.** The LotV campaign shell was rebuilt in Protoss language: the briefing room is
aboard the arkship *Spear of Adun*, and missions are chosen from *the Celestial Array*, a Protoss star
map replacing the Terran "Star Map"
([Wikipedia: Legacy of the Void](https://en.wikipedia.org/wiki/StarCraft_II:_Legacy_of_the_Void)).
The faction's colour logic is load-bearing rather than decorative: protoss eyes glow, and *the colours
correspond to the kindred*; Tal'darim blades are red Void energy, Khalai pure psionic, Dark Templar a
mixture ([StarCraft Wiki](https://starcraft.fandom.com/wiki/Protoss)). Art director Samwise Didier's
framing was *"space samurai"* — ornament that is inseparable from function.

**Take:** (i) a second permanent scale beats a zoom when N is small; (ii) desaturate rather than delete
for stale state; (iii) in Protoss, **colour is a claim about lineage**, which maps exactly onto our
provider keys and node capabilities. A red-lineage bee is a different *kind* of bee, not a broken one.

### A4. Factorio — map view and the overlay panel

**Glance.** Factorio's answer is not "show everything smaller"; it is a **mini-panel of overlay
toggles**. FFF-180 introduced them and gave the diagnostic reason for each
([factorio.com/blog/post/fff-180](https://www.factorio.com/blog/post/fff-180)):

- **Logistics/roboport coverage** — because seeing coverage at whole-factory scale was previously
  impossible, so construction-robot alerts in a region were unexplainable.
- **Electric network** — *"useful for finding the cause of a power breach."*
- **Pollution** — made toggleable rather than removed, so the base can be seen cleanly.
- **Ore contents on hover** — justified because *"the area was already discovered by radar"*, and it
  *"also helps colorblind people as they couldn't distinguish the ore types by color so well."*

Each overlay exists because a specific failure was invisible without it. That is the discipline to copy.

**Zoom.** The world/map switchover threshold is Factorio's known weak point, and the community's
preferred fix is an **explicit user toggle** rather than an automatic threshold — the proposal was to
call it "satellite view" and put it in the bar under the minimap beside the electric-grid and
logistics toggles, because *people expect controls there*
([Factorio forums t=53143](https://forums.factorio.com/viewtopic.php?t=53143)). Detail is also gated
by coverage: you only see an area if radar covers it or you are near it
([Steam discussion](https://steamcommunity.com/app/427520/discussions/0/1696046342857596368/)).

**Flow.** Rendering note worth knowing: turret ranges are drawn as opaque geometry into an offscreen
buffer then composited semi-transparently, so overlapping ranges blend into one solid shape
([FFF-281](https://www.factorio.com/blog/post/fff-281)). That is exactly the technique for drawing
*union of capability coverage* without a hairball of outlines.

**Problem demands attention.** Alerts are spatial and the overlay tells you *why* — coverage gap,
power breach. Cause and alarm live in the same picture.

**Take:** an overlay is only allowed to exist if it names the failure it makes visible. And the
zoom/mode switch should be a control the operator presses, not a threshold that surprises them.

### A5. EVE Online — the star map, and the 2025 Catalyst rebuild

This is the most directly transferable finding in the study.

**The 2014 problem.** Because the old map was a literal 3D representation, *stars weren't neatly
aligned, gates didn't always connect to the nearest star, and connections crossed each other* — and
the blunt critique is that the map *"mostly communicated that New Eden was a big and complicated
place"* ([TAGN](https://tagn.wordpress.com/2025/05/03/eve-online-to-start-in-on-making-the-in-game-map-useful-with-the-legion-expansion/)).
CCP's 2014 fix was cosmetic-first — put the map in a real space scene, recolour, relabel, make it a
resizable window that keeps 100% of the fullscreen functionality — and they already knew a 2D
"DOTLAN-esque" mode was the real answer
([A Map To Treasure](https://www.eveonline.com/news/view/a-map-to-treasure)).

**The 2025 answer, shipped.** A 2D toggle with **two modes chosen by zoom level**: a **heatmap when
zoomed out** for universe-wide data overview, and a **tube/subway-style map when zoomed in** for a
clearer look at systems and connections. Plus an **eye-shaped toggle** to switch between
always-visible data and *focusing only around your cursor area*; and **logarithmic scaling, chosen
because it "makes it easier to distinguish increments in lower-end values, even when big outliers
appear on the map"**, with a log/linear switch, adjustable data range and per-filter colour
customisation, saved per filter ([Catalyst expansion notes](https://www.eveonline.com/news/view/catalyst-expansion-notes)).
CCP playtested it publicly on Singularity, asking specifically about region layout, visuals, **zoom
thresholds** and data scaling ([2D Star Map Playtest](https://www.eveonline.com/news/view/2d-star-map-playtest)).

**Take:** three devices, all of which we need. Two *different maps* selected by zoom (not one map
scaled). Cursor-local data density. Log scaling — which is the only honest way to draw a swarm where
one key carries a bee and three carry zero.

### A6. Stellaris — the galaxy map and the outliner

**Glance.** Alert urgency is a three-band colour code: *red for very urgent, orange for somewhat
urgent, green for informational*, and alerts can be disabled per type and re-enabled from the outliner
([Stellaris Wiki](https://stellaris.fandom.com/wiki/Main_interface)). The **outliner** on the right —
a permanent scrolling list of everything you own — is the map's index and is described as key to
navigating planets, starbases and fleets.

**Where it fails.** The community critique is sharp and specific: the map is cluttered, and the
declutter toggle *doesn't remove enough, and what it does remove tends to be the more important stuff
you'd want to keep* — the proposed fix is **user-definable presets**: one mode with everything plus two
customisable modes ([Paradox forums](https://forum.paradoxplaza.com/forum/threads/better-galaxy-map-ui.997748/)).
Modders make the legibility hierarchy explicit: Enhanced UI Project scales the system HUD by 0.8 below
2560×1440 but **deliberately exempts colonizable planets, special projects and anomalies from
downscaling, because they need to stand out**
([Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=2638597676)).

**Take:** the outliner-beside-the-map pattern is the right shape for our review queue. And the modder's
rule is the one to write down: **some icons must never shrink.** Ours are the blocking review and the
refused key.

### A7. Frostpunk — the dial-shaped city

**Glance.** The circular layout is not styling; it falls out of the mechanic. The city centres on a
coal generator producing heat *in a circular radius* that is extended and upgraded, so all buildings
sit on a circular grid around it; an early paper prototype already showed circles, temperature and
buildings ([Xbox Wire 2019](https://news.xbox.com/en-us/2019/09/20/frostpunk-console-edition-radial-driven-design-of-gameplay-and-controls/)).

**The interface followed the map.** The console UI was rebuilt as a radial: a Command Hub circle with
smaller circles on its perimeter, each building category itself a circle — framed explicitly as *a
natural extension of the design philosophy behind the game itself*, after ~5 other control schemes
failed. Frostpunk 2 added a contextual Quick Radial that **colour-codes districts to aid orientation**,
and **both radial menus pause time automatically**
([Xbox Wire 2025](https://news.xbox.com/en-us/2025/09/18/adapting-frostpunk-2s-depth-to-a-gamepad/)).

**Productive friction.** Circular placement plus varying building sizes leaves gaps, and because the
heat radius must be upgraded you cannot plan the city ahead — you adapt as it expands
([David Bailly](https://david-bailly.com/portfolio/imperfect-placement-in-circular-city-building-frostpunk/)).

**Take:** two things. **The radius is the resource** — draw the Queen's reach as a radius that a
capability or a credit extends, and nodes outside it are literally cold. And **opening a radial pauses
the clock**, which is the fix XCOM needed a mod for.

### A8. Mini Metro — flow made literal

**Glance.** Stations are *shapes*; passengers are *smaller shapes next to stations, their shape
matching the type of station they must be delivered to*; the whole thing is *designed to resemble
modern transit maps with straight lines and bold colours*
([Wikipedia](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))). Peter Curry: the team *quickly
began thinking about the game in purely abstract terms — nodes and edges rather than stations and
lines*, while still studying real transit-map graphic design
([Road to the IGF](https://www.gamedeveloper.com/audio/road-to-the-igf-dinosaur-polo-club-s-i-mini-metro-i-)).

**Flow.** Trains *automatically travel along lines and load and unload passengers* — the payload is
visible on the vehicle, and the vehicle is visible on the edge. There is no abstraction between
"throughput" and what you see.

**Failure.** *Each station can accommodate a limited number of passengers before overcrowding,
typically six*, and the game ends *once a station becomes overcrowded for an extended period of time*.
Every in-game week awards rolling stock, tunnels, lines and interchanges. So: a small integer capacity,
a visible fill, a grace period, then death — and a weekly grant that lets you grow ahead of it.

**Take:** this is the flow-and-backpressure model for our review queue, and the integers happen to
match (six ≈ our 13-deep review lane against 8 hangar slots).

### A9. The incremental/idle case — where the growing network *is* the appeal

Nodebuster is the cleanest live example: a node graph plus a giant node skill tree, **97% positive
across 10,574 reviews** ([Steam](https://store.steampowered.com/app/3107330/)), and the community
observation that matters here is that *having the skill tree unfold helps foster the feeling of
progression — the visual expansion of the graph is itself the reward*.

The counter-example is Universal Paperclips, which achieves the same retention with **no spatial graph
at all** — unstyled words in the default font and very large numbers
([IF50](https://if50.substack.com/p/2017-universal-paperclips)) — its screen becoming *legible in the
bureaucratic way a control room or spreadsheet is legible* as panels accrete. Its known technical
scar is instructive: JS doubles run out of integer precision above ~9 quadrillion, so late-game counts
render as digit strings ending in runs of zeros.

**Take:** growth must be *visible as structure*, not only as a number. Our structure that genuinely
grows is the ring chain and the tech tree, and it should unfold on screen when a ring seals. And:
never render a large machine number raw — the `overflow-wrap: anywhere` rule from `viewport-layout.md`
already exists for exactly this reason.

---

## FAMILY B — real products that visualise distributed compute

These are the actual competitors for this screen. I probed them live today.

### B1. io.net Explorer — the closest competitor, and the loudest lesson

**What it shows (measured, `explorer.io.net`, 2026-09-03):**
- Hero: a decorative wireframe globe, gold/violet/cyan arcs and dots on near-black. No data on it.
- **A segmented ring gauge — one tick per device — reading "575 GPUs & CPUs, Hired 547, Idle 28",**
  headlined *"575 Total Cluster Ready and Fully Collateralized GPUs/CPUs"*.
- "Supply Insights & Geo Distribution" with a **Select Region** filter, worldwide `563 / 12` GPUs/CPUs.
- Top 5 nodes: H100 80GB HBM3 ×512, L40S ×13, B300 SXM6 AC ×8, H100 PCIe ×8, RTX 3090 ×5.
- A price table per chip across Ray / Container / Baremetal / VM, with `--` where a mode is unavailable.
- Heterogeneous long tail including Apple M4 Max ×1, M3 Pro ×4, M4 ×2 — i.e. laptops beside H100s.
- Tabs: Home, Workers, Epochs, Inferences, Clusters, Staking Dashboard, Block Rewards.

**What it gets wrong, measured.** I scrolled to the geo map and screenshotted it: it is an
**almost entirely dark choropleth** — a handful of countries faintly lightened (Turkey, France, a
sliver of South America), no dots, no arcs, no flows. A planetary-scale map drawn for a number that
fits in a sentence. Meanwhile io.net's own marketing claims *320,000+ GPUs and 80,000+ CPUs across
130+ countries* ([io.net](https://io.net/)); the explorer says 575 cluster-ready. Independent review
puts Q1-2025 daily-average verified active GPUs at ~6,720 against 327,000 registered — about 2% — with
an inventory API returning 2,447 devices, 1,199 active
([ownyourmind.ai](https://ownyourmind.ai/projects/io-net/)). The history behind that gap is the April
2024 Sybil incident: io.net publicly acknowledged *"virtual GPU abuse … spoofing approximately 400,000
workers"* ([@ionet](https://x.com/ionet/status/1780877493672595941)) and the CEO reported *"an enormous
spike of ~1.8M fake GPUs attempting to connect"*
([The Block](https://www.theblock.co/amp/post/291315/solana-based-depin-io-net-ceo-claims-network-was-attacked-in-detailed-postmortem)),
with the root cause an Explorer-facing API that exposed user IDs by device ID plus a universal auth
token shared across recognised GPUs ([incident report](https://ionet.medium.com/25th-april-incident-report-176e5fb5c576)).
The vulnerabilities *were introduced while implementing a proof-of-work mechanism meant to identify
counterfeit GPUs.*

**What to take.** The **segmented ring is excellent** and I want it: one tick per slot, filled/idle in
two colours, the count spelled out beneath. It is countable at small N, it degrades honestly to zero,
and it needs no map. Also take the `--` convention for "this mode does not exist here" — it is exactly
our "zero is not absent" rule, already in `queen-mission-control.md` §10, implemented by someone else.
Take the **capability-and-price table with explicit unavailability** as the model for our capability
matrix. Do **not** take the globe.

### B2. Folding@home — the largest volunteer network, and it publishes no map

**What it shows (measured today).** `api.foldingathome.org/os` returns a plain table:

| OS | AMD GPUs | NVIDIA GPUs | CPUs | CPU cores | TFLOPS | x86 TFLOPS |
|---|---|---|---|---|---|---|
| Win64 | 38 | 369 | 3,298 | 21,878 | 949 | 1,694 |
| Linux | 6 | 185 | 5,049 | 45,490 | 937 | 1,289 |
| Windows | 29 | 64 | 3,699 | 20,126 | 404 | 569 |
| macOSX | 0 | 0 | 1,275 | 8,431 | 94 | 94 |

I enumerated the OpenAPI spec: **59 paths, and not one is geographic.** No `/map`, no `/country`, no
`/location`. Paths are `/os`, `/gpus`, `/cpus`, `/project`, `/team`, `/user`, `/awards`, `/bonus`,
`/credit-log`, `/machine/{id}`. Stats are batched: donor and team stats update hourly, flat summary
files every 3 hours, and the FAQ warns that running a crawler on the CGI pages *"can result in a
permanent IP ban"* ([foldingathome.org/faq/stats-teams-usernames](https://foldingathome.org/faq/stats-teams-usernames/)).

**What it gets wrong.** Opaque progress units — users could not tell what a "frame" was, or why a
Tinker WU took 400 frames and two days; credit is anchored to a benchmark machine built around an
Intel Core i5 750 @ 2.67 GHz, a reference point widely seen as dated; changing your username orphans
your historical work units. The strong visualisation lives *outside* the official client, at
[folding.lar.systems](https://folding.lar.systems/) and
[EXTREME Overclocking](https://folding.extremeoverclocking.com/).

**What to take.** The honest one: **the biggest volunteer compute project in history decided the map
was not worth drawing.** Its public surface is a per-OS capability table. Ours *is* a per-capability
table (`swift-build`, `make`, `screen`, `git-push`, `typescript`) and that should be the primary
artefact, with the map as its illustration — not the reverse.

### B3. SETI@home — the best "alive" device ever built for this problem

This is the device I most want to steal, and it is nearly forgotten.

The screensaver was in the 1996 proposal, before the network existed. Planned modes: *a map of the
world showing participating machines, a sky map showing survey coverage and the patch currently being
analyzed, colorful changing patterns corresponding to the Fourier transforms underway, and "straight"
graphs of the evolving data analysis* — some deliberately technical, some abstract, some *"decidedly
artistic"*. Shipped, it had a **Science Mode** showing *the analysis taking place on the local machine
in real time, explaining the significance of each result* at high-school level, and a **Sky Progress
Mode** showing how the experiment was covering the sky
([setiathome.berkeley.edu/sah_graphics.php](https://setiathome.berkeley.edu/sah_graphics.php),
[sah_papers/woody.php](https://setiathome.berkeley.edu/sah_papers/woody.php)).

The project's own retrospective is unsentimental about why: *to attract and keep users, a project must
explain and justify its goals with compelling views of local and global progress, and screensaver
graphics are an excellent medium.* Dan Werthimer conceded many people *"probably like the graphics and
wouldn't run it unless it looked cool."* Engineering cost: 2,247 lines of SETI-specific graphics code,
three threads (comms/processing, GUI, rendering from shared state)
([CACM: SETI@home](https://cacm.acm.org/research/setihome/)).

**And then the genre died.** Under BOINC most projects ship no graphics at all; as CRTs gave way to
LCD/OLED the burn-in justification evaporated and projects stopped bothering
([BOINC wiki](https://github.com/BOINC/boinc/wiki/BOINC-screensaver),
[boincsynergy](https://boincsynergy.ca/wiki/BOINC_project_screensavers)).

**What to take.** *Show the computation, not a summary of the computation.* The distinction between
Science Mode and a stats page is the whole difference between alive and decorative — and nobody in the
decentralised-compute market is currently doing it.

### B4. BOINC / BOINCstats — the leaderboard that replaced the map

**What it shows.** `BOINC combined` aggregates across projects via cross-project ID (CPID), organised
as Overview / Best ten days / Last 40 days / Credit / Users / Teams / Hosts / **Countries** overview.
Country stats are *Population, Credit/capita, Credit/user, Users/capita*. Host stats are CPU model,
CPU count (hyperthreads in brackets) and OS. Pages show update freshness — last daily update, last
incremental update, server time, members online
([boincstats.com/page/faq](https://www.boincstats.com/page/faq),
[detailed stats](https://www.boincstats.com/stats/-1/project/detail/credit)). Underneath: gzipped XML
dumps typically updated every 24 hours, plus XML RPCs
([StatsXml](https://github.com/BOINC/boinc/wiki/StatsXml),
[CreditStats](https://github.com/BOINC/boinc/wiki/CreditStats)).

**What it gets wrong.** "Credit/capita by country" is a vanity metric with no operational meaning —
it cannot tell you whether work is flowing. Daily batching means the surface is up to 24 h stale while
looking current. Retired projects' credit persists but stops updating CPIDs, silently detaching stats.

**What to take.** Only the honesty furniture: **print the freshness of every number next to it.**
"last daily update / last incremental update / server time" is a pattern our page should copy verbatim,
because our own `pulse.rounds` problem is a freshness lie.

### B5. Helium — the sharpest cautionary tale in the whole genre

**What it shows.** Real-time H3 hexagons of active hotspots worldwide, with density gauged at a chosen
"resolution", where each res has an optimal number of hotspots per hex derived from a base rate plus
neighbours — a scheme one guide concedes is *"a bit complicated"*
([Coinmonks guide](https://medium.com/coinmonks/the-ultimate-guide-to-understanding-the-helium-coverage-map-in-2025-fec177ea47d3)).

**What it gets wrong, in the vendor's own training material.** Semtech states that the green hexes only
represent that *someone in the community has onboarded a Hotspot to that location* and *"should not be
considered a detailed RF coverage map"*, and that verifying hotspots are online, witnessing neighbours
and actually processing packets is critical
([Semtech Learning Center](https://learn.semtech.com/mod/book/view.php?id=169&chapterid=57)). The
Mobile map shows *predicted* outdoor signal; indoor, congestion and roaming are unmapped. The
`/coverage` page was, by the project's own GitHub issue, *the most visited page on explorer.helium.com*
and had not been updated in over a year ([helium/explorer#310](https://github.com/helium/explorer/issues/310)).
Whole community projects — [CoverageMap.net](https://www.coveragemap.net/), Helium Mappers,
[Coverage Critic](https://coveragecritic.com/maps/helium-mobile/) — exist purely to supply the measured
coverage the official map does not.

When I probed `explorer.helium.com` and `world.helium.com` today, both returned **HTTP 429 behind a
"Vercel Security Checkpoint"** — the flagship map of the flagship DePIN network was not reachable to an
ordinary client.

**What to take.** The rule, stated as a law: **a hexagon is a deployment claim; only a packet is
coverage.** Our equivalent — a node drawn because a capability was *declared* is a Helium hexagon. Our
own doc already says new nodes *"join by declaring a capability set and proving one of them"*; the map
must render declared and proven differently, always.

### B6. Akash — the dashboard that arrives empty

`stats.akash.network` returns 25,370 bytes of HTML whose visible body is a **spinning loader**; every
number arrives later via JS. `console.akash.network` is the successor to the acquired Cloudmos; the
Provider Console homepage shows revenue, leases and used/available GPU/CPU/memory/storage plus an
activity log of provider changes ([Akash blog](https://akash.network/blog/introducing-akash-provider-console/)).
Geography is surfaced in the bid-selection flow — bids reviewed on *price, uptime history, and
location* — not as a standalone map. Messari's quarterly numbers give the honest scale: Q3 2025 GPU
usage 367 of 702 units, utilisation consistently above 50%, capacity down 7% as small providers exited
([State of Akash Q3 2025](https://messari.io/report/state-of-akash-q3-2025)).

**What to take.** Utilisation-with-capacity as the headline pair (367/702 is a real sentence; "702
GPUs" is not), and **location as a bid attribute rather than a map**. What to avoid: shipping a shell
whose body is a spinner. Our page is already token-guarded fetch-driven; it needs a first paint that
says something true before any fetch resolves.

### B7. Render Network — metrics without a map

`stats.renderfoundation.com` shows BME mint/burn, token holders, Ethereum→Solana upgrade stats, node
operator rewards, proposal stats, the current number of active Render Nodes, **frames rendered**, a
**live countdown to the next epoch**, an address lookup, and *a live log of recent emissions and burn
transactions at the bottom* ([Medium: dashboard is live](https://medium.com/render-token/render-network-dashboard-is-live-btn-february-16th-2024-35c6d90de29b)).
No geographic node map.

**What to take.** Two devices, both ours already: **frames rendered** is a unit of *work delivered*
(our equivalent is verdicts and committed files, not dispatches); and the **countdown to the next
epoch beside a live transaction log** is precisely our `roundSeconds: 300` clock beside the activity
feed. Render's headline is not "how many nodes" but "how much work and when is the next round" — that
is the correct framing for a network with 43 finished dispatches and 0 running.

### B8. Prime Intellect and Nous Psyche — the truest competitors, and mostly unreachable

INTELLECT-1 is the closest analogue to our story: a 10B model trained across **30 independent compute
contributors, 5 countries, 3 continents, up to 112 H100s**, 83–96% compute utilisation depending on
geography (96% within the USA at 103 s sync, 85.6% transatlantic at 382 s, 83% globally at 469 s),
over 500 Mb–4 Gb/s links against 3.2 Tb/s in HPC — *"accompanied by a public dashboard"*
([technical report, arXiv:2412.01152](https://arxiv.org/pdf/2412.01152)). Nous ran Psyche/DisTrO
publicly and invited people to *watch the run LIVE*, with clients doing both **training and witnessing
— verifying liveness and correctness of other clients**
([nousresearch.com/nous-psyche](https://nousresearch.com/nous-psyche)).

**Measured today:** `app.primeintellect.ai/intelligence` → **404**. `psyche.network` and
`app.psyche.network` → **no connection**. `distro.nousresearch.com` → 200, and its entire rendered text
is **"Nous DisTrO loading…"**.

**What to take.** The metric set is the gift: **sync latency as the edge weight**, and utilisation
banded by topology (same-region / cross-ocean / global). That is a flow measure with physical meaning,
unlike "nodes online". And **witnessing** — peers verifying each other's liveness and correctness — is
the mechanic that turns a claim into a proof, which is §5 of our own doc. What to avoid: they are the
proof that a live-run URL is a liability. Three of four are down.

### B9. GPU marketplaces — what the status surface actually is

Vast.ai has no status page in the usual sense; availability is surfaced through **filtering** — GPU
model, PCIe bandwidth, location, and **host reliability scores**, which are the marketplace's uptime
dashboard. Catalogue breadth as of 2026-08-31: Vast.ai 68+ GPU types across 40+ data centres vs
Lambda's 8 GPU model families; CoreWeave exposes on-demand and spot tiers
([aimultiple GPU marketplace](https://aimultiple.com/gpu-marketplace),
[Introl comparison](https://introl.com/blog/lambda-paperspace-vast-gpu-cloud-comparison-2025)).
Availability bands quoted: decentralised providers commonly 70–85% with interruptions, specialised
providers 95–98% ([gpu.fm](https://www.gpu.fm/blog/cloud-gpu-providers-comparison-2026)).

**What to take.** **Reliability score attached to the host, shown wherever the host is shown.** Our
provider keys deserve exactly this — one of four is carrying a bee, three are refused, and that ratio
should be a persistent per-key score, not a footnote in one dispatch's outcome string.

### B10. The professional benchmark — Datadog Cloud Network Map

Not a game and not a crypto explorer, and it is the best-engineered thing in this list. Nodes are
entities **grouped by user-selected tags**; edges are directional; **the operator chooses which metric
the edge represents** — throughput, latency, jitter, retransmits, connection count. When too many nodes
would clutter, it **automatically applies secondary grouping**; clusters expand and collapse on click.
**Red-bordered clusters indicate alerting monitors matching node tags.** It can *hide network traffic
outside a specified percentile range*. Hovering a node **highlights it and animates the directionality**
of traffic ([Datadog docs](https://docs.datadoghq.com/network_monitoring/cloud_network_monitoring/network_map/)).

**What to take.** Nearly all of it, and it is the piece nobody in Family B has: selectable edge metric,
percentile noise gate, automatic clustering under density, red border for "a monitor is alerting here",
and **animate direction on hover rather than animating everything always**.

### B11. Grid.gg — not a compute visualiser

Checked, because it was named. `grid.gg` is *"The GRID Data Platform — the official data platform of
Riot Games, Ubisoft, and KRAFTON"*, for in-game telemetry, analytics, integrity and distribution
(measured: HTTP 200, its own meta description). It is an esports telemetry pipeline, not a
distributed-compute map. Its only transferable idea is **integrity as a product feature** — telemetry
sold with a guarantee that it was not tampered with — which is, in fact, the proof-of-compute question.

---

## 1. The seven devices to steal, ranked

Ranked by value to *this* screen, given that we have two lit nodes, four keys, 83 cards and a
supervisor that refuses every 300 seconds.

**1. Science Mode — show the computation, not a summary of it.** *(SETI@home,
[sah_graphics.php](https://setiathome.berkeley.edu/sah_graphics.php))* — Nobody in the
decentralised-compute market currently renders the work itself; they all render totals. We can render
the actual thing a bee is doing, because the supervisor emits a full outcome sentence per dispatch and
a live activity stream once `/queen/public-activity` exists.

**2. Two maps chosen by zoom, not one map scaled — heatmap out, subway in.** *(EVE Catalyst,
[expansion notes](https://www.eveonline.com/news/view/catalyst-expansion-notes))* — This *is* the
user's "when you zoom in, StarCraft". Zoomed out: capability/credit heat across the swarm. Zoomed in:
a Protoss node interior with named hangars. Bring the **log/linear toggle** with it — it exists
precisely for maps where one value dwarfs the rest, which is our 1-of-4-keys situation.

**3. Alert grammar: palette *and* frame-shape encode the alarm's source.** *(XCOM 2,
[jamuidesign.com/xcom-2](https://jamuidesign.com/xcom-2/))* — We have four alarm sources — budget
refusal, provider-refused key, unroutable card, stalled review — and they currently look identical.
Four frames, four palettes, readable before the text.

**4. An overlay panel where every overlay names the failure it makes visible.** *(Factorio FFF-180,
[factorio.com/blog/post/fff-180](https://www.factorio.com/blog/post/fff-180))* — Roboport coverage
existed because construction alerts were unexplainable; power overlay because breaches were
untraceable. Ours: *capability coverage* (why 7 of 23 issues route nowhere), *credit coverage* (why the
tick refused), *review age* (why nothing finishes). No overlay ships without its named failure.

**5. Directional edges with a selectable metric, a percentile noise gate, and a red border where a
monitor is alerting.** *(Datadog Network Map,
[docs](https://docs.datadoghq.com/network_monitoring/cloud_network_monitoring/network_map/))* — This is
how flow gets drawn without becoming a screensaver: animate direction **on hover**, and gate the rest.

**6. The segmented ring: one tick per slot, filled vs idle, count spelled out.** *(io.net Explorer,
measured today: 575 ticks, Hired 547 / Idle 28)* — Exactly right for `QUEEN_WORKER_POLICY_LIMIT = 8`
and for 4 provider keys. It is countable at N=8, it reads honestly at N=0, and it needs no globe. Take
their `--` convention for unavailable-not-zero while you are there.

**7. Overcrowding as a small integer that fills, with a grace period, then kills.** *(Mini Metro,
[Wikipedia](https://en.wikipedia.org/wiki/Mini_Metro_(video_game)))* — Six passengers, sustained, and
the run ends. Our review lane is 13 deep against 8 slots and nothing consumes it. Draw it as a filling
station, not a column header.

*Runners-up, worth having, not in the seven:* Frostpunk's **radius-is-the-resource** and its
**radial-pauses-time** rule; Stellaris' **outliner beside the map** and the modder's law that *some
icons must never shrink*; EVE's **eye-toggle** for cursor-local data density; SC2's **desaturate,
don't delete** for stale state; BOINCstats' **freshness stamp beside every number**; Render's
**countdown-to-next-epoch beside a live log**; Prime Intellect's **sync latency as edge weight**;
Vast.ai's **host reliability score shown wherever the host is shown**.

---

## 2. The three traps, each with a named example

### Trap 1 — the pew-pew globe: a planet drawn because planets look serious

**Named example: io.net Explorer, measured today.** Its hero is a decorative wireframe globe with
gold/violet/cyan arcs and no data bound to it; scrolling to "Supply Insights & Geo Distribution"
yields an almost entirely dark world choropleth with three faintly lit countries, for a network of
575 devices. A world map for a number that fits in a sentence.

The security industry named this failure a decade ago. The nickname for the SOC wall map is the
**"Management Pacification Device"**; CSO Online's practitioner survey found the common misconception
is that the data is live — *it isn't; most are just a subset of recorded attacks or a playback of
sanitized packet captures* — and practitioners said that other than *"performance art"* there is no
real value ([CSO Online](https://www.csoonline.com/article/562681/8-top-cyber-attack-maps-and-how-to-use-them-2.html)).
PwnDefend's steel-man is the one to internalise: *a graph, chart or panel gives far more meaningful
data, they just don't look as "CYBER"*
([PwnDefend](https://www.pwndefend.com/2022/06/16/pew-pew-maps-cool-graphics-bro/)). And the
canonical example still advertises itself as *"a live data visualization of DDoS attacks around the
globe"* while its About page says nothing about sampling or completeness
([Digital Attack Map](https://www.digitalattackmap.com/about/)).

**Our version of this trap:** drawing a globe for two lit nodes. `queen-mission-control.md` §3 already
forbids it. This study adds the evidence that the market leader in our exact category did it anyway
and it looks terrible at 575, let alone at 2.

### Trap 2 — rendering a declaration as if it were a measurement

**Named example: Helium's hexagons.** Semtech's own training material states the green hexes only mean
*someone in the community has onboarded a Hotspot to that location* and *"should not be considered a
detailed RF coverage map"* ([Semtech](https://learn.semtech.com/mod/book/view.php?id=169&chapterid=57)).
Entire third-party projects exist to supply the measured coverage the official map implies but does not
show. **Second named example, same trap, larger:** io.net markets *320,000+ GPUs* while its own explorer
reports 575 cluster-ready today, and the gap has a documented history of spoofed workers — the company
itself acknowledged *"virtual GPU abuse … spoofing approximately 400,000 workers"*
([@ionet](https://x.com/ionet/status/1780877493672595941)). The generalised critique is worth quoting
because it is aimed squarely at us: proof-of-work in these networks often amounts to a node streaming a
result plus a reputation score, *"a pinky promise with extra steps."*

**Our version:** a node drawn because it declared `verilog-synthesis` is a Helium hexagon. Declared and
proven must never share a colour. This is §5 of `queen-mission-control.md` restated as a drawing rule.

### Trap 3 — the dashboard that is not there, and the leaderboard that replaced the map

Measured today, in one sitting: `app.primeintellect.ai/intelligence` → **404**. `psyche.network` and
`app.psyche.network` → **no connection**. `distro.nousresearch.com` → 200, rendering the words *"Nous
DisTrO loading…"* and nothing else. `explorer.helium.com` and `world.helium.com` → **429, Vercel
Security Checkpoint**. `stats.akash.network` → 200 with a spinner in the body. `explorer.io.net` →
5,504 bytes of shell. **Every celebrated live compute dashboard I tried was empty on arrival,
unreachable, or gated.**

And where a live map was never built, a leaderboard took its place: Folding@home publishes **59 API
paths and not one geographic one**, with stats batched hourly and flat files every three hours;
BOINCstats offers "Countries overview" as *Credit/capita* and *Users/capita* on a 24-hour XML dump. The
genre's own visual tradition then died quietly — under BOINC most projects ship no graphics at all.

**Named example for the file: Folding@home.** The largest volunteer compute network ever built decided
its public face was a four-row table of operating systems. That is not a failure to copy — it is a
warning that if you cannot keep a map true, a table is the honest fallback, and the market will accept
it.

**Our version:** a page whose first paint is a spinner, or whose "map" tab renders eight locked hangars
forever because `/queen/public-research` 404s. That second one is not hypothetical — it is what the
`feat/queen-game-cabinet` branch does today, by construction (`buildWorkerHangars(null) → lockedDeck()`).

---

## 3. What makes a network map ALIVE rather than decorative

Not motion. Every dead map in Family B moves. io.net's globe rotates; Digital Attack Map fires arcs
across oceans; both are recordings.

A map is alive when **it is a consequence rather than an illustration** — when the picture changes
*because* something happened, at the moment it happened, in a way that lets you name the cause and act
on it. Four properties, and our supervisor can satisfy all four today with what it already emits.

### 3.1 It has a heartbeat that is allowed to say NO

The single most alive thing available to us is not a dispatch. It is the refusal. `/queen/status`,
fetched at 09:43:19.667Z today:

```
scheduler: { enabled: true, intervalSeconds: 300 }
lastTick:  { allowed: false,
             refusal: "the swarm has spent about $11 today, $1.37 past its $10 daily
                       limit (raise it with TRIOS_SWARM_DAILY_CAP_USD)" }
```

Every 300 seconds a decision is made and recorded, and right now every one of them is *no*, for a
reason stated in a complete sentence, with the remedy in the sentence. **Draw the 300 s clock, draw the
refusal verbatim, and draw $11 against $10 as a bar that has visibly crossed its line.** That is more
alive than any globe and it is 100% real. XCOM's lesson applies exactly: the clock running while you
read is what creates tension — and Frostpunk's applies too: opening the decision radial must pause it.

### 3.2 Every mark is causally traceable to an event, and the causes are few

Our full event vocabulary, measured:

| emitted today | value | what it can draw |
|---|---|---|
| `lastTick.decidedAt / allowed / refusal` | 09:43:19Z, false, 176-char sentence | the heartbeat, the alarm, the reason |
| `scheduler.intervalSeconds` | 300 | the countdown ring (Render's next-epoch device) |
| `dispatches.total / finished / running` | 43 / 43 / 0 | the segmented ring, at rest |
| `dispatches.latest.outcome` | "4 provider key(s): 1 carrying a bee and 3 refused…" | the 4-tick satellite strip, 25% lit |
| `pulse.bees / verdicts` | 15 / 16 | the bee roster and their earned rank |
| `pulse.rounds / lastRoundAt / roundSeconds` | 1 / 09:43:19Z / 300 | **broken — see §10 of the doc** |
| `cards[83] {number,title,column,criteria}` | done 44, backlog 18, review 13, dropped 8 | the lanes, the review backpressure |
| `columns[6]` | incl. `blocked` and `running`, **both empty** | two dead lanes to hide or fill |

That is enough for a living map and it fits in one fetch. What it cannot draw — hardware, worker
slots, an activity stream — is precisely the three 404s, and **a map that draws them anyway is a
Helium hexagon.**

### 3.3 Flow is the payload on the edge, not a number in a box

Mini Metro's rule: the passenger is a shape, riding a train, on a line. Ours: **a dispatch is a mote
that travels the edge from the Queen to the node that ran it, carrying the issue number.** When 43 of
43 are finished and 0 are running, **the correct drawing is a still map with 43 settled marks and no
motion at all** — and that stillness is information, not a bug. The moment `running` becomes 1, exactly
one mote moves. Datadog's discipline keeps it from becoming a screensaver: animate direction on hover,
gate the rest by percentile, and let the operator pick what the edge measures.

Backpressure is the other half. 13 cards sit in `review` against 8 hangar slots and nothing drains
them. Draw review as a **filling station with a small integer capacity** — Mini Metro's six — that
fills, holds through a grace period, then turns the lane red. That is the visible cause of "43
finished, 0 running": work is not blocked on compute, it is blocked on a verdict.

### 3.4 It shows the absence, and it can show nothing at all

`queen-mission-control.md` §10 already establishes *zero is not absent*; io.net independently arrived
at the same convention with `--` for unavailable pricing modes. Three rules follow:

- **Two of six columns are empty.** Either they mean something (and should be drawn empty, labelled) or
  they do not (and should not be on screen). A lane that has never held a card is a decorative lane.
- **`pulse.rounds: 1` beside `roundSeconds: 300` is a lie the player can catch** — 288 rounds are
  possible per day, one row exists, the table is keyed by lease name and upserted. A meter that cannot
  rise teaches the player that the Queen is dead when she is not. This must be fixed before it becomes
  a game meter.
- **The dark node is content.** Two lit nodes, one FPGA with a claim and no probe, one empty GPU slot,
  three 404 endpoints and one over-budget wallet is a *legible opening position*. Sixteen glowing
  continents is a Sybil attack against your own operator.

### 3.5 And the bees evolve only on evidence

The user asked for bees that evolve. The trap is inventing XP. Everything needed is already counted:
`verdicts: 16` and `bees: 15`, `criteria` per card (card #1335 carries 5), 43 issues touched, and the
ring chain T27-00/01/02 on the filesystem. **A bee's rank is the count of criteria it has actually met
across accepted verdicts; its unlocked capabilities are the capability set of the node it can reach.**
Nodebuster's community named the reward correctly — *the visual expansion of the graph is itself the
reward* — so the evolution should be visible as the bee's chassis gaining a plate per rank, and as the
tech tree unfolding a node when a ring seals. Nothing invented, nothing that cannot be recomputed from
the board.

---

## 4. The Protoss translation, from measured hexes

The formula, from the sources: burnished gold plate, worn, angular points and curved ornate forms,
against a cool ethereal glow, on dark — and **colour is a claim about lineage**.

| role | hex | provenance |
|---|---|---|
| ground | `#000000` / `#0A0A0F` | live `--bg`; `#0A0A0F` measured in the sticky CTA bar |
| gold, dark (recessed plate) | `#8F7A50` | live t27.ai, `.blog-card:hover` border |
| gold, burnished (structure) | `#D8BC7A` | live t27.ai, most-repeated literal colour |
| gold, highlight (rim light) | `#F0D79A` | live t27.ai, `.share-pill:hover` colour |
| gold, ceremonial | `#FFD700` | live `--golden` |
| psionic cool (energy, flow) | `#64dcff` | Queen.css in the worktree, 12 uses |
| life / allowed | `#00FF88` | live `--accent` |
| text / muted / border | `#FFFFFF` / `#888888` / `rgba(255,255,255,.08)` | live `:root` |
| type | Outfit; `ui-monospace, SF Mono, Menlo` for machine strings | live `--font` and the CSS |

**Recommendation on the one open question.** Keep `#00FF88` as the *state* colour — it already means
"allowed / healthy" across t27.ai — and use `#64dcff` as the *energy* colour: flow along edges, psionic
glow, the hover animation. Gold is structure and interaction, exactly as the main page already uses it.
That is Protoss (gold plate + cool glow on dark) **and** it is literally the site's existing palette,
so direction 1 and direction 2 do not conflict; they were already the same instruction.

---

## 5. What I could not measure

- **The zoomed-in Protoss view has no published source of truth.** The Behance LotV UI gallery says
  only that the artist worked *"with UI Art Lead, UI Designer, and Game Designers … using an
  established art style"*; no palette or panel breakdown. Everything specific about Protoss panel
  construction in this study is from merchandise/wiki descriptions and my recall, not a design document.
- **XCOM EU2012's Geoscape visuals.** Fandom returned HTTP 402 to my fetch. Panic, satellites and the
  council-withdrawal rule are from Wikipedia; the specific rendering (panic bars, the simultaneous
  abduction choice screen, the base cutaway) is recall, marked false.
- **Helium's map as rendered.** 429 behind a bot wall on both hosts. I describe it from Semtech's and
  the project's own GitHub issues, not from the pixels.
- **Prime Intellect's and Psyche's live dashboards.** 404 / unreachable / "loading…" respectively. I
  have the run metrics from the arXiv report but never saw the screens.
- **Whether the operator's viewport reproduces the horizontal overflow.** Unchanged from
  `viewport-layout.md`; I did not re-test.
- **Nothing was benchmarked here.** The react-three-fiber vs canvas2D tension in §0.4 is a
  contradiction I am reporting, not adjudicating; `engine-benchmark.md` holds the measurements and the
  worktree contract holds the opposite requirement.
- **No repository was modified.** I read `/Users/playra/trinity`, the worktree at
  `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game` and
  `/Users/playra/tri-27/docs/game` read-only, and removed the nine scratch files I wrote under `/tmp`.
  (`/tmp/queenmap` is not mine — it predates this session.)

---

## 6. Files worth opening next

- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/qa/queen-game-cabinet-contract.mjs` — the other agent's five-view contract; read before proposing any layout.
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/components/queenWorkerHangarModel.ts` — the 8-slot hangar model whose only data source is a 404.
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/pages/Queen.css` — 2,953 lines already carrying `#64dcff` and `#ffd45a`.
- `/Users/playra/trinity/apps/website/src/index.css` — the canonical `:root`, identical to what t27.ai ships.
- `/Users/playra/tri-27/docs/game/queen-mission-control.md` §10 — the lying instruments, unchanged and still lying.
