import { useEffect, useState } from 'react'

interface CarRevealProps {
  imageUrl: string
  brand: string
  loadingSteps: string[]
  loadingDuration: number  // ms
  onDone?: () => void
}

type Phase = 'loading' | 'reveal'

export function CarReveal({ imageUrl, brand, loadingSteps, loadingDuration, onDone }: CarRevealProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setPhase('loading')
    setStepIdx(0)
    setProgress(0)

    const stepInterval = loadingDuration / (loadingSteps.length + 1)
    const stepTimer = setInterval(() => {
      setStepIdx(i => {
        if (i < loadingSteps.length - 1) return i + 1
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
  }, [imageUrl, brand, loadingSteps.join('|'), loadingDuration])

  if (phase === 'loading') {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-zinc-950 px-8" style={{ minHeight: '100dvh' }}>
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-lg select-none">
            🚗
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">{brand}</span>
        </div>

        <div className="w-full max-w-xs">
          <div className="mb-3 flex justify-between text-xs text-zinc-400">
            <span>{loadingSteps[stepIdx]}</span>
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
      </div>
    )
  }

  return (
    <div
      className="flex min-h-full w-full items-center justify-center bg-white p-0"
      style={{ minHeight: '100dvh', animation: 'carFadeIn 0.4s ease' }}
    >
      <style>{`@keyframes carFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <img
        src={imageUrl}
        alt="这我小车车"
        className="block h-auto w-full max-w-sm object-contain"
      />
    </div>
  )
}
