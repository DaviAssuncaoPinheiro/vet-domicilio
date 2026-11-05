import { ArrowRight, ArrowUp, Bell, Boat, CalendarBlank, MagnifyingGlass, QrCode, WifiSlash } from '@phosphor-icons/react'
import { CountUp, Reveal, cx } from '../../components/ui'
import { DEPARTURES, fmt, tourOf, vehicleOf } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen, NetPill, Switch } from './parts'

function RoundButton({ label, onClick, children }) {
  return (
    <button aria-label={label} onClick={onClick} className="relative grid size-14 shrink-0 place-items-center rounded-full bg-surface text-ink transition-transform active:scale-95">
      {children}
    </button>
  )
}

/** Linhas curvas finas no fundo do card, bem suaves */
function Curves({ className }) {
  return (
    <svg className={cx('pointer-events-none absolute inset-0 h-full w-full', className)} viewBox="0 0 250 232" preserveAspectRatio="none" aria-hidden>
      <path d="M-10 150 C 60 110, 120 190, 260 130" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M-10 182 C 70 140, 150 215, 260 165" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ActionCard({ tone, icon: Icon, title, line, tag, action, onClick }) {
  const dark = tone === 'dark'
  const bg = { gold: 'bg-gold-light text-ink', dark: 'bg-negro text-white', sunken: 'bg-sunken text-ink' }[tone]
  return (
    <div onClick={onClick} className={cx('relative flex h-[232px] w-[250px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[28px] p-5', bg, onClick && 'cursor-pointer')}>
      <Curves className={dark ? 'text-white/[0.07]' : 'text-ink/[0.07]'} />
      <span className="relative grid size-12 place-items-center rounded-full bg-surface text-ink"><Icon size={20} weight="fill" /></span>
      <div className="relative">
        <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.02em]">{title}</h3>
        <p className={cx('mt-1 text-[15px]', dark ? 'text-white/70' : 'text-ink-2')}>{line}</p>
      </div>
      <div className="relative flex h-[52px] items-center justify-between">
        <span className={cx('text-[12px] font-medium uppercase tracking-[0.04em]', dark ? 'text-white/60' : 'text-ink-2')}>{tag}</span>
        {action}
      </div>
    </div>
  )
}

function ArrowButton({ label, onClick, gold }) {
  return (
    <button
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cx('grid size-[52px] place-items-center rounded-full transition-transform active:scale-95', gold ? 'bg-gold text-negro' : 'bg-negro text-white')}
    >
      <ArrowRight size={20} weight="bold" />
    </button>
  )
}

export default function Inicio() {
  const { dep, tour, vehicle, pax, stats, now, go, setQuery } = useGuia()
  const online = useOps((s) => s.online)
  const status = useOps((s) => s.status)
  const setOnline = useOps((s) => s.setOnline)

  // embarcados nos últimos 5 minutos
  const recent = pax.filter((p) => { const st = status[p.id]; return st?.s === 'boarded' && st.at <= now && st.at >= now - 5 }).length

  const pier = tour.meeting.split(' · ')[0]
  const next = DEPARTURES.filter((d) => d.id !== dep.id && d.start > dep.start && tourOf(d).meeting.startsWith(pier)).sort((a, b) => a.start - b.start)[0]

  return (
    <Screen>
      <Reveal i={0} className="flex items-center justify-between gap-3 px-5 pt-1">
        <RoundButton label="Lista de passageiros" onClick={() => go('list')}><CalendarBlank size={20} weight="fill" /></RoundButton>
        <NetPill />
        <RoundButton label="Avisos">
          <Bell size={20} weight="fill" />
          <span className="absolute right-[17px] top-[16px] size-2 rounded-full bg-alert ring-2 ring-surface" />
        </RoundButton>
      </Reveal>

      <Reveal i={1} className="mt-5 flex items-center justify-between gap-4 px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <CountUp value={stats.boarded} className="text-[60px] font-semibold leading-none tracking-[-0.04em]" />
            {recent > 0 && (
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-surface px-2.5 text-[14px] text-ink">
                <ArrowUp size={14} weight="bold" className="text-ok" />
                <span className="font-semibold tnum">{recent}</span> agora
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[16px] text-ink">Embarcados de {stats.total}</p>
        </div>
        <button aria-label="Abrir scanner" onClick={() => go('scan')} className="grid size-14 shrink-0 place-items-center rounded-full bg-negro text-white shadow-dark transition-transform active:scale-95">
          <QrCode size={24} />
        </button>
      </Reveal>

      <Reveal i={2} className="mt-6 px-4">
        <label className="flex h-[52px] items-center gap-3 rounded-[18px] border border-line bg-surface px-4">
          <MagnifyingGlass size={20} className="shrink-0 text-ink-3" />
          <input
            placeholder="Buscar passageiro"
            aria-label="Buscar passageiro"
            onChange={(e) => { setQuery(e.target.value); go('list', { focus: true }) }}
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
      </Reveal>

      <Reveal i={3} className="mt-4">
        <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
          <ActionCard
            tone="gold"
            icon={QrCode}
            title="Conferir embarque"
            line={<>{vehicle.name} às <span className="font-mono">{fmt(dep.start)}</span></>}
            tag="Embarcando"
            onClick={() => go('scan')}
            action={<ArrowButton label="Conferir embarque" onClick={() => go('scan')} />}
          />
          <ActionCard
            tone="dark"
            icon={WifiSlash}
            title="Sem internet"
            line={online ? 'Leituras ficam no celular' : stats.queued ? `${stats.queued} ${stats.queued === 1 ? 'leitura' : 'leituras'} no celular` : 'Leituras ficam no celular'}
            tag="Modo offline"
            action={<Switch onDark checked={!online} onChange={(v) => setOnline(!v)} label="Sem internet" />}
          />
          {next && (
            <ActionCard
              tone="sunken"
              icon={Boat}
              title="Próxima saída"
              line={<>{vehicleOf(next).name} às <span className="font-mono">{fmt(next.start)}</span></>}
              tag="Depois"
              onClick={() => go('deps')}
              action={<ArrowButton label="Ver saídas" onClick={() => go('deps')} />}
            />
          )}
        </div>
      </Reveal>
    </Screen>
  )
}
