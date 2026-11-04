import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UsersThree, Boat, Path, WarningCircle, ArrowRight, Check, Tray, QrCode, Warning, Van, SealCheck, CheckCircle } from '@phosphor-icons/react'
import { Card, CardHeader, KindDot, Avatar, AvatarStack, CountUp, Button, cx, ease } from '../../components/ui'
import { DEPARTURES, GUIDES, USER, BASE_NOW, tourOf, vehicleOf, guideById, depById } from '../../data/mock'
import { useOps } from '../../store'
import { viewStats, countdown, t } from './helpers'

// Momento em que cada pendência foi resolvida (sobrevive a remontagens da página)
export const resolvedAt = {}

const first = (name) => name.split(' ')[0]

/* ---------------------------------------------------------------- KPIs */

export function Kpis({ now, status }) {
  const divergences = useOps((s) => s.divergences)
  const stats = DEPARTURES.map((d) => viewStats(d, status, now))
  const pax = stats.reduce((a, st) => a + st.total, 0)
  const aboard = stats.filter((st) => st.phase === 'live' || st.phase === 'boarding').reduce((a, st) => a + st.boarded, 0)
  const live = stats.filter((st) => st.phase === 'live').length
  const open = divergences.filter((d) => !d.resolved).length

  const items = [
    { icon: UsersThree, label: 'Passageiros', value: pax },
    { icon: Boat, label: 'Embarcados', value: aboard },
    { icon: Path, label: 'Saídas', value: live, of: DEPARTURES.length },
    { icon: WarningCircle, label: 'Pendências', value: open, alert: open > 0 },
  ]

  return (
    <Card className="grid grid-cols-2 p-1.5 lg:grid-cols-4">
      {items.map((k, i) => (
        <div
          key={k.label}
          className={cx(
            'flex min-w-0 items-center gap-3.5 border-line px-4 py-3.5 md:px-5 md:py-4',
            i % 2 === 1 && 'border-l',
            i >= 2 && 'border-t lg:border-t-0',
            i === 2 && 'lg:border-l',
          )}
        >
          <span className={cx('hidden size-10 shrink-0 place-items-center rounded-full transition-colors duration-300 sm:grid', k.alert ? 'bg-alert-tint text-alert' : 'bg-sunken text-ink-2')}>
            <k.icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] text-ink-3">{k.label}</p>
            <p className={cx('mt-0.5 text-[26px] font-semibold leading-none tracking-[-0.03em] tnum md:text-[28px]', k.alert ? 'text-alert' : 'text-ink')}>
              <CountUp value={k.value} />
              {k.of && <span className="text-[16px] font-medium tracking-normal text-ink-4"> de {k.of}</span>}
            </p>
          </div>
        </div>
      ))}
    </Card>
  )
}

/* ------------------------------------------------------- Embarque agora */

