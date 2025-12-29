import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import type { ReactNode, MouseEvent } from 'react';
import { cn } from '../../lib/utils';

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  gradientColor?: string;
  onClick?: () => void;
}

export function MagicCard({ children, className, gradientColor = 'rgba(102, 126, 234, 0.15)', onClick }: MagicCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-white/10 bg-[#1a1a2e] overflow-hidden',
        className
      )}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              ${gradientColor},
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
}
