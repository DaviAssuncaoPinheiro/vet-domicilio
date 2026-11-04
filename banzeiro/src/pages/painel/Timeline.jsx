import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Wrench, UsersThree, ArrowUpRight } from '@phosphor-icons/react'
import { Card, CardHeader, StatusChip, KindDot, Avatar, cx, ease, useMedia } from '../../components/ui'
import { DEPARTURES, VEHICLES, KIND, fmt, tourOf, guideById, vehicleOf } from '../../data/mock'
import { PHASE_LABEL } from '../../store'
import { viewStats, vehicleUse, DAY_START, DAY_END, PHASE_TONE, UNAVAILABLE, clamp01, range } from './helpers'

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => DAY_START / 60 + i)
const HEAD_H = 62

export default function Timeline({ now, status }) {
  const mobile = useMedia('(max-width: 767px)')
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const leftW = mobile ? 124 : 212
  const rowH = mobile ? 62 : 68

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

  // Centraliza o "agora" na primeira medição
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
  const liveCount = DEPARTURES.filter((d) => viewStats(d, status, now).phase === 'live').length

  return (
    <Card className="p-4 md:p-5">
      <CardHeader
        className="px-1"
        title="Linha do tempo do dia"
        sub={`${VEHICLES.length} embarcações e veículos · ${DEPARTURES.length} saídas · ${liveCount} em andamento`}
        right={
          <div className="hidden items-center gap-1 rounded-full bg-frame p-1 md:flex">
            {Object.entries(KIND).map(([k, v]) => (
              <span key={k} className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-ink-2">
                <KindDot kind={k} className="!size-[7px]" />
                {v.label}
              </span>
            ))}
          </div>
        }
      />

      <div className="relative mt-4">
        <div
          ref={scroller}
          onScroll={() => { measureEdges(); setTip(null) }}
          className="no-scrollbar relative overflow-x-auto overscroll-x-contain"
        >
          <div className="relative" style={{ width: leftW + gridW }}>
            {/* Cabeçalho de horas */}
            <div className="relative flex" style={{ height: HEAD_H }}>
              <div className="sticky left-0 z-20 flex shrink-0 items-start bg-surface pl-1 pt-2.5" style={{ width: leftW }}>
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Frota</span>
              </div>
              {HOURS.map((h) => {
                const isNow = h === nowHour
                const past = h < nowHour
                return (
                  <div key={h} className="shrink-0 px-[3px]" style={{ width: hourW }}>
                    <div
                      className={cx(
                        'flex h-[34px] items-center justify-center rounded-[11px] font-mono text-[11.5px] font-medium tnum transition-colors duration-500',
                        isNow ? 'bg-now text-white shadow-[0_8px_18px_-10px_rgba(61,109,245,.9)]' : past ? 'bg-frame text-ink-4' : 'bg-frame text-ink-2',
                      )}
                    >
                      {String(h).padStart(2, '0')}:00
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
                    <div className="flex h-full flex-col justify-center rounded-[14px] bg-frame px-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <KindDot kind={v.kind} className="!size-[7px] shrink-0" />
                        <span className="truncate text-[12.5px] font-semibold leading-tight text-ink md:text-[13px]">{v.name}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="shrink-0 font-mono text-[10.5px] text-ink-3 tnum">{v.capacity}<span className="hidden md:inline"> lugares</span><span className="md:hidden"> lug.</span></span>
                        <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-line">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: KIND[v.kind].color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${use * 100}%` }}
                            transition={{ duration: 0.8, ease, delay: 0.2 + ri * 0.04 }}
                          />
                        </div>
                        <span className="hidden w-7 shrink-0 text-right font-mono text-[10.5px] text-ink-3 tnum md:inline">{Math.round(use * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative shrink-0" style={{ width: gridW }}>
                    <div className="absolute inset-0 flex">
                      {HOURS.map((h) => (
                        <div key={h} className="shrink-0 p-[3px]" style={{ width: hourW }}>
                          <div className={cx('h-full rounded-[12px] transition-colors duration-500', h === nowHour ? 'bg-now-tint/70' : 'bg-frame/70')} />
                        </div>
                      ))}
                    </div>

                    {off.map((u) => (
                      <div
                        key={u.id}
                        className="hatch absolute flex items-center gap-1.5 overflow-hidden rounded-[14px] px-3 text-[11.5px] font-semibold text-ink-3"
                        style={{ left: x(u.start) + 3, width: x(u.end) - x(u.start) - 6, top: 6, bottom: 6 }}
                      >
                        <Wrench size={13} weight="bold" className="shrink-0" />
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
                style={{ top: 40, left: leftW }}
                initial={false}
                animate={{ x: x(now) }}
                transition={{ duration: reduce ? 0 : 1.4, ease: 'linear' }}
              >
                <div className="absolute bottom-2 left-0 top-[22px] -translate-x-1/2 border-l-[1.5px] border-dashed border-now" />
                <div className="absolute left-0 top-0 grid h-[22px] -translate-x-1/2 place-items-center rounded-full bg-now px-2 font-mono text-[11px] font-semibold text-white tnum shadow-[0_6px_14px_-6px_rgba(61,109,245,.9)]">
                  {fmt(now)}
                </div>
                <div className="absolute bottom-0 left-0 size-2 -translate-x-1/2 rounded-full bg-now ring-[3px] ring-now-tint" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Bordas de rolagem */}
        <div
          className={cx('pointer-events-none absolute inset-y-0 z-30 w-6 bg-gradient-to-r from-black/[0.05] to-transparent transition-opacity duration-200', edge.l ? 'opacity-100' : 'opacity-0')}
          style={{ left: leftW }}
        />
        <div className={cx('pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200', edge.r ? 'opacity-100' : 'opacity-0')} />
      </div>

      <Tip tip={tip} now={now} status={status} />
    </Card>
  )
}

function Block({ d, i, now, status, x, rowH, reduce, onOpen, onHover, onLeave }) {
  const tour = tourOf(d)
  const vehicle = vehicleOf(d)
  const k = KIND[tour.kind]
  const st = viewStats(d, status, now)
  const s = Math.max(d.start, DAY_START)
  const e = Math.min(d.end, DAY_END)
  const left = x(s) + 3
  const width = x(e) - x(s) - 6
  const h = Math.min(52, rowH - 12)
  const prog = clamp01((now - d.start) / (d.end - d.start))
  const compact = width < 118
  const showChip = width >= 236
  const showCount = width >= (showChip ? 318 : 172)
  const done = st.phase === 'done'
  const started = st.phase !== 'scheduled'
  const count = started ? `${st.boarded} de ${st.total}` : `${st.total} de ${vehicle.capacity}`
  const over = !started && st.total > vehicle.capacity

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={(ev) => onHover(ev.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      onFocus={(ev) => onHover(ev.currentTarget.getBoundingClientRect())}
      onBlur={onLeave}
      aria-label={`${tour.name}, ${range(d)}, ${PHASE_LABEL[st.phase]}`}
      initial={reduce ? false : { opacity: 0, x: -6 }}
      animate={{ opacity: done ? 0.6 : 1, x: 0 }}
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.38, ease, delay: reduce ? 0 : 0.12 + i * 0.03, y: { type: 'spring', stiffness: 520, damping: 32 } }}
      className="group absolute z-[5] overflow-hidden rounded-[14px] text-left shadow-[0_1px_2px_rgba(19,19,22,.06)] transition-shadow duration-200 hover:z-[6] hover:shadow-lift"
      style={{ left, width, top: (rowH - h) / 2, height: h, background: k.tint }}
    >
      {prog > 0 && prog < 1 && (
        <motion.span
          className="absolute inset-y-0 left-0"
          style={{ background: `color-mix(in oklab, ${k.color} 15%, transparent)` }}
          initial={false}
          animate={{ width: `${prog * 100}%` }}
          transition={{ duration: reduce ? 0 : 1.4, ease: 'linear' }}
        />
      )}
      {prog > 0 && prog < 1 && (
        <motion.span
          className="absolute inset-y-[10px] w-px"
          style={{ background: `color-mix(in oklab, ${k.color} 45%, transparent)` }}
          initial={false}
          animate={{ left: `${prog * 100}%` }}
          transition={{ duration: reduce ? 0 : 1.4, ease: 'linear' }}
        />
      )}
      <span className="absolute inset-y-[9px] left-[6px] w-[3px] rounded-full" style={{ background: k.color }} />

      <span className={cx('relative flex h-full items-center gap-2 pr-2', compact ? 'pl-3.5' : 'pl-4')}>
        {compact ? (
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block truncate font-mono text-[11.5px] font-semibold leading-[1.2] text-ink tnum">{fmt(d.start)}</span>
            <span className={cx('mt-[3px] block truncate font-mono text-[10.5px] tnum', over ? 'font-semibold text-alert' : 'text-ink-2/80')}>{started ? st.boarded : st.total}/{vehicle.capacity}</span>
          </span>
        ) : (
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block truncate text-[12.5px] font-semibold leading-[1.2] text-ink">{tour.short}</span>
            <span className="mt-[3px] flex items-center gap-1.5 overflow-hidden whitespace-nowrap font-mono text-[10.5px] text-ink-2/80 tnum">
              <span className="shrink-0">{range(d)}</span>
              {showCount && (
                <>
                  <span className="text-ink-4">·</span>
                  <span className={cx('inline-flex items-center gap-1', over && 'font-semibold text-alert')}>
                    <UsersThree size={11} weight="bold" className="opacity-70" />
                    {count}
                  </span>
                </>
              )}
            </span>
          </span>
        )}
        {showChip && (
          <StatusChip tone={PHASE_TONE[st.phase]} live={st.phase === 'live' || st.phase === 'boarding'} className="shrink-0">
            {PHASE_LABEL[st.phase]}
          </StatusChip>
        )}
      </span>
    </motion.button>
  )
}

function Tip({ tip, now, status }) {
  if (typeof document === 'undefined') return null
  let style = null
  let below = false
  if (tip) {
    const W = 264
    const r = tip.rect
    const cxp = r.left + Math.min(r.width, 300) / 2
    const left = Math.max(12, Math.min(window.innerWidth - W - 12, cxp - W / 2))
    below = r.top < 230
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
  return (
    <div className="rounded-[16px] bg-negro p-3.5 text-white shadow-dark">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">{tour.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-white/55 tnum">{d.code} · {range(d)}</p>
        </div>
        <ArrowUpRight size={14} weight="bold" className="mt-0.5 shrink-0 text-white/40" />
      </div>
      <div className="my-3 h-px bg-white/10" />
      {guides.length ? (
        <ul className="space-y-2">
          {guides.map((g) => (
            <li key={g.id} className="flex items-center gap-2">
              <Avatar initials={g.initials} hue={g.hue} size={22} />
              <span className="min-w-0 flex-1 truncate text-[12px] text-white/85">{g.name}</span>
              <span className="flex gap-1">
                {g.langs.map((l) => (
                  <span key={l} className="rounded-[5px] bg-white/10 px-1 font-mono text-[10px] font-semibold text-white/75">{l}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-white/70">
          {d.route ?? 'Sem guia escalado'}
          <span className="block text-white/45">Motorista {vehicle.skipper}</span>
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-[11.5px]">
        <span className="text-white/55">{vehicle.name}</span>
        <span className="font-mono text-white/85 tnum">
          {st.phase === 'scheduled' ? `${st.total} de ${vehicle.capacity} reservados` : `${st.boarded} de ${st.total} a bordo`}
        </span>
      </div>
    </div>
  )
}
