import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  yOffset?: number
  inView?: boolean
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.4,
  yOffset = 6,
  inView = true,
}: BlurFadeProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ y: yOffset, opacity: 0, filter: 'blur(6px)' }}
      animate={
        inView
          ? isInView
            ? { y: 0, opacity: 1, filter: 'blur(0px)' }
            : { y: yOffset, opacity: 0, filter: 'blur(6px)' }
          : { y: 0, opacity: 1, filter: 'blur(0px)' }
      }
      transition={{
        delay,
        duration,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
