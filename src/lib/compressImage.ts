/** Resize/compress an image before upload to keep Worker+R2 latency low. */
export async function compressImageForCarPage(file: File, maxEdge = 1280, quality = 0.82): Promise<File> {
  // Skip tiny stickers / already-small webp
  if (file.size <= 200 * 1024) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const preferWebp = file.type === 'image/webp' || !file.type.startsWith('image/')
  const mime = preferWebp ? 'image/webp' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality),
  )
  if (!blob) return file

  const ext = mime === 'image/webp' ? 'webp' : 'jpg'
  const name = file.name.replace(/\.[^.]+$/, '') + `.${ext}`
  return new File([blob], name, { type: mime })
}
