import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from 'framer-motion'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, useDroppable, pointerWithin, rectIntersection } from '@dnd-kit/core'
import { CaretLeft, CaretRight, UserPlus, Prohibit, X, Check } from '@phosphor-icons/react'
import { Card, Reveal, Pill, Button, IconButton, Segmented, Avatar, LangTag, Progress, StatusChip, cx, ease, useMedia } from '../components/ui'
import { GUIDES, WEEK } from '../data/mock'
import { useOps } from '../store'
import { DragShift, ShiftBody, TrayBody } from './escala/Cards'
import { isOff, missingLangs, fit, plan, conflictsOf, uncoverable, hoursOf, fmtH, dayLabel, dayShort, firstName } from './escala/logic'

const GRID = 'grid grid-cols-[208px_repeat(7,minmax(138px,1fr))] gap-1.5'
const FILTERS = ['Todos', 'EN', 'ES', 'FR', 'DE', 'IT', 'JA']
const collision = (args) => { const p = pointerWithin(args); return p.length ? p : rectIntersection(args) }

function Meter({ h, max }) {
  const hot = h / max >= 0.9
  return (
    <div className="flex items-center gap-2">
      <Progress value={h} max={max} height={4} color={hot ? 'var(--color-solimoes)' : 'var(--color-ink)'} className="!w-[72px]" />
      {hot && <span className="text-[11px] font-semibold tnum" style={{ color: 'color-mix(in oklab, var(--color-solimoes) 60%, var(--color-ink))' }}>{fmtH(h)}h</span>}
    </div>
  )
}

function GuideInfo({ g, shifts, dim, compact }) {
  return (
    <div className={cx('flex items-center gap-3 transition-opacity duration-200', dim && 'opacity-35')}>
      <Avatar initials={g.initials} hue={g.hue} size={compact ? 34 : 38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold leading-tight text-ink">{g.name}</p>
        <div className="mt-1 flex items-center gap-1">{g.langs.map((l) => <LangTag key={l} code={l} className="!h-[17px] !px-1 !text-[9.5px] !font-sans" />)}</div>
        <div className="mt-2"><Meter h={hoursOf(shifts, g)} max={g.max} /></div>
      </div>
    </div>
  )
}

/** Célula droppable (semana e dia) */
function Cell({ g, day, shifts, active, activeId, shake, onPick, dim, minH = 76, bare }) {
  const id = `cell:${g.id}:${day}`
  const { setNodeRef, isOver } = useDroppable({ id })
  const controls = useAnimationControls()
  useEffect(() => { if (shake?.id === id) controls.start({ x: [0, -7, 7, -5, 5, 0], transition: { duration: 0.36 } }) }, [shake])
  const off = isOff(g.id, day)
  const list = shifts.filter((s) => s.guideId === g.id && s.day === day).sort((a, b) => a.start - b.start)
  const today = WEEK[day].today
  const state = active ? (off ? 'bad' : missingLangs(g, active).length ? 'bad' : 'good') : null
  return (
    <motion.div
      ref={setNodeRef}
      animate={controls}
      style={{ minHeight: minH }}
      className={cx(
        'relative rounded-[14px] p-1.5 transition-[background,box-shadow,opacity] duration-150',
        off ? 'hatch' : 'bg-sunken',
        bare && '!p-1.5',
        state === 'good' && '!bg-transfer-tint outline-dashed outline-[1.5px] -outline-offset-2 outline-transfer',
        state === 'bad' && (off ? 'outline-dashed outline-[1.5px] -outline-offset-2 outline-alert' : '!bg-alert-tint outline-dashed outline-[1.5px] -outline-offset-2 outline-alert'),
        isOver && state === 'good' && 'ring-2 ring-transfer/60',
        isOver && state === 'bad' && 'ring-2 ring-alert/60',
        dim && !off && 'opacity-60',
      )}
    >
      {today && !bare && <span aria-hidden className="pointer-events-none absolute -inset-y-[3px] left-1/2 z-0 border-l-[1.5px] border-dashed border-now/60" />}
      {off && !list.length && (
        <span className="absolute inset-0 z-10 grid place-items-center"><span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10.5px] font-semibold text-ink-3"><Prohibit size={11} />Folga</span></span>
      )}
      <div className="relative z-10 flex flex-col gap-1.5">
        {list.map((s) => <DragShift key={s.id} shift={s} shifts={shifts} activeId={activeId} />)}
      </div>
    </motion.div>
  )
}

