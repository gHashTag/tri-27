# STUDY 4 — The economy

Lands, colours, the three classes, and what a proof of compute is actually worth.

Written 2026-09-03, between 09:05Z and 09:20Z. This is the fourth study. It does
not restate `engine-benchmark.md` (verdict: canvas2D), `queen-mission-control.md`
(the XCOM shape) or `viewport-layout.md` (the tab set and the height chain). It
answers the one question those three leave open: **the user said the lands and
their colours ARE the community's resources. What is a land, what is a colour,
and what makes a contribution count.**

Section 5 of `queen-mission-control.md` says plainly that nothing is proven
today. Everything below is built on that sentence, not against it.

Every number is either measured with the command given, derived with the
arithmetic shown, or marked **SYNTHETIC** in the same sentence.

---

## 0. The finding this study turned on

Between the third study (07:26Z) and this one (09:14Z) the swarm changed failure
mode, and the new one is an *economic* failure, not a capacity one:

```
$ curl -s https://trios-agent-server-production.up.railway.app/queen/status
{"scheduler":{"enabled":true,"intervalSeconds":300},
 "lastTick":{"decidedAt":"2026-09-03T09:13:19.709Z","allowed":false,
   "refusal":"the swarm has spent about $11 today, $1.37 past its $10 daily
              limit (raise it with TRIOS_SWARM_DAILY_CAP_USD)",
   "skippedCount":0},
 "dispatches":{"total":43,"finished":43,"running":0,...}}
```

Zero bees. Every 300-second round refused since roughly 07:00Z. The reason is
not keys and not boundaries: **the swarm has spent its day's money.**

So the economy this study is asked to design is not hypothetical. It already
exists, it is already enforced, it is already the binding constraint, and it is
already written in integer arithmetic in shipped Swift:

`trios/rings/SR-00/ModelPricing.swift`, 193 lines, read today:

- `ModelPrice` holds **micro-dollars per million tokens** as `Int`, with the
  comment: *"Integer minor units, because money is counted rather than
  measured… `spentToday` was a `reduce(0, +)` over `Double`."*
- `SwarmBudget.default = 10_000_000` micro-dollars — ten dollars a day.
- `SwarmBudget.verdict(spentToday:)` returns exactly **three** states:
  `.fine(remaining:)`, `.nearingLimit(remaining:)` when `remaining <=
  dailyLimitUSD / 5`, and `.exhausted(overBy:)`.
- `spentToday` is documented as **a floor, not a total**: a task whose model is
  not in the price table contributes nothing.

That three-state, integer, float-free verdict is the colour scale. I did not
invent it; I found it, and section 2 binds hue and lightness to it.

**Derived, exactly.** `ModelPricing.format` prints `%.0f` at or above \$10 and
`%.2f` below it. `"about $11"` therefore means a value in `[10.5, 11.5)`;
`"$1.37 past"` is `format(overBy)` below \$10, so `overBy = 1_370_000` µ\$
exactly. Therefore **spentToday = 10_000_000 + 1_370_000 = 11_370_000
micro-dollars**, and `format(11_370_000)` renders `"$11"`. The two strings are
consistent, so the number is recoverable to the cent from a public endpoint that
publishes neither.

---

## 1. TERRITORY — what a land is

### 1.1 The unit: a HOLDING

> **A land is a HOLDING: one (substrate, device class) pair that (a) has at
> least one seat, (b) can be named by something the supervisor already writes to
> a row, and (c) can go dark on its own.**

Not a contributor. Not a machine. Not a region. A *(substrate, class)* pair.

The reason is the third clause. One person's laptop is a CPU that runs bees and
a 14-core GPU that runs nothing, and today the first is lit and the second is
dark. A map whose unit is "the contributor" or "the machine" cannot draw that,
and drawing it is the entire point: `queen-mission-control.md` §3 says the map
must show two lit nodes and not sixteen glowing continents, and the same
discipline one level down says one machine can be two lands with different
colours.

### 1.2 Why not the four alternatives

Judged against §2 of `queen-mission-control.md` — what the supervisor can
actually measure — and against what I read in the schema today.

The complete list of identity keys the supervisor writes to a row
(`agent-server/apps/server/src/lib/db/pg-migrate.ts` plus the `ALTER TABLE`
block in `queen-tick.ts:250-267`):

| key | table.column | what it identifies |
|---|---|---|
| `key_index int` | `queen_dispatch.key_index` | **which provider credential carried a bee** |
| `holder text` | `queen_lease.holder` | which process is currently Queen |
| `owned_paths jsonb` | `queen_issues`, `queen_dispatch` | the boundary, not a machine |
| `provider`, `model` | `queen_dispatch` | the remote service, not the silicon |
| `strays jsonb` | `queen_dispatch.strays` | paths committed outside the boundary |

There is **no node id, no machine id, no contributor id, no host fingerprint and
no geographic field anywhere in the supervisor path.** I grepped for
`capabilit`, `swift-build`, `verilog-synthesis`, `bitstream-load` across
`agent-server/apps/server/src`: every hit is about agent-runtime capability gates
or the LLM prompt's tool catalogue. None is about a machine.

- **A land = a contributor.** Rejected. Too coarse to show a board going dark
  while its owner's laptop keeps working, and there is no contributor column to
  hang it on. It also invites a leaderboard, and a leaderboard on top of
  unverifiable claims is the failure §5 already refuses.
- **A land = a device class alone (three lands: CPU, FPGA, GPU).** Rejected as
  the *territory* unit — three tiles is a legend, not a map, and it cannot show
  one contributor's board detaching. Class survives as the **hue** axis
  (section 2), which is where it belongs.
- **A land = a geographic region.** Rejected, and this one is not a taste. There
  is no geographic data in the system. Railway's region is not in any response
  I can read; the container has no shell I can reach; a contributor's IP would
  have to be collected, and `publicBoardProjection` deliberately strips *paths,
  workers, holders, provider capacity and token counts* as operational state.
  Any geography on this map today is **SYNTHETIC**, and drawing continents is
  precisely the "sixteen glowing continents" defect.
- **A land = a provider credential.** Rejected because §4.2 already spent that
  mapping: a credential is a **satellite** — coverage, permission to work. A
  land is **substrate** — where the work physically runs. Today the two are
  confused, because all five entries in `WORKER_PROVIDERS`
  (`queen-dispatch.ts:46-64`: zai/glm-5.3, anthropic/claude-sonnet-4-5,
  openrouter/anthropic-claude-sonnet-4.5, moonshot/kimi-k2-0905-preview,
  openai/gpt-5) are remote APIs, so the key *is* the machine. The distinction
  becomes real the first time a local model runs.
- **A land = a ring.** Rejected: §6.3 already uses the rings as the unlock
  chain. A tech tree node is not a territory.

### 1.3 The opening board, measured today

Six holdings. Two lit. The map is drawn from exactly this table.

