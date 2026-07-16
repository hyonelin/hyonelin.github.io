import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { Badge } from '@/components/Badge'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'

interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
}

export function Blog() {
  const { t, i18n } = useTranslation()
  usePageTitle('pageTitle.blog')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const lang = i18n.language === 'zh' ? 'cn' : 'en'

  useEffect(() => {
    fetch(`/blogs/${lang}/index.json`)
      .then((res) => res.json())
      .then((data: BlogPost[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setPosts(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lang])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'cn' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const allTags = ['all', ...new Set(posts.flatMap((p) => p.tags))]
  const filteredPosts = selectedTag === 'all' 
    ? posts 
    : posts.filter((p) => p.tags.includes(selectedTag))

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

        {/* Tag 筛选 */}
        <BlurFade delay={0.12}>
          <div className="mt-8 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {tag === 'all' ? t('blog.allTags') : tag}
              </button>
            ))}
          </div>
        </BlurFade>

        <div className="mt-8 space-y-6">
          {loading ? (
            <p className="text-muted-foreground">{t('blog.loading')}</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-muted-foreground">{t('blog.noPosts')}</p>
          ) : (
            filteredPosts.map((post, index) => (
              <BlurFade key={post.slug} delay={0.12 + index * 0.05}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
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
