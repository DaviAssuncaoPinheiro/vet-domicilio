import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { sankey as d3sankey, sankeyLinkHorizontal } from 'd3-sankey'
import { ArrowsHorizontal } from '@phosphor-icons/react'
import { Card, CardHeader, Reveal, ease } from '../../components/ui'
import { useOps } from '../../store'
import { buildGraph } from './data'

const H = 540
const TOP = 36
const MIN_W = 720
const HEADERS = ['Canal', 'Roteiro', 'Embarcação', 'Situação']
const plural = (n) => `${n} ${n === 1 ? 'passageiro' : 'passageiros'}`
const linkPath = sankeyLinkHorizontal()

export default function FlowSankey({ onAlert }) {
  const status = useOps((s) => s.status)
  const divergences = useOps((s) => s.divergences)
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [w, setW] = useState(1000)
  const [hover, setHover] = useState(null)
  const [tip, setTip] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(MIN_W, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const raw = useMemo(() => buildGraph(status, divergences), [status, divergences])
  const g = useMemo(() => {
    const mL = 156, mR = 116
    const gen = d3sankey()
      .nodeId((d) => d.id)
      .nodeWidth(10)
      .nodePadding(20)
      .nodeAlign((n) => n.col)
      .nodeSort((a, b) => a.order - b.order)
      .extent([[mL, TOP], [w - mR, H - 6]])
    return gen({ nodes: raw.nodes.map((n) => ({ ...n })), links: raw.links.map((l) => ({ ...l })) })
  }, [raw, w])

  const active = useMemo(() => {
    if (!hover) return null
    if (hover.type === 'link') return new Set([hover.item.index])
    const set = new Set()
    const up = (n) => n.targetLinks.forEach((l) => { set.add(l.index); up(l.source) })
    const down = (n) => n.sourceLinks.forEach((l) => { set.add(l.index); down(l.target) })
    up(hover.item); down(hover.item)
    return set
  }, [hover])

  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top })
  }
  const isAlert = (n) => n.id === 's:alert'

  let tipText = ''
  if (hover?.type === 'link') tipText = `${hover.item.source.name} para ${hover.item.target.name} · ${plural(hover.item.value)}`
  if (hover?.type === 'node') tipText = `${hover.item.name} · ${plural(hover.item.value)}`

  const colX = [0, 1, 2, 3].map((c) => g.nodes.find((n) => n.col === c)?.x0 ?? 0)

  return (
    <Reveal i={2}>
      <Card className="p-5 md:p-7">
        <CardHeader
          title="Fluxo de passageiros"
          sub="Do canal de venda até a situação no embarque"
          right={<span className="hidden items-center gap-2 rounded-full bg-sunken px-3 py-1.5 text-[12px] text-ink-2 sm:inline-flex"><span className="live-dot !size-[6px] text-ok" /><span className="font-mono tnum">{raw.total}</span> passageiros hoje</span>}
        />
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-3 md:hidden"><ArrowsHorizontal size={14} /> Deslize para ver o fluxo completo</p>
        <div className="-mx-5 mt-2 overflow-x-auto px-5 no-scrollbar md:mx-0 md:mt-4 md:px-0">
          <div ref={ref} className="relative" style={{ minWidth: MIN_W, height: H }} onPointerMove={move} onPointerLeave={() => setHover(null)}>
            <svg width={w} height={H} className="block overflow-visible" role="img" aria-label="Fluxo de passageiros por canal, roteiro, embarcação e situação">
              <defs>
                {g.links.map((l) => (
                  <linearGradient key={l.index} id={`fl-${l.index}`} gradientUnits="userSpaceOnUse" x1={l.source.x1} x2={l.target.x0}>
                    <stop offset="0" stopColor={l.source.color} />
                    <stop offset="1" stopColor={l.target.color} />
                  </linearGradient>
                ))}
              </defs>

              {HEADERS.map((h, i) => (
                <text key={h} x={i === 0 ? 0 : colX[i]} y={12} className="fill-ink-3" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</text>
              ))}

              <g fill="none">
                {g.links.map((l) => (
                  <g
                    key={l.index}
                    style={{ opacity: active ? (active.has(l.index) ? 0.6 : 0.08) : 0.28, transition: 'opacity 150ms', cursor: isAlert(l.target) ? 'pointer' : 'default' }}
                    onPointerEnter={() => setHover({ type: 'link', item: l })}
                    onClick={() => isAlert(l.target) && onAlert?.()}
                  >
                    <motion.path
                      d={linkPath(l)}
                      stroke={`url(#fl-${l.index})`}
                      strokeWidth={Math.max(1, l.width)}
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, ease, delay: l.source.col * 0.28 + l.index * 0.006 }}
                    />
                  </g>
                ))}
              </g>

              {g.nodes.map((n) => {
                const left = n.col === 0
                const mid = n.col === 1 || n.col === 2
                const cy = (n.y0 + n.y1) / 2
                return (
                  <g
                    key={n.id}
                    onPointerEnter={() => setHover({ type: 'node', item: n })}
                    onClick={() => isAlert(n) && onAlert?.()}
                    style={{ cursor: isAlert(n) ? 'pointer' : 'default' }}
                  >
                    <motion.rect
                      x={n.x0} y={n.y0} width={10} height={Math.max(2, n.y1 - n.y0)} rx={5} fill={n.color}
                      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, delay: n.col * 0.12 }}
                    />
                    <text
                      x={left ? n.x0 - 12 : n.x1 + 12}
                      y={cy}
                      dy="0.34em"
                      textAnchor={left ? 'end' : 'start'}
                      style={{ paintOrder: 'stroke', stroke: mid ? '#fff' : 'none', strokeWidth: 4, strokeLinejoin: 'round' }}
                    >
                      <tspan className="fill-ink" style={{ fontSize: 13, fontWeight: 600 }}>{n.name}</tspan>
                      <tspan dx={6} className="fill-ink-3 font-mono" style={{ fontSize: 12 }}>{n.value}</tspan>
                    </text>
                  </g>
                )
              })}
            </svg>

            {hover && (
              <div
                className="pointer-events-none absolute z-10 max-w-[300px] rounded-[12px] bg-negro px-3 py-2 text-[12.5px] leading-snug text-white shadow-dark"
                style={{ left: Math.max(4, Math.min(tip.x + 14, w - 300)), top: Math.max(4, tip.y - 44) }}
              >
                {tipText}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Reveal>
  )
}
