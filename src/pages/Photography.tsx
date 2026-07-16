import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { PhotoModal } from '@/components/PhotoModal'
import { ArrowLeft, MapPin, X, Camera, Calendar, Tag, Loader2, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getImageUrl, R2_BASE_URL, PHOTO_CONFIG, type PhotoMetadata, type PhotoIndex, type PhotoAlbum } from '@/lib/photos'
import { usePageTitle } from '@/hooks/usePageTitle'

export function Photography() {
  const { t } = useTranslation()
  usePageTitle('pageTitle.photography')

  // 全部图片数据
  const [allPhotos, setAllPhotos] = useState<PhotoMetadata[]>([])
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
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
  const [activeFilterTab, setActiveFilterTab] = useState<'year' | 'camera' | 'tags' | 'albums'>('year')

  // 无限滚动触发器
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 加载图片数据
  useEffect(() => {
    setLoading(true)
    
    // 从 R2 加载图片和相册数据
    // 注意：需要先将现有的 JSON 文件上传到 R2
    Promise.all([
      fetch(`${R2_BASE_URL}/photos/index.json`).then((res) => {
        if (!res.ok) {
          // 如果 R2 没有，尝试本地文件
          return fetch('/photos/index.json')
        }
        return res
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to load photos')
        return res.json()
      }),
      fetch(`${R2_BASE_URL}/photos/albums.json`).then((res) => {
        if (!res.ok) {
          return fetch('/photos/albums.json')
        }
        return res
      }).then((res) => {
        if (!res.ok) return { albums: [] }
        return res.json()
      }).catch(() => ({ albums: [] }))
    ])
      .then(([photoData, albumData]: [PhotoIndex, { albums: PhotoAlbum[] }]) => {
        const sorted = [...photoData.photos].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setAllPhotos(sorted)
        setAlbums(albumData.albums || [])
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

  // 总页数和是否还有更多
  const totalPages = Math.ceil(filteredPhotos.length / PHOTO_CONFIG.PAGE_SIZE)
  const hasNextPage = page < totalPages
  const totalCount = filteredPhotos.length

  // 按年份分组（倒序）
  const groupedPhotosByYear = useMemo(() => {
    const groups: Record<string, PhotoMetadata[]> = {}
    
    filteredPhotos.forEach((photo) => {
      const year = new Date(photo.date).getFullYear().toString()
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(photo)
    })
    
    // 按年份降序排序
    const sortedYears = Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a))
    const sortedGroups: Record<string, PhotoMetadata[]> = {}
    
    sortedYears.forEach((year) => {
      sortedGroups[year] = groups[year]
    })
    
    return sortedGroups
  }, [filteredPhotos])

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
                <div className="flex border-b overflow-x-auto">
                  <button
                    onClick={() => setActiveFilterTab('albums')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeFilterTab === 'albums'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FolderOpen className="h-4 w-4" />
                    {t('photography.albums')} ({albums.length})
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('year')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
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
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
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
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeFilterTab === 'tags'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    {t('photography.tagsLabel')} ({availableTags.length})
                  </button>
                </div>

                {/* 筛选内容 */}
                <div className="max-h-96 overflow-y-auto p-4">
                  {/* 项目相册 */}
                  {activeFilterTab === 'albums' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {albums.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground py-4">
                          {t('photography.noAlbums')}
                        </p>
                      ) : (
                        albums.map((album) => (
                          <Link
                            key={album.id}
                            to={`/photography/${album.id}`}
                            className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
                          >
                            {album.coverImage && (
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={getImageUrl(album.coverImage)}
                                  alt={album.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="font-semibold">{album.title}</h3>
                              {album.description && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {album.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                {album.date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(album.date).toLocaleDateString('zh-CN')}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Camera className="h-3 w-3" />
                                  {album.photos.length} 张
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                  
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
          {loading && filteredPhotos.length === 0 ? (
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
          ) : filteredPhotos.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {t('photography.noPhotos')}
            </div>
          ) : (
            /* 按年份分组显示 */
            Object.entries(groupedPhotosByYear).map(([year, yearPhotos], yearIndex) => (
              <div key={year} className="mb-16">
                {/* 年份标题 */}
                <BlurFade delay={0.1 + yearIndex * 0.05}>
                  <h2 className="mb-6 text-2xl font-bold flex items-center gap-3">
                    <Calendar className="h-6 w-6" />
                    {year}
                    <span className="text-sm font-normal text-muted-foreground">
                      {yearPhotos.length} {t('photography.photos')}
                    </span>
                  </h2>
                </BlurFade>
                
                {/* 瀑布流布局 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {yearPhotos.map((photo) => (
                    <div key={photo.path} className="break-inside-avoid">
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
                  ))}
                </div>
              </div>
            ))
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
