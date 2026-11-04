import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, ArrowUpRight } from '@phosphor-icons/react'
import { Card, CardHeader, Segmented, Button, KindDot, Reveal, cx } from '../../components/ui'
import { CHANNELS, KIND, fmt } from '../../data/mock'
import { useOps } from '../../store'
import { buildBookings, SHORT_CH } from './data'

const TONE = {
  ok: 'bg-ok-tint text-ok',
  now: 'bg-now-tint text-now',
  muted: 'bg-sunken text-ink-3',
  alert: 'bg-alert-tint text-alert',
}

function Chip({ tone, children }) {
  return (
    <span className={cx('inline-flex h-[24px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11.5px] font-semibold', TONE[tone])}>
      <span className="size-[5px] rounded-full bg-current" />
      {children}
    </span>
  )
}

function ChannelTag({ k }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink-2">
      <span className="size-2 rounded-full" style={{ background: CHANNELS[k].color }} />
      <span className="truncate">{CHANNELS[k].label}</span>
    </span>
  )
}

const COLS = 'md:grid-cols-[92px_minmax(0,1.5fr)_44px_minmax(0,1.3fr)_minmax(0,1.3fr)_60px_118px_20px]'

export default function BookingsTable() {
  const nav = useNavigate()
  const status = useOps((s) => s.status)
  const divergences = useOps((s) => s.divergences)
  const [q, setQ] = useState('')
  const [ch, setCh] = useState('all')
  const [limit, setLimit] = useState(8)

  const all = useMemo(() => buildBookings(status, divergences), [status, divergences])
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return all.filter((r) => (ch === 'all' || r.channel === ch) && (!t || r.code.toLowerCase().includes(t) || r.lead.toLowerCase().includes(t) || r.tour.short.toLowerCase().includes(t)))
  }, [all, q, ch])
  const shown = rows.slice(0, limit)
  const options = [{ value: 'all', label: 'Todos' }, ...Object.keys(CHANNELS).map((k) => ({ value: k, label: SHORT_CH[k] }))]

  return (
    <Reveal i={4}>
      <Card className="p-5 md:p-7">
        <CardHeader title="Reservas de hoje" sub={`${rows.length} de ${all.length} reservas`} />
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-10 items-center gap-2 rounded-full bg-sunken px-4 text-ink-3 focus-within:ring-2 focus-within:ring-now/30 lg:w-[300px]">
            <MagnifyingGlass size={16} />
            <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(8) }} placeholder="Buscar código ou nome" className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3" />
          </label>
          <div className="-mx-5 overflow-x-auto px-5 no-scrollbar lg:mx-0 lg:px-0">
            <Segmented options={options} value={ch} onChange={(v) => { setCh(v); setLimit(8) }} />
          </div>
        </div>

        <div className={cx('mt-5 hidden gap-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 md:grid', COLS)}>
          <span>Código</span><span>Passageiro</span><span>Pax</span><span>Canal</span><span>Roteiro</span><span>Saída</span><span>Situação</span><span />
        </div>

        <div className="mt-3 flex flex-col gap-1 md:mt-0">
          {shown.map((r) => (
            <div key={r.code} role="link" tabIndex={0} onClick={() => nav(`/voucher/${r.code}`)} onKeyDown={(e) => e.key === 'Enter' && nav(`/voucher/${r.code}`)}
              className={cx('group cursor-pointer rounded-[16px] transition-colors duration-150 hover:bg-frame', r.sit === 'alert' && 'bg-alert-tint/40')}>
              {/* desktop */}
              <div className={cx('hidden items-center gap-4 px-3 py-3 md:grid', COLS)}>
                <span className="font-mono text-[12.5px] font-medium text-ink tnum">{r.code}</span>
                <span className="truncate text-[14px] font-semibold text-ink">{r.lead}{r.pax > 1 && <span className="ml-1.5 font-mono text-[11.5px] font-medium text-ink-3">+{r.pax - 1}</span>}</span>
                <span className="font-mono text-[13px] text-ink-2 tnum">{r.pax}</span>
                <ChannelTag k={r.channel} />
                <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink-2"><KindDot kind={r.tour.kind} /><span className="truncate">{r.tour.short}</span></span>
                <span className="font-mono text-[13px] text-ink-2 tnum">{fmt(r.start)}</span>
                <span><Chip tone={r.tone}>{r.label}</Chip></span>
                <ArrowUpRight size={15} className="text-ink-4 transition-colors group-hover:text-ink" />
              </div>
              {/* mobile */}
              <div className="flex flex-col gap-2.5 rounded-[18px] bg-sunken/60 p-4 md:hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[12.5px] font-medium text-ink tnum">{r.code}</span>
                  <Chip tone={r.tone}>{r.label}</Chip>
                </div>
                <p className="text-[15px] font-semibold text-ink">{r.lead}{r.pax > 1 && <span className="ml-1.5 font-mono text-[12px] font-medium text-ink-3">+{r.pax - 1}</span>}</p>
                <div className="flex items-center justify-between gap-3 text-[12.5px] text-ink-2">
                  <span className="flex min-w-0 items-center gap-2"><KindDot kind={r.tour.kind} /><span className="truncate">{r.tour.short}</span></span>
                  <span className="font-mono tnum">{fmt(r.start)}</span>
                </div>
                <ChannelTag k={r.channel} />
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="py-10 text-center text-[13px] text-ink-3">Nenhuma reserva encontrada</p>}
        </div>

        {rows.length > limit && (
          <div className="mt-4 flex justify-center">
            <Button variant="light" onClick={() => setLimit((l) => l + 12)}>Mostrar mais · {rows.length - limit}</Button>
          </div>
        )}
      </Card>
    </Reveal>
  )
}
