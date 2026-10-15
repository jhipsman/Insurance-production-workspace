import type { Submission } from '../types'

export const policyRules = [
  {coverage:'Commercial Auto',pattern:/business auto|commercial auto(?:mobile)?/i,requirements:['Current vehicle schedule','Driver list and MVR guidelines']},
  {coverage:'Workers Compensation',pattern:/workers[’'\s-]*compensation/i,requirements:['Payroll by state and class code','Current experience modification worksheet']},
  {coverage:'Cyber',pattern:/cyber (?:insurance|liability|risk|security)/i,requirements:['Cyber application and security controls questionnaire']},
  {coverage:'Property',pattern:/commercial property|building and personal property coverage/i,requirements:['Updated statement of values','Building construction, occupancy, protection and exposure details']},
  {coverage:'General Liability',pattern:/commercial general liability/i,requirements:['General liability application and operations description','Current revenue and exposure estimates']},
  {coverage:'Professional Liability',pattern:/professional liability|errors and omissions/i,requirements:['Professional liability supplemental application']},
  {coverage:'Crime',pattern:/crime and fidelity|commercial crime|crime coverage/i,requirements:['Crime application and financial controls questionnaire']},
  {coverage:'Inland Marine',pattern:/(?:commercial )?inland marine/i,requirements:['Current equipment and inland marine schedule']},
  {coverage:'Umbrella',pattern:/umbrella liability|excess liability/i,requirements:['Underlying policies, limits and carrier schedule']},
  {coverage:'Directors & Officers',pattern:/directors (?:and|&) officers/i,requirements:['Directors and officers application and financial statements']},
  {coverage:'Employment Practices Liability',pattern:/employment practices liability/i,requirements:['Employment practices application and employee counts']},
  {coverage:'Abuse & Molestation',pattern:/abuse (?:and|&) molestation/i,requirements:['Abuse and molestation supplemental application and safeguarding procedures']},
]
export interface PolicyMatch { coverage:string; file:string; page:number; excerpt:string }
export function detectPolicyMatches(pages:string[],file:string):PolicyMatch[] {
  return policyRules.flatMap(rule=>{
    for(let i=0;i<pages.length;i++) {
      const text=pages[i].replace(/\s+/g,' '),match=rule.pattern.exec(text)
      if(match)return [{coverage:rule.coverage,file,page:i+1,excerpt:text.slice(Math.max(0,match.index-90),match.index+match[0].length+150)}]
    }
    return []
  })
}
export function applyPolicyReview(submission:Submission,coverages:string[]):Submission {
  const selected=policyRules.filter(r=>coverages.includes(r.coverage))
  if(!selected.length)return submission
  const names=new Set(submission.coverages.map(c=>c.toLowerCase()))
  const labels=new Set(submission.checklist.map(c=>c.label.trim().toLowerCase()))
  const requirements=['Review expiring policy declarations, limits and exclusions',...selected.flatMap(r=>r.requirements)]
  return {...submission,coverages:[...submission.coverages,...selected.map(r=>r.coverage).filter(c=>!names.has(c.toLowerCase()))],
    checklist:[...submission.checklist,...requirements.filter(label=>{const key=label.toLowerCase();if(labels.has(key))return false;labels.add(key);return true}).map(label=>({id:crypto.randomUUID(),label,complete:false,required:true}))]}
}
