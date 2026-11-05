import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, Clock, Lifebuoy } from '@phosphor-icons/react'
import { cx, ease } from '../../components/ui'
import { seatLabels } from '../../data/mock'

/* ------------------------------------------------------------------ */
/* Geometria                                                           */
/* Trabalhamos em (l, b): l ao longo do casco (proa = 0, popa = L),    */
/* b através do casco (bombordo = 0, boreste = B). Depois mapeamos     */
/* para x/y conforme a orientação: 'v' (proa no topo) ou 'h' (proa à   */
/* direita).                                                           */
/* ------------------------------------------------------------------ */

function parseLabel(label) {
  if (label.startsWith('P')) return { extra: Number(label.slice(1)) }
  return { row: parseInt(label, 10), col: 'ABCDEF'.indexOf(label.slice(-1)) }
}

export function computeLayout(vehicle, s, orient) {
  const boat = vehicle.kind === 'boat'
  const car = !boat && vehicle.capacity <= 6
  const g = Math.round(s * 0.18)
  const rg = Math.round(s * 0.27)
  const a = Math.round(s * 0.6)
  const [c0, c1] = vehicle.cols
  const ps = Math.round(s * (boat ? 0.5 : 0.36))
  const sideW = (n) => n * s + (n - 1) * g
  const B = sideW(c0) + a + sideW(c1) + ps * 2
  const bc = B / 2
  const seatB = (col) => (col < c0 ? ps + col * (s + g) : ps + sideW(c0) + a + (col - c0) * (s + g))

  const parsed = seatLabels(vehicle).map((label) => ({ label, ...parseLabel(label) }))
  const maxRow = Math.max(...parsed.filter((p) => p.row).map((p) => p.row))
  const extras = parsed.filter((p) => p.extra)

  let bowL, consoleL, rowStart
  if (boat) {
    bowL = Math.round(B * 0.7 + s * 0.6)
    consoleL = bowL - s * 0.15
    rowStart = consoleL + s * 0.95 + rg * 1.4
  } else {
    bowL = car ? s * 1.5 : s * 0.62
    consoleL = bowL + s * 0.45
    rowStart = consoleL + s + rg * 1.5
  }
  const rowsEnd = rowStart + maxRow * s + (maxRow - 1) * rg
  const extrasEnd = extras.length ? rowsEnd + rg + s : rowsEnd
  const vestL = extrasEnd + s * 0.4
  const vestH = s * 0.55
  const L = boat ? vestL + vestH + s * 0.45 : extrasEnd + s * 0.55
  const aft = boat ? s * 0.55 : s * 0.15
  const padL = s * 0.35
  const padB = s * 0.35
  const D = padL + L + aft + s * 0.2
  const W = B + padB * 2

  const v = orient === 'v'
  const width = v ? W : D
  const height = v ? D : W
  const pt = (l, b) => (v ? [padB + b, padL + l] : [D - padL - l, padB + b])
  const rect = (l, b, len, wid) =>
    v ? { left: padB + b, top: padL + l, width: wid, height: len } : { left: D - padL - l - len, top: padB + b, width: len, height: wid }

  const seats = parsed.map((p) => {
    let l, b
    if (p.extra) {
      const tot = extras.length * s + (extras.length - 1) * g
      b = bc - tot / 2 + (p.extra - 1) * (s + g)
      l = rowsEnd + rg
    } else {
      b = seatB(p.col)
      l = rowStart + (p.row - 1) * (s + rg)
    }
    return { label: p.label, ...rect(l, b, s, s) }
  })

  // path builder
  const f = (n) => Math.round(n * 10) / 10
  const P = (cmds) =>
    cmds
      .map(([c, ...nums]) => {
        if (c === 'Z') return 'Z'
        const out = []
        for (let i = 0; i < nums.length; i += 2) out.push(pt(nums[i], nums[i + 1]).map(f).join(' '))
        return `${c}${out.join(' ')}`
      })
      .join(' ')

  const hullBoat = (i) => {
    const b0 = i, b1 = B - i, Bw = b1 - b0
    const tip = i * 2.6, Lb = bowL, Le = L - i, r = s * 0.55 - i * 0.5, k = Lb - tip
    return P([
      ['M', tip, bc],
      ['C', tip + k * 0.3, bc + Bw * 0.2, tip + k * 0.62, b1, Lb, b1],
      ['L', Le - r, b1],
      ['Q', Le, b1, Le, b1 - r],
      ['Q', Le + s * 0.1, bc, Le, b0 + r],
      ['Q', Le, b0, Le - r, b0],
      ['L', Lb, b0],
      ['C', tip + k * 0.62, b0, tip + k * 0.3, bc - Bw * 0.2, tip, bc],
      ['Z'],
    ])
  }
  const hullBus = (i) => {
    const l0 = i, l1 = L - i, b0 = i, b1 = B - i
    const fr = (car ? s * 0.95 : s * 0.62) - i * 0.6, rr = s * 0.4 - i * 0.5
    return P([
      ['M', l0, b0 + fr],
      ['C', l0, b0 + fr * 0.35, l0 + fr * 0.35, b0, l0 + fr, b0],
      ['L', l1 - rr, b0],
      ['Q', l1, b0, l1, b0 + rr],
      ['L', l1, b1 - rr],
      ['Q', l1, b1, l1 - rr, b1],
      ['L', l0 + fr, b1],
      ['C', l0 + fr * 0.35, b1, l0, b1 - fr * 0.35, l0, b1 - fr],
      ['Z'],
    ])
  }

  const outer = boat ? hullBoat(0) : hullBus(0)
  const inner = boat ? hullBoat(s * 0.2) : hullBus(s * 0.16)

  const decor = { planks: [], wake: [], glass: null, wheels: [], mirrors: [], motors: [], door: null }
  const inB0 = ps * 0.55, inB1 = B - ps * 0.55
  if (boat) {
    const wl = consoleL - s * 0.32
    decor.glass = P([
      ['M', wl, inB0],
      ['Q', wl - s * 0.42, bc, wl, inB1],
      ['L', wl + s * 0.12, inB1 - 2],
      ['Q', wl - s * 0.26, bc, wl + s * 0.12, inB0 + 2],
      ['Z'],
    ])
    const step = Math.max(7, s * 0.17)
    for (let b = bc - step * 6; b <= bc + step * 6; b += step) decor.planks.push(P([['M', 0, b], ['L', wl - s * 0.2, b]]))
    decor.anchor = pt(bowL * 0.3, bc)
    const mw = s * 0.42, ml = s * 0.5
    const motorBs = B > 220 ? [bc - s * 0.55, bc + s * 0.55] : [bc]
    decor.motors = motorBs.map((mb) => rect(L - 4, mb - mw / 2, ml, mw))
    const sw = L + ml
    decor.wake = [
      P([['M', sw - s * 0.1, bc - s * 0.42], ['Q', sw + aft * 0.55, bc - s * 0.5, sw + aft * 0.95, bc - s * 0.95]]),
      P([['M', sw - s * 0.1, bc + s * 0.42], ['Q', sw + aft * 0.55, bc + s * 0.5, sw + aft * 0.95, bc + s * 0.95]]),
      P([['M', sw + aft * 0.2, bc], ['L', sw + aft * 0.8, bc]]),
    ]
  } else {
    const ga = car ? s * 0.95 : s * 0.22, gb = ga + s * 0.36
    decor.glass = P([
      ['M', ga, inB0 + 2],
      ['Q', ga - s * 0.14, bc, ga, inB1 - 2],
      ['L', gb, inB1],
      ['Q', gb - s * 0.1, bc, gb, inB0],
      ['Z'],
    ])
    const ww = s * 0.62, wh = 7
    ;[consoleL - s * 0.05, L - s * 1.15].forEach((wl) => {
      decor.wheels.push(rect(wl, -4, ww, wh), rect(wl, B - wh + 4, ww, wh))
    })
    decor.mirrors.push(rect(gb - s * 0.05, -s * 0.22, s * 0.2, s * 0.26), rect(gb - s * 0.05, B - s * 0.04, s * 0.2, s * 0.26))
    decor.wheelRing = { c: pt(consoleL - s * 0.3, seatB(0) + s / 2), r: s * 0.15 }
    decor.door = rect(consoleL, B - ps - 1, s * 1.1, ps - s * 0.16 + 1)
  }

  // Console / motorista e guia
  let console, guideSpot = null
  if (boat) {
    const cb = seatB(c0), cw = sideW(c1)
    console = rect(consoleL, cb, s * 0.78, cw)
    const gsz = s * 0.6
    guideSpot = rect(consoleL + s * 0.09, seatB(0) + (sideW(c0) - gsz) / 2, gsz, gsz)
  } else {
    console = rect(consoleL, seatB(0), s * 0.9, s)
  }
  const vestW = Math.min(B * 0.5, s * 2.4)
  const vest = boat ? rect(vestL, bc - vestW / 2, vestH, vestW) : null

  return { width, height, seats, outer, inner, decor, console, guideSpot, vest, boat, orient, s }
}

