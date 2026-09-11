# TRI-27

An extracted website snapshot and design lab for Trinity's Mission Control game.
The live **[t27.ai](https://t27.ai)** source remains in
**[gHashTag/trinity/apps/website](https://github.com/gHashTag/trinity/tree/main/apps/website)**.
No publisher cutover to this repository has taken place.

`φ² + 1/φ² = 3 = TRINITY`

---

## Why this repository exists

On 2026-09-03 a copy was extracted from `gHashTag/trinity/apps/website` — one
directory inside a 5,956-commit, 1.5 GB Zig/Rust monorepo whose other 12,000
files are a compiler, an FPGA flow and a research corpus. Nothing about the
website needed any of that, and nobody could clone the site without cloning all
of it.

The extraction used `git filter-repo` with **its history intact**. The extraction
record counted 247 commits, 228 files and a 3.4 MB `.git`; these are historical
figures, not current inventory. The live site continued developing in Trinity
after the extraction. Changes here do not reach t27.ai automatically.

## What is here

| Path | What it is |
|---|---|
| `apps/website/` | Extracted Vite + React + Three.js website snapshot |
| `apps/website/src/pages/Queen.tsx` | Queen page from the extraction; not the current production game |
| `docs/game/` | Design and measurements for the Mission Control game |

The path `apps/website` is deliberately unchanged. As verified on 2026-09-12,
the [apex publisher](https://github.com/gHashTag/ghashtag.github.io/blob/d380f4e9f16eab9733595401682875423faba040/.github/workflows/publish-website.yml)
checks out `gHashTag/trinity@main` into `.src` and builds `.src/apps/website`.
It does not check out `tri-27`. Source ownership and the divergence are tracked
in [trinity#974](https://github.com/gHashTag/trinity/issues/974).

A future extraction requires an explicit migration: reconcile source and assets,
move the production acceptance checks, switch the publisher, and verify the served
revision. Preserving a directory name does not perform that migration. Until then,
production fixes and acceptance checks belong in Trinity.

## What is NOT here, and why

**The Queen's brain.** This snapshot does not include the deployed supervisor.
The page's configured API and its committed recording describe the backend it
was built against; they do not establish current deployment health or production
contract compatibility. Follow the current Trinity sources when changing the
production page or its producer.

## The link

```
gHashTag/trinity/apps/website -- built by --> gHashTag/ghashtag.github.io
            |                                              |
            | historical extraction                       v
            +----------------------> gHashTag/tri-27      t27.ai
                                      snapshot + lab
                                      no publishing link
```

### Historical connection work (2026-09-03)

At extraction time, `t27.ai/#/queen` showed **"brain not connected"**. The
page was not broken — it was pointed at a Zig service on `localhost:8080` that
is not the supervisor that actually runs. Meanwhile the real Queen answered
requests made from a terminal (historical recording, not a current health check):

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

### Optional snapshot contract check

```bash
npm run check:queen-snapshot
```

This compares this checkout's `Queen.tsx` with its committed recording only. It
does not validate the current t27.ai game or the deployed supervisor. It is an
opt-in diagnostic, also available through the manual **Queen snapshot contract**
workflow; it is not a required CI gate or a default hook. `--live` compares this
same snapshot with the configured API, and `--record` refreshes its recording.
Neither turns the snapshot into the production acceptance suite.

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
