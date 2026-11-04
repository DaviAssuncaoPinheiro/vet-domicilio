import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cx, ease } from '../../components/ui'
import { depById, tourOf, vehicleOf, guideById } from '../../data/mock'
import { useOps, depStats, paxOfDep } from '../../store'
import { GuiaCtx, StatusBar, BottomNav } from './parts'
import Inicio from './Inicio'
import Scanner from './Scanner'
import Lista from './Lista'
import Perfil from './Perfil'

const SCREENS = { home: Inicio, scan: Scanner, list: Lista, me: Perfil }

/**
 * App do guia. mode 'embed' preenche o pai (dentro do PhoneFrame),
 * mode 'full' ocupa a tela toda com safe areas.
 */
export default function GuideApp({ depId = 'd7', mode = 'embed' }) {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('home')
  const [listFilter, setListFilter] = useState('all')
  const [released, setReleased] = useState(null)

  const status = useOps((s) => s.status)
  const online = useOps((s) => s.online)
  const now = useOps((s) => s.now)

  const dep = depById(depId) ?? depById('d7')
  const tour = tourOf(dep)
  const vehicle = vehicleOf(dep)
  const guide = guideById(dep.guideIds[0] ?? 'g6') ?? guideById('g6')
  const pax = useMemo(() => paxOfDep(dep.id), [dep.id])
  const stats = depStats(dep.id, status)

  // Sincronização: guarda a fila enquanto offline e mostra "N sincronizados" por 2s ao reconectar.
  const [synced, setSynced] = useState(null)
  const [lastSync, setLastSync] = useState(now)
  const queuedRef = useRef(0)
  const wasOnline = useRef(online)
  useEffect(() => {
    if (!online) queuedRef.current = stats.queued
  }, [online, stats.queued])
  useEffect(() => {
    if (online && !wasOnline.current) {
      const n = queuedRef.current
      if (n > 0) setSynced({ n, id: Date.now() })
      queuedRef.current = 0
    }
    wasOnline.current = online
  }, [online])
  useEffect(() => {
    if (online) setLastSync(now)
  }, [online, now, status])
  useEffect(() => {
    if (!synced) return
    const t = setTimeout(() => setSynced(null), 2000)
    return () => clearTimeout(t)
  }, [synced])

  // Em tela cheia não há ToastHost: o app mostra seu próprio aviso e limpa o toast global.
  const toast = useOps((s) => s.toast)
  useEffect(() => {
    if (mode === 'full' && toast) useOps.getState().clearToast()
  }, [mode, toast])

  const go = (t, opts = {}) => {
    if (opts.filter) setListFilter(opts.filter)
    setTab(t)
  }

  const ctx = { dep, tour, vehicle, guide, pax, stats, now, online, tab, go, listFilter, setListFilter, synced, lastSync, released, setReleased, mode }
  const Current = SCREENS[tab]
  const dark = tab === 'scan'

  const vars = mode === 'full'
    ? { '--sat': 'env(safe-area-inset-top, 0px)', '--sab': 'env(safe-area-inset-bottom, 0px)' }
    : { '--sat': '0px', '--sab': '10px' }

  return (
    <GuiaCtx.Provider value={ctx}>
      <div className={cx('relative isolate h-full w-full overflow-hidden text-ink transition-colors duration-300', dark ? 'bg-negro' : 'bg-frame')} style={vars}>
        <AnimatePresence initial={false}>
          <motion.div
            key={tab}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.34, ease } }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>

        {!dark && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-frame via-frame/80 to-frame/0" />}
        <StatusBar light={dark} />
        <BottomNav tab={tab} onChange={(t) => go(t)} />
        {mode === 'embed' && <div className={cx('pointer-events-none absolute bottom-[7px] left-1/2 z-[60] h-[5px] w-[124px] -translate-x-1/2 rounded-full transition-colors', dark ? 'bg-white/70' : 'bg-ink/80')} />}
      </div>
    </GuiaCtx.Provider>
  )
}
