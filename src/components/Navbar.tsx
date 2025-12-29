import { DATA } from '@/data/resume'
import { Dock, DockIcon, DockSeparator } from './Dock'
import { Moon, Sun, ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <Dock>
        {DATA.navbar.map((item) => (
          <DockIcon key={item.href} href={item.href}>
            <span className="text-xs font-medium">{item.label}</span>
          </DockIcon>
        ))}
        
        <DockSeparator />
        
        <DockIcon onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </DockIcon>

        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DockIcon onClick={scrollToTop}>
                <ArrowUp className="h-4 w-4" />
              </DockIcon>
            </motion.div>
          )}
        </AnimatePresence>
      </Dock>
    </nav>
  )
}
