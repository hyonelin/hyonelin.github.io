import { Github, Linkedin, Mail, Twitter } from 'lucide-react'

export const DATA = {
  name: "Your Name",
  initials: "YN",
  url: "https://yoursite.com",
  location: "Your City, Country",
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
    { href: "#about", label: "关于" },
    { href: "#work", label: "经历" },
    { href: "#education", label: "教育" },
    { href: "#projects", label: "项目" },
    { href: "#contact", label: "联系" },
  ],
  contact: {
    email: "hello@example.com",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/yourusername",
        icon: Github,
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/yourusername",
        icon: Linkedin,
      },
      {
        name: "Twitter",
        url: "https://twitter.com/yourusername",
        icon: Twitter,
      },
      {
        name: "Email",
        url: "mailto:hello@example.com",
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
      logoUrl: "/logos/company.png",
      start: "2022年1月",
      end: "至今",
      description:
        "负责核心产品的架构设计和开发，使用 React、TypeScript 和 Node.js 构建高性能的 Web 应用。优化了系统性能，提升了 50% 的页面加载速度。",
    },
    {
      company: "另一家公司",
      href: "https://another-company.com",
      badges: [],
      location: "北京",
      title: "软件工程师",
      logoUrl: "/logos/another-company.png",
      start: "2020年6月",
      end: "2021年12月",
      description:
        "参与电商平台的开发，实现了订单管理、支付集成等核心功能。使用 Python 和 Django 构建后端服务，处理日均百万级请求。",
    },
    {
      company: "初创公司",
      href: "https://startup.com",
      badges: [],
      location: "上海",
      title: "初级开发工程师",
      logoUrl: "/logos/startup.png",
      start: "2019年7月",
      end: "2020年5月",
      description:
        "作为全栈开发工程师，参与了多个项目的开发。学习并应用了敏捷开发方法，提升了团队协作效率。",
    },
  ],
  education: [
    {
      school: "某知名大学",
      href: "https://university.edu",
      degree: "计算机科学与技术 学士学位",
      logoUrl: "/logos/university.png",
      start: "2015",
      end: "2019",
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
