import { createRequire } from 'module'
import { join } from 'path'
import { app } from 'electron'
import type DatabaseType from 'better-sqlite3'
import type { Bookmark, DueItem, DueType, ImportantDate } from '../shared/types'

// better-sqlite3 is a native module: it dynamically requires a compiled
// `.node` binary, which a bundler cannot inline. Loading it through a
// createRequire'd reference (rather than a static `import`) keeps it a real
// runtime require resolved from node_modules, so the binary loads correctly.
const nodeRequire = createRequire(__filename)
const Database: typeof DatabaseType = nodeRequire('better-sqlite3')

let _db: Database.Database | null = null

function db(): Database.Database {
  if (!_db) {
    const dbPath = join(app.getPath('userData'), 'dashboard.db')
    _db = new Database(dbPath)
    _db.pragma('journal_mode = WAL')
    migrate(_db)
  }
  return _db
}

function migrate(d: Database.Database): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      icon  TEXT NOT NULL,
      label TEXT NOT NULL,
      url   TEXT NOT NULL,
      sort  INTEGER NOT NULL DEFAULT 0
    )
  `)

  d.exec(`
    CREATE TABLE IF NOT EXISTS due_items (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT NOT NULL,
      course  TEXT NOT NULL DEFAULT '',
      type    TEXT NOT NULL DEFAULT 'assignment',
      due_at  TEXT NOT NULL
    )
  `)

  d.exec(`
    CREATE TABLE IF NOT EXISTS important_dates (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      date  TEXT NOT NULL
    )
  `)

  const count = (d.prepare('SELECT COUNT(*) as n FROM bookmarks').get() as { n: number }).n
  if (count === 0) {
    const insert = d.prepare('INSERT INTO bookmarks (icon, label, url, sort) VALUES (?, ?, ?, ?)')
    const seed = d.transaction(() => {
      insert.run('ti-brand-github',  'dashboard repo — issues',        '#', 1)
      insert.run('ti-file-text',     'CFG study packet',                '#', 2)
      insert.run('ti-book',          'FastAPI docs — background tasks', '#', 3)
      insert.run('ti-ball-football', 'World Cup 2026 schedule',         '#', 4)
    })
    seed()
  }
}

export function getBookmarks(): Bookmark[] {
  return db()
    .prepare('SELECT id, icon, label, url FROM bookmarks ORDER BY sort, id')
    .all() as Bookmark[]
}

export function addBookmark(icon: string, label: string, url: string): Bookmark {
  const d = db()
  const maxSort = (d.prepare('SELECT COALESCE(MAX(sort), 0) as m FROM bookmarks').get() as { m: number }).m
  const result = d
    .prepare('INSERT INTO bookmarks (icon, label, url, sort) VALUES (?, ?, ?, ?)')
    .run(icon, label, url, maxSort + 1)
  return { id: result.lastInsertRowid as number, icon, label, url }
}

export function updateBookmark(id: number, icon: string, label: string, url: string): void {
  db().prepare('UPDATE bookmarks SET icon=?, label=?, url=? WHERE id=?').run(icon, label, url, id)
}

export function deleteBookmark(id: number): void {
  db().prepare('DELETE FROM bookmarks WHERE id=?').run(id)
}

// ── Due items ──────────────────────────────────────────────────────────────

interface DueRow {
  id: number
  name: string
  course: string
  type: DueType
  due_at: string
}

// Derives the relative-time label and urgency colour from a due date.
function formatWhen(dueAt: string): { when: string; color: string } {
  const due = new Date(dueAt)
  const now = new Date()
  const ms = due.getTime() - now.getTime()
  const hrs = ms / 3_600_000

  if (ms < 0) return { when: 'overdue', color: 'var(--accent-hot)' }
  if (hrs <= 12) {
    const h = Math.max(1, Math.round(hrs))
    return { when: `in ${h} hr${h === 1 ? '' : 's'}`, color: 'var(--accent-hot)' }
  }

  const endToday = new Date(now)
  endToday.setHours(23, 59, 59, 999)
  const endTomorrow = new Date(endToday)
  endTomorrow.setDate(endTomorrow.getDate() + 1)

  if (due <= endTomorrow) return { when: 'Tomorrow', color: 'var(--accent-warm)' }
  if (hrs < 7 * 24) return { when: due.toLocaleDateString('en-US', { weekday: 'short' }), color: '#56544c' }
  return { when: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: '#56544c' }
}

function toDueItem(row: DueRow): DueItem {
  const { when, color } = formatWhen(row.due_at)
  return { id: row.id, name: row.name, course: row.course, type: row.type, dueAt: row.due_at, when, color }
}

export function getDueItems(): DueItem[] {
  const rows = db()
    .prepare('SELECT id, name, course, type, due_at FROM due_items ORDER BY due_at')
    .all() as DueRow[]
  return rows.map(toDueItem)
}

export function addDueItem(name: string, course: string, type: DueType, dueAt: string): DueItem {
  const result = db()
    .prepare('INSERT INTO due_items (name, course, type, due_at) VALUES (?, ?, ?, ?)')
    .run(name, course, type, dueAt)
  return toDueItem({ id: result.lastInsertRowid as number, name, course, type, due_at: dueAt })
}

export function updateDueItem(id: number, name: string, course: string, type: DueType, dueAt: string): DueItem {
  db()
    .prepare('UPDATE due_items SET name=?, course=?, type=?, due_at=? WHERE id=?')
    .run(name, course, type, dueAt, id)
  return toDueItem({ id, name, course, type, due_at: dueAt })
}

export function deleteDueItem(id: number): void {
  db().prepare('DELETE FROM due_items WHERE id=?').run(id)
}

// ── Important dates ────────────────────────────────────────────────────────

export function getImportantDates(): ImportantDate[] {
  return db()
    .prepare('SELECT id, label, date FROM important_dates ORDER BY date')
    .all() as ImportantDate[]
}

export function addImportantDate(label: string, date: string): ImportantDate {
  const result = db()
    .prepare('INSERT INTO important_dates (label, date) VALUES (?, ?)')
    .run(label, date)
  return { id: result.lastInsertRowid as number, label, date }
}

export function updateImportantDate(id: number, label: string, date: string): ImportantDate {
  db().prepare('UPDATE important_dates SET label=?, date=? WHERE id=?').run(label, date, id)
  return { id, label, date }
}

export function deleteImportantDate(id: number): void {
  db().prepare('DELETE FROM important_dates WHERE id=?').run(id)
}
