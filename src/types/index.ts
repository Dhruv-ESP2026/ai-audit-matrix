export type Quadrant = 'quick_wins' | 'big_bets' | 'fill_ins' | 'hard_slogs'
export type EffortLevel = 'low' | 'high'
export type ImpactLevel = 'low' | 'high'
export type PriorityTag = 'critical' | 'high' | 'medium' | 'low'

export interface Opportunity {
  id: string
  user_id: string
  name: string
  effort_level: EffortLevel
  impact_score: ImpactLevel
  quadrant: Quadrant
  priority_tag: PriorityTag | null
  notes: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface OpportunityInsert {
  name: string
  effort_level: EffortLevel
  impact_score: ImpactLevel
  quadrant: Quadrant
  priority_tag: PriorityTag | null
  notes: string | null
  position: number
}

export const QUADRANT_META: Record<Quadrant, { label: string; description: string; color: string; accentColor: string }> = {
  quick_wins: {
    label: 'Quick Wins',
    description: 'Low effort · High impact',
    color: '#16a34a',
    accentColor: 'rgba(22, 163, 74, 0.12)',
  },
  big_bets: {
    label: 'Big Bets',
    description: 'High effort · High impact',
    color: '#7c3aed',
    accentColor: 'rgba(124, 58, 237, 0.12)',
  },
  fill_ins: {
    label: 'Fill-ins',
    description: 'Low effort · Low impact',
    color: '#d97706',
    accentColor: 'rgba(217, 119, 6, 0.12)',
  },
  hard_slogs: {
    label: 'Hard Slogs',
    description: 'High effort · Low impact',
    color: '#dc2626',
    accentColor: 'rgba(220, 38, 38, 0.12)',
  },
}

export const PRIORITY_META: Record<PriorityTag, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#eab308' },
  low: { label: 'Low', color: '#6b7280' },
}
