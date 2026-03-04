import { useDroppable } from '@dnd-kit/core'
import type { Opportunity, Quadrant as QuadrantType } from '../types'
import { QUADRANT_META } from '../types'
import OpportunityCard from './OpportunityCard'

interface Props {
  quadrant: QuadrantType
  opportunities: Opportunity[]
  onAddCard: (quadrant: QuadrantType) => void
  onEditCard: (opp: Opportunity) => void
}

export default function Quadrant({ quadrant, opportunities, onAddCard, onEditCard }: Props) {
  const meta = QUADRANT_META[quadrant]
  const { isOver, setNodeRef } = useDroppable({ id: quadrant })

  return (
    <div
      className={`quadrant${isOver ? ' drag-over' : ''}`}
      style={{ borderTop: `2px solid ${meta.color}`, background: isOver ? meta.accentColor : undefined }}
    >
      <div className="quadrant-header">
        <div className="quadrant-header-left">
          <div className="quadrant-dot" style={{ background: meta.color }} />
          <div>
            <div className="quadrant-label">{meta.label}</div>
            <div className="quadrant-desc">{meta.description}</div>
          </div>
        </div>
        <span className="quadrant-count">{opportunities.length}</span>
      </div>

      <div ref={setNodeRef} className="quadrant-body">
        {opportunities.length === 0 ? (
          <div className="quadrant-empty">
            <span style={{ fontSize: 18 }}>○</span>
            <span>Drop cards here</span>
          </div>
        ) : (
          opportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onEdit={onEditCard}
            />
          ))
        )}
        <button
          className="add-card-btn"
          onClick={() => onAddCard(quadrant)}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
          Add opportunity
        </button>
      </div>
    </div>
  )
}
