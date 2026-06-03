import { contextBridge, ipcRenderer } from 'electron'
import type {
  DashboardData, Bookmark, DueItem, DueType, ImportantDate,
  FootballData, WorldCupData, WeatherData, ClashData,
} from '../shared/types'

contextBridge.exposeInMainWorld('api', {
  getDashboard: (): Promise<DashboardData> =>
    ipcRenderer.invoke('getDashboard'),
  addBookmark: (icon: string, label: string, url: string): Promise<Bookmark> =>
    ipcRenderer.invoke('addBookmark', icon, label, url),
  updateBookmark: (id: number, icon: string, label: string, url: string): Promise<void> =>
    ipcRenderer.invoke('updateBookmark', id, icon, label, url),
  deleteBookmark: (id: number): Promise<void> =>
    ipcRenderer.invoke('deleteBookmark', id),
  addDueItem: (name: string, course: string, type: DueType, dueAt: string): Promise<DueItem> =>
    ipcRenderer.invoke('addDueItem', name, course, type, dueAt),
  updateDueItem: (id: number, name: string, course: string, type: DueType, dueAt: string): Promise<DueItem> =>
    ipcRenderer.invoke('updateDueItem', id, name, course, type, dueAt),
  deleteDueItem: (id: number): Promise<void> =>
    ipcRenderer.invoke('deleteDueItem', id),
  addImportantDate: (label: string, date: string): Promise<ImportantDate> =>
    ipcRenderer.invoke('addImportantDate', label, date),
  updateImportantDate: (id: number, label: string, date: string): Promise<ImportantDate> =>
    ipcRenderer.invoke('updateImportantDate', id, label, date),
  deleteImportantDate: (id: number): Promise<void> =>
    ipcRenderer.invoke('deleteImportantDate', id),
  refreshFootball: (): Promise<{ football: FootballData; worldCup: WorldCupData | null }> =>
    ipcRenderer.invoke('refreshFootball'),
  refreshAmbient: (): Promise<{ weather: WeatherData | null; clash: ClashData | null }> =>
    ipcRenderer.invoke('refreshAmbient'),
})
