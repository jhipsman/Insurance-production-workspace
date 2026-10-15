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
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  streetAddress?: string
  renewalDate?: string
  followUpDate?: string
  updatedAt: string
}

export interface ChecklistItem { id: string; label: string; complete: boolean; required: boolean }
export type AccountDetails = Pick<Prospect, 'name' | 'city' | 'state' | 'industry' | 'revenue' | 'employees' | 'crmUrl' | 'notes' | 'priority' | 'contactName' | 'contactEmail' | 'contactPhone' | 'website' | 'streetAddress' | 'renewalDate' | 'followUpDate'>

export interface Submission {
  accountDetails?: AccountDetails
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
  demoSubmissionCleanup?: {
    completedAt: string
    submissions: Submission[]
    placementRequests: PlacementRequest[]
  }
  research?: import('./data/research').Research
  prospects: Prospect[]
  submissions: Submission[]
  placementRequests: PlacementRequest[]
  activities: Activity[]
}
