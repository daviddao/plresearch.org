import { dependencyGraphs } from '@/lib/content'
import type { IPConfig } from '../DependencyGraph'

export const expandedConfigs: Record<string, IPConfig> = Object.fromEntries(
  Object.entries(dependencyGraphs).map(([slug, entry]) => [slug, entry.config as IPConfig])
)

export const allTooltips: Record<string, { title: string; body: string; context: string }> = Object.fromEntries(
  Object.entries(dependencyGraphs).flatMap(([, entry]) => Object.entries(entry.tooltips))
)
