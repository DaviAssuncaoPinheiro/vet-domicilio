import { useState } from 'react'
import { Reveal } from '../components/ui'
import { useOps } from '../store'
import Timeline from './painel/Timeline'
import Stats from './painel/Stats'
import Agenda from './painel/Agenda'
import { useNavigate } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { TopButtons, SearchBar, PendenciasSheet } from './painel/Hero'

export default function Painel() {
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)
  const openCount = useOps((s) => s.divergences.filter((d) => !d.resolved).length)
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 px-2 pt-2 md:px-0 md:pt-0">
      <div className="grid grid-cols-1 gap-4 xl:min-h-[580px] xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 xl:col-span-7">
          <Reveal i={0} className="flex flex-col gap-5 md:px-2 md:pt-3">
            <TopButtons onBell={() => setSheet(true)} alert={openCount > 0} />
          </Reveal>
          <Reveal i={1} className="flex items-center gap-3">
            <div className="min-w-0 flex-1"><SearchBar query={query} setQuery={setQuery} /></div>
            <button
              aria-label="Nova reserva"
              onClick={() => navigate('/reservas?nova=1')}
              className="hidden size-[52px] shrink-0 place-items-center rounded-full bg-negro text-white transition-transform duration-150 hover:bg-negro-2 active:scale-95 md:grid"
            >
              <Plus size={22} weight="bold" />
            </button>
          </Reveal>
          <Reveal i={2} className="xl:flex-1 xl:[&>*]:h-full"><Stats now={now} status={status} /></Reveal>
        </div>
        <Reveal i={4} className="relative min-w-0 xl:col-span-5">
          <div className="xl:absolute xl:inset-0">
            <Agenda now={now} status={status} query={query} />
          </div>
        </Reveal>
      </div>

      <Reveal i={5} className="min-w-0"><Timeline now={now} status={status} /></Reveal>

      <PendenciasSheet open={sheet} onClose={() => setSheet(false)} now={now} />
    </div>
  )
}
