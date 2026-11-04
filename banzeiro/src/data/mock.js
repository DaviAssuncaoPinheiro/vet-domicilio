// Dados 100% mockados. Dia de operação fixo: quarta, 4 de novembro.
// Horários em minutos desde 00:00.

export const COMPANY = {
  name: 'Encontro das Águas Turismo',
  short: 'Encontro das Águas',
  city: 'Manaus, AM',
  pier: 'Porto da Ceasa',
}

export const USER = { name: 'Carla Rezende', role: 'Coordenação de operação', initials: 'CR' }

export const TODAY_LABEL = 'Quarta, 4 de novembro'
export const BASE_NOW = 10 * 60 + 5 // 10:05

export const KIND = {
  boat: { label: 'Lancha', color: 'var(--color-boat)', tint: 'var(--color-boat-tint)', hex: '#6F66F0', tintHex: '#EDEBFE' },
  land: { label: 'Terrestre', color: 'var(--color-land)', tint: 'var(--color-land-tint)', hex: '#EFB44F', tintHex: '#FDF2DC' },
  transfer: { label: 'Transfer', color: 'var(--color-transfer)', tint: 'var(--color-transfer-tint)', hex: '#3DBE83', tintHex: '#E2F6EC' },
}

export const LANGS = {
  PT: { label: 'Português', short: 'PT' },
  EN: { label: 'Inglês', short: 'EN' },
  ES: { label: 'Espanhol', short: 'ES' },
  FR: { label: 'Francês', short: 'FR' },
  DE: { label: 'Alemão', short: 'DE' },
  IT: { label: 'Italiano', short: 'IT' },
  JA: { label: 'Japonês', short: 'JA' },
}

export const CHANNELS = {
  site: { label: 'Site próprio', color: '#131316' },
  whatsapp: { label: 'WhatsApp', color: '#3DBE83' },
  agencia: { label: 'Agências parceiras', color: '#6F66F0' },
  ota: { label: 'Plataformas online', color: '#3D6DF5' },
  hotel: { label: 'Balcão de hotel', color: '#EFB44F' },
}

export const TOURS = [
  { id: 't1', name: 'Encontro das Águas', short: 'Encontro das Águas', kind: 'boat', duration: 270, meeting: 'Porto da Ceasa · Píer 2', includes: ['Encontro dos rios', 'Botos', 'Vitória-régia'] },
  { id: 't2', name: 'Encontro das Águas e Lago Janauari', short: 'Águas + Janauari', kind: 'boat', duration: 450, meeting: 'Porto da Ceasa · Píer 2', includes: ['Encontro dos rios', 'Lago Janauari', 'Almoço regional'] },
  { id: 't3', name: 'Arquipélago de Anavilhanas', short: 'Anavilhanas', kind: 'boat', duration: 570, meeting: 'Marina do Davi', includes: ['Arquipélago', 'Praia fluvial', 'Almoço'] },
  { id: 't4', name: 'Pôr do sol no Rio Negro', short: 'Pôr do sol', kind: 'boat', duration: 120, meeting: 'Marina do Davi', includes: ['Pôr do sol', 'Petiscos'] },
  { id: 't5', name: 'Manaus histórica', short: 'City tour', kind: 'land', duration: 210, meeting: 'Saída dos hotéis', includes: ['Teatro Amazonas', 'Mercado Adolpho Lisboa', 'Palácio Rio Negro'] },
  { id: 't6', name: 'Cachoeiras de Presidente Figueiredo', short: 'Pres. Figueiredo', kind: 'land', duration: 690, meeting: 'Saída dos hotéis', includes: ['Cachoeira da Iracema', 'Caverna do Maroaga'] },
  { id: 't7', name: 'Transfer aeroporto', short: 'Transfer', kind: 'transfer', duration: 50, meeting: 'Aeroporto Eduardo Gomes', includes: [] },
]

