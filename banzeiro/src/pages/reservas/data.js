import { PASSENGERS, CHANNELS, depById, tourOf } from '../../data/mock'

export const SITUATIONS = {
  board: { label: 'A bordo', tone: 'ok' },
  wait: { label: 'Aguardando', tone: 'now' },
  absent: { label: 'Ausente', tone: 'muted' },
  alert: { label: 'Divergência', tone: 'alert' },
}

// Quais passageiros pertencem a cada divergência aberta (determinístico)
const PICK = {
  x1: (ps) => ps.slice(-2),
  x2: (ps) => ps.filter((p) => p.name === 'Sofía Fernández').slice(0, 1),
  x3: (ps) => ps.slice(0, 1),
  x4: (ps) => ps.slice(0, 3),
}

export function divergentIds(divergences) {
  const map = new Map()
  divergences.filter((d) => !d.resolved).forEach((d) => {
    const ps = PASSENGERS.filter((p) => p.depId === d.depId)
    ;(PICK[d.id]?.(ps) ?? ps.slice(0, 1)).forEach((p) => map.set(p.id, d.id))
  })
  return map
}

export function situationOf(p, status, divMap) {
  if (divMap.has(p.id)) return 'alert'
  const s = status[p.id]?.s
  return s === 'boarded' ? 'board' : s === 'noshow' ? 'absent' : 'wait'
}

const CH_ORDER = Object.keys(CHANNELS)

export function buildBookings(status, divergences) {
  const divMap = divergentIds(divergences)
  const by = new Map()
  PASSENGERS.forEach((p) => {
    if (!by.has(p.booking)) by.set(p.booking, [])
    by.get(p.booking).push(p)
  })
  const rows = [...by.entries()].map(([code, ps]) => {
    const dep = depById(ps[0].depId)
    const tour = tourOf(dep)
    const sits = ps.map((p) => situationOf(p, status, divMap))
    let sit
    if (sits.includes('alert')) sit = 'alert'
    else if (sits.every((x) => x === 'board')) sit = 'board'
    else if (sits.every((x) => x === 'absent')) sit = 'absent'
    else sit = 'wait'
    const boarded = sits.filter((x) => x === 'board').length
    return {
      code, lead: ps[0].name, pax: ps.length, channel: ps[0].channel, tour, start: dep.start, depId: dep.id,
      sit, label: sit === 'wait' && boarded > 0 ? 'Parcial' : SITUATIONS[sit].label, tone: sit === 'wait' && boarded > 0 ? 'now' : SITUATIONS[sit].tone,
    }
  })
  const rank = { alert: 0, wait: 1, board: 2, absent: 3 }
  return rows.sort((a, b) => rank[a.sit] - rank[b.sit] || a.start - b.start || a.code.localeCompare(b.code))
}

// Série mockada dos últimos 7 dias por canal; o último ponto é o total de hoje
const SHAPE = [0.62, 0.8, 0.55, 0.9, 0.72, 1.08, 1]
export function channelStats() {
  return CH_ORDER.map((key, i) => {
    const count = PASSENGERS.filter((p) => p.channel === key).length
    const series = SHAPE.map((m, j) => Math.max(1, Math.round(count * (m + Math.sin((j + 1) * (i + 2)) * 0.12))))
    series[6] = count
    return { key, count, series }
  })
}

export const SHORT_CH = { site: 'Site', whatsapp: 'WhatsApp', agencia: 'Agências', ota: 'Online', hotel: 'Hotel' }
