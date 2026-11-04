import { GUIDES, TOURS, SHIFTS, DAYS_OFF, WEEK } from '../../data/mock'

export const tourOf = (s) => TOURS.find((t) => t.id === s.tourId)
export const endOf = (s) => s.start + tourOf(s).duration
export const isOff = (gid, day) => !!gid && (DAYS_OFF[gid] || []).includes(day)
export const missingLangs = (g, s) => (g ? s.need.filter((l) => !g.langs.includes(l)) : [])
export const dayLabel = (d) => `${WEEK[d].short} ${WEEK[d].day}`
export const firstName = (g) => g.name.split(' ')[0]

export function overlaps(shifts, s, gid) {
  return shifts.some((o) => o.id !== s.id && o.guideId === gid && o.day === s.day && o.start < endOf(s) && s.start < endOf(o))
}

export const hoursOf = (shifts, g) => {
  const h = (list) => list.filter((s) => s.guideId === g.id).reduce((a, s) => a + tourOf(s).duration / 60, 0)
  return g.hours - h(SHIFTS) + h(shifts)
}
export const fmtH = (h) => String(Number(h.toFixed(1))).replace('.', ',')

/** Estado de um guia para uma saída: 'ok' | 'off' | 'lang' | 'overlap' */
export function fit(shifts, g, s, day = s.day) {
  if (isOff(g.id, day)) return 'off'
  if (missingLangs(g, s).length) return 'lang'
  if (shifts.some((o) => o.id !== s.id && o.guideId === g.id && o.day === day && o.start < s.start + tourOf(s).duration && s.start < endOf(o))) return 'overlap'
  return 'ok'
}

/** Plano de escala automática: ordem de preenchimento e destino. */
export function plan(shifts) {
  const work = shifts.map((s) => ({ ...s }))
  const pending = work.filter((s) => !s.guideId).sort((a, b) => a.day - b.day || a.start - b.start)
  const out = []
  pending.forEach((s) => {
    const ranked = GUIDES.filter((g) => !isOff(g.id, s.day) && !overlaps(work, s, g.id))
      .map((g) => ({ g, miss: missingLangs(g, s).length, h: hoursOf(work, g) }))
      .sort((a, b) => a.miss - b.miss || a.h - b.h)
    if (!ranked.length) return
    s.guideId = ranked[0].g.id
    out.push({ id: s.id, guideId: s.guideId })
  })
  return out
}

export function conflictsOf(shifts) {
  let lang = 0, overlap = 0, off = 0
  const open = shifts.filter((s) => !s.guideId).length
  shifts.forEach((s) => {
    if (!s.guideId) return
    const g = GUIDES.find((x) => x.id === s.guideId)
    if (missingLangs(g, s).length) lang++
    if (overlaps(shifts, s, s.guideId)) overlap++
    if (isOff(s.guideId, s.day)) off++
  })
  return { open, lang, overlap, off }
}

export const fmtT = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
export const dayShort = (d) => WEEK[d].short
