import { useState } from 'react'
import { Reveal } from '../components/ui'
import { useOps } from '../store'
import Timeline from './painel/Timeline'
import Stats from './painel/Stats'
import Agenda from './painel/Agenda'
import { TopButtons, HeroNumber, SearchBar, ActionCards, PendenciasSheet } from './painel/Hero'

export default function Painel() {
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)
  const openCount = useOps((s) => s.divergences.filter((d) => !d.resolved).length)
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-2 pt-2 md:px-0 md:pt-0">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 xl:col-span-7">
          <Reveal i={0} className="flex flex-col gap-5 md:px-2 md:pt-3">
            <TopButtons onBell={() => setSheet(true)} alert={openCount > 0} />
            <HeroNumber now={now} status={status} />
          </Reveal>
          <Reveal i={1}><SearchBar query={query} setQuery={setQuery} /></Reveal>
          <Reveal i={2}><ActionCards now={now} status={status} onPendencias={() => setSheet(true)} /></Reveal>
          <Reveal i={3}><Stats now={now} status={status} /></Reveal>
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
