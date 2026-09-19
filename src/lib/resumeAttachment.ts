import { WORKER_URL } from '@/lib/adminApi'

export const RESUME_ATTACHMENT_API_URL = `${WORKER_URL}/api/resume-attachment`

export interface ResumeAttachment {
  exists: true
  path: string
  fileName: string
  contentType: string
  size: number
  uploadedAt: string
  downloadUrl: string
}

interface ResumeAttachmentMissing {
  exists: false
}

export type ResumeAttachmentResponse = ResumeAttachment | ResumeAttachmentMissing

export async function fetchResumeAttachment(): Promise<ResumeAttachment | null> {
  try {
    const response = await fetch(RESUME_ATTACHMENT_API_URL, { cache: 'no-store' })
    if (!response.ok) return null

    const data = await response.json() as ResumeAttachmentResponse
    if (!data.exists || !data.downloadUrl) return null
    return data
  } catch {
    return null
  }
}
