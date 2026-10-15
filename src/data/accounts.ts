import type { AccountDetails, Prospect, Submission, WorkspaceData } from '../types'

export type AccountTarget = { prospectId?: string; submissionId?: string; tab?: 'details' | 'submission' | 'requests' | 'screening' }

export function saveAccount(data: WorkspaceData, target: AccountTarget, details: AccountDetails): WorkspaceData {
  const submission=data.submissions.find(s=>s.id===target.submissionId)
  const prospect=data.prospects.find(p=>p.id===(target.prospectId??submission?.prospectId))
  const changedIdentity=prospect && (prospect.name!==details.name||prospect.state!==details.state||prospect.city!==details.city)
  const updatedAt=new Date().toISOString().slice(0,10)
  const affected=new Set(data.submissions.filter(s=>s.id===target.submissionId||(prospect&&s.prospectId===prospect.id)).map(s=>s.id))
  return {...data,
    prospects:data.prospects.map(p=>p.id===prospect?.id?{...p,...details,updatedAt}:p),
    submissions:data.submissions.map(s=>affected.has(s.id)?{...s,accountName:details.name,industry:details.industry,crmUrl:details.crmUrl,followUp:details.followUpDate??s.followUp,accountDetails:details,updatedAt}:s),
    placementRequests:data.placementRequests.map(r=>affected.has(r.submissionId)?{...r,accountName:details.name}:r),
    research:changedIdentity&&data.research?{...data.research,matches:data.research.matches.filter(m=>m.prospectId!==prospect.id),duplicates:data.research.duplicates.filter(d=>d.left!==prospect.id&&d.right!==prospect.id)}:data.research,
  }
}

export function accountProfile(prospect?: Prospect, submission?: Submission, fromSubmission=false): Prospect | undefined {
  if(prospect) return {...prospect,...(fromSubmission&&submission?{name:submission.accountName,industry:submission.industry}:{}),followUpDate:prospect.followUpDate??submission?.followUp}
  if(!submission) return undefined
  return {id:`account-${submission.id}`,name:submission.accountName,industry:submission.industry,city:'',state:'',revenue:0,employees:0,priority:false,clearance:'Needs Review',clearanceReason:'CRM review required.',updatedAt:submission.updatedAt,crmUrl:submission.crmUrl,followUpDate:submission.followUp,...submission.accountDetails}
}
