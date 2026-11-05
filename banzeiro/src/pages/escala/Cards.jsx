import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock } from '@phosphor-icons/react'
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
        <span className="text-[12px] font-medium tnum opacity-80">{fmtT(shift.start)}{miss.length === 0 && !clash && <> · {shift.need[0]}</>}</span>
        {miss.length > 0 ? <Chip alert>Sem {miss[0]}</Chip> : clash ? <Chip alert>Sobrepõe</Chip> : past ? <span className="grid size-[18px] place-items-center rounded-full bg-ok text-white"><Check size={11} weight="bold" /></span> : null}
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
    <div className={cx('relative flex min-w-[200px] items-center gap-3 overflow-hidden rounded-[18px] bg-sunken py-3 pl-4 pr-4', ghost && 'opacity-30', lifted && 'bg-surface shadow-lift')}>
      <span className="absolute inset-y-3 left-1.5 w-[3px] rounded-full" style={{ background: KIND[t.kind].color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-medium leading-tight text-ink">{t.short}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-3"><Clock size={13} />{dayLabel(shift.day)} · <span className="tnum">{fmtT(shift.start)}</span> · {shift.need[0]}</p>
      </div>
    </div>
  )
}
