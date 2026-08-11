import { CAR_LOADING_DURATION_MS } from '@/lib/carBrand'
import { CarReveal } from '@/components/CarReveal'

export function ThisIsMyCar() {
  return (
    <CarReveal
      imageUrl="/IMG_2813.webp"
      loadingDuration={CAR_LOADING_DURATION_MS}
    />
  )
}
