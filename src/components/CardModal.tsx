import { useState } from 'react'
import type { Opportunity, OpportunityInsert, Quadrant, PriorityTag } from '../types'

interface Props {
  opportunity?: Opportunity
  defaultQuadrant?: Quadrant
  onSave: (data: OpportunityInsert) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

const QUADRANT_OPTIONS: { value: Quadrant; label: string }[] = [
  { value: 'quick_wins', label: 'Quick Wins' },
  { value: 'big_bets', label: 'Big Bets' },
  { value: 'fill_ins', label: 'Fill-ins' },
  { value: 'hard_slogs', label: 'Hard Slogs' },
]

const PRIORITY_OPTIONS: { value: PriorityTag; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

function deriveQuadrant(effort: 'low' | 'high', impact: 'low' | 'high'): Quadrant {
  if (effort === 'low' && impact === 'high') return 'quick_wins'
  if (effort === 'high' && impact === 'high') return 'big_bets'
  if (effort === 'low' && impact === 'low') return 'fill_ins'
  return 'hard_slogs'
}

export default function CardModal({ opportunity, defaultQuadrant, onSave, onDelete, onClose }: Props) {
  const isEdit = !!opportunity

  const initEffort = opportunity?.effort_level ?? (
    defaultQuadrant === 'quick_wins' || defaultQuadrant === 'fill_ins' ? 'low' : 'high'
  )
  const initImpact = opportunity?.impact_score ?? (
    defaultQuadrant === 'quick_wins' || defaultQuadrant === 'big_bets' ? 'high' : 'low'
  )

  const [name, setName] = useState(opportunity?.name ?? '')
  const [effortLevel, setEffortLevel] = useState<'low' | 'high'>(initEffort)
  const [impactScore, setImpactScore] = useState<'low' | 'high'>(initImpact)
  const [priorityTag, setPriorityTag] = useState<PriorityTag | ''>(opportunity?.priority_tag ?? '')
  const [notes, setNotes] = useState(opportunity?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    await onSave({
      name: name.trim(),
      effort_level: effortLevel,
      impact_score: impactScore,
      quadrant: deriveQuadrant(effortLevel, impactScore),
      priority_tag: priorityTag || null,
      notes: notes.trim() || null,
      position: opportunity?.position ?? 0,
    })
    setLoading(false)
  }

  async function handleDelete() {
    if (!onDelete) return
    setLoading(true)
    await onDelete()
    setLoading(false)
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit opportunity' : 'New opportunity'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Opportunity name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Automate invoice processing with AI"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Effort level</label>
              <select
                className="form-select"
                value={effortLevel}
                onChange={e => setEffortLevel(e.target.value as 'low' | 'high')}
              >
                <option value="low">Low effort</option>
                <option value="high">High effort</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Impact / ROI</label>
              <select
                className="form-select"
                value={impactScore}
                onChange={e => setImpactScore(e.target.value as 'low' | 'high')}
              >
                <option value="high">High impact</option>
                <option value="low">Low impact</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Priority tag</label>
            <select
              className="form-select"
              value={priorityTag}
              onChange={e => setPriorityTag(e.target.value as PriorityTag | '')}
            >
              <option value="">No priority</option>
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Add context, dependencies, or next steps…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Will be placed in: <strong style={{ color: 'var(--text-secondary)' }}>
              {QUADRANT_OPTIONS.find(q => q.value === deriveQuadrant(effortLevel, impactScore))?.label}
            </strong>
          </div>
        </div>

        <div className="modal-footer">
          <div>
            {isEdit && onDelete && (
              deleteConfirm ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sure?</span>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>Delete</button>
                  <button className="btn btn-ghost" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn-ghost" onClick={() => setDeleteConfirm(true)} style={{ color: '#f87171' }}>
                  Delete
                </button>
              )
            )}
          </div>
          <div className="modal-footer-right">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add opportunity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
