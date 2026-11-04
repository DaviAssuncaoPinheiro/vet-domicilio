import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { cx, Time } from '../../components/ui'
import { GUIDES, KIND, WEEK } from '../../data/mock'
import { tourOf, missingLangs, overlaps, dayLabel } from './logic'

const strong = (k) => `color-mix(in oklab, ${KIND[k].color} 62%, #131316)`

export function Chip({ children, alert }) {
  return (
    <span className={cx('inline-flex h-[18px] items-center rounded-full px-1.5 font-mono text-[10px] font-semibold leading-none shadow-[0_1px_2px_rgba(19,19,22,.08)]', alert ? 'bg-alert text-white' : 'bg-white text-ink')}>
      {children}
    </span>
  )
}

/** Visual puro do cartão de saída */
export const ShiftBody = forwardRef(function ShiftBody({ shift, shifts = [], lifted, ghost, className, ...rest }, ref) {
  const t = tourOf(shift)
  const g = GUIDES.find((x) => x.id === shift.guideId)
  const miss = missingLangs(g, shift)
  const clash = g && overlaps(shifts, shift, g.id)
  const bad = miss.length > 0 || clash
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(
        'relative flex min-h-[52px] select-none flex-col justify-between gap-1 overflow-hidden rounded-[12px] py-1.5 pl-3 pr-2 text-left',
        bad && 'ring-2 ring-alert',
        lifted && 'shadow-lift',
        ghost && 'opacity-30',
        className,
      )}
      style={{ background: KIND[t.kind].tint, ...rest.style }}
    >
      <span className="absolute inset-y-1.5 left-1 w-[3px] rounded-full" style={{ background: KIND[t.kind].color }} />
      <div className="flex items-center justify-between gap-1.5">
        <Time m={shift.start} className="text-[11.5px] font-semibold" style={{ color: strong(t.kind) }} />
        <div className="flex items-center gap-1">
          {miss.length > 0 ? <Chip alert>Sem {miss.join(' ')}</Chip> : clash ? <Chip alert>Sobrepõe</Chip> : shift.need.map((l) => <Chip key={l}>{l}</Chip>)}
        </div>
      </div>
      <p className="truncate text-[12.5px] font-semibold leading-tight tracking-[-0.005em] text-ink">{t.short}</p>
    </div>
  )
})

/** Cartão arrastável. layoutId faz o voo entre células. */
export function DragShift({ shift, shifts, activeId, onClick, tray }) {
  const { setNodeRef, listeners, attributes } = useDraggable({ id: shift.id })
  const dragging = activeId === shift.id
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} onClick={onClick} className="touch-manipulation outline-none" style={{ cursor: 'grab' }}>
      <motion.div layout="position" layoutId={shift.id} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
        {tray ? <TrayBody shift={shift} ghost={dragging} /> : <ShiftBody shift={shift} shifts={shifts} ghost={dragging} />}
      </motion.div>
    </div>
  )
}

export function TrayBody({ shift, ghost, lifted }) {
  const t = tourOf(shift)
  return (
    <div className={cx('flex min-w-[196px] items-center gap-3 rounded-[16px] border border-dashed border-ink-4 bg-surface px-3 py-2.5', ghost && 'opacity-30', lifted && 'shadow-lift border-solid border-transparent')}>
      <span className="h-8 w-[3px] shrink-0 rounded-full" style={{ background: KIND[t.kind].color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-tight text-ink">{t.short}</p>
        <p className="mt-0.5 text-[11.5px] text-ink-3"><span className="font-medium text-ink-2">{dayLabel(shift.day)}</span> · <Time m={shift.start} /></p>
      </div>
      <div className="flex gap-1">
        {shift.need.map((l) => <span key={l} className="inline-flex h-[20px] items-center rounded-md bg-sunken px-1.5 font-mono text-[10.5px] font-semibold text-ink-2">{l}</span>)}
      </div>
    </div>
  )
}
