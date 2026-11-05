import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, Car } from '@phosphor-icons/react'
import { Avatar, cx, ease } from '../../components/ui'
import { DEPARTURES, PASSENGERS, WEEK, TOURS, guideById, tourOf, vehicleOf } from '../../data/mock'
import { useOps } from '../../store'
import { viewStats, norm, firstName, t, WEEKDAY_FULL } from './helpers'

const TODAY = WEEK.find((w) => w.today).idx

function todayItems(now, status, query) {
  const q = norm(query.trim())
  return DEPARTURES.filter((d) => {
    if (q.length < 2) return true
    const tour = tourOf(d)
    if (norm(tour.short).includes(q) || norm(tour.name).includes(q) || norm(d.code).includes(q)) return true
    return PASSENGERS.some((p) => p.depId === d.id && (norm(p.name).includes(q) || norm(p.booking).includes(q)))
  })
    .sort((a, b) => a.start - b.start)
    .map((d) => {
      const tour = tourOf(d)
      const v = vehicleOf(d)
      const g = d.guideIds[0] ? guideById(d.guideIds[0]) : null
      const st = viewStats(d, status, now)
      return {
        id: d.id, start: d.start, end: d.end, name: d.route ?? tour.short, kind: tour.kind, guide: g,
        line: `${v.name} · ${firstName(g ? g.name : v.skipper)}`,
        state: st.phase === 'scheduled' ? 'wait' : st.phase === 'boarding' ? 'now' : 'done',
      }
    })
}

function otherDayItems(day, shifts) {
  return shifts
    .filter((s) => s.day === day)
    .sort((a, b) => a.start - b.start)
    .map((s) => {
      const tour = TOURS.find((x) => x.id === s.tourId)
      const g = s.guideId ? guideById(s.guideId) : null
      return {
        id: s.id, start: s.start, end: s.start + tour.duration, name: tour.short, kind: tour.kind, guide: g,
        line: g ? `${tour.kind === 'boat' ? 'Lancha' : 'Van'} · ${firstName(g.name)}` : 'Sem guia',
        state: day < TODAY ? 'done' : 'wait',
      }
    })
}

