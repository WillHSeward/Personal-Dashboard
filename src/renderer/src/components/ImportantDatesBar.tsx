import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ImportantDate } from '../../../shared/types'

interface Props {
  dates: ImportantDate[]
  onAdd(d: ImportantDate): void
  onUpdate(d: ImportantDate): void
  onDelete(id: number): void
}

// Parse a 'YYYY-MM-DD' string as a LOCAL date (avoids UTC off-by-one).
function parseLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = parseLocal(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

function countdownText(days: number): string {
  if (days < 0) return 'passed'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `in ${days} days`
  if (days < 14) return 'in 1 week'
  if (days < 30) return `in ${Math.round(days / 7)} weeks`
  return `in ${Math.round(days / 30)} mo`
}

function countColor(days: number): string {
  if (days < 0) return 'var(--faint)'
  if (days <= 1) return 'var(--accent-hot)'
  if (days <= 7) return 'var(--accent-warm)'
  return 'var(--muted)'
}

export default function ImportantDatesBar({ dates, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<ImportantDate | null>(null)
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')

  // Soonest upcoming first; past events sink to the end.
  const sorted = [...dates].sort((a, b) => {
    const da = daysUntil(a.date)
    const db = daysUntil(b.date)
    const pa = da < 0
    const pb = db < 0
    if (pa !== pb) return pa ? 1 : -1
    return da - db
  })

  function openAdd() {
    setEditing(null)
    setLabel('')
    setDate('')
    setAdding(true)
  }

  function openEdit(d: ImportantDate) {
    setAdding(false)
    setEditing(d)
    setLabel(d.label)
    setDate(d.date)
  }

  function close() {
    setAdding(false)
    setEditing(null)
    setLabel('')
    setDate('')
  }

  async function save() {
    const l = label.trim()
    if (!l || !date) return
    if (editing) {
      const updated = await window.api.updateImportantDate(editing.id, l, date)
      onUpdate(updated)
    } else {
      const created = await window.api.addImportantDate(l, date)
      onAdd(created)
    }
    close()
  }

  async function remove() {
    if (!editing) return
    await window.api.deleteImportantDate(editing.id)
    onDelete(editing.id)
    close()
  }

  const showForm = adding || editing !== null

  return (
    <motion.section
      className="dates-bar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.09, ease: [0.2, 0.7, 0.3, 1] }}
    >
      <div className="dates-list">
        {sorted.map((d) => {
          const days = daysUntil(d.date)
          return (
            <button
              key={d.id}
              className="date-chip"
              onClick={() => openEdit(d)}
              style={{ opacity: days < 0 ? 0.55 : 1 }}
            >
              <span className="date-chip-label">{d.label}</span>
              <span className="date-chip-count" style={{ color: countColor(days) }}>
                {countdownText(days)}
              </span>
            </button>
          )
        })}
        <button className="date-add" onClick={openAdd}>
          <i className="ti ti-plus" aria-hidden="true" />
          {dates.length === 0 && <span>Add an important date</span>}
        </button>
      </div>

      {showForm && (
        <div className="dates-form">
          <input
            className="bm-input date-label-input"
            placeholder="What is it? (e.g. Mom's birthday)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save() }}
            autoFocus
          />
          <input
            className="bm-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="bm-save-btn" onClick={save}>{editing ? 'Save' : 'Add'}</button>
          <button className="bm-cancel-btn" onClick={close}>Cancel</button>
          {editing && <button className="dates-del-btn" onClick={remove}>Delete</button>}
        </div>
      )}
    </motion.section>
  )
}
