import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Sets document.title to "William Wen | {section}" based on current language.
 */
export function usePageTitle(sectionKey: string, sectionName?: string) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const section = sectionName ?? t(sectionKey)
    document.title = `William Wen | ${section}`
  }, [t, i18n.language, sectionKey, sectionName])
}
