import { Navbar } from '@/components/Navbar'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Projects } from '@/sections/Projects'
import { Contact } from '@/sections/Contact'
import { usePageTitle } from '@/hooks/usePageTitle'

export function Home() {
  usePageTitle('pageTitle.home')

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col space-y-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </div>
      <Navbar />
    </main>
  )
}
