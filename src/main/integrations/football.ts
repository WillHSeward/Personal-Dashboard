import { cacheGet, cacheGetStale, cacheSet } from '../cache'
import type {
  FootballData, TableRow, Fixture,
  WorldCupData, WCGroup, WCFixture, WCScorer,
} from '../../shared/types'

const TTL = 10 * 60_000   // 10 min — comfortably under the 10 req/min free limit
const API_BASE = 'https://api.football-data.org/v4'
const MY_TEAM = 'Manchester United FC'   // football-data.org's full club name

const ymd = (d: Date) => d.toISOString().slice(0, 10)
const prettyGroup = (g: string) => g.replace('GROUP_', 'Group ')

async function fetchJson<T>(path: string, key: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Auth-Token': key },
    signal: AbortSignal.timeout(8_000),
  })
  if (!res.ok) throw new Error(`football-data ${res.status}`)
  return res.json() as Promise<T>
}

// ── Shared API response shapes ─────────────────────────────
interface TeamRef { id: number | null; name: string | null; shortName?: string; tla?: string; crest?: string }
interface StandingEntry {
  position: number
  team: TeamRef
  playedGames: number
  won: number
  draw: number
  lost: number
  goalDifference: number
  points: number
}
interface StandingsResp {
  standings: Array<{ type: string; group: string | null; table: StandingEntry[] }>
}
interface MatchesResp {
  matches: Array<{
    id: number
    utcDate: string
    status: string
    stage: string
    group: string | null
    homeTeam: TeamRef
    awayTeam: TeamRef
    score: { fullTime: { home: number | null; away: number | null } }
  }>
}
interface ScorersResp {
  scorers: Array<{ player: { name: string }; team: TeamRef; goals: number }>
}

const teamName = (t: TeamRef) => t.shortName || t.tla || t.name || 'TBD'

type WCMatch = MatchesResp['matches'][number]
const STAGE_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']

function toWCFixture(m: WCMatch): WCFixture {
  return {
    id: m.id,
    utcDate: m.utcDate,
    home: m.homeTeam.name ?? 'TBD',
    away: m.awayTeam.name ?? 'TBD',
    group: m.group ? prettyGroup(m.group) : null,
    stage: m.stage,
    status: m.status,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
  }
}

// ── Premier League ─────────────────────────────────────────
export async function getFootball(force = false): Promise<FootballData> {
  const key = process.env.FOOTBALL_API_KEY
  if (!key) return { table: [], fixtures: [] }

  if (!force) {
    const cached = cacheGet<FootballData>('fb:pl')
    if (cached) return cached
  }

  try {
    const now = new Date()
    const in7 = new Date(now.getTime() + 7 * 86_400_000)

    const [standings, matches] = await Promise.all([
      fetchJson<StandingsResp>('/competitions/PL/standings', key),
      fetchJson<MatchesResp>(`/competitions/PL/matches?dateFrom=${ymd(now)}&dateTo=${ymd(in7)}`, key),
    ])

    const total = standings.standings.find((s) => s.type === 'TOTAL')
    const table: TableRow[] = (total?.table ?? []).map((e) => ({
      pos: e.position,
      club: teamName(e.team),
      crest: e.team.crest ?? '',
      p: e.playedGames,
      won: e.won,
      draw: e.draw,
      lost: e.lost,
      gd: e.goalDifference,
      pts: e.points,
      top4: e.position <= 4,
      isMyTeam: e.team.name === MY_TEAM,
    }))

    const fixtures: Fixture[] = matches.matches
      .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
      .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
      .map((m) => ({
        id: m.id,
        utcDate: m.utcDate,
        home: teamName(m.homeTeam),
        away: teamName(m.awayTeam),
        involvesMyTeam: m.homeTeam.name === MY_TEAM || m.awayTeam.name === MY_TEAM,
      }))

    const data: FootballData = { table, fixtures }
    cacheSet('fb:pl', data, TTL)
    return data
  } catch {
    return cacheGetStale<FootballData>('fb:pl') ?? { table: [], fixtures: [] }
  }
}

// ── World Cup ──────────────────────────────────────────────
export async function getWorldCup(force = false): Promise<WorldCupData | null> {
  const key = process.env.FOOTBALL_API_KEY
  if (!key) return null

  if (!force) {
    const cached = cacheGet<WorldCupData>('fb:wc')
    if (cached) return cached
  }

  // allSettled so a single failing endpoint (e.g. scorers) doesn't blank the panel.
  const [stRes, mRes, scRes] = await Promise.allSettled([
    fetchJson<StandingsResp>('/competitions/WC/standings', key),
    fetchJson<MatchesResp>('/competitions/WC/matches', key),
    fetchJson<ScorersResp>('/competitions/WC/scorers?limit=10', key),
  ])

  if (stRes.status === 'rejected' && mRes.status === 'rejected') {
    return cacheGetStale<WorldCupData>('fb:wc')
  }

  const groups: WCGroup[] =
    stRes.status === 'fulfilled'
      ? stRes.value.standings
          .filter((s) => s.type === 'TOTAL' && s.group)
          .map((s) => ({
            name: prettyGroup(s.group as string),
            rows: s.table.map((e) => ({
              pos: e.position,
              team: e.team.shortName || e.team.name || e.team.tla || 'TBD',
              crest: e.team.crest ?? '',
              played: e.playedGames,
              won: e.won,
              draw: e.draw,
              lost: e.lost,
              gd: e.goalDifference,
              pts: e.points,
            })),
          }))
      : []

  const allMatches = mRes.status === 'fulfilled' ? mRes.value.matches : []
  const nowMs = Date.now()

  const fixtures: WCFixture[] = allMatches
    .filter((m) => (m.status === 'SCHEDULED' || m.status === 'TIMED') && new Date(m.utcDate).getTime() >= nowMs)
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(0, 20)
    .map(toWCFixture)

  const knockout: WCFixture[] = allMatches
    .filter((m) => m.stage !== 'GROUP_STAGE')
    .map(toWCFixture)
    .sort((a, b) => {
      const d = STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      return d !== 0 ? d : a.utcDate.localeCompare(b.utcDate)
    })

  const scorers: WCScorer[] =
    scRes.status === 'fulfilled'
      ? scRes.value.scorers.map((s) => ({
          name: s.player.name,
          team: s.team.tla || s.team.name || '',
          goals: s.goals,
        }))
      : []

  const data: WorldCupData = { groups, fixtures, knockout, scorers }
  cacheSet('fb:wc', data, TTL)
  return data
}
