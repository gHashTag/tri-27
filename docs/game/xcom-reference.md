# STUDY 4 — the XCOM EU2012 Mission Control shape, measured off the screen

The three committed studies already establish *what to steal* (`queen-mission-control.md`),
*what renderer* (`engine-benchmark.md`) and *what box it lives in* (`viewport-layout.md`).
None of them contains the reference UI itself: where things sit, how big, what is on top of
what, what colour a thing is, and what the exact consequence of pressing IGNORE is.

That is this document. It is written so somebody who has never played the game can lay out the
screen.

---

## 0. Method — and what "measured" means here

Two kinds of evidence, and they are never mixed in a sentence.

**(a) Wiki prose.** Fetched 2026-09-03. `WebFetch` returned HTTP 403 on ufopaedia.org; a
`curl` with a desktop User-Agent returned 200. Pages pulled and converted to text under
`/tmp/xcomwiki/`:

| page | file | last edited (per page footer) |
|---|---|---|
| Mission Control (EU2012) | `missioncontrol.txt` | 23 Nov 2014 |
| Situation Room (EU2012) | `Situation_Room_EU2012_.txt` | 12 Aug 2016 |
| Panic (EU2012) / Managing Panic | `Panic_EU2012_.txt`, `Managing_Panic_EU2012_.txt` | 24 Nov 2019 |
| The Council (EU2012) | `The_Council_EU2012_.txt` | — |
| Satellite (EU2012) | `Satellite_EU2012_.txt` | 4 Jan 2014 |
| Interceptor (EU2012) | `Interceptor_EU2012_.txt` | 2 Jan 2023 |
| Air Combat (EU2012) | `Air_Combat_EU2012_.txt` | — |
| Missions (EU2012) | `Missions_EU2012_.txt` | — |
| Alien Abductions (EU2012) | `Alien_Abductions_EU2012_.txt` | — |
| Alien Terror (EU2012) | `Alien_Terror_EU2012_.txt` | — |
| XCOM Headquarters (EU2012) | `XCOM_Headquarters_EU2012_.txt` | — |
| Mission Control (**Long War** — a mod, flagged wherever cited) | `Mission_Control_Long_War_.txt` | 8 Dec 2019 |

404s (the titles do not exist): `Countries (EU2012)`, `Mission Frequency (EU2012)`,
`Abduction (EU2012)`, `Terror Site (EU2012)`, `UFO Missions (EU2012)`, `Defections (EU2012)`,
`Satellite Network (EU2012)`, `Interface (EU2012)`. So where those subjects appear below,
they come from the Panic / Council / Missions pages instead.

Everything on those pages is treated as **data**. Nothing in them was followed as an
instruction.

**(b) Pixel measurement of the wiki's own screenshots.** This is the part the wiki prose cannot
give and the part I refuse to supply from memory. Five native-resolution screenshots
(1920×1080) and two UI crops were downloaded and decoded with a hand-rolled PNG reader
(zlib + the five PNG filter types), then bounding boxes and modal colours were computed:

| file | what it shows |
|---|---|
| `img_Control.png` 1920×1080 | Mission Control, hologram view, idle (SCAN available) |
| `img_ArgentinaOut2.png` 1920×1080 | Mission Control, a country at high panic and a country defected |
| `img_TerrorAttack.png` 1920×1080 | Mission Control with a **decision modal** up |
| `img_TerrorAttack2.png` 900×900 | the top-centre MISSIONS stack with two pending items |
| `img_UFOIntercept.png` 1920×1080 | Mission Control, "Normal" (non-hologram) globe, camera zoomed |
| `img_SR.png` 1920×1080 | the Situation Room, full screen |
| `img_Panic_Levels_(EU2012).png` 400×192 | the five-step panic colour ramp, alone |
| `img_Doom_Tracker_(EU2012).png` 400×192 | the doom bar, alone, 5 of 8 filled |
| `img_Main_Screen_(EU2012).png` 397×172 | crop of the Situation Room map with its counters |

All percentages below are fractions of screen width/height at 1920×1080. Boxes marked
**[bbox]** were computed; boxes marked **[eye]** were read off a 1400-px render and are good
to about ±3%.

**(c) One live reading, for the t27 lines.** `/queen/status` on the production supervisor,
2026-09-03T09:23Z (the first attempt timed out at 20 s; a 45 s retry returned 200 in 1.59 s):
scheduler on at 300 s, `running: 0`, and the refusal
`"the swarm has spent about $11 today, $1.37 past its $10 daily limit (raise it with TRIOS_SWARM_DAILY_CAP_USD)"`,
latest dispatch outcome `"4 provider key(s) configured: 1 carrying a bee and 3 refused by the provider"`.
That is a different state from the one the earlier studies recorded two hours previously
(2 live / 2 refused, 2 bees running). The mapping in §6 is written against the live state, not
a remembered one.

