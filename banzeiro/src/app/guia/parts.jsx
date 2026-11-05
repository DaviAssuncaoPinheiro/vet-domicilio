import { createContext, useContext, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { House, Scan, UsersThree, Boat, UserCircle, CellSignalFull, WifiHigh, WifiSlash, BatteryHigh, Check } from '@phosphor-icons/react'
import { cx, ease } from '../../components/ui'
import { fmt } from '../../data/mock'
import { useOps } from '../../store'

/* ---------- contexto do app ---------- */
export const GuiaCtx = createContext(null)
export const useGuia = () => useContext(GuiaCtx)

export const SHEET_EASE = [0.2, 0.9, 0.3, 1]

/** Renderiza acima da bottom nav, no host do app. */
export function Portal({ children }) {
  const ctx = useGuia()
  if (!ctx?.portalEl) return null
  return createPortal(children, ctx.portalEl)
}

/* ---------- helpers ---------- */
const HUES = ['var(--color-boat)', 'var(--color-ink-2)', 'var(--color-transfer)', 'var(--color-land)', 'var(--color-gold-deep)', 'var(--color-alert)', 'var(--color-negro-2)', 'var(--color-ink-3)']
export function paxHue(p) {
  let h = 0
  for (let i = 0; i < p.name.length; i++) h = (h * 31 + p.name.charCodeAt(i)) >>> 0
  return HUES[h % HUES.length]
}
export function initialsOf(name) {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
export function durLabel(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h && m) return `${h}h${String(m).padStart(2, '0')}`
  if (h) return `${h}h`
  return `${m} min`
}

/* ---------- som e vibração (criados no gesto do usuário) ---------- */
let audio
export function unlockAudio() {
  try {
    if (!audio) {
      const C = window.AudioContext || window.webkitAudioContext
      if (!C) return null
      audio = new C()
    }
    if (audio.state === 'suspended') audio.resume()
    return audio
  } catch {
    return null
  }
}
function tone(a, freq, t0, dur, type = 'sine', vol = 0.07) {
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(a.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}
export function beepOk() {
  try {
    const a = unlockAudio()
    if (!a) return
    const t = a.currentTime + 0.01
    tone(a, 1320, t, 0.07)
    tone(a, 1760, t + 0.075, 0.1)
  } catch { /* sem áudio */ }
}
export function beepErr() {
  try {
    const a = unlockAudio()
    if (!a) return
    const t = a.currentTime + 0.01
    tone(a, 280, t, 0.12, 'triangle', 0.09)
    tone(a, 210, t + 0.15, 0.18, 'triangle', 0.09)
  } catch { /* sem áudio */ }
}
export function haptic(pattern) {
  try { navigator.vibrate?.(pattern) } catch { /* sem vibração */ }
}

/* ---------- status bar ---------- */
export function StatusBar({ light }) {
  const now = useOps((s) => s.now)
  const online = useOps((s) => s.online)
  return (
    <div
      className={cx(
        'pointer-events-none absolute inset-x-0 top-0 z-40 flex items-end justify-between pb-[10px] pl-8 pr-7 transition-colors duration-300',
        light ? 'text-white' : 'bg-gradient-to-b from-frame from-60% to-frame/0 text-ink',
      )}
      style={{ height: 'calc(48px + var(--sat))', paddingTop: 'var(--sat)' }}
    >
      <span className="text-[15px] font-semibold tracking-[-0.01em] tnum">{fmt(now)}</span>
      <span className="flex items-center gap-[5px]">
        <CellSignalFull size={16} weight="fill" />
        {online ? <WifiHigh size={16} weight="bold" /> : <WifiSlash size={16} weight="bold" className={light ? 'text-gold-light' : 'text-gold-deep'} />}
        <BatteryHigh size={23} weight="fill" />
      </span>
    </div>
  )
}

/* ---------- barra inferior: negra, botão dourado elevado no centro ---------- */
export const TABS = [
  { id: 'home', label: 'Início', icon: House },
  { id: 'list', label: 'Lista', icon: UsersThree },
  { id: 'deps', label: 'Saídas', icon: Boat },
  { id: 'me', label: 'Perfil', icon: UserCircle },
]

export function BottomNav({ tab, onChange, onScan, dark }) {
  const Item = ({ t }) => {
    const active = tab === t.id
    const Icon = t.icon
    return (
      <button
        aria-label={t.label}
        aria-current={active ? 'page' : undefined}
        onClick={() => onChange(t.id)}
        className={cx('grid h-14 flex-1 place-items-center transition-colors duration-150', active ? 'text-white' : 'text-white/40 hover:text-white/70')}
      >
        <Icon size={24} weight={active ? 'fill' : 'regular'} />
      </button>
    )
  }
  return (
    <nav className="absolute inset-x-3 z-40" style={{ bottom: 'calc(10px + var(--sab))' }} aria-label="Navegação do app">
      <div className={cx('relative flex items-center rounded-[26px] bg-negro px-2 shadow-dark', dark && 'ring-1 ring-white/10')}>
        <Item t={TABS[0]} />
        <Item t={TABS[1]} />
        <div className="w-20 shrink-0" />
        <Item t={TABS[2]} />
        <Item t={TABS[3]} />
        <button
          aria-label={tab === 'scan' ? 'Ler próximo' : 'Scanner'}
          onClick={onScan}
          className={cx('absolute left-1/2 top-0 grid size-16 -translate-x-1/2 -translate-y-[38%] place-items-center rounded-full bg-gold text-negro ring-[6px] transition-transform active:scale-95', dark ? 'ring-negro' : 'ring-frame')}
        >
          <Scan size={26} weight="bold" />
        </button>
      </div>
    </nav>
  )
}

/** Avatar plano com iniciais, como na referência */
export function FlatAvatar({ name, hue, size = 52 }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: hue, fontSize: Math.round(size * 0.33) }}>
      {initialsOf(name)}
    </span>
  )
}

