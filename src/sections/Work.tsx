import { BlurFade } from '@/components/BlurFade'
import { ResumeCard } from '@/components/ResumeCard'
import { DATA } from '@/data/resume'

const BLUR_FADE_DELAY = 0.04

export function Work() {
  return (
    <section id="work" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 8}>
        <h2 className="text-xl font-bold">工作经历</h2>
      </BlurFade>
      <div className="mt-4">
        {DATA.work.map((work, index) => (
          <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 9 + index * 0.05}>
            <ResumeCard
              logoUrl={work.logoUrl}
              altText={work.company}
              title={work.company}
              subtitle={work.title}
              href={work.href}
              badges={work.badges}
              period={`${work.start} - ${work.end}`}
              description={work.description}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
