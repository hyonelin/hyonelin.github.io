import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { Badge } from '@/components/Badge'
import { ArrowLeft, Calendar } from 'lucide-react'

interface PostMeta {
  title: string
  date: string
  description: string
  tags: string[]
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState('')
  const [meta, setMeta] = useState<PostMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return

    fetch(`/blogs/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.text()
      })
      .then((text) => {
        // 解析 frontmatter
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
        const match = text.match(frontmatterRegex)

        if (match) {
          const frontmatter = match[1]
          const markdown = match[2]

          // 简单解析 YAML frontmatter
          const metaObj: Record<string, unknown> = {}
          frontmatter.split('\n').forEach((line) => {
            const colonIndex = line.indexOf(':')
            if (colonIndex > 0) {
              const key = line.slice(0, colonIndex).trim()
              let value = line.slice(colonIndex + 1).trim()
              // 移除引号
              if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1)
              }
              // 解析数组
              if (value.startsWith('[') && value.endsWith(']')) {
                metaObj[key] = value
                  .slice(1, -1)
                  .split(',')
                  .map((s) => s.trim().replace(/"/g, ''))
              } else {
                metaObj[key] = value
              }
            }
          })

          setMeta(metaObj as unknown as PostMeta)
          setContent(markdown)
        } else {
          setContent(text)
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-muted-foreground">加载中...</p>
        </div>
        <Navbar />
      </main>
    )
  }

  if (error) {
    return (
      <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回博客列表
          </Link>
          <h1 className="text-2xl font-bold">文章未找到</h1>
          <p className="mt-2 text-muted-foreground">
            抱歉，您访问的文章不存在。
          </p>
        </div>
        <Navbar />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <article className="mx-auto max-w-2xl">
        <BlurFade delay={0.04}>
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回博客列表
          </Link>
        </BlurFade>

        {meta && (
          <BlurFade delay={0.08}>
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={meta.date}>
                  {new Date(meta.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {meta.title}
              </h1>
              {meta.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>
          </BlurFade>
        )}

        <BlurFade delay={0.12}>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </BlurFade>
      </article>
      <Navbar />
    </main>
  )
}
