export type DueType = 'assignment' | 'exam' | 'project'

export interface DueItem {
  id: number
  name: string
  course: string
  type: DueType
  dueAt: string    // ISO timestamp
  when: string     // derived relative label, e.g. "in 6 hrs"
  color: string    // derived urgency color
}

export interface TableRow {
  pos: number
  club: string
  crest: string       // club badge image URL ('' if none)
  p: number
  won: number
  draw: number
  lost: number
  gd: number
  pts: number
  top4: boolean
  isMyTeam: boolean   // Manchester United → starred
}

export interface Fixture {
  id: number
  utcDate: string
  home: string
  away: string
  involvesMyTeam: boolean
}

export interface FootballData {
  table: TableRow[]      // full Premier League table
  fixtures: Fixture[]    // upcoming PL games within 7 days
}

// ── World Cup ──────────────────────────────────────────────
export interface WCGroupRow {
  pos: number
  team: string
  crest: string   // flag/crest image URL ('' if none)
  played: number
  won: number
  draw: number
  lost: number
  gd: number
  pts: number
}

export interface WCGroup {
  name: string           // "Group A"
  rows: WCGroupRow[]
}

export interface WCFixture {
  id: number
  utcDate: string
  home: string
  away: string
  group: string | null   // "Group A", or null for knockout rounds
  stage: string
  status: string
  homeScore: number | null
  awayScore: number | null
}

export interface WCScorer {
  name: string
  team: string
  goals: number
}

export interface WorldCupData {
  groups: WCGroup[]
  fixtures: WCFixture[]   // upcoming (group + knockout), soonest first
  knockout: WCFixture[]   // all knockout matches, ordered R32 → Final (for the bracket)
  scorers: WCScorer[]
}

export interface ImportantDate {
  id: number
  label: string
  date: string   // 'YYYY-MM-DD'
}

export interface Bookmark {
  id: number
  icon: string
  label: string
  url: string
}

export interface ClashData {
  name: string
  league: string                  // ranked (Path of Legends) league, e.g. "League 3"
  globalRank: number | null        // global ladder rank — only set at Ultimate Champion
  trophies: number                 // trophy road trophies (top-level)
  seasonalArena: string | null     // e.g. "Seasonal Arena I"
  seasonalTrophies: number | null  // trophies within the current seasonal arena
  winRate: number
  currentDeck: string[]
}

export interface WeatherHour {
  time: string     // e.g. "3 PM"
  temp: number
  label: string
  icon: string     // tabler icon class
  precip: number   // precipitation probability %
}

export interface WeatherData {
  temp: number
  apparentTemp: number
  label: string
  icon: string
  humidity: number
  windSpeed: number
  hourly: WeatherHour[]   // remaining hours of today
}

export interface DashboardData {
  due: DueItem[]
  importantDates: ImportantDate[]
  football: FootballData
  worldCup: WorldCupData | null
  clash: ClashData | null
  weather: WeatherData | null
}
