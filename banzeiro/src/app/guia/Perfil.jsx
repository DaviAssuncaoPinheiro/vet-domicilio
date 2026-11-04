import { Star, CloudCheck, CloudSlash, ArrowCounterClockwise, Boat, Sun } from '@phosphor-icons/react'
import { Avatar, Card, LangTag, Progress, Reveal, StatusChip, cx } from '../../components/ui'
import { COMPANY, LANGS, SHIFTS, WEEK, TOURS, initialStatus, fmt } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen } from './parts'

export default function Perfil() {
  const { guide, pax, stats, lastSync, setReleased } = useGuia()
  const online = useOps((s) => s.online)
  const week = SHIFTS.filter((s) => s.guideId === guide.id).sort((a, b) => a.day - b.day || a.start - b.start)

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
      <Reveal i={0} className="px-5 pt-1">
        <p className="text-[12.5px] text-ink-3">{COMPANY.name}</p>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]">Perfil</h1>
      </Reveal>

      <Reveal i={1} className="mt-4 px-4">
        <div className="smoke grain relative overflow-hidden rounded-[28px] p-5 text-white shadow-dark">
          <div className="relative flex items-center gap-4">
            <span className="rounded-full ring-1 ring-white/15">
              <Avatar initials={guide.initials} hue="#3A342B" size={60} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[20px] font-semibold tracking-[-0.02em]">{guide.name}</h2>
              <p className="text-[12.5px] text-white/55">Guia de turismo · Cadastur ativo</p>
              <div className="mt-2 flex items-center gap-1.5">
                {guide.langs.map((l) => (
                  <span key={l} title={LANGS[l].label} className="inline-flex h-[22px] items-center rounded-md bg-white/10 px-1.5 font-mono text-[10.5px] font-semibold tracking-wide text-white/85">{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-[16px] bg-white/[0.06] px-3 py-3 ring-1 ring-inset ring-white/[0.06]">
              <p className="text-[11px] text-white/50">Avaliação</p>
              <p className="mt-1 flex items-center gap-1 font-mono text-[20px] font-medium tracking-[-0.03em] tnum">{guide.rating.toFixed(1).replace('.', ',')}<Star size={13} weight="fill" className="text-solimoes" /></p>
            </div>
            <div className="col-span-2 rounded-[16px] bg-white/[0.06] px-3 py-3 ring-1 ring-inset ring-white/[0.06]">
              <p className="flex justify-between text-[11px] text-white/50"><span>Horas na semana</span><span className="font-mono tnum">{guide.max - guide.hours}h livres</span></p>
              <p className="mt-1 font-mono text-[20px] font-medium tracking-[-0.03em] tnum">{guide.hours}<span className="text-white/35"> de {guide.max}h</span></p>
              <Progress value={guide.hours} max={guide.max} color="var(--color-lime)" track="rgba(255,255,255,.1)" height={3} className="mt-2" />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal i={2} className="mt-3 px-4">
        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Saídas da semana</h2>
            <span className="text-[12px] text-ink-3"><span className="font-mono tnum">{week.length}</span> escaladas</span>
          </div>
          <ul className="mt-3">
            {week.map((s) => {
              const day = WEEK[s.day]
              const tour = TOURS.find((t) => t.id === s.tourId)
              const past = s.day < 2
              return (
                <li key={s.id} className={cx('flex items-center gap-3 py-2.5 [&+&]:border-t [&+&]:border-line', past && 'opacity-55')}>
                  <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-center leading-none', day.today ? 'bg-now text-white' : 'bg-sunken text-ink-2')}>
                    <span>
                      <span className="block text-[10px] font-semibold">{day.short}</span>
                      <span className="mt-0.5 block font-mono text-[14px] font-medium tnum">{day.day}</span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{tour.short}</span>
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
                      {tour.id === 't4' ? <Sun size={13} /> : <Boat size={13} />}
                      <span className="font-mono tnum">{fmt(s.start)}</span> · {s.need.map((l) => <LangTag key={l} code={l} className="!h-[18px]" />)}
                    </span>
                  </span>
                  {day.today && <StatusChip tone="now" live>Hoje</StatusChip>}
                  {past && <span className="text-[11.5px] text-ink-3">Feita</span>}
                </li>
              )
            })}
          </ul>
        </Card>
      </Reveal>

      <Reveal i={3} className="mt-3 px-4">
        <Card className="flex items-center gap-3.5 p-4">
          <span className={cx('grid size-11 shrink-0 place-items-center rounded-full', online ? 'bg-ok-tint text-ok' : 'bg-land-tint text-[#8A5A12]')}>
            {online ? <CloudCheck size={20} /> : <CloudSlash size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold tracking-[-0.01em]">{online ? <>Sincronizado às <span className="font-mono tnum">{fmt(lastSync)}</span></> : 'Sem internet'}</span>
            <span className="block text-[12.5px] text-ink-3">
              {online ? 'Lista igual à da central' : <><span className="font-mono tnum">{stats.queued}</span> na fila · última às <span className="font-mono tnum">{fmt(lastSync)}</span></>}
            </span>
          </span>
        </Card>
      </Reveal>

      <Reveal i={4} className="mt-4 flex justify-center px-4">
        <button onClick={resetDemo} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-ink-3 transition-colors hover:bg-sunken hover:text-ink-2">
          <ArrowCounterClockwise size={15} /> Reiniciar demonstração
        </button>
      </Reveal>
    </Screen>
  )
}
