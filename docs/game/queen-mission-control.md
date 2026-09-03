# Queen Mission Control

A design for turning the Queen supervisor page into a situation room in the
shape of XCOM: Enemy Unknown (2012) Mission Control, with the Earth replaced by
the compute the network actually runs on.

Written 2026-09-03. Every number below is either measured (the command is
given) or marked as unmeasured in the same sentence. Live figures were read
from the production deployment between 07:07Z and 07:17Z on 2026-09-03; they
move, and the point of the design is that the page reads them rather than
carrying them.

---

## 1. The reference, taken as a shape

From the UFOpaedia page for Mission Control (EU2012), fetched 2026-09-03:

- A Hologlobe: one 3D object that is the whole strategic state.
- 16 Council countries, each with a panic level from 1 to 5, each contributing
  funding. Panic is visible in Mission Control and in the Situation Room.
- Satellites give coverage over a country: detection, and funding. A UFO that
  is not intercepted destroys the satellite, and the country loses both.
- Interceptors are the scarce craft you send at what the satellites detect.
- An UPCOMING EVENTS list on the right: research reports, engineering reports,
  the monthly Council report, satellites becoming operational.
- SCAN FOR ACTIVITY advances time. Time is the resource you spend by
  deliberating.
- Loss condition, from the Council page: "to terminate the XCOM project if a
  majority of its nations (8 or more) decide to leave the Council."

What is worth stealing is not the globe. It is this: **a scarce allocation
against a pressure that rises while you think, a research tree that changes
what allocation is possible, and a set of patrons whose patience is finite and
individually visible.** Everything below maps onto that skeleton.

What is NOT worth stealing: the furniture. No hologram Earth, no Bradford, no
Skyranger. The substitution the operator asked for is the whole point.

---

## 2. What the supervisor actually is

Measured by reading the source and by polling the live deployment.

Each round the container:

1. Takes a Postgres lease (`queen_lease`, fenced by a monotonic term counter;
   `LEASE_TTL_SECONDS = 180`, `HEARTBEAT_SECONDS = 60`, both in
   `agent-server/apps/server/src/api/services/queen-tick.ts`).
2. Reads open issues from GitHub anonymously, paginated at 100, capped at 5
   pages (`ISSUE_PAGE_SIZE`, `ISSUE_PAGE_CAP`, same file).
3. Asks `queend` - the Swift policy binary, compiled from `queen-core/` in a
   Docker stage and copied onto PATH - which issue may be started.
4. Cuts a branch `queen-<issue>` in `/workspace/BrowserOS`, dispatches one
   model turn on one provider credential, and streams its transcript into
   `queen_transcript`.
5. When a turn finishes, reads the bee's own `## VERDICT` block, runs
   `git diff --name-only origin/dev...queen-<issue>`, and hands five integers to
   `queend` for a verdict of accept / sendBack / escalate / wait.

The judgment rule is not prose. It is `rings/T27-00/queen_core.t27`, generated
to Rust, compiled with bare `rustc` in the Docker build, and executed in the
shipping image:

```
pub const MAX_CONCURRENT_WORKERS: i32 = 4;
pub const MAX_REAL_ATTEMPTS:      i32 = 2;
pub const MAX_SEND_BACKS:         i32 = 2;

pub fn review_verdict(total_criteria, judged, unmet, committed_files,
                      prior_send_backs) i32
```

That function is the game's rule engine and it already exists. A game built on
top of it is not a simulation of the supervisor; it is a view of it.

### Live readings, 2026-09-03

```
$ curl -s https://trios-agent-server-production.up.railway.app/queen/status
{"scheduler":{"enabled":true,"intervalSeconds":300},
 "lastTick":{"decidedAt":"2026-09-03T07:07:30.021Z","allowed":true,
             "refusal":null,"skippedCount":42},
 "dispatches":{"total":42,"finished":40,"running":2, ...}}
```

Polled again 5 minutes later: `decidedAt` had moved to `07:12:29.963Z`. Two
consecutive rounds, 299.94 s apart. The scheduler is live and is on 300 s.

```
$ curl -s .../queen/public-board
86 cards: done 41, backlog 23, review 12, dropped 8, running 2
pulse: {rounds:1, bees:14, verdicts:12, roundSeconds:300}
```

