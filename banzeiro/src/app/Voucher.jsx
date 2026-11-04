import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Sun, BaseballCap, IdentificationCard, Drop, Wallet, WhatsappLogo, NavigationArrow, Check, Star, MapPin, ArrowLeft } from '@phosphor-icons/react'
import { Logo } from '../components/Shell'
import { Segmented, Avatar, LangTag, Reveal, ease, cx } from '../components/ui'
import { useOps } from '../store'
import { PASSENGERS, GUIDES, KIND, COMPANY, depById, tourOf, vehicleOf, fmt } from '../data/mock'
import { LANG_OPTIONS, T } from './voucher/i18n'
import MapCard from './voucher/MapCard'

function Corners() {
  const c = 'absolute size-5 border-negro'
  return (
    <>
      <span className={cx(c, 'left-3 top-3 rounded-tl-[8px] border-l-[3px] border-t-[3px]')} />
      <span className={cx(c, 'right-3 top-3 rounded-tr-[8px] border-r-[3px] border-t-[3px]')} />
      <span className={cx(c, 'bottom-3 left-3 rounded-bl-[8px] border-b-[3px] border-l-[3px]')} />
      <span className={cx(c, 'bottom-3 right-3 rounded-br-[8px] border-b-[3px] border-r-[3px]')} />
    </>
  )
}

export default function Voucher() {
  const { code = 'EA-51861' } = useParams()
  const [lang, setLang] = useState('PT')
  const [note, setNote] = useState(null)
  const [walletDone, setWalletDone] = useState(false)
  const status = useOps((s) => s.status)
  const t = T[lang]

  const pax = PASSENGERS.filter((p) => p.booking === code.toUpperCase())
  const dep = pax.length ? depById(pax[0].depId) : null

  const flash = (msg) => { setNote(msg); setTimeout(() => setNote((n) => (n === msg ? null : n)), 2600) }

  return (
    <div className="min-h-dvh bg-canvas px-4 pb-10 pt-4 md:py-8">
      <div className="mx-auto w-full max-w-[420px]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="group flex items-center gap-2.5" aria-label={t.back}>
            <Logo size={36} />
            <span className="hidden items-center gap-1.5 text-[12.5px] font-medium text-ink-3 transition-colors group-hover:text-ink md:flex"><ArrowLeft size={14} />{t.back}</span>
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink md:hidden">{COMPANY.short}</span>
          </Link>
          <Segmented size="sm" options={LANG_OPTIONS} value={lang} onChange={setLang} />
        </header>

        {!dep ? (
          <div className="rounded-[28px] bg-surface p-8 text-center shadow-soft">
            <p className="text-[17px] font-semibold">{t.notFound}</p>
            <p className="mt-1 text-[13px] text-ink-3">{t.notFoundSub}</p>
          </div>
        ) : (
          <Body {...{ t, lang, code: code.toUpperCase(), pax, dep, status, walletDone, setWalletDone, flash, note }} />
        )}
      </div>
    </div>
  )
}

