import { useState, type Dispatch, type SetStateAction } from 'react'
import type { WorkspaceData } from '../types'
import type { AccountTarget } from '../data/accounts'
import { Icon, Progress, Empty } from '../components/UI'
import { AccountPanel } from '../components/AccountPanel'
import { submissionStages } from '../components/SubmissionWork'

export function Submissions({data,setData,onOpen}:{data:WorkspaceData;setData:Dispatch<SetStateAction<WorkspaceData>>;onOpen?:(target:AccountTarget)=>void}) {
  const [target,setTarget]=useState<AccountTarget>()
  const open=onOpen??setTarget
  return <div className="page">
    <div className="page-title"><div><span className="eyebrow">Pipeline</span><h1>Submission Center</h1><p>Open any account for its details, coverages, checklist, and carrier requests.</p></div></div>
    {!data.submissions.length&&<Empty title="No active submissions" detail="Start a submission from an account in the Prospecting Desk."/>}
    <div className="kanban">{submissionStages.map(stage=><section className="kanban-column" key={stage}><div className="kanban-head"><span>{stage}</span><b>{data.submissions.filter(s=>s.stage===stage).length}</b></div>{data.submissions.filter(s=>s.stage===stage).map(sub=>{
      const complete=sub.checklist.filter(i=>i.complete).length
      const pct=sub.checklist.length?Math.round(complete/sub.checklist.length*100):0
      const outstanding=data.placementRequests.filter(r=>r.submissionId===sub.id&&r.status!=='Complete').length
      return <button className="submission-card" key={sub.id} onClick={()=>open({submissionId:sub.id,tab:'submission'})}><div className="card-top"><span className="mini-avatar">{sub.accountName.split(' ').slice(0,2).map(x=>x[0]).join('')}</span><Icon name="more"/></div><strong>{sub.accountName}</strong><span>{sub.industry}</span><div className="coverage-tags">{sub.coverages.slice(0,2).map(c=><small key={c}>{c}</small>)}{sub.coverages.length>2&&<small>+{sub.coverages.length-2}</small>}</div><div className="card-progress"><span>{complete} of {sub.checklist.length} ready</span><b>{pct}%</b></div><Progress value={pct}/><div className="card-foot"><span>{outstanding} carrier requests</span><span>{sub.followUp||'No follow-up set'}</span></div></button>
    })}</section>)}</div>
    {target&&!onOpen&&<AccountPanel key={target.submissionId} target={target} data={data} setData={setData} onClose={()=>setTarget(undefined)}/>}
  </div>
}
