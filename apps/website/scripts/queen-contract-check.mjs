// Every field the Queen page reads must be a field the supervisor emits.
//
// This exists because of the defect it replaces, not as a precaution. Until
// 2026-09-03 this page rendered five metrics -- trinity_signature,
// improve_cycles, uptime_seconds, env_status, swarm_active -- that no endpoint
// of any deployment has ever returned. They were not "not yet wired". They were
// unobtainable, by any deployment, ever, and the page showed them as pending
// for months. `vite build` was green the whole time, because a field that does
// not exist in a response is `undefined`, and `undefined` renders as nothing.
//
// So the contract is checked against a RECORDING of the live service rather
// than against a hand-written mock. A mock is written by the same person who
// wrote the bug, and agrees with it.
//
// Refresh the recording:  node scripts/queen-contract-check.mjs --record
// Check against live too: node scripts/queen-contract-check.mjs --live
//
// --record talks to the network. The default does not, so CI stays hermetic
// and a Railway outage cannot turn this repository red.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const FIXTURE = join(HERE, 'queen-contract.json')
const PAGE = join(ROOT, 'src/pages/Queen.tsx')

const DEFAULT_API = 'https://trios-agent-server-production.up.railway.app'
const API = (process.env.QUEEN_API ?? DEFAULT_API).replace(/\/+$/, '')

const ENDPOINTS = [
  { path: '/queen/status', iface: 'StatusResponse' },
  { path: '/queen/public-board', iface: 'BoardResponse' },
]

/** Collect every key present anywhere in a JSON value, as dotted paths. */
function keysOf(value, prefix = '', out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) keysOf(item, prefix, out)
    return out
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${k}` : k
      out.add(path)
      keysOf(v, path, out)
    }
  }
  return out
}

/**
 * The property names an interface declares, read off the page source.
 *
 * A regex over TypeScript is a blunt instrument and this one is deliberately
 * narrow: it reads the body of one `interface X { ... }` and takes the
 * identifiers that appear at the start of a line before a `:` or `?:`. That
 * covers every shape in this file. If someone writes a cleverer type here, this
 * will under-report rather than misreport, and the --live mode still catches
 * the real divergence.
 */
function declaredFields(source, name) {
  const start = source.indexOf(`interface ${name} {`)
  if (start === -1) return null
  let depth = 0
  let i = source.indexOf('{', start)
  const from = i
  for (; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) break
    }
  }
  const body = source.slice(from + 1, i)
  const fields = new Set()
  for (const line of body.split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\??\s*:/.exec(line)
    if (m) fields.add(m[1])
  }
  return fields
}

async function record() {
  const recorded = {}
  for (const { path } of ENDPOINTS) {
    const res = await fetch(API + path)
    if (!res.ok) {
      console.error(`  ${path}: HTTP ${res.status} from ${API}`)
      process.exit(1)
    }
    recorded[path] = await res.json()
  }
  writeFileSync(
    FIXTURE,
    `${JSON.stringify(
      {
        note: 'Recorded from the live supervisor. Refresh with `npm run check:queen -- --record`. Values are illustrative; only the SHAPE is asserted.',
        recordedAt: new Date().toISOString(),
        origin: API,
        responses: recorded,
      },
      null,
      2,
    )}\n`,
  )
  console.log(`  recorded ${ENDPOINTS.length} endpoint(s) from ${API}`)
}

async function check() {
  if (!existsSync(FIXTURE)) {
    console.error('  no recording at scripts/queen-contract.json')
    console.error('  create it with: npm run check:queen -- --record')
    process.exit(1)
  }
  const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'))
  const source = readFileSync(PAGE, 'utf8')
  const live = process.argv.includes('--live')

  let failed = false
  let checked = 0

  for (const { path, iface } of ENDPOINTS) {
    const declared = declaredFields(source, iface)
    if (!declared || declared.size === 0) {
      console.error(`  ${iface} declares no fields, or is not in Queen.tsx`)
      failed = true
      continue
    }

    let body = fixture.responses?.[path]
    if (live) {
      const res = await fetch(API + path)
      if (!res.ok) {
        console.error(`  ${path}: HTTP ${res.status} from ${API}`)
        failed = true
        continue
      }
      body = await res.json()
    }
    if (body === undefined) {
      console.error(`  ${path}: not in the recording`)
      failed = true
      continue
    }

    const emitted = keysOf(body)
    const leaves = new Set([...emitted].map((k) => k.split('.').pop()))

    for (const field of declared) {
      checked += 1
      if (!leaves.has(field)) {
        failed = true
        console.error(
          `  ${iface}.${field} is read by the page and emitted by nothing at ${path}`,
        )
      }
    }
  }

  if (failed) {
    console.error('')
    console.error('  A field the UI reads and the server never sends renders as')
    console.error('  nothing, and the build stays green. That is how five')
    console.error('  metrics sat on this page for months looking pending.')
    process.exit(1)
  }

  console.log(
    `  queen contract: ${checked} field(s) the page reads are all emitted` +
      (live ? ` by ${API}` : ' by the recording'),
  )
}

if (process.argv.includes('--record')) await record()
else await check()
