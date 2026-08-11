import { WORKER_URL } from './adminApi'

export interface CarPageConfig {
  slug: string
  imageUrl: string
  loadingSteps: string[]
  loadingDuration: number
  brand: string
  createdAt: string
}

export async function createCarPage(
  file: File,
  brand: string,
  loadingSteps: string[],
  loadingDuration: number,
): Promise<{ slug: string; url: string }> {
  const form = new FormData()
  form.append('file', file)
  form.append('brand', brand)
  form.append('loadingSteps', JSON.stringify(loadingSteps))
  form.append('loadingDuration', String(loadingDuration))

  const res = await fetch(`${WORKER_URL}/api/car-pages`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json() as any
    throw new Error(err.error || 'Upload failed')
  }
  return res.json()
}

export async function getCarPage(slug: string): Promise<CarPageConfig> {
  const res = await fetch(`${WORKER_URL}/api/car-pages/${slug}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}
