import { create } from 'zustand'
import { BASE_NOW, DEPARTURES, DIVERGENCES, PASSENGERS, SHIFTS, initialStatus, depById } from './data/mock'

// Relógio simulado: 1 minuto de operação a cada 8 segundos reais.
const SPEED = 8000

export const useOps = create((set, get) => ({
  now: BASE_NOW,
  online: true,
  status: initialStatus(),
  divergences: DIVERGENCES.map((d) => ({ ...d, resolved: false })),
  shifts: SHIFTS,
  toast: null,
  lastScan: null, // { paxId, ok, reason, t }

  tick: () => set((s) => {
    const now = Math.min(s.now + 1, 23 * 60)
    // Embarque automático das demais saídas conforme o relógio avança (a d7 fica para a demonstração)
    let status = s.status
    DEPARTURES.forEach((d) => {
      if (d.id === 'd7' || now < d.start - 45) return
      const pax = PASSENGERS.filter((p) => p.depId === d.id)
      const t = Math.min(1, (now - (d.start - 45)) / 45)
      const target = now >= d.start ? pax.length : Math.round(pax.length * 0.94 * (1 - Math.pow(1 - t, 2)))
      let boarded = pax.filter((p) => status[p.id]?.s === 'boarded').length
      for (const p of pax) {
        if (boarded >= target) break
        if (status[p.id]?.s === 'waiting') {
          if (status === s.status) status = { ...s.status }
          status[p.id] = { s: 'boarded', at: now, via: 'qr', synced: s.online }
          boarded++
        }
      }
    })
    return status === s.status ? { now } : { now, status }
  }),

  setOnline: (online) => set((s) => {
    if (!online) return { online }
    // ao reconectar, sincroniza a fila
    const status = { ...s.status }
    let n = 0
    Object.keys(status).forEach((k) => { if (status[k].s === 'boarded' && status[k].synced === false) { status[k] = { ...status[k], synced: true }; n++ } })
    return { online, status, toast: n ? { id: Date.now(), text: `${n} ${n === 1 ? 'leitura sincronizada' : 'leituras sincronizadas'}` } : s.toast }
  }),

  board: (paxId, via = 'qr') => {
    const s = get()
    const cur = s.status[paxId]
    if (!cur) return { ok: false, reason: 'not_found' }
    if (cur.s === 'boarded') {
      const res = { paxId, ok: false, reason: 'already', at: cur.at, t: Date.now() }
      set({ lastScan: res })
      return res
    }
    const status = { ...s.status, [paxId]: { s: 'boarded', at: s.now, via, synced: s.online } }
    const res = { paxId, ok: true, t: Date.now() }
    set({ status, lastScan: res })
    return res
  },

  unboard: (paxId) => set((s) => ({ status: { ...s.status, [paxId]: { s: 'waiting' } } })),
  markNoShow: (paxId) => set((s) => ({ status: { ...s.status, [paxId]: { s: 'noshow' } } })),

  resolveDivergence: (id) => set((s) => ({
    divergences: s.divergences.map((d) => (d.id === id ? { ...d, resolved: true } : d)),
    toast: { id: Date.now(), text: 'Divergência resolvida' },
  })),

  moveShift: (shiftId, patch) => set((s) => ({ shifts: s.shifts.map((x) => (x.id === shiftId ? { ...x, ...patch } : x)) })),
  setShifts: (shifts) => set({ shifts }),

  showToast: (text, action) => set({ toast: { id: Date.now(), text, action } }),
  clearToast: () => set({ toast: null }),
}))

let timer
export function startClock() {
  if (timer) return
  timer = setInterval(() => useOps.getState().tick(), SPEED)
}

// ---------- Seletores ----------
export function depStats(depId, status) {
  const pax = PASSENGERS.filter((p) => p.depId === depId)
  let boarded = 0, noshow = 0, queued = 0
  pax.forEach((p) => {
    const st = status[p.id]
    if (st?.s === 'boarded') { boarded++; if (st.synced === false) queued++ }
    else if (st?.s === 'noshow') noshow++
  })
  return { total: pax.length, boarded, noshow, waiting: pax.length - boarded - noshow, queued }
}

// 'done' | 'live' | 'boarding' | 'scheduled'
export function depPhase(dep, now) {
  if (now >= dep.end) return 'done'
  if (now >= dep.start) return 'live'
  if (now >= dep.start - 45) return 'boarding'
  return 'scheduled'
}

export const PHASE_LABEL = { done: 'Concluída', live: 'Em andamento', boarding: 'Embarque aberto', scheduled: 'Agendada' }

export function dayTotals(status, now) {
  let pax = 0, boarded = 0, queued = 0
  PASSENGERS.forEach((p) => {
    pax++
    const st = status[p.id]
    if (st?.s === 'boarded') { boarded++; if (st.synced === false) queued++ }
  })
  const live = DEPARTURES.filter((d) => depPhase(d, now) === 'live').length
  return { pax, boarded, queued, departures: DEPARTURES.length, live }
}

export const paxOfDep = (depId) => PASSENGERS.filter((p) => p.depId === depId)
export { depById }
