import { ArrowRight, Check, Clock } from '@phosphor-icons/react'
import { Reveal, cx } from '../../components/ui'
import { DEPARTURES, fmt, tourOf, vehicleOf, guideById } from '../../data/mock'
import { useGuia, Screen, FlatAvatar } from './parts'

export default function Saidas() {
  const { dep, now, go, stats } = useGuia()
  const list = DEPARTURES.filter((d) => tourOf(d).kind === 'boat').sort((a, b) => a.start - b.start)

  return (
    <Screen>
      <Reveal i={0} className="px-5 pt-2">
        <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Saídas de hoje</h1>
        <p className="mt-0.5 text-[15px] text-ink-3">Lanchas · Quarta 4</p>
      </Reveal>

      <Reveal i={1} className="mt-4 px-4">
        <div className="rounded-[28px] bg-surface p-3 pt-2">
          {list.map((d, i) => {
            const mine = d.id === dep.id
            const gone = now >= d.start && !mine
            const guide = guideById(d.guideIds[0])
            return (
              <div key={d.id} className={cx('flex gap-3 py-2', i > 0 && 'border-t border-line')}>
                <span className="w-12 shrink-0 pl-1 pt-3 font-mono text-[16px] font-semibold">{fmt(d.start)}</span>
                <div
                  onClick={mine ? () => go('scan') : undefined}
                  className={cx('flex min-w-0 flex-1 items-center gap-3 rounded-[20px] p-3.5', mine ? 'dots cursor-pointer bg-gold-tint' : 'bg-sunken')}
                >
                  <FlatAvatar name={guide?.name ?? 'Sem guia'} hue={guide?.hue ?? 'var(--color-ink-4)'} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-medium tracking-[-0.01em]">{vehicleOf(d).name}</p>
                    <p className="truncate text-[14px] text-ink-3">{tourOf(d).short}</p>
                    <p className="truncate text-[14px] text-ink-3 tnum">{mine ? `${stats.boarded} de ${stats.total} a bordo` : `${d.booked} pessoas`}</p>
                  </div>
                  {mine ? (
                    <button aria-label="Conferir embarque" onClick={(e) => { e.stopPropagation(); go('scan') }} className="grid size-[52px] shrink-0 place-items-center rounded-full bg-negro text-white active:scale-95">
                      <ArrowRight size={20} weight="bold" className="-rotate-45" />
                    </button>
                  ) : gone ? (
                    <span className="grid size-6 shrink-0 self-start place-items-center rounded-full bg-ok text-white"><Check size={13} weight="bold" /></span>
                  ) : (
                    <span className="grid size-6 shrink-0 self-start place-items-center rounded-full bg-surface text-ink-2"><Clock size={14} weight="bold" /></span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Reveal>
    </Screen>
  )
}
