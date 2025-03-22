import "server-only"

export type Dictionary = {
  name: string
  nativeName: string
  bio: string
  moreAboutMe: string
  myProjects: string
  myStack: string
  contact: string
  happyClients: string
  copyright: string
  licensing: string
  notFound: string
  viewAllProjects: string
  viewAllTools: string
  contactMe: string
  blog: string
  readMore: string
  noPosts: string
  backToBlog: string
}

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  "zh-CN": () => import("./dictionaries/zh-CN.json").then((module) => module.default),
  "zh-TW": () => import("./dictionaries/zh-TW.json").then((module) => module.default),
  ko: () => import("./dictionaries/ko.json").then((module) => module.default),
  ja: () => import("./dictionaries/ja.json").then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  return dictionaries[locale]?.() ?? dictionaries.en()
}

