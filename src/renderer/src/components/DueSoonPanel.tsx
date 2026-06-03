import { useState } from 'react'
import PanelShell from './PanelShell'
import type { DueItem, DueType } from '../../../shared/types'

interface Props {
  due: DueItem[]
  onAdd(item: DueItem): void
  onUpdate(item: DueItem): void
  onDelete(id: number): void
}

interface FormState {
  name: string
  course: string
  type: DueType
  dueAt: string   // datetime-local value: "YYYY-MM-DDTHH:mm"
}

const empty: FormState = { name: '', course: '', type: 'assignment', dueAt: '' }
const TYPE_LABEL: Record<DueType, string> = { assignment: 'Assignment', exam: 'Exam', project: 'Project' }

// ISO string → datetime-local value (local time, no seconds/zone)
function isoToLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function DueSoonPanel({ due, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<DueItem | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<FormState>(empty)

  function openAdd() {
    setEditing(null)
    setForm(empty)
    setAdding(true)
  }

  function openEdit(item: DueItem) {
    setAdding(false)
    setForm({ name: item.name, course: item.course, type: item.type, dueAt: isoToLocalInput(item.dueAt) })
    setEditing(item)
  }

  function closeForm() {
    setAdding(false)
    setEditing(null)
    setForm(empty)
  }

  async function handleSave() {
    const name = form.name.trim()
    if (!name || !form.dueAt) return
    const course = form.course.trim()
    const dueAt = new Date(form.dueAt).toISOString()

    if (editing) {
      const updated = await window.api.updateDueItem(editing.id, name, course, form.type, dueAt)
      onUpdate(updated)
    } else {
      const created = await window.api.addDueItem(name, course, form.type, dueAt)
      onAdd(created)
    }
    closeForm()
  }

  async function handleDelete(id: number) {
    await window.api.deleteDueItem(id)
    onDelete(id)
  }

  const showForm = adding || editing !== null

  return (
    <PanelShell
      title="Due soon"
      icon="ti-school"
      iconColor="var(--accent-warm)"
      delay={0.12}
      headerAction={
        <button className="bm-add-btn" onClick={openAdd} aria-label="Add due date">
          <i className="ti ti-plus" />
        </button>
      }
    >
      <div className="duelist">
        {due.length === 0 && !showForm ? (
          <div style={{ color: 'var(--faint)', fontSize: 13 }}>Nothing due — click + to add an assignment, exam, or project</div>
        ) : (
          due.map((item) => (
            <div key={item.id} className="due-row">
              <div className="due">
                <div className="duebar" style={{ background: item.color }} />
                <div style={{ flex: 1 }}>
                  <div className="name">{item.name}</div>
                  <div className="course">
                    {TYPE_LABEL[item.type]}{item.course ? ` · ${item.course}` : ''}
                  </div>
                </div>
                <div
                  className="when"
                  style={{ color: item.color === '#56544c' ? 'var(--dim)' : item.color }}
                >
                  {item.when}
                </div>
              </div>
              <div className="bm-actions">
                <button className="bm-act-btn" onClick={() => openEdit(item)} aria-label="Edit">
                  <i className="ti ti-pencil" />
                </button>
                <button className="bm-act-btn bm-del" onClick={() => handleDelete(item.id)} aria-label="Delete">
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="bm-form">
          <input
            className="bm-input"
            placeholder="Name (e.g. Lab 7 writeup)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
          <input
            className="bm-input"
            placeholder="Course (optional)"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          />
          <div className="due-form-row">
            <select
              className="bm-input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as DueType })}
            >
              <option value="assignment">Assignment</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
            </select>
            <input
              className="bm-input"
              type="datetime-local"
              value={form.dueAt}
              onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            />
          </div>
          <div className="bm-form-btns">
            <button className="bm-save-btn" onClick={handleSave}>
              {editing ? 'Save' : 'Add'}
            </button>
            <button className="bm-cancel-btn" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </PanelShell>
  )
}
