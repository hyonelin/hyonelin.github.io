import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { ArrowUpRight, Camera, FileText, NotebookPen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

const LINKS = [
  { to: '/resume', labelKey: 'nav.resume', hintKey: 'quickLinks.resumeHint', icon: FileText },
  { to: '/photography', labelKey: 'nav.photography', hintKey: 'quickLinks.photoHint', icon: Camera },
  { to: '/blog', labelKey: 'nav.blog', hintKey: 'quickLinks.blogHint', icon: NotebookPen },
] as const

export function QuickLinks() {
  const { t } = useTranslation()

  return (
    <section id="explore" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 12}>
        <h2 className="text-xl font-bold">{t('quickLinks.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('quickLinks.description')}</p>
      </BlurFade>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LINKS.map((item, index) => {
          const Icon = item.icon
          return (
            <BlurFade key={item.to} delay={BLUR_FADE_DELAY * 13 + index * 0.04}>
              <Link
                to={item.to}
                className="group flex h-full flex-col justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="mt-3">
                  <div className="font-medium">{t(item.labelKey)}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(item.hintKey)}
                  </p>
                </div>
              </Link>
            </BlurFade>
          )
        })}
      </div>
    </section>
  )
}
