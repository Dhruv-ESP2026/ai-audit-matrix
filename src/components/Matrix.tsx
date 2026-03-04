import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { Opportunity, OpportunityInsert, Quadrant as QuadrantType } from '../types'
import { PRIORITY_META } from '../types'
import { supabase } from '../lib/supabase'
import QuadrantPanel from './Quadrant'
import CardModal from './CardModal'

interface Props {
  userId: string
}

type ModalState =
  | { type: 'add'; quadrant: QuadrantType }
  | { type: 'edit'; opportunity: Opportunity }
  | null

export default function Matrix({ userId }: Props) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>(null)
  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const fetchOpportunities = useCallback(async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })
    if (!error && data) setOpportunities(data as Opportunity[])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchOpportunities() }, [fetchOpportunities])

  function byQuadrant(q: QuadrantType) {
    return opportunities.filter(o => o.quadrant === q)
  }

  async function handleSave(data: OpportunityInsert) {
    if (modal?.type === 'edit') {
      const { error } = await supabase
        .from('opportunities')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', modal.opportunity.id)
      if (!error) {
        setOpportunities(prev =>
          prev.map(o => o.id === modal.opportunity.id ? { ...o, ...data } : o)
        )
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('opportunities')
        .insert({ ...data, user_id: userId })
        .select()
        .single()
      if (!error && inserted) {
        setOpportunities(prev => [...prev, inserted as Opportunity])
      }
    }
    setModal(null)
  }

  async function handleDelete() {
    if (modal?.type !== 'edit') return
    const id = modal.opportunity.id
    const { error } = await supabase.from('opportunities').delete().eq('id', id)
    if (!error) {
      setOpportunities(prev => prev.filter(o => o.id !== id))
    }
    setModal(null)
  }

  function handleDragStart(event: DragStartEvent) {
    const opp = opportunities.find(o => o.id === event.active.id)
    if (opp) setActiveOpp(opp)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveOpp(null)
    const { active, over } = event
    if (!over) return

    const opp = opportunities.find(o => o.id === active.id)
    if (!opp) return

    const targetQuadrant = over.id as QuadrantType
    if (opp.quadrant === targetQuadrant) return

    const effortMap: Record<QuadrantType, 'low' | 'high'> = {
      quick_wins: 'low', fill_ins: 'low', big_bets: 'high', hard_slogs: 'high',
    }
    const impactMap: Record<QuadrantType, 'low' | 'high'> = {
      quick_wins: 'high', big_bets: 'high', fill_ins: 'low', hard_slogs: 'low',
    }

    const updates = {
      quadrant: targetQuadrant,
      effort_level: effortMap[targetQuadrant],
      impact_score: impactMap[targetQuadrant],
      updated_at: new Date().toISOString(),
    }

    setOpportunities(prev =>
      prev.map(o => o.id === opp.id ? { ...o, ...updates } : o)
    )

    await supabase.from('opportunities').update(updates).eq('id', opp.id)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner" />
        Loading opportunities…
      </div>
    )
  }

  const quadrants: QuadrantType[] = ['quick_wins', 'big_bets', 'fill_ins', 'hard_slogs']

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="matrix-wrapper">
          {/* Y axis */}
          <div className="matrix-y-axis">
            <span className="axis-label" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>High</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
              <div className="axis-arrow" />
              <div className="axis-line" />
            </div>
            <span className="axis-label" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Low</span>
            <span className="axis-label" style={{ marginTop: 8, writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: 'var(--text-secondary)' }}>Impact</span>
          </div>

          <div className="matrix-right">
            <div className="matrix-grid">
              {quadrants.map(q => (
                <QuadrantPanel
                  key={q}
                  quadrant={q}
                  opportunities={byQuadrant(q)}
                  onAddCard={quadrant => setModal({ type: 'add', quadrant })}
                  onEditCard={opp => setModal({ type: 'edit', opportunity: opp })}
                />
              ))}
            </div>

            {/* X axis */}
            <div className="matrix-x-axis">
              <span className="axis-label" style={{ color: 'var(--text-secondary)' }}>Effort</span>
              <span className="axis-label">Low</span>
              <div className="axis-line-x" />
              <div className="axis-arrow-x" />
              <span className="axis-label">High</span>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeOpp && (
            <div className="drag-overlay-card">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                {activeOpp.name}
              </div>
              {activeOpp.priority_tag && (
                <span
                  className="priority-badge"
                  style={{
                    color: PRIORITY_META[activeOpp.priority_tag].color,
                    borderColor: `${PRIORITY_META[activeOpp.priority_tag].color}40`,
                    background: `${PRIORITY_META[activeOpp.priority_tag].color}15`,
                  }}
                >
                  {PRIORITY_META[activeOpp.priority_tag].label}
                </span>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modal && (
        <CardModal
          opportunity={modal.type === 'edit' ? modal.opportunity : undefined}
          defaultQuadrant={modal.type === 'add' ? modal.quadrant : undefined}
          onSave={handleSave}
          onDelete={modal.type === 'edit' ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
