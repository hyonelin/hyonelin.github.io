import { BlurFade } from '@/components/BlurFade'
import { ProjectCard, type ProjectLinkType } from '@/components/ProjectCard'
import { DATA } from '@/data/resume'
import { useTranslation } from 'react-i18next'

const BLUR_FADE_DELAY = 0.04

interface ProjectsProps {
  variant?: 'compact' | 'detailed'
}

function linkLabel(
  type: ProjectLinkType,
  t: (key: string) => string
): string {
  switch (type) {
    case 'website':
      return t('projects.website')
    case 'current':
      return t('projects.thisSite')
    case 'source':
      return t('projects.source')
    case 'blog':
      return t('projects.blog')
    case 'internal':
      return t('projects.internal')
    default:
      return type
  }
}

export function Projects({ variant = 'compact' }: ProjectsProps) {
  const { t } = useTranslation()

  return (
    <section id="projects" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 14}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{t('projects.title')}</h2>
          <p className="text-muted-foreground">{t('projects.description')}</p>
        </div>
      </BlurFade>
      <div
        className={
          variant === 'detailed'
            ? 'mt-4 grid grid-cols-1 gap-4'
            : 'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'
        }
      >
        {DATA.projects.map((project, index) => {
          const categoryKey = project.categoryKey
          const problemKey = 'problemKey' in project ? project.problemKey : undefined
          const solutionKey = 'solutionKey' in project ? project.solutionKey : undefined
          const impactKey = 'impactKey' in project ? project.impactKey : undefined

          return (
            <BlurFade
              key={project.titleKey}
              delay={BLUR_FADE_DELAY * 15 + index * 0.05}
            >
              <ProjectCard
                title={t(project.titleKey)}
                href={project.href || undefined}
                description={t(project.descriptionKey)}
                category={t(categoryKey)}
                tags={project.technologies}
                variant={variant}
                problem={problemKey ? t(problemKey) : undefined}
                solution={solutionKey ? t(solutionKey) : undefined}
                impact={impactKey ? t(impactKey) : undefined}
                labels={{
                  problem: t('projects.problem'),
                  solution: t('projects.solution'),
                  impact: t('projects.impact'),
                }}
                links={project.links.map((link) => ({
                  type: link.type as ProjectLinkType,
                  label: linkLabel(link.type as ProjectLinkType, t),
                  href: 'href' in link ? link.href : undefined,
                }))}
              />
            </BlurFade>
          )
        })}
      </div>
    </section>
  )
}
