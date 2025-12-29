import type { PersonalInfo, ContactLink } from '../types';

export const personalInfo: PersonalInfo = {
  name: '',
  title: '全栈开发工程师',
  bio: '热爱技术，专注于 Web 开发和用户体验设计。在这里你可以了解我的项目和技术栈。',
  avatar: '/avatar.png',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Git'],
};

export const contactLinks: ContactLink[] = [
  { name: 'GitHub', url: 'https://github.com/hyonelin', icon: '🐙' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/wen_xuanlin', icon: '💼' },
  { name: 'Email', url: 'mailto:wen_xuanlin@outlook.com', icon: '📧' },
  { name: 'WeChat', url: '#', icon: '💬' },
];

export const personalPages: ContactLink[] = [
  { name: 'GitHub Pages', url: 'https://hyonelin.github.io', icon: '🌐' },
  //{ name: '个人博客', url: 'https://yourblog.com', icon: '📝' },
];
