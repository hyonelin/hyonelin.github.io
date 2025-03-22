import { getDictionary } from "../../dictionaries"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { lang: string } }) {
  const dictionary = await getDictionary(params.lang)
  return NextResponse.json(dictionary)
}

