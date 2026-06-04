import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { PhotoModal } from '@/components/PhotoModal'
import { ArrowLeft, MapPin, X, Camera, Calendar, Tag, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getImageUrl, PHOTO_CONFIG, type PhotoMetadata, type PhotoIndex } from '@/lib/photos'

export function Photography() {
  const { t } = useTranslation()

  // 全部图片数据
  const [allPhotos, setAllPhotos] = useState<PhotoMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 分页状态
  const [page, setPage] = useState(1)

  // 筛选状态
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // UI 状态
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState<'year' | 'camera' | 'tags'>('year')

  // 无限滚动触发器
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 加载图片数据
  useEffect(() => {
    setLoading(true)
    fetch('/photos/index.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load photos')
        return res.json()
      })
      .then((data: PhotoIndex) => {
        const sorted = [...data.photos].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setAllPhotos(sorted)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [])

  // 可用筛选选项
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    allPhotos.forEach((photo) => {
      years.add(new Date(photo.date).getFullYear().toString())
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }, [allPhotos])

  const availableCameras = useMemo(() => {
    const cameras = new Set<string>()
    allPhotos.forEach((photo) => {
      if (photo.camera) cameras.add(photo.camera)
    })
    return Array.from(cameras).sort()
  }, [allPhotos])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    allPhotos.forEach((photo) => {
      photo.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [allPhotos])

  // 筛选后的图片
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((photo) => {
      // 年份筛选
      if (selectedYear) {
        const photoYear = new Date(photo.date).getFullYear().toString()
        if (photoYear !== selectedYear) return false
      }

      // 相机筛选
      if (selectedCamera && !photo.camera?.includes(selectedCamera)) {
        return false
      }

      // 标签筛选
      if (selectedTags.length > 0) {
        const hasTag = selectedTags.some((tag) => photo.tags?.includes(tag))
        if (!hasTag) return false
      }

      return true
    })
  }, [allPhotos, selectedYear, selectedCamera, selectedTags])

  // 分页后的图片
  const paginatedPhotos = useMemo(() => {
    const endIndex = page * PHOTO_CONFIG.PAGE_SIZE
    return filteredPhotos.slice(0, endIndex)
  }, [filteredPhotos, page])

  // 总页数和是否还有更多
  const totalPages = Math.ceil(filteredPhotos.length / PHOTO_CONFIG.PAGE_SIZE)
  const hasNextPage = page < totalPages
  const totalCount = filteredPhotos.length

  // 加载更多
  const loadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      setPage((prev) => prev + 1)
    }
  }, [hasNextPage, loading])

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !loading) {
          loadMore()
        }
      },
      { rootMargin: '400px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, loading, loadMore])

  // 重置页码（当筛选条件改变时）
  useEffect(() => {
    setPage(1)
  }, [selectedYear, selectedCamera, selectedTags])

  // 清除所有筛选
  const clearAllFilters = () => {
    setSelectedYear(null)
    setSelectedCamera(null)
    setSelectedTags([])
  }

  // 切换标签
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const hasFilters = selectedYear || selectedCamera || selectedTags.length > 0

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <BlurFade delay={0.04}>
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('photography.backToHome')}
          </Link>
        </BlurFade>

        <BlurFade delay={0.08}>
          <h1 className="text-3xl font-bold tracking-tight">{t('photography.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('photography.description')}</p>
        </BlurFade>

        {/* 筛选器 */}
        <BlurFade delay={0.12}>
          <div className="mt-8 space-y-4">
            {/* 筛选按钮和统计 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <Tag className="h-4 w-4" />
                  <span>{t('photography.filters')}</span>
                  {hasFilters && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {(selectedYear ? 1 : 0) + (selectedCamera ? 1 : 0) + selectedTags.length}
                    </span>
                  )}
                </button>

                <span className="text-sm text-muted-foreground">
                  {totalCount} {t('photography.photos')}
                </span>
              </div>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  {t('photography.clearAll')}
                </button>
              )}
            </div>

            {/* 当前筛选条件 */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {selectedYear && (
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>{selectedYear}</span>
                    <button onClick={() => setSelectedYear(null)} className="ml-1 rounded-full p-0.5 hover:bg-primary/20">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedCamera && (
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    <Camera className="h-3 w-3" />
                    <span>{selectedCamera}</span>
                    <button onClick={() => setSelectedCamera(null)} className="ml-1 rounded-full p-0.5 hover:bg-primary/20">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                    <button onClick={() => toggleTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-primary/20">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 筛选面板 */}
            {isFilterOpen && (
              <div className="rounded-lg border bg-card">
                {/* 标签页 */}
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveFilterTab('year')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeFilterTab === 'year'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    {t('photography.year')} ({availableYears.length})
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('camera')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeFilterTab === 'camera'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Camera className="h-4 w-4" />
                    {t('photography.camera')} ({availableCameras.length})
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('tags')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeFilterTab === 'tags'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    {t('photography.tags')} ({availableTags.length})
                  </button>
                </div>

                {/* 筛选内容 */}
                <div className="max-h-64 overflow-y-auto p-4">
                  {/* 年份筛选 */}
                  {activeFilterTab === 'year' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedYear(null)}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                          !selectedYear
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {t('photography.allYears')}
                      </button>
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                            selectedYear === year
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 相机筛选 */}
                  {activeFilterTab === 'camera' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCamera(null)}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                          !selectedCamera
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {t('photography.allCameras')}
                      </button>
                      {availableCameras.map((camera) => (
                        <button
                          key={camera}
                          onClick={() => setSelectedCamera(camera)}
                          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                            selectedCamera === camera
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {camera}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 标签筛选 */}
                  {activeFilterTab === 'tags' && (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </BlurFade>

        {/* 照片展示 */}
        <div className="mt-12">
          {loading && paginatedPhotos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('photography.loading')}</span>
              </div>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-muted-foreground">
              {t('photography.loadError')}
            </div>
          ) : paginatedPhotos.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {t('photography.noPhotos')}
            </div>
          ) : (
            /* 瀑布流布局 */
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {paginatedPhotos.map((photo, index) => (
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
          )}

          {/* 加载更多触发器 */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('photography.loadingMore')}</span>
                </div>
              )}
            </div>
          )}

          {/* 没有更多了 */}
          {!hasNextPage && paginatedPhotos.length > 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('photography.noMorePhotos')}
            </div>
          )}
        </div>
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
    <div className="relative">
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          style={{ minHeight: '200px' }}
        />
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
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">{t('photography.loadError')}</span>
        </div>
      )}
    </div>
  )
}
