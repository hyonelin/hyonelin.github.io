import { Navbar } from '@/components/Navbar'
import { HomeHero } from '@/sections/HomeHero'
import { HomeFocus } from '@/sections/HomeFocus'
import { QuickLinks } from '@/sections/QuickLinks'
import { Projects } from '@/sections/Projects'
import { Contact } from '@/sections/Contact'
import { usePageTitle } from '@/hooks/usePageTitle'

export function Home() {
  usePageTitle('pageTitle.home')

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto flex max-w-4xl flex-col space-y-12">
        <HomeHero />
        <HomeFocus />
        <Projects variant="compact" />
        <QuickLinks />
        <Contact />
      </div>
      <Navbar />
    </main>
  )
}
