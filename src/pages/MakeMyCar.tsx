import { useEffect, useState, useRef } from 'react'
import { createCarPage, type CreateCarProgress } from '@/lib/carPages'
import { CarReveal } from '@/components/CarReveal'
import {
  CAR_BRAND,
  CAR_LOADING_DURATION_MS,
  CAR_TITLE_MAKE,
} from '@/lib/carBrand'

const STAGE_LABEL: Record<CreateCarProgress['stage'], string> = {
  compressing: '正在压缩图片…',
  uploading: '正在上传…',
  finishing: '正在生成链接…',
}

export function MakeMyCar() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [duration, setDuration] = useState(CAR_LOADING_DURATION_MS / 1000)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<CreateCarProgress | null>(null)
  const [result, setResult] = useState<{ slug: string; pageUrl: string } | null>(null)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = CAR_TITLE_MAKE
  }, [])

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
    setProgress(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('请先选择图片'); return }
    setLoading(true)
    setError('')
    setProgress({ percent: 0, stage: 'compressing', etaSeconds: null })
    try {
      const data = await createCarPage(file, duration * 1000, setProgress)
      setResult({ slug: data.slug, pageUrl: `${window.location.origin}/car/${data.slug}` })
    } catch (err: any) {
      setError(err.message || '上传失败，请重试')
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-white px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-sm font-bold">
            租
          </div>
          <div>
            <h1 className="text-xl font-bold">{CAR_BRAND}</h1>
            <p className="text-xs text-zinc-400">分享页生成</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">图片</label>
            <div
              onClick={() => !loading && inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900 p-6 transition hover:border-sky-500"
            >
              {preview
                ? <img src={preview} className="max-h-40 rounded-lg object-contain" />
                : <span className="text-sm text-zinc-500">点击选择图片（jpg / png / webp）</span>
              }
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={loading}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              加载时长：<span className="text-sky-400">{duration} 秒</span>
            </label>
            <input
              type="range" min={1} max={10} step={0.5}
              value={duration}
              disabled={loading}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          {preview && !loading && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300 hover:border-sky-500 hover:text-white transition"
            >
              预览效果
            </button>
          )}

          {loading && progress && (
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                <span>{STAGE_LABEL[progress.stage]}</span>
                <span className="tabular-nums text-sky-400">{progress.percent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-200"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                {progress.etaSeconds == null
                  ? '正在处理，请稍候…'
                  : progress.etaSeconds <= 0
                    ? '即将完成'
                    : `预计剩余约 ${progress.etaSeconds} 秒`}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 py-2.5 font-medium text-white transition hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? '处理中…' : '生成链接'}
          </button>
        </form>

        {result && !loading && (
          <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
            <p className="mb-2 text-sm text-zinc-400">链接已生成，复制发给别人：</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={result.pageUrl}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(result.pageUrl)}
                className="shrink-0 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-400 transition"
              >
                复制
              </button>
            </div>
            <a
              href={result.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-xs text-sky-400 hover:underline"
            >
              点此打开查看效果 →
            </a>
          </div>
        )}
      </div>

      {showPreview && preview && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            关闭预览
          </button>
          <CarReveal
            imageUrl={preview}
            loadingDuration={duration * 1000}
            onDone={() => {}}
          />
        </div>
      )}
    </main>
  )
}
