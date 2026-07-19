import { Badge } from './Badge'
import { ExternalLink, Github, BookOpen, Lock } from 'lucide-react'

export type ProjectLinkType = 'website' | 'source' | 'blog' | 'internal' | 'current'

interface ProjectCardProps {
  title: string
  href?: string
  description: string
  dates?: string
  tags: readonly string[]
  category?: string
  image?: string
  variant?: 'compact' | 'detailed'
  problem?: string
  solution?: string
  impact?: string
  links?: readonly {
    type: ProjectLinkType
    label: string
    href?: string
  }[]
  labels?: {
    problem: string
    solution: string
    impact: string
  }
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  category,
  image,
  variant = 'compact',
  problem,
  solution,
  impact,
  links,
  labels,
}: ProjectCardProps) {
  const showDetail = variant === 'detailed' && (problem || solution || impact)

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-colors hover:bg-secondary/40">
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                >
                  {title}
                </a>
              ) : (
                <h3 className="font-semibold">{title}</h3>
              )}
              {category && (
                <Badge variant="secondary" className="text-[10px]">
                  {category}
                </Badge>
              )}
            </div>
            {dates && (
              <p className="text-xs text-muted-foreground">{dates}</p>
            )}
          </div>
        </div>

        <p
          className={
            variant === 'compact'
              ? 'mt-2 line-clamp-3 text-sm text-muted-foreground'
              : 'mt-2 text-sm text-muted-foreground'
          }
        >
          {description}
        </p>

        {showDetail && (
          <dl className="mt-3 space-y-2 text-sm">
            {problem && (
              <div>
                <dt className="font-medium text-foreground/80">{labels?.problem}</dt>
                <dd className="text-muted-foreground">{problem}</dd>
              </div>
            )}
            {solution && (
              <div>
                <dt className="font-medium text-foreground/80">{labels?.solution}</dt>
                <dd className="text-muted-foreground">{solution}</dd>
              </div>
            )}
            {impact && (
              <div>
                <dt className="font-medium text-foreground/80">{labels?.impact}</dt>
                <dd className="text-muted-foreground">{impact}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {links && links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {links.map((link, index) => {
              if (link.type === 'internal' || !link.href) {
                return (
                  <span
                    key={`${link.type}-${index}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <Lock className="h-3 w-3" />
                    {link.label}
                  </span>
                )
              }

              const Icon =
                link.type === 'source'
                  ? Github
                  : link.type === 'blog'
                    ? BookOpen
                    : ExternalLink

              return (
                <a
                  key={`${link.href}-${index}`}
                  href={link.href}
                  target={link.href.startsWith('/') ? undefined : '_blank'}
                  rel={link.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {link.label}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
