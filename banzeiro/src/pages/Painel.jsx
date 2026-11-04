import { CalendarBlank, CaretDown, Faders } from '@phosphor-icons/react'
import { Reveal, Pill, IconButton } from '../components/ui'
import { TODAY_LABEL } from '../data/mock'
import { useOps } from '../store'
import Timeline from './painel/Timeline'
import { Kpis, NowCard, Proximas, Divergencias, Atividade } from './painel/Cards'

export default function Painel() {
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <Reveal i={0}>
        <header className="flex items-end justify-between gap-4 px-2 pb-1 pt-3 md:px-3 md:pt-4">
          <div className="min-w-0">
            <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">Hoje</h1>
            <p className="mt-1.5 truncate text-[13px] text-ink-3">{TODAY_LABEL} · Manaus</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-2 sm:flex">
              <Pill icon={CalendarBlank}>
                <span className="font-mono tnum">04/11</span>
                <CaretDown size={12} weight="bold" className="-mr-1 text-ink-3" />
              </Pill>
              <Pill icon={Faders}>Filtro</Pill>
            </span>
            <IconButton label="Filtro" className="bg-surface !text-ink-2 shadow-pill sm:hidden"><Faders size={17} /></IconButton>
          </div>
        </header>
      </Reveal>

      <Reveal i={1}><Kpis now={now} status={status} /></Reveal>

      <Reveal i={2} className="min-w-0"><Timeline now={now} status={status} /></Reveal>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
        <div className="flex min-w-0 flex-col gap-3 md:col-span-6 md:gap-4 xl:col-span-4">
          <Reveal i={3}><NowCard now={now} status={status} /></Reveal>
          <Reveal i={4}><Proximas now={now} status={status} /></Reveal>
        </div>
        <Reveal i={5} className="h-full min-w-0 md:col-span-6 xl:col-span-4"><Divergencias now={now} /></Reveal>
        <Reveal i={6} className="h-full min-w-0 md:col-span-12 xl:col-span-4"><Atividade now={now} status={status} /></Reveal>
      </div>
    </div>
  )
}