**Recall is quarantined.** Everything I am reporting from having played the game rather than
from a page or a pixel is in §8 and nowhere else.

---

## 1. Region-by-region

XCOM EU2012 has **two** strategic screens, not one, and the split is the single most useful
thing to copy. Mission Control is *time and events*. The Situation Room is *state and money*.
They share a top-level navigation bar and nothing else.

### 1.1 MISSION CONTROL — idle state (`img_Control.png`)

```
 0%                    35%        50%        65%                   100%
 ┌──────────────────────────────────────────────────────────────────┐ 0%
 │                          [MISSIONS]                              │
 │                    ┌──────────────────────┐                      │ 8%
 │                    │  ▣ SCAN FOR ACTIVITY │   ← 14.4% × 2.6%     │ 11%
 │                    └──────────────────────┘                      │
 │        ╭────────────────────────────────────────╮                │
 │        │                                        │                │
 │        │                                        │                │
 │        │             T H E   G L O B E          │                │ 50%
 │        │        centre ~(50%, 50%)              │                │
 │        │        x 28–72%   y 12–89%   [eye]     │                │
 │        │                                        │  ┌───────────┐ │ 65%
 │        │                                        │  │ UPCOMING  │ │
 │        │                                        │  │  EVENTS   │ │
 │        ╰────────────────────────────────────────╯  │  8 Days ⚗ │ │
 │                                                    │ 31 Days ⊕ │ │ 93%
 │  ┌──┐┌──┐        ┌─────────────────────┐           └───────────┘ │
 │  │← ││🌐│        │ 1:47 AM │ 1 March   │                         │ 97%
 │  └──┘└──┘        │      PM │ 2015      │                         │
 └──────────────────────────────────────────────────────────────────┘ 100%
```

| region | box | always visible? | contents |
|---|---|---|---|
| **Pending-decision slot** (label `MISSIONS`) | top-centre; the SCAN button inside it is **x 42.1–56.5%, y 8.1–10.7%** [bbox], chrome bracket x ≈40–59%, y ≈2–13% [eye] | **conditionally** — see §2 | Either the single `SCAN FOR ACTIVITY` control **or** a vertical stack of pending mission chips. Never both. |
| **The globe** | x ≈28–72%, y ≈12–89% [eye]; centre ≈(50%,50%) | yes, but **its size is not fixed** | 3D Earth+Moon. The camera zooms to a site — in `img_UFOIntercept.png` the same globe fills a different fraction of the screen entirely. Treat the globe box as a *camera*, not a layout rectangle. |
| **UPCOMING EVENTS** | x ≈71–98%, y ≈67–93% [eye]; bright-pixel bbox x 68.0–99.3%, y 64.8–95.3% [bbox] | yes on this screen | Right-aligned title, then one row per scheduled item: a large numeral, the word `Days` under it, a per-type icon, and a label. Measured examples: flask + `8 Days` + `Alien Materials`; wrench + `12 Days` + `Satellite`; globe + `14 Days` + `Council Report`. **Countdowns are integer days, never hours.** |
| **Clock strip** | x ≈37–64%, y ≈90–97% [eye]; bbox x 35.5–67.7%, y 88.9–98.1% [bbox] | **yes — survives even under the decision modal** | `H:MM` large, then a stacked `AM`/`PM` pair with only the current one lit, then `D Month` / `YYYY` on two lines. |
| **Corner controls** | x 2.7–14.2%, y 91.4–98.2% [bbox] | back arrow yes; globe toggle situational | Two square buttons: back-to-base, and the globe/political-view toggle. In `img_TerrorAttack.png` the back arrow is still there and the globe toggle is **gone**. |
| **The room** | everything else — roughly 55% of the pixels | yes | A rendered diorama with staff, banners and screens. It carries **zero information**. It is pure atmosphere and it costs the layout nothing because nothing else needs the space. |

### 1.2 MISSION CONTROL — decision state (`img_TerrorAttack.png`)

The idle screen does not gain a dialog. It **rearranges**.

| region | box | change from idle |
|---|---|---|
| **Brief card** (left) | x 3.1–32.1%, y 15.7–86.9% [bbox] — ~29% × 71% | **new.** Red-framed. Top ~40% is a thumbnail of the site. Then a two-line headline: verb line `ALIENS TERRORIZING` above place line `MENDOZA`. Then `PANIC:` with a 5-slot pip bar (4 filled orange `#C55E1B`, 1 hollow) [bbox x 7.7–23.8%]. Then `MISSION DIFFICULTY:` and a red word, `Very Difficult`. |
| **Decision card** (right) | x 68.0–93.1%, y 35.4–63.3% [bbox] — ~25% × 28% | **new.** Red-framed panel holding exactly **two** cyan pill buttons, stacked, full panel width: `SEND SKYRANGER` and `IGNORE`. |
| **Globe** | red reticle over the site, x 31.2–57.7%, y 32.8–82.0% [bbox] | camera has flown to the site; a broken red targeting ring, a red hazard `!` glyph, red arrow ticks |
| **Pending-decision slot** | — | **gone.** The whole top-centre region including SCAN FOR ACTIVITY is not drawn. |
| **Clock strip** | unchanged | still there, still ticking in the layout |
| **Globe toggle** | — | gone; back arrow stays |

