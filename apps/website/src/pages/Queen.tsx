import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context'
import './Queen.css'

// The queen's panels read a backend that this site does not contain. t27.ai is
// static hosting; there is no /health and no /api here. The original app in
// apps/queen-web assumed same-origin and called res.json() on whatever came
// back, so on static hosting every panel silently rendered '...' forever -- a
// dashboard that looks alive and reports nothing.
//
// It was then pointed at the wrong brain. Until 2026-09-03 this page probed
// /health, /api/containers and /api/sessions on a Zig background_agent that no
// deployment runs, while the supervisor that ACTUALLY picks issues, dispatches
// bees and judges their work answered every request in about 200ms from
// Railway. The page said "the brain is not connected" about a brain that was
// awake the whole time, because nothing had ever pointed at it.
//
// So the default is now that live supervisor. Its two public projections are
// unauthenticated on purpose and carry no holder, branch, transcript, provider
// or mutation route; everything more specific stays behind a bearer token this
// page does not hold and must never hold.
//
//   - VITE_QUEEN_API set at build time  -> that origin
//   - localhost                         -> http://localhost:8080
//   - anything else                     -> the deployed supervisor
const ENV_API = (import.meta.env.VITE_QUEEN_API as string | undefined)?.replace(/\/+$/, '')
const IS_LOCAL = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
const DEPLOYED_QUEEN = 'https://trios-agent-server-production.up.railway.app'
// `||` rather than `??`: a build with an empty VITE_QUEEN_API= would leave an
// empty string, which `??` keeps and every fetch then aims at the page's own
// origin - a static host, answering the SPA fallback HTML to every probe.
const QUEEN_API = ENV_API || (IS_LOCAL ? 'http://localhost:8080' : DEPLOYED_QUEEN)

const RU = {
  brainOfflineTitle: 'Мозг не отвечает',
  offlineP1: 'Эта страница — лицо королевы. Её мозг — отдельная служба, которая отвечает на',
  offlineP2: 'Сам сайт размещён статически и не обслуживает ни один из этих адресов.',
  tried: 'Проверен адрес',
  offlineNote: 'Ничто ниже не работает в реальном времени. Пустые панели выглядели бы так же, как у исправной королевы, которой нечего сообщить, поэтому страница прямо указывает, какой это случай.',
  liveness: 'Доступность',
  brain: 'Мозг',
  address: 'Адрес',
  scheduler: 'Планировщик',
  schedulerOn: 'раунд каждые',
  schedulerOff: 'выключен',
  seconds: 'с',
  lastDecision: 'Последнее решение',
  allowed: 'раунд разрешён',
  refused: 'раунд отклонён',
  skipped: 'пропущено задач',
  never: 'решений ещё не было',
  dispatches: 'Отправки',
  running: 'в работе',
  finished: 'завершено',
  total: 'всего',
  latest: 'Последняя пчела',
  issue: 'задача',
  board: 'Доска',
  boardSub: 'Санитизированная проекция. Номера и заголовки задач — публичные; исполнитель, ветка, стенограмма и провайдер не публикуются.',
  pulse: 'Пульс',
  rounds: 'раундов',
  bees: 'пчёл',
  verdicts: 'вердиктов',
  criteria: 'критериев',
  needs: 'не хватает',
  loading: 'Загрузка',
  failedFetch: 'не удалось выполнить запрос',
  expectedJson: 'ожидался JSON, получен ',
  kingdomBrain: '🧠 Мозг (ветвь I)',
  kingdomBody: '💪 Тело (ветвь II)',
  kingdomSpirit: '🔮 Дух (ветвь III)',
  title: '👑 Queen Trinity',
  subtitle: 'Самоулучшающийся рой · φ² + 1/φ² = 3',
  body: '💪 Тело',
  bodyP: 'Телесная ветвь — аппаратная: бинарная FPGA ALINX AX7203 (Xilinx Artix-7 XC7A200T). У неё пока нет публичного адреса у королевы, поэтому здесь нечего читать.',
  spirit: '🔮 Дух',
  spiritP: 'Духовная ветвь — корпус и его утверждения. У неё пока нет публичного адреса у королевы, поэтому здесь нечего читать.',
}

type ProbeState = 'loading' | 'ok' | 'unreachable'

interface Probe<T> {
  state: ProbeState
  data: T | null
  error: string | null
}

