import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { cx } from '../../components/ui'
import { GUIDES, KIND, WEEK } from '../../data/mock'
import { tourOf, missingLangs, overlaps, dayLabel, fmtT } from './logic'

const TEXT = { boat: 'var(--color-negro)', land: 'white', transfer: 'white' }

export function Chip({ children, alert }) {
  return (
    <span className={cx('inline-flex h-[18px] items-center rounded-full px-1.5 text-[10px] font-semibold leading-none shadow-[0_1px_2px_rgba(0,0,0,.12)]', alert ? 'bg-alert text-white' : 'bg-white text-ink')}>
      {children}
    </span>
  )
}

const PAST = (d) => d < (WEEK.find((w) => w.today)?.idx ?? 0)

/** Visual puro do cartão de saída */
export const ShiftBody = forwardRef(function ShiftBody({ shift, shifts = [], lifted, ghost, className, ...rest }, ref) {
  const t = tourOf(shift)
  const g = GUIDES.find((x) => x.id === shift.guideId)
  const miss = missingLangs(g, shift)
  const clash = g && overlaps(shifts, shift, g.id)
  const bad = miss.length > 0 || clash
  const past = PAST(shift.day)
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(
        'relative flex min-h-[52px] select-none flex-col justify-between gap-1 overflow-hidden rounded-[12px] px-2.5 py-1.5 text-left',
        bad && 'ring-2 ring-alert ring-offset-1 ring-offset-sunken',
        lifted && 'shadow-lift',
        ghost && 'opacity-30',
        className,
      )}
      style={{ background: KIND[t.kind].color, color: TEXT[t.kind], opacity: past && !lifted && !ghost ? 0.6 : undefined, ...rest.style }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="font-mono text-[11.5px] font-semibold tnum opacity-80">{fmtT(shift.start)}</span>
        {miss.length > 0 ? <Chip alert>Sem {miss[0]}</Chip> : clash ? <Chip alert>Sobrepõe</Chip> : past ? <Chip><span className="mr-1 size-[5px] rounded-full bg-ok" />Feita</Chip> : <Chip>{shift.need[0]}</Chip>}
      </div>
      <p className="truncate text-[12.5px] font-semibold leading-tight tracking-[-0.005em]">{t.short}</p>
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
        <p className="mt-0.5 text-[11.5px] text-ink-3"><span className="font-medium text-ink-2">{dayLabel(shift.day)}</span> · <span className="font-mono tnum">{fmtT(shift.start)}</span></p>
      </div>
      <div className="flex gap-1">
        <span className="inline-flex h-[20px] items-center rounded-md bg-sunken px-1.5 text-[10.5px] font-semibold text-ink-2">{shift.need[0]}</span>
      </div>
    </div>
  )
}
