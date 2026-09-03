# STUDY 5 - The mining economy

Written 2026-09-03 between 11:10Z and 11:15Z (18:10-18:15 local, UTC+7). Read-only against four checkouts; scratch lived in `/tmp/mine-study` (a 2 KB pure-Python keccak for ABI selectors, one 60 KB HTML fetch) and `/tmp/pubboard.json` (11,715 B), all deleted at the end. Load averages during the timed reads, 8 cores: 13.12 / 13.02 / 11.95 at start, 17.26 during the `/queen/status` fetch, 13.20 during the `/queen/tree` fetch, 15.56-15.95 during the RPC reads, 12.46 at the end. Every network timing below was taken on a machine that loaded; it bounds nothing.

This study does not restate `territory-economy.md` (§4 proof units, §4.5 the attack table, its prohibition), `queen-mission-control.md` §5 (nothing is proven today) or `evolving-bees.md` (stages are pure functions of ledger integers). It takes them as law and answers one question: **what do the bees mine, and how does the game start from mining without turning a proof unit into a mint.**

Labelling: **measured** = I ran it today, command given. **read** = I read it in a file today. **derived** = arithmetic over measured or read numbers, shown. **SYNTHETIC** = does not exist.

---

## 0. The three sentences the rest hangs on

1. `territory-economy.md` §4.5: *"Do not attach a transferable token to a proof unit. A4 is a mint."* A4 (rent a cloud box, claim it from your holding) is **invisible** to every check in the design. **Nothing in this study makes A4 visible, so the wall between in-game resource and TRI stays up.** (§3 below.)
2. `TrinityToken.sol` has **no mint function a game could call.** `_mint` is reached from exactly two places: the constructor (liquidity) and `claimVested()` (five addresses fixed at deploy). No owner, no role, no hook. (§4 below, quoted.)
3. The supervisor already runs a two-resource economy in integer micro-dollars and integer slots. The design below names the yield of that economy, not a new one.

---

## 1. THE RESOURCE

### 1.1 The pick: MINERALS = accepted turns, GAS = proof units

StarCraft's shape is: one resource every worker gathers from the first second (minerals, plentiful, linear in worker count), and one that needs a structure built on a scarce site before a single unit arrives (gas, gated). The supervisor has exactly that pair already, one measured and one not.

