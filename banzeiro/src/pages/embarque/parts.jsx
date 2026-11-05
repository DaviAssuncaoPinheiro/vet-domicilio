import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowCounterClockwise, Check, Clock, HandTap, MagnifyingGlass, QrCode, X } from '@phosphor-icons/react'
import { cx, ease, StatusChip, LangTag, Segmented, Button, IconButton, PhoneFrame } from '../../components/ui'
import { CHANNELS, KIND, LANGS, fmt, tourOf } from '../../data/mock'
import { depPhase, depStats } from '../../store'
import { GuideAppEmbed } from '../../app/GuiaApp'

/* ---------- helpers ---------- */

export const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

export function PaxAvatar({ p, size = 32, className }) {
  return (
    <span
      className={cx('inline-grid shrink-0 place-items-center rounded-full bg-sunken font-semibold text-ink-2', className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(p.name)}
    </span>
  )
}

export const paxState = (st) => (st?.s === 'boarded' ? 'boarded' : st?.s === 'noshow' ? 'noshow' : 'waiting')

export function PaxStatusChip({ st }) {
  const s = paxState(st)
  if (s === 'boarded') return <StatusChip tone="ok">Embarcado</StatusChip>
  if (s === 'noshow') return <StatusChip tone="alert">Faltou</StatusChip>
  return <StatusChip tone="muted">Aguardando</StatusChip>
}

export const depTitle = (d) => (d.route ? d.route : tourOf(d).short)
export const PHASE_LABEL = { boarding: 'Embarcando', live: 'Em andamento', scheduled: 'Agendada', done: 'Concluída' }

export function PhaseChip({ phase }) {
  if (phase === 'boarding') return <StatusChip tone="ink" live>{PHASE_LABEL.boarding}</StatusChip>
  if (phase === 'live') return <StatusChip tone="ok">{PHASE_LABEL.live}</StatusChip>
  return <StatusChip tone="muted">{PHASE_LABEL[phase]}</StatusChip>
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
  const st = depStats(d.id, status)
  const done = depPhase(d, now) === 'done'
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cx(
        'relative flex h-12 w-full items-center gap-3 rounded-[16px] pl-4 pr-3 text-left transition-[background,box-shadow] duration-150 active:scale-[0.99]',
        active ? 'bg-gold text-negro shadow-[0_8px_20px_-12px_rgba(20,18,15,.45)]' : 'hover:bg-surface/60',
      )}
    >
      {!active && <span className="absolute bottom-3.5 left-[7px] top-3.5 w-[3px] rounded-full" style={{ background: KIND[tourOf(d).kind].color, opacity: done ? 0.4 : 1 }} />}
      <span className={cx('w-[42px] shrink-0 font-mono text-[13px] tnum', active ? 'text-negro' : 'text-ink-2')}>{fmt(d.start)}</span>
      <span className={cx('min-w-0 flex-1 truncate text-[13.5px] font-medium', done && !active ? 'text-ink-3' : active ? 'text-negro' : 'text-ink')}>{depTitle(d)}</span>
      <span className={cx('shrink-0 text-[12.5px] tnum', active ? 'text-negro/70' : 'text-ink-3')}><span className={active ? 'text-negro' : 'text-ink'}>{st.boarded}</span>/{st.total}</span>
    </button>
  )
}

export function DepartureList({ groups, now, status, activeId, onPick, compact }) {
  return (
    <aside className={cx('no-scrollbar hidden shrink-0 flex-col overflow-y-auto rounded-[28px] bg-frame p-2 shadow-soft xl:sticky xl:top-4 xl:flex xl:max-h-[calc(100dvh-2rem)]', compact ? 'xl:w-[264px]' : 'xl:w-[288px]')}>
      <h2 className="px-3 pb-1 pt-3 text-[17px] font-semibold tracking-[-0.01em]">Saídas de hoje</h2>
      {groups.map((g) => (
        <div key={g.key} className="mt-3">
          <p className="px-3 pb-1.5 text-[12px] text-ink-3">{g.label}</p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((d) => <DepartureItem key={d.id} d={d} now={now} status={status} active={d.id === activeId} onClick={() => onPick(d.id)} />)}
          </div>
        </div>
      ))}
    </aside>
  )
}

