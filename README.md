# TRI-27

The public face of Trinity: the site at **[t27.ai](https://t27.ai)**, and the
game that is being built on top of it.

`φ² + 1/φ² = 3 = TRINITY`

---

## Why this repository exists

Until 2026-09-03 the site lived at `gHashTag/trinity/apps/website` — one
directory inside a 5,956-commit, 1.5 GB Zig/Rust monorepo whose other 12,000
files are a compiler, an FPGA flow and a research corpus. Nothing about the
website needed any of that, and nobody could clone the site without cloning all
of it.

This repository is that directory, extracted with `git filter-repo` and **its
history intact**: 247 commits, 228 files, a 3.4 MB `.git`. Every commit that
ever touched the site is still here, with its author, date and message. The
first is `f3fc188 feat(tri): Terminal colors + ELO arena + Zenodo hub (#435)`.

## What is here

| Path | What it is |
|---|---|
| `apps/website/` | The Vite + React + Three.js site published to t27.ai |
| `apps/website/src/pages/Queen.tsx` | The Queen's public page — see below |
| `docs/game/` | Design and measurements for the Mission Control game |

The path `apps/website` is deliberately unchanged. The publisher in
`gHashTag/ghashtag.github.io` builds from `.src/apps/website`, so keeping the
name makes the cutover a one-line change to which repository it checks out,
rather than a rewrite of the workflow.

## What is NOT here, and why

**The Queen's brain.** The supervisor that picks issues, cuts worktrees,
dispatches bees and judges their work is `gHashTag/trios`, deployed on Railway.
It is a Bun/TypeScript service with a Postgres schema and a Swift policy core;
it does not belong in a static site and moving it would take the deployment
down. This repository holds the face. The brain is linked, not copied.

## The link

```
   gHashTag/trinity            gHashTag/tri-27           gHashTag/trios
   research monorepo    ──▶    this repo: the face  ◀──  the Queen's brain
   (source of record for                │                (Railway + Postgres)
    the brain atlas, the                │                      │
    .t27 language, the FPGA)            │                      │
                                        ▼                      │
                          gHashTag/ghashtag.github.io          │
                          publishes the built site  ────────▶  t27.ai
                          every 15 minutes                     │
                                                               │
                     the page reads /queen/status ◀────────────┘
                     and /queen/public-board
```

### The gap this repository was created to close

`t27.ai/#/queen` has been showing **"brain not connected"** in production. The
page was not broken — it was pointed at a Zig service on `localhost:8080` that
is not the supervisor that actually runs. Meanwhile the real Queen answered
every request made from a terminal:

```
$ curl -s https://trios-agent-server-production.up.railway.app/queen/status
HTTP 200
{"status":"ok","scheduler":{"enabled":true,"intervalSeconds":300}, ...}
```

Two hundred milliseconds away, unauthenticated, and invisible to the page,
because those responses carried no `Access-Control-Allow-Origin` header at all.
A browser on `t27.ai` could not read a byte of a public endpoint.

Fixed in `trios` by `publicReadCorsMiddleware`, which serves the two sanitized
projections — and only those two — with a wildcard and **no** credentials. Not
by adding `t27.ai` to `TRUSTED_ORIGINS`: an `Origin` header is a string the
caller types, so an allowlist entry is a password anyone can spell, and that
entry would have widened every authenticated route at once.

### The two endpoints the face may read

| Endpoint | Carries | Never carries |
|---|---|---|
| `/queen/status` | scheduler interval, last decision, dispatch counts | — |
| `/queen/public-board` | issue numbers, titles, column, criteria counts | holder, branch, transcript, provider, model, any mutation route |

Both are read-only, unauthenticated by design, and rate-limited upstream.
Anything more specific belongs behind `/queen/lease`, which requires a bearer
token this repository does not hold and must never hold.

## The game

The operator's brief: the shape of
[XCOM: Enemy Unknown Mission Control](https://www.ufopaedia.org/Mission_Control_(EU2012)),
with the compute network in place of the Earth — CPU, FPGA and GPU nodes
contributed by the community — as a proof-of-compute game where the territories
are real resources.

Design and engine selection live in `docs/game/`. The engine is chosen by
**measurement**, not by preference: median and 5th-percentile frame time,
bundle transfer size, time to first frame, and behaviour without WebGL2. The
site already ships Three.js, which is an advantage to be tested rather than
assumed.

## Running it

```bash
cd apps/website
bun install
bun run dev
```

Point the page at a Queen with `VITE_QUEEN_API`. With nothing set, the page says
so rather than rendering empty panels — a dashboard that looks alive and reports
nothing is worse than one that admits it is offline.

## Identity

The naming and structure follow the Trinity S³AI brain map: 23 neuroanatomical
modules, each answering to a function an autonomous swarm needs. The map is
maintained in `gHashTag/trinity` at `docs/BRAIN_ATLAS.md` and `src/brain/*.zig`;
`trios` carries a skill that records which module each part of the Queen plays
and which have no organ yet.

**Citation.** Vasilev, Dmitrii. *Trinity S³AI Framework — Complete Research
Collection v5.0.* Zenodo, 26 March 2026. DOI
[10.5281/zenodo.19227879](https://doi.org/10.5281/zenodo.19227879). CC-BY-4.0.

The record is an index for the seven-module stub series B001–B007. Its own
description states these are software stubs rather than peer-reviewed papers,
which is repeated here rather than smoothed over.

## Licence

The site inherits the licence of the repository it came from. See
`gHashTag/trinity` for the terms that applied to each historical commit.
