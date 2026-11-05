import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, Checks, WarningCircle, PaperPlaneTilt, FileXls, Tray, Warning } from '@phosphor-icons/react'
import { Card, CardHeader, Segmented, Button, IconButton, CountryCode, Reveal, useMedia, cx, ease } from '../../components/ui'
import { CHANNELS, fmt } from '../../data/mock'
import { useOps } from '../../store'
import { ICONS } from './ChannelStrip'
import { INBOX, CONFIRMED_BASE } from './inbox-data'

const FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'new', label: 'Novas' },
  { value: 'pending', label: 'Pendentes' },
]

const preview = (it) => it.segs.map((s) => s.t).join('').slice(0, 90)
const isPending = (it, st) => (it.missing && !st.asked[it.id]) || (it.dup && !st.merged[it.id])

function LineTag({ n, active }) {
  return <span className={cx('shrink-0 rounded-full px-1.5 text-[10.5px] font-medium leading-[16px]', active ? 'bg-negro/10 text-negro' : 'bg-sunken text-ink-3')}>WhatsApp {n}</span>
}

function ChannelGlyph({ k, size = 40, active }) {
  const Icon = ICONS[k]
  return (
    <span className={cx('relative grid shrink-0 place-items-center rounded-full', active ? 'bg-white/45 text-negro' : 'bg-sunken text-ink-2')} style={{ width: size, height: size }}>
      <Icon size={size * 0.45} />
      <span className={cx('absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2', active ? 'ring-gold' : 'ring-surface')} style={{ background: CHANNELS[k].color }} />
    </span>
  )
}

/* ---------- Lista ---------- */
const ListRow = forwardRef(function ListRow({ it, active, read, onOpen }, ref) {
  const unread = it.unread && !read
  return (
    <motion.li ref={ref} layout="position" exit={{ opacity: 0, x: -28, scale: 0.97 }} transition={{ duration: 0.3, ease }}>
      <button
        onClick={onOpen}
        className={cx('flex w-full items-start gap-3 rounded-[18px] p-3 text-left transition-colors duration-150', active ? 'bg-gold text-negro' : 'hover:bg-frame')}
      >
        <ChannelGlyph k={it.channel} active={active} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cx('truncate text-[13.5px]', active ? 'text-negro' : 'text-ink', unread ? 'font-semibold' : 'font-medium')}>{it.sender}</span>
            {it.line && <LineTag n={it.line} active={active} />}
            <span className={cx('ml-auto shrink-0 font-mono text-[11.5px] tnum', active ? 'text-negro/70' : 'text-ink-3')}>{fmt(it.time)}</span>
          </span>
          <span className="mt-0.5 flex items-center gap-2">
            <span className={cx('line-clamp-1 flex-1 text-[12.5px]', active ? 'text-negro/70' : 'text-ink-3')}>{preview(it)}</span>
            {unread && <span className={cx('size-2 shrink-0 rounded-full', active ? 'bg-negro' : 'bg-gold')} aria-label="Não lida" />}
          </span>
        </span>
      </button>
    </motion.li>
  )
})

/* ---------- Mensagem original ---------- */
function Seg({ s, fields, shown, hot }) {
  if (!s.f) return <>{s.t}</>
  const idx = fields.findIndex((f) => f.key === s.f)
  const on = idx >= 0 && idx < shown
  const isHot = hot && (hot.key === s.f || hot.spans?.includes(s.f))
  return (
    <span
      data-f={s.f}
      className={cx('rounded-[6px] px-[3px] py-[1px] transition-[background,box-shadow] duration-150', on && 'bg-gold-tint', isHot && on && '!bg-gold-light/70 ring-1 ring-gold')}
    >
      {s.t}
    </span>
  )
}

