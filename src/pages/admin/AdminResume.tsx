import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Download, FileText, Loader2, Upload } from 'lucide-react'
import { authHeaders } from '@/lib/adminApi'
import {
  RESUME_ATTACHMENT_API_URL,
  fetchResumeAttachment,
  type ResumeAttachment,
} from '@/lib/resumeAttachment'

interface AdminResumeProps {
  password: string
}

const MAX_RESUME_FILE_SIZE = 20 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '未知大小'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(value: string): string {
  if (!value) return '未知时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function AdminResume({ password }: AdminResumeProps) {
  const [attachment, setAttachment] = useState<ResumeAttachment | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadAttachment = useCallback(async () => {
    setLoading(true)
    setError('')
    const file = await fetchResumeAttachment()
    setAttachment(file)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAttachment()
  }, [loadAttachment])

  const handleFileSelect = (file: File | null) => {
    setError('')
    setMessage('')
    if (!file) {
      setSelectedFile(null)
      return
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setSelectedFile(null)
      setError('请选择 PDF 文件')
      return
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      setSelectedFile(null)
      setError('PDF 不能超过 20 MB')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请先选择 PDF 文件')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(RESUME_ATTACHMENT_API_URL, {
        method: 'POST',
        headers: authHeaders(password),
        body: formData,
      })
      const data = await response.json().catch(() => ({})) as {
        success?: boolean
        error?: string
        attachment?: ResumeAttachment
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || '上传失败')
      }

      setAttachment(data.attachment || (await fetchResumeAttachment()))
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setMessage('简历 PDF 已更新')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请确认 Worker 已部署最新代码')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">简历附件</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          上传固定 PDF 后，前台简历页的「下载 PDF」会直接下载这个文件。
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <Check className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <section className="space-y-5 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">当前 PDF</div>
              {loading ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在检查…
                </p>
              ) : attachment ? (
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <p className="break-all">{attachment.fileName}</p>
                  <p>
                    {formatBytes(attachment.size)} · {formatDate(attachment.uploadedAt)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">还没有上传 PDF。</p>
              )}
            </div>
          </div>

          {attachment && (
            <a
              href={attachment.downloadUrl}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-secondary/60"
            >
              <Download className="h-4 w-4" />
              下载当前 PDF
            </a>
          )}
        </div>

        <div className="rounded-lg border border-dashed p-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-8 text-center transition-colors hover:bg-secondary/40">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">选择 PDF 文件</span>
            <span className="text-xs text-muted-foreground">上传后会替换当前下载文件，最大 20 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
          </label>

          {selectedFile && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">{selectedFile.name}</span>
              <span className="text-muted-foreground">{formatBytes(selectedFile.size)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            上传并替换
          </button>
        </div>
      </section>
    </div>
  )
}
