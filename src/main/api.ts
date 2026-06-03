import type { DashboardData } from '../shared/types'
import { getDueItems, getImportantDates } from './db'
import { getFootball, getWorldCup } from './integrations/football'
import { getPlayerData } from './integrations/clash'
import { getWeather } from './integrations/weather'

export async function getDashboard(): Promise<DashboardData> {
  const [football, worldCup, clash, weather] = await Promise.all([
    getFootball(),
    getWorldCup(),
    getPlayerData(),
    getWeather(),
  ])

  return { due: getDueItems(), importantDates: getImportantDates(), football, worldCup, clash, weather }
}
