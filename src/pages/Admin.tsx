import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { ArrowLeft, Upload, Loader2, Plus, X, FolderOpen, Calendar, Check, AlertCircle, Settings } from 'lucide-react'
import ExifReader from 'exifreader'

// Worker API URL
const WORKER_URL = 'https://photo-admin.hyonelin.workers.dev'

// 照片元数据接口
interface PhotoMetadata {
  path: string
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

// 相册接口
interface PhotoAlbum {
  id: string
  title: string
  description?: string
  coverImage?: string
  date: string
  location?: string
  tags?: string[]
  photos: PhotoMetadata[]
  published?: boolean
}

// 预设相机列表
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

export function Admin() {
  // 认证状态
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // 上传模式
  const [uploadMode, setUploadMode] = useState<'year' | 'album'>('year')

  // 相册相关
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('')
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false)
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    tags: [] as string[],
  })

  // 照片信息
  const [photoInfo, setPhotoInfo] = useState<PhotoMetadata>({
    path: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    camera: 'iPhone 15 Pro',
    tags: [],
  })
  const [newTag, setNewTag] = useState('')

  // 选中的文件
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // 上传状态
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState<any[]>([])
  const [error, setError] = useState('')

  // EXIF 读取状态
  const [readingExif, setReadingExif] = useState(false)

  // 验证密码
  const handleVerify = async () => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await fetch(`${WORKER_URL}/api/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsAuthenticated(true)
        // 加载相册列表
        loadAlbums()
      } else {
        setAuthError('密码错误')
      }
    } catch (err) {
      setAuthError('连接失败，请检查网络或 Worker URL')
    } finally {
      setAuthLoading(false)
    }
  }

  // 加载相册列表
  const loadAlbums = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/api/albums`)
      const data = await response.json()
      setAlbums(data.albums || [])
    } catch (err) {
      console.error('Failed to load albums:', err)
    }
  }

  // 创建新相册
  const handleCreateAlbum = async () => {
    if (!newAlbum.title || !newAlbum.date) {
      setError('请填写相册标题和日期')
      return
    }

    setUploading(true)
    setError('')

    try {
      const response = await fetch(`${WORKER_URL}/api/albums`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
        },
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
          tags: [],
        })
      } else {
        setError(data.error || '创建相册失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setUploading(false)
    }
  }

  // 从 EXIF 读取照片信息
  const readExifFromFiles = async (files: File[]) => {
    if (files.length === 0) return

    setReadingExif(true)

    try {
      // 读取第一张照片的 EXIF
      const file = files[0]
      const tags = await ExifReader.load(file)

      // 提取 EXIF 信息
      const exifData: Partial<PhotoMetadata> = {}

      // 拍摄日期
      if (tags.DateTimeOriginal) {
        const dateStr = tags.DateTimeOriginal.description as string
        // 格式: "2024:01:15 14:30:00" -> "2024-01-15"
        const match = dateStr.match(/(\d{4}):(\d{2}):(\d{2})/)
        if (match) {
          exifData.date = `${match[1]}-${match[2]}-${match[3]}`
        }
      }

      // 相机型号
      if (tags.Model) {
        const model = tags.Model.description as string
        exifData.camera = model.trim()
      }

      // 镜头信息
      if (tags.LensModel) {
        exifData.lens = (tags.LensModel.description as string).trim()
      }

      // 拍摄参数
      const settings: PhotoMetadata['settings'] = {}

      if (tags.ISO) {
        settings.iso = tags.ISO.description?.toString() || ''
      }

      if (tags.ApertureValue || tags.FNumber) {
        const aperture = tags.ApertureValue || tags.FNumber
        settings.aperture = aperture.description?.toString() || ''
      }

      if (tags.ExposureTime) {
        settings.shutter = tags.ExposureTime.description?.toString() || ''
      }

      if (tags.FocalLength) {
        settings.focalLength = tags.FocalLength.description?.toString() || ''
      }

      if (Object.keys(settings).length > 0) {
        exifData.settings = settings
      }

      // GPS 信息（如果存在）
      if (tags.GPSLatitude && tags.GPSLongitude) {
        // 可以调用反向地理编码 API 获取地点名称
        // 这里先留空，后续可以添加
        console.log('GPS found:', tags.GPSLatitude, tags.GPSLongitude)
      }

      // 更新 photoInfo
      setPhotoInfo(prev => ({
        ...prev,
        ...exifData,
        // 如果相机型号不在预设列表中，添加到选项
        camera: exifData.camera || prev.camera,
      }))

    } catch (err) {
      console.error('Failed to read EXIF:', err)
      // EXIF 读取失败不影响正常使用
    } finally {
      setReadingExif(false)
    }
  }

  // 选择文件
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedFiles(files)

    // 生成预览 URL
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)

    // 读取 EXIF 信息
    await readExifFromFiles(files)
  }

  // 添加标签
  const handleAddTag = () => {
    if (!newTag.trim()) return
    if (photoInfo.tags?.includes(newTag.trim())) return

    setPhotoInfo({
      ...photoInfo,
      tags: [...(photoInfo.tags || []), newTag.trim()],
    })
    setNewTag('')
  }

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setPhotoInfo({
      ...photoInfo,
      tags: photoInfo.tags?.filter(t => t !== tag) || [],
    })
  }

  // 压缩图片
  const compressImage = async (file: File): Promise<File> => {
    // 如果小于 500KB，不压缩
    if (file.size < 500 * 1024) {
      return file
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // 计算压缩后的尺寸
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
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.8 // 质量
          )
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // 上传照片
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('请选择照片')
      return
    }

    if (uploadMode === 'album' && !selectedAlbumId) {
      setError('请选择或创建一个相册')
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)
    setUploadResults([])

    const results: any[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const progress = Math.round(((i + 1) / selectedFiles.length) * 100)
      setUploadProgress(progress)

      try {
        // 压缩图片
        const compressedFile = await compressImage(file)

        // 创建表单数据
        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('mode', uploadMode)
        if (uploadMode === 'album' && selectedAlbumId) {
          formData.append('albumId', selectedAlbumId)
        }
        formData.append('metadata', JSON.stringify(photoInfo))

        // 上传
        const response = await fetch(`${WORKER_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${password}`,
          },
          body: formData,
        })

        const data = await response.json()

        if (response.ok && data.success) {
          results.push({
            success: true,
            file: file.name,
            url: data.url,
            path: data.path,
          })
        } else {
          results.push({
            success: false,
            file: file.name,
            error: data.error || 'Upload failed',
          })
        }
      } catch (err) {
        results.push({
          success: false,
          file: file.name,
          error: 'Network error',
        })
      }
    }

    setUploadResults(results)
    setUploading(false)

    // 如果全部成功，清空选择
    const allSuccess = results.every(r => r.success)
    if (allSuccess) {
      setSelectedFiles([])
      setPreviewUrls([])
    }
  }

  // 拖拽处理
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return

    setSelectedFiles(files)
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)

    // 读取 EXIF 信息
    await readExifFromFiles(files)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 未认证时显示登录界面
  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
        <div className="mx-auto max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <div className="rounded-lg border bg-card p-6">
            <h1 className="text-2xl font-bold">Admin 管理后台</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              请输入管理密码以继续
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="mt-1 w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入管理密码"
                />
              </div>

              {authError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {authError}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={authLoading || !password}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    验证中...
                  </span>
                ) : (
                  '进入管理后台'
                )}
              </button>
            </div>
          </div>
        </div>
        <Navbar />
      </main>
    )
  }

  // 已认证，显示管理界面
  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">照片管理</h1>
          <p className="mt-2 text-muted-foreground">上传照片到 Cloudflare R2</p>
        </div>

        {/* 上传模式选择 */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-sm font-medium">上传模式</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setUploadMode('year')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                uploadMode === 'year'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Calendar className="h-4 w-4" />
              按年份上传
            </button>
            <button
              onClick={() => setUploadMode('album')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                uploadMode === 'album'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              按项目上传
            </button>
          </div>
        </div>

        {/* 相册选择（仅项目模式） */}
        {uploadMode === 'album' && (
          <div className="mb-6 rounded-lg border bg-card p-4">
            <h2 className="mb-4 text-sm font-medium">选择相册</h2>

            {albums.length > 0 && (
              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                className="mb-4 w-full rounded-lg border bg-background px-4 py-2 text-sm"
              >
                <option value="">选择一个相册</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title} ({album.photos.length} 张照片)
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowNewAlbumForm(!showNewAlbumForm)}
              className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              创建新相册
            </button>

            {/* 新建相册表单 */}
            {showNewAlbumForm && (
              <div className="mt-4 space-y-4 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium">相册标题 *</label>
                    <input
                      type="text"
                      value={newAlbum.title}
                      onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="例如：新加坡印象"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">日期 *</label>
                    <input
                      type="date"
                      value={newAlbum.date}
                      onChange={(e) => setNewAlbum({ ...newAlbum, date: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">描述</label>
                  <input
                    type="text"
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    placeholder="简短描述这个相册"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">地点</label>
                  <input
                    type="text"
                    value={newAlbum.location}
                    onChange={(e) => setNewAlbum({ ...newAlbum, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    placeholder="例如：Singapore"
                  />
                </div>

                <button
                  onClick={handleCreateAlbum}
                  disabled={uploading || !newAlbum.title}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploading ? '创建中...' : '创建相册'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 照片信息 */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">照片信息</h2>
            {readingExif && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                正在读取 EXIF...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">标题（可选）</label>
              <input
                type="text"
                value={photoInfo.title}
                onChange={(e) => setPhotoInfo({ ...photoInfo, title: e.target.value })}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="照片标题"
              />
            </div>
            <div>
              <label className="text-xs font-medium">拍摄日期</label>
              <input
                type="date"
                value={photoInfo.date}
                onChange={(e) => setPhotoInfo({ ...photoInfo, date: e.target.value })}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium">地点</label>
              <input
                type="text"
                value={photoInfo.location}
                onChange={(e) => setPhotoInfo({ ...photoInfo, location: e.target.value })}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="例如：Singapore"
              />
            </div>
            <div>
              <label className="text-xs font-medium">相机</label>
              <input
                type="text"
                value={photoInfo.camera}
                onChange={(e) => setPhotoInfo({ ...photoInfo, camera: e.target.value })}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                list="camera-list"
                placeholder="从 EXIF 自动读取或手动输入"
              />
              <datalist id="camera-list">
                {CAMERA_PRESETS.map((camera) => (
                  <option key={camera} value={camera} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 镜头和拍摄参数 */}
          {(photoInfo.lens || photoInfo.settings) && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Settings className="h-3 w-3" />
                拍摄参数（从 EXIF 读取）
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                {photoInfo.lens && (
                  <div>
                    <span className="font-medium">镜头：</span>
                    {photoInfo.lens}
                  </div>
                )}
                {photoInfo.settings?.iso && (
                  <div>
                    <span className="font-medium">ISO：</span>
                    {photoInfo.settings.iso}
                  </div>
                )}
                {photoInfo.settings?.aperture && (
                  <div>
                    <span className="font-medium">光圈：</span>
                    {photoInfo.settings.aperture ?? ''}
                  </div>
                )}
                {photoInfo.settings?.shutter && (
                  <div>
                    <span className="font-medium">快门：</span>
                    {photoInfo.settings.shutter}
                  </div>
                )}
                {photoInfo.settings?.focalLength && (
                  <div>
                    <span className="font-medium">焦距：</span>
                    {photoInfo.settings.focalLength}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 标签 */}
          <div className="mt-4">
            <label className="text-xs font-medium">标签</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {photoInfo.tags?.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="w-20 rounded-full border bg-background px-3 py-1 text-xs"
                  placeholder="添加标签"
                />
                <button onClick={handleAddTag} className="rounded-full bg-secondary p-1 hover:bg-secondary/80">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 照片选择 */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-sm font-medium">选择照片</h2>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {selectedFiles.length === 0 ? (
              <>
                <Upload className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  点击或拖拽照片到这里
                </p>
                <p className="mt-1 text-xs text-muted-foreground/50">
                  支持 JPG、PNG、WebP 格式 · 自动读取 EXIF 信息
                </p>
              </>
            ) : (
              <div className="grid w-full grid-cols-4 gap-2 p-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                    {index === 0 && selectedFiles.length > 1 && (
                      <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-xs text-white">
                        +{selectedFiles.length - 1} 张
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFiles.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedFiles.length} 张照片
              </span>
              <button
                onClick={() => {
                  setSelectedFiles([])
                  setPreviewUrls([])
                }}
                className="text-sm text-red-500 hover:text-red-600"
              >
                清空选择
              </button>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* 上传按钮 */}
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          className="mb-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              上传中... {uploadProgress}%
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Upload className="h-4 w-4" />
              上传照片
            </span>
          )}
        </button>

        {/* 上传结果 */}
        {uploadResults.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-4 text-sm font-medium">上传结果</h2>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg p-3 text-sm ${
                    result.success ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{result.file}</span>
                  </div>
                  {result.success && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      查看图片
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </main>
  )
}
