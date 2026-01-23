import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'content')
const OUT_DIR = path.join(ROOT, 'src', 'data', 'generated')
const PUBLIC_DIR = path.join(ROOT, 'public')

const processor = remark().use(remarkHtml, { sanitize: false })

function renderMd(md) {
  if (!md || !md.trim()) return ''
  return processor.processSync(md).toString()
}

function readDir(dir) {
  const fullPath = path.join(CONTENT_DIR, dir)
  if (!fs.existsSync(fullPath)) return []
  const entries = fs.readdirSync(fullPath, { withFileTypes: true })
  const items = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const candidates = [
        path.join(fullPath, entry.name, 'index.md'),
        path.join(fullPath, entry.name, '_index.md'),
      ]
      const filePath = candidates.find((f) => fs.existsSync(f))
      if (filePath) {
        const raw = fs.readFileSync(filePath, 'utf-8')
        const { data, content } = matter(raw)
        items.push({ slug: entry.name, ...data, content: content.trim() })
      }
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_index')) {
      const raw = fs.readFileSync(path.join(fullPath, entry.name), 'utf-8')
      const { data, content } = matter(raw)
      const slug = entry.name.replace(/\.md$/, '')
      items.push({ slug, ...data, content: content.trim() })
    }
  }
  return items
}

function readSectionIndex(dir) {
  const indexPath = path.join(CONTENT_DIR, dir, '_index.md')
  if (!fs.existsSync(indexPath)) return null
  const raw = fs.readFileSync(indexPath, 'utf-8')
  const { data, content } = matter(raw)
  return { ...data, content: content.trim() }
}

// Publications
function buildPublications() {
  const items = readDir('publications')
    .filter((p) => !p.unaffiliated)
    .map((p) => ({
      slug: p.slug,
      title: p.title || '',
      date: p.date || '',
      authors: p.authors || [],
      venue: p.venue || '',
      doi: p.doi || '',
      publication_types: p.publication_types || [],
      areas: p.areas || [],
      abstract: p.abstract || '',
      url_pdf: p.url_pdf || '',
      url_source: p.url_source || '',
      html: renderMd(p.content),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return items
}

// Authors
function buildAuthors() {
  const items = readDir('authors').map((a) => {
    const avatarDir = path.join(PUBLIC_DIR, 'images', 'authors', a.slug)
    let avatarPath = null
    if (fs.existsSync(avatarDir)) {
      const files = fs.readdirSync(avatarDir)
      const avatar = files.find((f) => f.startsWith('avatar'))
      if (avatar) avatarPath = `/images/authors/${a.slug}/${avatar}`
    }
    return {
      slug: a.slug,
      name: a.name || '',
      role: a.role || '',
      groups: a.groups || [],
      user_groups: a.user_groups || [],
      interests: a.interests || [],
      quote: a.quote || '',
      social: a.social || [],
      education: a.education || null,
      avatarPath,
      html: renderMd(a.content),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
  return items
}

// Talks
function buildTalks() {
  const items = readDir('talks').map((t) => ({
    slug: t.slug,
    title: t.title || '',
    date: t.date || '',
    venue: t.venue || '',
    venue_url: t.venue_url || '',
    venue_location: t.venue_location || '',
    authors: t.authors || [],
    areas: t.areas || [],
    abstract: t.abstract || '',
    html: renderMd(t.content),
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return items
}

// Tutorials (top-level only)
function buildTutorials() {
  const items = readDir('tutorials').map((t) => ({
    slug: t.slug,
    title: t.title || '',
    date: t.date || '',
    summary: t.summary || '',
    html: renderMd(t.content),
  }))
  return items
}

// Outreach
function buildOutreach() {
  const items = readDir('outreach').map((o) => ({
    slug: o.slug,
    title: o.title || '',
    weight: o.weight || 0,
    linkText: o.linkText || '',
    linkUrl: o.linkUrl || '',
    html: renderMd(o.content),
  })).sort((a, b) => (a.weight || 0) - (b.weight || 0))
  return items
}

// Areas
function buildAreas() {
  const items = readDir('areas').map((a) => ({
    slug: a.slug,
    title: a.title || '',
    date: a.date || '',
    archived: a.archived || false,
    summary: a.summary || '',
    html: renderMd(a.content),
  }))
  return items
}

// Section indexes
function buildSections() {
  const sections = {}
  for (const dir of ['research', 'contact', 'outreach']) {
    const idx = readSectionIndex(dir)
    if (idx) {
      sections[dir] = { title: idx.title || '', html: renderMd(idx.content) }
    }
  }
  return sections
}

// Feed XML
function buildFeed(publications, talks) {
  const baseUrl = 'https://research.protocol.ai'
  const items = [
    ...publications.slice(0, 20).map((p) => ({
      title: p.title,
      link: `${baseUrl}/publications/${p.slug}/`,
      date: p.date,
      description: (p.abstract || '').slice(0, 300),
    })),
    ...talks.slice(0, 10).map((t) => ({
      title: t.title,
      link: `${baseUrl}/talks/${t.slug}/`,
      date: t.date,
      description: (t.abstract || '').slice(0, 300),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50)

  const rssItems = items.map((item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <pubDate>${item.date ? new Date(item.date).toUTCString() : ''}</pubDate>
      <description><![CDATA[${item.description}]]></description>
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Protocol Labs R&D</title>
    <link>${baseUrl}</link>
    <description>Driving Breakthroughs in Computing to Push Humanity Forward.</description>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`
}

// Search index
function buildSearchIndex(publications, talks) {
  const items = [
    ...publications.map((p) => ({
      title: p.title,
      summary: (p.abstract || '').slice(0, 500),
      date: p.date,
      type: 'publication',
      relpermalink: `/publications/${p.slug}/`,
      authors: p.authors,
    })),
    ...talks.map((t) => ({
      title: t.title,
      summary: (t.abstract || '').slice(0, 500),
      date: t.date,
      type: 'talk',
      relpermalink: `/talks/${t.slug}/`,
      authors: t.authors,
    })),
  ]
  return items
}

// Main
console.log('Building content...')

const publications = buildPublications()
const authors = buildAuthors()
const talks = buildTalks()
const tutorials = buildTutorials()
const outreach = buildOutreach()
const areas = buildAreas()
const sections = buildSections()

fs.mkdirSync(OUT_DIR, { recursive: true })

fs.writeFileSync(path.join(OUT_DIR, 'publications.json'), JSON.stringify(publications))
fs.writeFileSync(path.join(OUT_DIR, 'authors.json'), JSON.stringify(authors))
fs.writeFileSync(path.join(OUT_DIR, 'talks.json'), JSON.stringify(talks))
fs.writeFileSync(path.join(OUT_DIR, 'tutorials.json'), JSON.stringify(tutorials))
fs.writeFileSync(path.join(OUT_DIR, 'outreach.json'), JSON.stringify(outreach))
fs.writeFileSync(path.join(OUT_DIR, 'areas.json'), JSON.stringify(areas))
fs.writeFileSync(path.join(OUT_DIR, 'sections.json'), JSON.stringify(sections))

// Static files
fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.xml'), buildFeed(publications, talks))
fs.writeFileSync(path.join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(buildSearchIndex(publications, talks)))

console.log(`  ${publications.length} publications`)
console.log(`  ${authors.length} authors`)
console.log(`  ${talks.length} talks`)
console.log(`  ${tutorials.length} tutorials`)
console.log(`  ${outreach.length} outreach`)
console.log(`  ${areas.length} areas`)
console.log('Done.')
