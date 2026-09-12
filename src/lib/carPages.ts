import { WORKER_URL } from './adminApi'
import { compressImageForCarPage } from './compressImage'

export interface CarPageConfig {
  slug: string
  imageUrl: string
  loadingSteps: string[]
  loadingDuration: number
  brand: string
  createdAt: string
}

export type CreateCarProgress = {
  /** 0–100 overall */
  percent: number
  /** Human-readable stage */
  stage: 'compressing' | 'uploading' | 'finishing'
  /** Estimated remaining seconds; null when unknown */
  etaSeconds: number | null
}

export async function createCarPage(
  file: File,
  loadingDuration: number,
  onProgress?: (p: CreateCarProgress) => void,
): Promise<{ slug: string; url: string }> {
  onProgress?.({ percent: 2, stage: 'compressing', etaSeconds: null })
  const compressed = await compressImageForCarPage(file)
  onProgress?.({ percent: 12, stage: 'uploading', etaSeconds: null })

  const form = new FormData()
  form.append('file', compressed)
  form.append('loadingDuration', String(loadingDuration))

  return uploadWithProgress(form, onProgress)
}

function uploadWithProgress(
  form: FormData,
  onProgress?: (p: CreateCarProgress) => void,
): Promise<{ slug: string; url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${WORKER_URL}/api/car-pages`)

    const startedAt = Date.now()
    let lastLoaded = 0
    let lastAt = startedAt

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.({ percent: 50, stage: 'uploading', etaSeconds: null })
        return
      }
      // Reserve 12% for compress, 8% for server finishing → upload maps to 12–92
      const uploadRatio = event.loaded / event.total
      const percent = Math.round(12 + uploadRatio * 80)

      const now = Date.now()
      const dt = (now - lastAt) / 1000
      let etaSeconds: number | null = null
      if (dt > 0.2 && event.loaded > lastLoaded) {
        const speed = (event.loaded - lastLoaded) / dt // bytes/s
        const remainingBytes = event.total - event.loaded
        if (speed > 0) {
          // +1.5s cushion for Worker R2/KV work after upload completes
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
