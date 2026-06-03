import { useEffect, useState } from 'react'
import { useDashboard } from './hooks/useApi'
import Topbar from './components/Topbar'
import DueSoonPanel from './components/DueSoonPanel'
import FootballPanel from './components/FootballPanel'
import ClashPanel from './components/ClashPanel'
import WorldCupPanel from './components/WorldCupPanel'
import ImportantDatesBar from './components/ImportantDatesBar'
import type { DueItem, ImportantDate } from '../../shared/types'

// Weather + Clash quietly refresh on this interval; football is manual-only.
const AMBIENT_REFRESH_MS = 10 * 60_000

export default function App() {
  const { data, status, setData } = useDashboard()
  const [footballRefreshing, setFootballRefreshing] = useState(false)

  // Ambient auto-refresh: weather + Clash on a timer (cheap / unlimited APIs).
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const { weather, clash } = await window.api.refreshAmbient()
        setData((d) => d ? { ...d, weather, clash } : d)
      } catch { /* keep last-good data */ }
    }, AMBIENT_REFRESH_MS)
    return () => clearInterval(id)
  }, [setData])

  async function refreshFootball() {
    setFootballRefreshing(true)
    try {
      const { football, worldCup } = await window.api.refreshFootball()
      setData((d) => d ? { ...d, football, worldCup } : d)
    } catch { /* keep last-good data */ }
    finally { setFootballRefreshing(false) }
  }

  if (status === 'loading' || !data) {
    return <main className="wrap" />
  }

  if (status === 'error') {
    return (
      <main className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--accent-hot)' }}>Failed to load dashboard data.</p>
      </main>
    )
  }

  // Keep due items sorted by due date so a new/edited item lands in order.
  const sortDue = (items: DueItem[]) =>
    [...items].sort((a, b) => a.dueAt.localeCompare(b.dueAt))

  function handleDueAdd(item: DueItem) {
    setData((d) => d ? { ...d, due: sortDue([...d.due, item]) } : d)
  }

  function handleDueUpdate(item: DueItem) {
    setData((d) => d ? { ...d, due: sortDue(d.due.map((x) => x.id === item.id ? item : x)) } : d)
  }

  function handleDueDelete(id: number) {
    setData((d) => d ? { ...d, due: d.due.filter((x) => x.id !== id) } : d)
  }

  function handleDateAdd(item: ImportantDate) {
    setData((d) => d ? { ...d, importantDates: [...d.importantDates, item] } : d)
  }

  function handleDateUpdate(item: ImportantDate) {
    setData((d) => d ? { ...d, importantDates: d.importantDates.map((x) => x.id === item.id ? item : x) } : d)
  }

  function handleDateDelete(id: number) {
    setData((d) => d ? { ...d, importantDates: d.importantDates.filter((x) => x.id !== id) } : d)
  }

  return (
    <main className="wrap">
      <h1 className="sr-only">Personal dashboard</h1>
      <Topbar weather={data.weather} />
      <ImportantDatesBar
        dates={data.importantDates}
        onAdd={handleDateAdd}
        onUpdate={handleDateUpdate}
        onDelete={handleDateDelete}
      />
      <div className="grid">
        <DueSoonPanel
          due={data.due}
          onAdd={handleDueAdd}
          onUpdate={handleDueUpdate}
          onDelete={handleDueDelete}
        />
        <FootballPanel football={data.football} onRefresh={refreshFootball} refreshing={footballRefreshing} />
        <ClashPanel clash={data.clash} />
        <WorldCupPanel wc={data.worldCup} onRefresh={refreshFootball} refreshing={footballRefreshing} />
      </div>
    </main>
  )
}
