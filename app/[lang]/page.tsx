import type { Dictionary } from "./dictionaries"
import PortfolioContent from "../components/PortfolioContent"

async function getDictionary(lang: string): Promise<Dictionary> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${lang}/api/dictionary`)
  if (!response.ok) {
    throw new Error('Failed to fetch dictionary')
  }
  return response.json()
}

export default async function Portfolio({ params }: { params: { lang: string } }) {
  const dictionary = await getDictionary(params.lang)
  
  return <PortfolioContent dictionary={dictionary} lang={params.lang} />
}

