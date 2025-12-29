import { BlurFade } from '@/components/BlurFade'
import { DATA, getLocalizedText } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

export function About() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <section id="about" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 4}>
        <h2 className="text-xl font-bold">{t('about.title')}</h2>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 5}>
        <p className="mt-2 text-pretty text-muted-foreground">
          {getLocalizedText(DATA.summary, lang)}
        </p>
      </BlurFade>
    </section>
  )
}
