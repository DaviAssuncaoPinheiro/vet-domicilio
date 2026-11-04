const stop = (c) => ({ stopColor: `var(${c})` })

export default function MapCard({ label }) {
  return (
    <svg viewBox="0 0 400 170" className="block h-auto w-full" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vm-soli" x1="0" x2="1">
          <stop offset="0" style={stop('--color-gold')} />
          <stop offset="1" style={stop('--color-gold-light')} />
        </linearGradient>
      </defs>
      <rect width="400" height="170" fill="url(#vm-soli)" />
      <path d="M0 0H212C196 28 232 52 214 84C198 112 236 140 218 170H0Z" fill="var(--color-negro)" />
      <path d="M212 0C196 28 232 52 214 84C198 112 236 140 218 170" stroke="var(--color-surface)" strokeOpacity=".5" strokeWidth="1.5" fill="none" strokeDasharray="3 5" />
      <path d="M0 170V150C60 142 110 158 170 152C230 146 290 162 400 150V170Z" fill="var(--color-surface)" />
      <path d="M120 154V134" stroke="var(--color-surface)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="120" cy="120" r="9" fill="var(--color-surface)" />
      <circle cx="120" cy="120" r="3.4" fill="var(--color-negro)" />
    </svg>
  )
}
