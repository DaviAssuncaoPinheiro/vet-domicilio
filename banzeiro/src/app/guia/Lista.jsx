import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlass, X, Check, Clock, ArrowRight, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Reveal, cx, ease } from '../../components/ui'
import { LANGS, fmt } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen, Sheet, NetPill, FlatAvatar, paxHue, beepOk, haptic, unlockAudio } from './parts'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'boarded', label: 'Embarcados' },
]
const STATE_LABEL = { boarded: 'Embarcado', waiting: 'Aguardando', noshow: 'Faltou' }

function StatusIcon({ s }) {
  if (s === 'boarded') return <span className="grid size-6 place-items-center rounded-full bg-ok text-white"><Check size={13} weight="bold" /></span>
  if (s === 'noshow') return <span className="grid size-6 place-items-center rounded-full bg-alert-tint text-alert"><X size={12} weight="bold" /></span>
  return <span className="grid size-6 place-items-center rounded-full bg-surface text-ink-2"><Clock size={14} weight="bold" /></span>
}

function Info({ label, children }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-sunken px-4 py-3">
      <p className="text-[13px] text-ink-3">{label}</p>
      <p className="mt-0.5 truncate text-[16px] font-medium text-ink">{children}</p>
    </div>
  )
}

export default function Lista() {
  const { pax, stats, dep, vehicle, listFilter, setListFilter, query, setQuery, go } = useGuia()
  const status = useOps((s) => s.status)
  const [selId, setSelId] = useState(null)

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const nq = norm(query.trim())
  const size = (booking) => pax.filter((p) => p.booking === booking).length
  const nextUp = pax.find((p) => status[p.id]?.s === 'waiting')

  const rows = pax.filter((p) => {
    const s = status[p.id]?.s
    if (listFilter === 'boarded' && s !== 'boarded') return false
    if (listFilter === 'waiting' && s !== 'waiting') return false
    if (!nq) return true
    return norm(`${p.name} ${p.booking}`).includes(nq)
  })
  // agrupa por reserva, na ordem do manifesto
  const groups = []
  rows.forEach((p) => {
    const g = groups.find((x) => x.booking === p.booking)
    if (g) g.items.push(p)
    else groups.push({ booking: p.booking, items: [p] })
  })

  const fi = FILTERS.findIndex((f) => f.value === listFilter)
  const cycle = () => setListFilter(FILTERS[(fi + 1) % FILTERS.length].value)

  const sel = selId && pax.find((p) => p.id === selId)
  const selSt = sel && status[sel.id]
  const selGroup = sel ? pax.filter((p) => p.booking === sel.booking) : []
  const selLeft = selGroup.filter((p) => status[p.id]?.s === 'waiting')
  const act = (fn) => { unlockAudio(); fn(); setSelId(null) }

  return (
    <Screen>
      <Reveal i={0} className="flex items-center justify-between gap-3 px-5 pt-2">
        <h1 className="truncate text-[26px] font-semibold tracking-[-0.03em]">{vehicle.name}</h1>
        <div className="flex shrink-0 items-center gap-1 rounded-[16px] bg-surface p-1.5">
          <span className="inline-flex h-9 items-center rounded-[11px] bg-sunken px-3.5 text-[14px] font-medium">{FILTERS[fi].label}</span>
          <button aria-label="Trocar filtro" onClick={cycle} className="grid size-9 place-items-center rounded-[11px] text-ink transition-colors hover:bg-sunken">
            <ArrowRight size={17} weight="bold" />
          </button>
        </div>
      </Reveal>

      <Reveal i={1} className="mt-4 px-4">
        <label className="flex h-[52px] items-center gap-3 rounded-[18px] border border-line bg-surface px-4">
          <MagnifyingGlass size={20} className="shrink-0 text-ink-3" />
          <input
            autoFocus={!!query}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar passageiro"
            aria-label="Buscar passageiro"
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Limpar busca" className="-mr-2 grid size-10 place-items-center rounded-full text-ink-3">
              <X size={16} weight="bold" />
            </button>
          )}
        </label>
      </Reveal>

      <Reveal i={2} className="mt-3 px-4">
        <div className="rounded-[28px] bg-surface p-3 pt-4">
          <div className="flex items-baseline justify-between px-2 pb-3">
            <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Quarta 4</h2>
            <span className="text-[15px] text-ink-3 tnum"><span className="font-mono">{fmt(dep.start)}</span> · {stats.boarded} de {stats.total}</span>
          </div>
          <div className="empty:hidden [&:not(:empty)]:px-2 [&:not(:empty)]:pb-3"><NetPill /></div>

          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <div key={g.booking} className="flex flex-col gap-1.5">
                {g.items.map((p) => {
                  const s = status[p.id]?.s ?? 'waiting'
                  const hot = nextUp && p.id === nextUp.id
                  const n = size(p.booking)
                  return (
                    <motion.div
                      layout="position"
                      key={p.id}
                      transition={{ duration: 0.25, ease }}
                      onClick={() => setSelId(p.id)}
                      className={cx('relative flex cursor-pointer items-center gap-3.5 rounded-[20px] p-3.5 transition-colors', hot ? 'dots bg-gold-tint' : 'bg-sunken active:bg-line')}
                    >
                      <FlatAvatar name={p.name} hue={paxHue(p)} size={52} />
                      <div className="min-w-0 flex-1">
                        <p className={cx('truncate text-[17px] font-medium tracking-[-0.01em]', s === 'noshow' ? 'text-ink-3' : 'text-ink')}>{p.name}</p>
                        <p className="mt-0.5 truncate text-[14px] text-ink-3">Reserva <span className="font-mono">{p.booking}</span></p>
                        <p className="truncate text-[14px] text-ink-3 tnum">{n} {n === 1 ? 'pessoa' : 'pessoas'} · {LANGS[p.lang]?.label}{s === 'noshow' ? ' · Faltou' : ''}</p>
                      </div>
                      {hot ? (
                        <button
                          aria-label="Ler QR Code"
                          onClick={(e) => { e.stopPropagation(); go('scan') }}
                          className="grid size-[52px] shrink-0 place-items-center rounded-full bg-negro text-white transition-transform active:scale-95"
                        >
                          <ArrowRight size={20} weight="bold" className="-rotate-45" />
                        </button>
                      ) : (
                        <span className="self-start"><StatusIcon s={s} /></span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ))}
            {groups.length === 0 && (
              <p className="px-6 py-10 text-center text-[15px] text-ink-3">{listFilter === 'waiting' && !query ? 'Todos a bordo' : 'Ninguém encontrado'}</p>
            )}
          </div>
        </div>
      </Reveal>

      <Sheet open={!!sel} onClose={() => setSelId(null)} label="Passageiro">
        {sel && (
          <div>
            <div className="flex items-center gap-3.5">
              <FlatAvatar name={sel.name} hue={paxHue(sel)} size={52} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.02em]">{sel.name}</h3>
                <p className={cx('mt-0.5 text-[15px]', selSt?.s === 'boarded' ? 'text-ok' : selSt?.s === 'noshow' ? 'text-alert' : 'text-ink-3')}>
                  {STATE_LABEL[selSt?.s ?? 'waiting']}{selSt?.s === 'boarded' ? <> às <span className="font-mono">{fmt(selSt.at)}</span></> : null}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Info label="Reserva"><span className="font-mono">{sel.booking}</span></Info>
              <Info label="Grupo"><span className="tnum">{selGroup.length} {selGroup.length === 1 ? 'pessoa' : 'pessoas'}</span></Info>
              <Info label="Idioma">{LANGS[sel.lang]?.label}</Info>
              <Info label="Hotel">{sel.hotel}</Info>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {selSt?.s !== 'boarded' ? (
                <>
                  <button onClick={() => act(() => { useOps.getState().board(sel.id, 'manual'); beepOk(); haptic(15) })} className="flex h-[54px] items-center justify-center gap-2 rounded-full bg-negro text-[15px] font-semibold text-white active:scale-[0.98]">
                    <Check size={17} weight="bold" /> Embarcar
                  </button>
                  {selLeft.length > 1 && (
                    <button onClick={() => act(() => { const st = useOps.getState(); selLeft.forEach((p) => st.board(p.id, 'manual')); beepOk(); haptic(15) })} className="flex h-12 items-center justify-center rounded-full bg-gold-light text-[15px] font-semibold text-ink active:scale-[0.98]">
                      Embarcar o grupo todo
                    </button>
                  )}
                  {selSt?.s === 'noshow' ? (
                    <button onClick={() => act(() => useOps.getState().unboard(sel.id))} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunken text-[15px] font-medium text-ink-2 active:scale-[0.98]">
                      <ArrowCounterClockwise size={16} /> Desfazer
                    </button>
                  ) : (
                    <button onClick={() => act(() => useOps.getState().markNoShow(sel.id))} className="flex h-12 items-center justify-center rounded-full bg-sunken text-[15px] font-medium text-alert active:scale-[0.98]">
                      Faltou
                    </button>
                  )}
                </>
              ) : (
                <button onClick={() => act(() => useOps.getState().unboard(sel.id))} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunken text-[15px] font-medium text-ink-2 active:scale-[0.98]">
                  <ArrowCounterClockwise size={16} /> Desfazer
                </button>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </Screen>
  )
}
