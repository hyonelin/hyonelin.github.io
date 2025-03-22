import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Projects',
  description: '查看我的项目作品集',
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>返回首页</span>
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-8">我的项目</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 项目卡片示例 */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-semibold mb-4">项目名称</h2>
          <p className="text-gray-600 mb-4">项目描述和主要功能说明</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Next.js</span>
          </div>
        </div>
        {/* 可以添加更多项目卡片 */}
      </div>
    </div>
  )
} 