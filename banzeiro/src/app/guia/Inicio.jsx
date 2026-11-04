import { motion } from 'framer-motion'
import { Bell, Timer, ArrowUpRight, ArrowRight, Boat, WifiHigh, WifiSlash, Translate } from '@phosphor-icons/react'
import { Avatar, Card, CountUp, Reveal, StatusChip, LangTag, cx } from '../../components/ui'
import { DEPARTURES, TODAY_LABEL, fmt, tourOf, vehicleOf, guideById } from '../../data/mock'
import { useOps, depPhase, PHASE_LABEL } from '../../store'
import { useGuia, Screen, NetPill, Switch, durLabel } from './parts'

function greeting(now) {
  if (now < 12 * 60) return 'Bom dia'
  if (now < 18 * 60) return 'Boa tarde'
  return 'Boa noite'
}

export default function Inicio() {
  const { dep, tour, vehicle, guide, pax, stats, now, go, released } = useGuia()
  const online = useOps((s) => s.online)
  const setOnline = useOps((s) => s.setOnline)
  const phase = depPhase(dep, now)
  const mins = dep.start - now
  const first = guide.name.split(' ')[0]

  // idiomas a bordo
  const langCount = pax.reduce((acc, p) => ({ ...acc, [p.lang]: (acc[p.lang] ?? 0) + 1 }), {})
  const langs = Object.entries(langCount).sort((a, b) => b[1] - a[1])

  // próxima saída do mesmo píer
  const pier = tour.meeting.split(' · ')[0]
  const next = DEPARTURES.filter((d) => d.id !== dep.id && d.start > dep.start && tourOf(d).meeting.startsWith(pier)).sort((a, b) => a.start - b.start)[0]

  // linha do dia
  const day = [
    { at: dep.start - 45, title: 'Apresentação no píer', sub: tour.meeting },
    { at: dep.start, title: `Saída · ${vehicle.name}`, sub: `${stats.total} passageiros · ${langs.slice(0, 3).map((l) => l[0]).join(', ')}` },
    { at: dep.start + 50, title: 'Encontro dos rios', sub: 'Parada para fotos' },
    { at: dep.start + 140, title: 'Botos e vitória-régia', sub: 'Parque Ecológico do Janauari' },
    { at: dep.end, title: `Retorno ao ${pier}`, sub: 'Fechamento da lista' },
  ]
  const cur = Math.max(0, day.findIndex((d) => d.at >= now))

  const heroLabel = released ? 'Saída liberada' : phase === 'scheduled' ? 'Agendada' : PHASE_LABEL[phase]

  return (
    <Screen>
      {/* cabeçalho */}
      <Reveal i={0} className="flex items-center gap-3 px-5 pt-1">
        <Avatar initials={guide.initials} hue={guide.hue} size={46} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] text-ink-3">{TODAY_LABEL}</p>
          <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.025em]">{greeting(now)}, {first}</h1>
        </div>
        <button aria-label="Avisos" className="relative grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-pill active:scale-95">
          <Bell size={19} />
          <span className="absolute right-[11px] top-[11px] size-[7px] rounded-full bg-alert ring-2 ring-surface" />
        </button>
      </Reveal>

      {/* card escuro principal */}
      <Reveal i={1} className="mt-5 px-4">
        <div className="smoke grain relative overflow-hidden rounded-[28px] p-5 text-white shadow-dark">
          <div className="relative flex h-8 items-center justify-between gap-2">
            <StatusChip onDark live={!released} tone="lime">{heroLabel}</StatusChip>
            {online ? <span className="font-mono text-[11px] text-white/40 tnum">{dep.code}</span> : <NetPill glass />}
          </div>

          <p className="relative mt-5 text-[13.5px] text-white/65">{vehicle.name} · <span className="font-mono tnum">{fmt(dep.start)}</span></p>
          <div className="relative mt-1.5 flex items-baseline gap-2.5">
            <CountUp value={stats.boarded} className="font-mono text-[68px] font-medium leading-[0.9] tracking-[-0.06em]" />
            <span className="font-mono text-[26px] tracking-[-0.03em] text-white/35">de {stats.total}</span>
            <span className="ml-auto text-[12.5px] text-white/50">a bordo</span>
          </div>

          <div className="relative mt-5 flex gap-[3px]" aria-hidden>
            {pax.map((p, i) => (
              <span key={p.id} className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.span
                  className="block h-full rounded-full bg-lime"
                  initial={false}
                  animate={{ width: i < stats.boarded ? '100%' : '0%' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i < stats.boarded ? i * 0.02 : 0 }}
                />
              </span>
            ))}
          </div>

          <div className="relative mt-3.5 flex items-center justify-between text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 text-white/60">
              <Timer size={15} />
              {released ? 'Lista enviada à central' : mins > 0 ? <>Zarpa em <span className="font-mono font-medium text-white tnum">{durLabel(mins)}</span></> : 'Horário de saída'}
            </span>
            <span className="text-white/50"><span className="font-mono text-white tnum">{stats.waiting}</span> {stats.waiting === 1 ? 'falta' : 'faltam'}</span>
          </div>

          <button
            onClick={() => go('scan')}
            className="relative mt-5 flex h-[60px] w-full items-center justify-between rounded-full bg-lime pl-6 pr-2 text-negro transition-transform duration-150 active:scale-[0.98]"
          >
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Conferir embarque</span>
            <span className="grid size-11 place-items-center rounded-full bg-negro text-lime"><ArrowUpRight size={18} weight="bold" /></span>
          </button>
        </div>
      </Reveal>

      {/* cards gêmeos */}
      <Reveal i={2} className="mt-3 grid grid-cols-2 gap-3 px-4">
        <button onClick={() => go('list', { filter: 'waiting' })} className="flex h-[128px] flex-col justify-between rounded-[24px] bg-lime p-4 text-left text-negro transition-transform duration-150 active:scale-[0.98]">
          <span className="text-[12.5px] font-medium text-negro/60">Faltam embarcar</span>
          <span className="flex items-end justify-between">
            <span className="font-mono text-[34px] font-medium leading-none tracking-[-0.04em] tnum">{String(stats.waiting).padStart(2, '0')}</span>
            <span className="grid size-10 place-items-center rounded-full bg-negro text-white"><ArrowRight size={16} weight="bold" /></span>
          </span>
        </button>
        <Card className="flex h-[128px] flex-col justify-between p-4">
          <span className="flex items-center justify-between text-[12.5px] text-ink-3">Idiomas a bordo <Translate size={16} /></span>
          <span>
            <span className="font-mono text-[34px] font-medium leading-none tracking-[-0.04em] tnum">{String(langs.length).padStart(2, '0')}</span>
            <span className="mt-2 flex gap-1">
              {langs.slice(0, 3).map(([l]) => <LangTag key={l} code={l} />)}
              {langs.length > 3 && <span className="inline-flex h-[20px] items-center rounded-md px-1 font-mono text-[10.5px] font-semibold text-ink-3">+{langs.length - 3}</span>}
            </span>
          </span>
        </Card>
      </Reveal>

      {/* próxima saída */}
      {next && (
        <Reveal i={3} className="mt-3 px-4">
          <Card className="flex items-center gap-3.5 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-boat-tint text-boat"><Boat size={22} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] text-ink-3">Próxima saída do píer</span>
              <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">{tourOf(next).short}</span>
              <span className="block truncate text-[12.5px] text-ink-3">{vehicleOf(next).name} · {guideById(next.guideIds[0])?.name.split(' ')[0] ?? 'Sem guia'}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-mono text-[20px] font-medium tracking-[-0.03em] tnum">{fmt(next.start)}</span>
              <span className="block text-[11.5px] text-ink-3">em <span className="font-mono tnum">{durLabel(Math.max(0, next.start - now))}</span></span>
            </span>
          </Card>
        </Reveal>
      )}

      {/* seu dia */}
      <Reveal i={4} className="mt-3 px-4">
        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Seu dia</h2>
            <span className="text-[12px] text-ink-3"><span className="font-mono tnum">{fmt(day[0].at)}</span> às <span className="font-mono tnum">{fmt(dep.end)}</span></span>
          </div>
          <ol className="mt-4">
            {day.map((d, i) => {
              const done = i < cur
              const isCur = i === cur
              return (
                <li key={i} className="relative flex gap-3.5">
                  <span className={cx('w-11 shrink-0 pt-[1px] font-mono text-[12.5px] tnum', isCur ? 'font-medium text-ink' : done ? 'text-ink-4' : 'text-ink-3')}>{fmt(d.at)}</span>
                  <span className="relative flex w-3 shrink-0 justify-center">
                    {i < day.length - 1 && <span className={cx('absolute top-[14px] bottom-[-2px] w-px', done ? 'bg-ink/20' : 'bg-line')} />}
                    <span className={cx('relative mt-[4px] size-[9px] rounded-full', isCur ? 'bg-now ring-4 ring-now-tint' : done ? 'bg-ink/30' : 'bg-surface ring-[1.5px] ring-inset ring-ink-4')} />
                  </span>
                  <span className={cx('min-w-0 flex-1', i < day.length - 1 && 'pb-4')}>
                    <span className="flex items-center gap-2">
                      <span className={cx('truncate text-[14px] font-medium', done ? 'text-ink-3' : 'text-ink')}>{d.title}</span>
                      {isCur && <span className="shrink-0 rounded-full bg-now-tint px-2 py-[2px] text-[10.5px] font-semibold text-now">{d.at - now > 0 ? `Em ${durLabel(d.at - now)}` : 'Agora'}</span>}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-3">{d.sub}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        </Card>
      </Reveal>

      {/* modo sem internet */}
      <Reveal i={5} className="mt-3 px-4">
        <Card className="p-4">
          <div className="flex items-center gap-3.5">
            <span className={cx('grid size-11 shrink-0 place-items-center rounded-full transition-colors', online ? 'bg-sunken text-ink-2' : 'bg-land-tint text-[#8A5A12]')}>
              {online ? <WifiHigh size={19} /> : <WifiSlash size={19} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">Modo sem internet</span>
              <span className="block text-[12.5px] leading-snug text-ink-3">{online ? 'Simula o píer sem sinal' : 'Leituras salvas no aparelho'}</span>
            </span>
            <Switch checked={!online} onChange={(v) => setOnline(!v)} label="Modo sem internet" />
          </div>
          <div className="flex min-h-0 items-center gap-2 empty:hidden [&:not(:empty)]:mt-3">
            <NetPill />
          </div>
        </Card>
      </Reveal>
    </Screen>
  )
}
