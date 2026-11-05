import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import { KIND, LANGS, fmt } from '../data/mock'

export const cx = clsx
export const ease = [0.22, 1, 0.36, 1]

/** Card branco base. */
export function Card({ className, children, as: As = 'section', ...rest }) {
  return (
    <As className={cx('bg-surface rounded-[24px] shadow-soft', className)} {...rest}>
      {children}
    </As>
  )
}

/** Entrada com stagger. Use <Reveal i={n}> */
export function Reveal({ i = 0, className, children, y = 8 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease, delay: i * 0.04 }}
    >
      {children}
    </motion.div>
  )
}

/** Pílula clara (nav superior, filtros). active = fundo sunken + sombra interna */
export function Pill({ active, className, children, icon: Icon, ...rest }) {
  return (
    <button
      className={cx(
        'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-[background,color,transform] duration-150 active:scale-[0.97]',
        active ? 'bg-frame text-ink shadow-[inset_0_1px_2px_rgba(19,19,22,0.08)] ring-1 ring-black/[0.04]' : 'bg-surface text-ink-2 shadow-pill hover:text-ink',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={16} weight={active ? 'bold' : 'regular'} />}
      {children}
    </button>
  )
}

/** Botão primário negro / secundário claro / lime */
export function Button({ variant = 'dark', size = 'md', className, children, icon: Icon, iconRight: IconR, ...rest }) {
  const v = {
    dark: 'bg-negro text-white shadow-dark hover:bg-negro-2',
    light: 'bg-surface text-ink shadow-pill hover:bg-frame',
    lime: 'bg-lime text-negro hover:brightness-[0.97]',
    ghost: 'text-ink-2 hover:bg-sunken',
    now: 'bg-now text-white hover:brightness-110 shadow-[0_8px_20px_-8px_rgba(61,109,245,.6)]',
  }[variant]
  const s = { sm: 'h-8 px-3 text-[12.5px] gap-1.5', md: 'h-10 px-4 text-[13px] gap-2', lg: 'h-12 px-5 text-[14px] gap-2' }[size]
  return (
    <button className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-medium transition-[background,transform,filter] duration-150 active:scale-[0.97] disabled:opacity-40', v, s, className)} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} weight="bold" />}
      {children}
      {IconR && <IconR size={size === 'sm' ? 14 : 16} weight="bold" />}
    </button>
  )
}

/** Botão de ícone circular (rail, ações) */
export function IconButton({ active, dark, className, children, label, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'grid size-10 shrink-0 place-items-center rounded-full transition-[background,color,transform] duration-150 active:scale-95',
        dark ? 'bg-negro text-white shadow-dark' : active ? 'bg-surface text-ink shadow-pill' : 'text-ink-3 hover:bg-surface hover:text-ink hover:shadow-pill',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Chip de status branco com ponto, como "• Approved" das referências */
export function StatusChip({ children, tone = 'ink', live, className, onDark }) {
  const dot = { ink: 'text-ink', ok: 'text-ok', alert: 'text-alert', now: 'text-now', boat: 'text-boat', land: 'text-land', muted: 'text-ink-4', lime: 'text-lime' }[tone]
  return (
    <span className={cx('inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[11px] font-semibold', onDark ? 'bg-white/10 text-white' : 'bg-surface text-ink shadow-[0_1px_2px_rgba(19,19,22,.08)]', className)}>
      {live ? <span className={cx('live-dot !size-[6px]', dot)} /> : <span className={cx('size-[5px] rounded-full bg-current', dot)} />}
      {children}
    </span>
  )
}

/** Tag de idioma */
export function LangTag({ code, missing, className }) {
  return (
    <span
      title={LANGS[code]?.label}
      className={cx(
        'inline-flex h-[20px] items-center rounded-md px-1.5 font-mono text-[10.5px] font-semibold tracking-wide',
        missing ? 'bg-alert-tint text-alert' : 'bg-sunken text-ink-2',
        className,
      )}
    >
      {code}
    </span>
  )
}

/** Código de país (bandeiras emoji não renderizam no Windows) */
export function CountryCode({ code, className }) {
  return <span className={cx('inline-flex h-[18px] items-center rounded-[5px] border border-line px-1 font-mono text-[10px] font-semibold text-ink-3', className)}>{code}</span>
}

export function KindDot({ kind, className }) {
  return <span className={cx('inline-block size-2 rounded-full', className)} style={{ background: KIND[kind].color }} />
}

/** Avatar com iniciais (sem fotos de banco) */
export function Avatar({ initials, hue = '#14120F', size = 32, ring, className }) {
  return (
    <span
      className={cx('inline-grid shrink-0 place-items-center rounded-full font-semibold text-white', ring && 'ring-2 ring-surface', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: hue }}
    >
      {initials}
    </span>
  )
}

export function AvatarStack({ people, max = 3, size = 32 }) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span key={p.id} className={cx(i > 0 && '-ml-2.5')}>
          <Avatar initials={p.initials} hue={p.hue} size={size} ring />
        </span>
      ))}
      {rest > 0 && (
        <span className="-ml-2.5 grid place-items-center rounded-full bg-surface text-[11px] font-semibold text-ink-2 shadow-pill ring-2 ring-surface" style={{ width: size, height: size }}>
          {rest}+
        </span>
      )}
    </div>
  )
}

