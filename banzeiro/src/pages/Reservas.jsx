import { Reveal } from '../components/ui'
import ChannelStrip from './reservas/ChannelStrip'
import Inbox from './reservas/Inbox'

export default function Reservas() {
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <Reveal>
        <div className="px-1 pt-2">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink">Reservas</h1>
          <p className="mt-1 text-[14px] text-ink-3">Tudo que chega, num lugar só</p>
        </div>
      </Reveal>
      <ChannelStrip />
      <Inbox />
    </div>
  )
}
