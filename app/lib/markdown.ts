import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

const postsDirectory = path.join(process.cwd(), 'posts')
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

export type Post = {
  id: string
  title: string
  date: string
  content: string
  excerpt: string
  lang: string
}

export function getAllPostIds(lang: string) {
  if (!fs.existsSync(path.join(postsDirectory, lang))) {
    return []
  }
  const fileNames = fs.readdirSync(path.join(postsDirectory, lang))
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
        lang,
      },
    }
  })
}

export function getSortedPostsData(lang: string): Post[] {
  if (!fs.existsSync(path.join(postsDirectory, lang))) {
    return []
  }
  const fileNames = fs.readdirSync(path.join(postsDirectory, lang))
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, lang, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    const excerpt = matterResult.content.slice(0, 200) + '...'

    return {
      id,
      lang,
      excerpt,
      ...(matterResult.data as { title: string; date: string }),
      content: md.render(matterResult.content),
    }
  })

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getPostData(id: string, lang: string): Post {
  const fullPath = path.join(postsDirectory, lang, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  const excerpt = matterResult.content.slice(0, 200) + '...'

  return {
    id,
    lang,
    excerpt,
    ...(matterResult.data as { title: string; date: string }),
    content: md.render(matterResult.content),
  }
} 