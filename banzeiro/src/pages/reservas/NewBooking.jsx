import { useEffect, useMemo, useState } from 'react'
import { Plus, CaretDown } from '@phosphor-icons/react'
import { Sheet } from './Sheet'
import { Button, cx } from '../../components/ui'
import { LANGS } from '../../data/mock'
import { ROWS, DAYS, TODAY, tm, occOf } from './week-data'

const TOURS = ROWS.map((r) => r.tour).filter((t, i, a) => a.findIndex((x) => x.id === t.id) === i)
const LANG_LIST = ['PT', 'EN', 'ES', 'FR', 'DE', 'IT', 'JA']

function Chip({ active, disabled, children, ...rest }) {
  return (
    <button
      disabled={disabled}
      className={cx('inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-[background,color,transform] duration-150 active:scale-[0.97] disabled:opacity-40', active ? 'bg-negro text-white' : 'bg-sunken text-ink-2 hover:text-ink')}
      {...rest}
    >
      {children}
    </button>
  )
}

function Label({ children }) { return <p className="mb-2 text-[13px] font-medium text-ink-2">{children}</p> }
const input = 'h-11 w-full rounded-[14px] bg-sunken px-4 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-gold/60'

export default function NewBooking({ open, extra, onClose, onSave }) {
  const [tourId, setTourId] = useState('t1')
  const [day, setDay] = useState(3)
  const [rowId, setRowId] = useState('r1')
  const [names, setNames] = useState([''])
  const [lang, setLang] = useState('PT')
  const [contact, setContact] = useState('')

  useEffect(() => { if (open) { setTourId('t1'); setDay(3); setRowId('r1'); setNames(['']); setLang('PT'); setContact('') } }, [open])

  const rows = useMemo(() => ROWS.map((r, ri) => ({ r, ri })).filter((x) => x.r.tour.id === tourId), [tourId])
  const sel = rows.find((x) => x.r.id === rowId) ?? rows[0]
  const pax = Math.max(1, names.filter((n) => n.trim()).length)
  const canSave = names[0].trim().length > 0

  const pickTour = (id) => { setTourId(id); setRowId(ROWS.find((r) => r.tour.id === id).id) }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nova reserva"
      sub="Cadastro rápido"
      footer={<Button size="lg" disabled={!canSave} className="w-full" onClick={() => onSave({ ri: sel.ri, di: day, group: { name: names.find((n) => n.trim()).trim(), pax, lang, code: 'EA-51911' } })}>Salvar reserva</Button>}
    >
      <div className="flex flex-col gap-5 pt-1">
        <div>
          <Label>Passeio</Label>
          <div className="relative">
            <select value={tourId} onChange={(e) => pickTour(e.target.value)} className={cx(input, 'cursor-pointer appearance-none pr-10')}>
              {TOURS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <CaretDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-3" />
          </div>
        </div>

        <div>
          <Label>Data</Label>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => <Chip key={d.idx} active={day === d.idx} disabled={d.idx < TODAY} onClick={() => setDay(d.idx)}>{d.short} <span className="ml-1 tnum">{d.day}</span></Chip>)}
          </div>
        </div>

        <div>
          <Label>Saída</Label>
          <div className="flex flex-wrap gap-1.5">
            {rows.map(({ r, ri }) => {
              const free = occOf(ri, day, extra).free
              return (
                <Chip key={r.id} active={sel.r.id === r.id} disabled={free === 0} onClick={() => setRowId(r.id)}>
                  <span className="font-mono">{tm(r.start)}</span><span className="ml-2 text-[12px] opacity-70 tnum">{free} livres</span>
                </Chip>
              )
            })}
          </div>
        </div>

        <div>
          <Label>Passageiros</Label>
          <div className="flex flex-col gap-2">
            {names.map((n, i) => (
              <input key={i} value={n} onChange={(e) => setNames((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder={i === 0 ? 'Nome completo' : 'Nome do acompanhante'} className={input} />
            ))}
          </div>
          <button onClick={() => setNames((a) => [...a, ''])} className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-2 transition-colors hover:bg-sunken hover:text-ink">
            <Plus size={14} weight="bold" /> pessoa
          </button>
        </div>

        <div>
          <Label>Idioma</Label>
          <div className="flex flex-wrap gap-1.5">
            {LANG_LIST.map((l) => <Chip key={l} active={lang === l} title={LANGS[l].label} onClick={() => setLang(l)}>{l}</Chip>)}
          </div>
        </div>

        <div>
          <Label>Contato</Label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="WhatsApp ou e-mail" className={input} />
        </div>
      </div>
    </Sheet>
  )
}