/** Número que conta até o valor */
export function CountUp({ value, duration = 0.7, format = (n) => Math.round(n).toLocaleString('pt-BR'), className }) {
  const ref = useRef(null)
  const prev = useRef(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce) { node.textContent = format(value); prev.current = value; return }
    const c = animate(prev.current, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { node.textContent = format(v) } })
    prev.current = value
    return () => c.stop()
  }, [value])
  return <span ref={ref} className={cx('tnum', className)}>{format(0)}</span>
}

/** Controle segmentado em pílula */
export function Segmented({ options, value, onChange, className, size = 'md' }) {
  return (
    <div className={cx('relative inline-flex rounded-full bg-sunken p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx('relative z-10 rounded-full font-medium transition-colors duration-150', size === 'sm' ? 'h-7 px-3 text-[12px]' : 'h-8 px-3.5 text-[12.5px]', active ? 'text-ink' : 'text-ink-3 hover:text-ink-2')}
          >
            {active && <motion.span layoutId={`seg-${options.map((x) => x.value).join('')}`} className="absolute inset-0 -z-10 rounded-full bg-surface shadow-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Barra de progresso fina */
export function Progress({ value, max = 1, color = 'var(--color-ink)', track = 'var(--color-sunken)', className, height = 4 }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100
  return (
    <div className={cx('w-full overflow-hidden rounded-full', className)} style={{ height, background: track }}>
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease }} />
    </div>
  )
}

export function Time({ m, className }) {
  return <span className={cx('font-mono tnum', className)}>{fmt(m)}</span>
}

/** Título de seção de card */
export function CardHeader({ title, sub, right, className }) {
  return (
    <div className={cx('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {sub && <p className="mt-0.5 truncate text-[12.5px] text-ink-3">{sub}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  )
}

/** Moldura de celular (para mostrar o app no desktop) */
export function PhoneFrame({ children, className, dark }) {
  return (
    <div className={cx('relative mx-auto w-[372px] shrink-0 rounded-[54px] bg-negro p-[10px] shadow-[0_40px_80px_-30px_rgba(22,19,15,.55),0_0_0_1px_rgba(0,0,0,.6)]', className)}>
      <div className={cx('relative h-[780px] overflow-hidden rounded-[44px]', dark ? 'bg-negro' : 'bg-frame')}>
        <div className="pointer-events-none absolute left-1/2 top-[10px] z-50 h-[30px] w-[108px] -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  )
}

/** Toast global escuro */
export function ToastHost({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 4200)
    return () => clearTimeout(t)
  }, [toast?.id])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4 md:bottom-8">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease }}
            className="pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-full bg-negro py-2 pl-4 pr-2 text-[13px] text-white shadow-dark"
          >
            <span className="size-1.5 rounded-full bg-lime" />
            <span>{toast.text}</span>
            {toast.action ? (
              <button onClick={() => { toast.action.fn(); onClose() }} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold hover:bg-white/15">{toast.action.label}</button>
            ) : <span className="w-2" />}
            <motion.span className="absolute bottom-0 left-0 h-[2px] bg-white/25" initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: 4.2, ease: 'linear' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Hook de media query */
export function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const fn = () => setM(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [q])
  return m
}