function Body({ t, lang, code, pax, dep, status, walletDone, setWalletDone, flash, note }) {
  const tour = tourOf(dep)
  const veh = vehicleOf(dep)
  const guide = GUIDES.find((g) => g.id === dep.guideIds[0])
  const boarded = pax.filter((p) => status[p.id]?.s === 'boarded')
  const all = boarded.length === pax.length
  const at = all ? Math.max(...boarded.map((p) => status[p.id].at)) : null
  const seats = pax.map((p) => p.seat).filter(Boolean).join(' · ')
  const kind = KIND[tour.kind]
  const bring = [
    { k: 'sun', icon: Sun },
    { k: 'hat', icon: BaseballCap },
    { k: 'id', icon: IdentificationCard },
    { k: 'water', icon: Drop },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Passe */}
      <Reveal>
        <div className="smoke grain relative rounded-[32px] text-white shadow-dark">
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-7 items-center gap-2 rounded-full bg-white/10 px-3 text-[11.5px] font-semibold">
                <span className="size-1.5 rounded-full" style={{ background: kind.color }} /> {veh.name}
              </span>
              <span className="font-mono text-[12px] text-white/55 tnum">{t.date}</span>
            </div>
            <h1 className="mt-5 text-[26px] font-semibold leading-[1.1] tracking-[-0.025em]">{t.tours[tour.id] ?? tour.name}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-white/60"><MapPin size={14} /> {tour.meeting}</p>
            <div className="mt-6 flex flex-col items-start gap-4">
              <span className="font-mono text-[76px] font-medium leading-[0.85] tracking-[-0.05em] text-white tnum">{fmt(dep.start)}</span>
              <AnimatePresence mode="wait" initial={false}>
                {all ? (
                  <motion.span key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease }} className="inline-flex h-9 items-center gap-2 rounded-full bg-lime px-3.5 text-[12.5px] font-semibold text-negro">
                    <Check size={14} weight="bold" /> {t.confirmed}
                  </motion.span>
                ) : (
                  <motion.span key="by" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[12.5px] font-medium">
                    {t.boardBy} <span className="font-mono tnum text-lime">{fmt(dep.start - 15)}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {all && <p className="mt-3 text-left font-mono text-[11.5px] text-white/50 tnum">{t.confirmedAt} {fmt(at)}</p>}
            {!all && boarded.length > 0 && <p className="mt-3 text-left font-mono text-[11.5px] text-lime tnum">{boarded.length} {t.of} {pax.length} {t.partial}</p>}
          </div>

          {/* perfuração */}
          <div className="relative h-7">
            <span className="absolute -left-3.5 top-0 size-7 rounded-full bg-canvas" />
            <span className="absolute -right-3.5 top-0 size-7 rounded-full bg-canvas" />
            <div className="absolute inset-x-8 top-1/2 border-t-2 border-dashed border-white/15" />
          </div>

          <div className="relative p-6 pt-4">
            <div className="relative mx-auto grid aspect-square w-full max-w-[250px] place-items-center rounded-[28px] bg-white p-9">
              <Corners />
              <QRCodeSVG value={code} level="M" size={256} bgColor="#FFFFFF" fgColor="#16130F" className="h-full w-full" />
              {all && <span className="absolute -bottom-2.5 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full bg-lime text-negro ring-4 ring-[#1b1813]"><Check size={16} weight="bold" /></span>}
            </div>
            <p className="mt-5 text-center font-mono text-[22px] font-medium tracking-[0.04em] tnum">{code}</p>
            <p className="mt-1 text-center text-[12px] text-white/50">{t.show}</p>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">{t.passengers}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pax.map((p) => (
                    <span key={p.id} className="inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-[12.5px] font-medium">{p.name}</span>
                  ))}
                </div>
              </div>
              {seats && (
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">{t.seats}</p>
                  <p className="mt-2 font-mono text-[15px] font-medium text-lime tnum">{seats}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Ponto de encontro */}
      <Reveal i={1}>
        <section className="overflow-hidden rounded-[28px] bg-surface shadow-soft">
          <MapCard label={t.meeting} />
          <div className="flex items-center justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{t.meeting}</p>
              <p className="mt-1 text-[16px] font-semibold tracking-[-0.01em]">{tour.meeting}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-3">{t.arrive}</p>
            </div>
            <button className="grid size-11 shrink-0 place-items-center rounded-full bg-negro text-white shadow-dark transition-transform active:scale-95" aria-label={t.route} title={t.route} onClick={() => flash(t.route)}>
              <NavigationArrow size={18} weight="fill" />
            </button>
          </div>
        </section>
      </Reveal>

      {/* O que levar */}
      <Reveal i={2}>
        <section className="rounded-[28px] bg-surface p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{t.bring}</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {bring.map(({ k, icon: Icon }) => (
              <div key={k} className="flex flex-col items-center gap-2 rounded-[18px] bg-sunken px-1 py-3.5 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-surface text-ink shadow-pill"><Icon size={19} /></span>
                <span className="text-[11.5px] font-medium leading-tight text-ink-2">{t[k]}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Guia */}
      {guide && (
        <Reveal i={3}>
          <section className="flex items-center gap-4 rounded-[28px] bg-surface p-5 shadow-soft">
            <Avatar initials={guide.initials} hue={guide.hue} size={52} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{t.guide}</p>
              <p className="mt-0.5 truncate text-[16px] font-semibold tracking-[-0.01em]">{guide.name}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="mr-0.5 text-[12px] text-ink-3">{t.speaks}</span>
                {guide.langs.map((l) => <LangTag key={l} code={l} />)}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[13px] font-medium tnum"><Star size={14} weight="fill" className="text-solimoes" />{guide.rating}</span>
          </section>
        </Reveal>
      )}

      {/* Ações */}
      <Reveal i={4}>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => { setWalletDone(true); flash(t.walletOk) }}
            className={cx('inline-flex h-14 items-center justify-center gap-2.5 rounded-full text-[14.5px] font-semibold transition-[background,transform] duration-150 active:scale-[0.98]', walletDone ? 'bg-lime text-negro' : 'bg-negro text-white shadow-dark hover:bg-negro-2')}
          >
            {walletDone ? <Check size={18} weight="bold" /> : <Wallet size={18} />}
            {walletDone ? t.walletOk : t.wallet}
          </button>
          <button onClick={() => flash(t.whatsappOk)} className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-surface text-[14.5px] font-semibold text-ink shadow-pill transition-[background,transform] duration-150 hover:bg-frame active:scale-[0.98]">
            <WhatsappLogo size={19} className="text-transfer" weight="fill" /> {t.whatsapp}
          </button>
          <div className="h-6 text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              {note && <motion.p key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-[12.5px] text-ink-3">{note}</motion.p>}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
