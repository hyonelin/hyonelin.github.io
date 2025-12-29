import { BlurFade } from '@/components/BlurFade'
import { Avatar } from '@/components/Avatar'
import { DATA, getLocalizedText } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

export function Hero() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <section id="hero" className="mx-auto w-full max-w-2xl space-y-8">
      <div className="flex justify-between gap-2">
        <div className="flex flex-1 flex-col space-y-1.5">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <span className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
              {t('hero.greeting', { name: DATA.name.split(' ')[0] })}
            </span>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <span className="max-w-[600px] text-muted-foreground md:text-xl">
              {getLocalizedText(DATA.description, lang)}
            </span>
          </BlurFade>
        </div>
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <Avatar
            src={DATA.avatarUrl}
            alt={DATA.name}
            fallback={DATA.initials}
            className="h-28 w-28 border"
          />
        </BlurFade>
      </div>
    </section>
  )
}
