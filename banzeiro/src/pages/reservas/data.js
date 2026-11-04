import { PASSENGERS, TOURS, VEHICLES, CHANNELS, KIND, depById, tourOf, vehicleOf } from '../../data/mock'

export const SITUATIONS = {
  board: { label: 'A bordo', color: '#22A06B', tone: 'ok' },
  wait: { label: 'Aguardando', color: '#3D6DF5', tone: 'now' },
  absent: { label: 'Ausente', color: '#B9B9C2', tone: 'muted' },
  alert: { label: 'Divergência', color: '#EE6849', tone: 'alert' },
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
const TOUR_ORDER = ['t3', 't2', 't4', 't1', 't5', 't6', 't7']
const SIT_ORDER = ['board', 'wait', 'absent', 'alert']

export function buildGraph(status, divergences) {
  const divMap = divergentIds(divergences)
  const nodes = new Map()
  const links = new Map()
  const addNode = (id, name, col, color, order) => { if (!nodes.has(id)) nodes.set(id, { id, name, col, color, order, value: 0 }) }
  const addLink = (s, t) => {
    const k = `${s}>${t}`
    if (!links.has(k)) links.set(k, { source: s, target: t, value: 0 })
    links.get(k).value += 1
  }
  PASSENGERS.forEach((p) => {
    const dep = depById(p.depId)
    const tour = tourOf(dep)
    const veh = vehicleOf(dep)
    const sit = situationOf(p, status, divMap)
    const c = `c:${p.channel}`, t = `t:${tour.id}`, v = `v:${veh.id}`, s = `s:${sit}`
    addNode(c, CHANNELS[p.channel].label, 0, CHANNELS[p.channel].color, CH_ORDER.indexOf(p.channel))
    addNode(t, tour.short, 1, KIND[tour.kind].hex, TOUR_ORDER.indexOf(tour.id))
    addNode(v, veh.name, 2, '#43434B', VEHICLES.findIndex((x) => x.id === veh.id))
    addNode(s, SITUATIONS[sit].label, 3, SITUATIONS[sit].color, SIT_ORDER.indexOf(sit))
    addLink(c, t); addLink(t, v); addLink(v, s)
  })
  return { nodes: [...nodes.values()], links: [...links.values()], total: PASSENGERS.length, alertCount: [...divMap.keys()].length }
}

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
