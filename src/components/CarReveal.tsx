import { useEffect, useState } from 'react'
import {
  CAR_BRAND,
  CAR_LOADING_STEPS,
} from '@/lib/carBrand'

interface CarRevealProps {
  imageUrl: string
  loadingDuration: number  // ms
  brand?: string
  loadingSteps?: string[]
  onDone?: () => void
}

type Phase = 'loading' | 'reveal'

const QQ_NUMBER = '791957992'

function PoweredByFooter({ dark }: { dark: boolean }) {
  const [copied, setCopied] = useState(false)
  const muted = dark ? 'text-zinc-500' : 'text-zinc-400'
  const link = dark
    ? 'text-zinc-400 underline underline-offset-2 hover:text-zinc-300'
    : 'text-zinc-500 underline underline-offset-2 hover:text-zinc-700'

  async function handleCopyQQ(e: React.MouseEvent) {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(QQ_NUMBER)
    } catch {
      const input = document.createElement('input')
      input.value = QQ_NUMBER
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
      <p className={`text-[11px] leading-5 ${muted}`}>
        想要定制？联系QQ：
        <button type="button" onClick={handleCopyQQ} className={`${link} cursor-pointer bg-transparent p-0 font-inherit`}>
          {QQ_NUMBER}
        </button>
        <br />
        Powered by hyonelin
      </p>
      {copied && (
        <p className={`mt-1 text-[11px] ${dark ? 'text-sky-400' : 'text-sky-600'}`}>
          号码已复制，黏贴到 QQ 添加
        </p>
      )}
    </div>
  )
}

export function CarReveal({
  imageUrl,
  loadingDuration,
  brand = CAR_BRAND,
  loadingSteps = CAR_LOADING_STEPS,
  onDone,
}: CarRevealProps) {
  const steps = loadingSteps.length > 0 ? loadingSteps : CAR_LOADING_STEPS
  const [phase, setPhase] = useState<Phase>('loading')
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const titleLoading = `${brand} - 车辆解锁中`
  const titleReveal = `${brand} - 用车服务`

  useEffect(() => {
    document.title = phase === 'loading' ? titleLoading : titleReveal
  }, [phase, titleLoading, titleReveal])

  useEffect(() => {
    setPhase('loading')
    setStepIdx(0)
    setProgress(0)
    document.title = titleLoading

    const stepInterval = loadingDuration / (steps.length + 1)
    const stepTimer = setInterval(() => {
      setStepIdx(i => {
        if (i < steps.length - 1) return i + 1
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
  }, [imageUrl, loadingDuration, brand, steps.join('|')])

  if (phase === 'loading') {
    return (
      <div className="relative flex min-h-full w-full flex-col items-center justify-center bg-zinc-950 px-8" style={{ minHeight: '100dvh' }}>
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white text-sm font-bold select-none">
            {brand.slice(0, 1) || '租'}
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">{brand}</span>
        </div>

        <div className="w-full max-w-xs">
          <div className="mb-3 flex justify-between text-xs text-zinc-400">
            <span>{steps[stepIdx]}</span>
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
