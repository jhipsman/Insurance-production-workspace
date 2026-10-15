export type Section = 'dashboard' | 'prospects' | 'submissions' | 'placement' | 'sov' | 'bor' | 'library'
export type Clearance = 'Cleared' | 'Needs Review' | 'Restricted'
export type SubmissionStage = 'Preparing' | 'Ready to Market' | 'In Market' | 'Proposal' | 'Bound'
export type ItemStatus = 'Open' | 'In progress' | 'Complete'

export interface Prospect {
  id: string
  name: string
  city: string
  state: string
  industry: string
  revenue: number
  employees: number
  clearance: Clearance
  clearanceReason: string
  priority: boolean
  crmUrl?: string
  notes?: string
  updatedAt: string
}

export interface ChecklistItem { id: string; label: string; complete: boolean; required: boolean }

export interface Submission {
  id: string
  prospectId?: string
  accountName: string
  industry: string
  stage: SubmissionStage
  coverages: string[]
  crmUrl?: string
  indioUrl?: string
  tailwindUrl?: string
  checklist: ChecklistItem[]
  updatedAt: string
  followUp: string
}

export interface PlacementRequest {
  id: string
  submissionId: string
  accountName: string
  carrier: string
  description: string
  status: ItemStatus
  answer: string
  documentRef: string
  dateReceived: string
  sourceEmail: string
  sharedKey: string
}

export interface Activity { id: string; title: string; detail: string; occurredAt: string }

export interface WorkspaceData {
  version: 1
  research?: import('./data/research').Research
  prospects: Prospect[]
  submissions: Submission[]
  placementRequests: PlacementRequest[]
  activities: Activity[]
}