// layout: fileiras de assentos para a planta. cols: [esq, dir] assentos por lado do corredor.
export const VEHICLES = [
  { id: 'v1', name: 'Lancha Pirarucu', kind: 'boat', capacity: 30, plate: 'AM-4412', skipper: 'Zé Ribamar', rows: 8, cols: [2, 2], extra: 2 },
  { id: 'v2', name: 'Lancha Tucunaré', kind: 'boat', capacity: 24, plate: 'AM-3307', skipper: 'Francisco Neves', rows: 6, cols: [2, 2], extra: 0 },
  { id: 'v3', name: 'Lancha Boto', kind: 'boat', capacity: 18, plate: 'AM-2981', skipper: 'Edilson Prata', rows: 6, cols: [1, 2], extra: 0 },
  { id: 'v4', name: 'Lancha Jaraqui', kind: 'boat', capacity: 12, plate: 'AM-1776', skipper: 'Antônio Lira', rows: 6, cols: [1, 1], extra: 0 },
  { id: 'v5', name: 'Van 01', kind: 'land', capacity: 15, plate: 'QZB-2F31', skipper: 'Wellington Cruz', rows: 5, cols: [1, 2], extra: 0 },
  { id: 'v6', name: 'Micro-ônibus', kind: 'land', capacity: 28, plate: 'QZC-8A10', skipper: 'Rosângela Dias', rows: 7, cols: [2, 2], extra: 0 },
  { id: 'v7', name: 'Van 02', kind: 'transfer', capacity: 15, plate: 'QZB-5H02', skipper: 'Marcelo Paiva', rows: 5, cols: [1, 2], extra: 0 },
  { id: 'v8', name: 'Sedan executivo', kind: 'transfer', capacity: 4, plate: 'QZA-0K77', skipper: 'Joaquim Reis', rows: 2, cols: [1, 1], extra: 0 },
]

export const GUIDES = [
  { id: 'g1', name: 'Ana Clara Lins', initials: 'AL', langs: ['PT', 'EN', 'ES'], hue: '#6F66F0', hours: 34, max: 44, rating: 4.9 },
  { id: 'g2', name: 'Raimundo Sá', initials: 'RS', langs: ['PT', 'EN'], hue: '#EE6849', hours: 40, max: 44, rating: 4.8 },
  { id: 'g3', name: 'Jéssica Tavares', initials: 'JT', langs: ['PT', 'FR', 'EN'], hue: '#3D6DF5', hours: 28, max: 44, rating: 4.9 },
  { id: 'g4', name: 'Marcos Baré', initials: 'MB', langs: ['PT', 'EN', 'DE'], hue: '#3DBE83', hours: 42, max: 44, rating: 5.0 },
  { id: 'g5', name: 'Luiza Mendonça', initials: 'LM', langs: ['PT', 'ES', 'IT'], hue: '#EFB44F', hours: 22, max: 44, rating: 4.7 },
  { id: 'g6', name: 'Thiago Kambeba', initials: 'TK', langs: ['PT', 'EN'], hue: '#16130F', hours: 30, max: 44, rating: 4.8 },
  { id: 'g7', name: 'Helena Araújo', initials: 'HA', langs: ['PT', 'EN', 'IT'], hue: '#C2185B', hours: 36, max: 44, rating: 4.9 },
  { id: 'g8', name: 'Kenji Moura', initials: 'KM', langs: ['PT', 'JA', 'EN'], hue: '#0E9AA7', hours: 18, max: 44, rating: 4.8 },
]

