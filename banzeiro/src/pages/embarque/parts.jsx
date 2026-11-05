import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowCounterClockwise, Check, Clock, MagnifyingGlass, X } from '@phosphor-icons/react'
import { cx, ease, Segmented, Button, IconButton, PhoneFrame } from '../../components/ui'
import { CHANNELS, LANGS, fmt, tourOf } from '../../data/mock'
import { depPhase, depStats } from '../../store'
import { GuideAppEmbed } from '../../app/GuiaApp'

/* ---------- helpers ---------- */

export const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

export function PaxAvatar({ p, size = 52, className }) {
  return (
    <span
      className={cx('inline-grid shrink-0 place-items-center rounded-full bg-surface font-semibold text-ink-2', className)}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials(p.name)}
    </span>
  )
}

export const paxState = (st) => (st?.s === 'boarded' ? 'boarded' : st?.s === 'noshow' ? 'noshow' : 'waiting')

export function StatusIcon({ st, size = 24, onSurface }) {
  const s = paxState(st)
  const ic = Math.round(size * 0.55)
  if (s === 'boarded')
    return (
      <span title={st.synced === false ? 'Salvo no celular' : 'Embarcado'} className={cx('grid shrink-0 place-items-center rounded-full', st.synced === false ? 'bg-gold text-negro' : 'bg-ok text-white')} style={{ width: size, height: size }}>
        <Check size={ic} weight="bold" />
      </span>
    )
  if (s === 'noshow')
    return <span title="Faltou" className="grid shrink-0 place-items-center rounded-full bg-alert-tint text-alert" style={{ width: size, height: size }}><X size={ic} weight="bold" /></span>
  return <span title="Aguardando" className={cx('grid shrink-0 place-items-center rounded-full text-ink-3', onSurface ? 'bg-sunken' : 'bg-surface')} style={{ width: size, height: size }}><Clock size={ic} weight="bold" /></span>
}

export const statusText = (st) => {
  const s = paxState(st)
  if (s === 'boarded') return `Embarcou ${fmt(st.at)}`
  if (s === 'noshow') return 'Faltou'
  return 'Aguardando'
}

export const depTitle = (d) => (d.route ? d.route : tourOf(d).short)

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

/* ---------- lista de saídas (coluna de horas + cartões) ---------- */

function DepartureItem({ d, now, status, active, onClick }) {
  const st = depStats(d.id, status)
  const done = depPhase(d, now) === 'done'
  return (
    <div className="flex items-start gap-3 border-t border-line py-1.5 first:border-0">
      <span className={cx('w-[46px] shrink-0 pt-3 text-[15px] font-semibold tnum', done ? 'text-ink-3' : 'text-ink')}>{fmt(d.start)}</span>
      <button
        onClick={onClick}
        aria-current={active ? 'true' : undefined}
        className={cx(
          'min-w-0 flex-1 rounded-[16px] px-3.5 py-2.5 text-left transition-[background] duration-150 active:scale-[0.99]',
          active ? 'bg-gold text-negro' : 'bg-surface hover:bg-sunken',
        )}
      >
        <span className={cx('block truncate text-[15px] font-medium', done && !active && 'text-ink-2')}>{depTitle(d)}</span>
        <span className={cx('block text-[13px] tnum', active ? 'text-negro/65' : 'text-ink-3')}>{st.boarded} de {st.total}</span>
      </button>
    </div>
  )
}

