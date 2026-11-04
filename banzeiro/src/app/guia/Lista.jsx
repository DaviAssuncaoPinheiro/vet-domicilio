import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, X, Check, QrCode, HandTap, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Avatar, Card, StatusChip, LangTag, CountryCode, Reveal, cx, ease } from '../../components/ui'
import { CHANNELS, COUNTRY_NAME, LANGS, fmt } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen, Sheet, Seg, NetPill, paxHue, initialsOf, beepOk, haptic, unlockAudio } from './parts'

function chipFor(st) {
  if (st?.s === 'boarded') {
    if (st.synced === false) return <StatusChip tone="land">Na fila</StatusChip>
    return <StatusChip tone="ok">A bordo</StatusChip>
  }
  if (st?.s === 'noshow') return <StatusChip tone="alert">Ausente</StatusChip>
  return <StatusChip tone="muted">Aguardando</StatusChip>
}

function Info({ label, children }) {
  return (
    <div className="min-w-0 rounded-[14px] bg-sunken px-3.5 py-3">
      <p className="text-[11px] font-medium text-ink-3">{label}</p>
      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[14px] font-medium text-ink">{children}</div>
    </div>
  )
}

export default function Lista() {
  const { pax, stats, dep, vehicle, tour, listFilter, setListFilter } = useGuia()
  const status = useOps((s) => s.status)
  const online = useOps((s) => s.online)
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState(null)

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const nq = norm(q.trim())
  const rows = pax.filter((p) => {
    const s = status[p.id]?.s
    if (listFilter === 'boarded' && s !== 'boarded') return false
    if (listFilter === 'waiting' && s !== 'waiting') return false
    if (!nq) return true
    return norm(`${p.name} ${p.booking} ${p.seat} ${p.lang} ${p.country}`).includes(nq)
  })

  const sel = selId && pax.find((p) => p.id === selId)
  const selSt = sel && status[sel.id]

  const act = (fn) => { unlockAudio(); fn(); setSelId(null) }

  return (
    <Screen>
      <Reveal i={0} className="px-5 pt-1">
        <p className="truncate text-[12.5px] text-ink-3">{vehicle.name} · <span className="font-mono tnum">{fmt(dep.start)}</span> · <span className="font-mono">{dep.code}</span></p>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em]">Lista de embarque</h1>
        <div className="empty:hidden [&:not(:empty)]:mt-2.5"><NetPill /></div>
      </Reveal>

      <Reveal i={1} className="mt-4 px-4">
        <Card className="grid grid-cols-3 divide-x divide-line py-3.5">
          {[
            ['A bordo', stats.boarded, 'text-ok'],
            ['Faltam', stats.waiting, 'text-ink'],
            ['Ausentes', stats.noshow, stats.noshow ? 'text-alert' : 'text-ink-4'],
          ].map(([l, v, c]) => (
            <div key={l} className="px-4">
              <p className="text-[11.5px] text-ink-3">{l}</p>
              <p className={cx('mt-0.5 font-mono text-[24px] font-medium leading-none tracking-[-0.04em] tnum', c)}>{String(v).padStart(2, '0')}</p>
            </div>
          ))}
        </Card>
      </Reveal>

      <Reveal i={2} className="mt-3 px-4">
        <label className="flex h-12 items-center gap-2.5 rounded-full bg-surface pl-4 pr-1.5 shadow-pill">
          <MagnifyingGlass size={18} className="shrink-0 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome, reserva ou assento"
            aria-label="Buscar passageiro"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Limpar busca" className="grid size-9 place-items-center rounded-full bg-sunken text-ink-2">
              <X size={14} weight="bold" />
            </button>
          )}
        </label>
        <Seg
          className="mt-3"
          value={listFilter}
          onChange={setListFilter}
          options={[
            { value: 'all', label: 'Todos', count: stats.total },
            { value: 'boarded', label: 'A bordo', count: stats.boarded },
            { value: 'waiting', label: 'Faltam', count: stats.waiting },
          ]}
        />
      </Reveal>

      <Reveal i={3} className="mt-3 px-4">
        <Card className="overflow-hidden">
          <AnimatePresence initial={false}>
            {rows.map((p) => {
              const st = status[p.id]
              const boarded = st?.s === 'boarded'
              return (
                <motion.button
                  layout="position"
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                  onClick={() => setSelId(p.id)}
                  className="group relative flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-sunken [&+&]:before:absolute [&+&]:before:left-[66px] [&+&]:before:right-4 [&+&]:before:top-0 [&+&]:before:h-px [&+&]:before:bg-line"
                >
                  <span className="relative">
                    <Avatar initials={initialsOf(p.name)} hue={paxHue(p)} size={40} />
                    {boarded && (
                      <span className={cx('absolute -bottom-0.5 -right-0.5 grid size-[17px] place-items-center rounded-full ring-2 ring-surface', st.synced === false ? 'bg-land' : 'bg-ok')}>
                        <Check size={10} weight="bold" className="text-white" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx('block truncate text-[14.5px] font-medium tracking-[-0.005em]', st?.s === 'noshow' ? 'text-ink-3 line-through decoration-ink-4' : 'text-ink')}>{p.name}</span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <CountryCode code={p.country} />
                      <LangTag code={p.lang} />
                      <span className="truncate font-mono text-[11px] text-ink-3">{p.booking}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-mono text-[13px] font-medium text-ink tnum">{p.seat}</span>
                    {chipFor(st)}
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
          {rows.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-[14px] font-medium text-ink">{listFilter === 'waiting' && !q ? 'Todos a bordo' : 'Nenhum passageiro'}</p>
              <p className="mt-1 text-[12.5px] text-ink-3">{listFilter === 'waiting' && !q ? 'Ninguém aguardando nesta saída.' : 'Tente outro nome ou código.'}</p>
            </div>
          )}
        </Card>
        <p className="mt-3 px-1 text-center text-[11.5px] text-ink-3">Lista única com a central · {tour.short}</p>
      </Reveal>

      <Sheet open={!!sel} onClose={() => setSelId(null)} label="Passageiro">
        {sel && (
          <div>
            <div className="flex items-center gap-3.5">
              <Avatar initials={initialsOf(sel.name)} hue={paxHue(sel)} size={54} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.02em]">{sel.name}</h3>
                <p className="mt-0.5 truncate text-[12.5px] text-ink-3"><span className="font-mono">{sel.booking}</span> · {CHANNELS[sel.channel].label}</p>
              </div>
              {chipFor(selSt)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Info label="Assento"><span className="font-mono text-[18px] tracking-[-0.02em] tnum">{sel.seat}</span></Info>
              <Info label="Idioma"><LangTag code={sel.lang} /> <span className="truncate">{LANGS[sel.lang]?.label}</span></Info>
              <Info label="País"><CountryCode code={sel.country} /> <span className="truncate">{COUNTRY_NAME[sel.country]}</span></Info>
              <Info label="Hotel"><span className="truncate">{sel.hotel}</span></Info>
            </div>
            {selSt?.s === 'boarded' && (
              <p className="mt-3 flex items-center gap-2 rounded-[14px] bg-ok-tint px-3.5 py-3 text-[13px] text-ok">
                {selSt.via === 'manual' ? <HandTap size={16} /> : <QrCode size={16} />}
                Embarcou às <span className="font-mono font-medium tnum">{fmt(selSt.at)}</span> · {selSt.via === 'manual' ? 'manual' : 'QR Code'}{selSt.synced === false ? ' · na fila' : ''}
              </p>
            )}
            {sel.child && <p className="mt-2 text-[12.5px] text-ink-3">Criança · colete infantil</p>}
            <div className="mt-4 flex flex-col gap-2">
              {selSt?.s !== 'boarded' ? (
                <>
                  <button onClick={() => act(() => { useOps.getState().board(sel.id, 'manual'); beepOk(); haptic(15) })} className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-negro text-[14.5px] font-semibold text-white shadow-dark active:scale-[0.98]">
                    <Check size={17} weight="bold" /> Embarcar manualmente
                  </button>
                  {selSt?.s === 'noshow' ? (
                    <button onClick={() => act(() => useOps.getState().unboard(sel.id))} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunken text-[14px] font-medium text-ink-2 active:scale-[0.98]">
                      <ArrowCounterClockwise size={16} /> Desfazer ausência
                    </button>
                  ) : (
                    <button onClick={() => act(() => useOps.getState().markNoShow(sel.id))} className="flex h-12 items-center justify-center rounded-full bg-alert-tint text-[14px] font-medium text-[#B4462C] active:scale-[0.98]">
                      Marcar ausência
                    </button>
                  )}
                </>
              ) : (
                <button onClick={() => act(() => useOps.getState().unboard(sel.id))} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunken text-[14px] font-medium text-ink-2 active:scale-[0.98]">
                  <ArrowCounterClockwise size={16} /> Desfazer embarque
                </button>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </Screen>
  )
}
