import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { line, curveCatmullRom } from 'd3-shape'
import { ArrowUp } from '@phosphor-icons/react'
import { CountUp, cx, ease } from '../../components/ui'
import { DEPARTURES } from '../../data/mock'
import { useOps } from '../../store'
import { viewStats } from './helpers'

const HOURS = Array.from({ length: 14 }, (_, i) => 6 + i) // 6h a 19h
const ONTEM = [20, 30, 34, 18, 16, 22, 12, 26, 9, 14, 24, 8, 17, 6]
const W = 1000
const H = 200
const CH = 150 // altura do gráfico em px

const SEV_H = { high: 26, medium: 19, low: 13 }

export default function Stats({ now, status }) {
  const reduce = useReducedMotion()
  const divergences = useOps((s) => s.divergences)
  const stats = DEPARTURES.map((d) => ({ d, st: viewStats(d, status, now) }))
  const aboard = stats.filter((x) => x.st.phase === 'live' || x.st.phase === 'boarding').reduce((a, x) => a + x.st.boarded, 0)
  const open = divergences.filter((d) => !d.resolved).length
  const nowHour = Math.floor(now / 60)

  const hoje = HOURS.map((h) =>
    h > nowHour ? null : stats.filter((x) => Math.floor(x.d.start / 60) === h).reduce((a, x) => a + x.st.boarded, 0),
  )
  const max = Math.max(...ONTEM, ...hoje.filter((v) => v != null)) * 1.18
  const X = (i) => (i / (HOURS.length - 1)) * W
  const Y = (v) => H - 14 - (v / max) * (H - 40)
  const gen = line().x((_, i) => X(i)).y((v) => Y(v)).defined((v) => v != null).curve(curveCatmullRom.alpha(0.5))
  const pathHoje = useMemo(() => gen(hoje), [hoje.join(',')])
  const pathOntem = useMemo(() => gen(ONTEM), [max])

  const defIdx = Math.max(0, Math.min(HOURS.length - 1, nowHour - 6))
  const [hover, setHover] = useState(null)
  const idx = hover ?? defIdx
  const val = hoje[idx] ?? ONTEM[idx]
  const isHoje = hoje[idx] != null
  const pct = (X(idx) / W) * 100
  const top = (Y(val) / H) * CH
  const shift = pct < 14 ? '-18%' : pct > 86 ? '-82%' : '-50%'

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / r.width) * (HOURS.length - 1))
    setHover(Math.max(0, Math.min(HOURS.length - 1, i)))
  }

  return (
    <section className="rounded-[32px] bg-surface p-6">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Embarque de hoje</h2>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <CountUp value={aboard} className="text-[44px] font-semibold leading-none tracking-[-0.04em] text-ink ![font-feature-settings:normal] ![font-variant-numeric:normal] md:text-[50px]" />
            <span className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full bg-sunken px-2.5 text-[14px] text-ink-2">
              <ArrowUp size={14} weight="bold" className="text-ok" />
              <span className="font-semibold text-ink">8%</span> ontem
            </span>
          </div>
          <p className="mt-2 text-[15px] text-ink">Embarcados</p>
        </div>
        <div className="min-w-0">
          <div className="flex items-end gap-3">
            <CountUp value={open} className={cx('text-[44px] font-semibold leading-none tracking-[-0.04em] ![font-feature-settings:normal] ![font-variant-numeric:normal] md:text-[50px]', open ? 'text-ink' : 'text-ok')} />
            <span className="mb-1.5 flex items-end gap-[5px]" aria-hidden>
              {divergences.map((d) => (
                <motion.span
                  key={d.id}
                  className={cx('w-1 rounded-full', d.resolved ? 'bg-ok' : 'bg-ink')}
                  initial={false}
                  animate={{ height: d.resolved ? 8 : SEV_H[d.severity] }}
                  transition={{ duration: 0.4, ease }}
                />
              ))}
            </span>
          </div>
          <p className="mt-2 text-[15px] text-ink">Pendências</p>
        </div>
      </div>

      <div className="relative mt-8 select-none" style={{ height: CH }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {HOURS.map((h, i) => (
            <line key={h} x1={X(i)} x2={X(i)} y1={0} y2={H} stroke="var(--color-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={i === idx ? 1 : 0.55} />
          ))}
          <motion.path
            d={pathOntem}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease }}
          />
          <motion.path
            d={pathHoje}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
          />
        </svg>

        {/* ponto e balão */}
        <motion.span
          className={cx('pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-surface', isHoje ? 'bg-ink' : 'bg-gold')}
          initial={false}
          animate={{ left: `${pct}%`, top }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
        <motion.div
          className="pointer-events-none absolute"
          initial={false}
          animate={{ left: `${pct}%`, top: top - 16 }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        >
          <span className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-[9px] rotate-45 rounded-[2px] bg-negro" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${idx}-${val}`}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-0 left-0 whitespace-nowrap rounded-[16px] bg-negro px-3.5 py-2 text-[14px] text-white"
              style={{ transform: `translateX(${shift})` }}
            >
              <span className="font-semibold tnum">{val}</span> passageiros
              <span className="ml-1.5 text-white/50">{HOURS[idx]}h</span>
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[13px] text-ink-3">
        <span className="tnum">6h</span>
        <span className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-4 rounded-full bg-ink" /> Hoje</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-4 rounded-full bg-gold" /> Ontem</span>
        </span>
        <span className="tnum">19h</span>
      </div>
    </section>
  )
}
