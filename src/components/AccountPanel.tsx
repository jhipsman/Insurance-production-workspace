import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Prospect, WorkspaceData } from '../types'
import { accountProfile, saveAccount, type AccountTarget } from '../data/accounts'
import { assessContact, emptyResearch } from '../data/research'
import { Modal } from './UI'
import { ProspectEditor } from './ProspectEditor'
import { SubmissionWork } from './SubmissionWork'
import { CarrierRequests } from './CarrierRequests'
import { ReviewProspect } from '../pages/ProspectResearch'
import { safeWebLink } from './SubmissionLinks'

export function AccountPanel({target,data,setData,onClose,onStartSubmission}:{target:AccountTarget;data:WorkspaceData;setData:Dispatch<SetStateAction<WorkspaceData>>;onClose:()=>void;onStartSubmission?:(p:Prospect)=>void}) {
  const [tab,setTab]=useState(target.tab??(target.submissionId?'submission':'details'))
  const [message,setMessage]=useState('')
  const submissions=data.submissions.filter(s=>target.submissionId?s.id===target.submissionId:s.prospectId===target.prospectId)
  const [chosen,setChosen]=useState(submissions[0]?.id)
  const submission=submissions.find(s=>s.id===chosen)??submissions[0]
  const prospect=data.prospects.find(p=>p.id===(target.prospectId??submission?.prospectId))
  const profile=accountProfile(prospect,submission,!!target.submissionId)
  if(!profile)return null
  const tabs=[['details','Account details'],...(submission?[['submission','Submission'],['requests','Carrier requests']]:[]),...(prospect?[['screening','Contact review']]:[])]
  return <Modal title={profile.name} onClose={onClose} wide>
    <div className="account-shortcuts">{[['Open CRM',profile.crmUrl],['Open Indio',submission?.indioUrl],['Open Tailwind',submission?.tailwindUrl]].map(([label,url])=>safeWebLink(url)&&<a key={label} href={safeWebLink(url)} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>
    <div className="account-tabs">{tabs.map(([key,label])=><button key={key} className={`btn ${tab===key?'primary':''}`} aria-pressed={tab===key} onClick={()=>setTab(key as typeof tab)}>{label}</button>)}{!submission&&prospect&&onStartSubmission&&<button className="btn" disabled={assessContact(prospect,data.research??emptyResearch()).status==='Restricted'} onClick={()=>onStartSubmission(prospect)}>Start submission</button>}</div>
    {submissions.length>1&&<label className="account-choice">Submission<select value={submission?.id} onChange={e=>setChosen(e.target.value)}>{submissions.map(s=><option key={s.id} value={s.id}>{s.accountName} · {s.stage} · {s.id}</option>)}</select></label>}
    {message&&<p className="account-message" role="status">{message}</p>}
    <div hidden={tab!=='details'}><ProspectEditor embedded key={profile.id} prospect={profile} onClose={onClose} onSave={details=>{setData(d=>saveAccount(d,{prospectId:prospect?.id,submissionId:submission?.id},details));setMessage('Account saved across linked views.')}}/></div>
    {submission&&<><div hidden={tab!=='submission'}><SubmissionWork key={submission.id} submission={submission} setData={setData}/></div><div hidden={tab!=='requests'}><CarrierRequests key={submission.id} submissionId={submission.id} data={data} setData={setData}/></div></>}
    {prospect&&tab==='screening'&&<ReviewProspect embedded prospect={prospect} research={data.research??emptyResearch()} update={fn=>setData(d=>({...d,research:fn(d.research??emptyResearch())}))} close={onClose}/>}
  </Modal>
}
