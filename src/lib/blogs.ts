import { R2_BASE_URL } from '@/lib/photos'

export type BlogLang = 'cn' | 'en'

export interface BlogIndexItem {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  cover?: string
}

export function blogLangFromI18n(language: string): BlogLang {
  return language === 'zh' ? 'cn' : 'en'
}

export function getBlogIndexUrl(lang: BlogLang, source: 'r2' | 'local' = 'r2'): string {
  return source === 'r2'
    ? `${R2_BASE_URL}/blogs/${lang}/index.json`
    : `/blogs/${lang}/index.json`
}

export function getBlogPostUrl(lang: BlogLang, slug: string, source: 'r2' | 'local' = 'r2'): string {
  return source === 'r2'
    ? `${R2_BASE_URL}/blogs/${lang}/${slug}.md`
    : `/blogs/${lang}/${slug}.md`
}

/** Prefer R2, fall back to local public/blogs */
export async function fetchBlogIndex(lang: BlogLang): Promise<BlogIndexItem[]> {
  try {
    const r2Res = await fetch(getBlogIndexUrl(lang, 'r2'))
    if (r2Res.ok) {
      const data = await r2Res.json()
      if (Array.isArray(data) && data.length > 0) return data
      // empty R2 index → still try local for bootstrap
      if (Array.isArray(data)) {
        const local = await fetchLocalIndex(lang)
        return local.length > 0 ? local : data
      }
    }
  } catch {
    // ignore and fall back
  }
  return fetchLocalIndex(lang)
}

async function fetchLocalIndex(lang: BlogLang): Promise<BlogIndexItem[]> {
  const res = await fetch(getBlogIndexUrl(lang, 'local'))
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function fetchBlogMarkdown(lang: BlogLang, slug: string): Promise<string> {
  try {
    const r2Res = await fetch(getBlogPostUrl(lang, slug, 'r2'))
    if (r2Res.ok) return r2Res.text()
  } catch {
    // fall through
  }
  const localRes = await fetch(getBlogPostUrl(lang, slug, 'local'))
  if (!localRes.ok) throw new Error('Not found')
  return localRes.text()
}

export function parseMarkdownFrontmatter(text: string): {
  meta: Partial<BlogIndexItem>
  content: string
} {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { meta: {}, content: text }
  }

  const meta: Record<string, unknown> = {}
  match[1].split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':')
    if (colonIndex <= 0) return
    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        meta[key] = JSON.parse(value)
      } catch {
        meta[key] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/"/g, ''))
          .filter(Boolean)
      }
    } else {
      meta[key] = value
    }
  })

  return {
    meta: meta as Partial<BlogIndexItem>,
    content: match[2],
  }
}
