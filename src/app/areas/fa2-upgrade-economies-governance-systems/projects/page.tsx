import type { Metadata } from 'next'
import projectsData from '@/data/fa2/projects.json'
import ProjectsExplorer from './ProjectsExplorer'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore teams building sovereign DPI, DeSci, DePIN, public goods funding, and decentralized governance.',
}

export default function ProjectsPage() {
  return <ProjectsExplorer projects={projectsData} />
}
