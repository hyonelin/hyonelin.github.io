import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { Mail, User, Briefcase, GraduationCap, FolderKanban, MessageCircle, Home, NotebookPen } from 'lucide-react'

export const DATA = {
  name: "William Wen",
  initials: "WW",
  url: "https://yoursite.com",
  location: "Shanghai, China",
  locationLink: "https://www.google.com/maps",
  description: "软件工程师 | 热爱技术与创新",
  summary:
    "我是一名充满热情的软件工程师，专注于构建优秀的用户体验和高质量的代码。我喜欢探索新技术，解决复杂问题，并与团队合作创造有价值的产品。",
  avatarUrl: "/avatar.jpg",
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
    { href: "#hero", label: "首页", icon: Home },
    // { href: "#about", label: "关于", icon: User },
    // { href: "#work", label: "经历", icon: Briefcase },
    // { href: "#education", label: "教育", icon: GraduationCap },
    // { href: "#projects", label: "项目", icon: FolderKanban },
    // { href: "#contact", label: "联系", icon: MessageCircle },
    { href: "/blog", label: "博客", icon: NotebookPen, isRoute: true },
  ],
  contact: {
    email: "wen_xuanlin@outlook.com",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/hyonelin",
        icon: GitHubLogoIcon,
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/wen-xuanlin",
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
      location: "上海",
      title: "IT Support Technician",
      logoUrl: "/logos/tesla.png",
      start: "2022年4月",
      end: "至今",
      description:
        "负责核心产品的架构设计和开发，使用 React、TypeScript 和 Node.js 构建高性能的 Web 应用。优化了系统性能，提升了 50% 的页面加载速度。",
    },
    {
      company: "Lucky Joint Construction Pte. Ltd. (Singapore)",
      href: "https://partea.com.sg/",
      badges: [],
      location: "Singapore",
      title: "Project Officer",
      logoUrl: "/logos/partea.jpeg",
      start: "2020年3月",
      end: "2020年7月",
      description:
        "参与电商平台的开发，实现了订单管理、支付集成等核心功能。使用 Python 和 Django 构建后端服务，处理日均百万级请求。",
    },
    {
      company: "Partea (Closed)",
      href: "https://partea.com.sg/",
      badges: [],
      location: "Singapore",
      title: "IT Operation ",
      logoUrl: "/logos/partea.jpeg",
      start: "2018年2月",
      end: "2020年3月",
      description:
        "参与电商平台的开发，实现了订单管理、支付集成等核心功能。使用 Python 和 Django 构建后端服务，处理日均百万级请求。",
    },
  ],
  education: [
    {
      school: "MDIS",
      href: "https://www.mdis.edu.sg/",
      degree: "计算机科学与技术 学士学位",
      logoUrl: "/logos/mdis.png",
      start: "2020年6月",
      end: "2021年6月",
    },{
      school: "BCA Academy",
      href: "https://www.bcaa.edu.sg/",
      degree: "计算机科学与技术 学士学位",
      logoUrl: "/logos/bcaa.png",
      start: "2015年3月",
      end: "2018年10月",
    },
  ],
  projects: [
    {
      title: "项目一",
      href: "https://project1.com",
      dates: "2024年1月 - 2024年3月",
      active: true,
      description:
        "一个基于 AI 的智能助手应用，帮助用户提高工作效率。集成了 OpenAI API，支持多种对话场景。",
      technologies: [
        "React",
        "TypeScript",
        "Node.js",
        "OpenAI",
        "TailwindCSS",
      ],
      links: [
        {
          type: "网站",
          href: "https://project1.com",
        },
        {
          type: "源码",
          href: "https://github.com/yourusername/project1",
        },
      ],
      image: "/projects/project-1/cover.png",
    },
    {
      title: "项目二",
      href: "https://project2.com",
      dates: "2023年6月 - 2023年12月",
      active: true,
      description:
        "一个开源的数据可视化工具，支持多种图表类型和数据源。被多家企业采用，GitHub 星标超过 1000。",
      technologies: [
        "Vue.js",
        "D3.js",
        "Python",
        "FastAPI",
        "PostgreSQL",
      ],
      links: [
        {
          type: "网站",
          href: "https://project2.com",
        },
        {
          type: "源码",
          href: "https://github.com/yourusername/project2",
        },
      ],
      image: "/projects/project-2/cover.png",
    },
    {
      title: "项目三",
      href: "https://project3.com",
      dates: "2023年1月 - 2023年5月",
      active: false,
      description:
        "一个移动端优先的电商应用，支持商品浏览、购物车、在线支付等功能。使用 React Native 开发，同时支持 iOS 和 Android。",
      technologies: [
        "React Native",
        "TypeScript",
        "Redux",
        "Stripe",
        "Firebase",
      ],
      links: [
        {
          type: "网站",
          href: "https://project3.com",
        },
      ],
      image: "/projects/project-3/cover.png",
    },
  ],
} as const
