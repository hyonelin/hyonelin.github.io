import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ImagePlus,
  Download,
  AlertCircle,
  Check,
  ExternalLink,
} from 'lucide-react'
import { WORKER_URL, authHeaders } from '@/lib/adminApi'
import {
  type BlogIndexItem,
  type BlogLang,
  checkBlogApiAvailable,
  fetchBlogMarkdown,
  parseMarkdownFrontmatter,
} from '@/lib/blogs'

interface AdminPostsProps {
  password: string
}

type EditorState = {
  slug: string
  title: string
  date: string
  description: string
  tags: string
  content: string
  isNew: boolean
}

const emptyEditor = (): EditorState => ({
  slug: '',
  title: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  tags: '',
  content: '',
  isNew: true,
})

export function AdminPosts({ password }: AdminPostsProps) {
  const [lang, setLang] = useState<BlogLang>('cn')
  const [posts, setPosts] = useState<BlogIndexItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [apiWarning, setApiWarning] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const health = await checkBlogApiAvailable(WORKER_URL)
      if (!health.ok) {
        setApiWarning(health.message)
        setPosts([])
        return
      }
      setApiWarning('')
      const response = await fetch(`${WORKER_URL}/api/blogs?lang=${lang}`)
      const data = await response.json()
      const remote: BlogIndexItem[] = data.posts || []
      setPosts(remote)
    } catch {
      setError('加载文章列表失败')
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    loadPosts()
    setEditor(null)
  }, [loadPosts])

  const openNew = () => {
    setMessage('')
    setError('')
    setEditor(emptyEditor())
  }

  const openEdit = async (post: BlogIndexItem) => {
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const response = await fetch(
        `${WORKER_URL}/api/blogs/post?lang=${lang}&slug=${encodeURIComponent(post.slug)}`
      )
      if (response.ok) {
        const data = await response.json()
        const parsed = parseMarkdownFrontmatter(data.markdown || '')
        setEditor({
          slug: post.slug,
          title: parsed.meta.title || post.title,
          date: parsed.meta.date || post.date,
          description: parsed.meta.description || post.description || '',
          tags: (parsed.meta.tags || post.tags || []).join(', '),
          content: parsed.content,
          isNew: false,
        })
      } else {
        // Fallback: try public R2/local markdown
        const markdown = await fetchBlogMarkdown(lang, post.slug)
        const parsed = parseMarkdownFrontmatter(markdown)
        setEditor({
          slug: post.slug,
          title: parsed.meta.title || post.title,
          date: parsed.meta.date || post.date,
          description: parsed.meta.description || post.description || '',
          tags: (parsed.meta.tags || post.tags || []).join(', '),
          content: parsed.content,
          isNew: false,
        })
      }
    } catch {
      setError('读取文章失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!editor) return
    if (!editor.title.trim() || !editor.date) {
      setError('请填写标题和日期')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const tags = editor.tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean)

      const response = await fetch(`${WORKER_URL}/api/blogs/post`, {
        method: 'PUT',
        headers: authHeaders(password, true),
        body: JSON.stringify({
          lang,
          slug: editor.isNew ? undefined : editor.slug,
          title: editor.title.trim(),
          date: editor.date,
          description: editor.description.trim(),
          tags,
          content: editor.content,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.error || '保存失败')
        return
      }
      setMessage(`已保存：${data.slug}`)
      setEditor({ ...editor, slug: data.slug, isNew: false })
      await loadPosts()
    } catch {
      setError('保存失败，请确认 Worker 已部署最新代码')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm(`确定删除文章「${slug}」？`)) return
    setError('')
    try {
      const response = await fetch(
        `${WORKER_URL}/api/blogs/post?lang=${lang}&slug=${encodeURIComponent(slug)}`,
        { method: 'DELETE', headers: authHeaders(password) }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.error || '删除失败')
        return
      }
      if (editor?.slug === slug) setEditor(null)
      await loadPosts()
      setMessage('已删除')
    } catch {
      setError('删除失败')
    }
  }

  const insertAtCursor = (snippet: string) => {
    const el = textareaRef.current
    if (!el || !editor) {
      setEditor((prev) => (prev ? { ...prev, content: prev.content + snippet } : prev))
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = editor.content.slice(0, start) + snippet + editor.content.slice(end)
    setEditor({ ...editor, content: next })
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }

  const handleImageUpload = async (file: File | null) => {
    if (!file || !editor) return
    setUploadingImage(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${WORKER_URL}/api/blogs/upload-image`, {
        method: 'POST',
        headers: authHeaders(password),
        body: formData,
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.error || '图片上传失败')
        return
      }
      insertAtCursor(`\n![${file.name}](${data.url})\n`)
      setMessage('图片已插入到正文光标处')
    } catch {
      setError('图片上传失败，请确认 Worker 已部署最新代码')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /** Import existing site posts (local public/blogs) into R2 so they become editable */
  const handleImportFromSite = async () => {
    setImporting(true)
    setError('')
    setMessage('')
    try {
      const health = await checkBlogApiAvailable(WORKER_URL)
      if (!health.ok) {
        setError(health.message)
        setApiWarning(health.message)
        return
      }

      // Prefer local public/blogs for import source (not R2)
      const localRes = await fetch(`/blogs/${lang}/index.json`)
      if (!localRes.ok) {
        setError('读不到本地文章列表 /blogs/.../index.json')
        return
      }
      const localPosts = (await localRes.json()) as BlogIndexItem[]
      if (!Array.isArray(localPosts) || localPosts.length === 0) {
        setMessage('本地没有可导入的文章')
        return
      }

      let imported = 0
      const failures: string[] = []

      for (const post of localPosts) {
        try {
          const markdown = await fetchBlogMarkdown(lang, post.slug, { localOnly: true })
          const parsed = parseMarkdownFrontmatter(markdown)
          const headingMatch = parsed.content.match(/^#\s+(.+)$/m)
          const response = await fetch(`${WORKER_URL}/api/blogs/post`, {
            method: 'PUT',
            headers: authHeaders(password, true),
            body: JSON.stringify({
              lang,
              slug: post.slug,
              title: parsed.meta.title || post.title || headingMatch?.[1] || post.slug,
              date: parsed.meta.date || post.date,
              description: parsed.meta.description || post.description || '',
              tags: parsed.meta.tags || post.tags || [],
              cover: parsed.meta.cover || post.cover || '',
              content: parsed.content,
            }),
          })
          if (response.ok) {
            imported += 1
          } else {
            const data = await response.json().catch(() => ({}))
            failures.push(
              `${post.slug}: ${data.error || `HTTP ${response.status}`}`
            )
          }
        } catch (err) {
          failures.push(
            `${post.slug}: ${err instanceof Error ? err.message : '未知错误'}`
          )
        }
      }

      if (imported === 0 && failures.length > 0) {
        setError(`导入失败（0 / ${localPosts.length}）。${failures[0]}`)
      } else if (failures.length > 0) {
        setMessage(`已导入 ${imported} / ${localPosts.length}。部分失败：${failures[0]}`)
      } else {
        setMessage(`已导入 ${imported} / ${localPosts.length} 篇文章到 R2`)
      }
      await loadPosts()
    } catch {
      setError('导入失败')
    } finally {
      setImporting(false)
    }
  }

  if (editor) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setEditor(null)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
            >
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              插入图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            <Check className="h-4 w-4" />
            {message}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">标题 *</span>
            <input
              value={editor.title}
              onChange={(e) => setEditor({ ...editor, title: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">日期 *</span>
            <input
              type="date"
              value={editor.date}
              onChange={(e) => setEditor({ ...editor, date: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Slug</span>
            <input
              value={editor.slug}
              disabled={!editor.isNew}
              onChange={(e) => setEditor({ ...editor, slug: e.target.value })}
              placeholder="新建时保存后自动生成"
              className="w-full rounded-lg border px-3 py-2 disabled:bg-muted"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">摘要</span>
            <input
              value={editor.description}
              onChange={(e) => setEditor({ ...editor, description: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">标签（逗号分隔）</span>
            <input
              value={editor.tags}
              onChange={(e) => setEditor({ ...editor, tags: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="日常瞎鼓捣, HomeKit"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">正文（Markdown）</span>
          <textarea
            ref={textareaRef}
            value={editor.content}
            onChange={(e) => setEditor({ ...editor, content: e.target.value })}
            className="min-h-[360px] w-full rounded-lg border px-3 py-2 font-mono text-sm leading-relaxed"
            placeholder="写 Markdown… 可用上方「插入图片」把 R2 图片插到光标处"
          />
        </label>

        {!editor.isNew && (
          <a
            href={`/blog/${editor.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            查看前台（需 R2 已有内容或本地同名文章）
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">文章管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            在 R2 上创建/编辑 Markdown，上传图片后可直接插入正文。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg border p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setLang('cn')}
              className={`rounded-md px-3 py-1 ${lang === 'cn' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-md px-3 py-1 ${lang === 'en' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              English
            </button>
          </div>
          <button
            type="button"
            onClick={handleImportFromSite}
            disabled={importing}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            从站点导入
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            新建文章
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <Check className="h-4 w-4" />
          {message}
        </div>
      )}

      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        首次使用：先在本机执行 <code className="rounded bg-background px-1">cd worker && wrangler deploy</code>
        ，再点「从站点导入」把现有文章同步到 R2。之后在这里编辑会优先被前台读取。
      </div>

      {apiWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">博客接口不可用</div>
            <p className="mt-1 text-xs opacity-90">{apiWarning}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载中…
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          暂无文章。可以新建，或从站点导入已有博客。
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {posts.map((post) => (
            <li key={post.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <div className="font-medium">{post.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {post.date} · {post.slug}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post.slug)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
