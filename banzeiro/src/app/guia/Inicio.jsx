import { ArrowUpRight, Bell, Boat, CaretRight, UsersThree, WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { Card, CountUp, Progress, Reveal, cx } from '../../components/ui'
import { DEPARTURES, TODAY_LABEL, fmt, tourOf, vehicleOf } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen, NetPill, Switch, durLabel } from './parts'

function greeting(now) {
  if (now < 12 * 60) return 'Bom dia'
  if (now < 18 * 60) return 'Boa tarde'
  return 'Boa noite'
}

function RowIcon({ children, tone = 'bg-sunken text-ink-2' }) {
  return <span className={cx('grid size-9 shrink-0 place-items-center rounded-[11px] transition-colors', tone)}>{children}</span>
}

export default function Inicio() {
  const { dep, tour, vehicle, guide, stats, now, go, released } = useGuia()
  const online = useOps((s) => s.online)
  const setOnline = useOps((s) => s.setOnline)
  const mins = dep.start - now

  // próxima saída do mesmo píer
  const pier = tour.meeting.split(' · ')[0]
  const next = DEPARTURES.filter((d) => d.id !== dep.id && d.start > dep.start && tourOf(d).meeting.startsWith(pier)).sort((a, b) => a.start - b.start)[0]

  return (
    <Screen>
      <Reveal i={0} className="flex items-center gap-3 px-5 pt-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[24px] font-semibold leading-tight tracking-[-0.025em]">{greeting(now)}, {guide.name.split(' ')[0]}</h1>
          <p className="mt-0.5 truncate text-[13.5px] text-ink-3">{TODAY_LABEL}</p>
        </div>
        <button aria-label="Avisos" className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-pill transition-transform active:scale-95">
          <Bell size={19} />
        </button>
      </Reveal>

      <Reveal i={1} className="mt-5 px-4">
        <div className="smoke grain relative overflow-hidden rounded-[28px] p-5 text-white shadow-dark">
          <p className="relative truncate text-[15px] font-medium text-white/80">{vehicle.name} · <span className="font-mono">{fmt(dep.start)}</span></p>
          <div className="relative empty:hidden [&:not(:empty)]:mt-3"><NetPill glass /></div>

          <div className="relative mt-6 flex items-baseline gap-2.5 tnum">
            <CountUp value={stats.boarded} className="text-[72px] font-semibold leading-[0.85] tracking-[-0.05em]" />
            <span className="text-[28px] font-medium tracking-[-0.03em] text-white/40">de {stats.total}</span>
          </div>
          <p className="relative mt-2 text-[15px] text-white/60">a bordo</p>

          <Progress value={stats.boarded} max={stats.total} color="var(--color-lime)" track="rgba(255,255,255,.12)" height={4} className="relative mt-5" />

          <p className="relative mt-3 text-[14px] text-white/65">
            {released ? 'Saída liberada' : mins > 0 ? <>Zarpa em <span className="font-semibold text-white tnum">{durLabel(mins)}</span></> : 'Hora de sair'}
          </p>

          <button
            onClick={() => go('scan')}
            className="relative mt-5 flex h-[60px] w-full items-center justify-between rounded-full bg-lime pl-6 pr-2 text-negro transition-transform duration-150 active:scale-[0.98]"
          >
            <span className="text-[16px] font-semibold tracking-[-0.01em]">Conferir embarque</span>
            <span className="grid size-11 place-items-center rounded-full bg-negro text-lime"><ArrowUpRight size={18} weight="bold" /></span>
          </button>
        </div>
      </Reveal>

      <Reveal i={2} className="mt-3 px-4">
        <Card className="px-2 py-1.5">
          <button onClick={() => go('list', { filter: 'waiting' })} className="flex min-h-[56px] w-full items-center gap-3 rounded-[16px] px-2.5 text-left transition-colors active:bg-sunken">
            <RowIcon><UsersThree size={18} /></RowIcon>
            <span className="flex-1 text-[15px] font-medium">Aguardando</span>
            <span className="text-[16px] font-semibold tnum">{stats.waiting}</span>
            <CaretRight size={15} className="text-ink-4" />
          </button>

          {next && (
            <div className="flex min-h-[56px] items-center gap-3 border-t border-line px-2.5">
              <RowIcon><Boat size={18} /></RowIcon>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">Próxima saída</span>
                <span className="block truncate text-[12.5px] text-ink-3">{vehicleOf(next).name}</span>
              </span>
              <span className="pr-[19px] font-mono text-[16px] font-medium">{fmt(next.start)}</span>
            </div>
          )}

          <div className="flex min-h-[56px] items-center gap-3 border-t border-line px-2.5 py-1.5">
            <RowIcon tone={online ? 'bg-sunken text-ink-2' : 'bg-gold-tint text-gold-deep'}>
              {online ? <WifiHigh size={18} /> : <WifiSlash size={18} />}
            </RowIcon>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">Sem internet</span>
              {!online && <span className="block text-[12.5px] leading-snug text-ink-3">Salvo no celular, envia quando voltar o sinal</span>}
            </span>
            <Switch checked={!online} onChange={(v) => setOnline(!v)} label="Sem internet" />
          </div>
        </Card>
      </Reveal>
    </Screen>
  )
}
