import { cn } from '@/lib/utils'
import { DATA } from '@/data/resume'

export function Navbar() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border bg-background/80 px-3 py-2 shadow-lg backdrop-blur-md">
        {DATA.navbar.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              'hover:bg-secondary hover:text-secondary-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