export function DepartureStrip({ groups, status, activeId, onPick }) {
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
          return (
            <button
              key={d.id}
              onClick={() => onPick(d.id)}
              aria-current={active ? 'true' : undefined}
              className={cx(
                'relative flex w-[164px] shrink-0 snap-start flex-col gap-1 overflow-hidden rounded-[18px] py-2.5 pl-4 pr-3 text-left transition-[background,box-shadow] duration-150 active:scale-[0.98]',
                active ? 'bg-gold text-negro' : 'bg-frame/70 hover:bg-surface/70',
              )}
            >
              {!active && <span className="absolute bottom-3 left-[7px] top-3 w-[3px] rounded-full" style={{ background: KIND[tourOf(d).kind].color }} />}
              <span className="flex items-center justify-between">
                <span className="font-mono text-[13px] tnum">{fmt(d.start)}</span>
                <span className={cx('text-[12px] tnum', active ? 'text-negro/70' : 'text-ink-3')}><span className={active ? 'text-negro' : 'text-ink'}>{st.boarded}</span>/{st.total}</span>
              </span>
              <span className="truncate text-[13px] font-medium">{depTitle(d)}</span>
            </button>
          )
        }),
      ])}
    </div>
  )
}

/* ---------- detalhe do passageiro ---------- */

function Row({ label, children }) {
  return (
    <div className="flex min-h-[40px] items-center justify-between gap-3 border-b border-line/70 py-1.5">
      <span className="text-[12.5px] text-ink-3">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-right text-[13px] text-ink">{children}</span>
    </div>
  )
}

