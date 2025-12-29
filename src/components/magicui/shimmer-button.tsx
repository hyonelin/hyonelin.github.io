import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ShimmerButton({ children, className, onClick }: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium rounded-xl',
        'bg-gradient-to-r from-primary to-secondary text-white',
        'transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
        className
      )}
    >
      {children}
    </button>
  );
}