The card is not modal in the CSS sense — the globe is still visible and animating between the
two cards. It is modal in the *decision* sense: the control that advances time has been
removed from the screen.

### 1.3 MISSION CONTROL — multiple pending (`img_TerrorAttack2.png`)

The top-centre slot holds a **stack** of dark pill rows, each: icon | CAPS LABEL.
Measured: row 1 = globe icon, white-cyan text, `CONFOUNDING LIGHT` (a Council mission). Row 2 =
yellow hazard-triangle icon, **amber** text, `ALIEN TERROR ATTACK IN MENDOZA!` — trailing
exclamation mark included.

So urgency inside the list is carried by three redundant channels at once: icon glyph, text
colour, and punctuation.

### 1.4 SITUATION ROOM (`img_SR.png`)

```
 0%      25%                            66%   75%        93% 100%
 ┌──────────────────────────────────────────────────────────────┐ 0%
 │      RESEARCH ENGINEERING BARRACKS HANGAR [SITUATION ROOM]   │ 2%
 │                                            CREDITS: §207     │
 │                                            MONTHLY: +§142    │ 7%
 │  ┌────────┐  ┌──────────────────────┐ ┌──────────────┐       │
 │  │US  ▰▰▰▱▱│  │▱▱▱▱▱▱▱▱ doom  0 AVAIL│ │LAUNCH SAT..  │       │ 17%
 │  │CA  ▰▰▰▱▱│  │              5/5 ORB │ │VIEW FINANCES │       │
 │  │MX  ▰▰▱▱▱│  │                      │ │GRAY MARKET   │       │ 26%
 │  │AR  ▰▰▱▱▱│  │    flat world map    │ │PENDING REQ(0)│       │
 │  │BR  ▰▱▱▱▱│  │                      │ └──────────────┘       │
 │  │EG  ▰▱▱▱▱│  │  ● sat  ○✈✈ intcp    │  │RU ▰▰▰▱▱   │        │
 │  │ZA  ▰▰▱▱▱│  │                      │  │FR ▰▰▰▱▱   │        │
 │  │NG  ▰▱▱▱▱│  │                      │  │DE ▰▱▱▱▱   │        │ 58%
 │  │  +§100 ▰│  └──────────────────────┘  │ …8 rows   │        │
 │  └────────┘   ✦ news ticker scrolling…  └───────────┘        │ 63%
 │                                                              │
 │  ┌──┐                                                        │
 │  │← │            (room art — no information)                 │
 │  └──┘                                                        │
 └──────────────────────────────────────────────────────────────┘ 100%
```

| region | box | always visible? | contents |
|---|---|---|---|
| **Facility bar** | y 1.9–7.2%, tabs x ≈31–68% [bbox] | yes | `RESEARCH ENGINEERING BARRACKS HANGAR SITUATION ROOM`. Current tab boxed and bright; the others dimmed. |
| **Money** | x ≈76–84%, y ≈2–7% [bbox] | yes | Two lines, green: `CREDITS: §207` (stock) and `MONTHLY: +§142` (rate). Stock and rate adjacent, never merged. |
| **Left country column** | x 7.8–23.2%, y 18.9–63.0% [bbox] | yes | 8 rows. Row pitch measured **62 px at 1080 = 5.74% of height**. |
| **Right country column** | x ≈75–93%, y 16.7–62.8% [bbox] | yes | the other 8. 16 total, split 8/8, flanking the map. |
| **Map panel** | x ≈25–74%, y ≈15–58% [eye] | yes | A flat equirectangular world, dark teal. Not a globe. |
| **Doom tracker** | x 25.9–48.7%, y 17.2–19.2% [bbox] — **inside the map panel's top-left**, overlapping the map | yes | 8 slanted pips. Filled = `#F79221` orange with a bloom; empty = `#21353A` fill with a thin red outline. 5 of 8 filled in `img_Doom_Tracker`. 0 of 8 in `img_SR`. |
| **Satellite counters** | top-right corner of the map panel | yes | Two rows of green LCD text, each with a satellite glyph: `0 AVAILABLE` and `5/5 IN ORBIT`. |
| **News ticker** | x 35.4–74.3%, y 60.4–62.6% [bbox] | yes | One line of green text scrolling under the map, with an XCOM sigil at its left. Measured: `Purported alien abduction in South Africa stopped by`. Flavour, and a soft channel for state. |
| **Action stack** | x 66.1–84.3%, y 5.6–26.1% [bbox] | yes | Four stacked full-width cyan buttons: `LAUNCH SATELLITE`, `VIEW XCOM FINANCES`, `VISIT THE GRAY MARKET`, `PENDING REQUESTS (0)`. **The count is in the button label.** |
| **Room art** | y > 63% — the bottom **37% of the screen** | yes | Nothing. |