export function PaxDetail({ p, st, groupSize = 1, onClose, actions }) {
  const s = paxState(st)
  const meta = [p.hotel, CHANNELS[p.channel].label, p.child && 'Criança'].filter(Boolean).join(' · ')
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-semibold tracking-[-0.01em]">{p.name}</h3>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-3">{meta}</p>
        </div>
        {onClose && <IconButton label="Fechar" onClick={onClose} className="-mr-1 -mt-1 !size-9"><X size={16} /></IconButton>}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[14px] bg-sunken px-3.5 py-3">
        <span className="flex items-baseline gap-1.5">
          <span className="font-mono text-[15px] font-medium">{p.booking}</span>
          <span className="text-[12.5px] text-ink-3 tnum">· {groupSize} {groupSize === 1 ? 'pessoa' : 'pessoas'}</span>
        </span>
        <PaxStatusChip st={st} />
      </div>

      <div className="mt-1.5 grid gap-x-8 @2xl:grid-cols-2">
        <Row label="Idioma">{LANGS[p.lang].label}</Row>
        {s === 'boarded' && (
          <>
            <Row label="Embarcou">
              <span className="font-mono text-[12.5px]">{fmt(st.at)}</span>
              <span className="text-ink-3">· {st.via === 'manual' ? 'manual' : 'QR'}</span>
            </Row>
            <Row label="Envio">
              {st.synced === false ? <span className="text-gold-deep">Salvo no celular</span> : <span className="text-ink-2">Enviado</span>}
            </Row>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {s === 'waiting' && (
          <>
            <Button icon={Check} onClick={actions.board} className="flex-1">Embarcar</Button>
            <Button variant="light" onClick={actions.noshow} className="flex-1">Faltou</Button>
          </>
        )}
        {s !== 'waiting' && <Button variant="light" icon={ArrowCounterClockwise} onClick={actions.undo} className="flex-1">Desfazer</Button>}
      </div>
    </div>
  )
}

/* ---------- lista de embarque ---------- */

const COLS = '@2xl:grid-cols-[minmax(0,1fr)_64px_128px_112px_56px]'

export function Manifest({ pax, status, hoverId, setHoverId, selectedId, onSelect }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const counts = useMemo(() => {
    let boarded = 0, waiting = 0
    pax.forEach((p) => { const s = paxState(status[p.id]); if (s === 'boarded') boarded++; else if (s === 'waiting') waiting++ })
    return { all: pax.length, boarded, waiting }
  }, [pax, status])
  const norm = (x) => x.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const rows = pax.filter((p) => {
    const s = paxState(status[p.id])
    if (filter === 'boarded' && s !== 'boarded') return false
    if (filter === 'waiting' && s !== 'waiting') return false
    if (!q) return true
    const n = norm(q)
    return [p.name, p.booking].some((f) => norm(String(f)).includes(n))
  })
  const size = useMemo(() => { const m = {}; pax.forEach((p) => { m[p.booking] = (m[p.booking] || 0) + 1 }); return m }, [pax])
  const label = (t, n) => <span className="inline-flex items-center gap-1.5">{t}<span className="text-[11.5px] tnum text-ink-3">{n}</span></span>

  return (
    <section className="@container rounded-[24px] bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Passageiros</h2>
        <div className="flex flex-col gap-2 @md:flex-row @md:items-center">
          <label className="relative flex-1 @2xl:w-[200px] @2xl:flex-none">
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar"
              aria-label="Buscar passageiro"
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
              { value: 'boarded', label: label('Embarcados', counts.boarded) },
              { value: 'waiting', label: label('Aguardando', counts.waiting) },
            ]}
          />
        </div>
      </div>

      <div className={cx('mt-4 hidden h-8 items-center gap-3 rounded-[10px] bg-sunken px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 @2xl:grid', COLS)}>
        <span>Nome</span><span>Idioma</span><span>Reserva</span><span>Status</span><span className="text-right">Hora</span>
      </div>

      <ul className="mt-2 flex flex-col gap-1.5 @2xl:gap-0">
        <AnimatePresence initial={false}>
          {rows.map((p, ri) => {
            const st = status[p.id]
            const prevSame = rows[ri - 1]?.booking === p.booking
            const nextSame = rows[ri + 1]?.booking === p.booking
            const inGroup = prevSame || nextSame
            const s = paxState(st)
            const hot = hoverId === p.id
            const sel = selectedId === p.id
            return (
              <motion.li key={p.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease }}>
                <button
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect(sel ? null : p.id)}
                  className={cx(
                    'relative flex w-full items-center gap-3 rounded-[14px] p-2.5 pl-4 text-left transition-[background,box-shadow] duration-150 @2xl:grid @2xl:min-h-[50px] @2xl:p-0 @2xl:px-3',
                    COLS,
                    sel ? 'bg-sunken ring-1 ring-ink/15' : hot ? 'bg-sunken' : 'bg-sunken/60 @2xl:bg-transparent',
                  )}
                >
                  {inGroup && (
                    <span aria-hidden className={cx('absolute left-1.5 w-[2px] rounded-full bg-ink/15', prevSame ? 'top-0 @2xl:top-0' : 'top-3', nextSame ? 'bottom-0' : 'bottom-3')} />
                  )}
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    <PaxAvatar p={p} size={32} />
                    <span className="truncate text-[13.5px] font-medium">{p.name}</span>
                    <LangTag code={p.lang} className="@2xl:hidden" />
                  </span>
                  <span className="hidden @2xl:block"><LangTag code={p.lang} /></span>
                  <span className="hidden text-[12px] text-ink-2 @2xl:block">
                    <span className="font-mono">{p.booking}</span>
                    {size[p.booking] > 1 && <span className="text-ink-3 tnum"> · {size[p.booking]}</span>}
                  </span>
                  <span className="hidden @2xl:block"><PaxStatusChip st={st} /></span>
                  <span className="hidden items-center justify-end gap-1 font-mono text-[12px] text-ink-2 @2xl:flex">
                    {s === 'boarded' && (
                      <>
                        {st.synced === false && <Clock size={12} className="text-gold-deep" weight="bold" aria-label="Salvo no celular" />}
                        {fmt(st.at)}
                      </>
                    )}
                  </span>
                  <span className="shrink-0 @2xl:hidden">
                    {s === 'boarded' ? (
                      <span className={cx('grid size-7 place-items-center rounded-full', st.synced === false ? 'bg-gold text-negro' : 'bg-ok text-white')}>
                        {st.synced === false ? <Clock size={13} weight="bold" /> : <Check size={13} weight="bold" />}
                      </span>
                    ) : s === 'noshow' ? <StatusChip tone="alert">Faltou</StatusChip> : <span className="block size-7" />}
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {rows.length === 0 && <li className="grid h-24 place-items-center text-[13px] text-ink-3">Ninguém encontrado</li>}
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
            className="absolute inset-x-2 bottom-2 top-2 flex flex-col items-center gap-4 overflow-y-auto rounded-[32px] bg-frame p-4 shadow-lift md:inset-x-auto md:bottom-4 md:right-4 md:top-4 md:w-[440px]"
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
