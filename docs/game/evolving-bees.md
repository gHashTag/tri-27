# The Bee

A design for the actors in the t27.ai Queen mission-control game, written against
what the supervisor measures on 2026-09-03 between 09:28Z and 09:45Z. Every
quantity below is either measured with the command given, or marked **SYNTHETIC**
with the named server change that would make it real.

Files, absolute:

- `/Users/playra/tri-27/docs/game/queen-mission-control.md` (§4.3, §5, §6 read)
- `/Users/playra/tri-27/docs/game/engine-benchmark.md` (§0, §9, §11 read)
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/components/queenWorkerHangarModel.ts`
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/components/QueenFactory.tsx`
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/components/queenHardwareRegistry.ts`
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/qa/queen-game-cabinet-contract.mjs`
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/pages/Queen.tsx`
- `/Users/playra/Documents/Codex/2026-09-01/new-chat-2/work/trinity-queen-factory-game/apps/website/src/index.css`
- `/Users/playra/BrowserOS/trios/agent-server/apps/server/src/lib/db/pg-migrate.ts`
- `/Users/playra/BrowserOS/trios/agent-server/apps/server/src/api/services/queen-tick.ts`
- `/Users/playra/BrowserOS/trios/agent-server/apps/server/src/api/services/queen-dispatch.ts`
- `/Users/playra/BrowserOS/trios/agent-server/apps/server/src/api/routes/queen-kanban.ts`
- `/Users/playra/BrowserOS/trios/agent-server/apps/server/src/api/server.ts`
- `/Users/playra/BrowserOS/trios/agent-server/queen-core/Sources/queend/main.swift`
- `/Users/playra/BrowserOS/trios/agent-server/queen-core/Sources/QueenPolicy/ModelPricing.swift`
- `/Users/playra/BrowserOS/trios/rings/T27-00/queen_core.t27`

---

## 0. Four things that changed since the committed docs were written

Measured today; the design depends on all four.

**0.1 The refusal changed shape.** `queen-mission-control.md` was written when the
refusal was about credentials. It is now about money:

```
$ curl -s https://trios-agent-server-production.up.railway.app/queen/status
"lastTick":{"decidedAt":"2026-09-03T09:28:20.020Z","allowed":false,
 "refusal":"the swarm has spent about $11 today, $1.37 past its $10 daily limit
            (raise it with TRIOS_SWARM_DAILY_CAP_USD)","skippedCount":0}
"dispatches":{"total":43,"finished":43,"running":0,
 "latest":{"issue":1329,...,"outcome":"4 provider key(s) configured: 1 carrying a
  bee and 3 refused by the provider - top those up rather than adding another,
  a refused key is not extra capacity."}}
```

`skippedCount: 0` is the tell. The doc's live reading was `skippedCount: 42` —
the Queen examined 42 candidates and named a reason for each. Today she examines
**none**, because `queend`'s `choose` gates in the order *capacity, then money,
then boundaries, then order* (`queen-core/Sources/queend/main.swift:181-240`) and
money refuses before the candidate loop is entered. **The game's per-issue
"whyNotChosen" text does not exist today and cannot, while the cap holds.** A
board that draws per-card refusal reasons will draw an empty set and must say so.

**0.2 The public page is live and is already lying.** `https://t27.ai/#/queen`
lazy-loads `assets/Queen-CXq47Md-.js` (63,787 bytes, HTTP 200, fetched today).
That chunk polls all five endpoints. Read from the live page at 16:39 local:

- FACTORY tab: `Every station, module and Bee bay below is backed by the live
  Queen ledger.` — and one line below it, `BEE HANGARS / factory telemetry
  offline / HTTP 404`. The sentence asserting ledger backing sits directly above
  the 404 that disproves it for the bee bays.
- `1 ROUNDS / 24H` next to `every 5 min`. The known-broken gauge is live in
  public (`queen_tick` is `name text PRIMARY KEY`, written by upsert, so the
  count can only ever be 0 or 1).
- `LIVE BEE ACTIVITY / 2 SECOND PULSE / Waiting for the next recorded Bee event.`
  polling `/queen/public-activity`, which 404s. It will wait forever and say
  "waiting" forever.
- Thirteen cards in review are each labelled **`LEDGER ANOMALY`**. #1332 is a
  normal open issue in review. Nothing measured it as an anomaly. This is an
  invented alarm word over real data — the F6 failure ("the instrument lies") in
  its purest form, already shipped.
- `0 EXECUTING NOW`, `0 QUEEN REVIEW PENDING`, `0 CHANGES REQUESTED`,
  `0 HUMAN ESCALATION`, then `13` cards listed underneath. Two contradictory
  counts of the same thing on one screen.

**Every bee feature below must be designed so it cannot join this list.**

**0.3 Exactly two routes are readable from a browser.** `api/server.ts:326-327`
registers `publicReadCorsMiddleware()` on `/queen/status` and
`/queen/public-board` only, before the global `trustedCorsMiddleware()`. Probed
today: `/queen/board` 403, `/queen/feed/data` 403, `/queen/roadmap/data` 403,
`/queen/registry` 403, `/queen/public-research` 404, `/queen/public-hardware`
404, `/queen/public-activity` 404. `grep -rn "public-research"` over
`agent-server/apps/server/src` returns **nothing** — those three routes exist in
no server source. The game's entire read budget today is two JSON documents.

**0.4 The engine verdict's own escape clause has fired.** `engine-benchmark.md`
§11 lists four things that would change "no engine, canvas2D"; #4 is *"the page
moving into the t27.ai React SPA"*. It has moved. The real code is
`apps/website` (React 19 + Vite), `three@0.183`, `@react-three/fiber@9.5` and
`@react-three/drei@10.7` are already dependencies, and `three-C7rSOEFP.js`
(918,770 bytes decoded) is already on the wire at t27.ai. `QueenResearchCity.tsx`
already renders through r3f. So the canvas2D recommendation is not violated by
using r3f here — it is superseded by its own stated condition. **Do not add a
third renderer.** The cabinet contract already forbids one (`queen-game-cabinet-contract.mjs`
fails on `UnityLoader|unity-webgl|UnityInstance`).

---

## 1. The bee as an object

### 1.1 The choice

**A bee is one turn.** Not a dispatch row, not a worker slot, not a provider key.

A turn is identified by `queen_dispatch.conversation_id`. It is born at
`dispatched_at`, it dies at `finished_at`, it carries exactly one provider, one
model, one key index, one boundary, one criteria set, one token pair and one
verdict. `queen-mission-control.md` §4.3 states the same thing in prose — "A bee
is **one model turn**. Not an agent, not a session" — and the schema agrees.

### 1.2 Defending it against the alternatives

**Not a dispatch row.** `queen_dispatch` is `issue int PRIMARY KEY`
(`pg-migrate.ts:153`). Redispatching an issue overwrites `detail`,
`conversation_id`, `dispatched_at`, `finished_at`, `outcome` and `key_index` in
place. The migration comment records the cost: *"#1244 was dispatched six times
and one row survived it."* If a bee were a row, five of those six bees would
never have existed. The overwritten attempts survive as `to_jsonb` snapshots in
`queen_dispatch_history (id, issue, archived_at, snapshot)` — which is the real
bee ledger, and is behind the token.

**Not a worker slot.** A slot with no issue produces no bee. Today capacity is 4
by law and 1 by credential, and 0 bees exist. Slots are furniture; bees are
events.

**Not a provider key.** Live proof that these are different objects: the machine's
own refusal separates them — *"1 carrying a bee and 3 refused"*. `refusedKeys` is
a module-level `Map<string, Set<number>>` in `queen-dispatch.ts` with a
process lifetime; a refused key is a dead socket, not a dead bee.

### 1.3 But a turn cannot evolve — so name the carrier

A turn lives minutes. Evolution needs something that persists. The persistent
thing the database already keys failure on is the **provider key index**:

> *"Which provider key carried this bee. Stored so a retry returns to the same
> one and a key that keeps failing is visible as a key rather than as several
> unlucky tasks."* — `pg-migrate.ts:191-194`, the comment that adds `key_index`.

So the game has two objects and must never merge them (the repository has already
paid once for merging *busy* and *refused* into one number):

| Game object | System object | Lifetime | Identity |
| --- | --- | --- | --- |
| **BEE** | one dispatch turn | minutes | `conversation_id` |
| **CELL** (hangar) | `(provider, key_index)` | forever | the pair |

**A bee inherits its stage from the cell it hatched out of.** Evolution is a
property of the cell's record; the bee is the visible expression of it. This has
a consequence worth putting on the page in words: *the record outlives the work*.
`WORKSPACE_DIR=/workspace` sits on the container's overlay and a redeploy destroys
every branch on it (§5 of the mission-control doc, F5 "Amnesia"), while
`queen_dispatch_history` is in Postgres and survives. The bee's lineage is more
durable than the code the bee wrote. That is true, it is uncomfortable, and it is
exactly the tension the proof-of-compute work exists to close.

### 1.4 The fields that render one bee

Real (column exists, written today):

| Field | Column / source | Note |
| --- | --- | --- |
| `id` | `queen_dispatch.conversation_id` | may be null on a refusal row |
| `issue` | `queen_dispatch.issue` | |
| `cell` | `queen_dispatch.key_index` | 0-based; unsuffixed env var is index 0 |
| `species` | `queen_dispatch.provider` | one of 5 in `WORKER_PROVIDERS` |
| `subspecies` | `queen_dispatch.model` | live: `glm-5.3` |
| `bornAt` | `dispatched_at` | |
| `diedAt` | `finished_at` | null = in flight, or reaped |
| `outcome` | `outcome` (text) | free text; `reaped...` prefixes are load-bearing |
| `verdict` | `review_state` | `accept` \| `sendBack` \| `escalate` \| `wait` |
| `verdictNote` | `review_note` | sliced to 900 chars |
| `judgedAt` | `reviewed_at` | |
| `boundary` | `owned_paths` jsonb | the files it was allowed to touch |
| `strays` | `strays` jsonb | committed paths **outside** the boundary, sliced to 20 |
| `sendBacksOnIssue` | `send_backs` | on the issue, accumulates across attempts |
| `criteriaTotal` | `criteria` jsonb length | |
| `criteriaSource` | `criteria_source` | `none` means the bee wrote its own |
| `inputTokens` / `outputTokens` | bigint, **nullable** | |
| `started` | boolean | `false` = a refusal row, not work |

Derived, honest:

- `lifetimeSeconds = finished_at - dispatched_at`
- `costFloorUSD = ModelPricing.estimatedCost(...)`, **nil** when the model is not
  in the price table. `ModelPricing.price` does longest-prefix matching over
  eight families; `glm-5.3` matches `glm-5`. An unmatched model returns nil and
  the code is explicit: *"An unknown price must stay unknown: inventing an
  average is how a cheap run gets reported as expensive."*
- `isRefusal = !started`

**SYNTHETIC — needs a column:**

- `committedFiles` — computed at review time as `files.length` from
  `git diff --name-only origin/dev...queen-<issue>` and handed to `queend`, then
  **thrown away**. There is no `committed_files` column. Server change:
  `ALTER TABLE queen_dispatch ADD COLUMN IF NOT EXISTS committed_files int;`
- `committedPaths` — never stored at all. Needed for path-based specialisation
  (§3). Server change: `ADD COLUMN IF NOT EXISTS committed_paths jsonb NOT NULL
  DEFAULT '[]'::jsonb;`
- `judged` / `unmet` per-criterion answers — parsed from the bee's `## VERDICT`
  block (`queen-tick.ts:1650-1705`, `met | unmet | could-not-check`, and
  `could-not-check` counts as unmet) and logged, not stored.
- `failureKind` — see §4.2. This one is the important gap.

**Zero is never rendered.** `input_tokens`/`output_tokens` are deliberately null
when the provider sent no usage frame, and the subsystem's own rule is *"token
counts of 0 mean the provider sent no usage, not that the bee was free. Omit, do
not print zero."* The live FACTORY tab already does this right — it shows
`EXECUTING NOW —`, `IDLE —`, `LIVE UTILIZATION —`. Keep the dash.

### 1.5 The public reality, stated plainly

**Zero of the fields in §1.4 are readable from a browser today.** `/queen/status`
gives one latest dispatch (issue, two timestamps, an outcome string).
`/queen/public-board` gives cards and a five-field pulse. Everything per-bee is
behind `/queen/board`, which answers 403 and carries no CORS header.

So the design must ship in two layers, and the first must be complete on its own:

- **Layer A (today, two endpoints):** bees are *counted and remembered*, not
  individuated. The hive is drawn from `pulse.bees`, `dispatches.total/finished/
  running` and the `latest` outcome. There is exactly one individually-rendered
  bee — the latest — because `/queen/status` exposes exactly one.
- **Layer B (after §8's `/queen/public-hangars`):** cells become individual,
  lineages appear, evolution becomes visible.

Ship A first, and make A honest enough that B is an enrichment rather than a
rescue.

---

## 2. Evolution

### 2.1 The rule: no XP, only the ledger

The stage of a cell is a pure function of integers already in the database. No
accumulator, no invented points. The house style demands this — RING-00 is
integers and booleans by law, "no floating point anywhere in this ring."

Inputs, per cell `(provider, key_index)`, over its whole lineage
(`queen_dispatch` current row + `queen_dispatch_history` snapshots):

```
turns        = count of turns with this key_index and started = true
accepted     = count with review_state = 'accept'
sentBack     = count with review_state = 'sendBack'
escalated    = count with review_state = 'escalate'
cleanAccepts = accepted turns with strays = '[]'          (real column)
rescues      = accepted turns where send_backs >= 1 at review time
replayed     = accepted turns whose tree hash a second machine reproduced
counted      = turns whose failure_kind counts_against_issue(kind) == true
```

`replayed` and `counted` are **SYNTHETIC**; the rest are real columns today.

### 2.2 The five stages

| Stage | Name | Gate | What visibly changes |
| --- | --- | --- | --- |
| 0 | **LARVA** | `accepted == 0` | Bare hexagon outline in `--muted #888888`. No gold. No wings. Diameter `--sp0` (0.618rem). |
| 1 | **FORAGER** | `accepted >= 1` | Two gold facets (`--golden #FFD700`) spring from the hex. Diameter `--sp0 × φ`. A green (`--accent #00FF88`) filament runs to the cell. |
| 2 | **ARTISAN** | `accepted >= 3 && cleanAccepts >= 1` | Three facets, and the facets acquire the golden-trapezoid inner cut. Diameter `--sp0 × φ²`. The bee stops being a dot and starts being a shape you can recognise across the map. |
| 3 | **WARDEN** | `rescues >= 1` | Four facets plus a mantle arc over the core — it finished work another bee was sent back on. Diameter `--sp0 × φ³`. |
| 4 | **ARCHON** | `replayed >= 1` — **SYNTHETIC** | Five facets, and the core stops being flat: it gains an inner second hexagon in `--accent`, the only doubled geometry in the game. Diameter `--sp0 × φ⁴`. |

The φ ladder is not decoration. `:root` on the live t27.ai already ships
`--phi: 1.618` and a matched type/space scale (`--f-3` … `--f6`, `--sp-1` …
`--sp5`), measured from `https://t27.ai/assets/index-CfRJQE_c.css`. Sizing the
stages on the site's own ratio is inheriting the identity rather than inventing
one.

### 2.3 Stage 4 is deliberately unreachable, and the page should say why

`grep -rn "commit_sha\|commitSha"` over the dispatch, tick and migration source
returns nothing; the schema stores `branch text`, and a branch name is not a
content hash. No node has ever replayed another's tree. So **ARCHON is empty and
must be drawn empty**, with the reason on it:

> `ARCHON — 0 bees. No second machine has ever reproduced a tree this hive
> produced. queen_dispatch has no commit_sha.`

This is the same rule that makes the map show two lit nodes instead of sixteen
continents. It also makes the top of the evolution tree and the top of the
proof-of-compute problem the *same* locked door, which is the most useful thing
the game can teach a visitor in one glance.

### 2.4 Demotion, using shipped law rather than a new rule

Evolution is not monotonic, and the rule for what counts already exists in
executable form. `rings/T27-00/queen_core.t27`:

```
pub const FAILURE_INTERRUPTED:       i32 = 0;
pub const FAILURE_PRODUCED_NOTHING:  i32 = 1;
pub const FAILURE_WORKED_BUT_FAILED: i32 = 2;

pub fn counts_against_issue(kind: i32) bool { ... }
```

with the comment: *"An interruption is the supervisor's accident, not the issue's
difficulty. Counting it would retire issues for the crime of being open while
somebody rebuilt the app."*

Apply it verbatim to cells: a turn ending in a kind where
`counts_against_issue(kind)` is true removes one facet, floor 0. An interruption
removes none. **Do not write a second rule** — this repository's named recurring
defect is one rule in two files.

### 2.5 The blocker: nothing records which failure it was

`queen_dispatch` has no `failure_kind`. The only classifier that exists is the
prefix of the free-text `outcome`:

- `'reaped at boot: the container running this turn was replaced'` →
  unambiguously `FAILURE_INTERRUPTED` (`queen-dispatch.ts:1126-1131`)
- `'reaped: no completion within 120 minutes'` → **unclassified**. A stall could
  be either a killed process or a bee that spun. The system does not know.
- anything else → unclassified.

And the consequence is bigger than the game. Measured: of `queend`'s six question
kinds (`boundary`, `retry`, `choose`, `review`, `spec`, `language` — the switch
at `main.swift:152-400`), the container calls exactly four. `grep` for
`askQueend({ kind:` in `queen-tick.ts` yields `spec`, `spec`, `choose`, `choose`,
`boundary`, `review`. **`retry` is never asked.** So `retry_verdict`,
`MAX_REAL_ATTEMPTS = 2` and `counts_against_issue` are compiled, Docker-gated
law with no caller — because the input they need (`real_attempts`, the count of
endings that *counted*) cannot be computed from a table that does not record
which endings counted.

Server change, and it is small:

```sql
ALTER TABLE queen_dispatch
  ADD COLUMN IF NOT EXISTS failure_kind smallint;   -- 0|1|2, RING-00 coding
```

written where `outcome` is written. That one column simultaneously: makes
demotion real, gives `retry_verdict` its first caller, and turns #1331 ("RING-00
runs in production and decides nothing") from a complaint into a closed issue.

For the record, RING-00's Rust *does* run every round — but as a shadow observer
on one decision only. `crossCheckRing00Capacity` (`queen-tick.ts:782`) spawns
`/usr/local/bin/t27core capacity <running>` with a 2 s timeout, compares
`can_start_another` against the Swift answer, logs `agree` / `disagree` /
`unavailable`, and marks Swift `authoritative`. `review_verdict` and
`merge_verdict` are not cross-checked; `merge_verdict` has no `queend` entry
point at all. Two implementations of one law, one of them advisory.

### 2.6 Species and subspecies are traits, not stages

`WORKER_PROVIDERS` in `queen-dispatch.ts:47-64` is five entries: `zai/glm-5.3`,
`anthropic/claude-sonnet-4-5`, `openrouter/anthropic/claude-sonnet-4.5`,
`moonshot/kimi-k2-0905-preview`, `openai/gpt-5`. Provider is the **species** (hue
of the core), model the **subspecies** (label). A model absent from
`ModelPricing.table` renders with **no cost halo** — the visual statement that
this bee spent an unknown amount. That is not a cosmetic choice: `spentToday`
sums only priced tasks, so the `$11` in the live refusal is a **floor**, and a
swarm running an unpriced model spends invisibly against a cap that cannot see
it.

---

## 3. Specialisation: three lines, one of them populated

### 3.1 The honest opening position

Capabilities, from `queen-mission-control.md` §3 and the Dockerfile: the Mac has
`swift-build`, `make`, `screen`, `git-push`; the container has `typescript`,
`docs`, `git-commit`; **neither** has `verilog-synthesis` or `bitstream-load`; no
GPU appears anywhere in the supervisor path. No Digilent/FTDI/Xilinx device is
attached to the Mac.

So: **one line has bees, two have none.** Draw the two empty territories empty,
with the measurement that made them empty printed on them. Sixteen glowing
continents over two machines is the defect this project has already paid for.

### 3.2 The CPU line — SILICATE (populated)

Divergence driver: the **path prefixes of the boundaries a cell has been
accepted on**. `owned_paths` is a real jsonb column, parsed once by
`boundaryPathsOf` so the board never runs a second parser. Branches:

| Branch | Trigger (majority of accepted boundaries) | Becomes good at | Visible |
| --- | --- | --- | --- |
| **SCRIBE** | `docs/`, `*.md`, `.trinity/specs/` | cheap turns; smallest median `output_tokens`; almost never strays (a doc edit rarely leaves its boundary) | thin, fast, pale-gold facets; the shortest tether |
| **WRIGHT** | `agent-server/`, `apps/`, `packages/` | the common case; the only branch that regularly returns a non-empty diff on a criteria-bearing issue | full-gold facets, standard geometry |
| **LAPIDARY** | `rings/`, `*.t27`, generated Rust | the ring chain; work `queend` and `t27core` both read | facets carry the inner trapezoid cut earlier than stage 2 would give it — the ring is the ornate branch |

`SCRIBE`/`WRIGHT`/`LAPIDARY` are computable **today from data in the database**
(not from the public API). Two capabilities are structurally out of reach and
must be marked so on the branch: nothing in the container can `make`, run a
screen, or `git push` — the brief tells the bee so in as many words, and
`GITHUB_TOKEN` is excluded from the tool shell's environment allowlist. Issue
#1330 ("Seven of 23 backlog issues need a build or a screen, which no bee has")
is that fact as a red overlay.

### 3.3 The FPGA line — FOUNDRY (empty, but with a shipped ladder)

Do not invent an FPGA progression. One already exists in the worktree:
`queenHardwareRegistry.ts` defines `registered → synthesised → programmed →
online`, verified through an Ed25519 envelope against a pinned public key, with
`ENVELOPE_MAX_AGE_MS = 30_000` and a rule that `online` is rejected unless
`observedAt` is inside `onlineWindowSeconds`. Strict field whitelisting; any
extra key rejects the device.

Map bee specialisation onto the device ladder:

| Branch | The bee's job | State it advances a device to | Status |
| --- | --- | --- | --- |
| **SYNTHESIST** | produce a bitstream artifact from RTL | `synthesised` | SYNTHETIC — no node declares `verilog-synthesis` |
| **LOADER** | program a device over JTAG | `programmed` | SYNTHETIC — no JTAG device attached |
| **WITNESS** | return a fresh signed observation inside the 30 s window | `online` | SYNTHETIC — `/queen/public-hardware` is 404 |

What makes it real, in order: (1) implement `/queen/public-hardware` to the
envelope shape the client **already validates** — the verifier is written and
shipped, the server is not; (2) a capability declaration per node; (3) a signing
key held by whoever owns the board. This is the one specialisation line where the
client is ahead of the server, so the cheapest correct move is to write the
server to the existing client type rather than change the client.

The FOUNDRY territory is where the Protoss reading is strongest: gold crystalline
structures with nothing inside them yet. Draw four empty device plinths and the
sentence `no device has ever been observed online`.

### 3.4 The GPU line — unsurveyed

There is nothing to specialise. Grepped: no GPU in the supervisor path. Draw the
third territory as **unsurveyed terrain**, not as a locked tech node — a locked
node implies a key exists. The single measurement that would open it: a node that
declares a `gpu` capability and proves it by returning a device string that a
second reader can check. Everything past that is undesigned and should not be
drawn. **SYNTHETIC** in full.

---

## 4. Death and failure — the common case

Right now: **3 of 4 keys refused, 0 bees running, every tick refused.** Failure is
the resting state, so it gets the best-designed screen in the game, not an error
toast.

### 4.1 Six endings, each with a different fix

| Ending | Detected by | What the player sees | What they can do |
| --- | --- | --- | --- |
| **Refused key** | `keyIsLive()` reads 401/403 or a body containing `1113` / `Insufficient balance` | Cell goes **SEALED**: dark amber, hex outline broken on one edge, the machine's own sentence beneath it verbatim | Top up at the provider. Then **redeploy** — see 4.3 |
| **Cap exhausted** | `SwarmBudget.verdict` → `.exhausted(overBy:)` | The whole hive dims; see §6 | Raise `TRIOS_SWARM_DAILY_CAP_USD`, or wait for the day to turn |
| **Reaped at boot** | `outcome LIKE 'reaped at boot%'` | The bee dissolves mid-flight against a redeploy marker on the timeline. **No demotion** — `FAILURE_INTERRUPTED` | Nothing. It was the platform's doing |
| **Stalled** | `outcome LIKE 'reaped: no completion within%'`, swept at 120 min | The bee freezes and greys; its boundary visibly releases. Label: `stalled — cause not recorded` | Nothing today. Fix is `failure_kind` (§2.5) |
| **Sent back** | `review_state = 'sendBack'` | The bee returns to its cell carrying the unmet criteria as broken shards; the issue's `send_backs` counter ticks | See 4.2 — this is worse than it looks |
| **Escalated** | `review_state = 'escalate'` | A gold beacon over the issue. The only verdict that reaches a person | Answer it — and there is no endpoint to answer it with (§5) |

`review_verdict` produces `escalate` on three distinct roads, and the game should
name which one, because they mean opposite things: `total_criteria <= 0` (the
issue never said what "done" was), `unmet == 0 && committed_files <= 0` (*"every
criterion met against an empty diff is not a pass, it is a reviewer that had
nothing in front of it and answered anyway"*), and `prior_send_backs >= 2` (the
ceiling). Three icons, not one.

### 4.2 A send-back is currently a death, not a wound

`queen-tick.ts:35` records it: *"`sendBack` with the unmet criteria named, and
nothing yet reopens the worker."* Issue #1329 is on the live board in backlog
with 4 criteria: **"A sendBack verdict reopens nothing, so every issue gets one
attempt."**

So the animation must not show the bee flying back out. It shows the bee
returning, the counter ticking, and then **nothing** — with the label
`returned; no bee has been sent back out`. Drawing a hopeful loop here would be
a lie the game tells about its own known bug.

### 4.3 Sealed comes back on deploy, not on the next round

`refusedKeys` is a module-level `Map` cleared only by `clearRefusedKeys()` and by
process death. The mission-control doc calls it correctly: *a downed satellite
comes back on the next deploy, not on the next round.* Therefore:

**Do not draw a retry button on a sealed cell.** Draw the sentence
`sealed until the container restarts` and a link out to where the top-up actually
happens. A button that cannot act is the same defect as a gauge that cannot rise.

### 4.4 Three states that must never share a colour

`empty` (no key configured) / `sealed` (key refused) / `busy` (key carrying a
bee) had once been one number, and the live board showed what that cost: with
two bees running on the two credentials that could pay, the refusal read *"all 4
provider key(s) are already in use by bees in flight. Add another with
ZAI_API_KEY_5"* — and the operator was told to buy a fifth key while holding two
dead ones. Three states, three colours, three sentences, forever.

---

## 5. The Queen's side: what the player may actually do

### 5.1 Watching — everything possible today

Four reads, cross-origin, no token, and that is the complete list:

| # | What | Endpoint | Field |
| --- | --- | --- | --- |
| W1 | Is she alive, and is she refusing | `/queen/status` | `lastTick.decidedAt`, `.allowed`, `.refusal` |
| W2 | How much work has ever run | `/queen/status` | `dispatches.total/finished/running` |
| W3 | The last bee's ending | `/queen/status` | `dispatches.latest.{issue,dispatchedAt,finishedAt,outcome}` |
| W4 | The board and the day | `/queen/public-board` | `cards[]`, `pulse{rounds,bees,verdicts,lastRoundAt,roundSeconds}` |

Note what W2 is not. `dispatches.total: 43` is **issues ever touched**, not bee
turns — `queen_dispatch` is keyed by issue and a *refusal* writes a row too, with
`started = false` and `finished_at = now()`. Live proof: the latest dispatch is
issue 1329 with `dispatchedAt == finishedAt` to the millisecond and a refusal
string as its outcome. **Label it "issues touched", never "Completed Bees".** The
live page today says `COMPLETED BEES 43/43`, which counts refusals as completed
bees.

### 5.2 Commanding — one shipped lever, and it must not be public

| # | Decision | Endpoint | Verdict |
| --- | --- | --- | --- |
| C1 | Run a round now | `POST /queen/lease/tick` — **exists** | Guarded by `TRIOS_API_TOKEN`, a single shared bearer (`utils/request-auth.ts:19`), and not in the CORS allowlist. A public game page cannot call it, and making it callable would mean shipping the one shared token to every visitor. **Refuse. Keep this on the same-origin operator surface `/queen/hq`, which already has the button.** |
| C2 | Pin the next bee to an issue | `POST /queen/lease/tick` with `candidates` — **exists** | Same guard. Genuinely the most interesting command in the system: it overrides what GitHub would have offered, and is echoed back in the response *"so a result obtained this way can never be mistaken for one the tick reached by itself."* Operator-only. |
| C3 | Unseal refused keys | `clearRefusedKeys()` — a function with no route | One route away. Honest and useful, because today the only way is a redeploy |
| C4 | Raise the daily cap | no endpoint | But a write path already exists: `SwarmBudget.current` reads `TRIOS_SWARM_DAILY_CAP_USD`, then the knob file `<trinity>/state/swarm_budget.json` (`{"dailyCapUSD": 30}`), *per call* — the doc comment says the knob takes effect without a relaunch. So a tiny authenticated route that writes that file is the cheapest real command in the whole system |
| C5 | Answer an escalation | no endpoint | `review_state` is written only by the tick. Fully new work |
| C6 | Add a node / declare a capability | no endpoint, no table | Fully new. This is the "community contributes compute" write path and none of it exists |

**The honest headline: the game is a window, not a cockpit.** Say so on the page.
A mission-control game where the public player commands nothing is not a
weakness if the page is explicit that it is showing a machine that runs itself —
which is the actual design intent (`queen-mission-control.md` §8: *"The player
never has to click for progress"*). The one place to put a command is the
operator's authenticated surface, and the four commands worth building there are
C3, C4, C2, C5 in that order of cost.

---

## 6. The idle problem

The current state. It must read as *deliberate restraint*, never as breakage.

### 6.1 What the page says now, and why it is wrong

Live, 16:39: `NEXT QUEEN ROUND 00:04:12` … `No Bee is executing right now. Queen
remains online and keeps the queue under policy.`

That sentence is a euphemism for a fact the page **already has in hand** — it
polls `/queen/status` every 5 seconds and `lastTick.refusal` is right there:
*"the swarm has spent about $11 today, $1.37 past its $10 daily limit (raise it
with TRIOS_SWARM_DAILY_CAP_USD)."* Not showing the machine's own sentence, and
substituting a soothing one, is the single worst thing on the page.

### 6.2 THE DUSK STATE

**Rule 1 — the machine's sentence, verbatim, in the largest type on the screen.**
No paraphrase, no translation of `$11` into a mood.

**Rule 2 — three bands, because the budget already has three.**
`SwarmBudget.Verdict` is `fine(remaining)` / `nearingLimit(remaining)` when
`remaining <= dailyLimitUSD / 5` / `exhausted(overBy)`. Three sky states, and
they are not invented:

- **DAY** (`fine`) — cells lit, green filaments live.
- **DUSK** (`nearingLimit`) — gold cools, the hive slows. Warning without alarm.
- **NIGHT** (`exhausted`) — cells go dark gold on black. The hive is intact and
  asleep, not broken. **Today's state.**

**Rule 3 — the countdown must state its own outcome.** Not `NEXT ROUND 00:04:12`
but `NEXT ROUND 00:04:12 — she will refuse it. $1.37 over.` A countdown to a
refusal, presented as a countdown to work, is a promise the machine will break
every five minutes.

**Rule 4 — "at least".** `spentToday` sums only tasks with a provider, a model
and a price-table match; unpriced tasks contribute nothing, and the source calls
it *"a FLOOR, not a total"*. Render `at least $11 today`.

**Rule 5 — "unchanged for N rounds", and say where N came from.** The server
cannot supply it: `queen_tick` is `name text PRIMARY KEY` written by upsert, so
`rounds/24h` can only read 0 or 1 — and it reads `1` on the live page right now,
next to `every 5 min`. N is therefore **client-derived**, by watching
`lastTick.decidedAt` change across 5-second polls, and it resets on reload. Put
that in the tooltip. Fix properly with an append-only `queen_round` table.

**Rule 6 — do not claim to know when she wakes.** `SwarmBudget.spentToday` uses
`Calendar.current` — the *container's* timezone, which the page cannot see. Say
`the day turns on the container's clock; this page does not know its timezone`
until `/queen/status` publishes the reset instant.

**Rule 7 — one thing genuinely moves.** The 300 s heartbeat, measured twice at
299.94 s apart. A five-minute breath across the hive is slow, legible and real.
Respect `prefers-reduced-motion` — the cabinet contract already requires that
media query.

**Rule 8 — an idle hive shows its record, not a spinner.** 43 issues touched, 44
done, 13 in review, 18 in backlog. The last accepted work glows. **Forbidden: any
spinner, any "waiting for the next event" on an endpoint that 404s, any progress
bar over the roadmap** (11 epics, 58 planned issues, 0 done — a 0% bar next to a
swarm that worked all day is exactly the F6 lie, and the existing
`/queen/roadmap` route already refuses to draw one; inherit that refusal).

**Rule 9 — one named lever, pointing outside.** The refusal string already names
it: `TRIOS_SWARM_DAILY_CAP_USD`. Print the variable name and where it lives
(Railway service `trios-agent-server`). Do not draw a slider the page cannot
move.

### 6.3 What "nothing is happening" is actually made of, right now

Four causes are stacked, and the game should show them as a stack, because
clearing the top one reveals the next:

1. **Money** — `$1.37` over the cap. Blocks before candidates are even read
   (`skippedCount: 0`).
2. **Credentials** — 3 of 4 keys refused. Ceiling would be 1, not 4, the moment
   the cap moved.
3. **Specs** — of the 18 backlog cards, 12 carry `needs: boundary, scenarios,
   requirements, success criteria` and 0 criteria. Read from the live board.
4. **Review debt** — 13 cards in review, each holding its boundary for 48 hours
   (`REVIEW_BOUNDARY_HOLD_HOURS`).

That is the game's core loop rendered as a single column of four gates, three of
which the player can act on outside the page, and it is entirely derivable from
the two public endpoints today.

---

## 7. Look: Protoss on the measured palette

### 7.1 The palette is not a choice — measured from the live site

`https://t27.ai/assets/index-CfRJQE_c.css`, `:root`, fetched today:

```
--bg: #000000        --accent: #00FF88      --accent-dark: #00CC66
--text: #FFFFFF      --muted: #888888       --border: rgba(255,255,255,.08)
--golden: #FFD700    --font: "Outfit", system-ui, -apple-system, sans-serif
--phi: 1.618  --f-3…--f6  --sp-1…--sp5
```

`Queen.css` in the worktree already binds to it correctly:
`--q-green: var(--accent, #00ff88)` and `--q-gold: var(--golden, #ffd700)`
(lines 2-3). Keep that binding; never hard-code the hex.

### 7.2 The Protoss reading, honestly reconciled

Protoss is gold-bronze crystal, teal-cyan psionic energy, ornate geometry, on
dark. Three of four map straight onto what already ships:

| Protoss | t27.ai token | Note |
| --- | --- | --- |
| gold/bronze crystal | `--golden #FFD700` | already an identity colour; use it for **structure** — cells, facets, ornament |
| psionic energy | `--accent #00FF88` | the site's energy colour is **green, not teal**. Use it for **life**: live links, running bees, the heartbeat. Do not swap in a Blizzard teal |
| blueprint / not-yet-built | `#64dcff` | already present in `Queen.css` as `--construction-color` (12 occurrences). This is the nearest thing to Protoss teal in the identity, and it already means *"under construction"*. Keep it confined to that meaning |
| dark ground | `--bg #000000` | pure black, not the blue-violet of Protoss art. **Do not add a blue wash.** Get the Protoss read from geometry and gold |
| damage | `#FF6B6B` / `#ff665f` | already in `Queen.css` |

**Total hues: four.** Adding a fifth is how a game invents a palette.

### 7.3 Ornament without inventing a design system

Every ornate element is sized on `--phi` and the shipped `--sp` scale: hexagons,
golden trapezoids (1 : φ), facet counts 2…5, bee diameters `--sp0 × φ^stage`.
Fonts stay Outfit; the only monospace is for machine-generated strings, which
also carry `overflow-wrap: anywhere` — the mission-control doc measured **zero**
`word-break`/`overflow-wrap` declarations in `queen-hq.ts` and the live refusal
string is 176 characters.

### 7.4 The zoom, and which renderer draws it

- **Strategic (zoomed out)** — a handful of nodes, four cells, three territories.
  SVG or canvas2D. No engine. `engine-benchmark.md`'s 2,506 vs 109,407 bytes
  argument holds at this node count.
- **Tactical (zoomed in) — the Protoss view** — the hive interior, crystalline
  cells, bees with facets, the FOUNDRY plinths. This is where the ornament lives
  and where `@react-three/fiber` is **already** rendering `QueenResearchCity`.
  Reuse that canvas. Adding a second renderer for one view is the cost the
  benchmark was warning about, in the other direction.

The transition between them is the game's one piece of real spectacle and it
costs nothing extra: it is a camera move on a canvas that already exists.

---

## 8. Server changes, ranked by cost, each with the exact edit

**S1 — widen the public pulse. Zero new queries. Highest value per byte.**
`build()` in `queen-kanban.ts:377-465` **already computes** `inputTokens`,
`outputTokens`, `lastRefusal`, `workerKeys`, `workerKeysRefused` and
`workerLimit: 4`, and `publicBoardProjection` (same file, lines ~87-127) then
throws all six away through a narrow `Pick<>`. Widening it is two lines.

The privacy comment above the projection says provider capacity, token counts and
the refusal text are operational state. That argument no longer holds for four of
the six, and the disproof is on the wire: `/queen/status` already publishes the
refusal **verbatim in public**, and its `dispatches.latest.outcome` already
publishes the key counts *in prose* — *"4 provider key(s) configured: 1 carrying
a bee and 3 refused"*. Publishing `workerKeys: 4, workerKeysRefused: 3,
workerLimit: 4` as integers reveals nothing a reader cannot already read as
English. Token counts are the one genuine new disclosure; they are also the whole
economy of §6, and they are aggregates over 24 h, not per-bee.

**S2 — publish the budget on `/queen/status`.**
`{dailyLimitUSD, spentTodayUSD, isFloor: true, band: "fine"|"nearing"|"exhausted",
dayResetsAt}`. `queend` computes all of it every round. Without this the idle
screen has to parse dollars out of an English sentence with a regex — which is
the shape of every instrument in this repo that later lied.

**S3 — `GET /queen/public-hangars`.** One query, existing columns:
```sql
SELECT key_index, provider, model, count(*) AS turns,
       count(*) FILTER (WHERE review_state = 'accept')   AS accepted,
       count(*) FILTER (WHERE review_state = 'sendBack') AS sent_back,
       count(*) FILTER (WHERE review_state = 'escalate') AS escalated,
       count(*) FILTER (WHERE review_state = 'accept'
                         AND strays = '[]'::jsonb)       AS clean_accepts
  FROM queen_dispatch WHERE started GROUP BY 1,2,3;
```
plus the same over `queen_dispatch_history`'s snapshots. This turns Layer A into
Layer B and is the single change that makes evolution visible. Register it in the
`publicReadCorsMiddleware()` block or the browser cannot read it.

**S4 — `failure_kind smallint`** (§2.5). Makes demotion real and gives
`retry_verdict` its first caller.

**S5 — append-only `queen_round`.** Kills the `1 ROUNDS / 24H` lie that is live
on the public page today.

**S6 — `committed_files int`, `committed_paths jsonb`.** Unlocks CPU-line
specialisation (§3.2) and stops throwing away a number the review already
computed.

**S7 — `commit_sha text`, `tree_sha text`** (mission-control §5 step 1). The only
change that alters what the system knows about itself, and the only door to stage
ARCHON.

**S8 — the three 404 routes.** `/queen/public-research`, `/queen/public-hardware`,
`/queen/public-activity`. The client's types are already written
(`ResearchGraph`, `VerifiedHardwareRegistry`, `QueenActivity` in `Queen.tsx`),
including the Ed25519 envelope verifier for the hardware one. **Write the server
to the client, do not rewrite the client.** Until then, the FACTORY tab must stop
claiming its bee bays are ledger-backed.

### 8.1 One live inconsistency to fix before it ships

`queenWorkerHangarModel.ts` exports `QUEEN_WORKER_POLICY_LIMIT = 8` and renders
eight bays. RING-00 says `MAX_CONCURRENT_WORKERS: i32 = 4`, `queend` enforces
four, and the kanban pulse hard-codes `workerLimit: 4`. Four of the eight bays
can never be anything but locked, and the number 8 is also baked into the gate:
`queen-game-cabinet-contract.mjs` asserts `live.locked !== 6` for capacity 2
(8 − 2). Either reconcile to 4, or label the extra four as *policy headroom* —
but a deck that draws eight slots for a law that permits four is the same class
of defect as a board reporting four bees when one key can pay.

---

## 9. Ship it behind a contract, in the house style

`apps/website/package.json` already carries eight `check:queen-*` gates. The bee
work should add a ninth, matching `queenWorkerHangarModel.ts` +
`queen-game-cabinet-contract.mjs` exactly:

- `src/components/queenBeeEvolutionModel.ts` — a pure, bundleable function
  `buildBeeLineage(hangarTelemetry | null): BeeLineageDeck`, failing **closed**
  to a locked deck on null or contradictory input, exactly as
  `buildWorkerHangars` does.
- `qa/queen-bee-evolution-contract.mjs` — asserting, at minimum: (a) null
  telemetry yields zero bees and no invented stage; (b) `accepted` beyond the
  stage table cannot exceed stage 3 while `replayed == 0` — *the ARCHON stage is
  unreachable without a replay and the gate proves it*; (c) contradictory counts
  (`accepted > turns`) produce a locked deck rather than synthetic bees; (d) no
  stage label is rendered from a field the public API does not carry.
- Both locales. `qa/queen-language-contract.mjs` parses the `COPY` object with the
  TypeScript AST and requires `en`/`ru` parity, so every new bee label needs a
  Russian one.

That last assertion (d) is the one that matters. It is the mechanical version of
the rule this whole design rests on: **a bee may not be drawn with a property
nobody measured.**

---

## 10. What I did not measure

- **Per-bee history.** `queen_dispatch_history`, `key_index` distributions,
  accept/sendBack/escalate ratios and token spreads all sit behind
  `/queen/board`, which returns 403. I hold no `TRIOS_API_TOKEN`. Every count in
  §2 is a *design over columns I read in the schema*, not over rows I saw.
- **Whether `send_backs` has ever been non-zero in production.** The column and
  the increment exist; I did not observe a value.
- **Whether `escalate` has ever been written to `review_state`.** The verdict
  exists in `queend` and in RING-00; the live board's escalation counter reads 0
  while 13 cards sit in review, which may mean none has escalated or may be
  another disagreement between two counts.
- **`glm-5.3` pricing correctness.** `ModelPricing` matches it to the `glm-5`
  family at $0.60/$2.20 per million. I did not check that against Z.AI's current
  rate card, and the file itself says *"Prices are list rates in USD and will
  drift."* So the `$11` is a floor computed from possibly-stale prices.
- **The container's timezone**, therefore when the cap resets.
- **Any frame cost** for the bee rendering. I ran no benchmark; §7.4's split is
  an argument from node count and from an existing r3f canvas, not a measurement.
- **Whether the worktree's changes build.** I did not run `npm run build`,
  `typecheck`, or any of the nine `check:queen-*` gates — read-only, and another
  agent is editing that tree.
- **Any threshold calibration.** The stage gates in §2.2 (1, 3, 1, 1) are a
  starting point. Nothing in this system has ever had a threshold tested against
  an outcome, and these are no exception.

---

## Appendix — the one-paragraph pitch

*A bee is one model turn: born when the Queen hands it an issue and a boundary,
dead when it returns a verdict block. It hatches from a cell — a provider key —
and it wears that cell's whole record on its body: two gold facets for a cell
that has ever been accepted, three if it has ever committed inside its boundary
without straying, four if it finished work another bee was sent back on. The
fifth facet has never been earned by anything, because no second machine has ever
reproduced a tree this hive produced, and the game says so out loud on an empty
plinth. Three of four cells are sealed tonight and the fourth is asleep: the hive
has spent at least eleven dollars against a ten dollar day, and it is refusing,
every five minutes, on purpose.*
