import { createContext, useContext, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { House, Scan, ListChecks, UserCircle, CellSignalFull, WifiHigh, WifiSlash, BatteryHigh, CheckCircle } from '@phosphor-icons/react'
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
const HUES = ['#6F66F0', '#3D6DF5', '#0E9AA7', '#3DBE83', '#E6B05C', '#EE6849', '#C2185B', '#43434B']
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
        {online ? <WifiHigh size={16} weight="bold" /> : <WifiSlash size={16} weight="bold" className="text-land" />}
        <BatteryHigh size={23} weight="fill" />
      </span>
    </div>
  )
}

/* ---------- bottom nav flutuante ---------- */
export const TABS = [
  { id: 'home', label: 'Início', icon: House },
  { id: 'scan', label: 'Scanner', icon: Scan },
  { id: 'list', label: 'Lista', icon: ListChecks },
  { id: 'me', label: 'Perfil', icon: UserCircle },
]

export function BottomNav({ tab, onChange }) {
  const uid = useId()
  return (
    <nav className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-4" style={{ bottom: 'calc(14px + var(--sab))' }} aria-label="Navegação do app">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-negro/95 p-1.5 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_18px_40px_-12px_rgba(22,19,15,0.6)] ring-1 ring-white/[0.07] backdrop-blur-xl">
        {TABS.map((t) => {
          const active = t.id === tab
          const Icon = t.icon
          return (
            <motion.button
              layout
              key={t.id}
              aria-label={t.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(t.id)}
              transition={{ type: 'spring', stiffness: 520, damping: 42 }}
              className={cx(
                'relative flex h-12 items-center justify-center rounded-full transition-colors duration-150 active:scale-[0.96]',
                active ? 'pl-4 pr-5 text-white' : 'w-12 text-white/50 hover:text-white/85',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`guia-nav-${uid}`}
                  className="absolute inset-0 rounded-full bg-white/[0.13] ring-1 ring-inset ring-white/[0.09]"
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                />
              )}
              <motion.span layout="position" className="relative grid place-items-center">
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
              </motion.span>
              {active && (
                <motion.span
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.06 }}
                  className="relative ml-2 whitespace-nowrap text-[13px] font-medium tracking-[-0.005em]"
                >
                  {t.label}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

/* ---------- área rolável de cada aba ---------- */
export function Screen({ children, className }) {
  return (
    <div
      className={cx('no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain', className)}
      style={{ paddingTop: 'calc(52px + var(--sat))', paddingBottom: 'calc(116px + var(--sab))' }}
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

/* ---------- pílula de rede (offline / sincronizado) ---------- */
export function NetPill({ className, glass }) {
  const { stats, synced } = useGuia()
  const online = useOps((s) => s.online)
  const motionProps = {
    initial: { opacity: 0, scale: 0.92, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: -2 },
    transition: { duration: 0.24, ease },
  }
  return (
    <AnimatePresence mode="wait" initial={false}>
      {!online ? (
        <motion.span
          key="off"
          {...motionProps}
          className={cx('inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full pl-3 pr-3.5 text-[12px] font-semibold', glass ? 'bg-land/20 text-[#F6D08F] ring-1 ring-inset ring-land/30 backdrop-blur-md' : 'bg-land-tint text-[#8A5A12]', className)}
        >
          <span className="live-dot !size-[6px] text-land" />
          <span>Sem internet · <span className="font-mono tnum">{stats.queued}</span> na fila</span>
        </motion.span>
      ) : synced ? (
        <motion.span
          key={`sync-${synced.id}`}
          {...motionProps}
          className={cx('inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full pl-2.5 pr-3.5 text-[12px] font-semibold', glass ? 'bg-ok/25 text-[#9BE8C3] ring-1 ring-inset ring-ok/35 backdrop-blur-md' : 'bg-ok-tint text-ok', className)}
        >
          <CheckCircle size={15} weight="fill" />
          <span><span className="font-mono tnum">{synced.n}</span> {synced.n === 1 ? 'sincronizado' : 'sincronizados'}</span>
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

/* ---------- switch ---------- */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex h-11 shrink-0 items-center px-0.5"
    >
      <span className={cx('relative flex h-[30px] w-[50px] items-center rounded-full p-[3px] transition-colors duration-200', checked ? 'justify-end bg-negro' : 'justify-start bg-ink-4/45')}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 36 }} className={cx('size-6 rounded-full shadow-[0_2px_6px_rgba(19,19,22,.25)]', checked ? 'bg-lime' : 'bg-surface')} />
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
            {o.count != null && <span className={cx('font-mono text-[11.5px] tnum', active ? 'text-ink-3' : 'text-ink-4')}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- ícone de resultado com traço desenhado ---------- */
export function DrawnMark({ ok = true, size = 56, color, stroke = '#fff', delay = 0.1 }) {
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
