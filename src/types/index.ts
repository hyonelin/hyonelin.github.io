export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  markdown: string;
  tags: string[];
}

export interface ContactLink {
  name: string;
  url: string;
  icon: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
}
