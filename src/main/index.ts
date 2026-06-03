import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { config as loadEnv } from 'dotenv'
import { join, resolve } from 'path'

// Load .env: from the bundled resources in a packaged build, from the project
// root in dev (out/main/ → ../../ → project root).
loadEnv({
  path: app.isPackaged
    ? join(process.resourcesPath, '.env')
    : resolve(__dirname, '../../.env'),
})
import type { DueType } from '../shared/types'
import { getDashboard } from './api'
import { getFootball, getWorldCup } from './integrations/football'
import { getPlayerData } from './integrations/clash'
import { getWeather } from './integrations/weather'
import {
  addBookmark, updateBookmark, deleteBookmark,
  addDueItem, updateDueItem, deleteDueItem,
  addImportantDate, updateImportantDate, deleteImportantDate,
} from './db'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 700,
    minHeight: 600,
    backgroundColor: '#0e0f13',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('getDashboard', () => getDashboard())
ipcMain.handle('addBookmark',    (_e, icon: string, label: string, url: string) => addBookmark(icon, label, url))
ipcMain.handle('updateBookmark', (_e, id: number, icon: string, label: string, url: string) => updateBookmark(id, icon, label, url))
ipcMain.handle('deleteBookmark', (_e, id: number) => deleteBookmark(id))
ipcMain.handle('addDueItem',    (_e, name: string, course: string, type: DueType, dueAt: string) => addDueItem(name, course, type, dueAt))
ipcMain.handle('updateDueItem', (_e, id: number, name: string, course: string, type: DueType, dueAt: string) => updateDueItem(id, name, course, type, dueAt))
ipcMain.handle('deleteDueItem', (_e, id: number) => deleteDueItem(id))
ipcMain.handle('addImportantDate',    (_e, label: string, date: string) => addImportantDate(label, date))
ipcMain.handle('updateImportantDate', (_e, id: number, label: string, date: string) => updateImportantDate(id, label, date))
ipcMain.handle('deleteImportantDate', (_e, id: number) => deleteImportantDate(id))

// Targeted refreshes (force-bypass the cache to fetch fresh data).
// Football is manual-only (button); ambient runs on a renderer timer.
ipcMain.handle('refreshFootball', async () => {
  const [football, worldCup] = await Promise.all([getFootball(true), getWorldCup(true)])
  return { football, worldCup }
})
ipcMain.handle('refreshAmbient', async () => {
  const [weather, clash] = await Promise.all([getWeather(true), getPlayerData(true)])
  return { weather, clash }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)   // remove the default File/Edit/View/Window/Help bar
  createWindow()
})

app.on('window-all-closed', () => app.quit())
