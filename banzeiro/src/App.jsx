import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell'
import Painel from './pages/Painel'

const Embarque = lazy(() => import('./pages/Embarque'))
const Escala = lazy(() => import('./pages/Escala'))
const Reservas = lazy(() => import('./pages/Reservas'))
const GuiaApp = lazy(() => import('./app/GuiaApp'))
const Voucher = lazy(() => import('./app/Voucher'))

// pré-carrega as demais telas logo depois da primeira pintura
if (typeof window !== 'undefined') {
  const warm = () => { import('./pages/Embarque'); import('./pages/Escala'); import('./pages/Reservas'); import('./app/GuiaApp'); import('./app/Voucher') }
  ;(window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(warm)
}

const S = (el) => <Suspense fallback={<div className="min-h-[60vh]" />}>{el}</Suspense>

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Painel />} />
        <Route path="embarque" element={S(<Embarque />)} />
        <Route path="embarque/:id" element={S(<Embarque />)} />
        <Route path="escala" element={S(<Escala />)} />
        <Route path="reservas" element={S(<Reservas />)} />
      </Route>
      <Route path="guia/*" element={S(<GuiaApp />)} />
      <Route path="voucher/:code" element={S(<Voucher />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