// Saídas de hoje
export const DEPARTURES = [
  { id: 'd1', code: 'S-2201', tourId: 't6', vehicleId: 'v6', start: 6 * 60 + 30, guideIds: ['g7'], booked: 21 },
  { id: 'd2', code: 'S-2202', tourId: 't7', vehicleId: 'v8', start: 6 * 60 + 10, guideIds: [], booked: 3, route: 'Aeroporto para Hotel Tropical' },
  { id: 'd3', code: 'S-2203', tourId: 't3', vehicleId: 'v1', start: 7 * 60 + 30, guideIds: ['g4', 'g5'], booked: 27 },
  { id: 'd4', code: 'S-2204', tourId: 't2', vehicleId: 'v2', start: 8 * 60, guideIds: ['g1'], booked: 22 },
  { id: 'd5', code: 'S-2205', tourId: 't1', vehicleId: 'v3', start: 8 * 60 + 30, guideIds: ['g2'], booked: 16 },
  { id: 'd6', code: 'S-2206', tourId: 't5', vehicleId: 'v5', start: 9 * 60, guideIds: ['g3'], booked: 11 },
  { id: 'd7', code: 'S-2207', tourId: 't1', vehicleId: 'v4', start: 10 * 60 + 30, guideIds: ['g6'], booked: 12, focus: true },
  { id: 'd8', code: 'S-2208', tourId: 't7', vehicleId: 'v7', start: 11 * 60 + 20, guideIds: [], booked: 9, route: 'Aeroporto para Centro' },
  { id: 'd9', code: 'S-2209', tourId: 't7', vehicleId: 'v7', start: 13 * 60 + 45, guideIds: [], booked: 6, route: 'Hotéis para Marina do Davi' },
  { id: 'd10', code: 'S-2210', tourId: 't2', vehicleId: 'v3', start: 14 * 60, guideIds: ['g2'], booked: 14 },
  { id: 'd11', code: 'S-2211', tourId: 't5', vehicleId: 'v5', start: 14 * 60 + 30, guideIds: [], booked: 9 },
  { id: 'd12', code: 'S-2212', tourId: 't4', vehicleId: 'v2', start: 16 * 60 + 30, guideIds: ['g1'], booked: 26 },
  { id: 'd13', code: 'S-2213', tourId: 't7', vehicleId: 'v6', start: 18 * 60 + 40, guideIds: [], booked: 19, route: 'Marina do Davi para hotéis' },
].map((d) => {
  const tour = TOURS.find((t) => t.id === d.tourId)
  return { ...d, end: d.start + tour.duration }
})

// ---------- Passageiros (gerados de forma determinística) ----------
const PEOPLE = [
  ['Emily Carter', 'US', 'EN'], ['Jacob Miller', 'US', 'EN'], ['Olivia Brooks', 'US', 'EN'], ['Ryan Mitchell', 'US', 'EN'],
  ['Lukas Schneider', 'DE', 'DE'], ['Hannah Weber', 'DE', 'DE'], ['Felix Wagner', 'DE', 'DE'],
  ['Sofía Fernández', 'AR', 'ES'], ['Mateo González', 'AR', 'ES'], ['Valentina Ruiz', 'AR', 'ES'], ['Ignacio Rojas', 'CL', 'ES'],
  ['Lucía Martín', 'ES', 'ES'], ['Pablo Sánchez', 'ES', 'ES'],
  ['Camille Laurent', 'FR', 'FR'], ['Hugo Moreau', 'FR', 'FR'], ['Léa Dubois', 'FR', 'FR'],
  ['Giulia Romano', 'IT', 'IT'], ['Marco Bianchi', 'IT', 'IT'],
  ['Yuki Tanaka', 'JP', 'JA'], ['Haruto Sato', 'JP', 'JA'],
  ['Charlotte Evans', 'GB', 'EN'], ['Oliver Hughes', 'GB', 'EN'],
  ['Mariana Costa', 'BR', 'PT'], ['Pedro Albuquerque', 'BR', 'PT'], ['Beatriz Nogueira', 'BR', 'PT'], ['Rafael Monteiro', 'BR', 'PT'],
  ['Juliana Pires', 'BR', 'PT'], ['Gabriel Tavares', 'BR', 'PT'], ['Larissa Bastos', 'BR', 'PT'], ['Diego Farias', 'BR', 'PT'],
  ['Amanda Queiroz', 'BR', 'PT'], ['Thiago Barreto', 'BR', 'PT'], ['Renata Lopes', 'BR', 'PT'], ['Vinícius Prado', 'BR', 'PT'],
  ['Isabela Moraes', 'BR', 'PT'], ['Caio Medeiros', 'BR', 'PT'], ['Noah Becker', 'DE', 'DE'], ['Emma Fischer', 'DE', 'EN'],
  ['Sophie Martin', 'FR', 'FR'], ['Aiko Suzuki', 'JP', 'JA'], ['Martina Ricci', 'IT', 'IT'], ['Daniel Kim', 'US', 'EN'],
]
export const HOTELS = ['Hotel Tropical', 'Juma Ópera', 'Blue Tree Manaus', 'Hotel Villa Amazônia', 'Intercity Manaus', 'Novotel Manaus', 'Casa Hostel Centro']

