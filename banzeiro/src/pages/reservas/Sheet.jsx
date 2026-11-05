import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { IconButton, useMedia, cx } from '../../components/ui'

const sheetEase = [0.2, 0.9, 0.3, 1]

function Header({ title, sub, onClose }) {
  return (
    <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-6">
      <div className="min-w-0">
        <h2 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-ink-3">{sub}</p>}
      </div>
      <IconButton label="Fechar" onClick={onClose} className="bg-sunken"><X size={18} /></IconButton>
    </div>
  )
}

/** Painel lateral no desktop, folha inferior no celular */
export function Sheet({ open, onClose, title, sub, children, footer }) {
  const desktop = useMedia('(min-width: 768px)')
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" className="fixed inset-0 z-[70] bg-negro/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
          <motion.aside
            key="sh" role="dialog" aria-label={title}
            className={cx('fixed z-[71] flex flex-col bg-surface shadow-lift', desktop ? 'inset-y-3 right-3 w-[420px] rounded-[28px]' : 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[28px]')}
            initial={desktop ? { x: '110%' } : { y: '100%' }} animate={{ x: 0, y: 0 }} exit={desktop ? { x: '110%' } : { y: '100%' }}
            transition={{ duration: 0.32, ease: sheetEase }}
          >
            <Header {...{ title, sub, onClose }} />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>
            {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function Modal({ open, onClose, title, sub, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="m" className="fixed inset-0 z-[70] grid place-items-center p-3 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-negro/40" onClick={onClose} />
          <motion.div
            role="dialog" aria-label={title}
            className="relative flex max-h-[92dvh] w-full max-w-[600px] flex-col rounded-[28px] bg-surface shadow-lift"
            initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }} transition={{ duration: 0.32, ease: sheetEase }}
          >
            <Header {...{ title, sub, onClose }} />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>
            {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
