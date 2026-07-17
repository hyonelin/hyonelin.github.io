import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, MapPin } from 'lucide-react'
import { getImageUrl, type PhotoMetadata } from '@/lib/photos'

interface PhotoMasonryProps {
  photos: PhotoMetadata[]
  onSelect: (photo: PhotoMetadata) => void
  gap?: number
}

function getColumnCount(width: number): number {
  if (width >= 1280) return 4
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

/**
 * Fixed-width column masonry, left-packed.
 * - Column width is always based on the viewport max columns (consistent card width)
 * - When photos < columns, unused space stays on the right (no stretching)
 * - Tops stay aligned; bottoms form a waterfall by natural image height
 */
export function PhotoMasonry({ photos, onSelect, gap = 16 }: PhotoMasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportColumns, setViewportColumns] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const update = () => {
      const width = node.clientWidth
      setContainerWidth(width)
      setViewportColumns(getColumnCount(width))
    }
    update()

    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // How many columns we actually fill (never more than photos)
  const usedColumns = Math.max(1, Math.min(viewportColumns, photos.length || 1))

  const columnWidth = useMemo(() => {
    if (containerWidth <= 0 || viewportColumns <= 0) return undefined
    const totalGap = gap * (viewportColumns - 1)
    return (containerWidth - totalGap) / viewportColumns
  }, [containerWidth, viewportColumns, gap])

  const columns = useMemo(() => {
    const cols: PhotoMetadata[][] = Array.from({ length: usedColumns }, () => [])
    const colHeights = Array(usedColumns).fill(0)

    photos.forEach((photo) => {
      let target = 0
      for (let i = 1; i < usedColumns; i++) {
        if (colHeights[i] < colHeights[target]) target = i
      }

      cols[target].push(photo)

      const ratio =
        photo.width && photo.height && photo.width > 0
          ? photo.height / photo.width
          : 1.25
      colHeights[target] += ratio
    })

    return cols
  }, [photos, usedColumns])

  return (
    <div
      ref={containerRef}
      className="flex w-full items-start justify-start"
      style={{ gap }}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex flex-col"
          style={{
            gap,
            width: columnWidth,
            flex: '0 0 auto',
          }}
        >
          {column.map((photo) => (
            <PhotoCard
              key={photo.path}
              photo={photo}
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PhotoCard({
  photo,
  onSelect,
}: {
  photo: PhotoMetadata
  onSelect: (photo: PhotoMetadata) => void
}) {
  return (
    <button
      type="button"
      className="group relative block w-full cursor-pointer overflow-hidden rounded-lg border bg-card text-left transition-shadow hover:shadow-lg"
      onClick={() => onSelect(photo)}
    >
      <LazyImage
        src={getImageUrl(photo.path)}
        alt={photo.title || photo.path}
        width={photo.width}
        height={photo.height}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
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
    </button>
  )
}

interface LazyImageProps {
  src: string
  alt?: string
  width?: number
  height?: number
}

function LazyImage({ src, alt, width, height }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const aspectRatio =
    width && height && width > 0 && height > 0 ? `${width} / ${height}` : undefined

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-muted"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && !hasError && (
        <div
          className="w-full animate-pulse bg-muted"
          style={{ aspectRatio: aspectRatio ?? '4 / 5' }}
        />
      )}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`block h-auto w-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'absolute inset-0 opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(true)
          }}
        />
      )}
      {hasError && (
        <div
          className="flex w-full flex-col items-center justify-center gap-2 bg-muted"
          style={{ aspectRatio: aspectRatio ?? '4 / 5' }}
        >
          <Camera className="h-8 w-8 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">图片加载失败</span>
        </div>
      )}
    </div>
  )
}
