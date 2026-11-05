import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DeviceMobile, Scan, SteeringWheel, Timer, User, UsersThree, WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { Avatar, Button, CountUp, IconButton, LangTag, Reveal, cx, ease, useMedia } from '../components/ui'
import { DEPARTURES, depById, fmt, guideById, tourOf, vehicleOf } from '../data/mock'
import { useOps, depPhase, depStats, paxOfDep } from '../store'
import { SeatPlan, CapacityLine, computeLayout, orderByBooking } from './embarque/SeatPlan'
import {
  BottomSheet, DepartureList, DepartureStrip, GuideColumn, GuideSheet, Manifest, PaxDetail, PhaseChip, depTitle, groupDepartures, paxState,
} from './embarque/parts'

const PANEL = 272
const GAP = 20
const STAGE_PAD = 32

function useWidth(ref) {
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return w
}

function Metric({ icon: Icon, label, children, className }) {
  return (
    <div className={cx('flex min-w-0 items-center gap-3', className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-2"><Icon size={18} /></span>
      <div className="min-w-0">
        <p className="text-[12px] text-ink-3">{label}</p>
        <div className="mt-0.5 truncate">{children}</div>
      </div>
    </div>
  )
}

const fmtDiff = (m) => {
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h} h ${r} min` : `${h} h`
}

/* ---------------- cabeçalho da saída ---------------- */

function Hero({ dep, now, pax, status, stats, online, guideOpen, onToggleGuide, onSimulate }) {
  const tour = tourOf(dep)
  const vehicle = vehicleOf(dep)
  const guide = guideById(dep.guideIds[0])
  const phase = depPhase(dep, now)
  const setOnline = useOps((s) => s.setOnline)
  const boat = tour.kind === 'boat'
  const diff = dep.start - now
  const order = { boarded: 0, waiting: 1, noshow: 2 }
  const segs = [...pax].sort((a, b) => order[paxState(status[a.id])] - order[paxState(status[b.id])])
  const canSim = stats.waiting > 0 && phase !== 'done'

  const time =
    phase === 'boarding' || phase === 'scheduled'
      ? { label: 'Sai em', value: <span className="text-[16px] font-semibold tnum">{fmtDiff(Math.max(0, diff))}</span> }
      : { label: phase === 'live' ? 'Volta às' : 'Voltou às', value: <span className="font-mono text-[16px] font-medium">{fmt(dep.end)}</span> }

  return (
    <section className="@container rounded-[24px] bg-surface p-4 shadow-soft sm:p-6">
      <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start @3xl:justify-between">
        <div className="min-w-0">
          {online ? <PhaseChip phase={phase} /> : (
            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-gold-tint px-2 text-[11px] font-semibold text-ink">
              <span className="live-dot !size-[6px] text-gold-deep" />
              Sem internet{stats.queued > 0 && <> · <span className="tnum">{stats.queued}</span> salvo{stats.queued > 1 ? 's' : ''} no celular</>}
            </span>
          )}
          <h1 className="mt-3 truncate text-[26px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[30px]">{dep.route || tour.name}</h1>
          <p className="mt-1.5 truncate text-[13.5px] text-ink-3">{vehicle.name} · <span className="font-mono text-ink-2">{fmt(dep.start)}</span></p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            label={online ? 'Simular sem internet' : 'Reconectar'}
            onClick={() => setOnline(!online)}
            className={cx('shadow-pill', online ? 'bg-surface !text-ink-2' : 'bg-gold-tint !text-ink')}
          >
            {online ? <WifiHigh size={17} /> : <WifiSlash size={17} />}
          </IconButton>
          <Button variant="light" icon={Scan} onClick={onSimulate} disabled={!canSim}>Ler QR</Button>
          <Button variant={guideOpen ? 'light' : 'dark'} icon={DeviceMobile} onClick={onToggleGuide} aria-pressed={guideOpen}>App do guia</Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-5 @4xl:flex @4xl:items-center @4xl:gap-0">
        <div className="col-span-2 min-w-0 @4xl:flex-1 @4xl:pr-6">
          <Metric icon={UsersThree} label="Embarcados">
            <span className="text-[22px] font-semibold tracking-[-0.02em] tnum">
              <CountUp value={stats.boarded} /> <span className="text-ink-3">de {stats.total}</span>
            </span>
          </Metric>
          <div className="mt-3 flex gap-[3px]" aria-hidden>
            {segs.map((p) => {
              const s = paxState(status[p.id])
              return <span key={p.id} className={cx('h-[5px] flex-1 rounded-full transition-colors duration-300', s === 'boarded' ? 'bg-ok' : s === 'noshow' ? 'bg-ink-4' : 'bg-sunken')} />
            })}
          </div>
        </div>
        <Metric icon={Timer} label={time.label} className="@4xl:border-l @4xl:border-line @4xl:px-6">{time.value}</Metric>
        <Metric icon={SteeringWheel} label={boat ? 'Piloto' : 'Motorista'} className="@4xl:order-3 @4xl:border-l @4xl:border-line @4xl:pl-6">
          <span className="text-[14px] font-medium">{vehicle.skipper}</span>
        </Metric>
        <div className="col-span-2 flex min-w-0 items-center gap-3 @4xl:order-2 @4xl:border-l @4xl:border-line @4xl:px-6">
          {guide ? <Avatar initials={guide.initials} hue={guide.hue} size={40} /> : <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-3"><User size={18} /></span>}
          <div className="min-w-0">
            <p className="text-[12px] text-ink-3">Guia</p>
            {guide ? (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="truncate text-[14px] font-medium">{guide.name}</span>
                <span className="flex gap-1">{guide.langs.map((l) => <LangTag key={l} code={l} />)}</span>
              </div>
            ) : <p className="mt-0.5 text-[14px] text-ink-3">Sem guia</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- planta ---------------- */

function PlanCard({ dep, pax, status, stats, hoverId, setHoverId, selectedId, setSelectedId, pulse, actions, mobile }) {
  const vehicle = vehicleOf(dep)
  const guide = guideById(dep.guideIds[0])
  const ref = useRef(null)
  const W = useWidth(ref)

  const plan = useMemo(() => {
    if (!W) return null
    const s = W < 560 ? 34 : 44
    const H = computeLayout(vehicle, s, 'h')
    const V = computeLayout(vehicle, s, 'v')
    if (!mobile && W >= H.width + STAGE_PAD + PANEL + GAP) return { layout: H, side: true }
    if (W >= H.width + STAGE_PAD && !mobile) return { layout: H, side: false }
    if (!mobile && W >= V.width + STAGE_PAD + 40 + PANEL + GAP && V.height <= 760) return { layout: V, side: true }
    return { layout: V, side: false }
  }, [W, vehicle, mobile])

  const sel = pax.find((p) => p.id === selectedId)
  const showPanel = sel && !mobile

  return (
    <section className="rounded-[24px] bg-surface p-4 shadow-soft sm:p-5">
      <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em]">{vehicle.name}</h2>

      <div ref={ref} className="mt-4 min-w-0">
        {plan && (
          <div className={cx('flex', plan.side ? 'flex-row items-stretch' : 'flex-col')} style={{ gap: showPanel ? GAP : 0 }}>
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-5 rounded-[20px] bg-frame px-4 pb-4 pt-9">
              <SeatPlan
                layout={plan.layout}
                vehicle={vehicle}
                guide={guide}
                pax={pax}
                status={status}
                hoverId={hoverId}
                setHoverId={setHoverId}
                selectedId={selectedId}
                onSelect={setSelectedId}
                pulse={pulse}
              />
              <CapacityLine capacity={vehicle.capacity} stats={stats} boat={vehicle.kind === 'boat'} />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {showPanel && (
                <motion.div
                  key={sel.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.2, ease }}
                  className={cx('@container min-w-0', plan.side ? 'shrink-0 py-1' : 'px-1 pt-1')}
                  style={plan.side ? { width: PANEL } : undefined}
                >
                  <PaxDetail p={sel} st={status[sel.id]} groupSize={pax.filter((x) => x.booking === sel.booking).length} onClose={() => setSelectedId(null)} actions={actions(sel.id)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {mobile && (
        <BottomSheet open={!!sel} onClose={() => setSelectedId(null)}>
          {sel && <PaxDetail p={sel} st={status[sel.id]} groupSize={pax.filter((x) => x.booking === sel.booking).length} onClose={() => setSelectedId(null)} actions={actions(sel.id)} />}
        </BottomSheet>
      )}
    </section>
  )
}

/* ---------------- saída selecionada ---------------- */

function DepartureView({ dep, guideOpen, onToggleGuide }) {
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)
  const online = useOps((s) => s.online)
  const lastScan = useOps((s) => s.lastScan)
  const board = useOps((s) => s.board)
  const unboard = useOps((s) => s.unboard)
  const markNoShow = useOps((s) => s.markNoShow)
  const showToast = useOps((s) => s.showToast)
  const mobile = useMedia('(max-width: 767px)')

  const pax = useMemo(() => paxOfDep(dep.id), [dep.id])
  const stats = depStats(dep.id, status)
  const [hoverId, setHoverId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [pulse, setPulse] = useState(null)

  useEffect(() => {
    if (!lastScan || Date.now() - lastScan.t > 3000) return
    if (!pax.some((p) => p.id === lastScan.paxId)) return
    setPulse(lastScan)
    const t = setTimeout(() => setPulse(null), 1900)
    return () => clearTimeout(t)
  }, [lastScan?.t])

  const actions = (id) => ({
    board: () => board(id, 'manual'),
    undo: () => unboard(id),
    noshow: () => markNoShow(id),
  })

  const simulate = () => {
    const next = orderByBooking(pax, status).find((p) => paxState(status[p.id]) === 'waiting')
    if (!next) return
    board(next.id, 'qr')
    showToast(`${next.name} embarcou`, { label: 'Desfazer', fn: () => useOps.getState().unboard(next.id) })
  }

  const shared = { pax, status, hoverId, setHoverId, selectedId, setSelectedId }

  return (
    <div className="flex min-w-0 flex-col gap-3 md:gap-4">
      <Reveal i={0}>
        <Hero dep={dep} now={now} pax={pax} status={status} stats={stats} online={online} guideOpen={guideOpen} onToggleGuide={onToggleGuide} onSimulate={simulate} />
      </Reveal>
      <Reveal i={1}>
        <PlanCard dep={dep} stats={stats} pulse={pulse} actions={actions} mobile={mobile} {...shared} />
      </Reveal>
      <Reveal i={2}>
        <Manifest {...shared} onSelect={setSelectedId} />
      </Reveal>
    </div>
  )
}

/* ---------------- página ---------------- */

export default function Embarque() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dep = depById(id) ?? depById('d7')
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)
  const [guideOpen, setGuideOpen] = useState(false)
  const xl = useMedia('(min-width: 1280px)')
  const wide = useMedia('(min-width: 1680px)')
  const groups = useMemo(() => groupDepartures(DEPARTURES, now), [now])
  const pick = (did) => navigate(`/embarque/${did}`)

  useEffect(() => { document.title = `Embarque · ${depTitle(dep)}` }, [dep.id])

  return (
    <div className="flex min-w-0 flex-col gap-3 md:gap-4">
      <DepartureStrip groups={groups} status={status} activeId={dep.id} onPick={pick} />
      <div className="flex min-w-0 items-start gap-4">
        {(!guideOpen || wide) && <DepartureList groups={groups} now={now} status={status} activeId={dep.id} onPick={pick} compact={guideOpen} />}
        <div className="min-w-0 flex-1">
          <DepartureView key={dep.id} dep={dep} guideOpen={guideOpen} onToggleGuide={() => setGuideOpen((o) => !o)} />
        </div>
        <AnimatePresence>
          {xl && guideOpen && <GuideColumn key="guide" depId={dep.id} onClose={() => setGuideOpen(false)} />}
        </AnimatePresence>
      </div>
      <GuideSheet open={!xl && guideOpen} depId={dep.id} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
