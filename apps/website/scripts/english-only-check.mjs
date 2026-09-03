// Code and documentation are English. Translations are not.
//
// The operator's rule, stated 2026-09-03: "all docs and code in English, except
// translations". Both halves matter, and a checker that enforces only the first
// half is useless here -- this site ships five locales, and `messages/ru.json`
// is 18,109 Cyrillic characters of entirely correct work. A rule that fails on
// the translations is a rule everybody turns off within a day.
//
// So the distinction this makes is between the two places text lives:
//
//   a string literal   -> shown to a reader, may be any language
//   everything else    -> comments, identifiers, docs: English
//
// A comment in Russian is not a translation. Nobody localises a comment; it is
// read by whoever maintains the file, and this repository has agents and
// contributors who do not read Cyrillic. Same for a heading in a README.
//
// The baseline exists because the rule arrived after the tree did. 80 files
// carry Cyrillic today and most of them are legitimate content. Rather than
// pretend the tree is already clean or block every commit until it is, the
// count per file may only ever go down -- the same ratchet the typecheck uses,
// for the same reason.
//
// Run:      node scripts/english-only-check.mjs
// Update:   node scripts/english-only-check.mjs --update
// Staged:   node scripts/english-only-check.mjs --staged

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

// The REPOSITORY root, not the website's. Scanning from apps/website left
// everything above it - docs/, the root README, the workflow files - outside
// the rule the operator actually stated, which was about all docs and all code.
// A language gate with a blind spot the size of docs/ is not a language gate.
const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: HERE,
  encoding: 'utf8',
}).trim()
const BASELINE = join(HERE, 'english-only-baseline.json')

const CYRILLIC = /[\u0400-\u04FF\u0500-\u052F]/gu

// Files whose whole purpose is to hold another language. Nothing here is
// checked at all -- not "checked leniently", not counted in the baseline.
const TRANSLATION = [
  /(^|\/)messages\//,
  /(^|\/)src\/i18n\//,
  /(^|\/)qa\/language-exceptions\.json$/,
  /(^|\/)src\/data\/blog\//, // post bodies, published in ru and en
  /(^|\/)src\/content\//, // long-form page copy
  /(^|\/)public\//,
  /\.ru\.[a-z]+$/,
  /(^|\/)dist\//,
  /(^|\/)node_modules\//,
]

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|css|scss|yml|yaml|sh)$/
const DOC = /\.(md|mdx)$/

/**
 * Remove string and template literals, leaving comments and identifiers.
 *
 * This is a scanner rather than a parser, and it errs toward REMOVING more
 * (under-reporting) rather than less. A checker that invents violations gets
 * switched off faster than one that misses a few, and every miss here is still
 * catchable by a human reading the diff.
 */
function stripLiterals(source) {
  let out = ''
  let i = 0
  let quote = null

  while (i < source.length) {
    const ch = source[i]

    if (quote) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) {
        quote = null
        out += ch
      } else if (ch === '\n') {
        // An unterminated literal is a scanning error, not a file that runs.
        // Ending it at the newline stops one bad quote from blanking the rest
        // of the file -- which would silently hide every violation below it.
        quote = null
        out += ch
      }
      i += 1
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      out += ch
      i += 1
      continue
    }

    out += ch
    i += 1
  }

  return out
}

function countViolations(rel, source) {
  if (TRANSLATION.some((re) => re.test(rel))) return 0
  if (DOC.test(rel)) return (source.match(CYRILLIC) ?? []).length
  if (CODE.test(rel)) return (stripLiterals(source).match(CYRILLIC) ?? []).length
  return 0
}

function trackedFiles() {
  const staged = process.argv.includes('--staged')
  // Both commands run with cwd at the repository root, so both print
  // repository-relative paths and the two modes agree about what a path means.
  // They did not always: `git ls-files` in a subdirectory prints paths relative
  // to that subdirectory, so every staged path missed the baseline and the hook
  // reported a brand-new violation for a file that had been there all along.
  const args = staged
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
    : ['ls-files']
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function scan() {
  const found = {}
  for (const rel of trackedFiles()) {
    const abs = join(ROOT, rel)
    if (!existsSync(abs)) continue
    let source
    try {
      source = readFileSync(abs, 'utf8')
    } catch {
      continue
    }
    const n = countViolations(rel, source)
    if (n > 0) found[rel] = n
  }
  return found
}

const found = scan()

if (process.argv.includes('--update')) {
  const total = Object.values(found).reduce((a, b) => a + b, 0)
  writeFileSync(
    BASELINE,
    `${JSON.stringify(
      {
        note: 'Cyrillic in comments, identifiers and docs, per file. This file may only shrink. Translations and content are not counted at all. Run `npm run check:english -- --update` after fixing some.',
        total,
        files: found,
      },
      null,
      2,
    )}\n`,
  )
  console.log(`  baseline written: ${total} in ${Object.keys(found).length} file(s)`)
  process.exit(0)
}

const baseline = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, 'utf8')).files
  : {}

let failed = false
const improved = []

for (const [rel, n] of Object.entries(found)) {
  const was = baseline[rel] ?? 0
  if (n > was) {
    failed = true
    console.error(
      `  ${rel}: ${was} -> ${n} non-English in a comment, identifier or doc`,
    )
  }
}

// Only in a full scan. In --staged mode the files that were not staged were
// never looked at, so every one of them reads as "improved to 0" - a hook that
// congratulates you for 3,212 characters you did not touch, and invites an
// --update that would erase the real baseline.
if (!process.argv.includes('--staged')) {
  for (const [rel, was] of Object.entries(baseline)) {
    const now = found[rel] ?? 0
    if (now < was) improved.push(`  ${rel}: ${was} -> ${now}`)
  }
}

if (improved.length && !process.argv.includes('--staged')) {
  console.log(improved.join('\n'))
  console.log('  run with --update to lock the improvement in.')
}

if (failed) {
  console.error('')
  console.error('  Code and documentation are English. A translation belongs in')
  console.error('  messages/, src/i18n/, src/content/ or a string literal --')
  console.error('  never in a comment or a heading.')
  process.exit(1)
}

const total = Object.values(found).reduce((a, b) => a + b, 0)
console.log(
  `  english-only: no file gained non-English comments or docs (${total} carried over)`,
)
