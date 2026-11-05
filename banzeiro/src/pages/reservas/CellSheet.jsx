import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Sheet } from './Sheet'
import { Button, LangTag, Progress } from '../../components/ui'
import { ROWS, DAYS, TODAY, tm, baseGroups, occOf, keyOf } from './week-data'

const DAYNAME = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function CellSheet({ cell, extra, onClose }) {
  const row = cell && ROWS[cell.ri]
  const o = cell && occOf(cell.ri, cell.di, extra)
  const groups = cell ? [...baseGroups(cell.ri, cell.di), ...(extra[keyOf(cell.ri, cell.di)] ?? [])] : []
  return (
    <Sheet
      open={!!cell}
      onClose={onClose}
      title={cell ? row.tour.name : ''}
      sub={cell ? `${DAYNAME[cell.di]} ${DAYS[cell.di].day} · ${tm(row.start)} · ${row.veh.name}` : ''}
      footer={cell && cell.di === TODAY ? (
        <Link to={`/embarque/${row.depId}`}><Button size="lg" iconRight={ArrowRight} className="w-full">Ver embarque</Button></Link>
      ) : null}
    >
      {cell && (
        <>
          <div className="mb-4 rounded-[18px] bg-sunken p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-ink-2"><span className="text-[22px] font-semibold text-ink tnum">{o.booked}</span> de <span className="tnum">{o.cap}</span> lugares</span>
              <span className="text-[12.5px] text-ink-3">{o.over > 0 ? `${o.over} sem lugar` : o.free === 0 ? 'Lotado' : `${o.free} livres`}</span>
            </div>
            <Progress className="mt-3" value={Math.min(o.booked, o.cap)} max={o.cap} color="var(--color-gold)" track="var(--color-surface)" height={6} />
          </div>
          <ul className="flex flex-col">
            {groups.map((g, i) => (
              <li key={`${g.code}-${i}`} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-[12px] font-semibold text-ink-2 tnum">{g.pax}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-ink">{g.name}{g.pax > 1 && <span className="ml-1.5 text-ink-3">+{g.pax - 1}</span>}</p>
                  <p className="font-mono text-[11.5px] text-ink-3">{g.code ?? 'Novo'}</p>
                </div>
                <LangTag code={g.lang} />
              </li>
            ))}
            {groups.length === 0 && <li className="py-10 text-center text-[13px] text-ink-3">Nenhuma reserva ainda</li>}
          </ul>
        </>
      )}
    </Sheet>
  )
}
