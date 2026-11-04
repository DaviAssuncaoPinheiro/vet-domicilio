import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowCounterClockwise, Check, Clock, CloudCheck, HandTap, MagnifyingGlass, QrCode, UserMinus, X, Bed, Ticket, Translate, Broadcast,
} from '@phosphor-icons/react'
import { cx, ease, StatusChip, LangTag, CountryCode, Segmented, Button, IconButton, PhoneFrame, Time } from '../../components/ui'
import { CHANNELS, COUNTRY_NAME, KIND, LANGS, fmt, tourOf, vehicleOf } from '../../data/mock'
import { depPhase, depStats } from '../../store'
import { GuideAppEmbed } from '../../app/GuiaApp'

/* ---------- helpers ---------- */

const TINTS = ['bg-boat-tint', 'bg-now-tint', 'bg-transfer-tint', 'bg-land-tint', 'bg-alert-tint', 'bg-ok-tint']
const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
export const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

export function PaxAvatar({ p, size = 32, className }) {
  return (
    <span
      className={cx('inline-grid shrink-0 place-items-center rounded-full font-semibold text-ink-2', TINTS[hash(p.booking) % TINTS.length], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(p.name)}
    </span>
  )
}

export const paxState = (st) => (st?.s === 'boarded' ? 'boarded' : st?.s === 'noshow' ? 'noshow' : 'waiting')

export function PaxStatusChip({ st }) {
  const s = paxState(st)
  if (s === 'boarded') return <StatusChip tone={st.synced === false ? 'land' : 'ok'}>{st.synced === false ? 'Na fila' : 'A bordo'}</StatusChip>
  if (s === 'noshow') return <StatusChip tone="alert">Ausente</StatusChip>
  return <StatusChip tone="muted">Aguardando</StatusChip>
}

export const depTitle = (d) => (d.route ? d.route : tourOf(d).short)
export const PHASE_SHORT = { boarding: 'Embarque', live: 'Em curso', scheduled: 'Agendada', done: 'Concluída' }

export function PhaseChip({ phase }) {
  if (phase === 'boarding') return <StatusChip tone="now" live>{PHASE_SHORT.boarding}</StatusChip>
  if (phase === 'live') return <StatusChip tone="ok" live>{PHASE_SHORT.live}</StatusChip>
  return <StatusChip tone="muted">{PHASE_SHORT[phase]}</StatusChip>
}

export function groupDepartures(deps, now) {
  const order = { boarding: 0, live: 1 }
  const agora = deps.filter((d) => ['boarding', 'live'].includes(depPhase(d, now))).sort((a, b) => order[depPhase(a, now)] - order[depPhase(b, now)] || a.start - b.start)
  const depois = deps.filter((d) => depPhase(d, now) === 'scheduled').sort((a, b) => a.start - b.start)
  const feitas = deps.filter((d) => depPhase(d, now) === 'done').sort((a, b) => b.start - a.start)
  return [
    { key: 'agora', label: 'Agora', items: agora },
    { key: 'depois', label: 'Mais tarde', items: depois },
    { key: 'feitas', label: 'Concluídas', items: feitas },
  ].filter((g) => g.items.length)
}

/* ---------- lista de saídas ---------- */

function DepartureItem({ d, now, status, active, onClick }) {
  const v = vehicleOf(d)
  const st = depStats(d.id, status)
  const phase = depPhase(d, now)
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cx(
        'relative flex w-full items-center gap-3 rounded-[18px] py-2.5 pl-4 pr-3 text-left transition-[background,box-shadow] duration-150 active:scale-[0.99]',
        active ? 'bg-surface shadow-pill' : 'hover:bg-surface/60',
      )}
    >
      <span className="absolute bottom-3 left-[7px] top-3 w-[3px] rounded-full" style={{ background: KIND[tourOf(d).kind].color, opacity: phase === 'done' && !active ? 0.45 : 1 }} />
      <span className={cx('w-[42px] shrink-0 font-mono text-[13px] font-medium tnum', active ? 'text-ink' : 'text-ink-2')}>{fmt(d.start)}</span>
      <span className="min-w-0 flex-1">
        <span className={cx('block truncate text-[13.5px] font-medium', phase === 'done' && !active ? 'text-ink-2' : 'text-ink')}>{depTitle(d)}</span>
        <span className="block truncate text-[12px] text-ink-3">{v.name}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[12px] tnum text-ink-2">
          <span className="text-ink">{st.boarded}</span>/{st.total}
        </span>
        {phase === 'boarding' || phase === 'live' ? <span className={cx('live-dot !size-[6px]', phase === 'boarding' ? 'text-now' : 'text-ok')} /> : null}
      </span>
    </button>
  )
}

