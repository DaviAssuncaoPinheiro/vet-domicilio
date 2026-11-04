import { useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { Button, Reveal } from '../components/ui'
import { useOps } from '../store'
import { fmt } from '../data/mock'
import ChannelStrip from './reservas/ChannelStrip'
import FlowSankey from './reservas/FlowSankey'
import BookingsTable from './reservas/BookingsTable'
import { Divergences, BeforeAfter } from './reservas/Side'

export default function Reservas() {
  const now = useOps((s) => s.now)
  const showToast = useOps((s) => s.showToast)
  const [flash, setFlash] = useState(false)

  const goDivergences = () => {
    document.getElementById('divergencias')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlash(true)
    setTimeout(() => setFlash(false), 1800)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <Reveal>
        <div className="flex flex-col gap-4 px-1 pt-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink">Reservas</h1>
            <p className="mt-1 text-[14px] text-ink-3">Importadas automaticamente de 5 canais</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-10 items-center gap-2.5 rounded-full bg-surface px-4 text-[13px] text-ink-2 shadow-pill">
              <span className="live-dot text-ok" />
              Última sincronização <span className="font-mono font-medium text-ink tnum">{fmt(now - 1)}</span>
            </span>
            <Button variant="light" icon={UploadSimple} onClick={() => showToast('Planilha conferida · nenhuma duplicata')}>Importar planilha</Button>
          </div>
        </div>
      </Reveal>

      <ChannelStrip />
      <FlowSankey onAlert={goDivergences} />

      <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Reveal i={3}><Divergences flash={flash} /></Reveal>
        <BeforeAfter />
      </div>

      <BookingsTable />
    </div>
  )
}
