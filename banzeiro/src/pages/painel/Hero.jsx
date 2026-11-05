import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, MagnifyingGlass, X, ArrowRight, Boat, Warning, CalendarCheck, CalendarBlank, Bell, Check } from '@phosphor-icons/react'
import { Avatar, cx, ease, useMedia } from '../../components/ui'
import { DEPARTURES, PASSENGERS, depById, tourOf, vehicleOf } from '../../data/mock'
import { useOps } from '../../store'
import { viewStats, norm, initialsOf, t, SHORT_TITLE, SHORT_ACTION } from './helpers'

/* --------------------------------------------------- botões redondos (mobile) */

export function TopButtons({ onBell, alert }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between md:hidden">
      <button aria-label="Reservas" onClick={() => navigate('/reservas')} className="grid size-14 place-items-center rounded-full bg-surface text-ink transition-transform active:scale-95">
        <CalendarBlank size={20} weight="fill" />
      </button>
      <button aria-label="Pendências" onClick={onBell} className="relative grid size-14 place-items-center rounded-[20px] bg-surface text-ink transition-transform active:scale-95">
        <Bell size={20} weight="fill" />
        {alert && <span className="absolute right-[17px] top-[16px] size-2 rounded-full bg-gold ring-2 ring-surface" />}
      </button>
    </div>
  )
}

/* ----------------------------------------------------------------- herói */

export function HeroNumber({ now, status }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-[60px] font-semibold leading-[0.95] tracking-[-0.04em] text-ink md:text-[66px]">{DEPARTURES.length}</span>
        </div>
        <p className="mt-2 text-[16px] text-ink">Saídas hoje</p>
      </div>
      <button
        aria-label="Nova reserva"
        onClick={() => navigate('/reservas?nova=1')}
        className="grid size-14 shrink-0 place-items-center rounded-full bg-negro text-white transition-transform duration-150 hover:bg-negro-2 active:scale-95"
      >
        <Plus size={22} weight="bold" />
      </button>
    </div>
  )
}

/* ----------------------------------------------------------------- busca */

export function SearchBar({ query, setQuery }) {
  const navigate = useNavigate()
  const [focus, setFocus] = useState(false)
  const q = norm(query.trim())
  const matches = useMemo(() => {
    if (q.length < 2) return []
    return PASSENGERS.filter((p) => norm(p.name).includes(q) || norm(p.booking).includes(q)).slice(0, 5)
  }, [q])
  const open = focus && q.length >= 2

  return (
    <div className="relative z-30">
      <label className="flex h-[52px] items-center gap-3 rounded-[18px] border border-line bg-surface px-4 transition-[border-color] duration-150 focus-within:border-ink-4">
        <MagnifyingGlass size={20} className="shrink-0 text-ink-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
          placeholder="Buscar passageiro ou reserva"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3"
          aria-label="Buscar passageiro ou reserva"
        />
        {query && (
          <button aria-label="Limpar" onClick={() => setQuery('')} className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-ink-2">
            <X size={13} weight="bold" />
          </button>
        )}
      </label>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease }}
            className="absolute inset-x-0 top-[60px] rounded-[20px] bg-surface p-2 shadow-lift"
          >
            {matches.length === 0 ? (
              <p className="px-3 py-3 text-[14px] text-ink-3">Nada encontrado</p>
            ) : (
              matches.map((p) => {
                const d = depById(p.depId)
                return (
                  <button
                    key={p.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => navigate(`/embarque/${d.id}`)}
                    className="flex w-full items-center gap-3 rounded-[14px] px-2.5 py-2 text-left transition-colors hover:bg-frame"
                  >
                    <Avatar initials={initialsOf(p.name)} hue="var(--color-ink-2)" size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{p.name}</span>
                      <span className="block truncate text-[13px] text-ink-3">{tourOf(d).short} · {t(d.start)} · {p.booking}</span>
                    </span>
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------- cards de ação */

function Curves({ dark }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 250 240" preserveAspectRatio="none" aria-hidden>
      <g fill="none" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)'} strokeWidth="1">
        <path d="M-20 168 C 60 132, 140 196, 270 150" />
        <path d="M-20 190 C 70 160, 150 222, 270 178" />
        <path d="M-20 212 C 80 186, 160 246, 270 206" />
      </g>
    </svg>
  )
}

function ActionCard({ tone, icon: Icon, title, line, label, onClick }) {
  const dark = tone === 'dark'
  const bg = { gold: 'bg-gold-light text-ink', dark: 'bg-negro text-white', sunken: 'bg-sunken text-ink' }[tone]
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cx('relative flex h-[240px] w-[250px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] p-5 text-left md:w-auto', bg)}
    >
      <Curves dark={dark} />
      <span className="relative grid size-12 place-items-center rounded-full bg-surface text-ink">
        <Icon size={20} weight="fill" />
      </span>
      <span className="relative mt-auto block text-[21px] font-semibold leading-tight tracking-[-0.02em]">{title}</span>
      <span className={cx('relative mt-1 block text-[15px] leading-snug', dark ? 'text-white/70' : 'text-ink-2')}>{line}</span>
      <span className="relative mt-5 flex items-center justify-between gap-3">
        <span className={cx('text-[12px] font-medium uppercase tracking-[0.04em]', dark ? 'text-white/60' : 'text-ink-2')}>{label}</span>
        <span className={cx('grid size-[52px] shrink-0 place-items-center rounded-full', dark ? 'bg-gold text-negro' : 'bg-negro text-white')}>
          <ArrowRight size={20} weight="bold" />
        </span>
      </span>
    </motion.button>
  )
}

export function ActionCards({ now, status, onPendencias }) {
  const navigate = useNavigate()
  const divergences = useOps((s) => s.divergences)
  const shifts = useOps((s) => s.shifts)
  const open = divergences.filter((d) => !d.resolved)
  const d7 = depById('d7')
  const st7 = viewStats(d7, status, now)
  const firstOpen = open[0]
  const fDep = firstOpen && depById(firstOpen.depId)
  const noGuide = shifts.filter((s) => s.day === 3 && !s.guideId).length

  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
      <ActionCard
        tone="gold"
        icon={Boat}
        title="Conferir embarque"
        line={`${vehicleOf(d7).name} às ${t(d7.start)}`}
        label={st7.phase === 'boarding' ? 'Embarcando' : st7.phase === 'live' ? 'Em rota' : 'Embarque'}
        onClick={() => navigate('/embarque/d7')}
      />
      <ActionCard
        tone="dark"
        icon={Warning}
        title={firstOpen ? SHORT_TITLE[firstOpen.id] ?? firstOpen.title : 'Tudo certo'}
        line={firstOpen ? `${tourOf(fDep).short} das ${t(fDep.start)}` : 'Nada pendente'}
        label={open.length > 1 ? `${open.length} pendências` : 'Pendência'}
        onClick={onPendencias}
      />
      <ActionCard
        tone="sunken"
        icon={CalendarCheck}
        title="Escala de amanhã"
        line={noGuide ? `${noGuide} ${noGuide === 1 ? 'saída sem guia' : 'saídas sem guia'}` : 'Todos com guia'}
        label="Escala"
        onClick={() => navigate('/escala')}
      />
    </div>
  )
}

