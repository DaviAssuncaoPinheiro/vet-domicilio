import { motion, useReducedMotion } from 'framer-motion'
import { line, curveMonotoneX } from 'd3-shape'
import { Globe, WhatsappLogo, Handshake, AppWindow, Bed } from '@phosphor-icons/react'
import { Card, CountUp, Reveal, ease } from '../../components/ui'
import { CHANNELS } from '../../data/mock'
import { channelStats } from './data'

const ICONS = { site: Globe, whatsapp: WhatsappLogo, agencia: Handshake, ota: AppWindow, hotel: Bed }
const W = 76, H = 26

function Spark({ series, color }) {
  const reduce = useReducedMotion()
  const max = Math.max(...series), min = Math.min(...series)
  const x = (i) => 3 + (i * (W - 6)) / (series.length - 1)
  const y = (v) => H - 4 - ((v - min) / Math.max(1, max - min)) * (H - 8)
  const d = line().x((_, i) => x(i)).y((v) => y(v)).curve(curveMonotoneX)(series)
  const last = series.length - 1
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0 overflow-visible">
      <motion.path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease, delay: 0.2 }} />
      <motion.circle cx={x(last)} cy={y(series[last])} r={2.6} fill={color} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
    </svg>
  )
}

export default function ChannelStrip() {
  const stats = channelStats()
  return (
    <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-5">
      {stats.map((s, i) => {
        const ch = CHANNELS[s.key]
        const Icon = ICONS[s.key]
        return (
          <Reveal key={s.key} i={i} className="min-w-[188px] shrink-0 snap-start md:min-w-0">
            <Card className="flex h-full flex-col justify-between gap-5 p-4">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-full bg-sunken text-ink-2"><Icon size={18} /></span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
                  <span className="live-dot !size-[6px] text-ok" /> Conectado
                </span>
              </div>
              <div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <CountUp value={s.count} className="font-mono text-[30px] font-medium leading-none tracking-[-0.03em]" />
                    <span className="text-[12px] text-ink-3">hoje</span>
                  </div>
                  <Spark series={s.series} color={ch.color} />
                </div>
                <p className="mt-2 truncate text-[13px] font-semibold text-ink">{ch.label}</p>
              </div>
            </Card>
          </Reveal>
        )
      })}
    </div>
  )
}
