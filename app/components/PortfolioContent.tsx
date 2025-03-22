'use client'

import Image from "next/image"
import Link from "next/link"
import { Linkedin, Youtube, Github, Mail, X, Instagram, MessageCircle, BookOpen, Bookmark, Zap, AppWindow, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/language-switcher"
import type { Dictionary } from "../[lang]/dictionaries"

export default function PortfolioContent({ 
  dictionary, 
  lang 
}: { 
  dictionary: Dictionary
  lang: string 
}) {
  const techStack = [
    { name: 'Power Automate', icon: <Zap className="w-6 h-6 text-blue-500" /> },
    { name: 'Power Apps', icon: <AppWindow className="w-6 h-6 text-blue-500" /> },
    { name: 'Python', icon: '/python.svg' },
    { name: 'HTML', icon: '/html.svg' },
    { name: 'React', icon: <Code2 className="w-6 h-6 text-blue-400" /> },
  ]

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: "https://github.com/hyonelin", label: "GitHub" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com/in/hyonelin", label: "LinkedIn" },
    { icon: <Mail className="w-5 h-5" />, href: "mailto:hyonelin@gmail.com", label: "Email" },
    { icon: <X className="w-5 h-5" />, href: "https://x.com/hyonelin", label: "X" },
    { icon: <Instagram className="w-5 h-5" />, href: "https://instagram.com/hyonelin", label: "Instagram" },
    { icon: <MessageCircle className="w-5 h-5" />, href: "https://wechat.com/hyonelin", label: "WeChat" },
    { icon: <BookOpen className="w-5 h-5" />, href: "https://zhihu.com/people/hyonelin", label: "知乎" },
    { icon: <Bookmark className="w-5 h-5" />, href: "https://xiaohongshu.com/user/profile/hyonelin", label: "小红书" },
  ]

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 p-6">
        {/* Left Sidebar */}
        <div className="flex flex-col h-full">
          {/* Top Section */}
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Image src="/placeholder.svg" alt="Profile" width={60} height={60} className="rounded-full" />
              <div>
                <h1 className="text-2xl font-mono">{dictionary.name}</h1>
                <p className="text-gray-400">{dictionary.nativeName}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">{dictionary.bio}</p>
              <Button variant="outline" className="rounded-full">
                {dictionary.moreAboutMe}
              </Button>
            </div>
          </div>

          {/* Bottom Section - Fixed */}
          <div className="mt-auto space-y-8">
            {/* Language Switcher */}
            <div className="pt-4">
              <LanguageSwitcher currentLang={lang} />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {socialLinks.map((link) => (
                  <Button variant="ghost" size="icon" asChild key={link.label}>
                    <Link href={link.href}>
                      {link.icon}
                    </Link>
                  </Button>
                ))}
              </div>
              <div className="text-gray-400 text-sm">
                <p>{dictionary.copyright}</p>
                <div className="flex gap-4">
                  <Link href="#" className="hover:text-white">
                    {dictionary.licensing}
                  </Link>
                  <Link href="#" className="hover:text-white">
                    {dictionary.notFound}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="h-full overflow-y-auto space-y-8 pr-2">
          {/* Projects Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-mono">{dictionary.myProjects}</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/${lang}/projects`}>
                  <span className="sr-only">{dictionary.viewAllProjects}</span>→
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
                  <Image src="/placeholder.svg" alt={`Project ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>

          {/* Stack Section */}
          <section className="bg-blue-600 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-mono">{dictionary.myStack}</h2>
              <Button variant="ghost" size="icon" className="text-white" asChild>
                <Link href={`/${lang}/stack`}>
                  <span className="sr-only">{dictionary.viewAllTools}</span>→
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              {techStack.map((tech) => (
                <div key={tech.name} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
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
              ))}
            </div>
          </section>

          {/* Contact and Clients Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Section */}
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6">
              <h2 className="text-2xl font-mono mb-4">{dictionary.contact}</h2>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4" asChild>
                <Link href={`/${lang}/contact`}>
                  <span className="sr-only">{dictionary.contactMe}</span>→
                </Link>
              </Button>
            </section>

            {/* Happy Clients Section */}
            <section className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <h3 className="text-4xl font-bold mb-4">100%</h3>
              <p className="text-gray-400">{dictionary.happyClients}</p>
              <div className="flex -space-x-2 mt-4">
                {[1, 2, 3].map((i) => (
                  <Image
                    key={i}
                    src="/placeholder.svg"
                    alt={`Client ${i}`}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-gray-900"
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 