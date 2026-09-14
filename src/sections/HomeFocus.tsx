import { Bot, Camera, Workflow } from 'lucide-react'
import { BlurFade } from '@/components/BlurFade'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

const FOCUS_ITEMS = [
  {
    icon: Workflow,
    titleKey: 'homeFocus.automation.title',
    descriptionKey: 'homeFocus.automation.description',
  },
  {
    icon: Bot,
    titleKey: 'homeFocus.ai.title',
    descriptionKey: 'homeFocus.ai.description',
  },
  {
    icon: Camera,
    titleKey: 'homeFocus.craft.title',
    descriptionKey: 'homeFocus.craft.description',
  },
] as const

export function HomeFocus() {
  const { t } = useTranslation()

  return (
    <section id="focus" className="mx-auto w-full max-w-4xl">
      <BlurFade delay={BLUR_FADE_DELAY * 6}>
        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl font-bold">{t('homeFocus.title')}</h2>
          <p className="text-muted-foreground">{t('homeFocus.description')}</p>
        </div>
      </BlurFade>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {FOCUS_ITEMS.map((item, index) => {
          const Icon = item.icon

          return (
            <BlurFade
              key={item.titleKey}
              delay={BLUR_FADE_DELAY * 7 + index * 0.04}
            >
              <article className="h-full rounded-lg border bg-card p-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(item.descriptionKey)}
                </p>
              </article>
            </BlurFade>
          )
        })}
      </div>
    </section>
  )
}
