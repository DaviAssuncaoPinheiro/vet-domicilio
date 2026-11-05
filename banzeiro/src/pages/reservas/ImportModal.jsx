import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadSimple, Check, FileXls, WarningCircle } from '@phosphor-icons/react'
import { Modal } from './Sheet'
import { Button, cx, ease } from '../../components/ui'
import { ROWS, DAYS, tm, IMPORT_FILE, IMPORT_ROWS } from './week-data'

export default function ImportModal({ open, onClose, onApply }) {
  const [stage, setStage] = useState('drop') // drop | parsing
  const [shown, setShown] = useState(0)
  const [checked, setChecked] = useState(0)
  const [over, setOver] = useState(false)

  useEffect(() => { if (open) { setStage('drop'); setShown(0); setChecked(0) } }, [open])

  const start = () => {
    if (stage !== 'drop') return
    setStage('parsing')
    IMPORT_ROWS.forEach((_, i) => {
      setTimeout(() => setShown(i + 1), 300 + i * 60)
      setTimeout(() => setChecked(i + 1), 650 + i * 110)
    })
  }

  const valid = IMPORT_ROWS.filter((r) => !r.flag)
  const flagged = IMPORT_ROWS.find((r) => r.flag)
  const done = checked >= IMPORT_ROWS.length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importar planilha"
      sub={stage === 'parsing' ? undefined : 'Cada linha encontra a saída certa'}
      footer={stage === 'parsing' && (
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button size="lg" disabled={!done} onClick={() => onApply(valid)}>Adicionar {valid.length} reservas</Button>
        </div>
      )}
    >
      {stage === 'drop' ? (
        <div
          role="button" tabIndex={0}
          onClick={start} onKeyDown={(e) => e.key === 'Enter' && start()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); start() }}
          className={cx('grid cursor-pointer place-items-center gap-3 rounded-[22px] border-2 border-dashed px-6 py-14 text-center transition-colors duration-150', over ? 'border-gold bg-gold-tint' : 'border-line bg-sunken/50 hover:bg-sunken')}
        >
          <span className="grid size-12 place-items-center rounded-full bg-surface text-ink-2 shadow-pill"><UploadSimple size={22} /></span>
          <p className="text-[15px] font-semibold text-ink">Arraste a planilha da agência</p>
          <p className="text-[13px] text-ink-3">ou <span className="font-medium text-ink underline underline-offset-4">escolha o arquivo</span></p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-2 text-[13px] text-ink-2">
            <FileXls size={18} className="text-ok" /> <span className="truncate font-medium">{IMPORT_FILE}</span>
            <span className="ml-auto text-ink-3 tnum">{IMPORT_ROWS.length} linhas</span>
          </div>
          <div className="overflow-hidden rounded-[18px] bg-sunken/60">
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_48px_40px_24px] gap-2 px-4 py-2 text-[12px] text-ink-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_52px_52px_24px]">
              <span>Nome</span><span>Passeio</span><span>Data</span><span>Pessoas</span><span />
            </div>
            {IMPORT_ROWS.slice(0, shown).map((r, i) => (
              <motion.div
                key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease }}
                className={cx('grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_48px_40px_24px] items-center gap-2 border-t border-line/70 px-4 py-2 text-[12.5px] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_52px_52px_24px]', r.flag && 'bg-alert-tint')}
              >
                <span className="truncate font-medium text-ink">{r.name}</span>
                <span className="truncate text-ink-2">{ROWS[r.row].label} <span className="font-mono text-ink-3">{tm(ROWS[r.row].start)}</span></span>
                <span className="text-ink-2">{DAYS[r.day].short} <span className="tnum">{DAYS[r.day].day}</span></span>
                <span className="text-ink-2 tnum">{r.pax}</span>
                <span className="grid place-items-center">
                  {i < checked && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
                      {r.flag ? <WarningCircle size={17} weight="fill" className="text-alert" /> : <Check size={16} weight="bold" className="text-ok" />}
                    </motion.span>
                  )}
                </span>
              </motion.div>
            ))}
          </div>
          {done && flagged && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-2 rounded-[14px] bg-alert-tint px-4 py-2.5 text-[13px] font-medium text-alert">
              <WarningCircle size={16} weight="fill" /> {flagged.flag}
            </motion.p>
          )}
        </div>
      )}
    </Modal>
  )
}