/* ------------------------------------------------------ folha de pendências */

export function PendenciasSheet({ open, onClose, now }) {
  const divergences = useOps((s) => s.divergences)
  const resolve = useOps((s) => s.resolveDivergence)
  const reduce = useReducedMotion()
  const mobile = useMedia('(max-width: 767px)')
  const list = divergences.filter((d) => !d.resolved)
  const [pending, setPending] = useState(null)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const onResolve = (id) => {
    if (pending) return
    setPending(id)
    timer.current = setTimeout(() => { resolve(id); setPending(null) }, reduce ? 0 : 520)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-negro/35" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Pendências"
            initial={mobile ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={mobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={mobile ? { y: '100%' } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.2, 0.9, 0.3, 1] }}
            className="relative w-full max-w-[460px] rounded-t-[28px] bg-surface p-5 pb-8 md:rounded-[28px] md:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">Pendências</h2>
              <button aria-label="Fechar" onClick={onClose} className="grid size-11 place-items-center rounded-[12px] bg-sunken text-ink transition-transform active:scale-95">
                <X size={16} weight="bold" />
              </button>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {list.map((x) => {
                  const d = depById(x.depId)
                  const isP = pending === x.id
                  return (
                    <motion.li
                      key={x.id}
                      layout
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.3, ease } }}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      title={x.detail}
                      className={cx('flex items-center gap-3 rounded-[20px] p-3.5 pl-4 transition-colors duration-300', isP ? 'bg-ok-tint' : 'bg-frame')}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-medium text-ink">{SHORT_TITLE[x.id] ?? x.title}</span>
                        <span className="block truncate text-[14px] text-ink-3">{tourOf(d).short} · {t(d.start)}</span>
                      </span>
                      <button
                        onClick={() => onResolve(x.id)}
                        disabled={!!pending && !isP}
                        className={cx('inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-[background,transform] duration-200 active:scale-[0.96] disabled:opacity-50', isP ? 'bg-ok text-white' : 'bg-negro text-white hover:bg-negro-2')}
                      >
                        {isP ? <><Check size={14} weight="bold" /> Feito</> : SHORT_ACTION[x.type] ?? 'Resolver'}
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            <AnimatePresence>
              {list.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="flex flex-col items-center py-8 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><Check size={22} weight="bold" /></span>
                  <p className="mt-4 text-[16px] font-medium text-ink">Listas conferidas. Nada pendente.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