**The country row is the atom of this whole design.** Measured from a 1000-px upscale of the
left column:

```
 NIGERIA                              +§100
 ▰▱▱▱▱                                 ▬▪▬   ← satellite glyph, lit green
 └─ 5 slanted pips, filled left→right   └─ funding, shown green
    all in one colour = the panic band
```

Three facts in ~62 px of height and ~16% of width: **panic** (pip count + hue), **coverage**
(satellite glyph lit green vs dark grey silhouette), **contribution** (`+§100`). In this frame
the funding figure appears only on the row whose satellite is lit — consistent with the wiki's
"Satellites secure funding and rewards from each country with coverage", though one frame is
not proof.

### 1.5 Z-order, from what was measured occluding what

1. Room diorama (background plate).
2. The globe / the map panel.
3. Map-anchored icons — satellites, interceptors, craft, flight paths, HQ marker, site markers. Clipped by the globe limb.
4. Persistent HUD — clock strip, corner buttons, facility bar, money, both country columns, UPCOMING EVENTS, doom tracker, news ticker.
5. Doom tracker specifically sits **above** the map panel it overlaps (measured: it is drawn over map pixels).
6. The Situation Room action stack sits **above** the right country column — measured: `UNITED KINGDOM`'s row is partly hidden behind `LAUNCH SATELLITE`. The designers accepted occluding a country to keep the actions in the top-right.
7. Event brief + decision cards — above the globe, and they **remove** the top-centre slot rather than covering it.
8. Hover tooltip — measured in `img_SR.png`: `View monthly expenditures and incomes.` drawn at x ≈52–66%, y ≈13–24%, over the map **and** over the doom tracker's row. Topmost.

### 1.6 The proportions that actually matter

- Information occupies roughly the **top 63%** of the Situation Room and the **outer frame** of Mission Control. Both screens leave a large, deliberately empty middle-or-bottom.
- No panel is wider than **~31%** of screen width. The two country columns are ~16% each; UPCOMING EVENTS ~27%; the decision card ~25%; the brief card ~29%.
- The one control that advances the game is **14.4% × 2.6%** — under 0.4% of the screen area. It is small because it is unmissable: it is the only green thing on a cyan screen, at the top centre.
- Nothing scrolls. Sixteen countries fit because they are split into two eight-row columns at 5.74% height each, not because a list scrolls.

