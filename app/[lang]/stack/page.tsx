import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getDictionary } from "../dictionaries"
import { Zap, AppWindow, Code2 } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: 'My Tech Stack',
  description: '我的技术栈和技能展示',
}

export default async function Stack({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  const techStack = [
    { 
      name: 'Power Automate', 
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      description: 'Microsoft Power Automate 是一个低代码/无代码平台，用于创建自动化工作流程。'
    },
    { 
      name: 'Power Apps', 
      icon: <AppWindow className="w-8 h-8 text-blue-500" />,
      description: 'Microsoft Power Apps 是一个低代码平台，用于构建自定义业务应用程序。'
    },
    { 
      name: 'Python', 
      icon: '/python.svg',
      description: 'Python 是一种高级编程语言，以其简洁的语法和丰富的库生态系统而闻名。'
    },
    { 
      name: 'HTML', 
      icon: '/html.svg',
      description: 'HTML 是用于创建网页的标准标记语言，是 Web 开发的基础。'
    },
    { 
      name: 'React', 
      icon: <Code2 className="w-8 h-8 text-blue-400" />,
      description: 'React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发和维护。'
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-mono mb-8">{dictionary.myStack}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techStack.map((tech) => (
            <div key={tech.name} className="bg-gray-900 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                {typeof tech.icon === 'string' ? (
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  tech.icon
                )}
              </div>
              <div>
                <h2 className="text-xl font-mono mb-2">{tech.name}</h2>
                <p className="text-gray-400">{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 