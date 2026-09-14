import { Mail, MapPin } from 'lucide-react'
import { DATA } from '@/data/resume'
import { useTranslation } from 'react-i18next'

export function ResumeHeader() {
  const { t } = useTranslation()

  return (
    <section className="rounded-lg border bg-card p-6 print:border-0 print:p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t('resumeHeader.eyebrow')}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{DATA.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t(DATA.descriptionKey)}
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground sm:text-right">
          <div className="flex items-center gap-2 sm:justify-end">
            <MapPin className="h-4 w-4" />
            {t(DATA.locationKey)}
          </div>
          <a
            href={`mailto:${DATA.contact.email}`}
            className="flex items-center gap-2 transition-colors hover:text-foreground sm:justify-end"
          >
            <Mail className="h-4 w-4" />
            {DATA.contact.email}
          </a>
        </div>
      </div>

      <p className="mt-5 leading-7 text-muted-foreground">
        {t(DATA.summaryKey)}
      </p>
    </section>
  )
}
