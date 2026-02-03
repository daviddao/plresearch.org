import publicationsData from '@/data/generated/publications.json'
import authorsData from '@/data/generated/authors.json'
import talksData from '@/data/generated/talks.json'
import tutorialsData from '@/data/generated/tutorials.json'
import blogData from '@/data/generated/blog.json'
import areasData from '@/data/generated/areas.json'
import sectionsData from '@/data/generated/sections.json'

export type Publication = {
  slug: string
  title: string
  date: string
  authors: string[]
  venue: string
  doi: string
  publication_types: string[]
  areas: string[]
  abstract: string
  url_pdf: string
  url_source: string
  html: string
}

export type Author = {
  slug: string
  name: string
  role: string
  groups: string[]
  user_groups: string[]
  interests: string[]
  quote: string
  social: { icon?: string; link?: string }[]
  education: { courses?: { course?: string; institution?: string; year?: number }[] } | null
  avatarPath: string | null
  html: string
}

export type Talk = {
  slug: string
  title: string
  date: string
  venue: string
  venue_url: string
  venue_location: string
  authors: string[]
  areas: string[]
  abstract: string
  html: string
}

export type Tutorial = {
  slug: string
  title: string
  date: string
  summary: string
  html: string
}

export type BlogPost = {
  slug: string
  title: string
  date: string
  summary: string
  authors: string[]
  html: string
}

export type Area = {
  slug: string
  title: string
  date: string
  summary: string
  leads: string[]
  html: string
}

export type Section = {
  title: string
  html: string
}

export const publications = publicationsData as Publication[]
export const authors = authorsData as Author[]
export const talks = talksData as Talk[]
export const tutorials = tutorialsData as Tutorial[]
export const blogPosts = blogData as BlogPost[]
export const areas = areasData as Area[]
export const sections = sectionsData as Record<string, Section>
