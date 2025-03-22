import Link from 'next/link'
import { getSortedPostsData } from '@/app/lib/markdown'
import { getDictionary } from '../dictionaries'

export default async function Blog({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)
  const posts = getSortedPostsData(lang)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-mono mb-8">{dictionary.blog}</h1>
        
        <div className="grid gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-gray-900 rounded-xl p-6">
              <Link href={`/${lang}/blog/${post.id}`}>
                <h2 className="text-2xl font-mono mb-2 hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <div className="text-gray-400 text-sm mb-4">
                {new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <p className="text-gray-300">{post.excerpt}</p>
              <Link 
                href={`/${lang}/blog/${post.id}`}
                className="inline-block mt-4 text-blue-400 hover:text-blue-300 transition-colors"
              >
                {dictionary.readMore} →
              </Link>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              {dictionary.noPosts}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 