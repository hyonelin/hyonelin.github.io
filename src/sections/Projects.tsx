import { BlurFade } from '@/components/BlurFade'
import { ProjectCard } from '@/components/ProjectCard'
import { DATA } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

export function Projects() {
  const { t } = useTranslation()

  return (
    <section id="projects" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 14}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{t('projects.title')}</h2>
          <p className="text-muted-foreground">{t('projects.description')}</p>
        </div>
      </BlurFade>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DATA.projects.map((project, index) => (
          <BlurFade
            key={t((project as any).titleKey)}
            delay={BLUR_FADE_DELAY * 15 + index * 0.05}
          >
            <ProjectCard
              title={t((project as any).titleKey)}
              href={project.href}
              description={t((project as any).descriptionKey)}
              dates={t((project as any).datesKey)}
              tags={project.technologies}
              image={(project as any).image}
              links={project.links.map((link) => ({
                type: link.type === 'website' ? t('projects.website') : t('projects.source'),
                href: link.href,
              }))}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
