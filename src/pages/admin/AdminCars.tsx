import { useState, useRef } from 'react'
import { createCarPage, type CreateCarProgress } from '@/lib/carPages'
import { CarReveal } from '@/components/CarReveal'
import {
  CAR_BRAND,
  CAR_LOADING_DURATION_MS,
  CAR_LOADING_STEPS,
} from '@/lib/carBrand'

const STAGE_LABEL: Record<CreateCarProgress['stage'], string> = {
  compressing: '正在压缩图片…',
  uploading: '正在上传…',
  finishing: '正在生成链接…',
}

type SlugMode = 'random' | 'custom'

interface AdminCarsProps {
  password: string
}

export function AdminCars({ password }: AdminCarsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [brand, setBrand] = useState(CAR_BRAND)
  const [steps, setSteps] = useState(CAR_LOADING_STEPS.join('\n'))
  const [duration, setDuration] = useState(CAR_LOADING_DURATION_MS / 1000)
  const [slugMode, setSlugMode] = useState<SlugMode>('random')
  const [customSlug, setCustomSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<CreateCarProgress | null>(null)
  const [result, setResult] = useState<{ slug: string; pageUrl: string } | null>(null)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parsedSteps = steps.split('\n').map(s => s.trim()).filter(Boolean)

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
    if (slugMode === 'custom') {
      const slug = customSlug.trim().toLowerCase()
      if (!/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/.test(slug) || slug.length < 3) {
        setError('自定义 URL 需 3–32 位，仅小写字母/数字/连字符，不能首尾连字符')
        return
      }
    }
    if (parsedSteps.length === 0) {
      setError('请至少填写一条加载步骤')
      return
    }

    setLoading(true)
    setError('')
    setProgress({ percent: 0, stage: 'compressing', etaSeconds: null })
    try {
      const data = await createCarPage(file, {
        password,
        loadingDuration: duration * 1000,
        brand: brand.trim() || CAR_BRAND,
        loadingSteps: parsedSteps,
        slug: slugMode === 'custom' ? customSlug.trim().toLowerCase() : undefined,
        onProgress: setProgress,
      })
      setResult({ slug: data.slug, pageUrl: `${window.location.origin}/car/${data.slug}` })
    } catch (err: any) {
      setError(err.message || '上传失败，请重试')
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">租车页制作</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          生成 `/car/...` 链接。仅管理员可用，不会出现在公开菜单。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-card p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">图片</label>
          <div
            onClick={() => !loading && inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-background p-6 transition hover:border-primary"
          >
            {preview
              ? <img src={preview} className="max-h-40 rounded-lg object-contain" alt="preview" />
              : <span className="text-sm text-muted-foreground">点击选择图片（jpg / png / webp）</span>
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
          <label className="mb-1.5 block text-sm font-medium">品牌名</label>
          <input
            value={brand}
            disabled={loading}
            onChange={e => setBrand(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={CAR_BRAND}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">加载步骤（每行一条）</label>
          <textarea
            value={steps}
            disabled={loading}
            onChange={e => setSteps(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            加载时长：<span className="text-primary">{duration} 秒</span>
          </label>
          <input
            type="range" min={1} max={10} step={0.5}
            value={duration}
            disabled={loading}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">链接 URL</label>
          <div className="mb-2 inline-flex rounded-lg border p-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => setSlugMode('random')}
              className={`rounded-md px-3 py-1.5 text-sm ${
                slugMode === 'random' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              随机
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setSlugMode('custom')}
              className={`rounded-md px-3 py-1.5 text-sm ${
                slugMode === 'custom' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              自定义
            </button>
          </div>
          {slugMode === 'custom' ? (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-muted-foreground">/car/</span>
              <input
                value={customSlug}
                disabled={loading}
                onChange={e => setCustomSlug(e.target.value.toLowerCase())}
                placeholder="my-car"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">生成后会得到类似 /car/a1b2c3d 的随机路径</p>
          )}
        </div>

        {preview && !loading && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full rounded-lg border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            预览效果
          </button>
        )}

        {loading && progress && (
          <div className="rounded-xl border bg-background px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{STAGE_LABEL[progress.stage]}</span>
              <span className="tabular-nums text-primary">{progress.percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {progress.etaSeconds == null
                ? '正在处理，请稍候…'
                : progress.etaSeconds <= 0
                  ? '即将完成'
                  : `预计剩余约 ${progress.etaSeconds} 秒`}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '处理中…' : '生成链接'}
        </button>
      </form>

      {result && !loading && (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-sm text-muted-foreground">链接已生成：</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.pageUrl}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(result.pageUrl)}
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              复制
            </button>
          </div>
          <a
            href={result.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs text-primary hover:underline"
          >
            点此打开查看效果 →
          </a>
        </div>
      )}

      {showPreview && preview && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            关闭预览
          </button>
          <CarReveal
            imageUrl={preview}
            brand={brand.trim() || CAR_BRAND}
            loadingSteps={parsedSteps.length ? parsedSteps : CAR_LOADING_STEPS}
            loadingDuration={duration * 1000}
            onDone={() => {}}
          />
        </div>
      )}
    </div>
  )
}