export default function Agenda({ now, status, query }) {
  const navigate = useNavigate()
  const shifts = useOps((s) => s.shifts)
  const [day, setDay] = useState(TODAY)
  const list = useRef(null)

  const items = useMemo(
    () => (day === TODAY ? todayItems(now, status, query) : otherDayItems(day, shifts)),
    [day, now, status, query, shifts],
  )
  const groups = useMemo(() => {
    const m = new Map()
    items.forEach((it) => {
      const h = Math.floor(it.start / 60)
      if (!m.has(h)) m.set(h, [])
      m.get(h).push(it)
    })
    return [...m.entries()]
  }, [items])

  // Rola até a hora atual ao abrir o dia de hoje
  useEffect(() => {
    const el = list.current
    if (!el) return
    if (day !== TODAY || query) { el.scrollTop = 0; return }
    const target = el.querySelector('[data-now="1"]')
    if (target) el.scrollTop = Math.max(0, target.offsetTop - 8)
  }, [day, query])

  const before = groups.filter(([h]) => h <= Math.floor(now / 60))
  const scrollHour = (before.length > 1 ? before[before.length - 2] : before[0])?.[0]
  const w = WEEK[day]
  const go = (n) => setDay((d) => (d + n + 7) % 7)

  return (
    <section className="flex h-[680px] flex-col rounded-[32px] bg-frame p-3 md:p-4 xl:h-full">
      <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-2">
        <h2 className="whitespace-nowrap text-[22px] font-semibold tracking-[-0.03em] text-ink sm:text-[26px]">Novembro 2026</h2>
        <div className="flex items-center gap-1 rounded-[16px] bg-surface p-1">
          <span className="rounded-[12px] bg-sunken px-3.5 py-2 text-[14px] font-medium text-ink">Semana</span>
          <button aria-label="Próximo dia" onClick={() => go(1)} className="grid size-9 place-items-center rounded-[12px] text-ink transition-colors hover:bg-frame">
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-[28px] bg-surface p-2">
        {WEEK.map((d) => {
          const sel = d.idx === day
          return (
            <button key={d.idx} onClick={() => setDay(d.idx)} className="relative flex flex-col items-center gap-2 rounded-[16px] py-3 transition-transform active:scale-95">
              {sel && <motion.span layoutId="agenda-day" className="absolute inset-0 rounded-[16px] bg-sunken" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className="relative text-[13px] uppercase text-ink-3">{d.short}</span>
              <span className={cx('relative text-[18px] font-medium tnum', sel ? 'text-ink' : 'text-ink-2')}>{d.day}</span>
              <span className={cx('relative size-1.5 rounded-full', d.today ? 'bg-gold' : 'bg-transparent')} />
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-[28px] bg-surface">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">{WEEKDAY_FULL[day]} {w.day}</h3>
          <div className="flex gap-2">
            <button aria-label="Dia anterior" onClick={() => go(-1)} className="grid size-11 place-items-center rounded-[12px] bg-sunken text-ink-3 transition-[color,transform] hover:text-ink active:scale-95">
              <ArrowLeft size={18} />
            </button>
            <button aria-label="Próximo dia" onClick={() => go(1)} className="grid size-11 place-items-center rounded-[12px] bg-sunken text-ink transition-transform active:scale-95">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div ref={list} className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${day}-${query}`} className="flex flex-col gap-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease }}>
              {groups.length === 0 && <p className="py-10 text-center text-[15px] text-ink-3">{query ? 'Nada encontrado' : 'Sem saídas'}</p>}
              {groups.map(([h, its]) => (
                <div key={h} data-now={day === TODAY && h === scrollHour ? '1' : undefined} className="flex gap-3 border-t border-line pt-3 first:border-t-0">
                  <span className="w-[46px] shrink-0 pt-1 text-[16px] font-semibold text-ink tnum">{h}:00</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    {its.map((it) => (
                      <EventCard key={it.id} it={it} onOpen={day === TODAY ? () => navigate(`/embarque/${it.id}`) : undefined} />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function EventCard({ it, onOpen }) {
  const hot = it.state === 'now'
  const As = onOpen ? motion.button : motion.div
  return (
    <As
      onClick={onOpen}
      whileTap={onOpen ? { scale: 0.98 } : undefined}
      className={cx('relative flex w-full items-center gap-3.5 rounded-[20px] p-3.5 text-left', hot ? 'dots bg-gold-tint' : 'bg-frame', onOpen && !hot && 'transition-colors hover:bg-sunken')}
    >
      {!hot && (it.guide ? (
        <Avatar initials={it.guide.initials} hue={it.guide.hue} size={52} />
      ) : (
        <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-surface text-ink-2"><Car size={22} /></span>
      ))}
      <span className={cx('min-w-0 flex-1', !hot && 'pr-7')}>
        <span className="block truncate text-[17px] font-medium leading-tight text-ink">{it.name}</span>
        <span className="mt-1 block truncate text-[14px] text-ink-3">{it.line}</span>
        <span className="mt-1 block text-[14px] text-ink-3 tnum">{t(it.start)} a {t(it.end)}</span>
      </span>
      {hot ? (
        <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-negro text-white"><ArrowUpRight size={20} weight="bold" /></span>
      ) : it.state === 'done' ? (
        <span className="absolute right-3.5 top-3.5 grid size-6 place-items-center rounded-full bg-ok/80 text-white"><Check size={13} weight="bold" /></span>
      ) : (
        <span className="absolute right-3.5 top-3.5 grid size-6 place-items-center rounded-full bg-surface text-ink-2"><Clock size={14} weight="bold" /></span>
      )}
    </As>
  )
}
