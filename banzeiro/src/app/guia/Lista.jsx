import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, X, Check, ArrowCounterClockwise, CaretRight } from '@phosphor-icons/react'
import { Avatar, Card, Reveal, cx, ease } from '../../components/ui'
import { LANGS, fmt } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, Screen, Sheet, Seg, NetPill, paxHue, initialsOf, beepOk, haptic, unlockAudio } from './parts'

const STATE = {
  boarded: { label: 'Embarcado', cls: 'text-ok', dot: 'bg-ok' },
  waiting: { label: 'Aguardando', cls: 'text-ink-3', dot: 'bg-ink-4' },
  noshow: { label: 'Faltou', cls: 'text-alert', dot: 'bg-alert' },
}

function StateText({ st, className }) {
  const k = STATE[st?.s] ?? STATE.waiting
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium', k.cls, className)}>
      <span className={cx('size-[6px] rounded-full', k.dot)} />
      {k.label}
    </span>
  )
}

function Info({ label, children }) {
  return (
    <div className="min-w-0 rounded-[14px] bg-sunken px-3.5 py-3">
      <p className="text-[12px] text-ink-3">{label}</p>
      <p className="mt-0.5 truncate text-[16px] font-medium text-ink">{children}</p>
    </div>
  )
}

export default function Lista() {
  const { pax, stats, dep, vehicle, listFilter, setListFilter } = useGuia()
  const status = useOps((s) => s.status)
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState(null)

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const nq = norm(q.trim())
  const rows = pax.filter((p) => {
    const s = status[p.id]?.s
    if (listFilter === 'boarded' && s !== 'boarded') return false
    if (listFilter === 'waiting' && s !== 'waiting') return false
    if (!nq) return true
    return norm(`${p.name} ${p.booking}`).includes(nq)
  })

  const sel = selId && pax.find((p) => p.id === selId)
  const selSt = sel && status[sel.id]
  const selGroup = sel ? pax.filter((p) => p.booking === sel.booking) : []
  const selLeft = selGroup.filter((p) => status[p.id]?.s === 'waiting')
  const act = (fn) => { unlockAudio(); fn(); setSelId(null) }

  return (
    <Screen>
      <Reveal i={0} className="px-5 pt-2">
        <p className="truncate text-[13px] text-ink-3">{vehicle.name} · <span className="font-mono">{fmt(dep.start)}</span></p>
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.025em]">Passageiros</h1>
        <div className="empty:hidden [&:not(:empty)]:mt-2.5"><NetPill /></div>
      </Reveal>

      <Reveal i={1} className="mt-4 px-4">
        <label className="flex h-12 items-center gap-2.5 rounded-full bg-surface pl-4 pr-1.5 shadow-pill">
          <MagnifyingGlass size={18} className="shrink-0 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar"
            aria-label="Buscar passageiro"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
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
            { value: 'waiting', label: 'Aguardando', count: stats.waiting },
          ]}
        />
      </Reveal>

      <Reveal i={2} className="mt-3 px-4">
        <Card className="overflow-hidden">
          <AnimatePresence initial={false}>
            {rows.map((p) => {
              const st = status[p.id]
              return (
                <motion.button
                  layout="position"
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                  onClick={() => setSelId(p.id)}
                  className="relative flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-sunken [&+&]:before:absolute [&+&]:before:left-[68px] [&+&]:before:right-4 [&+&]:before:top-0 [&+&]:before:h-px [&+&]:before:bg-line"
                >
                  <Avatar initials={initialsOf(p.name)} hue={paxHue(p)} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className={cx('block truncate text-[15px] font-medium', st?.s === 'noshow' ? 'text-ink-3' : 'text-ink')}>{p.name}</span>
                    <StateText st={st} className="mt-0.5" />
                  </span>
                  <span className="shrink-0 font-mono text-[12.5px] text-ink-3">{p.booking}</span>
                  <CaretRight size={15} className="-mr-1 shrink-0 text-ink-4" />
                </motion.button>
              )
            })}
          </AnimatePresence>
          {rows.length === 0 && (
            <p className="px-6 py-10 text-center text-[14px] text-ink-3">{listFilter === 'waiting' && !q ? 'Todos a bordo' : 'Ninguém encontrado'}</p>
          )}
        </Card>
      </Reveal>

      <Sheet open={!!sel} onClose={() => setSelId(null)} label="Passageiro">
        {sel && (
          <div>
            <div className="flex items-center gap-3.5">
              <Avatar initials={initialsOf(sel.name)} hue={paxHue(sel)} size={52} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.02em]">{sel.name}</h3>
                <StateText st={selSt} className="mt-1" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Info label="Reserva"><span className="font-mono">{sel.booking}</span></Info>
              <Info label="Grupo"><span className="tnum">{selGroup.length} {selGroup.length === 1 ? 'pessoa' : 'pessoas'}</span></Info>
              <Info label="Idioma">{LANGS[sel.lang]?.label}</Info>
              <Info label="Hotel">{sel.hotel}</Info>
            </div>
            {selSt?.s === 'boarded' && (
              <p className="mt-3 text-[14px] text-ink-2">Embarcou às <span className="font-mono">{fmt(selSt.at)}</span></p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {selSt?.s !== 'boarded' ? (
                <>
                  <button onClick={() => act(() => { useOps.getState().board(sel.id, 'manual'); beepOk(); haptic(15) })} className="flex h-[54px] items-center justify-center gap-2 rounded-full bg-negro text-[15px] font-semibold text-white shadow-dark active:scale-[0.98]">
                    <Check size={17} weight="bold" /> Embarcar
                  </button>
                  {selLeft.length > 1 && (
                    <button onClick={() => act(() => { const st = useOps.getState(); selLeft.forEach((p) => st.board(p.id, 'manual')); beepOk(); haptic(15) })} className="flex h-12 items-center justify-center rounded-full bg-gold-tint text-[14px] font-semibold text-gold-deep active:scale-[0.98]">
                      Embarcar o grupo todo
                    </button>
                  )}
                  {selSt?.s === 'noshow' ? (
                    <button onClick={() => act(() => useOps.getState().unboard(sel.id))} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunken text-[14px] font-medium text-ink-2 active:scale-[0.98]">
                      <ArrowCounterClockwise size={16} /> Desfazer
                    </button>
                  ) : (
                    <button onClick={() => act(() => useOps.getState().markNoShow(sel.id))} className="flex h-12 items-center justify-center rounded-full bg-alert-tint text-[14px] font-medium text-alert active:scale-[0.98]">
                      Faltou
                    </button>
                  )}
                </>
              ) : (
                <button onClick={() => act(() => useOps.getState().unboard(sel.id))} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunken text-[14px] font-medium text-ink-2 active:scale-[0.98]">
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
