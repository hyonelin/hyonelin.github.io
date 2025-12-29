import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { Badge } from '@/components/Badge'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
}

export function Blog() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/blogs/index.json')
      .then((res) => res.json())
      .then((data: BlogPost[]) => {
        const sorted = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setPosts(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <BlurFade delay={0.04}>
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('blog.backToHome')}
          </Link>
        </BlurFade>

        <BlurFade delay={0.08}>
          <h1 className="text-3xl font-bold tracking-tight">{t('blog.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('blog.description')}</p>
        </BlurFade>

        <div className="mt-8 space-y-6">
          {loading ? (
            <p className="text-muted-foreground">{t('blog.loading')}</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">{t('blog.noPosts')}</p>
          ) : (
            posts.map((post, index) => (
              <BlurFade key={post.slug} delay={0.12 + index * 0.05}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </BlurFade>
            ))
          )}
        </div>
      </div>
      <Navbar />
    </main>
  )
}