The latest dispatch row carried this outcome, verbatim:

> 4 provider key(s) configured: 2 carrying a bee and 2 refused by the provider
> - top those up rather than adding another, a refused key is not extra
> capacity.

That sentence is the game in one line. Four satellites, two of them dead, and
the machine already knows it.

```
$ curl -s "https://api.github.com/repos/gHashTag/trios/issues?state=open&per_page=100"
42 open non-PR issues. Age in days: min 0, median 16, max 125 (#380).
12 older than 30 days. 25 older than 7 days.
```

---

## 3. The map: what a node is

XCOM has 16 council nations. This network has, today, **two** nodes that can
run anything, and that is the opening position, not a defect to hide.

| Node | What it is | What it can run | How I know |
| --- | --- | --- | --- |
| THE MAC | Apple M1 Pro, 8 cores, 16 GiB, arm64 | Swift, `make`, a screen, the app, the Keychain, `git push` | `sysctl -n machdep.cpu.brand_string hw.ncpu hw.memsize; uname -m` on this machine |
| THE CONTAINER | Railway, `oven/bun:1.3.6` runtime | bun/TypeScript, git, `queend`, `t27core`, shell as uid `bee` | `agent-server/Dockerfile`; CPU and RAM NOT measured - I have no shell in it |
| FPGA | claimed: Zynq XC7Z020 over JTAG | nothing today | `system_profiler SPUSBDataType` shows no Digilent, FTDI or Xilinx device attached to this Mac right now. `trios/CLAUDE.md` says one answers over JTAG; the boards are another agent's territory and I did not probe them |
| GPU | none | nothing | no GPU appears anywhere in the supervisor path; grepped, found none |

So the honest globe at launch has two lit nodes, one dark node with a claim
attached to it, and an empty GPU slot. **Draw exactly that.** A map that shows
sixteen glowing continents when two machines exist is the same defect as a
dashboard reporting four bees when one key can pay - and this repository has
already paid for that one.

### What a node contributes, in the game's terms

A node is defined by a **capability set**, not by FLOPS. The scarce thing here
has never been arithmetic; it is the ability to execute a particular kind of
work at all. Capabilities, all measured from the Dockerfile and from
`briefFor()`:

- `swift-build` - the Mac only. The runtime image carries `/usr/lib/swift/linux`
  so `queend` can run, and **no Swift compiler**. The compile happens in a build
  stage that is thrown away.
- `make` - the Mac only. Not installed in the runtime image.
- `screen` - the Mac only. The image ships no browser, deliberately, and the
  server starts with no `--cdp-port`.
- `git-push` - the Mac only. The container "holds no push credential by design"
  and the bee's brief says so in as many words.
- `typescript`, `docs`, `git-commit` - both.
- `verilog-synthesis`, `bitstream-load` - neither, today.

Issue #1330, filed by the swarm itself, is titled: "Seven of 23 backlog issues
need a build or a screen, which no bee has." That is the Queen measuring her
own map. In the game it is a red overlay: seven cards that cannot be routed to
any lit node.

### Growing the map

New nodes join by declaring a capability set and proving one of them. That is
the "community contributes compute" story, and section 5 says exactly what
"proving" can honestly mean today.

---

## 4. The five instruments

Each one is bound to a query that exists. If it is not bound, it does not go on
the board.

### 4.1 Panic - what rises while you deliberate

XCOM panic is 1..5 per country. Here panic is per **issue**, and it aggregates
onto the node that would have to do the work. It is composed of three
measurable pressures:

| Pressure | Source | Live value |
| --- | --- | --- |
| Age | `created_at` from the GitHub issue list | median 16 d, max 125 d, 12 issues over 30 d |
| Verdict debt | cards in column `review` | 12 |
| Return count | `queen_dispatch.send_backs` | not exposed on any public route today; the column exists and is incremented in the same statement as the verdict |

Proposed banding, and I am naming it as a proposal because no threshold in this
system has been calibrated against outcomes:

```
panic(issue) = 1 + [age > 7d] + [age > 30d] + [in review > 48h] + [send_backs >= 1]
clamped to 1..5
```