function DayHead({ d }) {
  const w = WEEK[d]
  return (
    <div className="grid place-items-center pb-1">
      <span className={cx('flex h-[46px] w-[54px] flex-col items-center justify-center rounded-[14px] leading-none', w.today ? 'bg-now text-white shadow-dark' : 'bg-sunken text-ink-2')}>
        <span className={cx('text-[10.5px] font-semibold', w.today ? 'text-white/80' : 'text-ink-3')}>{w.short}</span>
        <span className="mt-1 text-[15px] font-semibold tnum">{w.day}</span>
      </span>
    </div>
  )
}

function Tray({ items, activeId, isOver, setNodeRef, onPick }) {
  return (
    <section ref={setNodeRef} className={cx('rounded-[24px] bg-surface p-4 shadow-soft transition-shadow', isOver && 'ring-2 ring-now/40')}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Sem guia</h2>
          <p className="text-[12px] text-ink-3 tnum">{items.length}</p>
        </div>
        <div className="no-scrollbar -my-1 flex min-w-0 flex-1 gap-2.5 overflow-x-auto px-1 py-1">
          <AnimatePresence initial={false}>
            {items.length === 0 && (
              <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex h-12 items-center gap-2 rounded-[16px] border border-dashed border-line px-4 text-[12.5px] text-ink-3"><Check size={14} weight="bold" className="text-ok" />Nenhuma</motion.span>
            )}
            {items.map((s) => <DragShift key={s.id} shift={s} shifts={[]} activeId={activeId} tray onClick={() => onPick(s)} />)}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Sheet({ shift, shifts, onClose, onChoose }) {
  const list = useMemo(() => {
    if (!shift) return []
    const rank = { ok: 0, overlap: 1, lang: 2, off: 3 }
    return GUIDES.map((g) => ({ g, f: fit(shifts, g, shift) })).sort((a, b) => rank[a.f] - rank[b.f] || hoursOf(shifts, a.g) - hoursOf(shifts, b.g))
  }, [shift, shifts])
  const label = { ok: 'Livre', off: 'Folga', lang: null, overlap: 'Sobrepõe' }
  return (
    <AnimatePresence>
      {shift && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center">
          <motion.div className="absolute inset-0 bg-negro/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.32, ease: [0.2, 0.9, 0.3, 1] }}
            className="relative flex max-h-[82dvh] w-full flex-col rounded-t-[28px] bg-surface p-5 shadow-lift md:max-w-[420px] md:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">Quem vai</h3>
                <p className="text-[12.5px] text-ink-3">{dayLabel(shift.day)} · {shift.need[0]}</p>
              </div>
              <IconButton label="Fechar" onClick={onClose} className="!size-9 bg-sunken"><X size={16} /></IconButton>
            </div>
            <div className="-mx-1 mt-4 flex flex-col gap-1 overflow-y-auto px-1 pb-[max(8px,env(safe-area-inset-bottom))]">
              {list.map(({ g, f }) => {
                const miss = missingLangs(g, shift)
                return (
                  <button key={g.id} disabled={f === 'off'} onClick={() => onChoose(g, shift)} className={cx('flex min-h-[56px] items-center gap-3 rounded-[16px] px-3 py-2 text-left transition-colors hover:bg-sunken disabled:opacity-40 disabled:hover:bg-transparent')}>
                    <Avatar initials={g.initials} hue={g.hue} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">{g.name}</p>
                      <p className="text-[11px] text-ink-3 tnum">{fmtH(hoursOf(shifts, g))}h</p>
                    </div>
                    {f === 'lang' ? <StatusChip tone="alert">Sem {miss[0]}</StatusChip> : <StatusChip tone={f === 'ok' ? 'ok' : f === 'off' ? 'muted' : 'alert'}>{label[f]}</StatusChip>}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Summary({ shifts }) {
  const gaps = uncoverable(shifts)
  const c = conflictsOf(shifts)
  const total = c.lang + c.overlap + c.off
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 md:px-6">
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        {gaps.length === 0 ? (
          <span className="flex items-center gap-1.5 text-ink-3"><Check size={14} weight="bold" className="text-ok" />Todos os idiomas cobertos</span>
        ) : (
          <>
            <span className="mr-1 text-ink-3">Falta guia de</span>
            {gaps.map((s) => <span key={s.id} className="inline-flex h-[24px] items-center rounded-md bg-alert-tint px-2 text-[11.5px] font-semibold text-alert">{s.need.join(' + ')} · {dayShort(s.day)}</span>)}
          </>
        )}
      </div>
      {total > 0 && <span className="ml-auto flex items-center gap-1.5 text-[13px] font-medium text-alert"><span className="size-1.5 rounded-full bg-alert" /><span className="tnum">{total}</span> {total === 1 ? 'conflito' : 'conflitos'}</span>}
    </Card>
  )
}

export default function Escala() {
  const shifts = useOps((s) => s.shifts)
  const moveShift = useOps((s) => s.moveShift)
  const setShifts = useOps((s) => s.setShifts)
  const showToast = useOps((s) => s.showToast)
  const [view, setView] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'dia' : 'semana'))
  const [day, setDay] = useState(2)
  const [lang, setLang] = useState('Todos')
  const [activeId, setActiveId] = useState(null)
  const [width, setWidth] = useState(150)
  const [shake, setShake] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [running, setRunning] = useState(false)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }))
  const active = shifts.find((s) => s.id === activeId) || null
  const unassigned = shifts.filter((s) => !s.guideId).sort((a, b) => a.day - b.day || a.start - b.start)
  const { setNodeRef: trayRef, isOver: trayOver } = useDroppable({ id: 'tray' })
  const dimmed = (g) => lang !== 'Todos' && !g.langs.includes(lang)

  const assign = (shift, guideId, d = shift.day, toastText) => {
    const prev = { guideId: shift.guideId, day: shift.day }
    moveShift(shift.id, { guideId, day: d })
    const g = GUIDES.find((x) => x.id === guideId)
    showToast(toastText || (g ? `Movido para ${firstName(g)} · ${dayShort(d)}` : 'Movido para Sem guia'), { label: 'Desfazer', fn: () => moveShift(shift.id, prev) })
  }

  const onEnd = ({ active: a, over }) => {
    setActiveId(null)
    if (!over) return
    const s = shifts.find((x) => x.id === a.id)
    if (over.id === 'tray') { if (s.guideId) assign(s, null); return }
    const [, gid, d] = String(over.id).split(':')
    if (isOff(gid, +d)) { setShake({ id: over.id, n: Date.now() }); return }
    if (s.guideId === gid && s.day === +d) return
    assign(s, gid, +d)
  }

  const suggest = () => {
    if (running) return
    const steps = plan(shifts)
    const left = shifts.filter((x) => !x.guideId).length - steps.length
    if (!steps.length) { showToast(left ? `${left} ${left === 1 ? 'saída precisa' : 'saídas precisam'} de guia com o idioma` : 'Nada para preencher'); return }
    const before = shifts
    setRunning(true)
    steps.forEach((st, i) => {
      timers.current.push(setTimeout(() => moveShift(st.id, { guideId: st.guideId }), 250 + i * 120))
    })
    timers.current.push(setTimeout(() => {
      setRunning(false)
      const msg = `${steps.length} ${steps.length === 1 ? 'saída preenchida' : 'saídas preenchidas'}` + (left ? ` · ${left} sem guia com o idioma` : '')
      showToast(msg, { label: 'Desfazer', fn: () => setShifts(before) })
    }, 250 + steps.length * 120 + 500))
  }

  const choose = (g, s) => { setSheet(null); assign(s, g.id) }

  return (
    <MotionConfig reducedMotion="user">
      <DndContext sensors={sensors} collisionDetection={collision} onDragStart={(e) => { setActiveId(e.active.id); setWidth(e.active.rect.current.initial?.width || 150) }} onDragEnd={onEnd} onDragCancel={() => setActiveId(null)}>
        <div className="flex flex-col gap-3 md:gap-4">
          <Reveal i={0}>
            <Card className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                <div>
                  <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink md:text-[30px]">Escala</h1>
                  <p className="mt-1 text-[13px] text-ink-3">2 a 8 de novembro</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <IconButton label="Semana anterior" className="bg-surface shadow-pill !size-10"><CaretLeft size={16} weight="bold" /></IconButton>
                    <Pill active>Hoje</Pill>
                    <IconButton label="Próxima semana" className="bg-surface shadow-pill !size-10"><CaretRight size={16} weight="bold" /></IconButton>
                  </div>
                  <Segmented value={view} onChange={setView} options={[{ value: 'semana', label: 'Semana' }, { value: 'dia', label: 'Dia' }]} />
                  <Button icon={UserPlus} onClick={suggest} disabled={running} className="max-md:w-full">Preencher escala</Button>
                </div>
              </div>
              <div className="no-scrollbar -mx-1 mt-4 overflow-x-auto px-1 py-1">
                <Segmented size="sm" value={lang} onChange={setLang} options={FILTERS.map((f) => ({ value: f, label: f }))} className="w-max" />
              </div>
            </Card>
          </Reveal>

          <Reveal i={1}><Tray items={unassigned} activeId={activeId} isOver={trayOver} setNodeRef={trayRef} onPick={setSheet} /></Reveal>

          <Reveal i={2}>
            <Card className="p-3 md:p-4">
              {view === 'semana' ? (
                <div className="no-scrollbar overflow-x-auto">
                  <div className="min-w-[1250px]">
                    <div className={cx(GRID, 'mb-1')}>
                      <div className="sticky left-0 z-30 flex items-end bg-surface px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Guias</div>
                      {WEEK.map((w) => <DayHead key={w.idx} d={w.idx} />)}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {GUIDES.map((g) => (
                        <div key={g.id} className={GRID}>
                          <div className="sticky left-0 z-30 bg-surface pr-1.5"><div className="flex h-full items-center rounded-[14px] bg-surface px-2"><GuideInfo g={g} shifts={shifts} dim={dimmed(g)} /></div></div>
                          {WEEK.map((w) => <Cell key={w.idx} g={g} day={w.idx} shifts={shifts} active={active} activeId={activeId} shake={shake} dim={dimmed(g)} />)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
                    {WEEK.map((w) => {
                      const sel = day === w.idx
                      const open = unassigned.filter((s) => s.day === w.idx).length
                      return (
                        <button key={w.idx} onClick={() => setDay(w.idx)} className={cx('relative flex h-[60px] w-[56px] shrink-0 flex-col items-center justify-center rounded-[16px] leading-none transition-colors duration-150 active:scale-[0.97]', sel ? (w.today ? 'bg-now text-white' : 'bg-negro text-white shadow-dark') : 'bg-sunken text-ink-2')}>
                          <span className={cx('text-[10.5px] font-semibold', sel ? 'text-white/70' : 'text-ink-3')}>{w.short}</span>
                          <span className="mt-1.5 text-[16px] font-semibold tnum">{w.day}</span>
                          {open > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-alert" />}
                        </button>
                      )
                    })}
                  </div>
                  <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                    {GUIDES.map((g) => {
                      const off = isOff(g.id, day)
                      return (
                        <div key={g.id} className="rounded-[18px] bg-frame p-3">
                          <GuideInfo g={g} shifts={shifts} dim={dimmed(g)} compact />
                          <div className="mt-3"><Cell g={g} day={day} shifts={shifts} active={active} activeId={activeId} shake={shake} dim={dimmed(g)} minH={off ? 64 : 60} bare /></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal i={3}>
            <Summary shifts={shifts} />
          </Reveal>
        </div>

        <DragOverlay dropAnimation={null}>
          {active ? (
            <div style={{ width, transform: 'rotate(1.5deg) scale(1.02)' }}>
              {active.guideId ? <ShiftBody shift={active} shifts={shifts} lifted /> : <TrayBody shift={active} lifted />}
            </div>
          ) : null}
        </DragOverlay>
        <Sheet shift={sheet} shifts={shifts} onClose={() => setSheet(null)} onChoose={choose} />
      </DndContext>
    </MotionConfig>
  )
}
