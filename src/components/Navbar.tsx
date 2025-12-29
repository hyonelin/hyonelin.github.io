import { DATA } from '@/data/resume'
import { Dock, DockIcon } from './Dock'
import { Moon, Sun, ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

function DockSeparator() {
  return <div className="mx-1 h-8 w-px bg-border" />
}

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const location = useLocation()

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

  // 判断是否在首页
  const isHomePage = location.pathname === '/'

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <Dock
        iconSize={36}
        iconMagnification={50}
        iconDistance={100}
        direction="middle"
        className="mt-0 h-14"
      >
        {DATA.navbar.map((item) => {
          const Icon = item.icon
          const isRoute = 'isRoute' in item && item.isRoute

          // 如果是路由链接
          if (isRoute) {
            return (
              <DockIcon key={item.href}>
                <Link
                  to={item.href}
                  className="flex items-center justify-center text-foreground/80 hover:text-foreground"
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </DockIcon>
            )
          }

          // 如果不在首页，锚点链接需要先跳转到首页
          if (!isHomePage && item.href.startsWith('#')) {
            return (
              <DockIcon key={item.href}>
                <Link
                  to={`/${item.href}`}
                  className="flex items-center justify-center text-foreground/80 hover:text-foreground"
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </DockIcon>
            )
          }

          // 首页的锚点链接
          return (
            <DockIcon key={item.href}>
              <a
                href={item.href}
                className="flex items-center justify-center text-foreground/80 hover:text-foreground"
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </a>
            </DockIcon>
          )
        })}

        <DockSeparator />

        <DockIcon onClick={toggleTheme} className="hover:bg-secondary">
          {isDark ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </DockIcon>

        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ width: 0, opacity: 0, scale: 0 }}
              animate={{ width: 'auto', opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <DockIcon onClick={scrollToTop} className="hover:bg-secondary">
                <ArrowUp className="h-5 w-5 text-foreground" />
              </DockIcon>
            </motion.div>
          )}
        </AnimatePresence>
      </Dock>
    </nav>
  )
}
