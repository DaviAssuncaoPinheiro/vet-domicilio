import { CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { Card, CardHeader, Button, Reveal, cx } from '../../components/ui'
import { useOps } from '../../store'
import { depById, tourOf, fmt } from '../../data/mock'

export function Divergences({ flash }) {
  const divergences = useOps((s) => s.divergences)
  const resolve = useOps((s) => s.resolveDivergence)
  const open = divergences.filter((d) => !d.resolved)
  return (
    <Card id="divergencias" className={cx('scroll-mt-24 p-5 transition-shadow duration-500 md:p-6', flash && 'ring-2 ring-alert/50')}>
      <CardHeader title="Divergências abertas" sub={open.length ? `${open.length} para conferir antes da saída` : 'Nenhuma pendente'} />
      <div className="mt-4 flex flex-col">
        {open.length === 0 && (
          <div className="flex items-center gap-2 rounded-[14px] bg-ok-tint px-4 py-3 text-[13px] font-medium text-ok"><CheckCircle size={18} weight="fill" /> Todas as listas conferem</div>
        )}
        {open.map((d) => {
          const dep = depById(d.depId)
          return (
            <div key={d.id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
              <span className={cx('size-2 shrink-0 rounded-full', d.severity === 'high' ? 'bg-alert' : d.severity === 'medium' ? 'bg-land' : 'bg-ink-4')} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{d.title}</p>
                <p className="truncate text-[12.5px] text-ink-3"><span className="font-mono tnum">{fmt(dep.start)}</span> · {tourOf(dep).short}</p>
              </div>
              <Button variant="light" size="sm" iconRight={ArrowRight} onClick={() => resolve(d.id)}>Resolver</Button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function BeforeAfter() {
  return (
    <Reveal i={3} className="h-full">
      <Card className="h-full p-5 md:p-6">
        <CardHeader title="Antes e depois" sub="Tempo de conferência por saída" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] bg-sunken p-4">
            <p className="text-[12px] leading-snug text-ink-3">Listas conferidas à mão</p>
            <p className="mt-5 font-mono text-[34px] font-medium leading-none tracking-[-0.03em] text-ink-2 tnum">40<span className="ml-1 text-[14px] text-ink-3">min</span></p>
            <div className="mt-4 h-1 rounded-full bg-ink-4/50"><div className="h-full w-full rounded-full bg-ink-4" /></div>
          </div>
          <div className="smoke grain relative overflow-hidden rounded-[18px] p-4 text-white">
            <p className="relative text-[12px] leading-snug text-white/60">Conferência automática</p>
            <p className="relative mt-5 font-mono text-[34px] font-medium leading-none tracking-[-0.03em] text-lime tnum">2<span className="ml-1 text-[14px] text-white/60">min</span></p>
            <div className="relative mt-4 h-1 rounded-full bg-white/15"><div className="h-full w-[5%] rounded-full bg-lime" /></div>
          </div>
        </div>
      </Card>
    </Reveal>
  )
}
