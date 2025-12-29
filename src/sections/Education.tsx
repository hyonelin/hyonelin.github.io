import { BlurFade } from '@/components/BlurFade'
import { ResumeCard } from '@/components/ResumeCard'
import { DATA } from '@/data/resume'

const BLUR_FADE_DELAY = 0.04

export function Education() {
  return (
    <section id="education" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 12}>
        <h2 className="text-xl font-bold">教育背景</h2>
      </BlurFade>
      <div className="mt-4">
        {DATA.education.map((edu, index) => (
          <BlurFade key={edu.school} delay={BLUR_FADE_DELAY * 13 + index * 0.05}>
            <ResumeCard
              logoUrl={edu.logoUrl}
              altText={edu.school}
              title={edu.school}
              subtitle={edu.degree}
              href={edu.href}
              period={`${edu.start} - ${edu.end}`}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
