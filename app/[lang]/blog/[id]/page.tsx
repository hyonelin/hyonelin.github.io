import { getPostData, getAllPostIds } from '@/app/lib/markdown'
import { getDictionary } from '../../dictionaries'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const posts = getAllPostIds(lang)
  return posts
}

export default async function Post({
  params: { id, lang },
}: {
  params: { id: string; lang: string }
}) {
  const dictionary = await getDictionary(lang)
  const post = getPostData(id, lang)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/${lang}/blog`}
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {dictionary.backToBlog}
        </Link>

        <article>
          <h1 className="text-4xl font-mono mb-4">{post.title}</h1>
          <div className="text-gray-400 text-sm mb-8">
            {new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  )
} 