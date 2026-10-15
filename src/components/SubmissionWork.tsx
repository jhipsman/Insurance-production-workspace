import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Submission, SubmissionStage, WorkspaceData } from '../types'
import { CoverageEditor } from './CoverageEditor'
import { SubmissionLinks } from './SubmissionLinks'

export const submissionStages: SubmissionStage[]=['Preparing','Ready to Market','In Market','Proposal','Bound']
export function SubmissionWork({submission,setData}:{submission:Submission;setData:Dispatch<SetStateAction<WorkspaceData>>}) {
  const [newItem,setNewItem]=useState('')
  const update=(fn:(s:Submission)=>Submission)=>setData(d=>({...d,submissions:d.submissions.map(s=>s.id===submission.id?{...fn(s),updatedAt:new Date().toISOString().slice(0,10)}:s)}))
  const add=()=>{if(!newItem.trim())return;const label=newItem.trim();update(s=>({...s,checklist:[...s.checklist,{id:crypto.randomUUID(),label,complete:false,required:true}]}));setNewItem('')}
  return <div className="account-work">
    <section><h3>Submission stage</h3><div className="stage-picker">{submissionStages.map(stage=><button key={stage} aria-pressed={stage===submission.stage} className={stage===submission.stage?'active':''} onClick={()=>update(s=>({...s,stage}))}>{stage}</button>)}</div></section>
    <section><h3>Pre-submission checklist</h3><p className="muted">{submission.checklist.filter(i=>i.complete).length} of {submission.checklist.length} complete. Review requirements when changing coverage.</p><div className="checklist">{submission.checklist.map(item=><div key={item.id}><input type="checkbox" aria-label={`Complete ${item.label}`} checked={item.complete} onChange={e=>update(s=>({...s,checklist:s.checklist.map(i=>i.id===item.id?{...i,complete:e.target.checked}:i)}))}/><input aria-label="Checklist description" value={item.label} onChange={e=>update(s=>({...s,checklist:s.checklist.map(i=>i.id===item.id?{...i,label:e.target.value}:i)}))}/><button className="remove" aria-label={`Remove ${item.label}`} onClick={()=>update(s=>({...s,checklist:s.checklist.filter(i=>i.id!==item.id)}))}>×</button></div>)}</div><div className="add-row"><input aria-label="New checklist requirement" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')add()}} placeholder="Add a requirement…"/><button className="btn small" onClick={add}>Add</button></div></section>
    <CoverageEditor value={submission.coverages} onChange={coverages=>update(s=>({...s,coverages}))}/>
    <SubmissionLinks key={submission.id} submission={submission} onSave={links=>update(s=>({...s,...links}))}/>
  </div>
}