export function DepartureList({ groups, now, status, activeId, onPick, compact }) {
  return (
    <aside className={cx('no-scrollbar hidden shrink-0 flex-col overflow-y-auto rounded-[28px] bg-frame p-2 shadow-soft xl:sticky xl:top-4 xl:flex xl:max-h-[calc(100dvh-2rem)]', compact ? 'xl:w-[272px]' : 'xl:w-[300px]')}>
      <div className="px-3 pb-2 pt-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Saídas de hoje</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-3">Quarta, 4 de novembro</p>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="mt-2">
          <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{g.label}</span>
            <span className="font-mono text-[11px] text-ink-4">{g.items.length}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {g.items.map((d) => <DepartureItem key={d.id} d={d} now={now} status={status} active={d.id === activeId} onClick={() => onPick(d.id)} />)}
          </div>
        </div>
      ))}
    </aside>
  )
}

export function DepartureStrip({ groups, now, status, activeId, onPick }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current?.querySelector('[aria-current="true"]')
    if (el && ref.current) ref.current.scrollTo({ left: Math.max(0, el.offsetLeft - 16), behavior: 'smooth' })
  }, [activeId])
  return (
    <div ref={ref} className="no-scrollbar relative -mx-2 flex snap-x gap-2 overflow-x-auto px-2 pb-1 sm:-mx-3 sm:px-3 md:-mx-4 md:px-4 xl:hidden">
      {groups.flatMap((g, gi) => [
        gi > 0 ? <span key={`sep-${g.key}`} className="my-3 w-px shrink-0 bg-ink/10" /> : null,
        ...g.items.map((d) => {
          const active = d.id === activeId
          const st = depStats(d.id, status)
          const phase = depPhase(d, now)
          return (
            <button
              key={d.id}
              onClick={() => onPick(d.id)}
              aria-current={active ? 'true' : undefined}
              className={cx(
                'relative flex w-[176px] shrink-0 snap-start flex-col gap-1.5 overflow-hidden rounded-[20px] p-3 pl-4 text-left transition-[background,box-shadow] duration-150 active:scale-[0.98]',
                active ? 'bg-surface shadow-pill' : 'bg-frame/70 hover:bg-surface/70',
              )}
            >
              <span className="absolute bottom-3 left-[7px] top-3 w-[3px] rounded-full" style={{ background: KIND[tourOf(d).kind].color }} />
              <span className="flex items-center justify-between">
                <span className="font-mono text-[13px] font-medium tnum">{fmt(d.start)}</span>
                {phase === 'boarding' || phase === 'live' ? <span className={cx('live-dot !size-[6px]', phase === 'boarding' ? 'text-now' : 'text-ok')} /> : <span className="text-[11px] text-ink-3">{PHASE_SHORT[phase]}</span>}
              </span>
              <span className="truncate text-[13px] font-medium">{depTitle(d)}</span>
              <span className="flex items-center justify-between text-[11.5px] text-ink-3">
                <span className="truncate">{vehicleOf(d).name}</span>
                <span className="font-mono tnum text-ink-2">{st.boarded}/{st.total}</span>
              </span>
            </button>
          )
        }),
      ])}
    </div>
  )
}

/* ---------- detalhe do passageiro ---------- */

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex min-h-[38px] items-center justify-between gap-3 border-b border-line/70 py-1.5">
      <span className="flex items-center gap-2 text-[12.5px] text-ink-3"><Icon size={15} />{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-right text-[13px] text-ink">{children}</span>
    </div>
  )
}