| # | holding | class | seats | substrate, measured | lit? | how I know, today |
|---|---|---|---|---|---|---|
| L1 | **CONTAINER** | CPU | 4 | Railway, `oven/bun:1.3.6`; CPU and RAM unknown | yes | `/queen/status` answers; `MAX_CONCURRENT_WORKERS = 4` in `rings/T27-00/queen_core.t27` |
| L2 | **RENTED** | CPU+GPU | 4 | somebody else's datacenter — every bee's model turn | yes | `WORKER_PROVIDERS`, all five remote; the whole \$11.37 was spent here |
| L3 | **MAC · CPU** | CPU | 4 | Apple M1 Pro, 8 cores (6 performance + 2 efficiency), 17,179,869,184 B | yes | `sysctl -n machdep.cpu.brand_string hw.ncpu hw.memsize hw.perflevel0.logicalcpu hw.perflevel1.logicalcpu` |
| L4 | **MAC · GPU** | GPU | 1 | Apple M1 Pro GPU, **14 cores, Metal 4** | **hardware present, zero routed work** | `system_profiler SPDisplaysDataType` |
| L5 | **WUKONG** | FPGA | 1 | QMTech Wukong V1, XC7A200T-FGG676, IDCODE `0x03636093`, ~133,800 LUT | dark | `t27/fpga/HARDWARE_SSOT.md`; **not attached now** |
| L6 | **P201 MINI** | FPGA | 1 | Topnax/Artemis+ P201 Mini, XC7Z020-2CLG400I | dark | `openxc7-src/experiments/bscan-readout/README.md`; **not attached now** |

Attachment checked today, by me:

```
$ ioreg -rc IOUSBHostDevice | grep -E '"USB Vendor Name"|"USB Product Name"'
  "USB Vendor Name" = "Apple Inc."
  "USB Product Name" = "iPhone"
```

Exactly one USB device is attached to this Mac: an iPhone. No Digilent FTDI
(`0x0403:0x6014`), no DSLogic (`0x2A0E:0x0035`). Both FPGA lands are dark, and
that is my own measurement made today rather than one inherited from a dated
document.

**Seats, and why they differ.** Seat count is a hardware fact, not a balance
knob:

- CPU land: **4 seats**, from `MAX_CONCURRENT_WORKERS = 4` in RING-00 — a
  shipped constant with a stated reason (*"the review of a fifth costs more
  attention than the fifth worker returns"*).
- FPGA land: **1 seat**. A 7-series part holds exactly one configuration at a
  time. Loading a second design evicts the first. This is not a rule somebody
  chose; it is what a bitstream is.
- GPU land: **1 seat**. One resident model per device; VRAM is the constraint.

Seats are the only quantity permitted to change a land's *area* on the map, and
only once the map passes roughly 40 lands. Below that every land is drawn the
same size, because a differing area would be a fourth quantity nobody measured.

### 1.4 The sentence the opening board says out loud

The largest type on the map, computed rather than written:

> **Two of six lands are lit, and the bright one is rented.**

L2 (RENTED) burned 100% of the day's \$11.37. L1 orchestrates and pays nothing.
L3, L4, L5 and L6 — every piece of hardware the community actually owns —
contributed zero measurable units today. That is the honest opening position of
a proof-of-compute game, and it is also the reason to play it.

### 1.5 How a new land joins

A contributor registers a **holding declaration**, which is the smallest object
that can be checked:

```jsonc
{
  "holding": "sha256(pubkey)[0:16]",   // the contributor's key, self-generated
  "class": "fpga",                     // cpu | fpga | gpu — exactly one
  "part":  "xc7z020clg400-2",          // measured, not typed: IDCODE for FPGA,
                                       // brand string for CPU, adapter name for GPU
  "seats": 1,
  "proof": { "kind": "bscan-nonce", "at": "2026-09-03T09:14:18Z", "digest": "…" }
}
```

A declaration with no accepted proof is drawn on the map **grey, with the reason
string on it** — which is exactly what §5 already prescribes for a node that
cannot replay. Section 2 makes grey a *computed* value rather than a state flag,
so nobody has to remember to set it.

**SYNTHETIC:** the holding table, the declaration route and the contributor
keypair do not exist. What would have to be built: one table
(`compute_holding(holding text primary key, class text, part text, seats int,
declared_at timestamptz, last_proof_at timestamptz, last_proof_digest text)`)
and one route beside the existing `/queen/*` mounts in
`agent-server/apps/server/src/api/server.ts`. Nothing else in this study needs
new infrastructure to *render*; it only needs it to *grow past six*.

---

## 2. COLOUR = RESOURCE

The user's requirement is that the colours *are* the community's resources. So
colour is not decoration and not status. It carries three measured quantities on
three orthogonal channels of one HSL value.

### 2.1 The law, in one function

```js
// h : hue = device class. Categorical. Three values, never interpolated.
//     CPU 210  |  FPGA 42  |  GPU 288
// b : burn = this land's ration spent today, as a fraction. null = no meter.
// a : age  = seconds since this land's last VERIFIED unit. null = never proved.
function landFill(h, b, a) {
  const S =
    a === null   ? 0                                   // never proved -> grey
  : a <= 300     ? 82                                  // within one round
  : a >= 86400   ? 0                                   // a day old -> grey
  : 82 - 62 * (a - 300) / (86400 - 300);               // linear decay

  const L =
    b === null   ? 26                                  // meter does not exist
  : b <= 0       ? 18                                  // meter exists, spent nothing
  : b <  0.8     ? 18 + 30 * (b / 0.8)                 // SwarmBudget .fine
  : b <  1.0     ? 48 + 10 * ((b - 0.8) / 0.2)         // .nearingLimit
  :                58;                                 // .exhausted — CLAMPED

  return `hsl(${h} ${Math.round(S)}% ${Math.round(L)}%)`;
}
```

Background is `#0A0C10`, L≈4%. Every land is legible against it, including a
land at L=18%.

### 2.2 HUE encodes the class, and is never a gradient

- **CPU 210°** (cold blue) — the class that runs the law and pays rent.
- **FPGA 42°** (amber) — the class that *is* the law, in gates.
- **GPU 288°** (violet) — the class that would end the rent.

Three values, no interpolation. There is no continuum between a LUT and a core,
and a hue that slid by "how GPU-ish a device is" would be inventing a quantity.
A land is exactly one class; a machine with two classes is two lands (L3 and L4
are the same aluminium).

### 2.3 LIGHTNESS encodes ration burn, and the bands are the shipped law

`b` is dimensionless — **spent ÷ ration** — which is what lets three classes
with incommensurable units share one axis. The three band boundaries are not
chosen here: `b < 0.8`, `0.8 ≤ b < 1.0`, `b ≥ 1.0` are exactly
`SwarmBudget.verdict`'s `.fine` / `.nearingLimit` / `.exhausted`, since
`remaining <= dailyLimitUSD / 5` is `b ≥ 0.8`.

**Polarity: brighter means more compute contributed today.** This is the
non-obvious half. The intuitive scale — colour the land by *resource remaining*
— makes a dead network look richest, because headroom rises the moment work
stops. Right now zero bees are running and no money has been spent since
07:32Z, so a headroom map would be at maximum brightness at the exact moment
the swarm is dead. Burn is the correct scalar: the map goes dark when the
community stops working, and it does so without anybody adding a rule.

**Numerator and denominator, per class:**

| class | spent (numerator) | ration (denominator) | measured? |
|---|---|---|---|
| CPU (rented model turns) | `Σ ModelPricing.estimatedCost` over today's tasks, µ\$ | `SwarmBudget.dailyLimitUSD`, default 10_000_000 µ\$ | **yes**, both shipped |
| CPU (local / free provider) | 0 by construction — `freeProviders = ["ollama","lmstudio","llamacpp"]` priced at zero | not money; seat-seconds | **SYNTHETIC** denominator |
| FPGA | bitstream loads today | loads/day the owner allows | **SYNTHETIC** — nothing counts either |
| GPU | model-turn seconds | seconds/day the owner allows | **SYNTHETIC** — nothing counts either |

So today exactly one land has a real meter (L2 RENTED, and by aggregation L1
which dispatches it), and the other four render at **L = 26% with a dotted
outline** — the "no meter" value. That distinction matters: a land that did
nothing (L=18%) and a land whose contribution is uncounted (L=26%, dotted) must
not look the same, or the map teaches the operator that unmeasured is zero. The
memory rule this repository already carries — *"Zero is not absent. Render a
dash, never a zero"* — is here a lightness value and a border style.

### 2.4 SATURATION encodes proof freshness, and grey is computed

Saturation is how much the network currently believes the land. Full at 82%
within one round (300 s, the measured tick interval), decaying linearly to 0 at
24 h, and 0 immediately for a land that has never proved anything.

Grey therefore *means* something exact: **this land's last verified unit is
older than a day, or there has never been one.** §5 of the prior study requires
that such a node be "drawn on the map, greyed, with the reason on it." Making
grey a function of `last_proof_at` rather than a boolean flag means no code path
can forget to set it, and a land cannot be un-greyed by an optimistic write.

Today, computed:

- L5 WUKONG: newest artifact for that part on this Mac is
  `fpga/verilog/ternary_mac_demo_top_200t.bit`, mtime **2026-08-06** — 28 days.
  **S = 0. Grey.**
- L6 P201 MINI: the BSCANE2 readout was demonstrated **2026-08-13** — 21 days.
  **S = 0. Grey.**
- L4 MAC · GPU: never proved. **S = 0. Grey.**
- L3 MAC · CPU: no verified unit has ever been recorded for it either, because
  no proof mechanism exists (§4). **S = 0. Grey.**
- L1, L2: last unit 2026-09-03T07:32:30Z ≈ 6,100 s ago →
  `S = 82 − 62·(6100−300)/86100 ≈ 78%`.

### 2.5 What saturating looks like

Three clamps, each with a reason:

1. **Lightness never exceeds 58%.** A land at `b = 5.0` looks identical to a
   land at `b = 1.0`. The extra brightness would be reporting resolution the law
   does not have — `.exhausted` is one state — and it would make the map's peak
   brightness a function of how badly the operator overshot.
2. **A land at `b ≥ 1.0` gains a 45° hatch at 12% alpha over the fill.** Bright
   and hatched is the one combination that means "this land carried the day and
   is now shut". Without the hatch, "brightest" and "spent out" are the same
   pixel value for opposite reasons.
3. **Nothing on the map is brighter than a spent-out land except two things,
   and both differ by *shape*, not brightness:** a bee in flight (a 3 px white
   dot travelling an edge) and the round tick (a 1 px ring pulse at the map
   centre, every 300 s). Work-in-progress and capacity-exhausted must be told
   apart by motion, because at a glance a person reads motion before value.

### 2.6 What the six lands look like right now

Computed by `landFill` from the values in 2.3 and 2.4, at 09:14:18Z:

| land | class | b | a | fill | reads as |
|---|---|---|---|---|---|
| L1 CONTAINER | CPU 210 | 1.137 | 6.1 ks | `hsl(210 78% 58%)` + hatch | bright blue, hatched — spent out |
| L2 RENTED | CPU 210 | 1.137 | 6.1 ks | `hsl(210 78% 58%)` + hatch | bright blue, hatched — spent out |
| L3 MAC · CPU | CPU 210 | 0 | never | `hsl(210 0% 18%)` | near-black grey — did nothing, unproven |
| L4 MAC · GPU | GPU 288 | null | never | `hsl(288 0% 26%)` dotted | grey, dotted — no meter exists |
| L5 WUKONG | FPGA 42 | null | 28 d | `hsl(42 0% 26%)` dotted | grey, dotted |
| L6 P201 MINI | FPGA 42 | null | 21 d | `hsl(42 0% 26%)` dotted | grey, dotted |

**There is no hue on the map right now.** Every land is either a saturated blue
that is hatched shut, or grey. The community's compute contributes no colour,
because it contributes no verified units. That is the picture the game must open
with, and it is not a mood — it is `landFill` applied to six measured rows.

---

## 3. THE THREE CLASSES

Each class gets one thing only it can do, one thing it is bad at, and one
concrete loss. Grounded, where possible, in this repository's own hardware work.

### 3.1 CPU — the only class that can judge

**Only it can:** run a language-model turn, run `git`, and — decisively — run
the *review*. `review_verdict` compares a bee's text criteria block against a
`git diff --name-only`; that is string and tree work, and there is no other
substrate here that touches text. Every path through the system terminates in a
CPU.

**Bad at:** fixed-function throughput, and it is the **only class that costs
money per unit of work**. All \$11.37 spent today was CPU-class rent. It is also
the class where the judge and the judged are the same kind of thing — open issue
**#1127**, *"judge and defendant are one model: the reviewer should be an
adversary."*

**Lose it and you lose:** everything. There is no work path that does not end at
a CPU. This is why the CPU land is not an interesting *choice* in the game — it
is the floor. The interesting choices are the other two.

### 3.2 FPGA — the only class that can be a second judge

This is where the repository's own work makes the class non-cosmetic.

**Only it can, (a) — execute the Queen's law as gates.**
`rings/T27-00/queen_core.t27` states its own targets: *"it can be generated to
Rust for the server and to Verilog for silicon, and both answer identically
because they are one source"*, and then constrains itself: *"No floating point
anywhere in this ring, by law: it is integers and booleans all the way down,
which is exactly why it can be synthesised without argument."* `review_verdict`,
`retry_verdict`, `merge_verdict`, `can_start_another` and `free_slots` are
integer functions over five integers. An FPGA land can hold `review_verdict` in
LUTs and answer the same five integers, **without running the model that
produced the work.** That is a second observer in a different substrate, which
is the exact thing §5 says the system does not have.

**Only it can, (b) — answer a challenge with no pin, no PS, no schematic and no
vendor toolchain.** `openxc7-src/experiments/bscan-readout/README.md`,
demonstrated **2026-08-13** on an XC7Z020-2CLG400I:

```
control (design without BSCANE2)   drscan -> 00000000  00000000
bscan.bit loaded                   drscan -> a5a51234  a5a51234  a5a51234
control reloaded                   drscan -> 00000000  00000000
bscan.bit reloaded                 drscan -> a5a51234  a5a51234
```

Nine reads, full A/B/A, switched in both directions. `0xA5A51234` cannot arrive
from an idle TAP or a BYPASS register. This is a working fabric→host channel and
it is the verification primitive in §4.3.

**Only it can, (c) — be bit-exact and cheap at ternary arithmetic.**
`t27/docs/SYNTH_REPORT.md`, yosys 0.65 `synth_xilinx` on the XC7A200T family:

| design | LUT | FF | CARRY4 |
|---|---:|---:|---:|
| combinational BitNet neuron | 319 | 0 | 2 |
| BitNet layer, 4 neurons, general weights | 1287 | 0 | 8 |
| BitNet layer, 4 neurons, **trained constant weights** | 288 | 0 | 0 |
| streaming ternary MAC | 346 | 32 | 10 |
| GF-T16 MAC (`gft_dot2`) | 501 | 0 | 123 |

Against ~133,800 LUTs on the part: one neuron is ~0.24%, a general 4-neuron
layer ~1%. And `gft_dot2` is described in that file as the spec-first
realisation of arithmetic *verified on real silicon* (AX7203, 3/3), bit-exact to
hand-written RTL over 2000 random inputs. Baking trained weights in drops a
layer from 1287 LUT to 288 — a 4.5× area win from constant folding, which is a
property of fabric, not of a core.

**Bad at:** changing what it does. A bitstream is a large, all-or-nothing
artifact — measured on disk:

| part | bitstream | bytes |
|---|---|---:|
| XC7Z020-CLG400 | `bscan.bit` | 4,045,663 |
| XC7A100T-FGG676 | `ternary_mac_demo_top.bit` | 3,825,907 |
| XC7A200T-FGG676 | `ternary_mac_demo_top_200t.bit` | 9,730,768 |

Size is a function of the part alone: three different designs for the XC7A200T
family in `t27/fpga/openxc7-synth/` are 3,825,920 / 3,825,921 / 3,825,921 bytes.
And producing one is a **CPU job** — yosys, nextpnr-xilinx, `fasm2frames.py`,
`xc7frames2bit`, all run on the Mac. **An FPGA land cannot change its own
program.** That is a real dependency edge to draw on the map: every FPGA land
has an inbound arrow from a CPU land, and if that CPU land is dark the FPGA land
is frozen at whatever it last held.

**Lose it and you lose the ability to finish the proof.** With no FPGA land,
every verdict in the network is computed by the same kind of thing that produced
the work. §5 gap 3 stays open permanently, and the "right to be counted" that §5
defines as the entire economy can never be earned by a second observer. The game
must say this in words on the panel, not imply it with a locked icon.

### 3.3 GPU — the only class that can end the rent

**Only it can:** hold a model and answer without a bill. This is not an
analogy — it is in the price table:

```swift
/// Models that run on the user's own machine cost nothing per token. Saying
/// "$0.00" for them is correct, not a missing measurement.
public static let freeProviders: Set<String> = ["ollama", "lmstudio", "llamacpp"]
```

`ModelPricing.price(forModel:provider:)` returns `ModelPrice(0, 0)` for any of
those three, unconditionally, before it consults the table. **A GPU land is the
only construct in the shipped code whose ration cannot deplete.**

And the gap is one list long. `WORKER_PROVIDERS` in `queen-dispatch.ts:46-64`
holds five entries — zai, anthropic, openrouter, moonshot, openai — and
**none of them is local.** I grepped `queen-dispatch.ts` and `queen-tick.ts` for
`ollama|lmstudio|llamacpp`: zero hits. So: *the price table can price a free
local model; the dispatcher cannot choose one.* That is the smallest real change
in this entire study, it is a six-line array edit, and it is the only lever that
changes the shape of the failure rather than its timing.

**Bad at:** branchy integer law. RING-00 forbids floating point by law, which
definitionally excludes the thing a GPU is good at. A GPU land can never take
over the judging; it can only take over the *producing*.

**Lose it and you keep paying rent forever.** Concretely: every bee today runs
on somebody else's GPU, metered per token. The \$11.37 is rent on GPUs the
community does not own. With no GPU land, `b` for the CPU class rises every day
until it hits 1.0 and the map hatches shut — which is what happened at 07:00Z
today. The loss is not abstract; it is the current state.

**And the hardware is already here.** L4 is an Apple M1 Pro GPU, 14 cores, Metal
4, measured today. It is lit silicon inside the machine that owns the
repository, and zero work routes to it.

### 3.4 The class asymmetry, as one table

| | CPU | FPGA | GPU |
|---|---|---|---|
| seats | 4 | 1 | 1 |
| can judge | **yes** | **yes** (RING-00 → Verilog) | no (float forbidden in the ring) |
| can produce | yes (model turn) | no | **yes** (local model) |
| costs money per unit | **yes** | no | no, if local |
| can change its own program | yes | **no** — needs a CPU land | yes |
| verification primitive today | tree hash replay (not built) | **BSCANE2 nonce (proven)** | none (SYNTHETIC) |
| lands today | 3 | 2 | 1 |
| lit today | 2 | 0 | 0 |

---

## 4. PROOF OF COMPUTE

§5 already gives the four-step spine: record `commit_sha` and `tree_sha`, export
a patch bundle addressed by the hash, have the Mac recompute the hash, have the
Mac re-answer the criteria blind. This section does not replace that. It says
what a **contributor** submits, what the **network** checks, what is **trusted**,
and it names the attack.

### 4.1 The unit

> **One PROOF UNIT = one artifact, produced by a named holding, whose digest a
> second party in a different trust domain recomputed and agreed with.**

Not a token. Not a stake. Not a cycle. §5 is explicit and correct: *"A proof,
once that exists, is worth exactly one thing: the right to be counted"* and *"A
currency backed by a self-attestation is not a currency."* A proof unit is
non-transferable and has no price. It buys exactly one thing: your land's colour
stops being grey.

### 4.2 What a contributor submits — the CLAIM

```jsonc
{
  "holding":   "a1b2c3d4e5f60718",
  "class":     "cpu",
  "unit":      "tree",                   // tree | bscan | turn
  "subject":   1335,                     // the issue this unit is about
  "digest":    "sha1:<tree_sha>",        // what is being claimed
  "toolchain": "git 2.43.0",             // what produced it
  "window":    ["2026-09-03T07:28:11Z", "2026-09-03T07:32:30Z"],
  "sig":       "<ed25519 over the canonical encoding of the above>"
}
```

Five fields exist in some form today (`issue`, `branch`, `provider`, `model`,
`dispatched_at`/`finished_at`). **`digest` does not.** I re-ran the grep that
§5 reports and confirm it today: `grep -rn "commit_sha\|commitSha\|tree_sha"`
over `agent-server/apps/server/src` returns **nothing**. The schema stores
`branch text`, and a branch name is not a content hash.

### 4.3 What the network checks — three loops, one per class

**CPU · tree replay.** Deterministic and complete.

1. Bee finishes. Container writes `commit_sha` and `tree_sha` from
   `git rev-parse queen-<issue>` and `git rev-parse queen-<issue>^{tree}`.
2. Container exports `git bundle` for `origin/dev..queen-<issue>`, named by the
   tree sha.
3. A **different holding** — the Mac, a different trust domain, a different
   architecture — fetches the bundle, applies it to its own `origin/dev`, and
   recomputes `rev-parse ^{tree}`.
4. Agreement or disagreement is stored. Disagreement is the interesting signal
   and is invisible today.
5. The verifier re-answers the acceptance criteria **without seeing the bee's
   VERDICT block**, and feeds its own five integers to the *same*
   `review_verdict`. Two answers stored side by side.

What this proves: this exact content existed, and two independent machines agree
on its hash. That is the strongest claim this architecture can make without new
cryptography, and §5 says so already.

**FPGA · nonce readout.** Proven mechanism, not a proposal.

1. Verifier sends a fresh 32-bit nonce `N`.
2. Contributor must have loaded a design containing a BSCANE2 USER1 primitive
   whose shift register presents `f(N)` for an agreed `f` (a ternary MAC over
   `N` is the natural choice, since `gft_dot2` is bit-exact to silicon and
   already synthesised).
3. Verifier does `irscan` USER1, `drscan`, and compares.
4. The **A/B/A control is mandatory**: a design without BSCANE2 must return
   `00000000` before and after. Without both controls, a sticky readout cannot
   distinguish "never captured" from "captured zero."

What this proves: a device answering to that IDCODE has a design loaded that
computes `f`, right now, and the nonce makes replay impossible. It does **not**
prove how much work the fabric did — only that it can answer.

**GPU · nothing.** **SYNTHETIC.** There is no verifiable GPU work primitive in
this repository or in this design. A local model's output is not reproducible
across drivers, and sampling is stochastic. What would have to be built: a
greedy-decode (temperature 0, fixed seed) determinism harness that pins a
(model digest, tokenizer digest, prompt digest) → (output digest) table, plus a
measurement of whether that table actually holds across two machines. I did not
run that experiment and will not assume its result. Until it exists, a GPU land
is a *declared* land: it renders at L=26% dotted forever and contributes zero
proof units.

### 4.4 What cannot be checked, and is therefore trusted

Stated plainly, because an economy that hides this is the "instrument that lies"
failure at the level of its unit.

1. **Wall time and energy.** No clock in the network is authoritative and no
   power measurement exists anywhere. `window` in the claim is the contributor's
   word.
2. **Device identity.** JTAG IDCODE identifies a **part type, not a die**.
   `0x03636093` is every XC7A200T on Earth. Two boards in this very repository
   are described under different names — `HARDWARE_SSOT.md` says "QMTech Wukong
   V1", `SYNTH_REPORT.md` says "AX7203" — for the same part number, and no
   readout can tell them apart. There is no per-device secret and no eFUSE key
   in use.
3. **That the same physical device answered twice.** Follows from 2.
4. **That the contributor owns the hardware** rather than renting it.
5. **Whether the work was *worth* doing.** The only independent measurement in
   the loop is `git diff --name-only`, which counts files and cannot tell whether
   they are any good. §5 already says this; nothing here changes it.
6. **The bill itself.** `spentToday` is documented as a floor, and the price
   table is *list rates that will drift*. The number the whole map is coloured
   by is an estimate of somebody else's invoice.

### 4.5 The attack: claiming compute you did not do

Four forms. The design's honest score is **2 stopped, 1 noticed, 1 invisible.**

| # | attack | what it looks like | verdict |
|---|---|---|---|
| A1 | **Replay** — resubmit a digest that was already accepted | same `(subject, digest)` twice | **STOPPED.** A unit is keyed on `(subject, digest)`; the second is a duplicate, not a second unit. For FPGA the nonce makes it structurally impossible. |
| A2 | **Empty claim** — claim every criterion met with nothing committed | all `met`, `committed_files = 0` | **STOPPED, by shipped code.** `review_verdict` returns `REVIEW_ESCALATE` when `unmet <= 0 && committed_files <= 0`, with the comment *"every criterion met against an empty diff is not a pass, it is a reviewer that had nothing in front of it and answered anyway."* And `queen_dispatch.strays` records committed paths outside the boundary. |
| A3 | **Sybil** — one machine declares six holdings | six lands, one substrate | **NOTICED, NOT STOPPED.** The only tell is that six holdings' proof timestamps interleave more tightly than one device could sustain. That is a heuristic, not a proof, and this repository has documented what happens when a threshold is trusted without calibration. Draw the suspicion; do not act on it automatically. |
| A4 | **Outsourcing** — run the work on a rented cloud box, claim it from your holding | indistinguishable from honest work | **INVISIBLE.** There is no device binding of any kind. The claim's signature binds a *key*, and a key travels. Nothing in this design sees A4, and no amount of hash checking will. |

**Therefore:** this is a proof of *content*, not a proof of *work*, and not a
proof of *hardware*. It is sufficient for a cooperative network of named people
and insufficient for an adversarial one. Which means the design's own conclusion
is a prohibition:

> **Do not attach a transferable token to a proof unit.** A4 is a mint. The
> moment a unit is worth money, the cheapest way to make units is to rent the
> compute the network exists to replace, and the map goes bright green while
> the community owns nothing.

This is the same sentence §5 already wrote about self-attestation, arrived at
from the attack side rather than the architecture side. `.tri-cluster.json` in
the `trinity` checkout is what ignoring it looks like — see §6.5.

---

## 5. THE LOOP — one full cycle, with today's numbers

Contributed compute becomes a score; the score becomes one decision. Here is one
300-second round, with the values live at **2026-09-03T09:13:19.709Z**.

### 5.1 The two scores

Both computable from columns that exist today. Neither is invented.

**Score 1 — RATION BURN `b`.** `spentToday ÷ dailyLimitUSD`.
Today: `11_370_000 ÷ 10_000_000 = ` **1.137**. Band: `.exhausted(overBy: 1_370_000)`.

**Score 2 — SOVEREIGNTY `σ`.** The fraction of today's units that ran on land
the community owns:

```sql
σ = (SELECT count(*) FROM queen_dispatch
      WHERE started AND dispatched_at > now() - interval '24 hours'
        AND provider IN ('ollama','lmstudio','llamacpp'))
  / NULLIF((SELECT count(*) FROM queen_dispatch
      WHERE started AND dispatched_at > now() - interval '24 hours'), 0)
```

The provider list is not a new constant — it is `ModelPricing.freeProviders`,
shipped. `queen_dispatch.provider` exists. The denominator is exactly the
existing `pulse.bees` query.

Today: `pulse.bees = 15`, and none of the five entries in `WORKER_PROVIDERS` is
local, so the numerator is structurally 0. **σ = 0.00.**

σ is the number the game is *about*. `b` says whether you can act today; σ says
whether you are winning.

### 5.2 The cycle

**t = 0 s — the round fires.** `queend` reaches the budget gate before the issue
loop. `allowed: false`, `skippedCount: 0`.

That zero is a load-bearing signal and I measured both sides of it today:

| time | refusal about | `skippedCount` |
|---|---|---|
| 07:07:30Z | provider keys | **42** |
| 09:08:19Z, 09:13:19Z | the daily cap | **0** |

Both states look identical on the board — nothing is running — and they need
opposite actions. The **only** public discriminator is whether `skippedCount` is
zero, because the budget gate short-circuits before any issue is considered and
therefore produces no per-issue `whyNotChosen` reasons. Put that discriminator
in the code, not in the operator's head:

```js
const cause =
  tick.allowed                 ? 'running'
: tick.skippedCount === 0      ? 'ration'      // budget gate, before the loop
: /key/i.test(tick.refusal||'')? 'coverage'    // satellites
:                                'boundary';   // per-issue reasons exist
```

**t = 0 s — the map redraws.** `landFill` over the six rows of §1.3 gives §2.6:
L1 and L2 bright blue and hatched; L3 near-black; L4, L5, L6 grey and dotted. No
hue anywhere. One sentence at the top, in the largest type:

> **Nothing is running. The day's ration is spent — \$11.37 against \$10 — and
> every land that could work for free is grey.**

**t = 0–180 s — the one decision.** Three levers. The board prices each in the
same two units, `Δb` and `Δσ`, and refuses to price what it cannot.

| lever | Δ ration | Δ sovereignty | what it actually buys |
|---|---|---|---|
| **1. Raise the cap to \$20** | `b: 1.137 → 0.569` | **0** | ~\$8.63 of rent |
| **2. Attach the P201 Mini** | **0** | **0** | the second judge |
| **3. Route one bee to `ollama` on L4** | that bee's cost → 0 | `σ: 0 → 1/n` | the shape of the failure |

Lever 1, in numbers. `\$10 → \$20` makes `remaining = 20_000_000 − 11_370_000 =
8_630_000`, and `dailyLimitUSD/5 = 4_000_000`, so `remaining > limit/5` and the
verdict jumps straight to `.fine`. **The band skips `.nearingLimit` entirely,
because the band is a function of the cap and not only of the spend.** The land
goes from L=58%+hatch to L=39% in one operator action, and the map must not
animate that as if the network recovered — the operator moved the goalposts.
Draw the transition as a step with the old ceiling left as a ghost line.

What \$8.63 of headroom buys, per model, from the shipped table
(µ\$ per million, input / output):

| model | in | out | cost of a 30k-in / 6k-out turn | turns per \$8.63 |
|---|---:|---:|---:|---:|
| `glm-5.3` → `glm-5` | 600,000 | 2,200,000 | 31,200 µ\$ = \$0.031 | ~276 |
| `claude-sonnet-4-5` | 3,000,000 | 15,000,000 | 180,000 µ\$ = \$0.18 | ~47 |
| `gpt-5` | 1,250,000 | 10,000,000 | 97,500 µ\$ = \$0.098 | ~88 |
| `kimi-k2-0905-preview` | — | — | **unpriced → 0** | **unbounded** |

*The 30k/6k turn shape is **SYNTHETIC**.* Real token counts live in
`queen_dispatch.input_tokens`/`output_tokens`, which the public projection
strips. The prices, the arithmetic and the `kimi` result are measured — see §6.2
for why that last row is a defect and not a bargain.

I cannot divide \$11.37 by a bee count to get a real per-turn price, and the
board must not either: `pulse.bees` counts `queen_dispatch` rows, and that table
is `issue int PRIMARY KEY`, so 15 means *fifteen issues started*, not fifteen
turns. The true divisor is a count over `queen_dispatch_history`, behind the
bearer token. **Label the tile "issues started", never "bees".**

Lever 2 pays **zero** ration relief, and the board must print the zero. Attaching
a board today lights an amber land and moves no work, because no work routes
there. What it does buy is in §3.2: the Verilog target of RING-00, i.e. the
second observer that unblocks §4.3. The panel says that in words.

Lever 3 is the only one that changes σ. It is a six-line edit to
`WORKER_PROVIDERS`, and it turns one metered land into an unmetered one whose
`b` cannot rise.

**t = 180–300 s — the act.** Zero or one action. The player never has to click
for progress; §8 of the prior study is right and this economy does not change it.

**t = 300 s — the report.** Suppose lever 1.

- `decidedAt` moves. `allowed: true`. `skippedCount` returns to non-zero — the
  per-issue reasons come back, which is itself the signal that the cause
  changed from `ration` to `boundary`.
- L1/L2 step from `hsl(210 78% 58%)`+hatch to `hsl(210 82% 39%)`, hatch removed,
  saturation up because a unit just landed.
- One bee starts; a white dot travels the L1→L2 edge.
- σ stays **0.00**. The scoreboard says so, next to the new ration, and that
  adjacency is the whole design: **the number that went green cost money, and
  the number that matters did not move.**

### 5.3 Where the score comes from, per channel

| map channel | field | endpoint today | change needed |
|---|---|---|---|
| hue | class | the six-row static table | none to render six lands |
| lightness | `b` | **computed server-side, stripped from `/queen/public-board`** | forward a derived band, see §7.2 |
| saturation | `a` | does not exist | `last_proof_at` on the holding table |
| bee dot | `dispatches.running` | `/queen/status` | none |
| round tick | `lastTick.decidedAt`, `roundSeconds` | `/queen/status` | none |
| cause line | `refusal` + `skippedCount` | `/queen/status` | none |
| σ | `queen_dispatch.provider` ∈ `freeProviders` | not exposed | one scalar, see §7.2 |

---

## 6. FAILURE — what losing looks like

§9 of `queen-mission-control.md` gives six failure states (starvation, blackout,
verdict deadlock, escalation pile, amnesia, lying instrument). These five are the
*economic* ones. **E1 is happening right now.** E2, E3 and E4 are latent and
each has a filed issue or a measurable cause. E5 is a trap already sitting in the
tree.

### 6.1 E1 — RATION EXHAUSTION (live, 2026-09-03T07:00Z →)

**Lose condition:** `SwarmBudget.verdict` returns `.exhausted` and no lever is
pulled before the day rolls.

**The map the moment before:** this is the only failure whose "moment before" is
*bright*. The sequence, drawn:

```
b = 0.72   L1/L2 mid-blue, hsl(210 82% 45%)     bees flying, edges busy
b = 0.85   L1/L2 brighten past the .fine break, hsl(210 82% 51%)
           -> the ONLY warning: a 1px ceiling line appears above the fill
b = 0.99   hsl(210 82% 58%)  brightest the map can go
b = 1.14   same fill, 45-degree hatch drops over it, bee dots vanish
           within one round; every other land unchanged and grey
```

**The tell, and why it is easy to miss:** the map gets *brighter* right up to
the failure, and the failure itself changes texture, not colour. A person
watching for a red light never sees one. This is why the `.nearingLimit` band
gets a ceiling line rather than a colour shift — it is the only pre-failure
signal, and it must be a *new mark*, not a *different shade*, because the eye
does not integrate lightness reliably at 58%.

**What losing costs:** `Calendar.current` in `spentToday` resolves in the
container's timezone. A cap that bites at 07:00Z locks the swarm out for the rest
of that calendar day — roughly **15 hours, or ~180 refused rounds** — with no
recovery except an operator raising the cap. The map is static and hatched for
that whole time and *every field on it is correct*.

### 6.2 E2 — THE FREE BEE (the unpriced-model hole)

`ModelPricing.table` has eight keys: `glm-5`, `glm-4`, `claude-opus`,
`claude-sonnet`, `claude-haiku`, `gpt-5`, `gpt-4`, `deepseek`. Matching is
longest prefix or substring. `WORKER_PROVIDERS` dispatches Moonshot as
**`kimi-k2-0905-preview`**, which contains none of the eight. So
`price(forModel:provider:)` returns `nil`, `estimatedCost` returns `nil`, and
`spentToday`'s `compactMap(\.estimatedCostUSD)` **silently drops the task**.

`estimatedCost` is right to return `nil` — its own comment says *"an unknown
price must stay unknown: inventing an average is how a cheap run gets reported as
expensive and a human cancels work that was fine."* The defect is one level up:
`compactMap` converts "unknown" into "zero" at the moment of summing, which is
the exact rule this repository already wrote down as *"Zero is not absent."*

**Losing looks like:** a Moonshot land sits at `b = 0`, `L = 18%` — near-black,
"did nothing" — while being the only land doing anything. The map lies in the
*quiet* direction, and quiet lies do not prompt a look. Meanwhile `b` for the
whole swarm reads low, the cap never bites, and the real bill arrives from
Moonshot at the end of the month.

**Fix, and it is a rendering fix as much as a code one:** a task with a `nil`
price must render its land at **L = 26% with the dotted outline** — the "no
meter" value — and the ration tile must print `\$11.37 + n unpriced`, never a
bare total. Never a zero.

### 6.3 E3 — THE DOUBLE-CHARGED DAY (issue #1335, filed 08:19Z today)

Filed by the swarm about itself, three hours before I read it. `spentToday`
filters on `task.updatedAt`, and `queen-tick.ts:1133` fills that field as
`at: finished ? row.finished_at : row.dispatched_at`. The issue states the
consequence exactly: *"a bee dispatched at 23:50 and finished at 00:10 charges
its entire cost to a day on which it did almost nothing, and the following day
starts already spent."*

There is a second half the issue does not name and I will. `queen_dispatch` is
`issue int PRIMARY KEY`, and the migration comment records that a re-dispatch
overwrites `finished_at` in place — *"#1244 was dispatched six times and one row
survived it."* So a re-touched old row **re-dates its entire cost to today**.
The same field carrying two clocks is issue #1335; the same row carrying two
attempts is how one expensive turn can be charged twice.

**Losing looks like:** the map is hatched shut at 00:10 with zero bees having
run today. `b = 1.0+` and `bees = 0` simultaneously — a combination that is
*impossible* under an honest meter, and therefore the perfect assertion to put
on the board: **if `b ≥ 1` and today's started count is 0, print "this ration was
charged to the wrong day" rather than "spent out."**

### 6.4 E4 — THE PHANTOM BILL

Issue #1335 again, second half, and it matches a standing note in my memory:
`TRIOS_SWARM_BILLING_MODE=coding_plan` is set on the Railway service, and
`grep -rI BILLING_MODE` finds it in no `.ts` and no `.swift` in the tree.
**Nothing reads it.**

If a Coding Plan is flat-rate, then `spentToday` is a per-token estimate of money
nobody was charged, and the entire lightness channel of this map is measuring a
bill that does not exist. The swarm is then stopping itself against a phantom —
which is exactly what it has been doing since 07:00Z.

**Losing looks like:** a map that is correct in every pixel and wrong in its
premise. This is §10's "the instrument lies" raised to the level of the
economy's *unit*, and it is the one failure no amount of careful rendering can
catch. The only defence is a label: the ration tile must read
**"estimated at list rates"** and, when `TRIOS_SWARM_BILLING_MODE` is set to
anything, must say **"a flat-rate plan is configured and this estimate does not
know about it."**

### 6.5 E5 — THE FIXTURE ECONOMY (the trap already in the tree)

`/Users/playra/trinity/.tri-cluster.json`, committed, 10 nodes:

```jsonc
{ "id": "node-0", "address": "127.0.0.1", "port": 9334, "role": "worker",
  "status": "online", "uptime_seconds": 3600, "operations_count": 100,
  "earned_tri": 0.100000, "pending_tri": 0.010000, "tier": "FREE", ... }
```

All ten at `127.0.0.1:9334`. All ten `uptime_seconds: 3600`. All ten
`operations_count: 100`. All ten `earned_tri: 0.100000`. Tiers cycling
FREE / STAKER / POWER / WHALE. `crdt: { entries_merged: 0, conflicts_resolved: 0,
last_sync: 0 }`.

I grepped the whole `trinity` checkout for `tri-cluster`, `earned_tri` and
`pending_tri`: **the only hits are inside the file itself.** No code reads it.

This is a complete token economy — nodes, a currency, staking tiers — sitting in
the repository, and every number in it is a constant. It is the most convenient
data source anybody building this map will find, and wiring it up produces ten
glowing lands and a currency ledger in an afternoon.

**Losing looks like:** the map shows ten contributed nodes and a token balance,
the operator optimises against it, and the network has six lands of which two
are lit. This repository has already paid for this exact defect twice — the
board reporting four bees when one key could pay, and the "rounds/24h" gauge that
can only ever read 0 or 1. Name the file in the implementation notes and forbid
it.

### 6.6 The five, as lose conditions

| | condition | live? |
|---|---|---|
| E1 | `verdict == .exhausted` for a whole calendar day | **yes, since 07:00Z** |
| E2 | any dispatched model is absent from `ModelPricing.table` | **yes — `kimi-k2-0905-preview`** |
| E3 | `b ≥ 1` while today's started count is 0 | latent (issue #1335) |
| E4 | `TRIOS_SWARM_BILLING_MODE` set and read by nothing | **yes** |
| E5 | any map field sourced from a file no code writes | trap present |

And the one that is not a lose condition but is the actual game:

| | condition | live |
|---|---|---|
| **σ** | sovereignty stays 0.00 for N days | **0.00** |

You do not lose to any single one of these. You lose the way §9 already
describes: several meters drift while you are reading a different one. The
difference this study adds is that **two of the meters are currently
mis-calibrated in the quiet direction** (E2, E4), and the quiet direction is the
one nobody checks.

---

## 7. IMPLEMENTATION

### 7.1 Where it lives

Per the third study's tab set, all of this is **tab 1, SITUATION** — the only
tab that renders from public endpoints and therefore is not blank before a token
is pasted. The map is canvas2D per the first study. Six lands, six labels, up to
four bee dots: far under the 150-node scene that measured 0.4 ms per frame and
zero frames over 16.7 ms.

The deployment target: I fetched `https://t27.ai/` today and followed the lazy
chunk. `/queen` resolves to `assets/Queen-CXq47Md-.js`, 63,787 bytes, and it
**already contains** `trios-agent-server`, `/queen/status` and `public-board`. It
contains no `getContext`, no `dvh`, no tab strip. So the live page already reads
the right brain and has none of the game. That is the starting point, and it is
better than either local checkout: `trinity`'s `Queen.tsx` still probes
`/health` and `/api/containers` on a Zig agent nothing runs, while `tri-27`'s is
the version that was deployed.

`/queen/public-board` answers `access-control-allow-origin: https://t27.ai` with
`cache-control: no-store` — checked today — so the browser can read it directly.

### 7.2 The one server change worth making first

`pulse` is computed with five numbers, and I read the query in
`queen-kanban.ts:417-431`. It already sums `input_tokens` and `output_tokens`
over 24 hours. `publicBoardProjection` (same file, lines 105-125) forwards only
`rounds, bees, verdicts, lastRoundAt, roundSeconds` — token counts are stripped
by design, with the stated reason that *"paths, workers, holders, provider
capacity, token counts and the Queen's internal refusal text are operational
state."*

That reason is right, and the fix respects it. Do **not** publish token counts.
Publish the derived, non-operational scalars the colour law actually needs:

```ts
pulse: {
  rounds, bees, verdicts, lastRoundAt, roundSeconds,
  // NEW. Neither leaks capacity: a band is one of three words, and
  // sovereignty is a ratio over a provider list that is already public
  // in ModelPricing.freeProviders.
  rationBand: 'fine' | 'nearingLimit' | 'exhausted',
  rationBurn: number,     // b, rounded to 3 dp
  sovereignty: number,    // sigma, 0..1
}
```

Three fields. They are the entire lightness channel and the entire scoreboard.
Everything else in this study renders from what `/queen/status` and
`/queen/public-board` already return.

### 7.3 Order

1. **Publish the three scalars** (§7.2). Unlocks lightness and σ. One file.
2. **The cause discriminator** (§5.2). Four lines, and it separates two failures
   that look identical and need opposite actions. Costs no new data.
3. **The six-land table and `landFill`** (§1.3, §2.1). Static table, pure
   function, canvas2D. No new data.
4. **Add a local provider to `WORKER_PROVIDERS`** (§3.3). Six lines. The only
   change that can move σ off zero.
5. **`commit_sha` / `tree_sha`** — §5 step 1 of the prior study, unchanged and
   still the cheapest real step toward a proof.
6. **The holding table and `last_proof_at`** (§1.5). Unlocks saturation, and
   until it exists every land's saturation is legitimately 0 and the map is
   legitimately grey.

Steps 1–4 are presentation and a list edit over data that exists. Steps 5–6 are
the only ones that change what the system knows about itself.

### 7.4 Rules inherited, restated only as constraints on this design

- `overflow-wrap: anywhere` on the refusal string — it is 176 characters today
  and it is the most important sentence on the map.
- The board renders "issues started", never "bees" (§5.2).
- A `nil` price renders dotted at L=26%, never zero (§6.2).
- No map field may be sourced from `.tri-cluster.json` (§6.5).
- The ration tile is labelled "estimated at list rates" (§6.4).

---

## 8. MEASURED / SYNTHETIC REGISTER

**Measured today, with the command or file given:**

- `/queen/status` at 09:08:19Z and 09:13:19Z: `allowed: false`, the budget
  refusal string verbatim, `skippedCount: 0`, `dispatches` 43/43/0, latest
  dispatch issue 1329 at 07:32:30.137Z with the 4-key/1-live/3-refused outcome.
- `/queen/status` at 07:07Z per the prior study: `skippedCount: 42` with a
  key refusal — the contrast in §5.2 is between two of my own reads.
- `/queen/public-board`: 11,715 bytes, 83 cards (done 44, backlog 18, review 13,
  dropped 8, running 0); `pulse {rounds:1, bees:15, verdicts:16,
  roundSeconds:300}`; card keys `number/title/column/criteria/needs`; 23 cards
  carry `needs`, 39 carry a criteria count, 44 do not.
- `needs` values are spec-completeness lists (`boundary`, `scenarios`,
  `requirements`, `success criteria`) — **not** hardware capability.
- CORS on `/queen/public-board`: `access-control-allow-origin: https://t27.ai`,
  `cache-control: no-store`. `/queen/board` → 403. `/queen/hq`, `/queen/tree`,
  `/health` → 200.
- GitHub API, `gHashTag/trios`, open non-PR issues: **39**; ages min 0 / median
  14 / max 125 days; 8 over 30 days; 21 over 7 days.
- Issue #1335 body, in full, including the `TRIOS_SWARM_BILLING_MODE` paragraph.
- `rings/SR-00/ModelPricing.swift`, 193 lines: the eight-key table with its
  µ\$ rates, `freeProviders`, `format`, `SwarmBudget.default = 10_000_000`,
  `verdict`'s three states and the `remaining <= dailyLimitUSD / 5` boundary,
  and the "floor, not a total" comment on `spentToday`.
- `queen-dispatch.ts:46-64`: five `WORKER_PROVIDERS`, none local; zero hits for
  `ollama|lmstudio|llamacpp` in that file or `queen-tick.ts`.
- `rings/T27-00/queen_core.t27`: `MAX_CONCURRENT_WORKERS 4`,
  `MAX_REAL_ATTEMPTS 2`, `MAX_SEND_BACKS 2`, the full `review_verdict` body
  including the `committed_files <= 0` escalate arm, and the no-float law.
- Schema: `queen_dispatch` keyed `issue int PRIMARY KEY` with `key_index`,
  `input_tokens`, `output_tokens`, `send_backs`, `strays`, `review_state`;
  `queen_lease.holder`; `queen_tick name text PRIMARY KEY`. **No `commit_sha`,
  `commitSha` or `tree_sha` anywhere in `agent-server/apps/server/src`.**
- `queen-kanban.ts:417-431` computes `input_tokens`/`output_tokens`;
  `publicBoardProjection` at 105-125 strips them. `bees` counts
  `queen_dispatch` rows, not turns.
- This Mac: Apple M1 Pro, 8 cores (6 P + 2 E), 17,179,869,184 B RAM;
  **GPU 14 cores, Metal 4**.
- USB, today: one device, an iPhone. No Digilent, no FTDI, no DSLogic.
- `t27/docs/SYNTH_REPORT.md` LUT/FF/CARRY4 table and the ~133,800 LUT headroom.
- `t27/fpga/HARDWARE_SSOT.md`: Wukong V1, XC7A200T-FGG676, IDCODE `0x03636093`.
- `openxc7-src/experiments/bscan-readout/README.md`: the nine-read A/B/A on
  XC7Z020-2CLG400I, dated 2026-08-13, with toolchain revisions.
- Bitstream sizes on disk: 4,045,663 / 3,825,907 / 9,730,768 bytes.
- `trinity/.tri-cluster.json`: ten identical nodes; grep finds no reader.
- `https://t27.ai/assets/Queen-CXq47Md-.js`, 63,787 bytes, contains
  `trios-agent-server`, `/queen/status`, `public-board`; contains no
  `getContext`, no `dvh`.

**Derived, with the arithmetic shown:**

- `spentToday = 11_370_000` µ\$, from the two `format()` outputs in the live
  refusal string.
- `b = 1.137`; raising the cap to \$20 yields `remaining = 8_630_000 >
  4_000_000`, so the band jumps `.exhausted → .fine`, skipping `.nearingLimit`.
- `kimi-k2-0905-preview` matches no key in `ModelPricing.table` under either
  `hasPrefix` or `contains`, therefore `estimatedCost` is `nil`, therefore
  `compactMap` drops it from `spentToday`.
- σ = 0.00, because the numerator's provider set and `WORKER_PROVIDERS` are
  disjoint.
- Saturation values in §2.4 from the stated ages.

**SYNTHETIC — does not exist, and what would have to be built:**

| quantity | what would have to be built |
|---|---|
| a contributor / holding identity | `compute_holding` table + one route + a contributor keypair |
| geographic position of any node | nothing collects it; and `publicBoardProjection` strips exactly this kind of field on purpose |
| an FPGA land's ration (loads/day) | a load counter beside `openFPGALoader`, written to the holding row |
| a GPU land's ration (seconds/day) | same, beside the local inference server |
| GPU work verification | a temperature-0 fixed-seed determinism harness across two machines, and the experiment to find out whether it actually holds |
| a per-turn token cost | `queen_dispatch_history` behind the bearer token; the 30k/6k turn shape in §5.2 is my assumption, not a reading |
| the container's CPU, RAM and cost | no shell; `railway` not permitted |
| a capability field on any card | `needs` is spec-completeness; the capability matrix of §4.5 has no data source at all |
| calibration of anything here | no threshold in this design has been tested against an outcome, including the 24 h saturation decay and the L=26% "no meter" value |

**Not verified, and stated as such:**

- Whether either FPGA board answers over JTAG when attached. Nothing is
  attached; I did not go looking for the boards.
- Whether the Coding Plan is in fact flat-rate. I read that
  `TRIOS_SWARM_BILLING_MODE` is unread by any code; I did not read a contract.
- Whether the tree-hash replay of §4.3 actually agrees across arm64 and the
  container. `git` tree hashing is content-addressed and should, but I ran no
  replay.
- Any frame timing for this map. The first study's canvas2D numbers are for a
  150-node scene; six lands is far smaller, but I measured nothing.
