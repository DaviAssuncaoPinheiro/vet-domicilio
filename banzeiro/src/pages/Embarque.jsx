import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, DeviceMobile, Scan, WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { Button, CountUp, IconButton, Reveal, cx, ease, useMedia } from '../components/ui'
import { DEPARTURES, depById, fmt, guideById, tourOf, vehicleOf } from '../data/mock'
import { useOps, depPhase, depStats, paxOfDep } from '../store'
import { SeatPlan, CapacityLine, computeLayout, orderByBooking } from './embarque/SeatPlan'
import {
  BottomSheet, DepartureList, DepartureStrip, GuideColumn, GuideSheet, Manifest, PaxDetail, depTitle, groupDepartures, paxState,
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

const fmtDiff = (m) => {
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h} h ${r} min` : `${h} h`
}

const PHASE_WORD = { boarding: 'embarcando', live: 'em andamento', scheduled: 'agendada', done: 'concluída' }

function Stat({ label, children, className }) {
  return (
    <div className={cx('min-w-0', className)}>
      <p className="text-[13px] text-ink-3">{label}</p>
      <div className="mt-1 truncate text-[16px] font-medium">{children}</div>
    </div>
  )
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
  const canSim = stats.waiting > 0 && phase !== 'done'

  // embarques feitos desde que a tela abriu
  const initial = useRef(null)
  if (initial.current === null) initial.current = new Set(pax.filter((p) => status[p.id]?.s === 'boarded').map((p) => p.id))
  const fresh = pax.filter((p) => status[p.id]?.s === 'boarded' && !initial.current.has(p.id)).length

  const time =
    phase === 'boarding' || phase === 'scheduled'
      ? { label: 'Sai em', value: fmtDiff(Math.max(0, diff)) }
      : { label: phase === 'live' ? 'Volta às' : 'Voltou às', value: fmt(dep.end) }

  return (
    <section className="@container rounded-[28px] bg-surface p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start @3xl:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[30px]">{dep.route || tour.name}</h1>
          <p className="mt-1.5 truncate text-[15px] text-ink-3">
            {vehicle.name} · <span className="tnum text-ink-2">{fmt(dep.start)}</span> · {PHASE_WORD[phase]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            label={online ? 'Simular sem internet' : 'Reconectar'}
            onClick={() => setOnline(!online)}
            className={cx('!size-11', online ? 'bg-sunken !text-ink-2' : 'bg-gold-tint !text-ink')}
          >
            {online ? <WifiHigh size={18} /> : <WifiSlash size={18} />}
          </IconButton>
          <Button variant="light" size="lg" icon={Scan} onClick={onSimulate} disabled={!canSim} className="!h-11 !shadow-none bg-sunken hover:!bg-line">Ler QR</Button>
          <Button size="lg" icon={DeviceMobile} onClick={onToggleGuide} aria-pressed={guideOpen} className="!h-11">App do guia</Button>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-6 @4xl:flex-row @4xl:items-end @4xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CountUp value={stats.boarded} className="text-[60px] font-semibold leading-none tracking-[-0.04em]" />
            {fresh > 0 ? (
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-sunken px-2.5 text-[14px] text-ink-2">
                <ArrowUp size={14} weight="bold" className="text-ok" />
                <span className="font-semibold text-ink tnum">{fresh}</span> agora
              </span>
            ) : stats.waiting > 0 ? (
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-sunken px-2.5 text-[14px] text-ink-2">
                <span className="font-semibold text-ink tnum">{stats.waiting}</span> {stats.waiting === 1 ? 'falta' : 'faltam'}
              </span>
            ) : null}
            {!online && (
              <span className="inline-flex h-7 items-center rounded-full bg-gold-tint px-2.5 text-[14px] text-ink-2">
                Sem internet{stats.queued > 0 && <>&nbsp;·&nbsp;<span className="font-semibold text-ink tnum">{stats.queued}</span>&nbsp;no celular</>}
              </span>
            )}
          </div>
          <p className="mt-2 text-[16px] text-ink">Embarcados de <span className="tnum">{stats.total}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 @4xl:flex @4xl:items-center @4xl:gap-0 @4xl:divide-x @4xl:divide-line">
          <Stat label={time.label} className="@4xl:px-7"><span className="tnum">{time.value}</span></Stat>
          <Stat label={boat ? 'Piloto' : 'Motorista'} className="@4xl:order-3 @4xl:pl-7">{vehicle.skipper}</Stat>
          <Stat label="Guia" className="col-span-2 @4xl:order-2 @4xl:px-7">
            {guide ? (
              <span className="flex items-center gap-2">
                <span className="truncate">{guide.name}</span>
                <span className="text-[13px] font-normal text-ink-3">{guide.langs.join(' · ')}</span>
              </span>
            ) : <span className="text-ink-3">Sem guia</span>}
          </Stat>
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