function rng(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
}

export const COUNTRY_FLAG = { US: '🇺🇸', DE: '🇩🇪', AR: '🇦🇷', CL: '🇨🇱', ES: '🇪🇸', FR: '🇫🇷', IT: '🇮🇹', JP: '🇯🇵', GB: '🇬🇧', BR: '🇧🇷' }
export const COUNTRY_NAME = { US: 'Estados Unidos', DE: 'Alemanha', AR: 'Argentina', CL: 'Chile', ES: 'Espanha', FR: 'França', IT: 'Itália', JP: 'Japão', GB: 'Reino Unido', BR: 'Brasil' }

function seatLabels(vehicle) {
  const labels = []
  const letters = 'ABCDEF'
  for (let r = 1; r <= vehicle.rows; r++) {
    const n = vehicle.cols[0] + vehicle.cols[1]
    for (let c = 0; c < n; c++) labels.push(`${r}${letters[c]}`)
  }
  for (let e = 1; e <= vehicle.extra; e++) labels.push(`P${e}`)
  return labels.slice(0, vehicle.capacity)
}
export { seatLabels }

const channelKeys = Object.keys(CHANNELS)

function makePassengers() {
  const out = []
  DEPARTURES.forEach((d, di) => {
    const r = rng(97 + di * 31)
    const vehicle = VEHICLES.find((v) => v.id === d.vehicleId)
    const seats = seatLabels(vehicle)
    const n = d.booked
    // grupos: pessoas viajam juntas
    let group = 0
    const pool = [...PEOPLE].sort(() => r() - 0.5)
    for (let i = 0; i < n; i++) {
      const p = pool[i % pool.length]
      if (i % 3 === 0) group++
      const ch = channelKeys[Math.min(channelKeys.length - 1, Math.floor(Math.pow(r(), 1.3) * channelKeys.length))]
      out.push({
        id: `${d.id}-p${i + 1}`,
        depId: d.id,
        name: p[0],
        country: p[1],
        lang: p[2],
        channel: ch,
        booking: `EA-${(48210 + di * 137 + group * 7).toString()}`,
        seat: seats[i] ?? null,
        hotel: HOTELS[Math.floor(r() * HOTELS.length)],
        child: r() < 0.08,
        pax: 1,
      })
    }
  })
  return out
}

// Saída em foco (d7, 10:30, Lancha Jaraqui) com manifesto curado
const FOCUS = [
  ['Emily Carter', 'US', 'EN', 'ota', 'EA-51830', 'Hotel Tropical'],
  ['Daniel Kim', 'US', 'EN', 'ota', 'EA-51830', 'Hotel Tropical'],
  ['Sofía Fernández', 'AR', 'ES', 'whatsapp', 'EA-51844', 'Juma Ópera'],
  ['Mateo González', 'AR', 'ES', 'whatsapp', 'EA-51844', 'Juma Ópera'],
  ['Hannah Weber', 'DE', 'DE', 'agencia', 'EA-51852', 'Novotel Manaus'],
  ['Mariana Costa', 'BR', 'PT', 'site', 'EA-51861', 'Blue Tree Manaus'],
  ['Pedro Albuquerque', 'BR', 'PT', 'site', 'EA-51861', 'Blue Tree Manaus'],
  ['Yuki Tanaka', 'JP', 'JA', 'ota', 'EA-51870', 'Intercity Manaus'],
  ['Camille Laurent', 'FR', 'FR', 'agencia', 'EA-51877', 'Hotel Villa Amazônia'],
  ['Hugo Moreau', 'FR', 'FR', 'agencia', 'EA-51877', 'Hotel Villa Amazônia'],
  ['Oliver Hughes', 'GB', 'EN', 'hotel', 'EA-51883', 'Hotel Tropical'],
  ['Beatriz Nogueira', 'BR', 'PT', 'site', 'EA-51890', 'Casa Hostel Centro'],
]

