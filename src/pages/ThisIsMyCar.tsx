import { usePageTitle } from '@/hooks/usePageTitle'

/** Static photo at public/this-is-my-car.jpg — replace the file to update. */
const CAR_PHOTO_SRC = '/this-is-my-car.jpg'

export function ThisIsMyCar() {
  usePageTitle('pageTitle.thisIsMyCar', '这我小车车')

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white p-0">
      <img
        src={CAR_PHOTO_SRC}
        alt="干嘛! 这我小车车"
        className="block h-auto w-full max-w-full object-contain"
      />
    </main>
  )
}
