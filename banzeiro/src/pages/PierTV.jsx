import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useOps, paxOfDep } from '../store'
import { COMPANY, TODAY_LABEL, fmt } from '../data/mock'
import { Logo } from '../components/Shell'
import { cx, useMedia } from '../components/ui'
import { FlapText, cellW } from './pier/Flap'
import { COLS, TONE, buildRows, kindColor } from './pier/board'
import './pier/pier.css'

const TICKER = [
  'Embarque pelo Píer 2',
  'Tenha seu QR Code em mãos',
  'Boarding at Pier 2',
  'Have your QR Code ready',
  'Embarque por el Muelle 2',
]

const CELL_COLOR = {
  time: 'var(--color-gold-light)',
  tour: 'white',
  vehicle: 'color-mix(in srgb, white 82%, transparent)',
  guide: 'color-mix(in srgb, white 70%, transparent)',
  onboard: 'white',
}

function useVw() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

/** Demonstração: embarca o próximo passageiro da saída em foco a cada 6s. */
function useDemoBoarding() {
  useEffect(() => {
    const id = setInterval(() => {
      const s = useOps.getState()
      const next = paxOfDep('d7').find((p) => s.status[p.id]?.s === 'waiting')
      if (next) s.board(next.id, 'qr')
    }, 6000)
    return () => clearInterval(id)
  }, [])
}

/** Controles aparecem com movimento do mouse ou toque; Esc sai. */
function useChrome() {
  const nav = useNavigate()
  const [awake, setAwake] = useState(true)
  useEffect(() => {
    let t
    const wake = () => { setAwake(true); clearTimeout(t); t = setTimeout(() => setAwake(false), 3000) }
    const key = (e) => { if (e.key === 'Escape') nav('/') }
    wake()
    window.addEventListener('mousemove', wake)
    window.addEventListener('touchstart', wake, { passive: true })
    window.addEventListener('keydown', key)
    return () => {
      clearTimeout(t)
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('touchstart', wake)
      window.removeEventListener('keydown', key)
    }
  }, [nav])
  return awake
}

function Clock({ now, className }) {
  const [h, m] = fmt(now).split(':')
  return (
    <span className={cx('font-mono font-medium tnum leading-none tracking-[-0.04em]', className)} aria-label={fmt(now)}>
      <span className="pier-gold">{h}</span>
      <span className="pier-gold pier-blink">:</span>
      <span className="pier-gold">{m}</span>
    </span>
  )
}

function ExitButton({ className }) {
  const nav = useNavigate()
  return (
    <button
      onClick={() => nav('/')}
      aria-label="Sair do modo TV"
      title="Sair (Esc)"
      className={cx('grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-[opacity,background] duration-300 hover:bg-white/20 focus-visible:opacity-100 active:scale-95', className)}
    >
      <X size={18} weight="bold" />
    </button>
  )
}

function Zigzag({ className }) {
  return (
    <svg className={className} width="100%" height="8" aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id="pier-zz" width="14" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 6 7 2 14 6" fill="none" style={{ stroke: 'var(--color-gold)' }} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="8" fill="url(#pier-zz)" />
    </svg>
  )
}

function Ticker({ className, textClass }) {
  const items = [...TICKER, ...TICKER]
  const track = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className={cx('flex shrink-0 items-center whitespace-nowrap font-medium text-gold-light', textClass)}>
          {t}
          <span className="mx-[1.6em] inline-block size-[0.36em] rotate-45 bg-gold/70" aria-hidden />
        </span>
      ))}
    </div>
  )
  return (
    <div className={cx('relative flex items-center overflow-hidden border-t border-gold/25 bg-negro/70', className)}>
      <div className="pier-mask min-w-0 flex-1 overflow-hidden" aria-label={TICKER.join('. ')} role="marquee">
        <div className="pier-marquee" aria-hidden>{track}{track}</div>
      </div>
    </div>
  )
}

