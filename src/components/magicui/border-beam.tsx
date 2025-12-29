import { cn } from '../../lib/utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
}

export function BorderBeam({ className, size = 200, duration = 15, delay = 0 }: BorderBeamProps) {
  return (
    <div
      style={{
        '--size': size,
        '--duration': `${duration}s`,
        '--delay': `-${delay}s`,
      } as React.CSSProperties}
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        '[border:calc(var(--size)*1px)_solid_transparent]',
        '![mask-clip:padding-box,border-box] ![mask-composite:intersect]',
        '[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        'after:absolute after:aspect-square after:w-[calc(var(--size)*2px)]',
        'after:animate-[border-beam_var(--duration)_infinite_linear_var(--delay)]',
        'after:bg-gradient-to-l after:from-primary after:via-secondary after:to-transparent',
        'after:[animation-delay:var(--delay)] after:[offset-anchor:calc(var(--size)*1px)_50%]',
        'after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className
      )}
    />
  );
}
