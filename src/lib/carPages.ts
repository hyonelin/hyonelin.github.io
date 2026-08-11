import { WORKER_URL } from './adminApi'
import { compressImageForCarPage } from './compressImage'
import { CAR_BRAND, CAR_LOADING_STEPS } from './carBrand'

export interface CarPageConfig {
  slug: string
  imageUrl: string
  loadingSteps: string[]
  loadingDuration: number
  brand: string
  createdAt: string
}

export type CreateCarProgress = {
  percent: number
  stage: 'compressing' | 'uploading' | 'finishing'
  etaSeconds: number | null
}

export type CreateCarPageOptions = {
  password: string
  loadingDuration: number
  brand?: string
  loadingSteps?: string[]
  /** Empty / omitted = random slug */
  slug?: string
  onProgress?: (p: CreateCarProgress) => void
}

export async function createCarPage(
  file: File,
  options: CreateCarPageOptions,
): Promise<{ slug: string; url: string }> {
  const {
    password,
    loadingDuration,
    brand = CAR_BRAND,
    loadingSteps = CAR_LOADING_STEPS,
    slug,
    onProgress,
  } = options

  onProgress?.({ percent: 2, stage: 'compressing', etaSeconds: null })
  const compressed = await compressImageForCarPage(file)
  onProgress?.({ percent: 12, stage: 'uploading', etaSeconds: null })

  const form = new FormData()
  form.append('file', compressed)
  form.append('loadingDuration', String(loadingDuration))
  form.append('brand', brand)
  form.append('loadingSteps', JSON.stringify(loadingSteps))
  if (slug?.trim()) form.append('slug', slug.trim().toLowerCase())

  return uploadWithProgress(form, password, onProgress)
}

function uploadWithProgress(
  form: FormData,
  password: string,
  onProgress?: (p: CreateCarProgress) => void,
): Promise<{ slug: string; url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${WORKER_URL}/api/car-pages`)
    xhr.setRequestHeader('Authorization', `Bearer ${password}`)

    let lastLoaded = 0
    let lastAt = Date.now()

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.({ percent: 50, stage: 'uploading', etaSeconds: null })
        return
      }
      const uploadRatio = event.loaded / event.total
      const percent = Math.round(12 + uploadRatio * 80)

      const now = Date.now()
      const dt = (now - lastAt) / 1000
      let etaSeconds: number | null = null
      if (dt > 0.2 && event.loaded > lastLoaded) {
        const speed = (event.loaded - lastLoaded) / dt
        const remainingBytes = event.total - event.loaded
        if (speed > 0) {
          etaSeconds = Math.max(1, Math.ceil(remainingBytes / speed) + 2)
        }
        lastLoaded = event.loaded
        lastAt = now
      }

      onProgress?.({ percent, stage: 'uploading', etaSeconds })
    }

    xhr.onload = () => {
      onProgress?.({ percent: 96, stage: 'finishing', etaSeconds: 1 })
      try {
        const data = JSON.parse(xhr.responseText || '{}')
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.({ percent: 100, stage: 'finishing', etaSeconds: 0 })
          resolve(data)
          return
        }
        reject(new Error(data.error || 'Upload failed'))
      } catch {
        reject(new Error('Upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout = 120_000
    xhr.send(form)
  })
}

export async function getCarPage(slug: string): Promise<CarPageConfig> {
  const res = await fetch(`${WORKER_URL}/api/car-pages/${slug}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}
