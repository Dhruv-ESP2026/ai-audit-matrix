import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Opportunity } from '../types'
import { PRIORITY_META } from '../types'

interface Props {
  opportunity: Opportunity
  onEdit: (opp: Opportunity) => void
}

export default function OpportunityCard({ opportunity, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  }

  const priorityMeta = opportunity.priority_tag ? PRIORITY_META[opportunity.priority_tag] : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`opp-card${isDragging ? ' dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="opp-card-header">
        <span className="opp-card-name">{opportunity.name}</span>
        <div className="opp-card-actions">
          <button
            className="btn btn-ghost btn-icon"
            style={{ fontSize: 11, padding: '4px 6px' }}
            onClick={e => { e.stopPropagation(); onEdit(opportunity) }}
            title="Edit"
            onPointerDown={e => e.stopPropagation()}
          >
            ✎
          </button>
        </div>
      </div>

      <div className="opp-card-meta">
        <span className="badge badge-effort">
          {opportunity.effort_level === 'low' ? 'Low effort' : 'High effort'}
        </span>
        <span className="badge badge-impact">
          {opportunity.impact_score === 'high' ? 'High impact' : 'Low impact'}
        </span>
        {priorityMeta && (
          <span
            className="priority-badge"
            style={{
              color: priorityMeta.color,
              borderColor: `${priorityMeta.color}40`,
              background: `${priorityMeta.color}15`,
            }}
          >
            {priorityMeta.label}
          </span>
        )}
      </div>

      {opportunity.notes && (
        <p className="opp-card-notes">{opportunity.notes}</p>
      )}
    </div>
  )
}