export const PASSENGERS = (() => {
  const base = makePassengers().filter((p) => p.depId !== 'd7')
  const seats = seatLabels(VEHICLES.find((v) => v.id === 'v4'))
  const focus = FOCUS.map((f, i) => ({
    id: `d7-p${i + 1}`, depId: 'd7', name: f[0], country: f[1], lang: f[2], channel: f[3], booking: f[4], hotel: f[5], seat: seats[i], child: i === 7, pax: 1,
  }))
  return [...base, ...focus]
})()

// Estado inicial de embarque. 'waiting' | 'boarded' | 'noshow'
export function initialStatus(now = BASE_NOW) {
  const status = {}
  const r = rng(4242)
  PASSENGERS.forEach((p) => {
    const d = DEPARTURES.find((x) => x.id === p.depId)
    if (d.id === 'd7') {
      const idx = Number(p.id.split('-p')[1])
      status[p.id] = idx <= 7 ? { s: 'boarded', at: d.start - 40 + idx * 2, via: idx === 4 ? 'manual' : 'qr', synced: true } : { s: 'waiting' }
    } else if (d.start <= now) {
      const noshow = r() < 0.04
      status[p.id] = noshow ? { s: 'noshow' } : { s: 'boarded', at: d.start - 30 + Math.floor(r() * 28), via: r() < 0.9 ? 'qr' : 'manual', synced: true }
    } else {
      status[p.id] = { s: 'waiting' }
    }
  })
  return status
}

// Divergências detectadas ao cruzar listas
export const DIVERGENCES = [
  { id: 'x1', depId: 'd12', type: 'overbook', severity: 'high', title: '2 passageiros sem lugar', detail: 'A agência Rio Negro Viagens enviou 26 nomes para uma lancha de 24 lugares.', action: 'Mover 2 para Lancha Boto 16:30', channel: 'agencia' },
  { id: 'x2', depId: 'd7', type: 'duplicate', severity: 'medium', title: 'Reserva duplicada', detail: 'Sofía Fernández aparece no WhatsApp e no site para a mesma saída.', action: 'Unificar reservas', channel: 'whatsapp' },
  { id: 'x3', depId: 'd10', type: 'name', severity: 'low', title: 'Nome diferente no voucher', detail: 'Voucher "J. Miller", lista da agência "Jacob Müller".', action: 'Confirmar como a mesma pessoa', channel: 'agencia' },
  { id: 'x4', depId: 'd11', type: 'language', severity: 'medium', title: 'Saída sem guia', detail: 'City tour das 14:30 tem 3 passageiros em alemão e nenhum guia escalado.', action: 'Escalar Marcos Baré (DE)', channel: 'site' },
]

// Escala da semana: seg 2 a dom 8 de novembro. dia 2 = quarta (hoje)
export const WEEK = [
  { idx: 0, short: 'Seg', day: 2 }, { idx: 1, short: 'Ter', day: 3 }, { idx: 2, short: 'Qua', day: 4, today: true },
  { idx: 3, short: 'Qui', day: 5 }, { idx: 4, short: 'Sex', day: 6 }, { idx: 5, short: 'Sáb', day: 7 }, { idx: 6, short: 'Dom', day: 8 },
]

// folgas
export const DAYS_OFF = { g1: [6], g2: [0], g3: [5, 6], g4: [3], g5: [1], g6: [6], g7: [4], g8: [0, 1] }

const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export { fmt }

