import { X, Camera, MapPin, Calendar, Aperture } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from './Badge'
import { getImageUrl, type PhotoMetadata } from '@/lib/photos'

interface PhotoModalProps {
  photo: (PhotoMetadata & { path: string }) | null
  onClose: () => void
}

export function PhotoModal({ photo, onClose }: PhotoModalProps) {
  useEffect(() => {
    if (photo) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [photo])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!photo) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-7xl overflow-hidden rounded-lg bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 左侧：图片展示 */}
        <div className="flex flex-1 items-center justify-center bg-muted p-8">
          <img
            src={getImageUrl(photo.path)}
            alt={photo.title || photo.path}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* 右侧：详细信息 */}
        <div className="w-96 overflow-y-auto border-l bg-card p-6">
          <div className="space-y-6">
            {/* 标题 */}
            {photo.title && (
              <div>
                <h2 className="text-2xl font-bold">{photo.title}</h2>
              </div>
            )}

            {/* 拍摄者说 */}
            {photo.photographerNote && (
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  拍摄者说
                </h3>
                <p className="text-sm leading-relaxed">{photo.photographerNote}</p>
              </div>
            )}

            {/* 基本信息 */}
            <div className="space-y-3">
              {photo.date && (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">拍摄日期</div>
                    <div className="text-sm">{formatDate(photo.date)}</div>
                  </div>
                </div>
              )}

              {photo.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">拍摄地点</div>
                    <div className="text-sm">{photo.location}</div>
                  </div>
                </div>
              )}

              {photo.camera && (
                <div className="flex items-start gap-3">
                  <Camera className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">相机</div>
                    <div className="text-sm">{photo.camera}</div>
                    {photo.lens && (
                      <div className="mt-1 text-xs text-muted-foreground">{photo.lens}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 拍摄参数 */}
            {photo.settings && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Aperture className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">拍摄参数</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {photo.settings.iso && (
                    <div>
                      <div className="text-xs text-muted-foreground">ISO</div>
                      <div className="text-sm font-medium">{photo.settings.iso}</div>
                    </div>
                  )}
                  {photo.settings.aperture && (
                    <div>
                      <div className="text-xs text-muted-foreground">光圈</div>
                      <div className="text-sm font-medium">f/{photo.settings.aperture}</div>
                    </div>
                  )}
                  {photo.settings.shutter && (
                    <div>
                      <div className="text-xs text-muted-foreground">快门</div>
                      <div className="text-sm font-medium">{photo.settings.shutter}s</div>
                    </div>
                  )}
                  {photo.settings.focalLength && (
                    <div>
                      <div className="text-xs text-muted-foreground">焦距</div>
                      <div className="text-sm font-medium">{photo.settings.focalLength}mm</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 标签 */}
            {photo.tags && photo.tags.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
