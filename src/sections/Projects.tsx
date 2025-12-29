import { BlurFade } from '@/components/BlurFade'
import { ProjectCard } from '@/components/ProjectCard'
import { DATA } from '@/data/resume'

const BLUR_FADE_DELAY = 0.04

export function Projects() {
  return (
    <section id="projects" className="mx-auto w-full max-w-2xl">
      <BlurFade delay={BLUR_FADE_DELAY * 14}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">我的项目</h2>
          <p className="text-muted-foreground">
            这里是我参与开发的一些项目，涵盖了不同的技术栈和应用场景。
          </p>
        </div>
      </BlurFade>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DATA.projects.map((project, index) => (
          <BlurFade key={project.title} delay={BLUR_FADE_DELAY * 15 + index * 0.05}>
            <ProjectCard
              title={project.title}
              href={project.href}
              description={project.description}
              dates={project.dates}
              tags={project.technologies}
              image={project.image}
              links={project.links}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
