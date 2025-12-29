import { BlurFade } from '@/components/BlurFade'
import { WeChatModal } from '@/components/WeChatModal'
import { DATA } from '@/data/resume'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const BLUR_FADE_DELAY = 0.04

export function Contact() {
  const { t } = useTranslation()
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false)

  const handleSocialClick = (social: any) => {
    if ('isWechat' in social && social.isWechat) {
      setIsWeChatModalOpen(true)
    } else {
      window.open(social.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section id="contact" className="mx-auto w-full max-w-2xl pb-24">
      <BlurFade delay={BLUR_FADE_DELAY * 18}>
        <div className="space-y-3">
          <h2 className="text-xl font-bold">{t('contact.title')}</h2>
          <p className="text-muted-foreground">{t('contact.description')}</p>
        </div>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 19}>
        <div className="mt-4 flex gap-4">
          {DATA.contact.social.map((social) => {
            const Icon = social.icon
            return (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social)}
                className="rounded-lg border bg-card p-3 transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={social.name}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </BlurFade>
      
      <WeChatModal 
        isOpen={isWeChatModalOpen} 
        onClose={() => setIsWeChatModalOpen(false)} 
      />
    </section>
  )
}
