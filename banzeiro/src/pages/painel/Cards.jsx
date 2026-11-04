import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  UsersThree, Boat, Path, WarningCircle, ArrowRight, ArrowBendDownRight, Check, ArrowsClockwise,
  QrCode, Warning, Van, Timer, SealCheck, CheckCircle,
} from '@phosphor-icons/react'
import { Card, CardHeader, StatusChip, LangTag, KindDot, Avatar, AvatarStack, CountUp, Button, cx, ease } from '../../components/ui'
import { DEPARTURES, ACTIVITY, KIND, GUIDES, USER, BASE_NOW, CHANNELS, fmt, tourOf, vehicleOf, guideById, depById } from '../../data/mock'
import { useOps, PHASE_LABEL } from '../../store'
import { viewStats, countdown, clamp01 } from './helpers'

// Momento em que cada divergência foi resolvida (sobrevive a remontagens da página)
export const resolvedAt = {}

/* ---------------------------------------------------------------- KPIs */

export function Kpis({ now, status }) {
  const divergences = useOps((s) => s.divergences)
  const stats = DEPARTURES.map((d) => ({ d, st: viewStats(d, status, now) }))
  const pax = stats.reduce((a, x) => a + x.st.total, 0)
  const aboard = stats.filter((x) => x.st.phase === 'live' || x.st.phase === 'boarding').reduce((a, x) => a + x.st.boarded, 0)
  const aboardDeps = stats.filter((x) => (x.st.phase === 'live' || x.st.phase === 'boarding') && x.st.boarded > 0).length
  const live = stats.filter((x) => x.st.phase === 'live').length
  const done = stats.filter((x) => x.st.phase === 'done').length
  const open = divergences.filter((d) => !d.resolved)
  const high = open.filter((d) => d.severity === 'high').length

  const items = [
    { icon: UsersThree, label: 'Passageiros hoje', value: pax, chip: { text: '+14', tone: 'ok', title: 'Importadas às 09:58' } },
    { icon: Boat, label: 'A bordo agora', value: aboard, chip: { text: `em ${aboardDeps} saídas`, tone: 'now', live: true } },
    { icon: Path, label: 'Saídas em andamento', value: live, of: DEPARTURES.length, chip: { text: `${done} ${done === 1 ? 'concluída' : 'concluídas'}`, tone: 'muted' } },
    {
      icon: WarningCircle, label: 'Divergências abertas', value: open.length, alert: open.length > 0,
      chip: open.length ? (high ? { text: `${high} alta`, tone: 'alert' } : { text: 'sem urgência', tone: 'muted' }) : { text: 'conferido', tone: 'ok' },
    },
  ]

  return (
    <Card className="grid grid-cols-2 p-1.5 lg:grid-cols-4">
      {items.map((k, i) => (
        <div
          key={k.label}
          className={cx(
            'flex min-w-0 items-center gap-3.5 border-line px-3.5 py-3.5 md:px-5 md:py-4',
            i % 2 === 1 && 'border-l',
            i >= 2 && 'border-t lg:border-t-0',
            i === 2 && 'lg:border-l',
          )}
        >
          <span className={cx('hidden size-10 shrink-0 place-items-center rounded-full sm:grid', k.alert ? 'bg-alert-tint text-alert' : 'bg-sunken text-ink-2')}>
            <k.icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] text-ink-3">{k.label}</p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className={cx('font-mono text-[26px] font-medium leading-none tracking-[-0.03em] md:text-[28px]', k.alert ? 'text-alert' : 'text-ink')}>
                <CountUp value={k.value} />
                {k.of && <span className="text-[15px] tracking-normal text-ink-4"> de {k.of}</span>}
              </span>
              <DeltaChip {...k.chip} />
            </div>
          </div>
        </div>
      ))}
    </Card>
  )
}

