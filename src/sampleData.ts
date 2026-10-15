import type { WorkspaceData } from './types'

const checklist = (items: string[]) => items.map((label, index) => ({ id: `check-${index}-${label}`, label, complete: index === 0, required: true }))

export const sampleData: WorkspaceData = {
  version: 1,
  prospects: [
    { id: 'p1', name: 'Harborlight Youth Services', city: 'Portland', state: 'ME', industry: 'Youth Services', revenue: 8200000, employees: 96, clearance: 'Cleared', clearanceReason: 'Authorized list; no conflicting relationship found in available export.', priority: true, crmUrl: 'https://example.invalid/caffeine/harborlight', notes: 'Growing residential program; verify transportation exposure.', updatedAt: '2026-10-12' },
    { id: 'p2', name: 'Juniper Community Living', city: 'Albany', state: 'NY', industry: 'Developmental Services', revenue: 14600000, employees: 184, clearance: 'Needs Review', clearanceReason: 'CRM activity fields were not included. Manual review required.', priority: true, updatedAt: '2026-10-11' },
    { id: 'p3', name: 'Brightpath Family Resource Center', city: 'Hartford', state: 'CT', industry: 'Family Services', revenue: 3900000, employees: 42, clearance: 'Restricted', clearanceReason: 'Recent relationship flag present in authorized CRM export.', priority: false, crmUrl: 'https://example.invalid/caffeine/brightpath', updatedAt: '2026-10-08' },
    { id: 'p4', name: 'New Leaf Recovery Network', city: 'Providence', state: 'RI', industry: 'Behavioral Health', revenue: 11200000, employees: 128, clearance: 'Cleared', clearanceReason: 'Authorized list; no conflicting relationship found in available export.', priority: true, updatedAt: '2026-10-13' },
    { id: 'p5', name: 'Common Ground Food Collaborative', city: 'Burlington', state: 'VT', industry: 'Food Security', revenue: 2100000, employees: 21, clearance: 'Needs Review', clearanceReason: 'Possible organization-name match requires manual confirmation.', priority: false, updatedAt: '2026-10-06' },
  ],
  submissions: [
    { id: 's1', prospectId: 'p4', accountName: 'New Leaf Recovery Network', industry: 'Behavioral Health', stage: 'In Market', coverages: ['General Liability', 'Professional Liability', 'Workers Compensation'], checklist: checklist(['Five-year currently valued loss runs', 'Behavioral health supplemental application', 'Expiring policies', 'ACORD 125 and 126', 'Employee screening procedures']), crmUrl: 'https://example.invalid/caffeine/new-leaf', indioUrl: 'https://example.invalid/indio/new-leaf', tailwindUrl: 'https://example.invalid/tailwind/new-leaf', updatedAt: '2026-10-13', followUp: '2026-10-17' },
    { id: 's2', prospectId: 'p1', accountName: 'Harborlight Youth Services', industry: 'Youth Services', stage: 'Preparing', coverages: ['General Liability', 'Commercial Auto', 'Umbrella'], checklist: checklist(['Five-year currently valued loss runs', 'Youth services supplemental application', 'Driver list and MVR guidelines', 'Vehicle schedule', 'Expiring policies']), updatedAt: '2026-10-12', followUp: '2026-10-16' },
    { id: 's3', accountName: 'Oak & River Senior Support', industry: 'Senior Services', stage: 'Ready to Market', coverages: ['Management Liability', 'Cyber'], checklist: checklist(['Management liability application', 'Cyber controls questionnaire', 'Latest financial statements', 'Expiring policies']), updatedAt: '2026-10-10', followUp: '2026-10-18' },
  ],
  placementRequests: [
    { id: 'r1', submissionId: 's1', accountName: 'New Leaf Recovery Network', carrier: 'Philadelphia', description: 'Completed carrier supplemental application', status: 'Open', answer: '', documentRef: '', dateReceived: '2026-10-13', sourceEmail: 'Philadelphia Needs More Information', sharedKey: 'supplemental-application' },
    { id: 'r2', submissionId: 's1', accountName: 'New Leaf Recovery Network', carrier: 'Philadelphia', description: 'Updated payroll by class code', status: 'In progress', answer: 'Requested from finance.', documentRef: '', dateReceived: '2026-10-13', sourceEmail: 'Philadelphia Needs More Information', sharedKey: 'updated-payroll' },
    { id: 'r3', submissionId: 's1', accountName: 'New Leaf Recovery Network', carrier: 'Travelers', description: 'Confirmation of employee screening procedures', status: 'Open', answer: '', documentRef: '', dateReceived: '2026-10-14', sourceEmail: 'New Leaf follow-up items', sharedKey: 'employee-screening' },
    { id: 'r4', submissionId: 's2', accountName: 'Harborlight Youth Services', carrier: 'Hanover', description: 'Current vehicle schedule', status: 'Complete', answer: 'Received and reviewed.', documentRef: 'Harborlight_Vehicle_Schedule.xlsx', dateReceived: '2026-10-11', sourceEmail: 'Harborlight submission review', sharedKey: 'vehicle-schedule' },
  ],
  activities: [
    { id: 'a1', title: 'Submission updated', detail: 'New Leaf moved to In Market', occurredAt: '2026-10-13' },
    { id: 'a2', title: 'Prospect prioritized', detail: 'Harborlight Youth Services', occurredAt: '2026-10-12' },
    { id: 'a3', title: 'Checklist completed', detail: 'Oak & River financial statements', occurredAt: '2026-10-10' },
  ],
}
