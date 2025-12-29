import { BlurFade } from '@/components/BlurFade'
import { ResumeCard } from '@/components/ResumeCard'
import { DATA, getLocalizedText } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

export function Work() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <section id="work" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 8}>
        <h2 className="text-xl font-bold">{t('work.title')}</h2>
      </BlurFade>
      <div className="mt-4">
        {DATA.work.map((work, index) => (
          <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 9 + index * 0.05}>
            <ResumeCard
              logoUrl={(work as any).logoUrl || ""}
              altText={work.company}
              title={work.company}
              subtitle={getLocalizedText(work.title, lang)}
              href={(work as any).href || ""}
              badges={work.badges}
              period={`${getLocalizedText(work.start, lang)} - ${work.end ? getLocalizedText(work.end, lang) : t('common.present')}`}
              description={getLocalizedText(work.description, lang)}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
