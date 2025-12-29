import { BlurFade } from '@/components/BlurFade'
import { Badge } from '@/components/Badge'
import { DATA } from '@/data/resume'

const BLUR_FADE_DELAY = 0.04

export function Skills() {
  return (
    <section id="skills" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 6}>
        <h2 className="text-xl font-bold">技能</h2>
      </BlurFade>
      <div className="mt-2 flex flex-wrap gap-1">
        {DATA.skills.map((skill, index) => (
          <BlurFade key={skill} delay={BLUR_FADE_DELAY * 7 + index * 0.02}>
            <Badge variant="secondary">{skill}</Badge>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
