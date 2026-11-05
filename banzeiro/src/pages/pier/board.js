import { DEPARTURES, KIND, fmt, tourOf, vehicleOf, guideById } from '../../data/mock'
import { depStats, depPhase } from '../../store'

export const SLOTS = 8

// Larguras em tiles por coluna
export const COLS = [
  { key: 'time', label: 'Horário', w: 5 },
  { key: 'tour', label: 'Passeio', w: 18 },
  { key: 'vehicle', label: 'Embarcação', w: 15 },
  { key: 'guide', label: 'Guia', w: 14 },
  { key: 'onboard', label: 'A bordo', w: 5, align: 'right' },
  { key: 'status', label: 'Situação', w: 10 },
]

const TOUR_LABEL = {
  t1: 'Encontro das Águas',
  t2: 'Águas e Janauari',
  t3: 'Botos e comunidade',
  t4: 'Pôr do sol',
  t5: 'Manaus histórica',
  t6: 'Novo Airão',
}

function tourLabel(d) {
  const t = tourOf(d)
  if (TOUR_LABEL[t.id]) return TOUR_LABEL[t.id]
  const to = d.route?.split(' para ')[1]
  const withTo = to ? `Transfer ${to}` : 'Transfer'
  return withTo.length <= 18 ? withTo : 'Transfer'
}

function guideLabel(d) {
  const firsts = d.guideIds.map(guideById).filter(Boolean).map((g) => g.name.split(' ').slice(0, -1).join(' '))
  if (firsts.length === 0) return ''
  const joined = firsts.join(' e ')
  return joined.length <= 14 ? joined : firsts.map((f) => f.split(' ')[0]).join(' e ')
}

export const TONE = {
  boarding: { label: 'Embarcando', color: 'var(--color-gold)' },
  live: { label: 'Em rota', color: 'color-mix(in srgb, var(--color-ok) 62%, white)' },
  scheduled: { label: 'Agendada', color: 'color-mix(in srgb, white 60%, transparent)' },
  done: { label: 'Encerrada', color: 'color-mix(in srgb, white 32%, transparent)' },
  full: { label: 'Lotado', color: 'color-mix(in srgb, var(--color-alert) 78%, white)' },
}

const EMPTY = { key: 'empty', kind: null, tone: null, phase: null, cells: { time: '', tour: '', vehicle: '', guide: '', onboard: '', status: '' } }

/** Monta as linhas do painel: saídas de hoje por horário, janela de SLOTS linhas. */
export function buildRows(now, status) {
  const list = DEPARTURES
    .filter((d) => !(now >= d.end && now - d.end > 60))
    .sort((a, b) => a.start - b.start)
  const firstUp = list.findIndex((d) => now < d.start)
  const maxStart = Math.max(0, list.length - SLOTS)
  const from = firstUp === -1 ? maxStart : Math.max(0, Math.min(firstUp - 3, maxStart))

  const rows = list.slice(from, from + SLOTS).map((d) => {
    const v = vehicleOf(d)
    const st = depStats(d.id, status)
    const phase = depPhase(d, now)
    const tone = phase === 'scheduled' && d.booked >= v.capacity ? 'full' : phase
    return {
      key: d.id,
      dep: d,
      kind: tourOf(d).kind,
      phase,
      tone,
      vehicleName: v.name,
      tourName: tourLabel(d),
      guideName: guideLabel(d),
      boarded: st.boarded,
      total: st.total,
      cells: {
        time: fmt(d.start),
        tour: tourLabel(d),
        vehicle: v.name,
        guide: guideLabel(d),
        onboard: `${st.boarded}/${st.total}`,
        status: TONE[tone].label,
      },
    }
  })
  while (rows.length < SLOTS) rows.push(EMPTY)
  return rows
}

export const kindColor = (k) => (k ? KIND[k].color : 'transparent')
