import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BlurFade } from '@/components/BlurFade'
import { Navbar } from '@/components/Navbar'
import { PhotoModal } from '@/components/PhotoModal'
import { PhotoMasonry } from '@/components/PhotoMasonry'
import { ArrowLeft, MapPin, Calendar, Camera, Loader2 } from 'lucide-react'
import { R2_BASE_URL, type PhotoMetadata, type PhotoAlbum } from '@/lib/photos'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'

export function PhotoAlbumPage() {
  const { albumId } = useParams<{ albumId: string }>()
  const { t, i18n } = useTranslation()
  usePageTitle('pageTitle.album')

  const [album, setAlbum] = useState<PhotoAlbum | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)

  const [page, setPage] = useState(1)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)

    fetch(`${R2_BASE_URL}/photos/albums.json`)
      .then((res) => {
        if (!res.ok) {
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

  const sortedPhotos = useMemo(() => {
    if (!album) return []
    return [...album.photos].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [album])

  const displayPhotos = sortedPhotos.slice(0, page * 30)
  const hasMore = page * 30 < sortedPhotos.length

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      },
      { rootMargin: '400px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, page])

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

  const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US'

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <BlurFade delay={0.04}>
          <Link
            to="/photography"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('photography.backToPhotography')}
          </Link>
        </BlurFade>

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
                  <span>
                    {new Date(album.date).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
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
                <span>
                  {album.photos.length} {t('photography.photos')}
                </span>
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

        <PhotoMasonry photos={displayPhotos} onSelect={setSelectedPhoto} />

        <div ref={loadMoreRef} className="flex justify-center py-8">
          {hasMore ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            displayPhotos.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {t('photography.noMorePhotos')}
              </span>
            )
          )}
        </div>
      </div>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      <Navbar />
    </main>
  )
}
