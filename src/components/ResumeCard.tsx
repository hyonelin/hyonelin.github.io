import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ResumeCardProps {
  logoUrl?: string
  altText: string
  title: string
  subtitle?: string
  href?: string
  badges?: readonly string[]
  period: string
  description?: string
}

export function ResumeCard({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
}: ResumeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    if (description) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div
      className={cn(
        'group relative flex gap-4 pb-8',
        description && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="absolute left-5 top-12 h-full w-px bg-border" />

      <Avatar
        src={logoUrl}
        alt={altText}
        fallback={altText.charAt(0)}
        className="z-10 h-10 w-10 border bg-background"
      />

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {title}
                </a>
              ) : (
                <span className="font-semibold">{title}</span>
              )}
              {badges && badges.length > 0 && (
                <div className="flex gap-1">
                  {badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">{period}</span>
            {description && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {description.includes('\n') || description.trimStart().startsWith('•') ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
                  {description
                    .split('\n')
                    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
                    .filter(Boolean)
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
