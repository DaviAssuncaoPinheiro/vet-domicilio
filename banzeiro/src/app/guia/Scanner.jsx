import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, useAnimationControls } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Boat, Flashlight, Repeat, Keyboard, Scan, ArrowUpRight, ListChecks } from '@phosphor-icons/react'
import { cx, ease } from '../../components/ui'
import { fmt } from '../../data/mock'
import { useOps } from '../../store'
import { useGuia, NetPill, Sheet, Portal, DrawnMark, unlockAudio, beepOk, beepErr, haptic, SHEET_EASE } from './parts'

const CUT = 260
const CORNER_COLOR = { idle: 'var(--color-surface)', reading: 'var(--color-lime)', ok: 'var(--color-ok)', error: 'var(--color-alert)' }

/* ---------- cena de câmera simulada: píer no rio, desfocado ---------- */
function CameraScene({ torch, reduce }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -inset-[10%]"
        style={{ filter: `blur(10px) saturate(0.92) brightness(${torch ? 1.12 : 0.8})`, transition: 'filter .35s ease' }}
        animate={reduce ? undefined : { x: [0, -7, 4, 0], y: [0, 4, -3, 0], rotate: [0, 0.3, -0.2, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* céu de fim de manhã com névoa */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#24303d 0%,#3f4c5a 18%,#7f8a8e 33%,#b5a688 40%,#5f5442 44%)' }} />
        <div className="absolute" style={{ left: '48%', top: '20%', width: '80%', height: '32%', background: 'radial-gradient(closest-side, rgba(255,226,170,.7), rgba(255,226,170,0))' }} />
        {/* margem com floresta */}
        <div className="absolute inset-x-0" style={{ top: '37.5%', height: '7%', background: 'radial-gradient(22% 90% at 8% 100%, #182016 70%, transparent 72%), radial-gradient(26% 120% at 34% 100%, #1b2418 70%, transparent 72%), radial-gradient(20% 80% at 58% 100%, #182016 70%, transparent 72%), radial-gradient(30% 110% at 86% 100%, #1d2619 70%, transparent 72%), linear-gradient(#192117,#192117) bottom / 100% 45% no-repeat' }} />
        {/* encontro das águas: Rio Negro escuro à esquerda, Solimões barrento à direita */}
        <div className="absolute inset-x-0 bottom-0" style={{ top: '43.5%', background: 'linear-gradient(97deg,#0f0d0b 0%,#1a1511 34%,#3b2c1d 47%,#7a5a36 62%,#96734a 100%)' }} />
        <div className="absolute inset-x-0" style={{ top: '44%', height: '24%', background: 'repeating-linear-gradient(180deg, rgba(255,232,196,.09) 0 2px, rgba(0,0,0,0) 2px 11px)' }} />
        <div className="absolute" style={{ left: '30%', top: '44%', width: '55%', height: '9%', background: 'radial-gradient(closest-side, rgba(255,226,170,.35), rgba(255,226,170,0))' }} />
        {/* lancha atracada */}
        <div className="absolute" style={{ right: '-8%', top: '45.5%', width: '62%', height: '15%', borderRadius: '55% 12% 26% 60% / 70% 30% 40% 40%', background: 'linear-gradient(180deg,#f1eee6 0%,#cfc8b8 55%,#6a6155 100%)' }} />
        <div className="absolute" style={{ right: '6%', top: '41%', width: '30%', height: '7%', borderRadius: '30% 30% 8% 8%', background: 'linear-gradient(180deg,#2a3540,#151b22)' }} />
        <div className="absolute" style={{ right: '-8%', top: '54%', width: '62%', height: '2.2%', background: 'var(--color-boat)', opacity: 0.35, borderRadius: 8 }} />
        {/* píer de madeira em perspectiva */}
        <div className="absolute -inset-x-[30%] -bottom-[6%] h-[46%] origin-bottom" style={{ transform: 'perspective(420px) rotateX(56deg)', background: 'repeating-linear-gradient(90deg,#4a3828 0 46px,#2a1f16 46px 50px)' }} />
        <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: 'linear-gradient(180deg, rgba(10,8,6,0), rgba(10,8,6,.75))' }} />
        {/* luzes desfocadas */}
        {[
          ['12%', '30%', 46, 'rgba(255,214,150,.55)'],
          ['72%', '35%', 30, 'rgba(255,240,210,.6)'],
          ['84%', '50%', 22, 'rgba(255,255,255,.5)'],
          ['22%', '62%', 60, 'rgba(230,176,92,.22)'],
        ].map(([l, t, s, c], i) => (
          <span key={i} className="absolute rounded-full" style={{ left: l, top: t, width: s, height: s, background: `radial-gradient(closest-side, ${c}, rgba(0,0,0,0))` }} />
        ))}
      </motion.div>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 75% at 50% 42%, rgba(5,6,10,0) 35%, rgba(5,6,10,.7) 100%)' }} />
      <div className="grain absolute inset-0" />
    </div>
  )
}

