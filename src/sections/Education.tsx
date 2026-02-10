import { BlurFade } from '@/components/BlurFade'
import { ResumeCard } from '@/components/ResumeCard'
import { DATA } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

export function Education() {
  const { t } = useTranslation()

  return (
    <section id="education" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 12}>
        <h2 className="text-xl font-bold">{t('education.title')}</h2>
      </BlurFade>
      <div className="mt-4">
        {DATA.education.map((edu, index) => (
          <BlurFade key={edu.school} delay={BLUR_FADE_DELAY * 13 + index * 0.05}>
            <ResumeCard
              logoUrl={edu.logoUrl}
              altText={edu.school}
              title={edu.school}
              subtitle={t((edu as any).degreeKey)}
              href={edu.href}
              period={`${t((edu as any).startKey)} - ${t((edu as any).endKey)}`}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
