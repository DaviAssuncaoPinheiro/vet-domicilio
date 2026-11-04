import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { House, Boat, UsersThree, Tray, DeviceMobile, Gear, Bell, MagnifyingGlass, Plus, WifiHigh, Ticket, ChartLineUp } from '@phosphor-icons/react'
import { AvatarStack, Avatar, IconButton, Button, ToastHost, cx } from './ui'
import { GUIDES, USER, COMPANY, fmt } from '../data/mock'
import { useOps } from '../store'

export const NAV = [
  { to: '/', label: 'Hoje', icon: House, end: true },
  { to: '/embarque', label: 'Embarque', icon: Boat },
  { to: '/escala', label: 'Escala', icon: UsersThree },
  { to: '/reservas', label: 'Reservas', icon: Tray },
]

export function Logo({ size = 40, dark = true }) {
  const id = `g${size}${dark ? 'd' : 'l'}`
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full', dark ? 'bg-negro shadow-dark' : 'bg-surface shadow-pill')} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 56" width={size * 0.5} height={size * 0.58} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F1DDAE" />
            <stop offset="0.45" stopColor="#C9A15B" />
            <stop offset="1" stopColor="#8C6A2E" />
          </linearGradient>
        </defs>
        <path d="M24 2 44 9v17c0 13.5-8.6 22.8-20 28C12.6 48.8 4 39.5 4 26V9L24 2Z" fill={`url(#${id})`} />
        <path d="M24 8.5 38.5 13.6v12.6c0 9.9-6 17-14.5 21.3V8.5Z" fill={dark ? '#12100D' : '#12100D'} opacity="0.9" />
        <path d="M24 8.5v39l-2.6-4.3 2.6-4-2.6-4.3 2.6-4-2.6-4.3 2.6-4-2.6-4.3 2.6-4-2.6-4.3Z" fill={`url(#${id})`} />
      </svg>
    </span>
  )
}

function Clock() {
  const now = useOps((s) => s.now)
  const online = useOps((s) => s.online)
  return (
    <div className="hidden h-10 items-center gap-2.5 rounded-full bg-surface pl-3.5 pr-4 shadow-pill lg:flex">
      <span className={cx('live-dot', online ? 'text-ok' : 'text-land')} />
      <span className="font-mono text-[13px] font-medium tnum text-ink">{fmt(now)}</span>
    </div>
  )
}

function Rail() {
  const nav = useNavigate()
  return (
    <aside className="sticky top-4 hidden h-[calc(100dvh-32px)] w-[64px] shrink-0 flex-col items-center rounded-[28px] bg-frame py-3 shadow-soft xl:flex">
      <button onClick={() => nav('/')} aria-label="Início"><Logo /></button>
      <div className="mt-auto flex flex-col items-center gap-2 rounded-full bg-surface/60 p-1.5 shadow-[inset_0_1px_2px_rgba(19,19,22,.05)]">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            {({ isActive }) => (
              <IconButton active={isActive} label={n.label}><n.icon size={18} weight={isActive ? 'bold' : 'regular'} /></IconButton>
            )}
          </NavLink>
        ))}
      </div>
      <div className="mb-auto mt-3 flex flex-col items-center gap-2">
        <NavLink to="/guia"><IconButton dark label="App do guia"><DeviceMobile size={18} /></IconButton></NavLink>
        <NavLink to="/voucher/EA-51877"><IconButton label="Voucher do passageiro"><Ticket size={18} /></IconButton></NavLink>
      </div>
    </aside>
  )
}

function TopBar() {
  const nav = useNavigate()
  const divergences = useOps((s) => s.divergences.filter((d) => !d.resolved).length)
  return (
    <header className="flex items-center gap-3 rounded-[28px] bg-frame p-2.5 shadow-soft md:gap-4">
      <div className="xl:hidden"><Logo size={40} /></div>
      <nav className="no-scrollbar hidden min-w-0 items-center gap-1.5 overflow-x-auto md:flex">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            {({ isActive }) => (
              <span
                className={cx(
                  'relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors duration-150',
                  isActive ? 'text-ink' : 'bg-surface text-ink-2 shadow-pill hover:text-ink',
                )}
              >
                {isActive && <motion.span layoutId="topnav" className="absolute inset-0 rounded-full bg-sunken shadow-[inset_0_1px_2px_rgba(19,19,22,0.09)] ring-1 ring-black/[0.04]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <n.icon size={16} weight={isActive ? 'bold' : 'regular'} className="relative" />
                <span className="relative">{n.label}</span>
                {n.to === '/' && divergences > 0 && <span className="relative grid h-[18px] min-w-[18px] place-items-center rounded-full bg-alert px-1 font-mono text-[10px] font-semibold text-white">{divergences}</span>}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="min-w-0 md:hidden">
        <p className="truncate text-[14px] font-semibold leading-tight">{COMPANY.short}</p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <Clock />
        <IconButton label="Notificações" className="relative bg-surface !text-ink-2 shadow-pill">
          <Bell size={17} />
          {divergences > 0 && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-alert ring-2 ring-surface" />}
        </IconButton>
        <Avatar initials={USER.initials} hue="#C9A15B" size={40} className="!text-negro" />
      </div>
    </header>
  )
}

function BottomNav() {
  const loc = useLocation()
  const items = [...NAV, { to: '/guia', label: 'App', icon: DeviceMobile }]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))] md:hidden">
      <div className="flex items-center gap-1 rounded-full bg-negro p-1.5 shadow-dark">
        {items.map((n) => {
          const active = n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)
          return (
            <NavLink key={n.to} to={n.to} end={n.end} aria-label={n.label} className={cx('relative flex h-11 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-medium transition-colors', active ? 'text-white' : 'text-white/55')}>
              {active && <motion.span layoutId="bottomnav" className="absolute inset-0 rounded-full bg-white/[0.13]" transition={{ type: 'spring', stiffness: 520, damping: 40 }} />}
              <n.icon size={19} weight={active ? 'fill' : 'regular'} className="relative" />
              {active && <span className="relative">{n.label}</span>}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export function OfflineBanner() {
  const online = useOps((s) => s.online)
  if (online) return null
  return (
    <div className="flex items-center gap-2 rounded-full bg-land-tint px-3 py-1.5 text-[12px] font-medium text-[#8A6420]">
      <WifiHigh size={14} /> Sem internet. Leituras ficam salvas no aparelho.
    </div>
  )
}

export default function Shell() {
  const toast = useOps((s) => s.toast)
  const clear = useOps((s) => s.clearToast)
  return (
    <div className="min-h-dvh p-2 pb-28 sm:p-3 md:p-4 md:pb-4">
      <div className="mx-auto flex max-w-[1680px] gap-4">
        <Rail />
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
          <TopBar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
      <ToastHost toast={toast} onClose={clear} />
    </div>
  )
}
