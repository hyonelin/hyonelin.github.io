import { Navbar } from '@/components/Navbar'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Work } from '@/sections/Work'
import { Education } from '@/sections/Education'
import { Projects } from '@/sections/Projects'
import { Contact } from '@/sections/Contact'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'

export function Resume() {
  const { t } = useTranslation()
  usePageTitle('pageTitle.resume')

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-3xl">
        {/* 导航和下载区域 */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('resume.backToHome')}
          </Link>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            {t('resume.download')}
          </button>
        </div>

        {/* 打印样式 - 只在打印时显示 */}
        <style media="print">
          {`
            @page {
              margin: 0.5in;
              size: A4;
            }
            
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background: white !important;
              color: black !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-only {
              display: block !important;
            }
            
            main {
              padding: 0 !important;
              max-width: 100% !important;
            }
            
            .bg-background {
              background: white !important;
            }
            
            .text-foreground {
              color: black !important;
            }
            
            .text-muted-foreground {
              color: #666 !important;
            }
            
            .border, .border-b {
              border-color: #ddd !important;
            }
            
            .shadow-sm, .shadow-md {
              box-shadow: none !important;
            }
            
            .rounded-lg, .rounded-md {
              border-radius: 0 !important;
            }
            
            .bg-card {
              background: white !important;
              border: 1px solid #ddd !important;
            }
            
            .bg-primary {
              background: black !important;
              color: white !important;
            }
            
            .h-8.w-8 {
              height: 20px !important;
              width: 20px !important;
            }
          `}
        </style>

        {/* 打印头信息 */}
        <div className="print-only hidden border-b pb-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">HYONELIN</h1>
            <p className="mt-1 text-muted-foreground">{t('profile.description')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('profile.location')} • 
              Email: lin@hyonelin.com
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <Hero />
          <About />
          <Skills />
          <Work />
          <Education />
          <Projects />
          <Contact />
        </div>

        {/* 打印脚注 */}
        <div className="print-only hidden mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p className="mt-1">Online version: https://hyonelin.github.io/resume</p>
        </div>
      </div>
      <Navbar />
    </main>
  )
}
