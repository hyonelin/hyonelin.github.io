import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { PhotoModal } from '@/components/PhotoModal'
import { ArrowLeft, MapPin, Calendar, Camera, Loader2 } from 'lucide-react'
import { getImageUrl, R2_BASE_URL, type PhotoMetadata, type PhotoAlbum } from '@/lib/photos'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'

export function PhotoAlbumPage() {
  const { albumId } = useParams<{ albumId: string }>()
  const { t } = useTranslation()
  usePageTitle('pageTitle.album')
  
  const [album, setAlbum] = useState<PhotoAlbum | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  
  // 分页
  const [page, setPage] = useState(1)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    
    // 从 R2 加载项目索引
    fetch(`${R2_BASE_URL}/photos/albums.json`)
      .then((res) => {
        if (!res.ok) {
          // 如果 R2 没有，尝试本地文件
          return fetch('/photos/albums.json')
        }
        return res
      })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load albums')
        return res.json()
      })
      .then((data: { albums: PhotoAlbum[] }) => {
        const found = data.albums.find((a) => a.id === albumId)
        if (!found) throw new Error('Album not found')
        setAlbum(found)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [albumId])

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && album && page * 30 < album.photos.length) {
          setPage((prev) => prev + 1)
        }
      },
      { rootMargin: '400px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [album, page])

  if (loading) {
    return (
      <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
        <Navbar />
      </main>
    )
  }

  if (error || !album) {
    return (
      <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/photography"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('photography.backToPhotography')}
          </Link>
          
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold">{t('photography.albumNotFound')}</h1>
            <p className="mt-2 text-muted-foreground">{t('photography.albumNotFoundDesc')}</p>
          </div>
        </div>
        <Navbar />
      </main>
    )
  }

  const displayPhotos = album.photos.slice(0, page * 30)
  const hasMore = page * 30 < album.photos.length

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-7xl">
        {/* 返回按钮 */}
        <BlurFade delay={0.04}>
          <Link
            to="/photography"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('photography.backToPhotography')}
          </Link>
        </BlurFade>

        {/* 项目信息 */}
        <BlurFade delay={0.08}>
          <div className="mb-12 space-y-4">
            <h1 className="text-3xl font-bold">{album.title}</h1>
            
            {album.description && (
              <p className="text-muted-foreground">{album.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {album.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(album.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              
              {album.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{album.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                <span>{album.photos.length} 张照片</span>
              </div>
            </div>
            
            {album.tags && album.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {album.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </BlurFade>

        {/* 照片瀑布流 */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {displayPhotos.map((photo, index) => (
            <BlurFade key={photo.path} delay={0.1 + index * 0.02}>
              <div className="mb-4 break-inside-avoid">
                <div
                  className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <LazyImage
                    src={getImageUrl(photo.path)}
                    alt={photo.title || photo.path}
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      {photo.title && (
                        <h3 className="text-sm font-semibold">{photo.title}</h3>
                      )}
                      {photo.location && (
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {photo.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* 加载更多 */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      <Navbar />
    </main>
  )
}

// 懒加载图片组件
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
}

function LazyImage({ src, alt, className, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative min-h-[200px]">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-lg" />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`${className || ''} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true)
          setIsLoaded(true)
        }}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-lg gap-2">
          <Camera className="h-8 w-8 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">图片加载失败</span>
        </div>
      )}
    </div>
  )
}
