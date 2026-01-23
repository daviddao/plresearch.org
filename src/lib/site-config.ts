export const siteConfig = {
  title: 'Protocol Labs R&D',
  description: 'Driving Breakthroughs in Computing to Push Humanity Forward.',
  baseUrl: 'https://research.protocol.ai',
  author: 'Protocol Labs R&D',
  locale: 'en_US',
  twitterUser: '@ProtoResearch',
  avatar: '/images/pl_research_card.png',
  logo: '/images/pl_research_logo.svg',
  copyright: '© Protocol Labs, Inc. Except as noted, content licensed CC-BY 3.0.',
}

export type NavItem = {
  name: string
  url: string
  children?: NavItem[]
}

export const mainNav: NavItem[] = [
  { name: 'About', url: '/about/' },
  {
    name: 'Focus Areas',
    url: '/areas/',
    children: [
      { name: 'Digital Human Rights', url: '/areas/digital-human-rights/' },
      { name: 'Economies & Governance', url: '/areas/upgrade-economies-governance/' },
      { name: 'AI & Robotics', url: '/areas/ai-robotics/' },
      { name: 'Neurotech', url: '/areas/neurotech/' },
    ],
  },
  {
    name: 'Research',
    url: '/research/',
    children: [
      { name: 'Talks', url: '/talks/' },
      { name: 'Publications', url: '/publications/' },
      { name: 'Tutorials', url: '/tutorials/' },
    ],
  },
  { name: 'Team', url: '/authors/' },
  { name: 'Blog', url: '/blog/' },
]

export const footerNav: NavItem[] = [
  { name: 'About', url: '/about/' },
  { name: 'Team', url: '/authors/' },
  { name: 'Research', url: '/research/' },
  { name: 'Blog', url: '/blog/' },
]