/** Fetch that reports what actually happened instead of throwing it away. */
async function readJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(QUEEN_API + path, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  // A static host answers /api/status with an HTML 200 for its SPA fallback.
  // Parsing that as JSON throws a syntax error that reads like a bug in the
  // queen; checking the type first names the real cause.
  const type = res.headers.get('content-type') ?? ''
  if (!type.includes('json')) throw new Error(`expected JSON, got ${type.split(';')[0] || 'nothing'}`)
  return res.json() as Promise<T>
}

function useProbe<T>(path: string, intervalMs: number): Probe<T> {
  const [probe, setProbe] = useState<Probe<T>>({ state: 'loading', data: null, error: null })

  useEffect(() => {
    // No setState directly in the effect body. There used to be one here, for
    // the case of an unconfigured backend; QUEEN_API always resolves to an
    // origin now, so that branch was unreachable AND it made React re-render
    // in a cascade on every mount. eslint's react-hooks rule found it.
    let alive = true
    const tick = async () => {
      try {
        const data = await readJson<T>(path)
        if (alive) setProbe({ state: 'ok', data, error: null })
      } catch (e) {
        if (alive) setProbe({ state: 'unreachable', data: null, error: (e as Error).message })
      }
    }
    void tick()
    const id = setInterval(tick, intervalMs)
    return () => { alive = false; clearInterval(id) }
  }, [path, intervalMs])

  return probe
}

// These are the shapes the supervisor ACTUALLY returns, read off
// agent-server/apps/server/src/api/routes/queen-public-status.ts and
// queen-kanban.ts rather than assumed, and confirmed against the deployment
// with curl on 2026-09-03.
//
// The version of this page in apps/queen-web rendered five metrics --
// trinity_signature, improve_cycles, uptime_seconds, env_status, swarm_active --
// and none of them existed on any endpoint of any deployment. A panel whose
// value is structurally unobtainable is worse than a missing panel: it reads as
// "not yet" when the truth is "not ever". Every field below is one the running
// service emits.

interface StatusResponse {
  status: string
  scheduler: { enabled: boolean; intervalSeconds: number }
  lastTick: {
    decidedAt: string
    allowed: boolean
    refusal: string | null
    skippedCount: number
  } | null
  dispatches: {
    total: number
    finished: number
    running: number
    latest: {
      issue: number
      dispatchedAt: string
      finishedAt: string | null
      outcome: string | null
    } | null
  }
}

interface BoardCard {
  number: number
  title: string
  column: string
  criteria: number
  needs: string[]
}

interface BoardResponse {
  repo: string
  columns: { key: string; title: string; blurb: string }[]
  cards: BoardCard[]
  pulse: {
    rounds: number
    bees: number
    verdicts: number
    lastRoundAt: string | null
    roundSeconds: number
  } | null
}

function translatedProbeError(error: string | null, c: typeof RU | null) {
  if (!c || !error) return error
  if (error === 'Failed to fetch') return c.failedFetch
  if (error.startsWith('expected JSON, got ')) return `${c.expectedJson}${error.slice('expected JSON, got '.length)}`
  return error
}

function BrainOffline({ reason }: { reason: string | null }) {
  const { lang } = useI18n()
  const c = lang === 'ru' ? RU : null
  const displayReason = translatedProbeError(reason, c)

  return (
    <div className="queen-offline">
      <h3>{c ? c.brainOfflineTitle : 'The brain is not answering'}</h3>
      <p>
        {c ? c.offlineP1 : "This page is the queen's face. Her brain is a separate service that answers"}{' '}
        <code>/queen/status</code> {c ? 'и' : 'and'} <code>/queen/public-board</code>.{' '}
        {c ? c.offlineP2 : 'This site is static hosting and serves neither.'}
      </p>
      <p className="queen-offline-detail">
        {c ? c.tried : 'Tried'} <code>{QUEEN_API}</code> — {displayReason}
      </p>
      <p className="queen-offline-note">
        {c ? c.offlineNote : 'Nothing below is live. Empty panels would have looked the same as a healthy queen with nothing to report, so the page says which one it is.'}
      </p>
    </div>
  )
}