export function NowCard({ now, status }) {
  const navigate = useNavigate()
  const d = depById('d7')
  const tour = tourOf(d)
  const vehicle = vehicleOf(d)
  const guide = guideById(d.guideIds[0])
  const st = viewStats(d, status, now)
  const cd = countdown(d.start - now)

  return (
    <section className="smoke grain relative overflow-hidden rounded-[24px] p-5 text-white shadow-dark md:p-6">
      <div className="relative flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[12.5px] text-white/60">
          <span className="live-dot !size-[6px] text-lime" /> Embarque agora
        </span>
        <span className="font-mono text-[11px] text-white/40 tnum">{d.code}</span>
      </div>

      <h3 className="relative mt-4 text-[19px] font-semibold tracking-[-0.015em]">{tour.name}</h3>
      <p className="relative mt-0.5 text-[12.5px] text-white/50">{vehicle.name} · <span className="font-mono tnum">{t(d.start)}</span></p>

      <div className="relative mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-baseline gap-2">
            <CountUp value={st.boarded} className="text-[56px] font-semibold leading-[0.9] tracking-[-0.045em]" />
            <span className="text-[22px] font-medium text-white/35 tnum">de {st.total}</span>
          </p>
          <p className="mt-2 text-[12.5px] text-white/50">Embarcados</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-white/45">{cd ? 'Zarpa em' : 'Zarpou'}</p>
          <p className="mt-1 text-[24px] font-semibold leading-none tracking-[-0.02em] text-lime tnum">{cd ?? <span className="font-mono">{t(d.start)}</span>}</p>
        </div>
      </div>

      <div className="relative mt-4 flex gap-[3px]" aria-label={`${st.boarded} de ${st.total} embarcados`}>
        {Array.from({ length: st.total }, (_, i) => (
          <span key={i} className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full rounded-full bg-lime"
              initial={false}
              animate={{ width: i < st.boarded ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease, delay: i * 0.025 }}
            />
          </span>
        ))}
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar initials={guide.initials} hue={guide.hue} size={34} className="ring-1 ring-white/20" />
          <p className="truncate text-[13px] font-medium">{guide.name}</p>
        </div>
        <Button variant="lime" iconRight={ArrowRight} onClick={() => navigate(`/embarque/${d.id}`)}>
          Conferir embarque
        </Button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------ Próximas saídas */

export function Proximas({ now, status }) {
  const navigate = useNavigate()
  const next = DEPARTURES.filter((d) => d.start > now).sort((a, b) => a.start - b.start).slice(0, 4)
  return (
    <Card className="p-4 md:p-5">
      <CardHeader className="px-1" title="Próximas saídas" />
      {next.length === 0 ? (
        <p className="px-1 py-6 text-[13px] text-ink-3">Sem mais saídas hoje.</p>
      ) : (
        <ul className="-mx-1 mt-3">
          <AnimatePresence initial={false}>
            {next.map((d) => {
              const tour = tourOf(d)
              const v = vehicleOf(d)
              const st = viewStats(d, status, now)
              const guides = d.guideIds.map(guideById)
              const over = st.total > v.capacity
              return (
                <motion.li key={d.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
                  <button
                    onClick={() => navigate(`/embarque/${d.id}`)}
                    className="flex w-full items-center gap-3 rounded-[16px] px-2 py-2.5 text-left transition-colors duration-150 hover:bg-frame"
                  >
                    <span className="w-[44px] shrink-0 font-mono text-[14px] font-medium tracking-[-0.02em] text-ink tnum">{t(d.start)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                        <KindDot kind={tour.kind} className="!size-[6px] shrink-0" />
                        <span className="truncate">{d.route ?? tour.short}</span>
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-ink-3">
                        {v.name} · <span className={cx('tnum', over && 'font-semibold text-alert')}>{st.total}/{v.capacity}</span>
                      </p>
                    </div>
                    {guides.length ? (
                      <AvatarStack people={guides} size={26} max={2} />
                    ) : (
                      <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-sunken text-ink-3" title={`Motorista ${v.skipper}`}><Van size={14} /></span>
                    )}
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  )
}

/* ---------------------------------------------------------- Pendências */

const SEV_DOT = { high: 'bg-alert', medium: 'bg-gold', low: 'bg-ink-4' }

export function Pendencias({ now }) {
  const all = useOps((s) => s.divergences)
  const resolve = useOps((s) => s.resolveDivergence)
  const reduce = useReducedMotion()
  const open = all.filter((d) => !d.resolved)
  const [pending, setPending] = useState(null)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  const onResolve = (id) => {
    if (pending) return
    setPending(id)
    resolvedAt[id] = now
    timer.current = setTimeout(() => { resolve(id); setPending(null) }, reduce ? 0 : 560)
  }

  return (
    <Card className="flex h-full flex-col p-4 md:p-5">
      <CardHeader
        className="px-1"
        title="Pendências"
        right={
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={open.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease }}
              className={cx('grid h-6 min-w-6 place-items-center rounded-full px-2 text-[12px] font-semibold tnum', open.length ? 'bg-alert-tint text-alert' : 'bg-ok-tint text-ok')}
            >
              {open.length}
            </motion.span>
          </AnimatePresence>
        }
      />

      <div className="relative mt-4 flex-1">
        <ul className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {open.map((x) => {
              const dep = depById(x.depId)
              const isPending = pending === x.id
              return (
                <motion.li
                  key={x.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 48, scale: 0.97, transition: { duration: 0.34, ease } }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className={cx('relative overflow-hidden rounded-[18px] p-3.5 transition-colors duration-300', isPending ? 'bg-ok-tint' : 'bg-frame')}
                >
                  <div className="flex items-center gap-2">
                    <span className={cx('size-[7px] shrink-0 rounded-full', SEV_DOT[x.severity])} />
                    <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">{x.title}</p>
                    <span className="shrink-0 font-mono text-[11px] text-ink-3 tnum">{t(dep.start)}</span>
                  </div>
                  <p className="mt-1 truncate pl-[15px] text-[12.5px] text-ink-3">{x.detail}</p>
                  <div className="mt-3 flex items-center gap-2 pl-[15px]">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-2">{x.action}</span>
                    <button
                      onClick={() => onResolve(x.id)}
                      disabled={!!pending && !isPending}
                      className={cx(
                        'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-[background,color,transform] duration-200 active:scale-[0.96] disabled:opacity-50',
                        isPending ? 'bg-ok text-white' : 'bg-surface text-ink shadow-pill hover:bg-negro hover:text-white',
                      )}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={isPending ? 'ok' : 'go'}
                          initial={isPending ? { scale: 0.5, opacity: 0 } : false}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 24 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Check size={13} weight="bold" /> {isPending ? 'Feito' : 'Resolver'}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        <AnimatePresence>
          {open.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.42, ease } }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[18px] bg-frame/60 px-6 text-center"
            >
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 380, damping: 18 } }}
                className="grid size-12 place-items-center rounded-full bg-ok-tint text-ok"
              >
                <SealCheck size={24} weight="fill" />
              </motion.span>
              <p className="mt-4 text-[14px] font-semibold text-ink">Listas conferidas. Nada pendente.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------ Atividade */

// Textos curtos, uma linha por evento
const BASE_FEED = [
  { id: 'e1', at: 10 * 60 + 3, who: 'Thiago Kambeba', text: 'conferiu 7 de 12 na Jaraqui', icon: QrCode },
  { id: 'e2', at: 9 * 60 + 58, text: '14 reservas novas', icon: Tray },
  { id: 'e3', at: 9 * 60 + 41, text: 'Pôr do sol com 2 sem lugar', icon: Warning, alert: true },
  { id: 'e4', at: 9 * 60 + 12, who: 'Jéssica Tavares', text: 'saiu com a Van 01' },
  { id: 'e5', at: 8 * 60 + 36, who: 'Raimundo Sá', text: 'zarpou na Lancha Boto' },
]

export function Atividade({ now }) {
  const divergences = useOps((s) => s.divergences)
  const personOf = (name) => GUIDES.find((g) => g.name === name) ?? (name === USER.name ? { initials: USER.initials, hue: 'var(--color-gold)' } : null)

  const liveDeps = DEPARTURES.filter((d) => d.start > BASE_NOW && d.start <= now).map((d) => {
    const v = vehicleOf(d)
    const g = d.guideIds[0] ? guideById(d.guideIds[0]) : null
    return { id: `l-${d.id}`, at: d.start, who: g ? g.name : v.skipper, text: `${v.kind === 'boat' ? 'zarpou na' : 'saiu com a'} ${v.name}` }
  })
  const solved = divergences.filter((d) => d.resolved).map((d) => ({
    id: `r-${d.id}`, at: resolvedAt[d.id] ?? now, who: USER.name, text: `resolveu ${d.title.toLowerCase()}`, icon: CheckCircle,
  }))
  const feed = [...solved, ...liveDeps, ...BASE_FEED].sort((a, b) => b.at - a.at).slice(0, 4)

  return (
    <Card className="p-4 md:p-5">
      <CardHeader className="px-1" title="Atividade" right={<span className="live-dot !size-[6px] mr-1 text-ok" aria-label="Ao vivo" />} />
      <ul className="mt-3 flex flex-col">
        <AnimatePresence initial={false}>
          {feed.map((e) => {
            const p = e.who ? personOf(e.who) : null
            const Icon = e.icon ?? Boat
            return (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.36, ease }}
                className="flex items-center gap-3 px-1 py-2.5"
              >
                {p ? (
                  <Avatar initials={p.initials} hue={p.hue} size={28} className={cx(e.who === USER.name && '!text-negro')} />
                ) : (
                  <span className={cx('grid size-7 shrink-0 place-items-center rounded-full', e.alert ? 'bg-alert-tint text-alert' : 'bg-sunken text-ink-2')}>
                    <Icon size={14} weight={e.alert ? 'fill' : 'regular'} />
                  </span>
                )}
                <p className="min-w-0 flex-1 truncate text-[13px] text-ink-3">
                  {e.who && <span className="font-semibold text-ink">{first(e.who)} </span>}
                  {e.text}
                </p>
                <span className="shrink-0 font-mono text-[11px] text-ink-3 tnum">{t(e.at)}</span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </Card>
  )
}