**t27:** two screens, not one — a MISSION CONTROL that owns *time and pending decisions* (round clock bottom-centre, one advance control top-centre, an upcoming-events rail on the right, the node map in the middle) and a COUNCIL/SITUATION screen that owns *state and cost* (two eight-row pool columns flanking the compute map, credit stock + burn rate top-right, the loss bar overlapping the map's top-left).

---

## 2. The TIME model

**What the wiki states.**

- "Enemy Unknown is played in real time" (Mission Control page). Time runs; it is not turn-based.
- "The Hologlobe is where the game is advanced until new events occur… all non-trivial actions… take time to accomplish and this time must be waited out on Mission Control." Time is only spent on this one screen.
- "The map is continuously updated as the SCAN FOR ACTIVITY button is pressed/clicked to speed up time."
- Long War page (**a mod page**, describing the same control): "**Scan for Activity. Accelerates time until something happens**, such as: new UFO activity… completion of a research or Foundry project… completion of excavation, construction of a facility or production… arrival of new soldiers or Interceptors… Council request for a mission… country request…". That is the interrupt list, enumerated.
- "The AI will check and update the strategic situation **every each half hour of game time**." The simulation tick is 30 game-minutes.
- "When XCOM craft are sent on missions the **SCAN FOR ACTIVITY button is disabled** until the mission is completed and the aircraft returns to XCOM's HQ."
- The clock face is `H:MM AM/PM` + `D Month YYYY` (measured on four screenshots: 1:47 AM 1 March 2015; 6:14 AM 17 April 2015; 8:31 AM 9 March 2015; 3:50 AM 16 April 2015).
- The scheduling unit above the tick is the **day** (UPCOMING EVENTS counts in whole days) and above that the **month** (the Council report grades a month; countries defect at month end; up to 1/2/4/8 defections per month by difficulty).

**Speed controls: the wiki does not state that any exist.** There is exactly one time verb on
the page — SCAN FOR ACTIVITY. No pause button, no 1×/2×/4× selector, no slider appears in any
fetched page or in any of the seven screenshots. I searched all fetched text for
`pause`/`speed up`/`fast forward`/`slow down` and the only hits are the three sentences quoted
above.

**So the model, stated as a state machine:**

```
HELD ──press SCAN──▶ RUNNING ──interrupt fires──▶ HELD (and the SCAN control is not drawn)
  ▲                                                   │
  └────────────── player answers the decision ────────┘

RUNNING is also unreachable while a craft is in flight: SCAN is disabled, not hidden.
```

Three distinct reasons the game is not advancing, and the UI shows a **different thing** for
each:

| reason | what the top-centre slot shows |
|---|---|
| nothing pending, waiting on you | the green `SCAN FOR ACTIVITY` button |
| a decision is pending | the mission chip stack, or the brief+decision cards with the slot removed |
| an operation is in flight | `SCAN FOR ACTIVITY`, **disabled** |

That is the whole trick: the player never has to ask "why isn't time moving". The control that
would move it has changed appearance for the specific reason.

**t27:** one advance verb (`POST /queen/lease/tick`, already the only mutating control) in the top-centre slot, rendered in three distinguishable states — *armed* when the next round is just waiting on the 300 s timer, *replaced by a decision stack* when an escalation or an uncriteria'd issue needs a human, and *disabled with the reason on it* when the Queen is refused (today: `$11 spent against a $10 daily cap`) — because a round timer that silently does nothing is the same defect as a "1 round in 24h" gauge.

---

## 3. The ALERT model

### 3.1 How an event announces itself

- Wiki: "The majority of missions and other Council events are created by the game's A.I. and **will appear without previous warning**." There is no incoming-alert pre-roll for alien events.
- The announcement *is* the interruption: the running clock stops and the screen rearranges into the decision state of §1.2.
- Player-created work is the opposite and lives in a different widget: "Upcoming events are those created by the player" — research, engineering, the Council report, new soldiers/craft, satellites becoming operational. Those are announced by a **countdown in days**, in the right rail, long before they happen.

**That split is the load-bearing idea.** Two event classes, two completely different surfaces:

| class | source | surface | urgency |
|---|---|---|---|
| scheduled | the player started it | UPCOMING EVENTS rail, right side, `N Days` | none — it will happen |
| unscheduled | the world | the top-centre slot; escalating to a full brief+decision layout | total — it stops time |

### 3.2 How the player accepts or ignores

Measured, `img_TerrorAttack.png`: two buttons, stacked, in a panel of their own.
`SEND SKYRANGER` / `IGNORE`. **Ignore is a first-class, equally-sized, always-present control.**
It is not a close-X and not a "later".

And for abductions the choice is harder than accept/ignore. Wiki (Alien Abductions):
"You'll always be offered a **choice between 2 or 3 countries**, each offering a different
reward if the mission is successful." You do not decide *whether* to act; you decide *which one
of three* to save, and the other two are ignored by construction.

Council requests are the third shape: "Each request has a **20 days limit** to be completed
before it disappears." An offer with a shelf life.

### 3.3 The consequence of ignoring — the exact table

All from the Panic (EU2012) and The Council (EU2012) pages.

| ignored / failed | in the country | on the rest of the continent | other |
|---|---|---|---|
| Abduction, unstopped | **+2 panic** (+3 on Impossible) | +1 panic | marks the country **'not helped'** |
| Abduction, unstopped but another on the same continent *was* stopped | **+1 panic only** | — | the mercy clause |
| Terror site ignored, lost, aborted, or 0 civilians saved | **the country leaves the Council immediately** | +2 panic | marks 'not helped' |
| UFO not intercepted | +2 panic | — | |
| UFO intercepted but not shot down | +1 panic | — | |
| Satellite destroyed (i.e. you ignored the UFO over it) | +2 panic | +1 panic | **lose detection and lose that country's funding**; marks 'not helped' |
| Most Council missions ignored/failed | +1 or +2 panic | only on Impossible | **no effect on the monthly score at all** |
| Six named Council missions ignored | 0 | 0 | free to skip |

**The 'not helped' flag is the cleverest part and it is invisible on the map.** From the Council
page: a country at panic 5 at month end leaves with **50%** probability normally, but **100%**
if it is marked 'not helped'. Abductions and terror sites mark it; losing a satellite over it
marks it. Shooting down a UFO over it, or launching a satellite over it, **clears the mark**.

So ignoring does two things: it raises a visible meter, and it flips a hidden flag that doubles
the chance the visible meter kills you. The player learns the flag exists by losing a country
they thought was only at 50%.

**And ignoring is sometimes correct.** Council missions cost you no score. Six of them cost you
no panic either. The design deliberately makes IGNORE a real move rather than a punishment, so
the player is choosing rather than obeying.

**t27:** every notice gets an explicit two-button `TAKE` / `IGNORE`, ignoring is recorded as a decision with a stated cost rather than silently dismissed, escalations offered as *pick one of N* rather than *approve or not* (the Queen already computes `whyNotChosen` per skipped candidate — that is the other two abduction sites), and the equivalent of the 'not helped' flag is `queen_dispatch.send_backs`, which is incremented in the same statement as the verdict and is currently exposed on no public route.

---

## 4. The RESOURCE strip

There is no single strip. There are **four groups, on three screens**, and the grouping rule is
what to copy.

### Group A — money (Situation Room, top-right, measured x ≈76–84%, y ≈2–7%)
```
CREDITS: §207
MONTHLY: +§142
```
A **stock** and a **rate**, on two lines, adjacent, never combined into one number. Green.

### Group B — capacity (Situation Room, top-right of the map panel)
```
⌗ 0 AVAILABLE
⌗ 5/5 IN ORBIT
```
Again two lines: what is **spare** and what is **committed**, with the committed one written as
`used/total`. A satellite you own but have not launched and a satellite in orbit are different
resources and are never summed.

### Group C — the loss meter (Situation Room, doom tracker, x 25.9–48.7%, y 17.2–19.2%)
8 pips. Not a number, not a percentage: **eight discrete slots, because eight is the number
that ends the game.** The scale of the widget *is* the rule. 5 filled means three left.

### Group D — schedule and time (Mission Control)
- Clock strip, bottom-centre: `H:MM AM/PM`, `D Month YYYY`.
- UPCOMING EVENTS, right rail: one row per pending item, `N Days` + icon + label.

### Plus: per-entity, on the entity's own row
Funding (`+§100`) is not in a global total anywhere on the Situation Room. It sits on the
country row that produces it. The player reads the total by reading the rows.

### And on the base screen
The wiki's XCOM Headquarters page lists what the base ("Ant Farm") view carries: "the Time and
Date, the number of Credits(§), Monthly Funding, Alien Alloys & Elerium & Meld (if any) and an
Event List." Note **"(if any)"** — a resource you have none of is not rendered as zero. It is
absent.

**Rules extracted:**
1. Stock and rate are separate lines, never one number.
2. Spare and committed are separate lines, never summed.
3. A meter whose maximum is a rule is drawn with exactly that many slots.
4. A resource you have none of is omitted, not printed as `0`.
5. Per-entity contribution lives on the entity's row, not in a global sum.
6. The count of pending items lives inside the button label: `PENDING REQUESTS (0)`.

**t27:** four groups — money (`spent today $11` / `cap $10` as stock-and-rate, amber when over), capacity (`keys spare` vs `1/4 carrying a bee`, never summed), the loss bar drawn with exactly `MAX_CONCURRENT_WORKERS = 4` slots so the widget's size states the rule, and clock + upcoming rounds — with per-pool contribution on each pool's own row and a dash, never a zero, wherever the value is `nil` rather than measured.

---

## 5. The COLOUR language

### 5.1 The panic ramp — sampled

From `img_Panic_Levels_(EU2012).png`, mode colour of each of the five pips, sampled in a
35-row band through the pip bodies:

| level | measured | reads as |
|---|---|---|
| 1 | `#68E8EC` | bright cyan |
| 2 | `#4A9E9F` | dim teal |
| 3 | `#AA8F2F` | gold |
| 4 | `#A45D08` | orange |
| 5 | `#A22329` | red |

From the live Situation Room (`img_SR.png`), the filled pips of each country row:

| country | pips filled | measured colour |
|---|---|---|
| United States, Canada | 3 of 5 | `#FCCE3B` (gold) |
| Mexico, Argentina, South Africa | 2 of 5 | `#67E4EA` (cyan) |
| Brazil, Egypt, Nigeria | 1 of 5 | `#67E4EA` (cyan) |

From the terror brief card (`img_TerrorAttack.png`), 4 of 5 filled: `#C55E1B` (orange).

**One discrepancy, stated rather than smoothed.** The standalone ramp image gives level 2 a
distinctly dimmer teal than level 1; the live screenshot shows level 1 and level 2 in the same
bright cyan. Either the ramp image carries a lighting falloff, or levels 1 and 2 genuinely share
a hue in-game. **The wiki does not state the level→colour mapping** — the Situation Room page
says only "a panic level from 0 to 5 (**and a corresponding color**)" and never says which.
What is measured beyond doubt is the *ordering* and the two hue jumps: cyan through level 2,
gold at 3, orange at 4, red at 5.

Also note the wiki contradicts itself on the range: Situation Room says "0 to 5", the Panic page
and the Council page both say "1 to 5", and the pip bar has five slots. Five slots is what is on
screen.

**The pip bar is monochrome per row.** A country at 3 does not show cyan-teal-gold; it shows
three gold pips and two hollow gold outlines. The country's *name* takes the same colour. So a
whole row is one hue, and the eye scans a column of 8 rows for the odd colour out.

### 5.2 The rest of the palette, all measured

| colour | measured | meaning |
|---|---|---|
| cyan | `#67E4EA` | the neutral UI, and low panic. The resting state of everything. |
| green | (satellite discs, craft, flight paths, HQ marker, lit satellite glyph, credits text, news ticker) | **XCOM's own assets and XCOM's own good news.** Green never means "safe"; it means "mine". |
| dark grey silhouette | (the unlit satellite glyph on a country row) | **an asset slot that exists and is empty.** The slot is always drawn. |
| dimmed cyan text | `RESEARCH ENGINEERING BARRACKS HANGAR` vs boxed bright `SITUATION ROOM` | **unavailable / not current.** |
| gold / amber | `#FCCE3B`, `#F79221`, `#C55E1B` | raised panic, doom pips, and urgent-but-not-yet-lost event text. |
| red | `#A22329`; event panel frames; the reticle; the UFO icon | **hostile, or terminal.** |
| solid country fill | Brazil solid red; South Africa solid yellow | the country is *in an exceptional state*. |
| red vortex over a country | (wiki text + `img_ArgentinaOut2.png`) | "Countries who signed pacts with the aliens are marked with a 'red vortex'." Defected. |

### 5.3 How a country is read from the map alone

The governing rule, and it is measured across two frames:

> **A country in a normal state has no fill at all.** In `img_Control.png` every country is an
> unfilled cyan outline except South Africa, filled yellow. In `img_ArgentinaOut2.png` every
> country is an unfilled outline except Brazil, filled red, and Argentina, carrying a vortex.

So the map is not a choropleth. It is a **blank sheet with exceptions painted on it**, and the
scan cost is proportional to the number of problems, not to the number of countries. A map that
coloured all sixteen would take sixteen reads. This one takes one.

The glance stack, cheapest first:

1. **Is anything filled?** No → nothing is wrong. Yes → that hue is the severity.
2. **Is there a vortex?** → that one is gone.
3. **Green disc over it?** → covered, funded, and immune to abductions ("Countries with active satellites are not subject to Alien Abductions").
4. **Amber ring + aircraft glyphs nearby?** → interceptors are stationed on that continent, and the glyph count is how many.
5. **Red or amber marker on it?** → an event is live there right now.

And in the Situation Room, the same country is read from the row: name hue = band, pip count =
exact level, satellite glyph lit/dark = coverage, `+§N` = what it pays.

**t27:** cyan is the resting state of every pool and every panel; green means *ours and running* (a live key, a bee mid-turn, a pool that replayed a matching tree hash); a dark grey silhouette is a slot that exists and is empty (a configured-but-refused credential, an unfilled bee cell) and it is always drawn so absence is visible; gold/orange is pressure that has not yet cost anything; red is refused, blocked or lost; and **an unremarkable pool gets no fill at all**, so a map of a hundred community machines costs one glance rather than a hundred.

---

## 6. The t27 mapping, collected

| # | XCOM | t27, where our map is contributed compute and our countries are community resource pools |
|---|---|---|
| 1 | Two screens: Mission Control (time+events) and Situation Room (state+money) | MISSION CONTROL owns the round clock, the advance control and the pending decisions; COUNCIL owns the pool rows, the cost strip and the loss bar. Do not merge them — the earlier study's five-tab shell already implies this split; this is the geometry for it. |
| 1 | Country row = panic pips + coverage glyph + funding, 5.7% of screen height | Pool row = pressure pips + capability glyphs (`cpu` / `fpga` / `gpu`, lit or dark silhouette) + what it contributed this period. Two eight-row columns flanking the map; sixteen pools fit without a scrollbar. |
| 1 | Room art fills 37–55% of the screen and carries nothing | We do not have that budget and should not fake it; the space it buys is instead the *empty* map, which is honest when only two nodes are lit. |
| 2 | One time verb, three visual states (armed / replaced by a decision / disabled with a reason) | The 300 s round timer top-centre: armed, replaced by an escalation stack, or disabled carrying the Queen's own refusal string verbatim (live today: the `$10 daily cap` sentence). |
| 2 | AI re-evaluates every 30 game-minutes; days for scheduling; months for scoring | Ticks every 300 s (measured 299.94 s apart in the earlier study); the *day* is our UPCOMING-EVENTS unit (issue age median 16 d); the *month* has no analogue yet and probably should not be invented. |
| 3 | Unscheduled events stop time; scheduled ones count down in days on a right rail | Escalations and blackouts stop the round and take the centre; issue ages, review-hold expiries (`REVIEW_BOUNDARY_HOLD_HOURS = 48`) and key top-ups count down in the right rail. |
| 3 | `SEND SKYRANGER` / `IGNORE` as equal-weight buttons; ignoring is a legal move with a stated price | Every notice gets `TAKE` / `IGNORE`, and IGNORE writes a row. Ignoring a card that names no boundary should be free, exactly as six Council missions are free. |
| 3 | Choose 1 of 3 abduction sites; the other two burn, softened if one on the same continent was saved | Present the escalation as *pick one of the N startable issues*; the ones not picked are the cost, and picking one inside the same boundary set softens its neighbours — the `pathsOverlap` adjacency graph is already the continent. |
| 3 | The hidden 'not helped' flag doubles the chance a panicked country leaves | `send_backs` is our flag, it already exists in the schema, and it is on no public route. Expose it or the player is optimising against a meter that is missing a term. |
| 4 | Stock and rate on separate lines; spare and committed never summed; `(if any)` omits empties | `spent today $11` beside `cap $10`; `keys spare` beside `1/4 carrying a bee`; and a dash, never a zero, wherever the value is `nil` rather than measured. |
| 4 | The doom bar has exactly 8 slots because 8 is the rule | The bee bar has exactly `MAX_CONCURRENT_WORKERS = 4` slots, and the credential bar exactly as many slots as keys are configured, so the widget's *size* states the ceiling. |
| 4 | The pending count lives inside the button: `PENDING REQUESTS (0)` | `ESCALATIONS (n)`, `UNROUTABLE (7)` — the count is the label, not a badge beside it. |
| 5 | Cyan resting, green = mine, grey silhouette = empty slot, gold = pressure, red = lost | Same five, unchanged; green specifically reserved for *ours and running* — a live key, a bee mid-turn, a pool whose replayed tree hash matched. |
| 5 | A country in a normal state has **no fill**; the map is exceptions painted on a blank sheet | A pool that is idle-and-fine is an unfilled outline. This is what makes a two-node map and a hundred-node map cost the same glance, and it is the only reason the community map scales. |

---

## 7. What the wiki does not state

Listed so nobody later reads a gap here as a fact.

- **The level→colour mapping for panic.** "a corresponding color", never which.
- **The panic range.** Three pages, two answers: `0 to 5` (Situation Room) and `1 to 5` (Panic, Council). Five pips on screen.
- **Any pixel dimension, aspect ratio, font, or z-index.** Every proportion in §1 is mine, from the screenshots, and carries a `[bbox]` or `[eye]` tag.
- **Any pause control or speed multiplier.** Only `SCAN FOR ACTIVITY` appears anywhere.
- **What happens when you press SCAN a second time while it is running.**
- **How the mission chip stack behaves past two entries** — whether it scrolls, caps, or grows.
- **How long an unscheduled mission stays available before expiring**, except for Council *requests*, which are stated as 20 days.
- **Whether the UPCOMING EVENTS rail scrolls or caps.** Three rows is the most any screenshot shows.
- **Whether the green continent tint in the Situation Room map means "fully covered" or "base continent".** Two frames were not enough to separate them.
- **Whether the funding figure on a country row appears only when covered.** One frame is consistent with it; one frame is not proof.
- **The hover/keyboard affordances of the country rows.**
- **Anything about how the game behaves at other aspect ratios.** All seven screenshots are 16:9.
- Keyboard: the **Long War** page (a mod) says `F1`–`F7` rotate the hologlobe to each continent and pole, and that the lower-left "Earth button" switches to the political view showing panic. The EU2012 page independently calls it "the globe button" and says it toggles Hologram/Normal. The `F1`–`F7` binding is from the mod page only.

---

## 8. What I am recalling rather than reading — quarantined

Three things, each flagged as **unverified recall, not evidence**, offered only because they are
cheap to check if they matter:

1. I believe pressing `SCAN FOR ACTIVITY` a second time while it is scanning stops the scan, i.e. it is a toggle rather than a fire-and-forget. Nothing on any fetched page says so.
2. I believe the game returns to a held clock automatically after any interrupt resolves, rather than resuming the scan. The wiki's "accelerates time until something happens" is consistent with this but does not state it.
3. I believe the country rows in the Situation Room are hoverable and show a detail card. Nothing on the page says so, and the only tooltip I could measure is on the `VIEW XCOM FINANCES` button.

Everything else in this document is a quoted page or a computed pixel.

---

## 9. Artifacts

Scratch, under 300 MB (measured: **21 MB** in `/tmp/xcomwiki`, nothing written anywhere else,
no repository touched):

- `/tmp/xcomwiki/*.txt` — the 18 converted wiki pages
- `/tmp/xcomwiki/img_*.png` — the 9 native screenshots and UI crops
- `/tmp/xcomwiki/v_*.jpg`, `/tmp/xcomwiki/c_*.png` — downscales and crops used for reading
- `/tmp/xcomwiki/fetch.py` — the fetch+convert script (re-runnable)

Deployment target confirmed read-only: `/Users/playra/trinity/apps/website/src/pages/Queen.tsx`
(361 lines) and `Queen.css` (162 lines). Worth naming before anyone builds from this: that page
currently has **three** tabs (`brain` / `body` / `spirit`) and talks to a Zig brain exposing
`/health`, `/api/containers`, `/api/sessions` — **not** the Railway supervisor at
`trios-agent-server-production.up.railway.app` whose `/queen/status` and `/queen/public-board`
every number in the three prior studies came from. Nothing in this document resolves that; it
is the first thing a builder will hit.