/* ------------------------------------------------------------------ */
/* Lugares: sem assento marcado. Passageiros ocupam os lugares na      */
/* ordem de embarque, agrupados por reserva.                           */
/* ------------------------------------------------------------------ */

export function orderByBooking(pax, status) {
  const groups = new Map()
  pax.forEach((p, i) => {
    if (!groups.has(p.booking)) groups.set(p.booking, { first: i, items: [] })
    groups.get(p.booking).items.push({ p, i })
  })
  const at = (p) => (status[p.id]?.s === 'boarded' ? status[p.id].at : Infinity)
  const rank = (p) => (status[p.id]?.s === 'boarded' ? 0 : status[p.id]?.s === 'noshow' ? 2 : 1)
  const cmp = (x, y) => (x === y ? 0 : x < y ? -1 : 1)
  return [...groups.values()]
    .map((g) => ({ ...g, t: Math.min(...g.items.map((x) => at(x.p))) }))
    .sort((a, b) => cmp(a.t, b.t) || a.first - b.first)
    .flatMap((g) => g.items.sort((a, b) => rank(a.p) - rank(b.p) || cmp(at(a.p), at(b.p)) || a.i - b.i).map((x) => x.p))
}

function Place({ place, p, st, s, orient, selected, hovered, grouped, pulse, onEnter, onLeave, onClick }) {
  const reduce = useReducedMotion()
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true }, [])
  const state = st?.s === 'boarded' ? 'boarded' : st?.s === 'noshow' ? 'noshow' : 'waiting'
  const v = orient === 'v'
  const small = s < 40
  const queued = state === 'boarded' && st?.synced === false
  const sweepFrom = v ? 'inset(100% 0 0 0 round 10px)' : 'inset(0 100% 0 0 round 10px)'
  const ini = p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')

  return (
    <motion.div
      className="absolute"
      initial={false}
      animate={{ left: place.left, top: place.top }}
      transition={reduce ? { duration: 0 } : { duration: 0.35, ease }}
      style={{ width: place.width, height: place.height, zIndex: selected || hovered ? 5 : 2 }}
    >
      <button
        type="button"
        aria-label={`${p.name}, ${state === 'boarded' ? 'embarcado' : state === 'noshow' ? 'faltou' : 'aguardando'}`}
        aria-pressed={selected}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={onClick}
        className={cx(
          'absolute inset-0 overflow-hidden rounded-[10px] transition-[box-shadow,transform,background-color] duration-150 active:scale-95',
          state === 'waiting' && 'border-[1.5px] border-ink-4 bg-sunken text-ink-3',
          state === 'boarded' && 'bg-ok text-white',
          state === 'noshow' && 'hatch text-ink-4',
          selected ? 'scale-[1.04] ring-2 ring-ink ring-offset-2 ring-offset-surface' : hovered ? 'ring-2 ring-ink/20' : '',
          grouped && !selected && !hovered && 'outline-1 outline-offset-2 outline-dashed outline-ink-4',
        )}
      >
        {state === 'boarded' && (
          <motion.span
            key={`sweep-${st?.at}`}
            aria-hidden
            className="absolute inset-0 bg-ok"
            initial={mounted.current && !reduce ? { clipPath: sweepFrom } : false}
            animate={{ clipPath: 'inset(0 0% 0 0 round 10px)' }}
            transition={{ duration: 0.25, ease }}
          />
        )}
        <span className="relative grid h-full w-full place-items-center">
          {state === 'boarded' ? <Check size={small ? 13 : 16} weight="bold" /> : (
            <span className={cx('font-semibold leading-none', small ? 'text-[10px]' : 'text-[11px]')}>{ini}</span>
          )}
        </span>
      </button>

      {queued && (
        <span title="Salvo no celular" className="pointer-events-none absolute -right-1.5 -top-1.5 grid size-[15px] place-items-center rounded-full bg-gold text-negro ring-2 ring-surface">
          <Clock size={9} weight="bold" />
        </span>
      )}

      <AnimatePresence>
        {pulse && !reduce && (
          <motion.span
            key={pulse.t}
            aria-hidden
            className={cx('pointer-events-none absolute -inset-[3px] rounded-[13px] border-2', pulse.ok ? 'border-ok' : 'border-alert')}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: [0.9, 0], scale: [1, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', repeat: 1 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Planta                                                              */
/* ------------------------------------------------------------------ */

export function SeatPlan({ layout, vehicle, guide, pax, status, hoverId, setHoverId, selectedId, onSelect, pulse }) {
  const { width, height, seats: places, outer, inner, decor, console: cons, guideSpot, vest, boat, orient, s } = layout
  const ordered = useMemo(() => orderByBooking(pax, status).slice(0, places.length), [pax, status, places.length])
  const placeOf = useMemo(() => Object.fromEntries(ordered.map((p, i) => [p.id, places[i]])), [ordered, places])
  const hovered = pax.find((p) => p.id === hoverId)
  const hoverPlace = hovered && placeOf[hovered.id]
  const skipperInitials = vehicle.skipper.split(' ').map((w) => w[0]).slice(0, 2).join('')

  // ligações entre lugares vizinhos da mesma reserva
  const links = useMemo(() => {
    const out = []
    const c = (r) => [r.left + r.width / 2, r.top + r.height / 2]
    ordered.forEach((p, i) => {
      for (let j = i + 1; j < ordered.length && ordered[j].booking === p.booking; j++) {
        const [x1, y1] = c(places[i]), [x2, y2] = c(places[j])
        const dx = Math.abs(x1 - x2), dy = Math.abs(y1 - y2)
        if ((dx < 1 && dy <= s * 1.9) || (dy < 1 && dx <= s * 1.9)) out.push({ key: `${p.id}-${ordered[j].id}`, x1, y1, x2, y2 })
      }
    })
    return out
  }, [ordered, places, s])

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden>
        <defs>
          <clipPath id={`deck-${vehicle.id}-${orient}`}><path d={inner} /></clipPath>
          <filter id="hull-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" style={{ floodColor: 'var(--color-ink)', floodOpacity: 0.1 }} />
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" style={{ floodColor: 'var(--color-ink)', floodOpacity: 0.06 }} />
          </filter>
        </defs>

        {decor.motors.map((m, i) => <rect key={i} x={m.left} y={m.top} width={m.width} height={m.height} rx={5} fill="var(--color-negro)" />)}
        {decor.wheels.map((w, i) => <rect key={i} x={w.left} y={w.top} width={w.width} height={w.height} rx={3} fill="var(--color-negro)" />)}
        {decor.mirrors.map((m, i) => <rect key={i} x={m.left} y={m.top} width={m.width} height={m.height} rx={3} fill="var(--color-surface)" stroke="var(--color-line)" />)}

        <path d={outer} fill="var(--color-surface)" filter="url(#hull-shadow)" />
        <path d={outer} fill="none" stroke="var(--color-ink)" strokeOpacity={0.07} />
        <path d={inner} fill="none" stroke="var(--color-line)" strokeWidth={1.2} />

        <g clipPath={`url(#deck-${vehicle.id}-${orient})`}>
          {decor.planks.map((d, i) => <path key={i} d={d} stroke="var(--color-line)" strokeWidth={1} />)}
        </g>
        {decor.glass && <path d={decor.glass} fill="var(--color-sunken)" stroke="var(--color-ink)" strokeOpacity={0.12} />}
        {decor.wheelRing && <circle cx={decor.wheelRing.c[0]} cy={decor.wheelRing.c[1]} r={decor.wheelRing.r} fill="none" stroke="var(--color-ink-3)" strokeWidth={2} />}
        {decor.door && <rect x={decor.door.left} y={decor.door.top} width={decor.door.width} height={decor.door.height} rx={4} fill="var(--color-frame)" stroke="var(--color-line)" strokeDasharray="3 3" />}

        {/* lugares vazios */}
        {places.map((r, i) => (
          <rect key={i} x={r.left + 0.5} y={r.top + 0.5} width={r.width - 1} height={r.height - 1} rx={10} fill="none" stroke="var(--color-ink-4)" strokeDasharray="3 3" />
        ))}
        {/* mesma reserva */}
        {links.map((l) => (
          <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--color-ink)" strokeOpacity={0.12} strokeWidth={Math.round(s * 0.2)} strokeLinecap="round" />
        ))}
      </svg>

      <div
        title={`${vehicle.skipper} · ${boat ? 'Piloto' : 'Motorista'}`}
        className="absolute grid place-items-center rounded-[10px] bg-negro text-white shadow-dark"
        style={{ left: cons.left, top: cons.top, width: cons.width, height: cons.height }}
      >
        <span className={cx('font-semibold tracking-wide', s < 40 ? 'text-[9.5px]' : 'text-[10.5px]')}>{skipperInitials}</span>
      </div>

      {guideSpot && guide && (
        <div
          title={`${guide.name} · Guia`}
          className="absolute grid place-items-center rounded-full font-semibold text-white ring-2 ring-surface"
          style={{
            left: guideSpot.left, top: guideSpot.top, width: guideSpot.width, height: guideSpot.height, fontSize: guideSpot.width * 0.36,
            background: `linear-gradient(140deg, ${guide.hue}, color-mix(in oklab, ${guide.hue} 70%, black))`,
          }}
        >
          {guide.initials}
        </div>
      )}

      {vest && (
        <div
          title={`${vehicle.capacity} coletes`}
          className="absolute flex items-center justify-center rounded-[8px] bg-gold-tint text-gold-deep"
          style={{ left: vest.left, top: vest.top, width: vest.width, height: vest.height }}
        >
          <Lifebuoy size={s < 40 ? 11 : 13} weight="bold" />
        </div>
      )}

      {ordered.map((p) => (
        <Place
          key={p.id}
          place={placeOf[p.id]}
          p={p}
          st={status[p.id]}
          s={s}
          orient={orient}
          selected={p.id === selectedId}
          hovered={p.id === hoverId}
          grouped={!!hovered && hovered.id !== p.id && hovered.booking === p.booking}
          pulse={pulse?.paxId === p.id ? pulse : null}
          onEnter={() => setHoverId(p.id)}
          onLeave={() => setHoverId(null)}
          onClick={() => onSelect(p.id === selectedId ? null : p.id)}
        />
      ))}

      <AnimatePresence>
        {hovered && hoverPlace && (
          <motion.div
            key={hovered.id}
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{ duration: 0.14, ease }}
            className="pointer-events-none absolute z-30"
            style={{ left: Math.min(Math.max(hoverPlace.left + hoverPlace.width / 2, 100), width - 100), top: hoverPlace.top - 10 }}
          >
            <div className="flex -translate-x-1/2 -translate-y-full items-center gap-2 whitespace-nowrap rounded-full bg-negro py-1.5 pl-3 pr-2 text-[12px] text-white shadow-dark">
              <span className="font-medium">{hovered.name}</span>
              <span className="font-mono text-[10.5px] text-white/55">{hovered.booking}</span>
              <span className="rounded-[5px] bg-white/10 px-1 font-mono text-[10.5px] font-semibold">{hovered.lang}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Linha de capacidade com legenda embutida */
export function CapacityLine({ capacity, stats, boat, className }) {
  const sep = <span className="text-ink-4">·</span>
  return (
    <p className={cx('flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-[12.5px] text-ink-3 tnum', className)}>
      <span>{capacity} lugares</span>
      {sep}
      <span className="inline-flex items-center gap-1.5"><span className="size-[10px] rounded-[3px] bg-ok" />{stats.boarded} embarcados</span>
      {sep}
      <span className="inline-flex items-center gap-1.5"><span className="size-[10px] rounded-[3px] border-[1.5px] border-ink-4 bg-sunken" />{stats.waiting} aguardando</span>
      {stats.noshow > 0 && <>{sep}<span className="inline-flex items-center gap-1.5"><span className="hatch size-[10px] rounded-[3px]" />{stats.noshow} {stats.noshow === 1 ? 'faltou' : 'faltaram'}</span></>}
      {boat && <>{sep}<span>{capacity} coletes</span></>}
      {stats.queued > 0 && <>{sep}<span className="inline-flex items-center gap-1.5"><span className="grid size-[12px] place-items-center rounded-full bg-gold text-negro"><Clock size={7} weight="bold" /></span>{stats.queued} no celular</span></>}
    </p>
  )
}
