"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en", name: "English" },
  { code: "zh-CN", name: "简体中文" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "ko", name: "한국어" },
  //{ code: "ja", name: "日本語" },
]

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const switchLanguage = (locale: string) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[^/]+/, "")

    // Navigate to the same page with the new locale
    const newPath = `/${locale}${pathWithoutLocale || ""}`
    router.push(newPath)
    setOpen(false)
  }

  // Find the current language name
  const currentLanguage = languages.find((lang) => lang.code === currentLang)?.name || "English"

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 rounded-full">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className="flex items-center justify-between"
          >
            {language.name}
            {language.code === currentLang && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

