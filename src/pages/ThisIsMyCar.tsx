import { useEffect, useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'

const CAR_PHOTO_SRC = '/IMG_2813.webp'

type Phase = 'loading' | 'reveal'

const STEPS = [
  '正在连接车辆…',
  '核验租车权限…',
  '读取车辆信息…',
  '获取车门授权…',
]

export function ThisIsMyCar() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  usePageTitle('pageTitle.thisIsMyCar', phase === 'loading' ? '正在解锁车辆…' : '这我小车车')

  useEffect(() => {
    // 步骤文字每 700ms 切换一次
    const stepTimer = setInterval(() => {
      setStepIdx(i => {
        if (i < STEPS.length - 1) return i + 1
        clearInterval(stepTimer)
        return i
      })
    }, 700)

    // 进度条在 3s 内跑到 95%，然后跳 100%
    const start = Date.now()
    const DURATION = 3000
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(95, Math.round((elapsed / DURATION) * 95))
      setProgress(pct)
      if (elapsed >= DURATION) {
        clearInterval(progressTimer)
        setProgress(100)
        setTimeout(() => setPhase('reveal'), 400)
      }
    }, 30)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
    }
  }, [])

  if (phase === 'loading') {
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-zinc-950 px-8">
        {/* 假品牌 */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-lg select-none">
            🚗
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">AutoShare</span>
        </div>

        {/* 进度条 */}
        <div className="w-full max-w-xs">
          <div className="mb-3 flex justify-between text-xs text-zinc-400">
            <span>{STEPS[stepIdx]}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 旋转图标 */}
        <div className="mt-12 h-8 w-8 rounded-full border-2 border-zinc-700 border-t-sky-500 animate-spin" />
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white p-0 animate-[fadeIn_0.4s_ease]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <img
        src={CAR_PHOTO_SRC}
        alt="干嘛! 这我小车车"
        className="block h-auto w-full max-w-sm object-contain"
      />
    </main>
  )
}