function Corners({ color, reading }) {
  const base = 'absolute size-9 transition-[border-color] duration-150'
  const s = { borderColor: color }
  return (
    <motion.div className="pointer-events-none absolute -inset-[3px]" animate={{ scale: reading ? 0.955 : 1 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}>
      <span className={cx(base, 'left-0 top-0 rounded-tl-[30px] border-l-4 border-t-4')} style={s} />
      <span className={cx(base, 'right-0 top-0 rounded-tr-[30px] border-r-4 border-t-4')} style={s} />
      <span className={cx(base, 'bottom-0 left-0 rounded-bl-[30px] border-b-4 border-l-4')} style={s} />
      <span className={cx(base, 'bottom-0 right-0 rounded-br-[30px] border-b-4 border-r-4')} style={s} />
    </motion.div>
  )
}

export default function Scanner() {
  const { pax, stats, dep, vehicle, released, setReleased, go } = useGuia()
  const status = useOps((s) => s.status)
  const online = useOps((s) => s.online)
  const reduce = useReducedMotion()
  const frame = useAnimationControls()

  const [phase, setPhase] = useState('idle') // idle | reading | ok | error
  const [target, setTarget] = useState(null) // passageiro sendo lido
  const [result, setResult] = useState(null)
  const [flash, setFlash] = useState(null)
  const [torch, setTorch] = useState(false)
  const [manual, setManual] = useState(false)
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState('')
  const lastOk = useRef(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }

  const allDone = stats.waiting === 0 && stats.boarded > 0
  const waitingPax = pax.filter((p) => status[p.id]?.s === 'waiting')

  function finish(p, res) {
    const st = useOps.getState()
    if (res.ok) {
      lastOk.current = p.id
      setResult({ p, ok: true, at: st.now, queued: !st.online, t: res.t })
      setPhase('ok')
      setFlash({ ok: true, t: res.t })
      haptic(15)
      beepOk()
    } else {
      setResult({ p, ok: false, at: res.at, via: st.status[p.id]?.via, t: Date.now() })
      setPhase('error')
      setFlash({ ok: false, t: Date.now() })
      haptic([30, 40, 30])
      beepErr()
      if (!reduce) frame.start({ x: [0, -6, 6, -6, 6, -3, 0], transition: { duration: 0.36, ease: 'easeInOut' } })
    }
  }

  function read(p, via = 'qr') {
    if (!p || phase === 'reading') return
    unlockAudio()
    setTarget(p)
    setPhase('reading')
    later(() => finish(p, useOps.getState().board(p.id, via)), reduce ? 120 : 460)
  }

  const readNext = () => {
    if (phase === 'ok') { setPhase('idle'); return later(() => read(firstWaiting()), 60) }
    if (phase === 'error') return setPhase('idle')
    read(firstWaiting())
  }
  const firstWaiting = () => pax.find((x) => useOps.getState().status[x.id]?.s === 'waiting')

  const readRepeat = () => {
    if (phase === 'reading') return
    const st = useOps.getState()
    let p = lastOk.current && pax.find((x) => x.id === lastOk.current)
    if (!p) {
      const boarded = pax.filter((x) => st.status[x.id]?.s === 'boarded')
      const past = boarded.filter((x) => st.status[x.id].at <= st.now).sort((a, b) => st.status[b.id].at - st.status[a.id].at)
      p = past[0] ?? boarded[0]
    }
    if (!p) return
    setPhase('idle')
    later(() => read(p), 40)
  }

  // sucesso fecha sozinho em 2.5s
  useEffect(() => {
    if (phase !== 'ok' || !result) return
    const t = setTimeout(() => setPhase('idle'), 2500)
    return () => clearTimeout(t)
  }, [phase, result?.t])

  function submitCode(e) {
    e?.preventDefault()
    let c = code.trim().toUpperCase().replace(/\s+/g, '')
    if (/^\d+$/.test(c)) c = `EA-${c}`
    if (/^EA\d+$/.test(c)) c = `EA-${c.slice(2)}`
    const matches = pax.filter((p) => p.booking === c)
    if (!matches.length) { setCodeErr('Código não encontrado'); haptic([30, 40, 30]); return }
    const st = useOps.getState()
    const p = matches.find((m) => st.status[m.id]?.s !== 'boarded') ?? matches[0]
    setManual(false)
    setCode('')
    setCodeErr('')
    unlockAudio()
    setTarget(p)
    later(() => finish(p, useOps.getState().board(p.id, 'manual')), 320)
  }

  const color = CORNER_COLOR[phase]
  const hint = { idle: 'Aponte para o QR Code', reading: 'Lendo', ok: 'Embarcado', error: 'Já embarcou' }[phase]
  const sheetOpen = (phase === 'ok' || phase === 'error') && result
  const showDone = allDone && (phase === 'idle' || phase === 'reading')
  const queueCodes = [...new Set(waitingPax.map((p) => p.booking))]

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-negro text-white">
      <CameraScene torch={torch} reduce={reduce} />

      {/* flash de borda */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.t}
            className="pointer-events-none absolute inset-0 z-20"
            style={{ background: flash.ok ? 'rgba(34,160,107,.12)' : 'rgba(238,104,73,.12)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, times: [0, 0.3, 1] }}
            onAnimationComplete={() => setFlash(null)}
          />
        )}
      </AnimatePresence>

      {/* visor */}
      <div className="absolute left-1/2 z-10" style={{ top: `calc(42% - ${CUT / 2}px)`, width: CUT, height: CUT, marginLeft: -CUT / 2 }}>
        <motion.button
          animate={frame}
          onClick={readNext}
          aria-label="Ler QR Code do próximo passageiro"
          className="absolute inset-0 rounded-[28px] focus-visible:outline-offset-8"
          style={{ boxShadow: '0 0 0 200vmax rgba(10,12,20,.55)' }}
        >
          {/* voucher entrando no quadro */}
          <AnimatePresence>
            {target && phase !== 'idle' && (
              <motion.div
                key={target.id + (result?.t ?? '')}
                className="absolute inset-[38px] grid place-items-center rounded-[18px] bg-frame p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,.5)]"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 70, rotate: -9, scale: 0.86 }}
                animate={{ opacity: 0.92, y: 0, rotate: -3, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.94, transition: { duration: 0.22 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                style={{ filter: 'blur(0.4px)' }}
              >
                <QRCodeSVG value={`BANZEIRO|${target.booking}|${target.id}`} size={150} bgColor="var(--color-frame)" fgColor="var(--color-negro)" level="M" style={{ width: '100%', height: '100%' }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* linha de varredura */}
          {(phase === 'idle' || phase === 'reading') && !showDone && (
            <motion.span
              className="pointer-events-none absolute inset-x-5 h-[2px] rounded-full bg-lime"
              style={{ boxShadow: '0 0 6px rgba(255,255,255,.5)' }}
              initial={{ top: '10%' }}
              animate={reduce ? { top: '50%' } : { top: ['10%', '90%'] }}
              transition={reduce ? { duration: 0 } : { duration: phase === 'reading' ? 0.45 : 1.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
            />
          )}
          <Corners color={color} reading={phase === 'reading'} />
        </motion.button>
      </div>

      {/* barra superior */}
      <div className="absolute inset-x-0 z-20 flex flex-col items-center gap-2.5 px-4" style={{ top: 'calc(54px + var(--sat))' }}>
        <div className="flex w-full items-center justify-between gap-2">
          <span className="inline-flex h-11 min-w-0 items-center gap-2 rounded-full bg-white/10 pl-3 pr-4 text-[13px] font-medium ring-1 ring-inset ring-white/15 backdrop-blur-md">
            <Boat size={17} className="shrink-0 text-white/80" />
            <span className="truncate">{vehicle.name} · <span className="font-mono tnum">{fmt(dep.start)}</span></span>
          </span>
          <button
            onClick={() => setTorch((v) => !v)}
            aria-label="Lanterna"
            aria-pressed={torch}
            className={cx('grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-inset backdrop-blur-md transition-colors active:scale-95', torch ? 'bg-white text-negro ring-white' : 'bg-white/10 text-white ring-white/15')}
          >
            <Flashlight size={19} weight={torch ? 'fill' : 'regular'} />
          </button>
        </div>
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-negro/70 pl-3 pr-3.5 text-[12.5px] ring-1 ring-inset ring-white/10 backdrop-blur-md">
          <span className="font-semibold tnum">{stats.boarded} de {stats.total}</span>
          <span className="text-white/60">a bordo</span>
        </span>
        <NetPill glass />
      </div>

      {/* dica */}
      <div className="absolute inset-x-0 z-10 text-center" style={{ top: `calc(42% + ${CUT / 2 + 22}px)` }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={hint} className="text-[16px] font-medium text-white/90" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
            {hint}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* controles */}
      <div className="absolute inset-x-4 z-20 flex flex-col gap-2.5" style={{ bottom: 'calc(92px + var(--sab))' }}>
        <div className="flex gap-2.5">
          <button onClick={readRepeat} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white/10 text-[13px] font-medium ring-1 ring-inset ring-white/15 backdrop-blur-md transition-transform active:scale-[0.97]">
            <Repeat size={17} /> Ler QR repetido
          </button>
          <button onClick={() => { setManual(true); setCodeErr('') }} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white/10 text-[13px] font-medium ring-1 ring-inset ring-white/15 backdrop-blur-md transition-transform active:scale-[0.97]">
            <Keyboard size={17} /> Digitar código
          </button>
        </div>
        <button
          onClick={readNext}
          disabled={!waitingPax.length && phase === 'idle'}
          className="flex h-[58px] w-full items-center justify-between rounded-full bg-lime pl-6 pr-2 text-negro transition-transform duration-150 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Ler próximo</span>
          <span className="grid size-[42px] place-items-center rounded-full bg-negro text-lime"><Scan size={19} weight="bold" /></span>
        </button>
      </div>

      {/* concluído */}
      <AnimatePresence>
        {showDone && (
          <motion.div
            className="smoke absolute inset-0 z-30 flex flex-col items-center justify-center px-7 text-center"
            style={{ paddingBottom: 'calc(96px + var(--sab))', paddingTop: 'calc(40px + var(--sat))' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, ease } }}
            exit={{ opacity: 0 }}
          >
            <div className="grain pointer-events-none absolute inset-0" />
            <div className="relative grid size-[200px] place-items-center">
              {!reduce && [0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-white/15"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.15], opacity: [0, 0.55, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, delay: 0.5 + i * 1.8, ease: 'easeOut' }}
                />
              ))}
              <DrawnMark ok size={96} color="var(--color-lime)" stroke="var(--color-negro)" delay={0.35} />
            </div>
            <motion.h2 className="relative mt-4 text-[30px] font-semibold tracking-[-0.03em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4, ease }}>
              {stats.noshow ? 'Embarque concluído' : 'Todos a bordo'}
            </motion.h2>
            <motion.p className="relative mt-1.5 text-[14px] text-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <span className="tnum text-white">{stats.boarded} de {stats.total}</span>
              {stats.noshow ? <span className="tnum"> · {stats.noshow} {stats.noshow === 1 ? 'faltou' : 'faltaram'}</span> : null}
            </motion.p>
            <div className="relative mt-5 flex gap-1.5" aria-hidden>
              {pax.map((p, i) => (
                <motion.span key={p.id} className={cx('size-2 rounded-full', status[p.id]?.s === 'boarded' ? 'bg-lime' : 'bg-white/20')} initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.05, duration: 0.3, ease }} />
              ))}
            </div>
            <motion.div className="relative mt-8 w-full max-w-[300px]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.4, ease }}>
              {released ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[15px] text-white/80">Saída liberada às <span className="font-mono text-white">{fmt(released)}</span></p>
                  <button onClick={() => go('list')} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/10 text-[14px] font-medium ring-1 ring-inset ring-white/15">
                    <ListChecks size={18} /> Ver lista
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const st = useOps.getState()
                    setReleased(st.now)
                    st.showToast(`${vehicle.name} liberada · ${stats.boarded} a bordo`)
                    haptic(15)
                  }}
                  className="flex h-[58px] w-full items-center justify-between rounded-full bg-lime pl-6 pr-2 text-negro transition-transform active:scale-[0.98]"
                >
                  <span className="text-[16px] font-semibold">Liberar saída</span>
                  <span className="grid size-[42px] place-items-center rounded-full bg-negro text-lime"><ArrowUpRight size={18} weight="bold" /></span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* resultado */}
      <Portal>
      <AnimatePresence>
        {sheetOpen && <motion.div key="catch" className="absolute inset-0 z-[45]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhase('idle')} />}
        {sheetOpen && (
          <motion.div
            key={`res-${result.t}`}
            role="status"
            aria-live="polite"
            className="absolute inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[30px] bg-surface px-5 pt-2.5 text-ink shadow-lift"
            style={{ paddingBottom: 'calc(18px + var(--sab))' }}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { duration: 0.32, ease: SHEET_EASE } }}
            exit={{ y: '100%', transition: { duration: 0.24, ease } }}
          >
            {result.ok && <motion.span className="absolute left-0 top-0 h-[3px] bg-ok/70" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 2.5, ease: 'linear' }} />}
            <div className="mx-auto mb-4 h-[5px] w-10 rounded-full bg-ink-4/50" />
            <div className="flex items-center gap-4">
              <DrawnMark ok={result.ok} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.02em]">{result.p.name}</h3>
                <p className={cx('mt-1 text-[15px] font-medium', result.ok ? 'text-ok' : 'text-alert')}>
                  {result.ok ? 'Embarcado' : <>Já embarcou às <span className="font-mono">{fmt(result.at)}</span></>}
                </p>
                {result.ok && result.queued && <p className="text-[13px] text-gold-deep">Salvo no celular</p>}
              </div>
              <div className="shrink-0 rounded-[16px] bg-sunken px-3.5 py-2 text-center">
                <p className="text-[11px] text-ink-3">Assento</p>
                <p className="font-mono text-[24px] font-medium leading-tight tracking-[-0.03em]">{result.p.seat}</p>
              </div>
            </div>
            <button
              onClick={readNext}
              className="mt-5 flex h-[54px] w-full items-center justify-center rounded-full bg-negro text-[15px] font-semibold text-white shadow-dark transition-transform active:scale-[0.98]"
            >
              Próximo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      {/* digitar código */}
      <Sheet open={manual} onClose={() => setManual(false)} label="Digitar código">
        <form onSubmit={submitCode}>
          <h3 className="text-[19px] font-semibold tracking-[-0.02em]">Digitar código</h3>
          <input
            autoFocus
            value={code}
            onChange={(e) => { setCode(e.target.value); setCodeErr('') }}
            placeholder="EA-00000"
            aria-label="Código da reserva"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className={cx('mt-4 h-14 w-full rounded-[16px] bg-sunken px-4 font-mono text-[20px] font-medium uppercase tracking-[0.04em] text-ink outline-none ring-2 ring-inset transition-shadow placeholder:text-ink-4 focus:ring-now/50', codeErr ? 'ring-alert/60' : 'ring-transparent')}
          />
          <p className="mt-2 h-4 text-[13px] text-alert">{codeErr}</p>
          {queueCodes.length > 0 && (
            <>
              <p className="mt-2 text-[13px] text-ink-3">Aguardando</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {queueCodes.map((c) => (
                  <button type="button" key={c} onClick={() => { setCode(c); setCodeErr('') }} className={cx('h-11 rounded-full px-3.5 font-mono text-[13px] font-medium transition-colors', code.toUpperCase() === c ? 'bg-negro text-white' : 'bg-surface text-ink-2 shadow-pill')}>
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
          <button type="submit" disabled={!code.trim()} className="mt-5 flex h-[52px] w-full items-center justify-center rounded-full bg-negro text-[14.5px] font-semibold text-white shadow-dark transition-transform active:scale-[0.98] disabled:opacity-40">
            Conferir
          </button>
        </form>
      </Sheet>
    </div>
  )
}
