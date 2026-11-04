export default function MapCard({ label }) {
  return (
    <svg viewBox="0 0 400 190" className="block h-auto w-full" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vm-negro" x1="0" x2="1">
          <stop offset="0" stopColor="#0F0D0A" />
          <stop offset="1" stopColor="#24201A" />
        </linearGradient>
        <linearGradient id="vm-soli" x1="0" x2="1">
          <stop offset="0" stopColor="#C9A15B" />
          <stop offset="1" stopColor="#E2C487" />
        </linearGradient>
        <clipPath id="vm-clip"><rect width="400" height="190" /></clipPath>
      </defs>
      <g clipPath="url(#vm-clip)">
        <rect width="400" height="190" fill="url(#vm-soli)" />
        {/* Rio Negro entra pela esquerda e encontra o Solimões */}
        <path d="M0 0H212C196 28 232 52 214 84C198 112 236 140 218 190H0Z" fill="url(#vm-negro)" />
        <path d="M24 40C70 28 110 54 170 38M10 96C60 84 120 112 190 96M30 150C80 138 130 164 196 150" stroke="#fff" strokeOpacity=".07" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M232 30C266 22 306 46 360 30M240 92C280 80 330 108 392 92M236 150C276 140 326 164 390 152" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* linha do encontro */}
        <path d="M212 0C196 28 232 52 214 84C198 112 236 140 218 190" stroke="#F4F2EC" strokeOpacity=".5" strokeWidth="1.5" fill="none" strokeDasharray="3 5" />
        {/* margem e píer */}
        <path d="M0 190V168C60 160 110 176 170 170C230 164 290 180 400 168V190Z" fill="#F5F4F1" />
        <path d="M120 172V150" stroke="#F4F2EC" strokeWidth="5" strokeLinecap="round" />
        <path d="M138 172V156" stroke="#F4F2EC" strokeWidth="5" strokeLinecap="round" opacity=".55" />
        <circle cx="120" cy="136" r="16" fill="#D7B36B" opacity=".25" />
        <circle cx="120" cy="136" r="9" fill="#D7B36B" />
        <circle cx="120" cy="136" r="3.4" fill="#12100D" />
      </g>
    </svg>
  )
}