export const SHIFTS = [
  // seg
  { id: 'a1', day: 0, tourId: 't1', start: 510, guideId: 'g1', need: ['EN'] },
  { id: 'a2', day: 0, tourId: 't3', start: 450, guideId: 'g4', need: ['DE', 'EN'] },
  { id: 'a3', day: 0, tourId: 't5', start: 540, guideId: 'g3', need: ['FR'] },
  { id: 'a4', day: 0, tourId: 't4', start: 990, guideId: 'g6', need: ['EN'] },
  // ter
  { id: 'a5', day: 1, tourId: 't2', start: 480, guideId: 'g2', need: ['EN'] },
  { id: 'a6', day: 1, tourId: 't6', start: 390, guideId: 'g7', need: ['IT'] },
  { id: 'a7', day: 1, tourId: 't1', start: 630, guideId: 'g6', need: ['EN'] },
  { id: 'a8', day: 1, tourId: 't5', start: 540, guideId: 'g3', need: ['FR'] },
  // qua (hoje)
  { id: 'a9', day: 2, tourId: 't3', start: 450, guideId: 'g4', need: ['DE'] },
  { id: 'a10', day: 2, tourId: 't3', start: 450, guideId: 'g5', need: ['ES'] },
  { id: 'a11', day: 2, tourId: 't2', start: 480, guideId: 'g1', need: ['EN', 'ES'] },
  { id: 'a12', day: 2, tourId: 't1', start: 510, guideId: 'g2', need: ['EN'] },
  { id: 'a13', day: 2, tourId: 't5', start: 540, guideId: 'g3', need: ['FR'] },
  { id: 'a14', day: 2, tourId: 't1', start: 630, guideId: 'g6', need: ['EN'] },
  { id: 'a15', day: 2, tourId: 't6', start: 390, guideId: 'g7', need: ['IT'] },
  // qui
  { id: 'a16', day: 3, tourId: 't1', start: 510, guideId: 'g2', need: ['EN'] },
  { id: 'a17', day: 3, tourId: 't3', start: 450, guideId: 'g5', need: ['ES'] },
  { id: 'a18', day: 3, tourId: 't5', start: 540, guideId: null, need: ['JA'] },
  { id: 'a19', day: 3, tourId: 't4', start: 990, guideId: 'g1', need: ['EN'] },
  // sex
  { id: 'a20', day: 4, tourId: 't2', start: 480, guideId: 'g6', need: ['EN'] },
  { id: 'a21', day: 4, tourId: 't1', start: 510, guideId: 'g8', need: ['JA'] },
  { id: 'a22', day: 4, tourId: 't6', start: 390, guideId: null, need: ['IT', 'EN'] },
  { id: 'a23', day: 4, tourId: 't5', start: 540, guideId: 'g3', need: ['DE'] },
  // sáb
  { id: 'a24', day: 5, tourId: 't3', start: 450, guideId: 'g4', need: ['DE', 'EN'] },
  { id: 'a25', day: 5, tourId: 't2', start: 480, guideId: 'g1', need: ['ES'] },
  { id: 'a26', day: 5, tourId: 't1', start: 510, guideId: null, need: ['FR'] },
  { id: 'a27', day: 5, tourId: 't4', start: 990, guideId: 'g2', need: ['EN'] },
  { id: 'a28', day: 5, tourId: 't6', start: 390, guideId: 'g7', need: ['IT'] },
  // dom
  { id: 'a29', day: 6, tourId: 't1', start: 510, guideId: 'g5', need: ['ES'] },
  { id: 'a30', day: 6, tourId: 't2', start: 480, guideId: null, need: ['EN'] },
  { id: 'a31', day: 6, tourId: 't4', start: 990, guideId: 'g4', need: ['EN'] },
]

export const ACTIVITY = [
  { id: 'e1', at: 10 * 60 + 3, who: 'Thiago Kambeba', what: 'conferiu 7 de 12 na Lancha Jaraqui', kind: 'scan' },
  { id: 'e2', at: 9 * 60 + 58, who: 'Integração', what: '14 reservas novas importadas das plataformas online', kind: 'sync' },
  { id: 'e3', at: 9 * 60 + 41, who: 'Sistema', what: 'detectou 2 passageiros sem lugar no Pôr do sol', kind: 'alert' },
  { id: 'e4', at: 9 * 60 + 12, who: 'Jéssica Tavares', what: 'saiu com a Van 01 · 11 a bordo', kind: 'depart' },
  { id: 'e5', at: 8 * 60 + 36, who: 'Raimundo Sá', what: 'zarpou com a Lancha Boto · 16 a bordo', kind: 'depart' },
  { id: 'e6', at: 8 * 60 + 2, who: 'Ana Clara Lins', what: 'zarpou com a Lancha Tucunaré · 22 a bordo', kind: 'depart' },
]

export const tourOf = (d) => TOURS.find((t) => t.id === d.tourId)
export const vehicleOf = (d) => VEHICLES.find((v) => v.id === d.vehicleId)
export const guideById = (id) => GUIDES.find((g) => g.id === id)
export const depById = (id) => DEPARTURES.find((d) => d.id === id)
