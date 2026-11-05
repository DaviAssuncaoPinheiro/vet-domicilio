import { CalendarBlank, CaretDown, Faders, Television } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Reveal, Pill, IconButton, Button } from '../components/ui'
import { TODAY_LABEL } from '../data/mock'
import { useOps } from '../store'
import Timeline from './painel/Timeline'
import { Kpis, NowCard, Proximas, Pendencias, Atividade } from './painel/Cards'

export default function Painel() {
  const nav = useNavigate()
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <Reveal i={0}>
        <header className="flex items-end justify-between gap-4 px-2 pb-1 pt-3 md:px-3 md:pt-4">
          <div className="min-w-0">
            <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">Hoje</h1>
            <p className="mt-1.5 truncate text-[13px] text-ink-3">{TODAY_LABEL}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-2 sm:flex">
              <Pill icon={CalendarBlank}>
                <span>4 nov</span>
                <CaretDown size={12} weight="bold" className="-mr-1 text-ink-3" />
              </Pill>
              <Pill icon={Faders}>Filtro</Pill>
            </span>
            <IconButton label="Filtro" className="bg-surface !text-ink-2 shadow-pill sm:hidden"><Faders size={17} /></IconButton>
            <Button icon={Television} onClick={() => nav('/tv')}>Modo TV</Button>
          </div>
        </header>
      </Reveal>

      <Reveal i={1}><Kpis now={now} status={status} /></Reveal>

      <Reveal i={2} className="min-w-0"><Timeline now={now} status={status} /></Reveal>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
        <Reveal i={3} className="order-first h-full min-w-0 md:col-span-12 xl:order-last xl:col-span-4"><NowCard now={now} status={status} /></Reveal>
        <Reveal i={4} className="h-full min-w-0 md:col-span-6 xl:col-span-4"><Proximas now={now} status={status} /></Reveal>
        <Reveal i={5} className="h-full min-w-0 md:col-span-6 xl:col-span-4"><Pendencias now={now} /></Reveal>
      </div>

      <Reveal i={6} className="min-w-0"><Atividade now={now} /></Reveal>
    </div>
  )
}
