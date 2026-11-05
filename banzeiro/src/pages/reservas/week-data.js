import { DEPARTURES, PASSENGERS, WEEK, depById, tourOf, vehicleOf, guideById } from '../../data/mock'

export const tm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
export const TODAY = 2
export const DAYS = WEEK

const SRC = [
  ['r1', 'd5'], ['r2', 'd4'], ['r3', 'd3'], ['r4', 'd7'], ['r5', 'd6'], ['r6', 'd1'], ['r7', 'd12'],
]

export const ROWS = SRC.map(([id, depId]) => {
  const dep = depById(depId)
  const tour = tourOf(dep)
  const veh = vehicleOf(dep)
  const guide = guideById(dep.guideIds[0])
  return { id, depId, dep, tour, veh, guide, label: tour.short, start: dep.start, cap: veh.capacity }
})

function rng(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
}

const FACT = [0.86, 0.8, 1, 0.58, 0.76, 0.9, 0.68]
const FORCE = { 'r3:5': 1, 'r2:4': 1, 'r1:5': 1, 'r6:3': 0.5 }

const r = rng(2026)
export const BASE = ROWS.map((row, ri) =>
  DAYS.map((_, di) => {
    if (di === TODAY) return row.dep.booked
    const k = `r${ri + 1}:${di}`
    if (FORCE[k] === 1) return row.cap
    if (FORCE[k] === 0.5) return Math.round(row.cap * 0.25)
    return Math.max(0, Math.min(row.cap, Math.round(row.cap * FACT[di] * (0.72 + 0.5 * r()))))
  }),
)

// Grupos de passageiros por saída (hoje usa as reservas reais; outros dias, gerados)
const POOL = PASSENGERS.filter((p, i, a) => a.findIndex((x) => x.name === p.name) === i)
const SIZES = [2, 1, 3, 2, 1, 4, 2, 1, 3]
const cache = {}
export function baseGroups(ri, di) {
  const k = `${ri}:${di}`
  if (cache[k]) return cache[k]
  const row = ROWS[ri]
  let out = []
  if (di === TODAY) {
    const by = new Map()
    PASSENGERS.filter((p) => p.depId === row.depId).forEach((p) => {
      if (!by.has(p.booking)) by.set(p.booking, [])
      by.get(p.booking).push(p)
    })
    out = [...by.entries()].map(([code, ps]) => ({ code, name: ps[0].name, pax: ps.length, lang: ps[0].lang }))
  } else {
    let left = BASE[ri][di]
    let i = (ri * 7 + di) * 5
    let n = 0
    while (left > 0) {
      const size = Math.min(left, SIZES[(i + n) % SIZES.length])
      const p = POOL[(i + n * 3) % POOL.length]
      out.push({ code: `EA-${50100 + ri * 70 + di * 9 + n}`, name: p.name, pax: size, lang: p.lang })
      left -= size
      n++
    }
  }
  cache[k] = out
  return out
}

// Planilha mockada da agência
export const IMPORT_FILE = 'rio-negro-viagens-novembro.xlsx'
export const IMPORT_ROWS = [
  { name: 'Lukas Schneider e Hannah Weber', row: 2, day: 3, pax: 2, lang: 'DE' },
  { name: 'Felix Wagner', row: 2, day: 3, pax: 1, lang: 'DE' },
  { name: 'Noah Becker e Emma Fischer', row: 0, day: 3, pax: 2, lang: 'DE' },
  { name: 'Marco Bianchi', row: 0, day: 4, pax: 1, lang: 'IT' },
  { name: 'Giulia Romano', row: 0, day: 4, pax: 1, lang: 'IT' },
  { name: 'Yuki Tanaka e Haruto Sato', row: 4, day: 3, pax: 2, lang: 'JA' },
  { name: 'Camille Laurent e Hugo Moreau', row: 6, day: 2, pax: 2, lang: 'FR', flag: 'Sem lugar · Pôr do sol Qua' },
  { name: 'Léa Dubois', row: 6, day: 3, pax: 1, lang: 'FR' },
  { name: 'Sophie Martin e Daniel Kim', row: 5, day: 4, pax: 2, lang: 'EN' },
  { name: 'Charlotte Evans', row: 3, day: 5, pax: 1, lang: 'EN' },
  { name: 'Oliver Hughes', row: 3, day: 5, pax: 1, lang: 'EN' },
  { name: 'Martina Ricci', row: 1, day: 6, pax: 1, lang: 'IT' },
]

export const keyOf = (ri, di) => `${ri}:${di}`
export function occOf(ri, di, extra) {
  const add = (extra[keyOf(ri, di)] ?? []).reduce((a, g) => a + g.pax, 0)
  const booked = BASE[ri][di] + add
  return { booked, cap: ROWS[ri].cap, free: Math.max(0, ROWS[ri].cap - booked), over: Math.max(0, booked - ROWS[ri].cap) }
}
export function weekTotals(extra) {
  let booked = 0, cap = 0, free = 0
  ROWS.forEach((_, ri) => DAYS.forEach((__, di) => {
    const o = occOf(ri, di, extra)
    cap += o.cap; booked += Math.min(o.booked, o.cap); free += o.free
  }))
  return { pct: Math.round((booked / cap) * 100), free }
}
