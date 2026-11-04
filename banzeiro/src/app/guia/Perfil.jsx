import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { Avatar, Card, Reveal } from '../../components/ui'
import { LANGS, SHIFTS, TOURS, DEPARTURES, initialStatus, fmt, vehicleOf } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen } from './parts'

export default function Perfil() {
  const { guide, pax, setReleased } = useGuia()
  const today = SHIFTS.filter((s) => s.guideId === guide.id && s.day === 2).sort((a, b) => a.start - b.start)

  const resetDemo = () => {
    const base = initialStatus()
    useOps.setState((s) => {
      const status = { ...s.status }
      pax.forEach((p) => { status[p.id] = base[p.id] })
      return { status }
    })
    setReleased(null)
  }

  return (
    <Screen>
      <Reveal i={0} className="px-5 pt-2">
        <h1 className="text-[24px] font-semibold tracking-[-0.025em]">Perfil</h1>
      </Reveal>

      <Reveal i={1} className="mt-5 px-4">
        <Card className="flex items-center gap-4 p-5">
          <Avatar initials={guide.initials} hue={guide.hue} size={60} />
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-semibold tracking-[-0.02em]">{guide.name}</h2>
            <p className="mt-0.5 text-[14px] text-ink-3">{guide.langs.map((l) => LANGS[l].label).join(' e ')}</p>
          </div>
        </Card>
      </Reveal>

      <Reveal i={2} className="mt-3 px-4">
        <Card className="p-5">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Hoje</h2>
          <ul className="mt-2">
            {today.map((s) => {
              const tour = TOURS.find((t) => t.id === s.tourId)
              const dep = DEPARTURES.find((d) => d.tourId === s.tourId && d.start === s.start && d.guideIds.includes(guide.id))
              return (
                <li key={s.id} className="flex items-center gap-4 py-2.5 [&+&]:border-t [&+&]:border-line">
                  <span className="w-12 shrink-0 font-mono text-[16px] font-medium">{fmt(s.start)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">{tour.short}</span>
                    {dep && <span className="block truncate text-[13px] text-ink-3">{vehicleOf(dep).name}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      </Reveal>

      <Reveal i={3} className="mt-4 flex justify-center px-4">
        <button onClick={resetDemo} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-ink-3 transition-colors hover:bg-sunken hover:text-ink-2">
          <ArrowCounterClockwise size={15} /> Reiniciar demonstração
        </button>
      </Reveal>
    </Screen>
  )
}
