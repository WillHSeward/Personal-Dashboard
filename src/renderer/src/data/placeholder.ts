// Placeholder data — exact same values as dashboard.html.
// Step 2 replaces this with a live call to getDashboard() via the local API.

export interface DueItem {
  name: string
  course: string
  when: string
  color: string
}

export interface TableRow {
  pos: number
  club: string
  p: number
  pts: number
  top4: boolean
}

export interface Bookmark {
  icon: string
  label: string
  url: string
}

export interface DashboardData {
  due: DueItem[]
  table: TableRow[]
  trophies: number
  deck: string[]
  bookmarks: Bookmark[]
}

export const placeholderData: DashboardData = {
  due: [
    { name: 'SE-433 — Lab 7 writeup', course: 'Software Testing & QA', when: 'in 6 hrs', color: 'var(--accent-hot)' },
    { name: 'Reading response 4', course: 'Ethics in Computing', when: 'Tomorrow', color: 'var(--accent-warm)' },
    { name: 'Project milestone 2', course: 'SE-433', when: 'Fri', color: '#56544c' },
  ],
  table: [
    { pos: 1, club: 'Arsenal',      p: 37, pts: 86, top4: true },
    { pos: 2, club: 'Man City',     p: 37, pts: 83, top4: true },
    { pos: 3, club: 'Liverpool',    p: 37, pts: 79, top4: true },
    { pos: 4, club: 'Aston Villa',  p: 37, pts: 68, top4: false },
  ],
  trophies: 7214,
  deck: ['Hog Rider', 'Fireball', 'Musketeer', '+5'],
  bookmarks: [
    { icon: 'ti-brand-github', label: 'dashboard repo — issues',        url: '#' },
    { icon: 'ti-file-text',    label: 'CFG study packet',                url: '#' },
    { icon: 'ti-book',         label: 'FastAPI docs — background tasks', url: '#' },
    { icon: 'ti-ball-football',label: 'World Cup 2026 schedule',         url: '#' },
  ],
}
