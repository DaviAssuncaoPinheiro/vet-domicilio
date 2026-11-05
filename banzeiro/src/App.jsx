import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell'
import Painel from './pages/Painel'
import Embarque from './pages/Embarque'
import Escala from './pages/Escala'
import Reservas from './pages/Reservas'
import GuiaApp from './app/GuiaApp'
import Voucher from './app/Voucher'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Painel />} />
        <Route path="embarque" element={<Embarque />} />
        <Route path="embarque/:id" element={<Embarque />} />
        <Route path="escala" element={<Escala />} />
        <Route path="reservas" element={<Reservas />} />
      </Route>
      <Route path="guia/*" element={<GuiaApp />} />
      <Route path="voucher/:code" element={<Voucher />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
