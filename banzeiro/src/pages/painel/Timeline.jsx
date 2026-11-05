import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Wrench, Boat, Van, Car } from '@phosphor-icons/react'
import { KindDot, Avatar, cx, ease, useMedia } from '../../components/ui'
import { DEPARTURES, VEHICLES, KIND, tourOf, guideById, vehicleOf } from '../../data/mock'
import { viewStats, vehicleUse, DAY_START, DAY_END, PHASE, UNAVAILABLE, clamp01, range, t } from './helpers'

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => DAY_START / 60 + i)
const HEAD_H = 68
export const KIND_ICON = { boat: Boat, land: Van, transfer: Car }

export default function Timeline({ now, status }) {
  const mobile = useMedia('(max-width: 767px)')
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const leftW = mobile ? 116 : 196
  const rowH = mobile ? 60 : 66

  const scroller = useRef(null)
  const [w, setW] = useState(0)
  const [edge, setEdge] = useState({ l: false, r: false })
  const [tip, setTip] = useState(null)
  const didScroll = useRef(false)

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const hourW = Math.max(mobile ? 92 : 74, w ? (w - leftW) / HOURS.length : 96)
  const gridW = hourW * HOURS.length
  const x = useCallback((m) => ((m - DAY_START) / 60) * hourW, [hourW])

  const measureEdges = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }, [])

  // Leva o "agora" para a área visível na primeira medição
  useEffect(() => {
    const el = scroller.current
    if (!el || !w) return
    if (!didScroll.current && el.scrollWidth > el.clientWidth + 4) {
      el.scrollLeft = Math.max(0, x(now) - (w - leftW) * 0.32)
      didScroll.current = true
    }
    measureEdges()
  }, [w, hourW])

  useEffect(() => {
    if (!tip) return
    const off = () => setTip(null)
    window.addEventListener('scroll', off, { passive: true })
    return () => window.removeEventListener('scroll', off)
  }, [tip])

  const nowHour = Math.floor(now / 60)
  const showNow = now >= DAY_START && now <= DAY_END

  return (
    <section className="rounded-[32px] bg-surface p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Linha do dia</h2>
        {(
          <div className="hidden items-center gap-4 pr-1 md:flex">
            {Object.entries(KIND).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
                <KindDot kind={k} className="!size-[7px]" />
                {v.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-3">
        <div
          ref={scroller}
          onScroll={() => { measureEdges(); setTip(null) }}
          className="no-scrollbar relative overflow-x-auto overscroll-x-contain"
        >
          <div className="relative" style={{ width: leftW + gridW }}>
            {/* Cabeçalho de horas */}
            <div className="relative flex" style={{ height: HEAD_H }}>
              <div className="sticky left-0 z-20 shrink-0 bg-surface" style={{ width: leftW }} />
              {HOURS.map((h) => {
                const isNow = h === nowHour
                const past = h < nowHour
                return (
                  <div key={h} className="shrink-0 px-[3px]" style={{ width: hourW }}>
                    <div
                      className={cx(
                        'flex h-[40px] items-center justify-center rounded-[14px] font-mono text-[13px] tnum transition-colors duration-500',
                        isNow ? 'bg-now font-semibold text-white' : past ? 'bg-frame/60 font-medium text-ink-4' : 'bg-frame font-semibold text-ink',
                      )}
                    >
                      {h}:00
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Linhas */}
            {VEHICLES.map((v, ri) => {
              const deps = DEPARTURES.filter((d) => d.vehicleId === v.id)
              const off = UNAVAILABLE.filter((u) => u.vehicleId === v.id)
              const use = vehicleUse(v.id)
              return (
                <div key={v.id} className="relative flex" style={{ height: rowH }}>
                  <div className="sticky left-0 z-20 shrink-0 bg-surface py-[3px] pr-[3px]" style={{ width: leftW }}>
                    <div className="flex h-full flex-col justify-center rounded-[16px] bg-frame px-3.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <KindDot kind={v.kind} className="!size-[7px] shrink-0" />
                        <span className="truncate text-[13px] font-medium leading-tight text-ink md:text-[14px]">{v.name}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="shrink-0 text-[12px] text-ink-3 tnum">{v.capacity} lugares</span>
                        <div className="hidden h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-line md:block">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: KIND[v.kind].color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${use * 100}%` }}
                            transition={{ duration: 0.8, ease, delay: 0.2 + ri * 0.04 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative shrink-0" style={{ width: gridW }}>
                    <div className="absolute inset-0 flex">
                      {HOURS.map((h) => (
                        <div key={h} className="shrink-0 p-[3px]" style={{ width: hourW }}>
                          <div className={cx('h-full rounded-[12px]', h < nowHour ? 'bg-frame/50' : 'bg-frame')} />
                        </div>
                      ))}
                    </div>

                    {off.map((u) => (
                      <div
                        key={u.id}
                        className="hatch absolute flex items-center gap-1.5 overflow-hidden rounded-[14px] px-3 text-[11.5px] font-medium text-ink-3"
                        style={{ left: x(u.start) + 3, width: x(u.end) - x(u.start) - 6, top: 6, bottom: 6 }}
                      >
                        <Wrench size={13} className="shrink-0" />
                        <span className="truncate">{u.label}</span>
                      </div>
                    ))}

                    {deps.map((d, di) => (
                      <Block
                        key={d.id}
                        d={d}
                        i={ri + di}
                        now={now}
                        status={status}
                        x={x}
                        rowH={rowH}
                        reduce={reduce}
                        onOpen={() => navigate(`/embarque/${d.id}`)}
                        onHover={(rect) => !mobile && setTip({ d, rect })}
                        onLeave={() => setTip(null)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Linha do agora */}
            {showNow && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute bottom-0 z-10"
                style={{ top: 44, left: leftW }}
                initial={false}
                animate={{ x: x(now) }}
                transition={{ duration: reduce ? 0 : 1.4, ease: 'linear' }}
              >
                <div className="absolute bottom-2 left-0 top-[22px] -translate-x-1/2 border-l-[1.5px] border-dashed border-now" />
                <div className="absolute left-0 top-0 grid h-[22px] -translate-x-1/2 place-items-center rounded-full bg-now px-2 font-mono text-[11px] font-semibold text-white tnum shadow-dark">
                  {t(now)}
                </div>
                <div className="absolute bottom-0 left-0 size-2 -translate-x-1/2 rounded-full bg-now ring-[3px] ring-surface" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Bordas de rolagem */}
        <div
          className={cx('pointer-events-none absolute inset-y-0 z-30 w-6 bg-gradient-to-r from-ink/[0.06] to-transparent transition-opacity duration-200', edge.l ? 'opacity-100' : 'opacity-0')}
          style={{ left: leftW }}
        />
        <div className={cx('pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200', edge.r ? 'opacity-100' : 'opacity-0')} />
      </div>

      <Tip tip={tip} now={now} status={status} />
    </section>
  )
}

function Block({ d, i, now, status, x, rowH, reduce, onOpen, onHover, onLeave }) {
  const tour = tourOf(d)
  const vehicle = vehicleOf(d)
  const k = KIND[tour.kind]
  const Icon = KIND_ICON[tour.kind]
  const st = viewStats(d, status, now)
  const s = Math.max(d.start, DAY_START)
  const e = Math.min(d.end, DAY_END)
  const left = x(s) + 3
  const width = x(e) - x(s) - 6
  const h = Math.min(50, rowH - 14)
  const prog = clamp01((now - d.start) / (d.end - d.start))
  const compact = width < 118
  const showIcon = width >= 84
  const solid = st.phase !== 'scheduled'
  const done = st.phase === 'done'
  const live = st.phase === 'live' || st.phase === 'boarding'
  const over = !solid && st.total > vehicle.capacity
  const dark = tour.kind === 'boat' // ouro pede texto negro
  const fg = solid ? (dark ? 'text-negro' : 'text-white') : 'text-ink'

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={(ev) => onHover(ev.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      onFocus={(ev) => onHover(ev.currentTarget.getBoundingClientRect())}
      onBlur={onLeave}
      aria-label={`${tour.name}, ${range(d)}, ${PHASE[st.phase]}`}
      initial={reduce ? false : { opacity: 0, x: -6 }}
      animate={{ opacity: done ? 0.55 : 1, x: 0 }}
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.38, ease, delay: reduce ? 0 : 0.12 + i * 0.03, y: { type: 'spring', stiffness: 520, damping: 32 } }}
      className={cx(
        'group absolute z-[5] overflow-hidden rounded-[14px] text-left transition-shadow duration-200 hover:z-[6] hover:shadow-lift',
        solid ? 'shadow-[0_6px_16px_-10px_rgba(20,18,15,.55)]' : 'backdrop-blur-[2px]',
        fg,
      )}
      style={{
        left, width, top: (rowH - h) / 2, height: h,
        background: solid ? k.color : `color-mix(in oklab, ${k.tint} 82%, transparent)`,
        boxShadow: solid ? undefined : `inset 0 0 0 1px color-mix(in oklab, ${k.color} 55%, transparent)`,
      }}
    >
      {/* Progresso do passeio em curso */}
      {live && prog > 0 && (
        <span className="absolute inset-x-3 bottom-[5px] h-[2px] overflow-hidden rounded-full">
          <motion.span
            className={cx('block h-full rounded-full', dark ? 'bg-negro/35' : 'bg-white/55')}
            initial={false}
            animate={{ width: `${prog * 100}%` }}
            transition={{ duration: reduce ? 0 : 1.4, ease: 'linear' }}
          />
        </span>
      )}

      <span className={cx('relative flex h-full items-center gap-2.5 pr-2', showIcon ? 'pl-2' : 'pl-3')}>
        {showIcon && (
          <span
            className={cx('grid size-[30px] shrink-0 place-items-center rounded-full', solid ? (dark ? 'bg-white/30' : 'bg-white/20') : 'bg-surface/80')}
            style={solid ? undefined : { color: k.color }}
          >
            <Icon size={15} weight={solid ? 'fill' : 'regular'} />
          </span>
        )}
        <span className="min-w-0 flex-1 overflow-hidden">
          {compact ? (
            <span className="block truncate font-mono text-[11.5px] font-semibold tnum">{t(d.start)}</span>
          ) : (
            <>
              <span className="block truncate text-[13px] font-semibold leading-[1.2]">{tour.short}</span>
              <span className="mt-[3px] flex items-center gap-2 overflow-hidden whitespace-nowrap text-[12px] opacity-75">
                <span className="shrink-0 font-mono tnum">{over ? t(d.start) : range(d)}</span>
                {over && <span className="shrink-0 font-semibold text-alert tnum">{st.total}/{vehicle.capacity}</span>}
              </span>
            </>
          )}
        </span>
      </span>
    </motion.button>
  )
}

function Tip({ tip, now, status }) {
  if (typeof document === 'undefined') return null
  let style = null
  let below = false
  if (tip) {
    const W = 240
    const r = tip.rect
    const cxp = r.left + Math.min(r.width, 300) / 2
    const left = Math.max(12, Math.min(window.innerWidth - W - 12, cxp - W / 2))
    below = r.top < 210
    style = { left, top: below ? r.bottom + 8 : r.top - 8, width: W }
  }
  return createPortal(
    <AnimatePresence>
      {tip && (
        <div key={tip.d.id} className={cx('pointer-events-none fixed z-[90]', !below && '-translate-y-full')} style={style}>
          <motion.div
            initial={{ opacity: 0, y: below ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18, ease }}
          >
            <TipBody d={tip.d} now={now} status={status} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function TipBody({ d, now, status }) {
  const tour = tourOf(d)
  const vehicle = vehicleOf(d)
  const st = viewStats(d, status, now)
  const guides = d.guideIds.map(guideById)
  const started = st.phase !== 'scheduled'
  return (
    <div className="rounded-[16px] bg-negro p-3.5 text-white shadow-dark">
      <p className="truncate text-[13px] font-semibold">{tour.name}</p>
      <p className="mt-0.5 font-mono text-[11px] text-white/50 tnum">{d.code} · {range(d)}</p>
      <div className="my-3 h-px bg-white/10" />
      {guides.length ? (
        <ul className="space-y-2">
          {guides.map((g) => (
            <li key={g.id} className="flex items-center gap-2">
              <Avatar initials={g.initials} hue={g.hue} size={22} className="ring-1 ring-white/20" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-white/85">{g.name}</span>
              <span className="flex gap-1">
                {g.langs.filter((l) => l !== 'PT').map((l) => (
                  <span key={l} className="rounded-[5px] bg-white/10 px-1 font-mono text-[10px] font-semibold text-white/75">{l}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-white/75">Motorista {vehicle.skipper}</p>
      )}
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-white/50">{started ? 'Embarcados' : 'Lotação'}</span>
        <span className={cx('font-medium tnum', !started && st.total > vehicle.capacity ? 'text-alert' : 'text-white')}>
          {started ? st.boarded : st.total} de {started ? st.total : vehicle.capacity}
        </span>
      </div>
    </div>
  )
}