export function DepartureList({ groups, now, status, activeId, onPick, compact }) {
  return (
    <aside className={cx('no-scrollbar hidden shrink-0 flex-col overflow-y-auto rounded-[28px] bg-frame px-4 pb-3 shadow-soft xl:sticky xl:top-4 xl:flex xl:max-h-[calc(100dvh-2rem)]', compact ? 'xl:w-[264px]' : 'xl:w-[288px]')}>
      <h2 className="pb-1 pt-5 text-[21px] font-semibold tracking-[-0.02em]">Saídas de hoje</h2>
      {groups.map((g) => (
        <div key={g.key} className="mt-3">
          <p className="pb-1 text-[13px] text-ink-3">{g.label}</p>
          {g.items.map((d) => <DepartureItem key={d.id} d={d} now={now} status={status} active={d.id === activeId} onClick={() => onPick(d.id)} />)}
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
      {groups.flatMap((g) => g.items).map((d) => {
        const active = d.id === activeId
        const st = depStats(d.id, status)
        return (
          <button
            key={d.id}
            onClick={() => onPick(d.id)}
            aria-current={active ? 'true' : undefined}
            className={cx(
              'flex w-[168px] shrink-0 snap-start flex-col rounded-[20px] px-4 py-3 text-left transition-[background] duration-150 active:scale-[0.98]',
              active ? 'bg-gold text-negro' : 'bg-surface',
            )}
          >
            <span className="text-[16px] font-semibold tnum">{fmt(d.start)}</span>
            <span className="mt-1 truncate text-[13.5px] font-medium">{depTitle(d)}</span>
            <span className={cx('text-[12.5px] tnum', active ? 'text-negro/65' : 'text-ink-3')}>{st.boarded} de {st.total}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- detalhe do passageiro ---------- */

export function PaxDetail({ p, st, groupSize = 1, onClose, actions }) {
  const s = paxState(st)
  const lines = [
    ['Idioma', LANGS[p.lang].label],
    ['Hotel', p.hotel],
    ['Canal', CHANNELS[p.channel].label],
  ]
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[21px] font-semibold tracking-[-0.02em]">{p.name}</h3>
          <p className="mt-1 truncate text-[14px] text-ink-3">
            Reserva {p.booking}{groupSize > 1 && <> · <span className="tnum">{groupSize}</span></>}{p.child && ' · criança'}
          </p>
        </div>
        {onClose && <IconButton label="Fechar" onClick={onClose} className="-mr-1 -mt-1 !size-9"><X size={16} /></IconButton>}
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <StatusIcon st={st} size={24} onSurface />
        <span className="text-[15px] font-medium">
          {s === 'boarded' ? <>Embarcou às <span className="tnum">{fmt(st.at)}</span>{st.via === 'manual' ? ', manual' : ', pelo QR'}</> : s === 'noshow' ? 'Faltou' : 'Aguardando'}
        </span>
      </div>
      {s === 'boarded' && <p className="ml-[34px] mt-0.5 text-[13.5px] text-ink-3">{st.synced === false ? 'Salvo no celular' : 'Enviado'}</p>}

      <dl className="mt-4 grid gap-x-8 gap-y-2.5 @2xl:grid-cols-3">
        {lines.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 @2xl:block">
            <dt className="text-[13px] text-ink-3">{k}</dt>
            <dd className="truncate text-[14px]">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex gap-2">
        {s === 'waiting' && (
          <>
            <Button size="lg" onClick={actions.board} className="flex-1">Embarcar</Button>
            <Button size="lg" variant="light" onClick={actions.noshow} className="flex-1 !shadow-none !bg-sunken hover:!bg-line">Faltou</Button>
          </>
        )}
        {s !== 'waiting' && <Button size="lg" variant="light" icon={ArrowCounterClockwise} onClick={actions.undo} className="flex-1 !shadow-none !bg-sunken hover:!bg-line">Desfazer</Button>}
      </div>
    </div>
  )
}

/* ---------- passageiros (cartões de evento) ---------- */

export function Manifest({ pax, status, hoverId, setHoverId, selectedId, onSelect }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const counts = useMemo(() => {
    let boarded = 0, waiting = 0
    pax.forEach((p) => { const s = paxState(status[p.id]); if (s === 'boarded') boarded++; else if (s === 'waiting') waiting++ })
    return { all: pax.length, boarded, waiting }
  }, [pax, status])
  const size = useMemo(() => { const m = {}; pax.forEach((p) => { m[p.booking] = (m[p.booking] || 0) + 1 }); return m }, [pax])
  const norm = (x) => x.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const rows = pax.filter((p) => {
    const s = paxState(status[p.id])
    if (filter === 'boarded' && s !== 'boarded') return false
    if (filter === 'waiting' && s !== 'waiting') return false
    if (!q) return true
    const n = norm(q)
    return [p.name, p.booking].some((f) => norm(String(f)).includes(n))
  })

  return (
    <section className="@container rounded-[28px] bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Passageiros</h2>
        <Segmented
          value={filter}
          onChange={setFilter}
          className="self-start @3xl:self-auto"
          options={[
            { value: 'all', label: `Todos ${counts.all}` },
            { value: 'boarded', label: `Embarcados ${counts.boarded}` },
            { value: 'waiting', label: `Aguardando ${counts.waiting}` },
          ]}
        />
      </div>

      <label className="relative mt-4 block">
        <MagnifyingGlass size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nome ou reserva"
          aria-label="Buscar passageiro"
          className="h-[52px] w-full rounded-[18px] border border-line bg-surface pl-12 pr-4 text-[16px] text-ink outline-none transition-[border-color] placeholder:text-ink-3 focus:border-ink-4"
        />
      </label>

      <ul className="mt-4 grid gap-2.5 @3xl:grid-cols-2">
        <AnimatePresence initial={false}>
          {rows.map((p) => {
            const st = status[p.id]
            const hot = hoverId === p.id
            const sel = selectedId === p.id
            return (
              <motion.li key={p.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease }}>
                <button
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect(sel ? null : p.id)}
                  className={cx(
                    'relative flex w-full items-center gap-3.5 rounded-[20px] p-3.5 pr-12 text-left transition-[background,box-shadow] duration-150',
                    sel ? 'dots bg-gold-tint' : 'bg-sunken',
                    hot && !sel && 'ring-1 ring-ink/10',
                  )}
                >
                  <PaxAvatar p={p} size={52} />
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] font-medium leading-tight">{p.name}</span>
                    <span className="mt-0.5 block truncate text-[14px] text-ink-3">
                      Reserva {p.booking}{size[p.booking] > 1 && ` · ${size[p.booking]}`} · {p.lang}
                    </span>
                    <span className="mt-0.5 block text-[14px] text-ink-3 tnum">{statusText(st)}</span>
                  </span>
                  <span className="absolute right-3.5 top-3.5"><StatusIcon st={st} /></span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {rows.length === 0 && <li className="grid h-24 place-items-center text-[14px] text-ink-3 @3xl:col-span-2">Ninguém encontrado</li>}
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
