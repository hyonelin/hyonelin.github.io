import { cn } from '@/lib/utils'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface DockProps {
  children: React.ReactNode
  className?: string
}

interface DockIconProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  mouseX?: ReturnType<typeof useMotionValue<number>>
}

const DOCK_HEIGHT = 48
const DOCK_MAGNIFICATION = 60
const DOCK_DISTANCE = 140

export function Dock({ children, className }: DockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto flex h-14 items-end gap-2 rounded-full border bg-background/80 px-4 pb-2 shadow-lg backdrop-blur-md',
        className
      )}
    >
      {Array.isArray(children)
        ? children.map((child, index) => {
            if (child && typeof child === 'object' && 'type' in child) {
              if (child.type === DockSeparator) {
                return child
              }
              return (
                <DockIcon key={index} mouseX={mouseX} {...child.props}>
                  {child.props.children}
                </DockIcon>
              )
            }
            return child
          })
        : children}
    </motion.div>
  )
}

export function DockIcon({
  children,
  className,
  href,
  onClick,
  mouseX,
}: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX || useMotionValue(Infinity), (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distance,
    [-DOCK_DISTANCE, 0, DOCK_DISTANCE],
    [DOCK_HEIGHT, DOCK_MAGNIFICATION, DOCK_HEIGHT]
  )

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={cn(
        'flex aspect-square items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80',
        className
      )}
    >
      {children}
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button onClick={onClick} className="focus:outline-none">
      {content}
    </button>
  )
}

export function DockSeparator() {
  return <div className="mx-1 h-8 w-px bg-border" />
}