function MetricCard({ label, value, status }: { label: string; value: string | number; status?: string }) {
  const colour = status === 'active' ? '#4caf50' : status === 'degraded' ? '#ff9800' : undefined
  return (
    <div className="queen-metric" style={colour ? { borderColor: colour } : undefined}>
      <span className="queen-metric-label">{label}</span>
      <span className="queen-metric-value">{value}</span>
    </div>
  )
}

const shortTime = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toISOString().slice(11, 19) + 'Z'
}

function LivenessPanel({ status }: { status: Probe<StatusResponse> }) {
  const { lang } = useI18n()
  const c = lang === 'ru' ? RU : null
  const dash = '—'
  const s = status.data
  const sched = s?.scheduler

  return (
    <section className="queen-card">
      <h2>{c ? `👑 ${c.liveness}` : '👑 Liveness'}</h2>
      <div className="queen-metrics">
        <MetricCard
          label={c ? c.brain : 'Brain'}
          value={status.state === 'ok' ? (s?.status ?? 'ok') : dash}
          status={status.state === 'ok' ? 'active' : undefined}
        />
        <MetricCard
          label={c ? c.scheduler : 'Scheduler'}
          value={
            !sched
              ? dash
              : sched.enabled
                ? `${sched.intervalSeconds}${c ? c.seconds : 's'}`
                : (c ? c.schedulerOff : 'off')
          }
          status={sched?.enabled ? 'active' : sched ? 'degraded' : undefined}
        />
        <MetricCard label={c ? c.running : 'Running'} value={s ? s.dispatches.running : dash} />
        <MetricCard label={c ? c.finished : 'Finished'} value={s ? s.dispatches.finished : dash} />
      </div>

      {s?.lastTick && (
        <p className="queen-sub" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <strong>{c ? c.lastDecision : 'Last decision'}</strong> {shortTime(s.lastTick.decidedAt)} —{' '}
          {s.lastTick.allowed ? (c ? c.allowed : 'round allowed') : (c ? c.refused : 'round refused')}
          {s.lastTick.refusal ? <>: <code>{s.lastTick.refusal}</code></> : null}
          {' · '}{s.lastTick.skippedCount} {c ? c.skipped : 'issues skipped'}
        </p>
      )}
      {s && !s.lastTick && (
        <p className="queen-sub" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {c ? c.never : 'No decision has been recorded yet.'}
        </p>
      )}
    </section>
  )
}

function LatestBeePanel({ status }: { status: Probe<StatusResponse> }) {
  const { lang } = useI18n()
  const c = lang === 'ru' ? RU : null
  const latest = status.data?.dispatches.latest

  // The outcome string is written by the supervisor for a human to read; it is
  // the one field here that is prose rather than a number, and it is shown
  // verbatim rather than summarised, because a summary of a diagnosis is how a
  // diagnosis stops being one.
  return (
    <section className="queen-card">
      <h2>{c ? `🐝 ${c.latest}` : '🐝 Latest bee'}</h2>
      {latest ? (
        <>
          <p className="queen-sub">
            <strong>#{latest.issue}</strong> · {c ? c.issue : 'issue'} ·{' '}
            {shortTime(latest.dispatchedAt)} → {latest.finishedAt ? shortTime(latest.finishedAt) : (c ? c.running : 'running')}
          </p>
          {latest.outcome && <p className="queen-sub" style={{ marginBottom: 0 }}>{latest.outcome}</p>}
        </>
      ) : (
        <p className="queen-sub" style={{ marginBottom: 0 }}>
          {status.state === 'loading' ? (c ? `${c.loading}…` : 'Loading…') : '—'}
        </p>
      )}
    </section>
  )
}

