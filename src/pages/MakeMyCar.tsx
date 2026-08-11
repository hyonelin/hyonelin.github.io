import { useState, useRef } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { createCarPage } from '@/lib/carPages'
import { CarReveal } from '@/components/CarReveal'

const DEFAULT_STEPS = ['正在连接车辆…', '核验租车权限…', '读取车辆信息…', '获取车门授权…']

export function MakeMyCar() {
  usePageTitle('make.title', '制作我的小车车')

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [brand, setBrand] = useState('AutoShare')
  const [steps, setSteps] = useState(DEFAULT_STEPS.join('\n'))
  const [duration, setDuration] = useState(3)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ slug: string; pageUrl: string } | null>(null)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('请先选择图片'); return }
    setLoading(true)
    setError('')
    try {
      const parsedSteps = steps.split('\n').map(s => s.trim()).filter(Boolean)
      const data = await createCarPage(file, brand.trim() || 'AutoShare', parsedSteps, duration * 1000)
      setResult({ slug: data.slug, pageUrl: `${window.location.origin}/car/${data.slug}` })
    } catch (err: any) {
      setError(err.message || '上传失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const parsedSteps = steps.split('\n').map(s => s.trim()).filter(Boolean)

  return (
    <main className="min-h-dvh bg-zinc-950 text-white px-4 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-2xl font-bold">制作我的小车车</h1>
        <p className="mb-8 text-sm text-zinc-400">别人扫码后会看到假的租车加载页，然后看到你上传的图片</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 图片上传 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">图片</label>
            <div
              onClick={() => inputRef.current?.click()}
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
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          {/* 假品牌名 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">加载页品牌名</label>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="AutoShare"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* 加载步骤 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">加载步骤（每行一条）</label>
            <textarea
              value={steps}
              onChange={e => setSteps(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none resize-none"
            />
          </div>

          {/* 加载时长 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              加载时长：<span className="text-sky-400">{duration} 秒</span>
            </label>
            <input
              type="range" min={1} max={10} step={0.5}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          {/* 预览按钮 */}
          {preview && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300 hover:border-sky-500 hover:text-white transition"
            >
              预览效果
            </button>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 py-2.5 font-medium text-white transition hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? '上传中…' : '生成链接'}
          </button>
        </form>

        {/* 生成结果 */}
        {result && (
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

      {/* 全屏预览 Modal */}
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
            brand={brand || 'AutoShare'}
            loadingSteps={parsedSteps.length ? parsedSteps : DEFAULT_STEPS}
            loadingDuration={duration * 1000}
            onDone={() => {}}
          />
        </div>
      )}
    </main>
  )
}