function StatusDot({ tone, size }) {
  return (
    <span className="grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      {tone === 'boarding' && <span className="live-dot text-gold" style={{ width: 'calc(var(--tw) * .36)', height: 'calc(var(--tw) * .36)' }} />}
    </span>
  )
}

/* ---------- TV (≥768) ---------- */

function Board({ rows, reduce }) {
  const gap = 'calc(var(--tw) * 1.05)'
  return (
    <div className="flex min-h-0 flex-1 flex-col px-[3vw]">
      <div className="flex items-end justify-between pb-[0.9vw] pt-[1.3vw]" style={{ gap }}>
        <span className="w-[0.26vw] shrink-0" />
        {COLS.map((c) => (
          <span key={c.key} className="flex shrink-0 items-center" style={c.key === 'status' ? { gap: 'calc(var(--tw)*.3)' } : undefined}>
            {c.key === 'status' && <StatusDot size="calc(var(--tw) * .7)" />}
            <span
              className={cx('block text-[length:calc(var(--tw)*.62)] font-semibold uppercase leading-none tracking-[0.16em] text-gold/75', c.align === 'right' && 'text-right')}
              style={{ width: cellW(c.w) }}
            >
              {c.label}
            </span>
          </span>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col border-t border-gold/20">
        {rows.map((r, slot) => (
          <div
            key={slot}
            className={cx('relative flex flex-1 items-center justify-between border-b border-gold/10 transition-opacity duration-700', r.phase === 'done' && 'opacity-45')}
            style={{ gap }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-[3vw] -right-[3vw] transition-opacity duration-700"
              style={{
                opacity: r.tone === 'boarding' ? 1 : 0,
                background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-gold) 16%, transparent), color-mix(in srgb, var(--color-gold) 4%, transparent) 55%, transparent 85%)',
              }}
            />
            <span className="relative w-[0.26vw] shrink-0 rounded-full transition-colors duration-500" style={{ height: 'calc(var(--tw) * 1.5)', background: kindColor(r.kind) }} />
            {COLS.map((c, ci) => (
              <span key={c.key} className="relative flex shrink-0 items-center" style={c.key === 'status' ? { gap: 'calc(var(--tw)*.3)' } : undefined}>
                {c.key === 'status' && <StatusDot tone={r.tone} size="calc(var(--tw) * .7)" />}
                <FlapText
                  text={r.cells[c.key]}
                  width={c.w}
                  align={c.align}
                  reduce={reduce}
                  mountDelay={slot * 110 + ci * 45}
                  color={c.key === 'status' ? (r.tone ? TONE[r.tone].color : undefined) : CELL_COLOR[c.key]}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function TV({ rows, now, reduce, awake }) {
  const vw = useVw()
  const logo = Math.round(Math.min(104, Math.max(48, vw * 0.042)))
  return (
    <div className={cx('smoke grain fixed inset-0 overflow-hidden text-white', !awake && 'cursor-none')} style={{ '--tw': 'min(1.1vw, 3.1vh)' }}>
      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-end justify-between gap-[2vw] px-[3vw] pb-[1.5vw] pt-[2.4vw]">
          <div className="flex items-center gap-[1.3vw]">
            <Logo size={logo} />
            <div>
              <div className="text-[length:max(12px,0.95vw)] font-semibold uppercase leading-none tracking-[0.22em] text-gold-light/80">{COMPANY.short}</div>
              <h1 className="mt-[0.55vw] text-[length:max(26px,2.75vw)] font-semibold leading-none tracking-[-0.025em]">Saídas de hoje</h1>
            </div>
          </div>
          <div className="flex items-end gap-[1.6vw]">
            <div className="pb-[0.35vw] text-right">
              <div className="text-[length:max(13px,1.1vw)] font-medium leading-tight text-white/75">{TODAY_LABEL}</div>
              <div className="mt-[0.35vw] flex items-center justify-end gap-[0.5vw] text-[length:max(11px,0.85vw)] font-medium uppercase tracking-[0.16em] text-white/45">
                <span className="live-dot text-ok" />
                {COMPANY.pier}
              </div>
            </div>
            <Clock now={now} className="text-[length:max(44px,4.9vw)]" />
          </div>
        </header>
        <Zigzag className="block px-[3vw] opacity-40" />
        <Board rows={rows} reduce={reduce} />
        <Ticker className="mt-[1.2vw] h-[max(44px,3.3vw)]" textClass="text-[length:max(15px,1.2vw)]" />
      </div>
      <ExitButton className={cx('fixed right-[1vw] top-[1vw] z-30', awake ? 'opacity-100' : 'pointer-events-none opacity-0')} />
    </div>
  )
}

/* ---------- Mobile (<768) ---------- */

function Mobile({ rows, now, reduce }) {
  const list = rows.filter((r) => r.dep)
  return (
    <div className="smoke grain relative min-h-dvh overflow-x-hidden text-white" style={{ '--tw': '17px' }}>
      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 px-4 pb-3 pt-5">
          <Logo size={38} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-light/80">{COMPANY.short}</div>
            <h1 className="mt-0.5 text-[19px] font-semibold leading-tight tracking-[-0.02em]">Saídas de hoje</h1>
          </div>
          <Clock now={now} className="text-[27px]" />
          <ExitButton className="size-10" />
        </header>
        <div className="flex items-center justify-between px-4 pb-3 text-[12.5px] text-white/55">
          <span>{TODAY_LABEL}</span>
          <span className="flex items-center gap-1.5"><span className="live-dot text-ok" />{COMPANY.pier}</span>
        </div>
        <Zigzag className="block px-4 opacity-40" />
        <ul className="flex flex-1 flex-col gap-2.5 px-4 pb-24 pt-4">
          {list.map((r, i) => (
            <li
              key={i}
              className={cx(
                'relative overflow-hidden rounded-[20px] py-3.5 pl-5 pr-3.5 ring-1 transition-opacity duration-700',
                r.tone === 'boarding' ? 'bg-gold/[0.09] ring-gold/30' : 'bg-white/[0.035] ring-white/[0.08]',
                r.phase === 'done' && 'opacity-45',
              )}
            >
              <span className="absolute bottom-3.5 left-2 top-3.5 w-[3px] rounded-full" style={{ background: kindColor(r.kind) }} />
              <div className="flex items-center justify-between gap-2">
                <FlapText text={r.cells.time} width={5} reduce={reduce} mountDelay={i * 110} color={CELL_COLOR.time} />
                <span className="flex items-center gap-1.5">
                  <StatusDot tone={r.tone} size="12px" />
                  <FlapText text={r.cells.status} width={10} align="right" reduce={reduce} mountDelay={i * 110 + 60} color={TONE[r.tone].color} />
                </span>
              </div>
              <div className="mt-3 truncate text-[16px] font-semibold tracking-[-0.01em]">{r.tourName}</div>
              <div className="mt-0.5 truncate text-[13px] text-white/55">
                {[r.vehicleName, r.guideName].filter(Boolean).join(' · ')}
                <span className="tnum"> · {r.boarded} de {r.total} a bordo</span>
              </div>
            </li>
          ))}
        </ul>
        <Ticker className="fixed inset-x-0 bottom-0 z-20 h-12 backdrop-blur-md" textClass="text-[14px]" />
      </div>
    </div>
  )
}

export default function PierTV() {
  const now = useOps((s) => s.now)
  const status = useOps((s) => s.status)
  const reduce = useReducedMotion()
  const mobile = useMedia('(max-width: 767px)')
  const awake = useChrome()
  useDemoBoarding()
  const rows = useMemo(() => buildRows(now, status), [now, status])

  return mobile
    ? <Mobile rows={rows} now={now} reduce={reduce} />
    : <TV rows={rows} now={now} reduce={reduce} awake={awake} />
}