The 48-hour term is not invented. `REVIEW_BOUNDARY_HOLD_HOURS = 48` in
`queen-kanban.ts`, mirroring `QueenDelegationPolicy.reviewBoundaryHoldHours`,
and it is the exact moment a card stops blocking its neighbours. Panic that
crosses 48 hours is therefore panic that has begun to spread, which is what the
XCOM mechanic is for.

**Panic spreads through boundaries, not through geography.** A card in review
holds its owned paths. Any issue whose boundary overlaps it - by path
containment, compared component-wise by `pathsOverlap` - is blocked. That is
the adjacency graph. Draw the edges from it and the contagion is real rather
than decorative.

### 4.2 Satellites - provider credentials

Four configured. Two refused. Measured live and quoted in section 2, and
independently visible in `providerKeyCount()` (counts non-empty env values for
`ZAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `MOONSHOT_API_KEY`,
`OPENAI_API_KEY`, each with `_2` .. `_16` suffixes) and `refusedKeyCount()`.

The XCOM mapping is exact and should be drawn exactly:

- A satellite gives **coverage**. No credential, no bee, no work on that node,
  whatever the backlog says.
- A satellite can be **shot down**. `keyIsLive()` sends one 1-token request and
  reads 401, 403, or a body containing `1113` / `Insufficient balance` as
  death. Measured 2026-09-03: two of four keys answered 429 with Z.AI business
  code 1113.
- A dead satellite is **not** capacity. The refusal string quoted above exists
  because the two numbers were once one, and the operator was told to buy a
  fifth key while holding two dead ones.
- The cache is process-lifetime, deliberately. A restart is the retry after a
  top-up. In the game: a downed satellite comes back on the next deploy, not on
  the next round, and the panel should say that rather than let the player
  click hopefully.

Satellite panel, four slots, states: `live` / `refused` / `busy` / `empty`.
Two live, two refused, right now.

### 4.3 Interceptors - bees

One bee per live credential, capped by `MAX_CONCURRENT_WORKERS = 4` in RING-00.
Ceiling today is `min(live keys, 4) = 2`. The existing `/queen/hq` page already
draws this correctly - one cell per fillable slot, dashed "no key" cells for the
rest - and that drawing should survive into the game unchanged.

A bee is **one model turn**. Not an agent, not a session. It gets its own
worktree, its own conversation, no access to the Queen's history, a brief with
the issue body inlined (because it cannot fetch it - no `gh` in the image, and
`GITHUB_TOKEN` is excluded from the tool shell's ten-entry environment
allowlist), and a boundary it may not write outside.

Air combat, in this system, is the review. The bee comes back with a VERDICT
block; `review_verdict` decides whether it landed.

### 4.4 The Council report - the round

`SCAN FOR ACTIVITY` is already implemented: `POST /queen/lease/tick`, wired to
the "run a round now" button on `/queen/hq`. It is the only mutating control
either page offers, and that restraint is correct.

The round is 300 s. Measured twice, 299.94 s apart. So the game's clock is a
five-minute turn, and there is no need to invent time compression: a player who
sits and watches sees roughly twelve council reports an hour.

### 4.5 Engineering - what can actually be built

Not a workshop with a queue. A **capability matrix**: rows are issues, columns
are nodes, a cell is green when the node has every capability the issue's work
needs. Today the matrix has two columns and a lot of empty cells.

The deliverable a bee produces is a commit on a branch. Not a push, not a PR,
not a build artifact. That is the honest engineering output and the panel
should say "commit" where XCOM says "Item Complete".

---

## 5. PROOF OF COMPUTE

The operator named this as the economy. Here is the precise answer.

### What is proven today: nothing

There is no proof of compute in this system. Stated exactly, in the four terms
the question deserves:

**What is proven.** That a text stream arrived from a provider endpoint, that a
git branch in one container's filesystem differs from `origin/dev` by a list of
file names, and that a bee wrote lines saying `met` / `unmet` /
`could-not-check` next to criteria.

**By whom.** By the container, to itself. There is no second observer. The
strays check, the file count, and the verdict all run in the same process that
dispatched the work.

**To whom.** To nobody. `/queen/public-board` and `/queen/status` publish
counts. A reader cannot check any of them.

**What a proof is worth.** Nothing, because it is not one. Four specific gaps,
each verified rather than asserted:

1. **No commit identity is recorded.** `grep -rn "commit_sha\|commitSha"` over
   `queen-tick.ts`, `queen-dispatch.ts` and `pg-migrate.ts` returns nothing.
   The schema stores `branch text`, and a branch name is not a content hash.
   Two runs producing different trees are indistinguishable in the record.
2. **The artifact is destroyed on redeploy.** `WORKSPACE_DIR=/workspace` is on
   the container's own overlay layer. The Dockerfile records the measurement
   made on 2026-08-31 - `df -h /workspace` returns `overlay`,
   `mount | grep workspace` returns nothing, `railway volume list` shows one
   volume and it is on Redis - and names a commit already lost that way:
   `e52f41ad`. I did not re-verify this today, because I may not run
   `railway`; the measurement is theirs, dated, and in the tree.
3. **The judge and the judged are the same kind of thing.** The bee writes its
   own verdict block; the policy is a pure integer function over what the bee
   claimed. Open issue #1127, in the repository, is titled (translated):
   "judge and defendant are one model: the reviewer should be an adversary."
   The one independent measurement in the loop is
   `git diff --name-only`, which counts files and cannot tell whether they are
   any good.
4. **There is no attestation of any kind.** No TEE, no signing, no
   reproducibility check. Grepped `apps/` and `packages/` for `attestation`,
   `TEE`, `SGX`, `zk`; every hit is in browser-benchmark CSV data, none in the
   supervisor path.

Token counts are the closest thing to a receipt and the code is already honest
about them: `input_tokens` and `output_tokens` are nullable, they are set to
NULL on re-dispatch so a second attempt cannot inherit the first one's price,
and the memory rule attached to this subsystem is "token counts of 0 mean the
provider sent no usage, not that the bee was free. Omit, do not print zero."
A number the counterparty supplies about its own billing is a bill, not a
proof.

### The smallest thing that would be a proof

One sentence: **have a second machine, in a different trust domain, reproduce
the tree hash and re-answer the criteria.**

Concretely, four changes, in dependency order:

1. `ALTER TABLE queen_dispatch ADD COLUMN commit_sha text, ADD COLUMN tree_sha
   text;` and write both at the moment the bee's turn ends, from
   `git rev-parse queen-<issue>` and `git rev-parse queen-<issue>^{tree}`. This
   is the smallest step and it is worth doing alone: it converts "a branch
   existed" into "this exact content existed".
2. Export the work as a patch bundle addressed by that hash. The Mac already
   replays patches - the Dockerfile calls it "proven end to end" - so this is
   formalising a path that runs, not building one.
3. The Mac recomputes the tree hash from the patch and records agreement or
   disagreement. Two independent machines agreeing on a content hash is a real
   claim about compute, and it is the strongest one this architecture can make
   without new cryptography.
4. The Mac re-answers the acceptance criteria without seeing the bee's verdict
   block, and the two answers are stored side by side. Disagreement is the
   interesting signal and it is currently invisible.

**A proof, once that exists, is worth exactly one thing: the right to be
counted.** A node whose replayed hash matches is a node whose contribution
enters the totals. A node that cannot replay is drawn on the map, greyed, with
the reason on it. That is the entire economy, and it is defensible because
every term in it is a hash comparison somebody can rerun.

Anything beyond that - tokens, staking, a market for cycles - is not designed
here and should not be drawn on the page. A currency backed by a
self-attestation is not a currency.

---

## 6. The research tree

Two graphs exist. They do not agree, and the disagreement is the interesting
part.

### 6.1 The technology tree (shipped)

`.trinity/dashboard/tech-tree.json`, rendered at `/queen/tree`. Measured:

```
40 nodes, 48 edges, 12 conflicts, 14 stale skills
status: shipped 13, partial 11, blocked 13, planned 3
layer:  ring 12, supervisor 11, runtime 7, seed 6, interface 3, silicon 1
```

Every node carries an evidence string - a file:line, a command's output - and
the page shows it. **Keep that rule absolutely.** It is the difference between
a research tree and a wish list, and this repository has a documented history of
the latter.

Note the shape: 13 blocked against 13 shipped, and exactly **one** node in the
silicon layer. In XCOM terms, the tree is mostly greyed out and the hardware
branch has a single entry. That is a legible, dramatic tree. Do not pad it.

### 6.2 The roadmap (not shipped)

`.trinity/dashboard/roadmap.json`. Measured:

```
11 epics, 58 planned issues, 7 milestones, 29 definition-of-done items, 0 done
source: Queen_T27_MVP_Architecture.md, 91776 bytes, inGit: false
```

The `/queen/roadmap` route header states that zero of the 58 planned issues
exist on GitHub and zero of the open issues belong to an epic. I verified the
counts (11 / 58 / 29 / 0 done) from the JSON; I did **not** re-verify the
zero-intersection claim.

A progress bar over this would render 0% next to a swarm that has been working
all day. The existing page refuses to draw one and shows the two columns side
by side instead. The game must inherit that refusal.

### 6.3 The rings are the unlock chain

`ls rings/` gives: `RUST-00` .. `RUST-14`, `RUST-99`, `SR-00` .. `SR-02`,
`T27-00`, `T27-01`.

- **T27-00 exists and executes.** `queen_core.t27` plus a generated Rust file
  plus a shim. The Dockerfile compiles both with bare `rustc` and then runs
  sixteen assertions against the binary during the build, including a check
  that the constant count matches `grep -c '^pub const'` on the generated file
  rather than a number somebody typed. It runs again in the runtime image.
  This is a shipped unlock with a gate on it.
- **T27-01 is source only.** `ls rings/T27-01/` returns exactly one file,
  `a2a.t27`. No `generated/`, no `shim/`. Researched, not built.
- **T27-02 does not exist.** Open issue #1331 is titled "RING-00 runs in
  production and decides nothing; T27-02 does not exist."

That is a three-state tech node - shipped / researched / absent - taken
straight from the filesystem. No hand-maintained status table.

---

## 7. The player's loop, minute by minute

The round is 300 s. This is the loop as a real person performs it.

**Minute 0 - the situation reads itself.**
One sentence at the top, in the largest type on the page. The existing HQ page
already computes it and the wording is right:

- `2 bees are working right now.` or
- `Nothing is running, and 5 issues are ready.` or
- `Nothing is running, and there is nothing she may start.` followed by the
  Queen's own refusal string, verbatim.

The player is not asked to interpret gauges before being told the answer.

**Minute 0-1 - the map.**
Two lit nodes. Panic overlays on each: the sum of panic from the issues that
would route there. Seven cards flagged as unroutable - no lit node has
`swift-build` or `screen`. Two satellite slots green, two red.

**Minute 1-3 - the one decision.**
There is exactly one interesting question per round and it is always the same:
*what is stopping the next bee?* The board can answer it, and the answers are
disjoint and each has a different fix:

| The answer | Live count | What the player does |
| --- | --- | --- |
| Nothing is stopping it | - | nothing; watch |
| No credential can pay | 2 of 4 refused | top up the account, then redeploy (the liveness cache is process-lifetime) |
| The issue names no files | 18 of 23 backlog cards carry `needs` | write a boundary into the issue |
| Its files are held by a card in review | 12 in review | give a verdict, or wait out the 48 h |
| It needs a build or a screen | 7 of 23 (per issue #1330) | run it on the Mac, or add a node with that capability |

Those five rows are the game. Everything else is presentation.

**Minute 3-4 - the act.**
Zero to one action. Press `run a round now`, or open the issue and give it a
boundary, or answer an escalation. All three are already possible; only the
first is on the page today.

**Minute 5 - the report.**
The round fires. `decidedAt` moves. Something entered `running`, or the refusal
string changed, or neither and the refusal string is identical - which is
itself the reading, and the page should say "unchanged for N rounds" rather
than re-rendering the same sentence as if it were news.

**The player never has to click for progress.** That is the constraint the next
section is about.

---

## 8. What is automatic

This supervisor is autonomous. A game where the player must click to make
progress would fight the thing it is visualising. So:

Automatic, no player involvement, verified in the source:

- The round itself, every 300 s, under a fenced lease so two containers cannot
  both be Queen.
- Issue selection, by `queend`, with a written reason per skipped candidate
  (`skippedCount: 42` on the last live tick, and each reason lands on the card
  as `whyNotChosen`).
- Boundary reservation and release, including the 48-hour ageout.
- Dispatch, brief composition, criteria extraction from the issue body, and
  the fallback that makes the bee state its own criteria when the issue names
  none - recorded as the bee's criteria, not the author's.
- Transcript capture into `queen_transcript`, coalesced.
- Review: verdict block parsed, `git diff` run, five integers to RING-00,
  verdict written with the send-back counter incremented in the same statement.
- Send-back accounting and escalation at `MAX_SEND_BACKS = 2`.
- Stalled-worker reaping.
- Credential liveness probing before an issue is spent finding out.

The player's levers, and there are only four:

1. **File an issue with a boundary and acceptance criteria.** This is the real
   move and the numbers say so: 5 of 23 backlog cards are startable, 18 are
   not, and 61 of 86 cards carry no criteria count at all.
2. **Top up or add a credential.** Raises the interceptor ceiling.
3. **Answer an escalation.** The only verdict that reaches a person.
4. **Run a round early.** Skips the wait, changes nothing else.

Everything else the player does is *reading*. Design the page for reading.

---

## 9. Failure states

A game with no way to lose is a screensaver. These are real, and four of the
six have already happened in this system.

**F1 - Starvation.** The backlog of startable work reaches zero and the swarm
idles at full capacity. Live: 5 startable issues, 2 bees, 12 rounds an hour.
Open issue #1327: "The Queen cannot refill her own backlog, so the swarm stops
within the hour." *Lose condition: startable == 0 for N consecutive rounds.*

**F2 - Blackout.** Every credential is refused. Ceiling drops to zero. Live:
half way there. The existing HQ page already renders the terminal state - "This
deployment holds no provider key, so no bee can start at all." *Lose condition:
live keys == 0.*

**F3 - Verdict deadlock.** Cards accumulate in review, each holding its
boundary, blocking every overlapping issue. Live: 12 in review. The migration
comment records the precedent: "#1286 held one for five days." *Lose condition:
blocked-by-review exceeds startable.*

**F4 - Escalation pile.** Escalate is the only verdict that reaches a person,
and the operator has said in plain terms that they must not be the bottleneck.
Open issue #1332: "Every escalation waits for a person, including the ones
caused by a bad issue." *Lose condition: unanswered escalations rise for a
whole day.*

**F5 - Amnesia.** A redeploy destroys `/workspace` and every uncommitted-out
branch with it. One commit is already recorded as lost this way. *Lose
condition: a dispatch whose branch no longer resolves.* This is the failure the
proof-of-compute work in section 5 removes, which is a good argument for doing
it.

**F6 - The instrument lies.** The board reports something that cannot be true,
and the player optimises against a phantom. See the next section; there is a
live example.

This is the XCOM structure faithfully: you do not lose to a single event, you
lose to several meters drifting while you were reading a different one.

---

## 10. Instruments that lie today

Fix these before they become game meters. Each is measured.

**"rounds / 24h" can only ever read 0 or 1.** The gauge is
`SELECT count(*) FROM queen_tick WHERE decided_at > now() - interval '24 hours'`.
`queen_tick` is declared `name text PRIMARY KEY` and is written by an upsert on
conflict, so the table holds one row per lease name. Live value: `rounds: 1`,
next to `roundSeconds: 300`, which implies up to 288. I proved the overwrite by
polling twice: `decided_at` moved from `07:07:30.021Z` to `07:12:29.963Z` and
no second row can exist. A player reading "1 round in 24h" would conclude the
Queen had stopped. She had not. **Fix: an append-only `queen_round` table, or
delete the gauge.**

**"dispatches: 42" is not 42 bee turns.** `queen_dispatch` is keyed
`issue int PRIMARY KEY`, so it holds one row per issue ever touched, and a
*refusal* writes a row too - with `started = false` and `finished_at = now()`,
deliberately, so a refusal does not look like work in progress. The live
"latest dispatch" was a refusal. Prior attempts survive only as jsonb snapshots
in `queen_dispatch_history`. **Fix: count turns from the history table, and
label the current number "issues touched".**

**"finished: 40" counts refusals as finished.** Same cause. The public status
route filters on `finished_at IS NOT NULL` alone.

**Zero is not absent.** The rule is already written into this subsystem's
memory and it must survive into the game: `committedFiles == nil` means "not
tallied yet", not zero; token counts of 0 mean the provider sent no usage.
Render a dash, never a zero.

**The page does not fit.** The operator's report was that it does not fit
horizontally, said in Russian. I could not
reproduce their viewport, so I checked the mechanism instead:
`queen-hq.ts` contains **zero** `word-break` or `overflow-wrap` declarations
(`grep -c`, measured), and it renders the Queen's refusal string inside a
`<code>` element in a monospace font. The live refusal string is 176
characters. A long path list or an unbroken identifier in that element will
push the layout wider than the viewport with nothing to stop it. The kanban
`.board` grid is `repeat(auto-fit, minmax(240px,1fr))` and wraps correctly, so
it is not the columns. **Fix: `overflow-wrap:anywhere` on every element that
renders a machine-generated string.**

---

## 11. Layout: tabs at screen height

The operator asked for tabs, each sized to the screen. Five, in the order a
person needs them:

```
+--------------------------------------------------------------+
| MISSION CONTROL | COUNCIL | RESEARCH | ENGINEERING | RECORD   |
+--------------------------------------------------------------+
```

1. **MISSION CONTROL** - the verdict sentence, the node map, the satellite
   strip, the interceptor cells, the next-round clock. This is the tab that is
   open by default and it must answer "why is nothing happening" without
   scrolling.
2. **COUNCIL** - one row per node, one row per credential: capability set,
   panic contribution, coverage, last seen. The XCOM Situation Room.
3. **RESEARCH** - `/queen/tree`, unchanged in substance: 40 nodes, evidence
   strings visible, 12 conflicts shown rather than resolved. Plus the ring
   chain T27-00 / T27-01 / T27-02 read from the filesystem.
4. **ENGINEERING** - the capability matrix. Issues by node, green where
   routable, and the seven unroutable cards called out.
5. **RECORD** - the board, the feed, the transcripts. The existing kanban.

Layout rules, each with a reason from something that already broke:

- `height: 100dvh` on the tab body, one internal scroll region, never a page
  scroll. `dvh` because mobile toolbars make `vh` wrong.
- Every tab renders at 400 pt wide without loss. The memory file for WAVE-068
  records "supervisor UI invisible at 400pt" as a real defect.
- `overflow-wrap: anywhere` on every machine-generated string.
- Draw functions **assign** into permanent nodes, never append. The kanban's
  flow strip was spliced in on each redraw and an hour-old tab carried 120
  copies of the legend; the HQ route header documents it.
- No state in the HTML. Every number arrives from a token-guarded fetch.
  `/queen/kanban` once served 57 cards and every bee's detail to an
  unauthenticated reader.
- `[hidden]{display:none !important}` must be present. The `hidden` attribute
  is a UA rule and loses to any author `display` rule; that exact bug left a
  token form on screen with 57 cards behind it.

### The globe, honestly

t27.ai already ships three.js: `https://t27.ai/assets/three-C7rSOEFP.js`, 918,770
bytes as transferred with no compression negotiated (measured with
`curl -o /dev/null -w '%{size_download}'`). So a 3D node graph is reachable
without adding a dependency to that app.

But the Queen pages are server-rendered HTML strings inside TypeScript route
files - 118,259 bytes across the six of them - with no bundler and no npm
dependency in the page. Adding three.js there is a new build step for the
supervisor server.

Recommendation, and it is a recommendation because I did not benchmark either
option: **build tab 1 in SVG first.** Two nodes and four satellite slots do not
need a renderer, an SVG has no build step and no WebGL failure mode, and the
node count would have to grow by an order of magnitude before three.js earns
its 918 KB. If the map ever reaches dozens of nodes, port that one tab to the
SPA that already bundles three.js.

---

## 12. Implementation order

1. **Fix the lying instruments** (section 10). A game built on a meter that
   cannot rise teaches the player something false. This is one migration and
   two label changes.
2. **Tabs and the height constraint** (section 11). Fixes the operator's
   immediate complaint and costs no new data.
3. **The node map from real capabilities** (section 3). Two nodes, four
   satellite slots, seven unroutable cards. All data already exists.
4. **Panic bands** (section 4.1). Needs `created_at` on the board payload and
   `send_backs` exposed; both are already in the database.
5. **The capability matrix** (section 4.5). Needs a capability declaration per
   node - a small static table to start, since there are two nodes.
6. **`commit_sha` and `tree_sha`** (section 5, step 1). The first thing in this
   whole document that is a real step toward proof of compute, and the cheapest.

Steps 1 through 5 are presentation over data that exists. Step 6 is the only
one that changes what the system knows about itself.

---

## 13. What I measured, and what I could not

**Measured, with the command:**

- Live scheduler and round cadence: `/queen/status` polled at 07:11:28Z and
  07:16:59Z; `decidedAt` moved 07:07:30.021Z -> 07:12:29.963Z, 299.94 s apart;
  `intervalSeconds: 300`.
- Live board: `/queen/public-board` - 86 cards, done 41, backlog 23, review 12,
  dropped 8, running 2; pulse `rounds:1, bees:14, verdicts:12`.
- Backlog composition: 5 backlog cards with criteria and no `needs`, 18 with
  `needs`, 61 of 86 cards with no criteria count.
- Credentials: the live refusal string, quoted in full - 4 configured, 2
  carrying a bee, 2 refused.
- Issue ages: GitHub API, 42 open non-PR issues, min 0 / median 16 / max 125
  days, 12 over 30 days, 25 over 7 days.
- `/queen/board` unauthenticated returns 403; `/health` returns ok.
- Tech tree: 40 nodes, 48 edges, 12 conflicts, 14 stale skills, statuses and
  layers as tabulated.
- Roadmap: 11 epics, 58 planned issues, 7 milestones, 29 DoD items, 0 done,
  source 91,776 bytes and `inGit: false`.
- Rings on disk: T27-00 with generated and shim, T27-01 with `a2a.t27` alone,
  no T27-02.
- RING-00 constants and `review_verdict` signature, read from the `.t27` source.
- This Mac: Apple M1 Pro, 8 cores, 17,179,869,184 bytes RAM, arm64.
- No Digilent/FTDI/Xilinx USB device attached to this Mac.
- No `commit_sha` / `commitSha` anywhere in the dispatch, tick or migration
  source. No attestation primitive in `apps/` or `packages/` outside benchmark
  data.
- `queen_tick` declared `name text PRIMARY KEY`, written by upsert.
- `queen-hq.ts`: 0 occurrences of `word-break` or `overflow-wrap`.
- Queen route sources: 118,259 bytes across six files.
- t27.ai assets: `three-C7rSOEFP.js` 918,770 bytes, `react` 209,091,
  `index` 265,409, all HTTP 200, uncompressed transfer.
- UFOpaedia Mission Control and Council pages, fetched and read; the 8-of-16
  withdrawal rule and the 1..5 panic scale are quoted from them.

**Not measured, and why:**

- The container's CPU, RAM and cost. I have no shell in it and I may not run
  `railway`.
- Whether `/workspace` is still on an overlay with no volume. The measurement
  in the Dockerfile is dated 2026-08-31 and is not mine; I could not re-run it.
- Any frame rate, render time, or bundle-parse cost for three.js versus SVG. I
  ran no benchmark, so the recommendation in section 11 is an argument from
  node count, not a measurement.
- The operator's actual overflow. I could not see their viewport. I identified
  a mechanism that is consistent with it and did not confirm it is the cause.
- The claim in the `/queen/roadmap` header that the 58 planned issues and the
  open issues do not intersect at all. I verified the counts, not the
  intersection.
- Whether a Zynq XC7Z020 answers over JTAG. Nothing is attached to this Mac,
  and the boards belong to another agent's territory.
- Any calibration of the proposed panic bands. No threshold here has been
  tested against an outcome; they are a starting point to be tuned against the
  record, not findings.
- Historical accept/send-back/escalate distribution. It lives in
  `queen_dispatch_history` behind the bearer token, which I do not hold.
