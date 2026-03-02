import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { PhotoModal } from '@/components/PhotoModal'
import { ArrowLeft, Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PhotoMetadata {
  filename: string
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

interface TagCategory {
  name: string
  label: string
  tags: string[]
}

export function Photography() {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<PhotoMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState<Record<string, string>>({
    content: 'all',
    shot: 'all',
    camera: 'all',
    location: 'all',
  })
  const [groupBy, setGroupBy] = useState<'year' | 'month'>('year')
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    // 加载照片元数据
    fetch('/shots/index.json')
      .then((res) => res.json())
      .then((data: PhotoMetadata[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setPhotos(sorted)
        setLoading(false)
      })
      .catch(() => {
        setPhotos([])
        setLoading(false)
      })
  }, [])

  // 定义 tag 分类
  const tagCategories: TagCategory[] = [
    {
      name: 'content',
      label: t('photography.contentTag'),
      tags: [
        'all', 
        t('photography.tags.urbanLife'),
        t('photography.tags.timelapse'),
        t('photography.tags.nature'),
        t('photography.tags.animal'),
        t('photography.tags.humanistic'),
        t('photography.tags.microscopy')
      ],
    },
    {
      name: 'shot',
      label: t('photography.shotTag'),
      tags: [
        'all', 
        t('photography.tags.panorama'),
        t('photography.tags.longShot'),
        t('photography.tags.mediumShot'),
        t('photography.tags.closeUp'),
        t('photography.tags.extremeCloseUp')
      ],
    },
    {
      name: 'camera',
      label: t('photography.cameraBrand'),
      tags: [
        'all', 
        'Nikon', 
        'Apple', 
        'Sony', 
        'Canon',
        'Fujifilm', 
        'Panasonic'
      ],
    },
    {
      name: 'location',
      label: t('photography.locationTag'),
      tags: [
        'all', 
        t('photography.tags.shanghaiChina'),
        t('photography.tags.dalianChina'),
        t('photography.tags.singapore'),
        t('photography.tags.other')
      ],
    },
  ]

  // Tag 翻译映射（用于匹配数据）
  const tagMapping: Record<string, string> = {
    [t('photography.tags.urbanLife')]: '城市人文',
    [t('photography.tags.timelapse')]: '延时',
    [t('photography.tags.nature')]: '自然风景',
    [t('photography.tags.animal')]: '动物',
    [t('photography.tags.humanistic')]: '人文',
    [t('photography.tags.microscopy')]: '显微摄影',
    [t('photography.tags.panorama')]: '全景',
    [t('photography.tags.longShot')]: '远景',
    [t('photography.tags.mediumShot')]: '中景',
    [t('photography.tags.closeUp')]: '近景',
    [t('photography.tags.extremeCloseUp')]: '特写',
    [t('photography.tags.shanghaiChina')]: '中国上海',
    [t('photography.tags.dalianChina')]: '中国大连',
    [t('photography.tags.beijing')]: '北京',
    [t('photography.tags.hangzhou')]: '杭州',
    [t('photography.tags.singapore')]: '新加坡',
    [t('photography.tags.other')]: '其他',
  }

  const filteredPhotos = photos.filter((photo) => {
    // 获取原始中文 tag（用于匹配数据）
    const getOriginalTag = (displayTag: string) => {
      return tagMapping[displayTag] || displayTag
    }

    // 检查每个分类的 tag
    const matchContent = selectedTags.content === 'all' || 
      (photo.tags && photo.tags.includes(getOriginalTag(selectedTags.content)))
    
    const matchShot = selectedTags.shot === 'all' || 
      (photo.tags && photo.tags.includes(getOriginalTag(selectedTags.shot)))
    
    // 相机品牌筛选：检查 camera 字段或 tags 数组
    const matchCamera = selectedTags.camera === 'all' || 
      (photo.camera && photo.camera.includes(selectedTags.camera)) ||
      (photo.tags && photo.tags.includes(selectedTags.camera))
    
    const matchLocationTag = selectedTags.location === 'all' || 
      (photo.tags && photo.tags.includes(getOriginalTag(selectedTags.location)))
    
    return matchContent && matchShot && matchCamera && matchLocationTag
  })

  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    const date = new Date(photo.date)
    const key = groupBy === 'year' 
      ? date.getFullYear().toString()
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[key]) acc[key] = []
    acc[key].push(photo)
    return acc
  }, {} as Record<string, PhotoMetadata[]>)

  const formatGroupTitle = (key: string) => {
    if (groupBy === 'year') return key
    const [year, month] = key.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      t('photography.locale'),
      { year: 'numeric', month: 'long' }
    )
  }

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

        {/* 筛选和分组控制 */}
        <BlurFade delay={0.12}>
          <div className="mt-8 space-y-4">
            {/* 筛选按钮 */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <span>{t('photography.filters')}</span>
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* 时间分组 */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => setGroupBy('year')}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    groupBy === 'year' ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  {t('photography.byYear')}
                </button>
                <button
                  onClick={() => setGroupBy('month')}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    groupBy === 'month' ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  {t('photography.byMonth')}
                </button>
              </div>
            </div>

            {/* Tag 分类筛选 - 可折叠 */}
            {isFilterOpen && (
              <div className="space-y-4 rounded-lg border bg-card p-4">
                {tagCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {category.label}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setSelectedTags((prev) => ({ ...prev, [category.name]: tag }))
                          }
                          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                            selectedTags[category.name] === tag
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {tag === 'all' ? t('photography.allTags') : tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BlurFade>

        {/* 照片展示 */}
        <div className="mt-12">
          {loading ? (
            <p className="text-muted-foreground">{t('photography.loading')}</p>
          ) : filteredPhotos.length === 0 ? (
            <p className="text-muted-foreground">{t('photography.noPhotos')}</p>
          ) : (
            Object.entries(groupedPhotos).map(([group, groupPhotos], groupIndex) => (
              <div key={group} className="mb-16">
                <BlurFade delay={0.16 + groupIndex * 0.05}>
                  <h2 className="mb-6 text-2xl font-semibold">{formatGroupTitle(group)}</h2>
                </BlurFade>
                
                {/* 瀑布流布局 */}
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                  {groupPhotos.map((photo, photoIndex) => (
                    <BlurFade 
                      key={photo.filename} 
                      delay={0.2 + groupIndex * 0.05 + photoIndex * 0.02}
                    >
                      <div className="mb-4 break-inside-avoid">
                        <div 
                          className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <img
                            src={`/shots/${photo.filename}`}
                            alt={photo.title || photo.filename}
                            className="w-full transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
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
