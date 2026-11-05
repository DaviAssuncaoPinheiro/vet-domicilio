import { memo, useEffect, useRef } from 'react'

const STEP = 60
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const rand = (n) => Math.floor(Math.random() * n)

const FALL = [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }]
const RISE = [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }]

/** Um tile de split-flap. Anima só quando o caractere muda. */
const Tile = memo(function Tile({ ch, index, mountDelay, reduce }) {
  const top = useRef(null)
  const bot = useRef(null)
  const fall = useRef(null)
  const rise = useRef(null)
  const shown = useRef(null)

  useEffect(() => {
    const T = top.current, B = bot.current, F = fall.current, G = rise.current
    const put = (el, c) => { el.firstChild.textContent = c }
    const rest = (c) => { put(T, c); put(B, c); F.style.visibility = 'hidden'; G.style.visibility = 'hidden' }

    if (shown.current === ch) return
    if (reduce || (shown.current === null && ch === ' ')) { rest(ch); shown.current = ch; return }

    const first = shown.current === null
    const n = 4 + rand(5)
    const seq = Array.from({ length: n - 1 }, () => CHARSET[rand(CHARSET.length)])
    seq.push(ch)
    let k = 0
    let timer
    let anims = []

    const done = () => { anims.forEach((a) => a.cancel()); anims = []; rest(shown.current) }
    const step = () => {
      const from = shown.current ?? ' '
      const to = seq[k++]
      anims.forEach((a) => a.cancel())
      put(T, to); put(B, from); put(F, from); put(G, to)
      F.style.visibility = 'visible'
      G.style.visibility = 'visible'
      anims = [
        F.animate(FALL, { duration: STEP * 0.55, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' }),
        G.animate(RISE, { duration: STEP * 0.45, delay: STEP * 0.55, easing: 'cubic-bezier(0,.55,.45,1)', fill: 'both' }),
      ]
      shown.current = to
      timer = setTimeout(k < seq.length ? step : done, k < seq.length ? STEP : STEP + 8)
    }
    timer = setTimeout(step, (first ? mountDelay : 0) + index * 20)

    return () => {
      clearTimeout(timer)
      anims.forEach((a) => a.cancel())
      if (shown.current !== null) rest(shown.current)
    }
  }, [ch, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="flap" aria-hidden>
      <span ref={top} className="flap-h flap-t"><span className="flap-c" /></span>
      <span ref={bot} className="flap-h flap-b"><span className="flap-c" /></span>
      <span ref={fall} className="flap-h flap-t flap-f"><span className="flap-c" /></span>
      <span ref={rise} className="flap-h flap-b flap-f"><span className="flap-c" /></span>
    </span>
  )
})

export function fit(text, width, align = 'left') {
  const chars = Array.from(String(text ?? '').toLocaleUpperCase('pt-BR')).slice(0, width)
  const pad = Array(width - chars.length).fill(' ')
  return align === 'right' ? [...pad, ...chars] : [...chars, ...pad]
}

/** Texto de largura fixa feito de tiles. */
export function FlapText({ text, width, align, mountDelay = 0, reduce, color, className }) {
  const chars = fit(text, width, align)
  return (
    <span className={'inline-flex gap-[calc(var(--tw)*0.12)] ' + (className || '')} style={{ color }} role="img" aria-label={String(text ?? '').trim() || undefined}>
      {chars.map((c, i) => (
        <Tile key={i} ch={c} index={i} mountDelay={mountDelay} reduce={reduce} />
      ))}
    </span>
  )
}

/** Largura de uma célula de n tiles, para alinhar cabeçalhos. */
export const cellW = (n) => `calc(var(--tw) * ${n} * 1.12 - var(--tw) * 0.12)`
