import { useEffect, useRef, useState } from 'react'
import { Camera, MapPin } from 'lucide-react'
import { getImageUrl, type PhotoMetadata } from '@/lib/photos'

interface PhotoMasonryProps {
  photos: PhotoMetadata[]
  onSelect: (photo: PhotoMetadata) => void
}

/**
 * CSS multi-column masonry (true waterfall).
 * Items stack by height instead of aligning to equal grid rows.
 */
export function PhotoMasonry({ photos, onSelect }: PhotoMasonryProps) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {photos.map((photo) => (
        <div key={photo.path} className="mb-4 break-inside-avoid">
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
        </div>
      ))}
    </div>
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
          style={aspectRatio ? { aspectRatio } : { minHeight: 180 }}
        />
      )}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`block w-full h-auto transition-opacity duration-300 ${
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
          style={aspectRatio ? { aspectRatio } : { minHeight: 180 }}
        >
          <Camera className="h-8 w-8 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">图片加载失败</span>
        </div>
      )}
    </div>
  )
}
