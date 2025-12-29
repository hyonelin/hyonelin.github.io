import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { Mail, Home, NotebookPen } from 'lucide-react'
import { WeChatIcon } from '@/components/icons/WeChatIcon'

export const DATA = {
  name: "William Wen",
  initials: "WW",
  url: "https://hyonelin.github.io",
  location: {
    zh: "上海, 中国",
    en: "Shanghai, China",
  },
  locationLink: "https://www.google.com/maps",
  description: {
    zh: "IT 技术支持工程师 & 软件工程师",
    en: "IT Support Technician & Software Engineer",
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
        url: "https://linkedin.com/in/xuanlin-wen",
        icon: LinkedInLogoIcon,
      },
      {
        name: "WeChat",
        url: "#wechat",
        icon: WeChatIcon,
        isWechat: true,
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
        zh: "IT 技术支持工程师",
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
      company: "大连盛捷国际货运代理有限公司",
      href: "",
      badges: [],
      location: {
        zh: "辽宁大连",
        en: "Dalian, Liaoning",
      },
      title: {
        zh: "IT运维",
        en: "IT Operation",
      },
      logoUrl: "",
      start: {
        zh: "2021年9月",
        en: "Sep 2021",
      },
      end: {
        zh: "2022年1月",
        en: "Jan 2022",
      },
      description: {
        zh: "负责维护公司网络、电脑、打印机等软硬件，以确保公司业务正常进行。",
        en: "Responsible for maintaining the company's network, computers, printers, and other hardware and software to ensure the normal operation of the company's business.",
      },
    },
    {
      company: "Lucky	Joint	Construction Pte. Ltd.",
      href: "www.luckyjoint.com.sg",
      badges: [],
      location: {
        zh: "新加坡",
        en: "Singapore",
      },
      title: {
        zh: "Civil officer",
        en: "Civil officer",
      },
      logoUrl: "/logos/lucky-joint.jpg",
      start: {
        zh: "2020年3月",
        en: "Mar 2020",
      },
      end: {
        zh: "2020年7月",
        en: "Jul 2020",
      },
      description: {
        zh: "绘制电信线缆施工图（CAD），绘制施工细节及电缆走向图",
        en: "Draw construction drawings (CAD) for telecommunications cables, including construction details and cable routing diagrams.",
      },
    },
    {
      company: "Partea",
      href: "https://another-company.com",
      badges: [],
      location: {
        zh: "新加坡",
        en: "Singapore",
      },
      title: {
        zh: "IT及市场宣传部主管",
        en: "Head of IT and Marketing",
      },
      logoUrl: "/logos/partea.jpeg",
      start: {
        zh: "2018年2月",
        en: "Feb 2018",
      },
      end: {
        zh: "2020年3月",
        en: "Mar 2020",
      },
      description: {
        zh: "独立调研并部署收银系统，独立使用HTML开发官网，部署公司总部基础网络服务架构（包括但不限于网络、文件存储服务器、监控摄像头等）。并负责门店巡检，主要负责检查IT系统以及运营情况。",
        en: "Independently researched and deployed the POS system, independently developed the official website using HTML, and deployed the company headquarters' basic network service architecture (including but not limited to network, file storage servers, surveillance cameras, etc.). Also responsible for store inspections, primarily checking the IT system and operational status.",
      },
    },
  ],
  education: [
    {
      school: "MDIS",
      href: "https://www.mdis.edu.sg/",
      degree: {
        zh: "信息技术理学士学位",
        en: "Bachelor of Science (Hons) Information Technology",
      },
      logoUrl: "/logos/mdis.png",
      start: {
        zh: "2020年09月",
        en: "Sep 2020",
      },
      end: {
        zh: "2021年06月",
        en: "Jun 2021",
      },
    },
    {
      school: "BCA Academy",
      href: "https://www.bcaa.edu.sg/",
      degree: {
        zh: "建筑信息技术",
        en: "Diploma in Construction Information Technology",
      },
      logoUrl: "/logos/bcaa.png",
      start: {
        zh: "2015年03月",
        en: "Mar 2015",
      },
      end: {
        zh: "2018年10月",
        en: "Oct 2018",
      },
    },
  ],
  projects: [
    // {
    //   title: {
    //     zh: "项目一",
    //     en: "Project One",
    //   },
    //   href: "https://project1.com",
    //   dates: {
    //     zh: "2024年1月 - 2024年3月",
    //     en: "Jan 2024 - Mar 2024",
    //   },
    //   active: true,
    //   description: {
    //     zh: "一个基于 AI 的智能助手应用，帮助用户提高工作效率。集成了 OpenAI API，支持多种对话场景。",
    //     en: "An AI-powered smart assistant app that helps users improve productivity. Integrated with OpenAI API, supporting various conversation scenarios.",
    //   },
    //   technologies: ["React", "TypeScript", "Node.js", "OpenAI", "TailwindCSS"],
    //   links: [
    //     { type: "website", href: "https://project1.com" },
    //     { type: "source", href: "https://github.com/yourusername/project1" },
    //   ],
    //   image: "/projects/project-1/cover.png",
    // },
    {
      title: {
        zh: "施工中。。。",
        en: "Under Construction...",
      },
      href: "https://hyonelin.github.io",
      dates: {
        zh: "2024年1月 - 至今",
        en: "Jan 2024 - Present",
      },
      active: true,
      description: {
        zh: "即将为您呈现，烦请您稍后再来~",
        en: "It will be presented to you shortly, please come back later~",
      },
      technologies: ["React maybe?"],
      links: [
        { type: "website", href: "https://hyonelin.github.io" },
        { type: "source", href: "https://hyonelin.github.io" },
      ],
      // image: "/projects/project-1/cover.png",
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
