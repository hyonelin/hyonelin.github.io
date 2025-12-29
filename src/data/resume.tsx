import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { Mail, Home, NotebookPen } from 'lucide-react'

export const DATA = {
  name: "William Wen",
  initials: "WW",
  url: "https://yoursite.com",
  location: {
    zh: "上海, 中国",
    en: "Shanghai, China",
  },
  locationLink: "https://www.google.com/maps",
  description: {
    zh: "软件工程师 | 热爱技术与创新",
    en: "Software Engineer | Passionate about Tech & Innovation",
  },
  summary: {
    zh: "我是一名充满热情的软件工程师，专注于构建优秀的用户体验和高质量的代码。我喜欢探索新技术，解决复杂问题，并与团队合作创造有价值的产品。",
    en: "I'm a passionate software engineer focused on building great user experiences and high-quality code. I love exploring new technologies, solving complex problems, and collaborating with teams to create valuable products.",
  },
  avatarUrl: "/avatar.png",
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Go",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Git",
  ],
  navbar: [
    { href: "#hero", labelKey: "nav.home", icon: Home },
    // { href: "#about", labelKey: "nav.about", icon: User },
    // { href: "#work", labelKey: "nav.work", icon: Briefcase },
    // { href: "#education", labelKey: "nav.education", icon: GraduationCap },
    // { href: "#projects", labelKey: "nav.projects", icon: FolderKanban },
    // { href: "#contact", labelKey: "nav.contact", icon: MessageCircle },
    { href: "/blog", labelKey: "nav.blog", icon: NotebookPen, isRoute: true },
  ],
  contact: {
    email: "hello@example.com",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/hyonelin",
        icon: GitHubLogoIcon,
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/wen_xuanlin",
        icon: LinkedInLogoIcon,
      },
      {
        name: "Email",
        url: "mailto:wen_xuanlin@outlook.com",
        icon: Mail,
      },
    ],
  },
  work: [
    {
      company: "Tesla",
      href: "https://www.tesla.cn",
      badges: [],
      location: {
        zh: "上海",
        en: "Shanghai",
      },
      title: {
        zh: "IT 支持技术员",
        en: "IT Support Technician",
      },
      logoUrl: "/logos/tesla.png",
      start: {
        zh: "2022年4月",
        en: "Apr 2022",
      },
      end: null,
      description: {
        zh: "负责核心产品的架构设计和开发，使用 React、TypeScript 和 Node.js 构建高性能的 Web 应用。优化了系统性能，提升了 50% 的页面加载速度。",
        en: "Responsible for core product architecture and development, building high-performance web applications using React, TypeScript, and Node.js. Optimized system performance, improving page load speed by 50%.",
      },
    },
    {
      company: "Partea",
      href: "https://another-company.com",
      badges: [],
      location: {
        zh: "北京",
        en: "Beijing",
      },
      title: {
        zh: "软件工程师",
        en: "Software Engineer",
      },
      logoUrl: "/logos/partea.jpeg",
      start: {
        zh: "2020年6月",
        en: "Jun 2020",
      },
      end: {
        zh: "2021年12月",
        en: "Dec 2021",
      },
      description: {
        zh: "参与电商平台的开发，实现了订单管理、支付集成等核心功能。使用 Python 和 Django 构建后端服务，处理日均百万级请求。",
        en: "Participated in e-commerce platform development, implementing core features like order management and payment integration. Built backend services using Python and Django, handling millions of daily requests.",
      },
    },
    {
      company: "Startup",
      href: "https://startup.com",
      badges: [],
      location: {
        zh: "上海",
        en: "Shanghai",
      },
      title: {
        zh: "初级开发工程师",
        en: "Junior Developer",
      },
      logoUrl: "/logos/startup.png",
      start: {
        zh: "2019年7月",
        en: "Jul 2019",
      },
      end: {
        zh: "2020年5月",
        en: "May 2020",
      },
      description: {
        zh: "作为全栈开发工程师，参与了多个项目的开发。学习并应用了敏捷开发方法，提升了团队协作效率。",
        en: "As a full-stack developer, participated in multiple projects. Learned and applied agile development methods, improving team collaboration efficiency.",
      },
    },
  ],
  education: [
    {
      school: "MDIS",
      href: "https://www.mdis.edu.sg/",
      degree: {
        zh: "计算机科学与技术 学士学位",
        en: "Bachelor's Degree in Computer Science",
      },
      logoUrl: "/logos/mdis.png",
      start: "2020",
      end: "2021",
    },
    {
      school: "BCA Academy",
      href: "https://www.bcaa.edu.sg/",
      degree: {
        zh: "计算机科学与技术 学士学位",
        en: "Bachelor's Degree in Computer Science",
      },
      logoUrl: "/logos/bcaa.png",
      start: "2015",
      end: "2018",
    },
  ],
  projects: [
    {
      title: {
        zh: "项目一",
        en: "Project One",
      },
      href: "https://project1.com",
      dates: {
        zh: "2024年1月 - 2024年3月",
        en: "Jan 2024 - Mar 2024",
      },
      active: true,
      description: {
        zh: "一个基于 AI 的智能助手应用，帮助用户提高工作效率。集成了 OpenAI API，支持多种对话场景。",
        en: "An AI-powered smart assistant app that helps users improve productivity. Integrated with OpenAI API, supporting various conversation scenarios.",
      },
      technologies: ["React", "TypeScript", "Node.js", "OpenAI", "TailwindCSS"],
      links: [
        { type: "website", href: "https://project1.com" },
        { type: "source", href: "https://github.com/yourusername/project1" },
      ],
      image: "/projects/project-1/cover.png",
    },
    {
      title: {
        zh: "项目二",
        en: "Project Two",
      },
      href: "https://project2.com",
      dates: {
        zh: "2023年6月 - 2023年12月",
        en: "Jun 2023 - Dec 2023",
      },
      active: true,
      description: {
        zh: "一个开源的数据可视化工具，支持多种图表类型和数据源。被多家企业采用，GitHub 星标超过 1000。",
        en: "An open-source data visualization tool supporting multiple chart types and data sources. Adopted by many enterprises with 1000+ GitHub stars.",
      },
      technologies: ["Vue.js", "D3.js", "Python", "FastAPI", "PostgreSQL"],
      links: [
        { type: "website", href: "https://project2.com" },
        { type: "source", href: "https://github.com/yourusername/project2" },
      ],
      image: "/projects/project-2/cover.png",
    },
    {
      title: {
        zh: "项目三",
        en: "Project Three",
      },
      href: "https://project3.com",
      dates: {
        zh: "2023年1月 - 2023年5月",
        en: "Jan 2023 - May 2023",
      },
      active: false,
      description: {
        zh: "一个移动端优先的电商应用，支持商品浏览、购物车、在线支付等功能。使用 React Native 开发，同时支持 iOS 和 Android。",
        en: "A mobile-first e-commerce app supporting product browsing, shopping cart, and online payment. Built with React Native for both iOS and Android.",
      },
      technologies: ["React Native", "TypeScript", "Redux", "Stripe", "Firebase"],
      links: [{ type: "website", href: "https://project3.com" }],
      image: "/projects/project-3/cover.png",
    },
  ],
} as const

// Helper function to get localized text
export function getLocalizedText(
  text: string | { zh: string; en: string } | null | undefined,
  lang: string
): string {
  if (!text) return ''
  if (typeof text === 'string') return text
  return text[lang as 'zh' | 'en'] || text.zh
}