function DeltaChip({ text, tone, live, title }) {
  const c = { ok: 'bg-ok-tint text-ok', now: 'bg-now-tint text-now', alert: 'bg-alert-tint text-alert', muted: 'bg-sunken text-ink-3' }[tone]
  return (
    <span title={title} className={cx('inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full px-1.5 text-[10.5px] font-semibold', c)}>
      {live && <span className="live-dot !size-[5px]" />}
      {text}
    </span>
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
  const left = d.start - now
  const cd = countdown(left)

  return (
    <section className="smoke grain relative overflow-hidden rounded-[24px] p-5 text-white shadow-dark md:p-6">
      <div className="relative flex items-center justify-between gap-3">
        <StatusChip onDark tone="lime" live={st.phase === 'boarding' || st.phase === 'live'}>{PHASE_LABEL[st.phase]}</StatusChip>
        <span className="font-mono text-[11px] text-white/40 tnum">{d.code}</span>
      </div>

      <div className="relative mt-5">
        <p className="text-[12.5px] text-white/50">Embarque agora</p>
        <h3 className="mt-0.5 text-[19px] font-semibold tracking-[-0.015em]">{tour.name}</h3>
        <p className="mt-0.5 text-[12.5px] text-white/50">{vehicle.name} · Píer 2 · <span className="font-mono tnum">{fmt(d.start)}</span></p>
      </div>

      <div className="relative mt-7 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2 font-mono">
            <CountUp value={st.boarded} className="text-[56px] font-medium leading-[0.9] tracking-[-0.05em]" />
            <span className="text-[22px] tracking-[-0.02em] text-white/35 tnum">de {st.total}</span>
          </div>
          <p className="mt-2 text-[12.5px] text-white/50">a bordo</p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-[11.5px] text-white/45">
            <Timer size={13} />
            {cd ? 'zarpa em' : 'zarpou às'}
          </p>
          <p className="mt-1 font-mono text-[24px] font-medium leading-none tracking-[-0.03em] text-lime tnum">{cd ?? fmt(d.start)}</p>
        </div>
      </div>

      <div className="relative mt-4 flex gap-[3px]" aria-label={`${st.boarded} de ${st.total} a bordo`}>
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
          <Avatar initials={guide.initials} hue={guide.hue} size={36} className="ring-1 ring-white/20" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{guide.name}</p>
            <p className="mt-0.5 flex gap-1">
              {guide.langs.map((l) => (
                <span key={l} className="rounded-[5px] bg-white/10 px-1 font-mono text-[10px] font-semibold text-white/70">{l}</span>
              ))}
            </p>
          </div>
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
      <CardHeader className="px-1" title="Próximas saídas" sub={next.length ? `A partir de ${fmt(now)}` : undefined} />
      {next.length === 0 ? (
        <p className="px-1 py-6 text-[13px] text-ink-3">Sem mais saídas hoje.</p>
      ) : (
        <ul className="mt-3 -mx-1">
          <AnimatePresence initial={false}>
            {next.map((d) => {
              const tour = tourOf(d)
              const v = vehicleOf(d)
              const st = viewStats(d, status, now)
              const guides = d.guideIds.map(guideById)
              const langs = [...new Set(guides.flatMap((g) => g.langs))].filter((l) => l !== 'PT').slice(0, 2)
              const occ = st.total / v.capacity
              return (
                <motion.li key={d.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
                  <button
                    onClick={() => navigate(`/embarque/${d.id}`)}
                    className="flex w-full items-center gap-3 rounded-[16px] px-2 py-2.5 text-left transition-colors duration-150 hover:bg-frame"
                  >
                    <div className="w-[50px] shrink-0">
                      <p className="font-mono text-[15px] font-medium leading-none tracking-[-0.02em] text-ink tnum">{fmt(d.start)}</p>
                      <p className="mt-1.5 font-mono text-[10.5px] text-ink-3 tnum">{countdown(d.start - now)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-ink">
                        <KindDot kind={tour.kind} className="!size-[6px] shrink-0" />
                        <span className="truncate">{tour.short}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="truncate text-[11.5px] text-ink-3">{v.name}</span>
                        <span className="h-1 w-10 shrink-0 overflow-hidden rounded-full bg-sunken">
                          <span className="block h-full rounded-full" style={{ width: `${clamp01(occ) * 100}%`, background: occ > 1 ? 'var(--color-alert)' : KIND[tour.kind].color }} />
                        </span>
                        <span className={cx('shrink-0 font-mono text-[10.5px] tnum', occ > 1 ? 'font-semibold text-alert' : 'text-ink-3')}>{st.total}/{v.capacity}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {guides.length ? (
                        <AvatarStack people={guides} size={24} max={2} />
                      ) : (
                        <span className="grid size-6 place-items-center rounded-full bg-sunken text-ink-3" title={`Motorista ${v.skipper}`}><Van size={13} /></span>
                      )}
                      {langs.length > 0 && (
                        <span className="flex gap-1">{langs.map((l) => <LangTag key={l} code={l} className="!h-[17px] !px-1 !text-[9.5px]" />)}</span>
                      )}
                    </div>
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

/* -------------------------------------------------------- Divergências */

const SEV = {
  high: { label: 'Alta', dot: 'bg-alert', chip: 'bg-alert-tint text-alert' },
  medium: { label: 'Média', dot: 'bg-land', chip: 'bg-land-tint text-[#9A6A16]' },
  low: { label: 'Baixa', dot: 'bg-ink-4', chip: 'bg-sunken text-ink-3' },
}

export function Divergencias({ now }) {
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
        title="Divergências"
        sub="Entre reservas, agências e listas de bordo"
        right={
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={open.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease }}
              className={cx('grid h-6 min-w-6 place-items-center rounded-full px-2 font-mono text-[11.5px] font-semibold tnum', open.length ? 'bg-alert-tint text-alert' : 'bg-ok-tint text-ok')}
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
              const sev = SEV[x.severity]
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
                    <span className={cx('inline-flex h-5 items-center gap-1.5 rounded-full px-1.5 text-[10.5px] font-semibold', sev.chip)}>
                      <span className={cx('size-[5px] rounded-full', sev.dot)} />
                      {sev.label}
                    </span>
                    <span className="truncate text-[11.5px] text-ink-3">{CHANNELS[x.channel]?.label}</span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-3 tnum">{dep.code} · {fmt(dep.start)}</span>
                  </div>
                  <p className="mt-2.5 text-[13.5px] font-semibold leading-snug text-ink">{x.title}</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-3">{x.detail}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px] text-ink-2">
                      <ArrowBendDownRight size={13} className="shrink-0 text-ink-3" />
                      <span className="truncate">{x.action}</span>
                    </span>
                    <button
                      onClick={() => onResolve(x.id)}
                      disabled={!!pending && !isPending}
                      className={cx(
                        'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-[background,color,transform] duration-200 active:scale-[0.96] disabled:opacity-50',
                        isPending ? 'bg-ok text-white' : 'bg-surface text-ink shadow-pill hover:bg-negro hover:text-white',
                      )}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isPending ? (
                          <motion.span key="ok" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 22 }} className="inline-flex items-center gap-1.5">
                            <Check size={13} weight="bold" /> Resolvida
                          </motion.span>
                        ) : (
                          <motion.span key="go" exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5">
                            <Check size={13} weight="bold" /> Resolver
                          </motion.span>
                        )}
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
              className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-[18px] bg-frame/60 px-6 text-center"
            >
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 380, damping: 18 } }}
                className="grid size-12 place-items-center rounded-full bg-ok-tint text-ok"
              >
                <SealCheck size={24} weight="fill" />
              </motion.span>
              <p className="mt-4 text-[14px] font-semibold text-ink">Listas conferidas. Nada pendente.</p>
              <p className="mt-1 text-[12.5px] text-ink-3">Novas reservas são cruzadas a cada sincronização.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------ Atividade */

const FEED_ICON = { sync: ArrowsClockwise, alert: Warning, scan: QrCode, depart: Boat, ok: CheckCircle }

export function Atividade({ now, status }) {
  const divergences = useOps((s) => s.divergences)
  const personOf = (name) => GUIDES.find((g) => g.name === name) ?? (name === USER.name ? { initials: USER.initials, hue: '#E6B05C' } : null)

  // Eventos gerados ao vivo: saídas que começaram depois da abertura e divergências resolvidas
  const liveDeps = DEPARTURES.filter((d) => d.start > BASE_NOW && d.start <= now).map((d) => {
    const v = vehicleOf(d)
    const g = d.guideIds[0] ? guideById(d.guideIds[0]) : null
    const st = viewStats(d, status, now)
    const verb = v.kind === 'boat' ? 'zarpou com a' : 'saiu com'
    return { id: `l-${d.id}`, at: d.start, who: g ? g.name : v.skipper, what: `${verb} ${v.name} · ${st.boarded} a bordo`, kind: 'depart', fresh: true }
  })
  const solved = divergences.filter((d) => d.resolved).map((d) => ({
    id: `r-${d.id}`, at: resolvedAt[d.id] ?? now, who: USER.name, what: `resolveu: ${d.title.toLowerCase()}`, kind: 'ok', fresh: true,
  }))
  const feed = [...solved, ...liveDeps, ...ACTIVITY].sort((a, b) => b.at - a.at).slice(0, 7)

  return (
    <Card className="flex h-full flex-col p-4 md:p-5">
      <CardHeader
        className="px-1"
        title="Atividade"
        right={
          <span className="inline-flex h-7 items-center gap-2 rounded-full bg-frame px-2.5 text-[11.5px] font-medium text-ink-2">
            <span className="live-dot !size-[6px] text-ok" /> Ao vivo
          </span>
        }
      />
      <ul className="relative mt-4 flex flex-col">
        <span className="absolute bottom-4 left-[17px] top-4 w-px bg-line" aria-hidden />
        <AnimatePresence initial={false}>
          {feed.map((e) => {
            const p = personOf(e.who)
            const Icon = FEED_ICON[e.kind] ?? Boat
            return (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.36, ease }}
                className="relative flex gap-3 px-1 py-2.5"
              >
                {p ? (
                  <Avatar initials={p.initials} hue={p.hue} size={28} ring className={cx('relative mt-0.5', p.hue === '#E6B05C' && '!text-negro')} />
                ) : (
                  <span className={cx('relative mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ring-2 ring-surface', e.kind === 'alert' ? 'bg-alert-tint text-alert' : 'bg-sunken text-ink-2')}>
                    <Icon size={14} weight={e.kind === 'alert' ? 'fill' : 'regular'} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[13px] font-semibold text-ink">{e.who}</p>
                    <span className="shrink-0 font-mono text-[11px] text-ink-3 tnum">{fmt(e.at)}</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">{e.what}</p>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </Card>
  )
}
