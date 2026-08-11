import { usePageTitle } from '@/hooks/usePageTitle'
import { CarReveal } from '@/components/CarReveal'

const DEFAULT_STEPS = ['正在连接车辆…', '核验租车权限…', '读取车辆信息…', '获取车门授权…']

export function ThisIsMyCar() {
  usePageTitle('pageTitle.thisIsMyCar', '正在解锁车辆…')

  return (
    <CarReveal
      imageUrl="/IMG_2813.webp"
      brand="AutoShare"
      loadingSteps={DEFAULT_STEPS}
      loadingDuration={3000}
    />
  )
}
