import type {
  DashboardData, Bookmark, DueItem, DueType, ImportantDate,
  FootballData, WorldCupData, WeatherData, ClashData,
} from '../../../shared/types'

declare global {
  interface Window {
    api: {
      getDashboard(): Promise<DashboardData>
      addBookmark(icon: string, label: string, url: string): Promise<Bookmark>
      updateBookmark(id: number, icon: string, label: string, url: string): Promise<void>
      deleteBookmark(id: number): Promise<void>
      addDueItem(name: string, course: string, type: DueType, dueAt: string): Promise<DueItem>
      updateDueItem(id: number, name: string, course: string, type: DueType, dueAt: string): Promise<DueItem>
      deleteDueItem(id: number): Promise<void>
      addImportantDate(label: string, date: string): Promise<ImportantDate>
      updateImportantDate(id: number, label: string, date: string): Promise<ImportantDate>
      deleteImportantDate(id: number): Promise<void>
      refreshFootball(): Promise<{ football: FootballData; worldCup: WorldCupData | null }>
      refreshAmbient(): Promise<{ weather: WeatherData | null; clash: ClashData | null }>
    }
  }
}

export {}
