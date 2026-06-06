import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, GraduationCap, Award, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HighlightItem {
  icon: React.ReactNode
  label: string
  value: string
}

export function ResumePreview() {
  const { t } = useTranslation()

  // 关键指标
  const highlights: HighlightItem[] = [
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: t('resumePreview.experience'),
      value: '2+ years'
    },
    {
      icon: <Award className="h-4 w-4" />,
      label: t('resumePreview.projects'),
      value: '15+'
    },
    {
      icon: <GraduationCap className="h-4 w-4" />,
      label: t('resumePreview.education'),
      value: 'BS in IT'
    }
  ]

  // 技能亮点
  const skillHighlights = [
    'React / TypeScript',
    'Node.js / Python',
    'Cloud (AWS/Azure)',
    'DevOps / CI/CD',
    'UI/UX Design',
    'System Architecture'
  ]

  return (
    <section id="resume-preview" className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-8">
        {/* 头部 */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{t('resumePreview.title')}</h2>
              <p className="mt-2 text-muted-foreground">
                {t('resumePreview.subtitle')}
              </p>
            </div>
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* 关键指标 */}
          <div className="grid grid-cols-3 gap-4">
            {highlights.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="text-lg font-bold">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 技能亮点 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('resumePreview.skills')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillHighlights.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 最新工作经历 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('resumePreview.latestExperience')}
            </h3>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Tesla (Shanghai) Co., Ltd.</h4>
                  <p className="text-sm text-muted-foreground">
                    IT Support Technician
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Apr 2022 - Present
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('resumePreview.experienceDescription')}
              </p>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/resume"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>{t('resumePreview.viewFullResume')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => window.open('/resume', '_blank')}
              className="rounded-lg border bg-card px-4 py-3 font-medium transition-colors hover:bg-secondary"
            >
              {t('resumePreview.openInNewTab')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
