import type { WorkspaceData } from '../types'

const demoAccounts = new Set([
  'new leaf recovery network',
  'harborlight youth services',
  'oak & river senior support',
])

/** One-time browser migration. Never remove a renamed account based on its seed ID. */
export function removeDemoSubmissions(data: WorkspaceData): WorkspaceData {
  if (data.demoSubmissionCleanup) return data
  const submissions = data.submissions.filter(s=>demoAccounts.has(s.accountName.trim().toLowerCase()))
  const ids = new Set(submissions.map(s=>s.id))
  const placementRequests = data.placementRequests.filter(r=>ids.has(r.submissionId))
  return {
    ...data,
    submissions: data.submissions.filter(s=>!ids.has(s.id)),
    placementRequests: data.placementRequests.filter(r=>!ids.has(r.submissionId)),
    // Retain removed records locally and in JSON backups for recovery if needed.
    demoSubmissionCleanup: {completedAt:new Date().toISOString(),submissions,placementRequests},
  }
}
