import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ticket } from '@phosphor-icons/react'
import { Button, PhoneFrame, Reveal, useMedia } from '../components/ui'
import { Logo } from '../components/Shell'
import { COMPANY } from '../data/mock'
import GuideApp from './guia/GuideApp'

/** App inteiro preenchendo o pai (usado dentro do PhoneFrame no Embarque). */
export function GuideAppEmbed({ depId = 'd7' }) {
  return <GuideApp depId={depId} mode="embed" />
}

const STEPS = [
  ['01', 'Toque no visor para ler o próximo QR'],
  ['02', 'Leia um QR repetido para ver o bloqueio'],
  ['03', 'Ligue o modo sem internet no Início'],
]

export default function GuiaApp() {
  const mobile = useMedia('(max-width: 767px)')
  const nav = useNavigate()

  if (mobile) {
    return (
      <div className="fixed inset-0 h-[100dvh] bg-frame">
        <GuideApp depId="d7" mode="full" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute left-1/2 top-1/2 ml-[260px] size-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.75),rgba(255,255,255,0))]" />
      <div className="relative mx-auto flex min-h-dvh max-w-[1080px] items-center justify-center gap-[clamp(64px,9vw,140px)] px-10 py-8">
        <div className="max-w-[430px]">
          <Reveal i={0}><Logo size={44} /></Reveal>
          <Reveal i={1}>
            <p className="mt-10 text-[12.5px] font-medium text-ink-3">{COMPANY.name}</p>
            <h1 className="mt-2 text-[46px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">App do guia</h1>
            <p className="mt-4 text-[16px] leading-[1.55] text-ink-2">Confere o embarque pelo QR Code. Funciona sem internet e sincroniza quando o sinal volta.</p>
          </Reveal>
          <Reveal i={2} className="mt-8 flex flex-wrap gap-2.5">
            <Button variant="dark" size="lg" icon={ArrowLeft} onClick={() => nav('/')}>Voltar ao painel</Button>
            <Button variant="light" size="lg" icon={Ticket} onClick={() => nav('/voucher/EA-51877')}>Ver voucher</Button>
          </Reveal>
          <Reveal i={3}>
            <ol className="mt-12 border-t border-line">
              {STEPS.map(([n, t]) => (
                <li key={n} className="flex items-center gap-4 border-b border-line py-3 text-[13.5px] text-ink-2">
                  <span className="font-mono text-[12px] text-ink-4 tnum">{n}</span>
                  {t}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        <Reveal i={2} y={14}>
          <PhoneFrame>
            <GuideAppEmbed depId="d7" />
          </PhoneFrame>
        </Reveal>
      </div>
    </div>
  )
}
