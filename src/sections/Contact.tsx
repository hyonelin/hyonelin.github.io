import { BlurFade } from '@/components/BlurFade'
import { DATA } from '@/data/resume'

const BLUR_FADE_DELAY = 0.04

export function Contact() {
  return (
    <section id="contact" className="mx-auto w-full max-w-2xl pb-24">
      <BlurFade delay={BLUR_FADE_DELAY * 18}>
        <div className="space-y-3">
          <h2 className="text-xl font-bold">联系我</h2>
          <p className="text-muted-foreground">
            想要交流或合作？欢迎通过以下方式联系我，我会尽快回复。
          </p>
        </div>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 19}>
        <div className="mt-4 flex gap-4">
          {DATA.contact.social.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border bg-card p-3 transition-colors hover:bg-secondary"
                aria-label={social.name}
              >
                <Icon className="h-5 w-5" />
              </a>
            )
          })}
        </div>
      </BlurFade>
    </section>
  )
}
