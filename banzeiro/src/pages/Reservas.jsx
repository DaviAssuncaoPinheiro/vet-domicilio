import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadSimple, Plus } from '@phosphor-icons/react'
import { Button, Reveal } from '../components/ui'
import { useOps } from '../store'
import Heatmap from './reservas/Heatmap'
import CellSheet from './reservas/CellSheet'
import ImportModal from './reservas/ImportModal'
import NewBooking from './reservas/NewBooking'
import { keyOf } from './reservas/week-data'

export default function Reservas() {
  const nav = useNavigate()
  const [extra, setExtra] = useState({})
  const [flash, setFlash] = useState(new Set())
  const [cell, setCell] = useState(null)
  const [importing, setImporting] = useState(false)
  const [creating, setCreating] = useState(false)

  const pulse = (keys) => {
    setFlash(new Set(keys))
    setTimeout(() => setFlash(new Set()), 1800)
  }

  const add = (items) => {
    setExtra((e) => {
      const n = { ...e }
      items.forEach(({ ri, di, group }) => { n[keyOf(ri, di)] = [...(n[keyOf(ri, di)] ?? []), group] })
      return n
    })
    pulse(items.map((x) => keyOf(x.ri, x.di)))
  }

  const applyImport = (rows) => {
    setImporting(false)
    // a animação de preenchimento começa depois que o modal fecha
    setTimeout(() => {
      add(rows.map((r, i) => ({ ri: r.row, di: r.day, group: { name: r.name, pax: r.pax, lang: r.lang, code: `EA-5192${i}` } })))
      useOps.getState().showToast(`${rows.length} reservas adicionadas`)
    }, 350)
  }

  const save = ({ ri, di, group }) => {
    setCreating(false)
    setTimeout(() => {
      add([{ ri, di, group }])
      useOps.getState().showToast('Reserva salva · voucher pronto', { label: 'Ver voucher', fn: () => nav('/voucher/EA-51877') })
    }, 350)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <Reveal>
        <div className="flex flex-col gap-4 px-1 pt-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink">Reservas</h1>
            <p className="mt-1 text-[14px] text-ink-3">2 a 8 de novembro</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="light" icon={UploadSimple} onClick={() => setImporting(true)}>Importar planilha</Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>Nova reserva</Button>
          </div>
        </div>
      </Reveal>

      <Heatmap extra={extra} flash={flash} onOpen={(ri, di) => setCell({ ri, di })} />

      <CellSheet cell={cell} extra={extra} onClose={() => setCell(null)} />
      <ImportModal open={importing} onClose={() => setImporting(false)} onApply={applyImport} />
      <NewBooking open={creating} extra={extra} onClose={() => setCreating(false)} onSave={save} />
    </div>
  )
}
