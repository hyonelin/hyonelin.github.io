import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCarPage, CarPageConfig } from '@/lib/carPages'
import { CarReveal } from '@/components/CarReveal'

export function CarPage() {
  const { slug } = useParams<{ slug: string }>()
  const [config, setConfig] = useState<CarPageConfig | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) { setError(true); return }
    getCarPage(slug)
      .then(setConfig)
      .catch(() => setError(true))
  }, [slug])

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        链接已失效或不存在
      </div>
    )
  }

  if (!config) {
    // 未加载完前先显示加载态，避免白屏
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-8">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-sky-500 animate-spin" />
      </div>
    )
  }

  return (
    <CarReveal
      imageUrl={config.imageUrl}
      brand={config.brand}
      loadingSteps={config.loadingSteps}
      loadingDuration={config.loadingDuration}
    />
  )
}
