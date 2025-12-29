import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
}

export function TypingAnimation({ text, duration = 100, className }: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [i, setI] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setI(0);
  }, [text]);

  useEffect(() => {
    if (i < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, i + 1));
        setI(i + 1);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [i, text, duration]);

  return (
    <h1 className={cn('font-bold', className)}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </h1>
  );
}
