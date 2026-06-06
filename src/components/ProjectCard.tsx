import { Badge } from './Badge'
import { ExternalLink, Github } from 'lucide-react'

interface ProjectCardProps {
  title: string
  href?: string
  description: string
  dates: string
  tags: readonly string[]
  image?: string
  links?: readonly {
    type: string
    href: string
  }[]
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  image,
  links,
}: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
      {/* Image */}
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
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
            <p className="text-xs text-muted-foreground">{dates}</p>
          </div>
        </div>

        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {description}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Links */}
        {links && links.length > 0 && (
          <div className="mt-3 flex gap-2">
            {links.map((link, index) => (
              <a
                key={`${link.href}-${index}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.type === '源码' || link.type === 'Source' ? (
                  <Github className="h-3 w-3" />
                ) : (
                  <ExternalLink className="h-3 w-3" />
                )}
                {link.type}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
