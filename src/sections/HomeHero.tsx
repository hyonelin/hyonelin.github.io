import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MapPin, NotebookPen, Sparkles } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { BlurFade } from '@/components/BlurFade'
import { DATA } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

const HIGHLIGHTS = [
  { labelKey: 'homeHero.highlights.role.label', valueKey: 'homeHero.highlights.role.value' },
  { labelKey: 'homeHero.highlights.automation.label', valueKey: 'homeHero.highlights.automation.value' },
  { labelKey: 'homeHero.highlights.stack.label', valueKey: 'homeHero.highlights.stack.value' },
] as const

export function HomeHero() {
  const { t } = useTranslation()

  return (
    <section id="hero" className="mx-auto w-full max-w-4xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="space-y-6">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {t('homeHero.eyebrow')}
            </div>
          </BlurFade>

          <div className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                {t('homeHero.title')}
              </h1>
            </BlurFade>
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t('homeHero.subtitle')}
              </p>
            </BlurFade>
          </div>

          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/resume"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <FileText className="h-4 w-4" />
                {t('homeHero.primaryCta')}
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/70"
              >
                <NotebookPen className="h-4 w-4" />
                {t('homeHero.secondaryCta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <aside className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-4">
              <Avatar
                src={DATA.avatarUrl}
                alt={DATA.name}
                fallback={DATA.initials}
                className="h-16 w-16 border"
              />
              <div>
                <div className="text-lg font-semibold">{DATA.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {t(DATA.locationKey)}
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item.labelKey}>
                  <dt className="text-xs uppercase text-muted-foreground">
                    {t(item.labelKey)}
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{t(item.valueKey)}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </BlurFade>
      </div>
    </section>
  )
}
