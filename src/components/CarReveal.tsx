import { useEffect, useState } from 'react'
import {
  CAR_BRAND,
  CAR_LOADING_STEPS,
  CAR_TITLE_LOADING,
  CAR_TITLE_REVEAL,
} from '@/lib/carBrand'

interface CarRevealProps {
  imageUrl: string
  loadingDuration: number  // ms
  onDone?: () => void
}

type Phase = 'loading' | 'reveal'

const CONTACT_HREF = 'tencent://message/?uin=791957992&Site=qq&Menu=yes'

function PoweredByFooter({ dark }: { dark: boolean }) {
  return (
    <p className={`absolute bottom-4 left-0 right-0 text-center text-[11px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
      Powered by hyonelin,{' '}
      <a href={CONTACT_HREF} className={dark ? 'text-zinc-400 underline underline-offset-2 hover:text-zinc-300' : 'text-zinc-500 underline underline-offset-2 hover:text-zinc-700'}>
        Contact me
      </a>
    </p>
  )
}

export function CarReveal({ imageUrl, loadingDuration, onDone }: CarRevealProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    document.title = phase === 'loading' ? CAR_TITLE_LOADING : CAR_TITLE_REVEAL
  }, [phase])

  useEffect(() => {
    setPhase('loading')
    setStepIdx(0)
    setProgress(0)
    document.title = CAR_TITLE_LOADING

    const stepInterval = loadingDuration / (CAR_LOADING_STEPS.length + 1)
    const stepTimer = setInterval(() => {
      setStepIdx(i => {
        if (i < CAR_LOADING_STEPS.length - 1) return i + 1
        clearInterval(stepTimer)
        return i
      })
    }, stepInterval)

    const start = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(95, Math.round((elapsed / loadingDuration) * 95))
      setProgress(pct)
      if (elapsed >= loadingDuration) {
        clearInterval(progressTimer)
        setProgress(100)
        setTimeout(() => {
          setPhase('reveal')
          onDone?.()
        }, 400)
      }
    }, 30)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
    }
  }, [imageUrl, loadingDuration])

  if (phase === 'loading') {
    return (
      <div className="relative flex min-h-full w-full flex-col items-center justify-center bg-zinc-950 px-8" style={{ minHeight: '100dvh' }}>
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white text-sm font-bold select-none">
            租
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">{CAR_BRAND}</span>
        </div>

        <div className="w-full max-w-xs">
          <div className="mb-3 flex justify-between text-xs text-zinc-400">
            <span>{CAR_LOADING_STEPS[stepIdx]}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-12 h-8 w-8 rounded-full border-2 border-zinc-700 border-t-sky-500 animate-spin" />
        <PoweredByFooter dark />
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-full w-full items-center justify-center bg-white p-0"
      style={{ minHeight: '100dvh', animation: 'carFadeIn 0.4s ease' }}
    >
      <style>{`@keyframes carFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <img
        src={imageUrl}
        alt="这我小车车"
        className="block h-auto w-full max-w-sm object-contain"
      />
      <PoweredByFooter dark={false} />
    </div>
  )
}
