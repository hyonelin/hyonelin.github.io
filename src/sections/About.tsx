import { BlurFade } from '@/components/BlurFade'
import { DATA } from '@/data/resume'

const BLUR_FADE_DELAY = 0.04

export function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 4}>
        <h2 className="text-xl font-bold">关于我</h2>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 5}>
        <p className="mt-2 text-pretty text-muted-foreground">
          {DATA.summary}
        </p>
      </BlurFade>
    </section>
  )
}
