import { sovereignDpiConfig } from './sovereign-dpi'
import { publicGoodsFundingConfig } from './public-goods-funding'
import { governanceDemocracyConfig } from './governance-democracy'
import { climateInfrastructureConfig } from './climate-infrastructure'
import type { IPConfig } from '../DependencyGraph'

export const expandedConfigs: Record<string, IPConfig> = {
  'sovereign-dpi': sovereignDpiConfig,
  'public-goods-funding': publicGoodsFundingConfig,
  'governance-democracy': governanceDemocracyConfig,
  'climate-infrastructure': climateInfrastructureConfig,
}
