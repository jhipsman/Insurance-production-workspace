import { useState, type Dispatch, type SetStateAction } from 'react'
import type { WorkspaceData } from '../types'
import type { AccountTarget } from '../data/accounts'
import { Empty } from '../components/UI'
import { RequestRow } from '../components/CarrierRequests'
import { AccountPanel } from '../components/AccountPanel'

export function Placement({data,setData,onOpen}:{data:WorkspaceData;setData:Dispatch<SetStateAction<WorkspaceData>>;onOpen?:(target:AccountTarget)=>void}) {
  const [account,setAccount]=useState(''),[showComplete,setShowComplete]=useState(false),[target,setTarget]=useState<AccountTarget>()
  const open=onOpen??setTarget
  const submissions=data.submissions.filter(s=>!account||s.id===account)
  const requests=data.placementRequests.filter(r=>(!account||r.submissionId===account)&&(showComplete||r.status!=='Complete'))
  const checklist=submissions.flatMap(s=>s.checklist.filter(i=>showComplete||!i.complete).map(item=>({submission:s,item})))
  const ids=[...new Set([...requests.map(r=>r.submissionId),...checklist.map(c=>c.submission.id)])]
  return <div className="page">
    <div className="page-title"><div><span className="eyebrow">Work queue</span><h1>Outstanding items</h1><p>Submission requirements and carrier questions that need an answer.</p></div></div>
    <div className="queue-filters"><label>Account<select value={account} onChange={e=>setAccount(e.target.value)}><option value="">All accounts</option>{data.submissions.map(s=><option key={s.id} value={s.id}>{s.accountName}</option>)}</select></label><label className="inline-check"><input type="checkbox" checked={showComplete} onChange={e=>setShowComplete(e.target.checked)}/>Include completed</label></div>
    {!ids.length&&<Empty title="You're caught up" detail="New submission requirements and carrier requests will appear here."/>}
    <div className="request-groups">{ids.map(id=>{
      const sub=data.submissions.find(s=>s.id===id)
      const rows=requests.filter(r=>r.submissionId===id)
      const checks=checklist.filter(c=>c.submission.id===id)
      return <section className="panel" key={id}><div className="panel-head"><h2>{sub?.accountName??rows[0]?.accountName??'Unlinked requests'}</h2>{sub&&<button className="btn small" onClick={()=>open({submissionId:id,tab:rows.length?'requests':'submission'})}>Open account</button>}</div>
        {checks.length>0&&<div className="queue-checklist"><h3>Submission requirements</h3>{checks.map(({item})=><label key={item.id}><input type="checkbox" checked={item.complete} onChange={e=>setData(d=>({...d,submissions:d.submissions.map(s=>s.id===id?{...s,updatedAt:new Date().toISOString().slice(0,10),checklist:s.checklist.map(i=>i.id===item.id?{...i,complete:e.target.checked}:i)}:s)}))}/>{item.label}</label>)}</div>}
        {rows.length>0&&<><h3 className="queue-heading">Carrier requests</h3>{rows.map(r=><RequestRow key={r.id} request={r} setData={setData}/>)}</>}
      </section>
    })}</div>
    {target&&!onOpen&&<AccountPanel key={target.submissionId} target={target} data={data} setData={setData} onClose={()=>setTarget(undefined)}/>}
  </div>
}
