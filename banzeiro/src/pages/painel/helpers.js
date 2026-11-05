import { DEPARTURES, VEHICLES } from '../../data/mock'
import { depStats, depPhase } from '../../store'

export const DAY_START = 6 * 60
export const DAY_END = 20 * 60

export const PHASE_TONE = { done: 'muted', live: 'ink', boarding: 'ok', scheduled: 'muted' }
export const PHASE = { done: 'Encerrada', live: 'Em rota', boarding: 'Embarcando', scheduled: 'Agendada' }

// Horário sem zero à esquerda: 7:30, 10:05
export const t = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`

// Bloqueios de agenda (manutenção, revisão)
export const UNAVAILABLE = [
  { id: 'm1', vehicleId: 'v1', start: 18 * 60, end: 20 * 60, label: 'Manutenção' },
]

export const clamp01 = (n) => Math.max(0, Math.min(1, n))

/**
 * Estatística de uma saída para exibição no painel.
 * A saída em foco (d7) vem sempre do store. As demais, quando o relógio
 * simulado avança além do embarque e o store ainda não tem leituras,
 * recebem um embarque determinístico para o painel não mostrar "0 de 9".
 */
export function viewStats(dep, status, now) {
  const s = depStats(dep.id, status)
  const phase = depPhase(dep, now)
  if (dep.id === 'd7' || s.boarded > 0 || phase === 'scheduled') return { ...s, phase }
  const t = clamp01((now - (dep.start - 45)) / 45)
  const target = phase === 'boarding' ? s.total * 0.94 : s.total
  const boarded = Math.min(s.total, Math.round(target * (1 - Math.pow(1 - t, 2))))
  return { ...s, boarded, waiting: s.total - boarded, phase }
}

export function vehicleUse(vehicleId) {
  const used = DEPARTURES.filter((d) => d.vehicleId === vehicleId).reduce(
    (a, d) => a + Math.max(0, Math.min(d.end, DAY_END) - Math.max(d.start, DAY_START)),
    0,
  )
  return used / (DAY_END - DAY_START)
}

export const vehicleById = (id) => VEHICLES.find((v) => v.id === id)

export function countdown(mins) {
  if (mins <= 0) return null
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${String(m).padStart(2, '0')}` : `${h}h`
}

export const range = (d) => `${t(d.start)} a ${t(d.end)}`