function Message({ it, fields, shown, hot, setHot, replySent }) {
  const rows = it.sheet?.rows
  const paxHot = hot && (hot.key === 'pax' || hot.spans?.includes('pax'))
  return (
    <div className="flex flex-col gap-3 self-start rounded-[22px] bg-sunken p-4" onPointerLeave={() => setHot(null)}>
            <div className="max-w-[92%] self-start">
        <div className="rounded-[20px] rounded-tl-[6px] bg-surface px-4 py-3 text-[14px] leading-[1.6] text-ink shadow-pill">
          {it.subject && <p className="mb-1.5 text-[12px] font-semibold text-ink-3">{it.subject}</p>}
          <span
            onPointerOver={(e) => {
              const f = e.target.closest?.('[data-f]')?.dataset.f
              if (f) setHot(fields.find((x) => x.key === f) ?? null)
            }}
          >
            {it.segs.map((s, i) => <Seg key={i} {...{ s, fields, shown, hot }} />)}
          </span>
          <p className="mt-1.5 text-right font-mono text-[10.5px] text-ink-3 tnum">{fmt(it.time)}</p>
        </div>
      </div>
      {it.sheet && (
        <div className="max-w-[92%] self-start overflow-hidden rounded-[18px] bg-surface shadow-pill">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[12.5px] font-medium text-ink-2">
            <FileXls size={17} className="text-ok" /> <span className="truncate">{it.sheet.file}</span>
            <span className="ml-auto text-[11.5px] text-ink-3 tnum">{rows.length} nomes</span>
          </div>
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="text-[11.5px] text-ink-3">{it.sheet.cols.map((c) => <th key={c} className="px-4 py-1.5 font-semibold">{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={cx('transition-colors duration-150', paxHot && shown > 3 ? 'bg-gold-tint' : 'odd:bg-frame/60')}>
                  <td className="px-4 py-1.5 font-medium text-ink">{r[0]}</td>
                  <td className="px-4 py-1.5"><CountryCode code={r[1]} /></td>
                  <td className="px-4 py-1.5 font-mono text-[11.5px] text-ink-2">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AnimatePresence>
        {replySent && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease }} className="max-w-[88%] self-end">
            <div className="rounded-[20px] rounded-tr-[6px] bg-negro px-4 py-3 text-[14px] leading-[1.55] text-white shadow-dark">
              {it.missing.reply}
              <p className="mt-1.5 flex items-center justify-end gap-1 font-mono text-[10.5px] text-white/55"><Checks size={13} className="text-lime" /> Enviado agora</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Cartão da reserva ---------- */
const ORDER = ['tour', 'date', 'lang', 'dep', 'pax', 'hotel', 'contact']

function Field({ f, i, n, hot, setHot, shown, replySent }) {
  const on = i < shown
  const isHot = hot?.key === f.key
  const empty = f.value == null
  const waiting = empty && replySent
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease, delay: n * 0.06 }}
      onPointerEnter={() => setHot(f)}
      className={cx('rounded-[14px] px-3 py-2.5 transition-colors duration-150', isHot ? 'bg-gold-tint' : on ? 'bg-sunken/70' : 'bg-sunken/40')}
    >
      <p className="text-[12px] text-ink-3">{f.label}</p>
      {empty ? (
        <p className={cx('mt-0.5 text-[13.5px]', waiting ? 'text-ink-2' : 'text-ink-3')}>{waiting ? 'Pedido enviado' : 'Pendente'}</p>
      ) : f.names ? (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {f.names.map((n) => (
            <span key={n.n} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface pl-2 pr-2.5 text-[12.5px] font-medium shadow-pill">
              <CountryCode code={n.c} className="!h-[16px]" /> {n.n}
            </span>
          ))}
          {f.more > 0 && <span className="font-mono text-[12px] text-ink-3">+{f.more}</span>}
        </div>
      ) : (
        <p className={cx('mt-0.5 text-[14px] font-medium text-ink', f.key === 'dep' && 'font-mono tnum')}>
          {f.value}
          {f.sub && <span className="ml-2 font-sans text-[12.5px] font-normal text-ink-3">{f.sub}</span>}
        </p>
      )}
      {f.seats && !empty && <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ok"><span className="size-1.5 rounded-full bg-ok" /> {f.seats}</p>}
    </motion.div>
  )
}

function BookingCard({ it, fields, shown, hot, setHot, asked, merged, onAsk, onMerge, onConfirm }) {
  const missingOpen = it.missing && !asked
  const dupOpen = it.dup && !merged
  const canConfirm = !missingOpen
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] font-semibold text-ink">Reserva</p>
        <span className="font-mono text-[12px] text-ink-3 tnum">{merged ? it.dup : it.code}</span>
      </div>

      {it.dup && (
        <div className={cx('flex items-center gap-3 rounded-[14px] px-3 py-2.5', merged ? 'bg-ok-tint' : 'bg-sunken')}>
          {merged ? <Check size={18} weight="bold" className="shrink-0 text-ok" /> : <Warning size={18} className="shrink-0 text-gold-deep" />}
          <p className="flex-1 text-[13px] font-medium text-ink">{merged ? `Juntada com ${it.dup}` : `Já existe ${it.dup}`}</p>
          {dupOpen && <Button size="sm" variant="light" onClick={onMerge}>Juntar</Button>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {ORDER.map((k, n) => {
          const f = fields.find((x) => x.key === k)
          const wide = ['tour', 'dep', 'pax'].includes(k)
          return <div key={k} className={wide ? 'col-span-2' : ''}><Field f={f} i={fields.indexOf(f)} n={n} {...{ hot, setHot, shown }} replySent={asked} /></div>
        })}
      </div>

      {it.missing && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease, delay: fields.length * 0.06 }}
          className={cx('flex items-center gap-3 rounded-[14px] px-3 py-2.5', asked ? 'bg-sunken' : 'bg-gold-tint')}>
          {asked ? <Check size={18} weight="bold" className="shrink-0 text-ok" /> : <WarningCircle size={18} weight="fill" className="shrink-0 text-gold-deep" />}
          <p className="flex-1 text-[13px] font-medium text-ink">{asked ? 'Pedido enviado' : `Falta ${it.missing.label}`}</p>
          {missingOpen && <Button size="sm" variant="light" icon={PaperPlaneTilt} onClick={onAsk}>{it.missing.btn}</Button>}
        </motion.div>
      )}

      <div className="sticky bottom-0 z-10 -mx-1 mt-1 flex flex-wrap items-center gap-2 bg-surface px-1 py-3">
        <Button size="lg" disabled={!canConfirm} onClick={onConfirm} icon={Check} className="flex-1 sm:flex-none">Confirmar</Button>
        <Link to="/voucher/EA-51877" className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-ink-2 transition-colors hover:bg-sunken hover:text-ink">
          <PaperPlaneTilt size={16} /> Enviar voucher
        </Link>
      </div>
    </div>
  )
}

function Detail({ it, st, setSt, onConfirm, onBack }) {
  const reduce = useReducedMotion()
  const fields = it.fields
  const [shown, setShown] = useState(reduce ? fields.length : 0)
  const [hot, setHot] = useState(null)
  useEffect(() => {
    if (reduce) return
    let i = 0, iv
    const t = setTimeout(() => { iv = setInterval(() => { i++; setShown(i); if (i >= fields.length) clearInterval(iv) }, 60) }, 180)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [])
  const asked = !!st.asked[it.id]
  const merged = !!st.merged[it.id]
  const ch = CHANNELS[it.channel]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3 md:px-6">
        {onBack && <IconButton label="Voltar" onClick={onBack} className="bg-sunken"><ArrowLeft size={18} /></IconButton>}
        <ChannelGlyph k={it.channel} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold text-ink">{it.sender}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-ink-3"><span className="size-1.5 rounded-full" style={{ background: ch.color }} />{it.line ? `WhatsApp ${it.line}` : ch.label} · <span className="font-mono tnum">{fmt(it.time)}</span></p>
        </div>
      </div>
      <div className="grid flex-1 content-start gap-5 overflow-y-auto p-4 md:p-6 xl:grid-cols-2">
        <Message {...{ it, fields, shown, hot, setHot }} replySent={asked} />
        <BookingCard
          {...{ it, fields, shown, hot, setHot, asked, merged }}
          onAsk={() => setSt((s) => ({ ...s, asked: { ...s.asked, [it.id]: true } }))}
          onMerge={() => setSt((s) => ({ ...s, merged: { ...s.merged, [it.id]: true } }))}
          onConfirm={() => onConfirm(it, merged)}
        />
      </div>
    </div>
  )
}

/* ---------- Caixa ---------- */
export default function Inbox() {
  const desktop = useMedia('(min-width: 1024px)')
  const [st, setSt] = useState({ asked: {}, merged: {}, done: [], read: {} })
  const [filter, setFilter] = useState('all')
  const [sel, setSel] = useState('i1')
  const [sheet, setSheet] = useState(false)

  const open = INBOX.filter((it) => !st.done.includes(it.id))
  const items = useMemo(() => open.filter((it) => (filter === 'new' ? it.unread && !st.read[it.id] : filter === 'pending' ? isPending(it, st) : true)), [st, filter])
  const current = open.find((it) => it.id === sel) ?? (desktop ? items[0] : null)
  const unread = open.filter((it) => it.unread && !st.read[it.id]).length

  const pick = (it) => { setSel(it.id); setSt((s) => ({ ...s, read: { ...s.read, [it.id]: true } })); setSheet(true) }

  const confirm = (it, merged) => {
    const code = merged ? it.dup : it.code
    setSt((s) => ({ ...s, done: [...s.done, it.id] }))
    useOps.getState().showToast(`Reserva ${code} criada · voucher enviado`)
    setSheet(false)
    const next = open.filter((x) => x.id !== it.id)[0]
    if (next) setSel(next.id)
  }

  const detail = current && (
    <Detail key={current.id} it={current} st={st} setSt={setSt} onConfirm={confirm} onBack={desktop ? null : () => setSheet(false)} />
  )

  return (
    <Reveal i={2}>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5 md:px-7 md:pt-6">
          <CardHeader title="Caixa de entrada" className="min-w-0" />
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-ok-tint px-3.5 text-[12.5px] font-medium text-ok">
              <Checks size={16} /> <span className="font-semibold tnum">{CONFIRMED_BASE + st.done.length}</span> confirmadas hoje
            </span>
          </div>
        </div>
        <div className="grid border-t border-line lg:h-[680px] lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col lg:border-r lg:border-line">
            <div className="flex items-center justify-between gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
              <Segmented size="sm" options={FILTERS} value={filter} onChange={setFilter} />
              <span className="shrink-0 text-[12px] text-ink-3 tnum">{unread} novas</span>
            </div>
            <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((it) => <ListRow key={it.id} it={it} read={st.read[it.id]} active={desktop && current?.id === it.id} onOpen={() => pick(it)} />)}
              </AnimatePresence>
              {items.length === 0 && (
                <li className="grid place-items-center gap-2 py-16 text-center text-[13px] text-ink-3"><Tray size={28} className="text-ink-4" /> Caixa em dia</li>
              )}
            </ul>
          </div>
          {desktop && (
            <div className="flex min-h-0 min-w-0 flex-col bg-surface">
              {detail ?? <div className="grid flex-1 place-items-center text-[13px] text-ink-3">Nenhuma mensagem selecionada</div>}
            </div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {!desktop && sheet && current && (
          <motion.div
            key="sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.2, 0.9, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-surface"
          >
            {detail}
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  )
}
