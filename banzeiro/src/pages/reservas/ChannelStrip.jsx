import { Globe, WhatsappLogo, Handshake, AppWindow, Bed } from '@phosphor-icons/react'
import { Card, Reveal } from '../../components/ui'
import { CHANNELS } from '../../data/mock'
import { channelStats } from './data'

export const ICONS = { site: Globe, whatsapp: WhatsappLogo, agencia: Handshake, ota: AppWindow, hotel: Bed }

export default function ChannelStrip() {
  const stats = channelStats()
  return (
    <Reveal i={1}>
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-5">
          {stats.map((s) => {
            const Icon = ICONS[s.key]
            return (
              <div key={s.key} className="flex min-w-[180px] shrink-0 items-center gap-3 border-l border-line px-5 py-4 first:border-l-0 md:min-w-0">
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-ink-2">
                  <Icon size={17} />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-ok ring-2 ring-surface" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] text-ink-3">{CHANNELS[s.key].label}</p>
                  <p className="text-[22px] font-semibold leading-tight tracking-[-0.02em] tnum">{s.count}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </Reveal>
  )
}