/* ---------- área rolável de cada aba ---------- */
export function Screen({ children, className }) {
  return (
    <div
      className={cx('no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain', className)}
      style={{ paddingTop: 'calc(52px + var(--sat))', paddingBottom: 'calc(120px + var(--sab))' }}
    >
      {children}
    </div>
  )
}

/* ---------- bottom sheet ---------- */
export function Sheet({ open, onClose, children, label }) {
  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div key="bd" className="absolute inset-0 z-50 bg-[rgba(10,12,20,.38)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} onClick={onClose} />
      )}
      {open && (
        <motion.div
          key="sheet"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="absolute inset-x-0 bottom-0 z-50 max-h-[88%] overflow-y-auto rounded-t-[30px] bg-surface px-5 pt-2.5 text-ink shadow-lift no-scrollbar"
          style={{ paddingBottom: 'calc(20px + var(--sab))' }}
          initial={{ y: '100%' }}
          animate={{ y: 0, transition: { duration: 0.32, ease: SHEET_EASE } }}
          exit={{ y: '100%', transition: { duration: 0.24, ease } }}
        >
          <div className="mx-auto mb-4 h-[5px] w-10 rounded-full bg-ink-4/50" />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  )
}

/* ---------- aviso de rede (sem internet / enviado), texto simples ---------- */
export function NetPill({ className, glass, plain }) {
  const { stats, synced } = useGuia()
  const online = useOps((s) => s.online)
  const look = plain ? '' : glass ? 'h-8 rounded-full bg-white/10 px-3 backdrop-blur-md' : 'h-8 rounded-full bg-surface px-3'
  const mp = { initial: { opacity: 0, y: -3 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.22, ease } }
  return (
    <AnimatePresence mode="wait" initial={false}>
      {!online ? (
        <motion.span key="off" {...mp} className={cx('inline-flex items-center gap-1.5 whitespace-nowrap text-[13.5px] font-medium tnum', glass || plain ? 'text-gold-light' : 'text-gold-deep', look, className)}>
          <WifiSlash size={15} />
          Sem internet{stats.queued ? ` · ${stats.queued} no celular` : ''}
        </motion.span>
      ) : synced ? (
        <motion.span key={`sync-${synced.id}`} {...mp} className={cx('inline-flex items-center gap-1.5 whitespace-nowrap text-[13.5px] font-medium tnum', glass || plain ? 'text-ok-tint' : 'text-ok', look, className)}>
          <Check size={15} weight="bold" />
          {synced.n} {synced.n === 1 ? 'enviado' : 'enviados'}
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

/* ---------- switch ---------- */
export function Switch({ checked, onChange, label, onDark }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }} className="flex h-11 shrink-0 items-center px-0.5"
    >
      <span className={cx('relative flex h-[30px] w-[50px] items-center rounded-full p-[3px] transition-colors duration-200', checked ? (onDark ? 'justify-end bg-gold' : 'justify-end bg-negro') : (onDark ? 'justify-start bg-white/20' : 'justify-start bg-ink-4/45'))}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 36 }} className={cx('size-6 rounded-full shadow-[0_2px_6px_rgba(19,19,22,.25)]', checked ? (onDark ? 'bg-negro' : 'bg-gold') : 'bg-surface')} />
      </span>
    </button>
  )
}

/* ---------- segmentado com alvo de toque 44px ---------- */
export function Seg({ options, value, onChange, className }) {
  const uid = useId()
  return (
    <div className={cx('flex rounded-full bg-sunken p-1', className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cx('relative z-10 flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors duration-150', active ? 'text-ink' : 'text-ink-3')}
          >
            {active && <motion.span layoutId={`seg-${uid}`} className="absolute inset-0 -z-10 rounded-full bg-surface shadow-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            {o.label}
            {o.count != null && <span className={cx('text-[12px] tnum', active ? 'text-ink-3' : 'text-ink-4')}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- ícone de resultado com traço desenhado ---------- */
export function DrawnMark({ ok = true, size = 56, color, stroke = 'var(--color-surface)', delay = 0.1 }) {
  const fill = color ?? (ok ? 'var(--color-ok)' : 'var(--color-alert)')
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      className="shrink-0"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      aria-hidden
    >
      <circle cx="28" cy="28" r="28" fill={fill} />
      {ok ? (
        <motion.path d="M17.5 28.8l7 7L39 21.5" stroke={stroke} strokeWidth="4.2" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay, ease }} />
      ) : (
        <>
          <motion.path d="M20.5 20.5l15 15" stroke={stroke} strokeWidth="4.2" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18, delay, ease }} />
          <motion.path d="M35.5 20.5l-15 15" stroke={stroke} strokeWidth="4.2" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18, delay: delay + 0.12, ease }} />
        </>
      )}
    </motion.svg>
  )
}