| | MINERALS | GAS |
|---|---|---|
| **unit** | one turn whose review landed `accept` | one PROOF UNIT (§4.1 of the economy study): an artifact whose digest a second trust domain recomputed and agreed with |
| **column today** | `queen_dispatch.review_state = 'accept'`, stamped by `reviewed_at` (read: `queen-tick.ts:1633-1635`, values `accept` / `sendBack` / `escalate` at lines 397-398) | **none.** `grep -rn "commit_sha\|commitSha\|tree_sha"` over `agent-server/apps/server/src` finds nothing (read, confirmed by the economy study's own grep today) |
| **who deposits it** | the tick, when `review_verdict(total, judged, unmet, committed_files, prior_send_backs)` returns `REVIEW_ACCEPT` (read: `rings/T27-00/queen_core.t27:112-135`) | a *different holding* replaying `git rev-parse queen-<issue>^{tree}` and matching (SYNTHETIC) |
| **why plentiful / scarce** | every bee that finishes with a non-empty diff and all criteria met yields one; linear in bee-turns | requires the refinery (§1.3); zero exist and the ARCHON stage in `evolving-bees.md` §2.3 is drawn empty for the same reason |
| **public today** | partly: `pulse.verdicts` (all three kinds, 24 h) and the `done` column (44 cards, "accepted or merged", lifetime) | no |
| **stock today** | lifetime `done` = **44** cards (measured: `/queen/public-board` at 11:11Z, 83 cards: done 44, backlog 18, review 13, dropped 8, running 0). 24 h: `verdicts` = 16, `bees` = 15 (measured, same fetch) | **0** |
| **one named change** | split `verdicts` in `publicBoardProjection` (`queen-kanban.ts:105-125`, read) into `accepted / sentBack / escalated` - three integers, no more operational than the one it replaces | `ALTER TABLE queen_dispatch ADD COLUMN commit_sha text, ADD COLUMN tree_sha text, ADD COLUMN replayed_by text` - step 1 of `queen-mission-control.md` §5, unchanged; `replayed_by` is the holding id of the second trust domain |

Why accepted turns and not the other candidates:

- **Finished dispatches** (`dispatches.finished = 43`) count refusals. Measured today: the latest dispatch is issue 1329 with `dispatchedAt == finishedAt == 2026-09-03T07:32:30.137Z` and a refusal string as its outcome. A refusal that finishes in 0 ms is not a mineral. `finished_at IS NOT NULL` is the public SQL (read: `queen-public-status.ts:69-71`).
- **Review throughput** (`verdicts`) counts `sendBack` and `escalate`. A send-back is a trip that came home empty.
- **Worker-seconds**: wall time is the contributor's word (§4.4 item 1 of the economy study). Not a resource; not even a measurement.
- **Accepted turns** are the only count that has already passed a shipped filter against the cheapest fake: `review_verdict` returns `REVIEW_ESCALATE` when `unmet <= 0 && committed_files <= 0` (read: `queen_core.t27:125-128`). That is attack A2 stopped in the resource's own definition.

### 1.2 The two ceilings are SUPPLY, and they are not mined

StarCraft has a third number that is not a resource: supply. The supervisor has two, both shipped:

| ceiling | value | source | how it rises |
|---|---|---|---|
| **SLOTS** | `free_slots(running)`, max **4** | `MAX_CONCURRENT_WORKERS: i32 = 4` (read: `queen_core.t27:37`) | a commit to the ring and a deploy; tree node `bee-ceiling` ("cap 4 -> 19") is `planned` (measured: 40-node tree at 11:13Z) |
| **RATION** | `SwarmBudget.dailyLimitUSD` = **10,000,000 micro-dollars** | read: `ModelPricing.swift:101` | `TRIOS_SWARM_DAILY_CAP_USD` or the knob file, no route (C4 in `evolving-bees.md` §5.2) |

Today: slots 0/4 used, ration `b = 1.137` (derived in the economy study from the live refusal string, which was unchanged at 11:08:19Z: *"about $11 today, $1.37 past its $10 daily limit"*, measured).

### 1.3 The refinery, named

A gas geyser is a site; a refinery is the building that makes it yield. Here:

- **Geyser** = a holding in a different trust domain from the container. Today that is the Mac (L3 in the economy study's board) - different OS, different architecture, different operator surface.
- **Refinery v1 (CPU)** = the `commit_sha`/`tree_sha` columns plus the Mac fetching the bundle and recomputing the tree hash (§4.3 "CPU - tree replay", four steps, read). Cost: one migration and one script on the Mac side. Yield: one gas per accepted turn that replays.
- **Refinery v2 (FPGA)** = `review_verdict` in LUTs answering the same five integers, which the economy study §3.2 grounds in the Verilog target of RING-00 and the BSCANE2 nonce readout (read; both FPGA lands dark today, one USB device attached, an iPhone - the economy study's measurement, not re-run here).

Gas therefore has the StarCraft property exactly: **zero until you build the thing, then linear in accepted turns that survive replay.**

### 1.4 Is there a third resource from the three hardware classes? No, and here is why

The three classes (CPU judges and pays rent; FPGA can be a second judge; GPU can produce for free) are **three sources with three prices, not three resources**. They are the race asymmetry, not a third bar:

| class | what it mines | price per unit |
|---|---|---|
| CPU, rented (L2) | minerals | rent: `estimatedCost` in micro-dollars, list rates (read: `ModelPricing.swift:38-46`) |
| GPU, local (L4) | minerals | **0** by construction: `freeProviders = ["ollama","lmstudio","llamacpp"]` priced at zero before the table is consulted (read: line 51-54) - and unreachable today because none of the five `WORKER_PROVIDERS` is local (read: `queen-dispatch.ts:46-64`) |
| FPGA (L5, L6) | gas (as the second judge) | a bitstream load, a CPU job |

The only class-specific quantities that could be a third bar - FPGA loads per day, GPU seconds per day - are marked SYNTHETIC in the economy study's own table (§2.3): nothing counts them. A third resource would be an unmeasured bar, which is the one thing this repository's memory forbids. The place the classes *do* appear is the sovereignty score `σ` - minerals mined at zero rent over minerals mined - and that is already designed (§5.1 of the economy study). Two resources, two ceilings, one score.

---

## 2. THE MINER

### 2.1 What a bee that mines is doing

A mining trip is one `queen_dispatch` row with `started = true`, and it is already a five-step loop in shipped code:

1. **Leave the hive.** The tick calls `askQueend({kind:'choose', candidates, tasks: openingBoard})` (read: `queen-tick.ts:1150-1156`) and `resolveWorkerProvider(takenKeyIndices)` hands out `(provider, key_index)` - a key that is busy or refused is *"not a key: handing it out again spends an issue to learn the same fact"* (read: `queen-dispatch.ts:255-262`).
2. **Walk to the field.** The bee is given `owned_paths` - its boundary (read: `pg-migrate.ts:153-165`). The field is the issue.
3. **Gather.** One model turn. `input_tokens` / `output_tokens` are written with `finished_at` so the turn is priced (read: `pg-migrate.ts:201-207`).
4. **Return.** The next tick judges it: `review_verdict` over five integers.
5. **Deposit.** `review_state = 'accept'`, `reviewed_at = now()` - one mineral. `sendBack` bumps `send_backs` and the bee goes out again with the same boundary; `escalate` hands the field to a person.

The bee's sprite has exactly these five states and nothing else. `evolving-bees.md` already binds stages to the same columns (`accepted`, `cleanAccepts`, `rescues`), so a bee that has deposited once is a FORAGER and the sprite change is not a new rule.

### 2.2 Ground truth for the miner, today

| fact | value | how |
|---|---|---|
| issues ever touched | 43, all `finished`, 0 `running` | measured, `/queen/status` 11:08:19Z decision, HTTP 200 in 6.23 s at load 17 |
| keys | 4 configured: 1 carrying a bee, 3 refused by the provider | measured, `dispatches.latest.outcome` |
| ration | exhausted, `$1.37` over `$10` | measured, `lastTick.refusal` |
| `skippedCount` | 0 - the budget gate fired before the issue loop | measured |
| verdicts / bees in 24 h | 16 / 15 | measured, `pulse` |
| the one mineral line | one key of one provider (`zai` / `glm-5.3`, first in preference order) | read: `WORKER_PROVIDERS[0]` |

So the swarm today has **one worker on one mineral patch, and the patch is fenced off by the ration.** Three of its four keys are refused - in StarCraft terms three workers standing idle next to the field.

**What one ration buys, per model** - the turn shape 30k in / 6k out is **SYNTHETIC** (the economy study's assumption; real counts are behind the bearer token); prices are read from the table:

| model | per turn (derived) | trips per $10 (derived) | binding ceiling at 4 slots, 300 s rounds |
|---|---:|---:|---|
| `glm-5.3` -> `glm-5` | 31,200 micro-$ | ~320 | slots: 4 trips/round x 288 rounds/day = 1,152 > 320, so ration binds |
| `claude-sonnet-4-5` | 180,000 micro-$ | ~55 | ration |
| `gpt-5` | 97,500 micro-$ | ~102 | ration |
| `kimi-k2-0905-preview` | **unpriced -> contributes 0** | unbounded | neither - the E2 hole; the game must draw this line dotted, never as free minerals |

(288 rounds/day = 86,400 / 300, derived. Whether a turn finishes inside one 300 s round I could not measure: the only public duration is a refusal's 0 ms. The tree node "Dispatch: worktree, real model turn, recorded outcome, **2h reaper**" is the upper bound, read.)

### 2.3 "Start the game by mining" - the first tick

There are two honest openings, and today the game gets the second one.

**Opening A - the ration is fine.** t = 0: the tick's `decision` says `allowed: true`, `chosen: <issue>`. A dispatch row appears with `started = true`. One bee sprite leaves the hive cell for the chosen issue's cell. Supply reads 1/4. Minerals do not move yet - the deposit is a *review*, which is the next tick at the earliest (t = 300 s), and only if the turn has finished. The first mineral is therefore never earlier than the second round. That delay is real and the game must not fake it with a trickle.

**Opening B - today.** t = 0: `allowed: false`, `skippedCount: 0`, refusal about money. No bee leaves. The map is the economy study's §2.6 picture: two blue lands hatched shut, four grey. The first decision arrives at **0:00**, not later, and it is the operator's, not the player's: raise the cap (C4), which no public route can do. The game says this in the cause line (`'ration'`, the four-line discriminator in §5.2 of the economy study), and shows the three refused keys as three idle workers with the reason on them.

A StarCraft game that starts with "you cannot mine until someone outside the game pays" is not a broken opening; it is the true opening, and the page has to say so in words rather than animate a worker that is not moving.

---

## 3. IN-GAME versus ON-CHAIN - the wall

### 3.1 The in-game side, fully

Minerals and gas are **non-transferable integers derived from database columns.** They have no balance a player owns, no transfer, no address. They drive three things and only three:

- **the map**: a cell's state (§5.3), the bee sprites, the land colours already specified;
- **research**: whether a tech node draws its "sealed" ring (§5.2);
- **unit production**: shown, never bought, by the player (§5.1).

The client keeps no ledger. Every number on screen is recomputable from `/queen/status`, `/queen/public-board` and (behind the token) `queen_dispatch`. A number that cannot be recomputed from a row is not drawn - the E5 rule against `.tri-cluster.json`, inherited verbatim.

### 3.2 What would have to be TRUE before one unit could convert to TRI

Four conditions, each checked against §4.5's attack table:

| # | condition | attack it answers | status |
|---|---|---|---|
| C-a | the unit is a proof unit: `(subject, digest)` recorded, digest recomputed by a second trust domain, stored once | **A1 replay** - stopped, because a unit is keyed on `(subject, digest)` and a second submission is a duplicate | needs the refinery (§1.3); zero units exist |
| C-b | the unit has a non-empty diff and every criterion judged | **A2 empty claim** - stopped by shipped `review_verdict` (`committed_files <= 0` escalates) | true today for minerals |
| C-c | one holding = one physical substrate | **A3 sybil** - *noticed, not stopped*: the only tell is proof timestamps interleaving tighter than one device sustains, a heuristic the study refuses to act on automatically | false; there is no holding table, no contributor id, no host fingerprint (read, economy study §1.2) |
| C-d | the unit was computed on the holding that claims it | **A4 outsourcing** - **invisible**: the claim's signature binds a key, a key travels, IDCODE names a part type not a die, no per-device secret, no eFUSE key in use | false, and no change in this study touches it |

C-d is worse here than in the abstract: **the honest network's own bees already run on rented cloud** - L2 RENTED spent 100 % of the $11.37 (read). The attack and the current honest behaviour are the same bytes. A converter cannot tell them apart because there is nothing to tell apart.

**The sentence for the user:** A4 is still invisible - nothing in this design can tell a bee that ran on your hardware from one that ran on a rented box - so in-game minerals and gas never convert to TRI, and the game says that on the resource bar rather than hiding it in a roadmap.

### 3.3 And even with the wall down, there is nowhere to send it

Independently of A4: the deployed contract has no function that could receive a game's claim (§4). Conversion would need a *new* contract. That is a second wall, and it is the one that would come down first if somebody redeployed carelessly - which is why §4 is written out in full.

---

## 4. THE CONTRACT AS IT IS

`/Users/playra/trinity/deploy/contracts/src/TrinityToken.sol`, 196 lines, read in full. `pragma solidity ^0.8.20`, inherits OpenZeppelin `ERC20` and `ERC20Permit`, nothing else - no `Ownable`, no `AccessControl`, no `Pausable`, no `ERC20Burnable`.

### 4.1 Who can mint

Two call sites of `_mint`, and they are the whole answer.

Constructor, once, at deploy:
```solidity
// Mint liquidity immediately (no vesting)
_mint(_liquidity, LIQUIDITY_ALLOCATION);
```

And the one external path:
```solidity
function claimVested() external {
    uint256 vested = vestedAmount(msg.sender);
    uint256 claimable = vested - claimed[msg.sender];

    require(claimable > 0, "Nothing to claim");

    claimed[msg.sender] = vested;
    _mint(msg.sender, claimable);

    emit AllocationClaimed(msg.sender, claimable);
}
```

`vestedAmount` returns 0 unless `totalVested[beneficiary] != 0`, and `totalVested` is written by exactly one internal function, called only from the constructor:
```solidity
function _setupVesting(address beneficiary, uint256 amount, uint256 duration, uint256 cliff) internal {
    vestingStart[beneficiary] = block.timestamp;
    vestingDuration[beneficiary] = duration;
    cliffDuration[beneficiary] = cliff;
    totalVested[beneficiary] = amount;
}
```

So: **the five constructor addresses can mint, by linear vesting, and nobody else, ever.** There is no `mint(address,uint256)`, no minter role, no callback, no `onlyGame`, no oracle slot. The word "game" does not occur. The 40 % `NODE_REWARDS_ALLOCATION` - the allocation whose name is closest to "agents mine" - is just another vesting beneficiary: it vests linearly to one address over `120 * 30 days` with no cliff, and *that address* decides what to do with it off-chain. Nothing on-chain ties it to a node, a proof, or a bee.

### 4.2 What vesting is

Linear, per address, from `genesisTimestamp`:
```solidity
if (elapsed < cliffDuration[beneficiary]) return 0;
if (elapsed >= vestingDuration[beneficiary]) return totalVested[beneficiary];
return (totalVested[beneficiary] * elapsed) / vestingDuration[beneficiary];
```
Founder 48 months with a 12-month cliff; node rewards 120 months, no cliff; community 36 months, no cliff; treasury 60 months with a 6-month cliff; liquidity minted at deploy. `circulatingSupply()` returns `totalSupply()` - there is no burn, so "minted - burned" is "minted".

### 4.3 The Sepolia deployment, measured on chain today

`deployment-sepolia.json` (read): token `0xef368e29FA3aB2eaf02BccD05438ED3bafE9f469`, deployer `0xb7183E9D4176F3Fa6F56190d677626a9c87a9f87`, and **all five allocation addresses are the deployer.** `script/Deploy.s.sol:33-39` falls back to `deployer` for any unset `*_ADDRESS` variable (read).

`_setupVesting` writes a mapping keyed by address. Called four times with the same address, the last write wins. I checked that on chain rather than reasoning about it, with `eth_call` through two unrelated public RPCs (`1rpc.io/sepolia` and `ethereum-sepolia-rpc.publicnode.com`, 1.51 s and 0.88 s; three other public endpoints returned 403/429) - both answered identically except where `block.timestamp` had advanced:

| call | result | meaning |
|---|---|---|
| `totalSupply()` | 1,046,035,320.3 TRI | = `LIQUIDITY_ALLOCATION` = 10 % of the Phoenix number, exactly |
| `balanceOf(deployer)` | 1,046,035,320.3 TRI | the whole supply sits in one wallet |
| `totalVested(deployer)` | 1,046,035,320.3 TRI | = `TREASURY_ALLOCATION` - the **last** `_setupVesting` call, 10 %, not 90 % |
| `cliffDuration(deployer)` | 15,552,000 s = 180 days | the treasury's cliff |
| `vestingDuration(deployer)` | 155,520,000 s = 1,800 days | the treasury's duration |
| `genesisTimestamp()` | 1,771,232,916 = 2026-02-16T09:08:36Z | matches the JSON's 09:08:38 deploy time |
| `vestedAmount(deployer)` | 115,695,542 TRI (rpc 1) / 115,695,623 TRI (rpc 2) | 199.1 days elapsed / 1,800 = 0.110604, derived, matches |
| `claimed(deployer)` | 0 | nothing claimed |

Consequence, derived: on that deployment the founder 20 %, node-rewards 40 % and community 20 % records were overwritten before the first block ended. **70 % of the Phoenix number, including the entire Node Rewards pool, can never be minted on the Sepolia contract.** Total ever mintable there is 20 % (10 % already minted, 10 % vesting to the treasury schedule). `test/TrinityToken.t.sol` uses five distinct `makeAddr` fixtures (read: lines 16-20), so the suite cannot see this. A mainnet deploy with distinct addresses would not have the overwrite; a mainnet deploy with the same fallback would.

This is not a game finding, but it is the exact place a game-mint proposal would land, so it is in the study.

### 4.4 The off-chain reward code, for completeness

`trinity/src/depin/network.zig` carries `earned_tri: f64`, `pending_tri: f64` and `calculateReward = base_reward * tier.getMultiplier() * quality_score` (read: lines 130-139). Floats, tiers, a `quality_score` nobody measures - and no path from it to `claimVested`. It is the E5 fixture economy's sibling. Do not draw from it.

---

## 5. SPEND

The real supervisor spends two things per bee: **one slot** and **one turn's ration**. Minerals are the *yield*, not the currency - and the game must not pretend a player is paying minerals for anything. What minerals and gas do is **gate** what the map is allowed to draw. Every row below maps a StarCraft purchase to the real action, its real price, its in-game gate, and whether a public page can cause it.

### 5.1 Unit production

| purchase | real action | real price | in-game gate (derived from columns) | public? |
|---|---|---|---|---|
| **a bee** | the tick dispatches: `runQueenTickOnce` -> `resolveWorkerProvider` -> a `queen_dispatch` row | 1 slot + `estimatedCost` micro-$ | none: the Queen queues it herself, every 300 s | **WATCH-ONLY.** `POST /queen/lease/tick` exists (read: `queen-lease.ts:112-130`, accepts `candidates: number[]`) but is behind the single shared bearer and not in the CORS allowlist. Operator surface `/queen/hq` only, per `evolving-bees.md` §5.2 C1/C2 |
| **a worker slot** (supply depot) | raise `MAX_CONCURRENT_WORKERS` in `queen_core.t27:37` and deploy | a commit through the ring's gate | tree node `bee-ceiling` is `planned`, held by `bash-process-group`, `queen-observer-cost`, `cloud-dispatch` (measured edges) | **WATCH-ONLY** |
| **a provider key** (a second mineral line) | set `ZAI_API_KEY` etc. on Railway (read: `WORKER_PROVIDERS[].envVar`) | money outside the game | the three refused keys are drawn as idle workers with the refusal on them | **WATCH-ONLY** |
| **unseal refused keys** | `clearRefusedKeys()` - a function with no route (read: `queen-dispatch.ts:243-246`) | 0 | - | **WATCH-ONLY, one route away** (C3) |
| **raise the ration** (the supply cap) | `TRIOS_SWARM_DAILY_CAP_USD` or the knob file `state/swarm_budget.json`, read per call (read: `ModelPricing.swift:107-130`) | real dollars | drawn as the economy study prescribes: a step, old ceiling as a ghost line, `σ` unchanged beside it | **WATCH-ONLY** (C4, the cheapest real command; not for the public) |
| **a free worker** (GPU land) | add `{provider:'ollama', envVar:..., model:...}` to `WORKER_PROVIDERS` and deploy | 0 per turn thereafter | the only purchase that moves `σ` | **WATCH-ONLY** |

### 5.2 Research

The tree the page already draws is `/queen/tree` from `.trinity/dashboard/tech-tree.json`. Measured today from the live route (HTTP 200, 60,204 B, 0.90 s at load 13): **40 nodes, 48 edges; shipped 13, partial 11, blocked 13, planned 3; layers seed 6, ring 12, silicon 1, runtime 7, supervisor 11, interface 3.** Same counts in the local JSON (read). Each node's status comes from an evidence string, and `queen-mission-control.md` §6.1 says keep that rule absolutely.

So research is not bought; it is *evidenced*. What the two resources add is a second ring on a node:

| ring | condition | source |
|---|---|---|
| **shipped / partial / blocked / planned** (exists) | the evidence string | `tech-tree.json`, regenerated on deploy |
| **worked** (new, minerals) | >= 1 accepted turn whose `owned_paths` intersect the node's evidence path | `queen_dispatch.review_state = 'accept'` joined on `owned_paths` - **operator surface only**, because `owned_paths` is stripped from the public projection on purpose (read: `queen-kanban.ts` projection comment) |
| **sealed** (new, gas) | >= 1 proof unit on that node | SYNTHETIC until the refinery exists; drawn as an empty socket with the reason, exactly like ARCHON |

The silicon layer has one node, `ring00-silicon`, `blocked`, fed by `t27-00-queen-core` (measured edge). That is the refinery-v2 node. The game does not pad it.

### 5.3 Territory

The comb (`06-comb.html`, read) already gives every cell one of three states - `held`, `neutral`, `fog` - seeded by arithmetic. The real mapping, at the two granularities that exist:

| granularity | cell | held | neutral | claimed | fog | source |
|---|---|---|---|---|---|---|
| **public** (what t27.ai can draw) | one card | column `running` or `review` (a bee or a 48 h review hold on it) | `backlog` | `done` | `dropped` | `/queen/public-board` cards: `number,title,column,criteria,needs` (measured: 83 cards) |
| **operator** (behind the token) | one path boundary | `queen_dispatch.owned_paths` while `stillHoldsBoundary` - `REVIEW_BOUNDARY_HOLD_HOURS = 48` (read: `queen-kanban.ts:186-207`) | an open issue whose `owned_paths` is unheld | accepted | no issue names the path | `queen_dispatch`, `queen_issues.owned_paths` |

Claiming a cell is therefore **one accepted turn** - one mineral - and the claim is the mineral, not something bought with it. A send-back leaves the cell held-but-not-claimed; an escalation hands it to a person and the cell is drawn with `needs_you` (the `queen_report.needs_you` column, read: `pg-migrate.ts:258-265`). Today: 44 claimed, 13 held by review holds with nothing running, 18 neutral, 8 fog, 0 with a bee on it (measured).

What territory is **not**: a land (a `(substrate, class)` holding). Lands are the economy study's unit; cells are issues. A bee flies from a land to a cell. Keep the two layers apart or the map invents a fourth quantity.

### 5.4 The spend table in one line

**Everything the player would click is WATCH-ONLY today.** Six real actions exist; two have a route (tick, tick-with-candidates) and it is operator-only; one is a function without a route; three are env vars and constants. That matches `evolving-bees.md`'s headline - the game is a window, not a cockpit - and the honest StarCraft reading is that the player is watching a replay of a Queen who queues her own workers.

---

## 6. THE FIRST FIVE MINUTES

Clock: the 300 s round (`scheduler.intervalSeconds: 300`, measured). Page polls: `/queen/status` every 15 s, `/queen/public-board` every 30 s (read: `Queen.tsx:386-387`). Today's response times at load 13-17: 6.23 s and 4.10 s; a 15 s poll tolerates that, but two status fetches were briefly in flight, so the game must coalesce polls rather than stack them.

The script is written for what the live data shows **today** (Opening B), with the Opening A branch where it diverges.

**0:00 - the field.** Before any fetch resolves: the comb, 83 cells, all drawn in the fog weight; the hive at the centre with four empty slot sockets; the resource bar with four dashes (`-` for minerals, gas, supply, ration) - never zeros. The six lands from the economy study's §1.3 table around the field, grey, dotted where no meter exists.

**0:04 - status lands** (6.2 s today). The bar fills from left to right: **MINERALS -** (not yet; that field is in the board), **GAS 0 - refinery not built**, **SUPPLY 0/4**, **RATION 1.137 - hatched.** The cause line, largest type on the page, computed by the four-line discriminator: *"Nothing is running. The day's ration is spent - $11.37 against $10, estimated at list rates - and every land that could work for free is grey."* Three idle worker sprites appear next to the hive with *"refused by the provider"* on them; a fourth carries a key and stands still, because the tick did not reach the issue loop.

*Opening A at the same instant:* `allowed: true`; one bee leaves slot 1 for the chosen cell; SUPPLY 1/4; the ration bar shows the last turn's estimate as a step down. Nothing else changes.

**0:08 - board lands** (4.1 s today). Cells take their states: 44 claimed (lit, the cell's 27-petal mark at full weight), 13 held (rim only - a review hold with no bee under it, and the page says "held, not running"), 18 neutral, 8 fog. **MINERALS 44 (lifetime)**, and beside it in smaller type **16 verdicts / 15 issues started, last 24 h** - labelled "issues started", never "bees".

**0:00-2:59 - the one decision.** In Opening B it is not the player's. The bar's ration segment carries the three levers from the economy study's §5.2 priced in `Δb` and `Δσ`: raise the cap (`b: 1.137 -> 0.569`, `σ: 0`), attach a board (`0, 0`, but the refinery-v2 socket lights as "reachable"), route a bee to `ollama` (`σ: 0 -> 1/n`). The page prints these; it cannot pull them. A visitor who wants a cockpit is told where it is: `/queen/hq`, behind the operator's token.

In Opening A the player watches the bee sit on its cell. Nothing to decide: the Queen chose. The game shows the turn's owned paths as the cell's wall thickening.

**~1:30 - the reaper check that does not fire.** No sprite changes; the 2 h reaper is the ceiling and it is far away. Any animation of "progress" on the bee here would be invented. The bee breathes (the comb's existing vertex glint), nothing more.

**5:00 - the second round.** `lastTick.decidedAt` advances (the page notices within 15 s). In Opening B: same refusal, same `skippedCount: 0`, the ring pulse at the centre fires and the bar does not move - and that stillness is the information. In Opening A: if the turn finished, this tick reviews it. `review_verdict` returns one of four integers: **ACCEPT** - the bee returns to the hive, the cell flips claimed, MINERALS ticks 44 -> 45, the bee's sprite gains FORAGER facets; **SEND_BACK** - the bee turns around on the same cell, `send_backs` 1, the cell stays held; **ESCALATE** - the cell gets a `needs_you` marker and a person's name is the next event; **WAIT** - a criterion has no answer yet and the bee stays out. If the turn has not finished, the tick may start a second bee (SUPPLY 2/4) and the first mineral is 10:00 at the earliest.

**What never happens in five minutes:** gas. The refinery is unbuilt; the GAS field reads `0 - no second machine has ever reproduced a tree this hive produced` for as long as `queen_dispatch` has no `commit_sha`. That is the same locked door at the top of the evolution tree and the top of the proof-of-compute problem, and it stays on screen because it is the game.

---

## 7. What to build, in order, and what each unlocks

1. Split `verdicts` into `accepted / sentBack / escalated` in `publicBoardProjection` - the MINERALS field, public, one file.
2. The cause discriminator and the three levers priced in `Δb`/`Δσ` - already specified; the opening screen depends on it.
3. Cells from cards, bees from `dispatches.running` and the latest dispatch - the public game, no new data.
4. `commit_sha` / `tree_sha` / `replayed_by` columns and the Mac-side replay - **the refinery.** The first gas unit is the first proof unit and the first ARCHON.
5. A local provider in `WORKER_PROVIDERS` - the first free mineral, `σ > 0`.
6. `clearRefusedKeys` behind a route; the cap knob behind a route - the cockpit, for the operator only.

Nothing on this list touches `TrinityToken.sol`, and nothing should until §3.2's C-c and C-d are true, which no item here makes them.

---

## 8. Register

**Measured today (command or fetch given):** `/queen/status` at 11:08:19Z decision (HTTP 200, 6.23 s, load 17.26): `allowed:false`, the refusal string, `skippedCount:0`, dispatches 43/43/0, latest issue 1329 with `dispatchedAt == finishedAt`, 4 keys / 1 live / 3 refused. `/queen/public-board` (HTTP 200, 11,715 B, 4.10 s): 83 cards, done 44 / backlog 18 / review 13 / dropped 8 / running 0; `pulse {rounds:1, bees:15, verdicts:16, roundSeconds:300}`. `/queen/tree` (HTTP 200, 60,204 B, 0.90 s, load 13.20): 40 nodes, 13/11/13/3, six layers. Sepolia `eth_call` x 8 through two RPCs: `totalSupply`, `balanceOf`, `totalVested`, `vestedAmount`, `claimed`, `cliffDuration`, `vestingDuration`, `genesisTimestamp` as tabulated in §4.3; contract selectors derived with a pure-Python keccak self-checked against the empty-string digest and `transfer(address,uint256) = a9059cbb`. Load averages at each step, as listed in the header.

**Read today:** `territory-economy.md` in full; `TrinityToken.sol` in full; `deployment-sepolia.json`; `Deploy.s.sol:19-40`; `TrinityToken.t.sol:16-20`; contracts `README.md`; `queen_core.t27` in full; `ModelPricing.swift:38-54, 99-193`; `queen-dispatch.ts:30-64, 225-262`; `queen-tick.ts:980-1010, 1125-1160, 397-398, 1633-1635`; `queen-lease.ts:100-150`; `queen-kanban.ts:105-125, 186-207, 410-450`; `queen-public-status.ts:63-75`; `pg-migrate.ts:145-270`; `queen-tree.ts:21-70`; `tech-tree.json`; `Queen.tsx:386-388`; `06-comb.html:55-105`; `prototypes/README.md:199`; `queen-mission-control.md:264-415`; `evolving-bees.md:235-315, 496-535`; `depin/network.zig:130-139`.

**Derived:** trips per $10 from list prices and the SYNTHETIC 30k/6k turn; 288 rounds/day; the vesting fraction 0.110604 at 199.1 days; the 70 % unmintable share on Sepolia from the mapping overwrite plus the on-chain `totalVested` reading.

**SYNTHETIC:** every gas number (0 by construction); the "worked" and "sealed" rings on tech nodes; a turn's duration; whether a real turn finishes inside one round; any frame timing for this map - I ran no render today.

**Not verified:** whether the Sepolia deployer intends to redeploy with distinct addresses; whether any code anywhere runs `depin/network.zig` (the earlier study says nothing runs the Zig agent; I only grepped).

**Deleted:** `/tmp/mine-study/` (keccak.py ~2 KB, tree.html 60 KB) and `/tmp/pubboard.json` (11.7 KB). Peak scratch under 100 KB.
