import { useCallback, useEffect, useState } from 'react'
import {
  Upload,
  Loader2,
  Plus,
  X,
  FolderOpen,
  Calendar,
  Check,
  AlertCircle,
  ImagePlus,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import ExifReader from 'exifreader'
import { WORKER_URL, authHeaders } from '@/lib/adminApi'

interface PhotoMetadata {
  path?: string
  title?: string
  date: string
  location?: string
  camera?: string
  lens?: string
  tags?: string[]
  photographerNote?: string
  settings?: {
    iso?: string
    aperture?: string
    shutter?: string
    focalLength?: string
  }
}

interface PhotoAlbum {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  tags?: string[]
  photos: PhotoMetadata[]
}

const CAMERA_PRESETS = [
  'iPhone 15 Pro',
  'iPhone 14 Pro',
  'iPhone 13 Pro',
  'iPhone 12 Pro',
  'iPhone X',
  'NIKON D3400',
  'Sony A7 III',
  'Canon EOS R5',
  '其他',
]

type Step = 1 | 2 | 3

interface AdminPhotosProps {
  password: string
}

export function AdminPhotos({ password }: AdminPhotosProps) {
  const [step, setStep] = useState<Step>(1)
  const [uploadMode, setUploadMode] = useState<'year' | 'album'>('year')
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false)
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
  })
  const [creatingAlbum, setCreatingAlbum] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [photoInfo, setPhotoInfo] = useState<PhotoMetadata>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    camera: '',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [readingExif, setReadingExif] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState<
    { name: string; success: boolean; error?: string; url?: string }[]
  >([])
  const [error, setError] = useState('')

  const loadAlbums = useCallback(async () => {
    try {
      const response = await fetch(`${WORKER_URL}/api/albums`)
      const data = await response.json()
      setAlbums(data.albums || [])
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    loadAlbums()
  }, [loadAlbums])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const readExifFromFiles = async (files: File[]) => {
    if (files.length === 0) return
    setReadingExif(true)
    try {
      const tags = await ExifReader.load(files[0])
      const exifData: Partial<PhotoMetadata> = {}

      if (tags.DateTimeOriginal) {
        const dateStr = tags.DateTimeOriginal.description as string
        const match = dateStr.match(/(\d{4}):(\d{2}):(\d{2})/)
        if (match) exifData.date = `${match[1]}-${match[2]}-${match[3]}`
      }
      if (tags.Model) exifData.camera = String(tags.Model.description).trim()
      if (tags.LensModel) exifData.lens = String(tags.LensModel.description).trim()

      const settings: PhotoMetadata['settings'] = {}
      if (tags.ISO) settings.iso = tags.ISO.description?.toString() || ''
      if (tags.ApertureValue || tags.FNumber) {
        const aperture = tags.ApertureValue || tags.FNumber
        settings.aperture = aperture?.description?.toString() || ''
      }
      if (tags.ExposureTime) settings.shutter = tags.ExposureTime.description?.toString() || ''
      if (tags.FocalLength) settings.focalLength = tags.FocalLength.description?.toString() || ''
      if (Object.keys(settings).length > 0) exifData.settings = settings

      setPhotoInfo((prev) => ({ ...prev, ...exifData, camera: exifData.camera || prev.camera }))
    } catch {
      // ignore EXIF failures
    } finally {
      setReadingExif(false)
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files)
    previews.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles(list)
    setPreviews(list.map((f) => URL.createObjectURL(f)))
    setUploadResults([])
    await readExifFromFiles(list)
  }

  const compressImage = async (file: File): Promise<File> => {
    if (file.size < 500 * 1024) return file
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          let width = img.width
          let height = img.height
          const maxSize = 2048
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }
          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('compress failed'))
              resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
            },
            'image/jpeg',
            0.8
          )
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreateAlbum = async () => {
    if (!newAlbum.title || !newAlbum.date) {
      setError('请填写相册标题和日期')
      return
    }
    setCreatingAlbum(true)
    setError('')
    try {
      const response = await fetch(`${WORKER_URL}/api/albums`, {
        method: 'POST',
        headers: authHeaders(password, true),
        body: JSON.stringify(newAlbum),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setAlbums([data.album, ...albums])
        setSelectedAlbumId(data.album.id)
        setShowNewAlbumForm(false)
        setNewAlbum({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          location: '',
        })
      } else {
        setError(data.error || '创建相册失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setCreatingAlbum(false)
    }
  }

  const canGoStep2 = uploadMode === 'year' || !!selectedAlbumId
  const canGoStep3 = selectedFiles.length > 0

  const handleUpload = async () => {
    if (!canGoStep3) {
      setError('请先选择照片')
      return
    }
    if (uploadMode === 'album' && !selectedAlbumId) {
      setError('请选择相册')
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)
    setUploadResults([])

    const results: typeof uploadResults = []
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
      try {
        const compressed = await compressImage(file)
        const formData = new FormData()
        formData.append('file', compressed)
        formData.append('mode', uploadMode)
        if (uploadMode === 'album') formData.append('albumId', selectedAlbumId)
        formData.append('metadata', JSON.stringify(photoInfo))

        const response = await fetch(`${WORKER_URL}/api/upload`, {
          method: 'POST',
          headers: authHeaders(password),
          body: formData,
        })
        const data = await response.json()
        if (response.ok && data.success) {
          results.push({ name: file.name, success: true, url: data.url })
        } else {
          results.push({ name: file.name, success: false, error: data.error || '上传失败' })
        }
      } catch {
        results.push({ name: file.name, success: false, error: '网络错误' })
      }
      setUploadResults([...results])
    }

    setUploading(false)
    if (results.every((r) => r.success)) {
      previews.forEach((url) => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviews([])
      setStep(1)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    if (!photoInfo.tags?.includes(tag)) {
      setPhotoInfo({ ...photoInfo, tags: [...(photoInfo.tags || []), tag] })
    }
    setTagInput('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">上传照片</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          按步骤操作：先选去向 → 再选图片 → 最后确认信息并上传。
        </p>
      </div>

      {/* Steps indicator */}
      <ol className="flex flex-wrap gap-2 text-sm">
        {[
          { n: 1 as Step, label: '选择去向' },
          { n: 2 as Step, label: '选择图片' },
          { n: 3 as Step, label: '填写信息并上传' },
        ].map((item) => (
          <li
            key={item.n}
            className={`rounded-full px-3 py-1 ${
              step === item.n
                ? 'bg-primary text-primary-foreground'
                : step > item.n
                  ? 'bg-secondary text-foreground'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {item.n}. {item.label}
          </li>
        ))}
      </ol>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">照片要传到哪里？</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setUploadMode('year')}
              className={`rounded-lg border p-4 text-left transition-colors ${
                uploadMode === 'year' ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'
              }`}
            >
              <Calendar className="mb-2 h-5 w-5" />
              <div className="font-medium">摄影时间线</div>
              <p className="mt-1 text-xs text-muted-foreground">
                按拍摄日期归入 `/photography` 总览，适合日常随手拍。
              </p>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('album')}
              className={`rounded-lg border p-4 text-left transition-colors ${
                uploadMode === 'album' ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'
              }`}
            >
              <FolderOpen className="mb-2 h-5 w-5" />
              <div className="font-medium">项目相册</div>
              <p className="mt-1 text-xs text-muted-foreground">
                归入某个相册（如旅行/专题），在摄影页的相册里查看。
              </p>
            </button>
          </div>

          {uploadMode === 'album' && (
            <div className="space-y-3 rounded-lg bg-muted/40 p-3">
              <label className="block text-sm font-medium">选择相册</label>
              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">请选择…</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>

              {!showNewAlbumForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewAlbumForm(true)}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  新建相册
                </button>
              ) : (
                <div className="space-y-2 rounded-lg border bg-background p-3">
                  <input
                    placeholder="相册标题 *"
                    value={newAlbum.title}
                    onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={newAlbum.date}
                    onChange={(e) => setNewAlbum({ ...newAlbum, date: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="地点（可选）"
                    value={newAlbum.location}
                    onChange={(e) => setNewAlbum({ ...newAlbum, location: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="简介（可选）"
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateAlbum}
                      disabled={creatingAlbum}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                    >
                      {creatingAlbum ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      创建
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAlbumForm(false)}
                      className="rounded-lg border px-3 py-1.5 text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canGoStep2}
              onClick={() => {
                setError('')
                setStep(2)
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">选择要上传的图片</h3>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 transition-colors hover:bg-secondary/40">
            <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">点击或拖拽图片到这里</span>
            <span className="mt-1 text-xs text-muted-foreground">支持多选；过大图片会自动压缩</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </label>

          {readingExif && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在读取 EXIF…
            </p>
          )}

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div key={src} className="overflow-hidden rounded-lg border">
                  <img src={src} alt={selectedFiles[i]?.name} className="aspect-square w-full object-cover" />
                  <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">
                    {selectedFiles[i]?.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              上一步
            </button>
            <button
              type="button"
              disabled={!canGoStep3}
              onClick={() => {
                setError('')
                setStep(3)
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">确认信息并上传</h3>
          <p className="text-xs text-muted-foreground">
            当前批次共用同一套元数据（已尽量从第一张图的 EXIF 预填）。共 {selectedFiles.length} 张。
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-muted-foreground">标题</span>
              <input
                value={photoInfo.title || ''}
                onChange={(e) => setPhotoInfo({ ...photoInfo, title: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="可选"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">拍摄日期 *</span>
              <input
                type="date"
                value={photoInfo.date}
                onChange={(e) => setPhotoInfo({ ...photoInfo, date: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">地点</span>
              <input
                value={photoInfo.location || ''}
                onChange={(e) => setPhotoInfo({ ...photoInfo, location: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-muted-foreground">相机</span>
              <select
                value={
                  photoInfo.camera && CAMERA_PRESETS.includes(photoInfo.camera)
                    ? photoInfo.camera
                    : photoInfo.camera
                      ? '其他'
                      : ''
                }
                onChange={(e) => {
                  if (e.target.value === '其他') {
                    setPhotoInfo({ ...photoInfo, camera: photoInfo.camera || '' })
                  } else {
                    setPhotoInfo({ ...photoInfo, camera: e.target.value })
                  }
                }}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">未选择</option>
                {CAMERA_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {(photoInfo.camera && !CAMERA_PRESETS.includes(photoInfo.camera)) ||
              (CAMERA_PRESETS.includes('其他') && photoInfo.camera === '其他') ? (
                <input
                  className="mt-2 w-full rounded-lg border px-3 py-2"
                  placeholder="自定义相机型号"
                  value={photoInfo.camera === '其他' ? '' : photoInfo.camera}
                  onChange={(e) => setPhotoInfo({ ...photoInfo, camera: e.target.value })}
                />
              ) : null}
            </label>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-sm text-muted-foreground">标签</span>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  placeholder="输入后回车添加"
                />
                <button type="button" onClick={addTag} className="rounded-lg border px-3 py-2 text-sm">
                  添加
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(photoInfo.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoInfo({
                          ...photoInfo,
                          tags: (photoInfo.tags || []).filter((t) => t !== tag),
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">上传中 {uploadProgress}%</p>
            </div>
          )}

          {uploadResults.length > 0 && (
            <ul className="space-y-1 text-sm">
              {uploadResults.map((r) => (
                <li key={r.name} className="flex items-center gap-2">
                  {r.success ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="truncate">{r.name}</span>
                  {!r.success && <span className="text-red-600">{r.error}</span>}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              上一步
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !photoInfo.date}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              开始上传
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
