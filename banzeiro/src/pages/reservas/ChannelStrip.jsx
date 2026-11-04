import { motion, useReducedMotion } from 'framer-motion'
import { line, curveMonotoneX } from 'd3-shape'
import { Globe, WhatsappLogo, Handshake, AppWindow, Bed } from '@phosphor-icons/react'
import { Card, CountUp, Reveal, ease } from '../../components/ui'
import { CHANNELS } from '../../data/mock'
import { channelStats } from './data'

export const ICONS = { site: Globe, whatsapp: WhatsappLogo, agencia: Handshake, ota: AppWindow, hotel: Bed }
const W = 56, H = 22

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
      <motion.circle cx={x(last)} cy={y(series[last])} r={2.4} fill={color} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
    </svg>
  )
}

export default function ChannelStrip() {
  const stats = channelStats()
  return (
    <Reveal i={1}>
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-5">
          {stats.map((s) => {
            const ch = CHANNELS[s.key]
            const Icon = ICONS[s.key]
            return (
              <div key={s.key} className="flex min-w-[196px] shrink-0 items-center gap-3 border-l border-line px-4 py-3.5 first:border-l-0 md:min-w-0">
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-ink-2">
                  <Icon size={17} />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-ok ring-2 ring-surface" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] text-ink-3">{ch.label}</p>
                  <CountUp value={s.count} className="font-mono text-[22px] font-medium leading-tight tracking-[-0.03em]" />
                </div>
                <Spark series={s.series} color={ch.color} />
              </div>
            )
          })}
        </div>
      </Card>
    </Reveal>
  )
}
