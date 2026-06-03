import { cacheGet, cacheGetStale, cacheSet } from '../cache'
import type { ClashData } from '../../shared/types'

const CACHE_KEY = 'clash:player'
const TTL = 5 * 60_000
const API_BASE = 'https://api.clashroyale.com/v1'

function leagueName(n: number | undefined): string {
  if (!n || n < 1) return 'Unranked'
  return `League ${n}`
}

// The seasonal arena lives under a month-suffixed key (e.g.
// "seasonal-trophy-road-202606"), so match it by prefix. Returns both the
// arena name and that arena's current trophy count.
function seasonalArena(
  progress: Record<string, { arena?: { name: string }; trophies?: number }> | undefined,
): { name: string | null; trophies: number | null } {
  for (const [key, val] of Object.entries(progress ?? {})) {
    if (key.startsWith('seasonal-trophy-road')) {
      return { name: val.arena?.name ?? null, trophies: val.trophies ?? null }
    }
  }
  return { name: null, trophies: null }
}

export async function getPlayerData(force = false): Promise<ClashData | null> {
  const apiKey = process.env.CR_API_KEY
  const tag = process.env.CR_PLAYER_TAG
  if (!apiKey || !tag) return null

  if (!force) {
    const cached = cacheGet<ClashData>(CACHE_KEY)
    if (cached) return cached
  }

  try {
    const res = await fetch(`${API_BASE}/players/${encodeURIComponent(tag)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8_000),
    })

    if (!res.ok) return cacheGetStale<ClashData>(CACHE_KEY)

    const json = await res.json() as {
      name: string
      trophies: number
      wins: number
      battleCount: number
      currentDeck: Array<{ name: string }>
      currentPathOfLegendSeasonResult?: {
        leagueNumber: number
        trophies: number
        rank: number | null
      }
      progress?: Record<string, { arena?: { name: string }; trophies?: number }>
    }

    const pol = json.currentPathOfLegendSeasonResult
    const sa = seasonalArena(json.progress)

    const data: ClashData = {
      name: json.name,
      league: leagueName(pol?.leagueNumber),
      globalRank: pol?.rank ?? null,
      trophies: json.trophies ?? 0,
      seasonalArena: sa.name,
      seasonalTrophies: sa.trophies,
      winRate: json.battleCount > 0 ? Math.round((json.wins / json.battleCount) * 100) : 0,
      currentDeck: (json.currentDeck ?? []).map((c) => c.name),
    }

    cacheSet(CACHE_KEY, data, TTL)
    return data
  } catch {
    return cacheGetStale<ClashData>(CACHE_KEY)
  }
}