function BoardPanel({ board }: { board: Probe<BoardResponse> }) {
  const { lang } = useI18n()
  const c = lang === 'ru' ? RU : null
  const b = board.data

  if (board.state === 'loading') {
    return (
      <section className="queen-card">
        <h2>{c ? `📋 ${c.board}` : '📋 Board'}</h2>
        <p className="queen-sub">{c ? `${c.loading}…` : 'Loading…'}</p>
      </section>
    )
  }
  if (!b) return null

  const cardsIn = (key: string) => b.cards.filter(card => card.column === key)

  return (
    <section className="queen-card">
      <h2>{c ? `📋 ${c.board}` : '📋 Board'} <code>{b.repo}</code></h2>
      {b.pulse && (
        <p className="queen-sub">
          <strong>{c ? c.pulse : 'Pulse'}</strong> — {b.pulse.rounds} {c ? c.rounds : 'rounds'} ·{' '}
          {b.pulse.bees} {c ? c.bees : 'bees'} · {b.pulse.verdicts} {c ? c.verdicts : 'verdicts'} ·{' '}
          {shortTime(b.pulse.lastRoundAt)}
        </p>
      )}

      <div className="queen-board">
        {b.columns.map(col => {
          const cards = cardsIn(col.key)
          return (
            <div key={col.key} className="queen-board-col">
              <header>
                <strong>{col.title}</strong>
                <span className="queen-board-count">{cards.length}</span>
              </header>
              <p className="queen-board-blurb">{col.blurb}</p>
              <div className="queen-board-cards">
                {cards.slice(0, 12).map(card => (
                  <article key={card.number} className="queen-board-card">
                    <code>#{card.number}</code>
                    <span>{card.title}</span>
                    {card.criteria > 0 && (
                      <em>{card.criteria} {c ? c.criteria : 'criteria'}</em>
                    )}
                    {card.criteria === 0 && card.needs.length > 0 && (
                      <em className="queen-board-needs">
                        {c ? c.needs : 'needs'}: {card.needs.join(', ')}
                      </em>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="queen-sub" style={{ marginTop: '1rem', marginBottom: 0 }}>
        {c ? c.boardSub : 'A sanitized projection. Issue numbers and titles are public; the holder, branch, transcript and provider are not published.'}
      </p>
    </section>
  )
}

type Kingdom = 'brain' | 'body' | 'spirit'

const KINGDOMS: { key: Kingdom; label: string }[] = [
  { key: 'brain', label: '🧠 Brain (Strand I)' },
  { key: 'body', label: '💪 Body (Strand II)' },
  { key: 'spirit', label: '🔮 Spirit (Strand III)' },
]

export default function Queen() {
  const { lang } = useI18n()
  const c = lang === 'ru' ? RU : null

  // In the original these three tabs were <Link to="?kingdom=…"> and the state
  // setter was never called, so the highlight sat on "brain" whatever you
  // clicked and nothing read the query string. They are buttons now, and the
  // selection is the thing the page actually renders from.
  const [kingdom, setKingdom] = useState<Kingdom>('brain')
  const status = useProbe<StatusResponse>('/queen/status', 15000)
  const board = useProbe<BoardResponse>('/queen/public-board', 30000)
  const connected = status.state === 'ok'

  return (
    <div className="queen-page">
      <header className="queen-header">
        <h1>{c ? c.title : '👑 Queen Trinity'}</h1>
        <p>{c ? c.subtitle : 'Self-improving swarm · φ² + 1/φ² = 3'}</p>
      </header>

      <nav className="queen-tabs">
        {KINGDOMS.map(k => (
          <button
            key={k.key}
            onClick={() => setKingdom(k.key)}
            className={kingdom === k.key ? 'active' : ''}
            aria-pressed={kingdom === k.key}
          >
            {c
              ? (k.key === 'brain' ? c.kingdomBrain : k.key === 'body' ? c.kingdomBody : c.kingdomSpirit)
              : k.label}
          </button>
        ))}
      </nav>

      {!connected && <BrainOffline reason={status.error} />}

      {kingdom === 'brain' && (
        <>
          <div className="queen-grid">
            <LivenessPanel status={status} />
            <LatestBeePanel status={status} />
          </div>
          <BoardPanel board={board} />
        </>
      )}

      {kingdom === 'body' && (
        <section className="queen-card">
          <h2>{c ? c.body : '💪 Body'}</h2>
          <p className="queen-sub">
            {c ? c.bodyP : 'The body is the hardware strand — binary FPGA ALINX AX7203 (Xilinx Artix-7 XC7A200T). It has no public endpoint on the queen yet, so there is nothing here to read.'}
          </p>
        </section>
      )}

      {kingdom === 'spirit' && (
        <section className="queen-card">
          <h2>{c ? c.spirit : '🔮 Spirit'}</h2>
          <p className="queen-sub">
            {c ? c.spiritP : "The spirit strand is the corpus and its claims. It has no public endpoint on the queen yet, so there is nothing here to read."}
          </p>
        </section>
      )}
    </div>
  )
}
