import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardHeader, Reveal, cx, ease } from '../../components/ui'
import { ROWS, DAYS, TODAY, tm, occOf, weekTotals } from './week-data'

const WAVE = 'M0 3 Q12.5 0 25 3 T50 3 T75 3 T100 3 T125 3 T150 3 T175 3 T200 3 V8 H0 Z'

function Wave({ reduce }) {
  return (
    <div className="absolute inset-x-0 -top-[5px] h-[8px] overflow-hidden">
      <motion.svg viewBox="0 0 200 8" preserveAspectRatio="none" className="h-full w-[200%] fill-gold" animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 4, ease: 'linear', repeat: Infinity }}>
        <path d={WAVE} />
      </motion.svg>
    </div>
  )
}

function Cell({ ri, di, o, delay, past, flash, reduce, onOpen, onTip }) {
  const pct = Math.min(1, o.booked / o.cap)
  const full = o.booked >= o.cap
  const over = o.over > 0
  return (
    <button
      onClick={() => onOpen(ri, di)}
      onPointerEnter={(e) => onTip(e, ri, di)}
      onPointerMove={(e) => onTip(e, ri, di)}
      onPointerLeave={() => onTip(null)}
      aria-label={`${ROWS[ri].label} ${tm(ROWS[ri].start)}, ${o.booked} de ${o.cap}`}
      className={cx(
        'relative mx-auto h-[56px] w-full overflow-hidden rounded-[14px] transition-[transform,box-shadow] duration-200 hover:scale-[1.04] active:scale-[0.98] md:h-[72px] md:max-w-[104px]',
        full ? 'bg-negro' : 'bg-sunken',
        over && 'ring-2 ring-alert',
        flash && 'ring-2 ring-gold-light',
        past && !full && 'opacity-60',
      )}
    >
      {!full && o.booked > 0 && (
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-gold"
          initial={reduce ? false : { height: '0%' }}
          animate={{ height: `${pct * 100}%` }}
          transition={{ duration: 0.9, ease, delay }}
        >
          <Wave reduce={reduce} />
        </motion.div>
      )}
      <span className="relative z-10 flex h-full flex-col items-center justify-center leading-none">
        <span className={cx('text-[12px] font-semibold tnum md:text-[13.5px]', full ? 'text-gold' : o.booked === 0 ? 'text-ink-3' : 'text-ink')}>{o.booked}/{o.cap}</span>
        {full && !over && <span className="mt-1 text-[10px] font-medium text-gold-light">Lotado</span>}
      </span>
    </button>
  )
}

export default function Heatmap({ extra, flash, onOpen }) {
  const reduce = useReducedMotion()
  const [entered, setEntered] = useState(false)
  const [tip, setTip] = useState(null)
  const box = useRef(null)
  useEffect(() => { const t = setTimeout(() => setEntered(true), 1600); return () => clearTimeout(t) }, [])

  const onTip = (e, ri, di) => {
    if (!e) return setTip(null)
    const r = box.current.getBoundingClientRect()
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, ri, di })
  }
  const { pct, free } = weekTotals(extra)
  const tipO = tip && occOf(tip.ri, tip.di, extra)
  const tipRow = tip && ROWS[tip.ri]

  return (
    <Reveal i={1}>
      <Card className="p-5 md:p-7">
        <CardHeader
          title="Mapa da semana"
          sub="Ocupação de cada saída"
          right={
            <div className="hidden items-center gap-4 text-[12px] text-ink-3 sm:flex">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-sunken ring-1 ring-line" />Vago</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-gold" />Enchendo</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-negro" />Lotado</span>
            </div>
          }
        />

        <div className="-mx-5 mt-5 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
          <div ref={box} className="relative grid min-w-[500px] grid-cols-[124px_repeat(7,minmax(44px,1fr))] items-center gap-x-2 gap-y-2 md:min-w-0 md:grid-cols-[196px_repeat(7,minmax(0,1fr))] md:gap-x-3 md:gap-y-3">
            <span className="sticky left-0 z-20 self-stretch bg-surface" aria-hidden />
            {DAYS.map((d) => (
              <div key={d.idx} className="flex justify-center">
                <span className={cx('inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-medium', d.idx === TODAY ? 'bg-negro text-white' : d.idx < TODAY ? 'text-ink-4' : 'text-ink-2')}>
                  {d.short} <span className="tnum">{d.day}</span>
                </span>
              </div>
            ))}

            {ROWS.map((row, ri) => (
              <RowFragment key={row.id} {...{ row, ri, extra, flash, reduce, entered, onOpen, onTip }} />
            ))}

            {tip && (
              <div className="pointer-events-none absolute z-30 w-[200px] rounded-[12px] bg-negro px-3 py-2 text-[12.5px] leading-snug text-white shadow-dark" style={{ left: Math.max(0, tip.x + 14), top: Math.max(0, tip.y - 70) }}>
                <p className="font-semibold">{tipRow.label} · <span className="font-mono">{tm(tipRow.start)}</span></p>
                <p className="text-white/65">{tipRow.veh.name}{tipRow.guide ? ` · ${tipRow.guide.name}` : ''}</p>
                <p className="mt-0.5 text-gold-light">{tipO.over > 0 ? `${tipO.over} acima do limite` : tipO.free === 0 ? 'Lotado' : `${tipO.free} lugares livres`}</p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-[13px] text-ink-3">Semana com <span className="font-medium text-ink-2 tnum">{pct}%</span> de ocupação · <span className="font-medium text-ink-2 tnum">{free}</span> lugares livres</p>
      </Card>
    </Reveal>
  )
}

function RowFragment({ row, ri, extra, flash, reduce, entered, onOpen, onTip }) {
  return (
    <>
      <div className="sticky left-0 z-20 flex min-w-0 flex-col justify-center self-stretch bg-surface pr-2">
        <span className="truncate text-[13px] font-semibold text-ink md:text-[14px]">{row.label}</span>
        <span className="font-mono text-[12px] text-ink-3 tnum">{tm(row.start)}</span>
      </div>
      {DAYS.map((d) => (
        <Cell
          key={d.idx} ri={ri} di={d.idx} o={occOf(ri, d.idx, extra)}
          delay={entered ? 0 : (ri + d.idx) * 0.04} past={d.idx < TODAY}
          flash={flash.has(`${ri}:${d.idx}`)} reduce={reduce} onOpen={onOpen} onTip={onTip}
        />
      ))}
    </>
  )
}