export function PaxDetail({ p, st, onClose, actions }) {
  const s = paxState(st)
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3">
        <PaxAvatar p={p} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-semibold tracking-[-0.01em]">{p.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-3">
            <CountryCode code={p.country} />
            <span className="truncate">{COUNTRY_NAME[p.country]}</span>
            {p.child && <span className="rounded-full bg-sunken px-1.5 text-[11px] font-medium text-ink-2">Criança</span>}
          </div>
        </div>
        {onClose && <IconButton label="Fechar" onClick={onClose} className="-mr-1 -mt-1 !size-9"><X size={16} /></IconButton>}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[14px] bg-sunken px-3 py-2.5">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[20px] font-medium tracking-[-0.03em] tnum">{p.seat}</span>
          <span className="text-[12px] text-ink-3">assento</span>
        </span>
        <PaxStatusChip st={st} />
      </div>

      <div className="mt-2 grid gap-x-8 @2xl:grid-cols-2">
        <Row icon={Translate} label="Idioma"><LangTag code={p.lang} /><span className="text-ink-2">{LANGS[p.lang].label}</span></Row>
        <Row icon={Ticket} label="Reserva"><span className="font-mono text-[12.5px]">{p.booking}</span></Row>
        <Row icon={Broadcast} label="Canal">
          <span className="size-1.5 rounded-full" style={{ background: CHANNELS[p.channel].color }} />
          <span className="truncate">{CHANNELS[p.channel].label}</span>
        </Row>
        <Row icon={Bed} label="Hotel"><span className="truncate">{p.hotel}</span></Row>
        {s === 'boarded' && (
          <>
            <Row icon={st.via === 'manual' ? HandTap : QrCode} label="Embarque">
              <Time m={st.at} className="text-[12.5px]" />
              <span className="text-ink-3">· {st.via === 'manual' ? 'manual' : 'QR Code'}</span>
            </Row>
            <Row icon={st.synced === false ? Clock : CloudCheck} label="Sincronização">
              {st.synced === false ? <span className="font-medium text-land">Na fila</span> : <span className="text-ink-2">Sincronizado</span>}
            </Row>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {s === 'waiting' && (
          <>
            <Button icon={HandTap} onClick={actions.board} className="flex-1 whitespace-nowrap">Embarcar manualmente</Button>
            <Button variant="light" icon={UserMinus} onClick={actions.noshow} className="flex-1 whitespace-nowrap">Marcar ausência</Button>
          </>
        )}
        {s !== 'waiting' && <Button variant="light" icon={ArrowCounterClockwise} onClick={actions.undo} className="flex-1">Desfazer</Button>}
      </div>
    </div>
  )
}

export function PlanSummary({ pax, status, stats, guide }) {
  const langs = useMemo(() => {
    const m = {}
    pax.forEach((p) => { m[p.lang] = (m[p.lang] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [pax])
  const rows = [
    { label: 'A bordo', n: stats.boarded, sw: 'bg-ok' },
    { label: 'Aguardando', n: stats.waiting, sw: 'bg-boat-tint ring-1 ring-inset ring-boat/25' },
    { label: 'Ausentes', n: stats.noshow, sw: 'hatch' },
  ]
  return (
    <div className="grid gap-x-10 @2xl:grid-cols-2">
      <div className="flex flex-col">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Resumo</span>
      <div className="mt-2">
        {rows.map((r) => (
          <div key={r.label} className="flex h-10 items-center justify-between border-b border-line/70 last:border-0">
            <span className="flex items-center gap-2.5 text-[13px] text-ink-2"><span className={cx('size-[11px] rounded-[4px]', r.sw)} />{r.label}</span>
            <span className="font-mono text-[15px] font-medium tnum">{r.n}</span>
          </div>
        ))}
      </div>
      </div>
      <div className="flex flex-col">
      <span className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 @2xl:mt-0">Idiomas</span>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {langs.map(([code, n]) => {
          const covered = !guide || guide.langs.includes(code)
          return (
            <span key={code} title={covered ? LANGS[code].label : `${LANGS[code].label} · sem guia no idioma`} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-sunken pl-1 pr-2.5">
              <LangTag code={code} className={cx('!h-5 !rounded-full', covered ? '!bg-surface' : '!bg-surface !text-ink-3')} />
              <span className="font-mono text-[12px] tnum text-ink-2">{n}</span>
            </span>
          )
        })}
      </div>
      <p className="mt-5 text-[12.5px] text-ink-3">Toque em um assento para ver o passageiro.</p>
      </div>
    </div>
  )
}

/* ---------- lista de embarque ---------- */

export function Manifest({ pax, status, hoverId, setHoverId, selectedId, onSelect }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const counts = useMemo(() => {
    let boarded = 0, waiting = 0
    pax.forEach((p) => { const s = paxState(status[p.id]); if (s === 'boarded') boarded++; else if (s === 'waiting') waiting++ })
    return { all: pax.length, boarded, waiting }
  }, [pax, status])
  const bookings = new Set(pax.map((p) => p.booking)).size
  const norm = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const rows = pax.filter((p) => {
    const s = paxState(status[p.id])
    if (filter === 'boarded' && s !== 'boarded') return false
    if (filter === 'waiting' && s !== 'waiting') return false
    if (!q) return true
    const n = norm(q)
    return [p.name, p.booking, p.seat, p.hotel, p.country, p.lang].some((f) => norm(String(f)).includes(n))
  })
  const label = (t, n) => <span className="inline-flex items-center gap-1.5">{t}<span className="font-mono text-[11px] text-ink-3 tnum">{n}</span></span>

  return (
    <section className="@container rounded-[24px] bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Lista de embarque</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-3"><span className="font-mono tnum">{pax.length}</span> passageiros · <span className="font-mono tnum">{bookings}</span> reservas</p>
        </div>
        <div className="flex flex-col gap-2 @md:flex-row @md:items-center">
          <label className="relative flex-1 @2xl:w-[220px] @2xl:flex-none">
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome, reserva ou assento"
              className="h-10 w-full rounded-full bg-sunken pl-10 pr-4 text-[13px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:bg-surface focus:shadow-pill"
            />
          </label>
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            className="self-start"
            options={[
              { value: 'all', label: label('Todos', counts.all) },
              { value: 'boarded', label: label('A bordo', counts.boarded) },
              { value: 'waiting', label: label('Aguardando', counts.waiting) },
            ]}
          />
        </div>
      </div>

      {/* cabeçalho da tabela */}
      <div className="mt-4 hidden h-8 items-center gap-3 rounded-[10px] bg-sunken px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_56px_96px_52px_104px_60px] @4xl:grid-cols-[minmax(0,1fr)_56px_minmax(0,0.7fr)_96px_52px_104px_60px]">
        <span>Passageiro</span><span>Idioma</span><span className="hidden @4xl:block">Canal</span><span>Reserva</span><span>Lugar</span><span>Status</span><span className="text-right">Hora</span>
      </div>

      <ul className="mt-2 flex flex-col gap-1.5 @2xl:gap-0">
        <AnimatePresence initial={false}>
          {rows.map((p) => {
            const st = status[p.id]
            const s = paxState(st)
            const hot = hoverId === p.id
            const sel = selectedId === p.id
            return (
              <motion.li
                key={p.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease }}
              >
                <button
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect(sel ? null : p.id)}
                  className={cx(
                    'w-full rounded-[14px] text-left transition-[background,box-shadow] duration-150',
                    'flex items-center gap-3 p-2.5 @2xl:grid @2xl:min-h-[52px] @2xl:grid-cols-[minmax(0,1fr)_56px_96px_52px_104px_60px] @2xl:p-0 @2xl:px-3 @4xl:grid-cols-[minmax(0,1fr)_56px_minmax(0,0.7fr)_96px_52px_104px_60px]',
                    sel ? 'bg-now-tint/70 ring-1 ring-now/25' : hot ? 'bg-sunken' : 'bg-sunken/60 @2xl:bg-transparent',
                  )}
                >
                  {/* passageiro */}
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    <PaxAvatar p={p} size={32} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-medium">{p.name}</span>
                        <span className="hidden @2xl:inline-flex"><CountryCode code={p.country} /></span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3 @2xl:hidden">
                        <CountryCode code={p.country} />
                        <LangTag code={p.lang} className="!h-[18px]" />
                        <span className="truncate">{CHANNELS[p.channel].label}</span>
                      </span>
                      <span className="hidden truncate text-[11.5px] text-ink-3 @2xl:block">{p.hotel}</span>
                    </span>
                  </span>
                  <span className="hidden @2xl:block"><LangTag code={p.lang} /></span>
                  <span className="hidden min-w-0 items-center gap-1.5 text-[12.5px] text-ink-2 @4xl:flex">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: CHANNELS[p.channel].color }} />
                    <span className="truncate">{CHANNELS[p.channel].label}</span>
                  </span>
                  <span className="hidden font-mono text-[12px] text-ink-2 @2xl:block">{p.booking}</span>
                  {/* lugar */}
                  <span className={cx('grid h-7 min-w-[34px] shrink-0 place-items-center justify-self-start rounded-[8px] px-1.5 font-mono text-[11.5px] font-semibold tnum',
                    s === 'boarded' ? 'bg-ok-tint text-ok' : s === 'noshow' ? 'hatch text-ink-3' : 'bg-boat-tint text-boat')}>
                    {p.seat}
                  </span>
                  <span className="hidden @2xl:block"><PaxStatusChip st={st} /></span>
                  <span className="hidden items-center justify-end gap-1 font-mono text-[12px] tnum text-ink-2 @2xl:flex">
                    {s === 'boarded' ? (
                      <>
                        {st.synced === false ? <Clock size={12} className="text-land" weight="bold" /> : st.via === 'manual' ? <HandTap size={12} className="text-ink-3" /> : <QrCode size={12} className="text-ink-3" />}
                        {fmt(st.at)}
                      </>
                    ) : <span className="text-ink-4">··</span>}
                  </span>
                  {/* mobile: status compacto */}
                  <span className="shrink-0 @2xl:hidden">
                    {s === 'boarded' ? (
                      <span className={cx('grid size-7 place-items-center rounded-full text-white', st.synced === false ? 'bg-land' : 'bg-ok')}>
                        {st.synced === false ? <Clock size={13} weight="bold" /> : <Check size={13} weight="bold" />}
                      </span>
                    ) : s === 'noshow' ? <StatusChip tone="alert">Ausente</StatusChip> : <span className="font-mono text-[11px] text-ink-4">··</span>}
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {rows.length === 0 && <li className="grid h-24 place-items-center text-[13px] text-ink-3">Nenhum passageiro</li>}
      </ul>
    </section>
  )
}

/* ---------- app do guia ---------- */

function useFitScale(maxH, maxW) {
  const calc = () => (typeof window === 'undefined' ? 1 : Math.min(1, (window.innerHeight - maxH) / 800, (window.innerWidth - maxW) / 372))
  const [sc, setSc] = useState(calc)
  useEffect(() => {
    const fn = () => setSc(calc())
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return Math.max(0.55, sc)
}

function ScaledPhone({ depId, scale }) {
  return (
    <div className="mx-auto" style={{ width: 372 * scale, height: 800 * scale }}>
      <div style={{ width: 372, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PhoneFrame><GuideAppEmbed depId={depId} /></PhoneFrame>
      </div>
    </div>
  )
}

const CAPTION = 'Leia o QR Code no app e veja a planta atualizar.'

export function GuideColumn({ depId, onClose }) {
  const scale = useFitScale(110, 0)
  const reduce = useReducedMotion()
  return (
    <motion.aside
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.32, ease }}
      className="sticky top-4 hidden w-[392px] shrink-0 flex-col gap-3 xl:flex"
    >
      <div className="flex items-center justify-between gap-3 rounded-full bg-frame py-1.5 pl-4 pr-1.5 shadow-soft">
        <p className="text-[12.5px] text-ink-2">{CAPTION}</p>
        <IconButton label="Fechar app do guia" onClick={onClose} className="bg-surface shadow-pill"><X size={16} /></IconButton>
      </div>
      <ScaledPhone depId={depId} scale={scale} />
    </motion.aside>
  )
}

export function GuideSheet({ open, depId, onClose }) {
  const scale = useFitScale(150, 32)
  useEffect(() => {
    if (!open) return
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-negro/40 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-label="App do guia"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.9, 0.3, 1] }}
            className="absolute inset-x-2 bottom-2 top-2 flex flex-col items-center gap-4 overflow-y-auto rounded-[32px] bg-frame p-4 shadow-lift md:inset-x-auto md:right-4 md:top-4 md:bottom-4 md:w-[440px]"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <p className="pl-2 text-[12.5px] text-ink-2">{CAPTION}</p>
              <IconButton label="Fechar app do guia" onClick={onClose} className="bg-surface shadow-pill"><X size={16} /></IconButton>
            </div>
            <ScaledPhone depId={depId} scale={scale} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[65]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-negro/30" />
          <motion.div
            role="dialog"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.2, 0.9, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-lift"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/10" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
