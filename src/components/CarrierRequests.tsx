import { useState, type Dispatch, type SetStateAction } from 'react'
import type { PlacementRequest, WorkspaceData } from '../types'
import { suggestedRequestLines } from '../data/requestParser'
import { Badge, Empty } from './UI'

export function RequestRow({request:r,setData}:{request:PlacementRequest;setData:Dispatch<SetStateAction<WorkspaceData>>}) {
  const update=(changes:Partial<PlacementRequest>)=>setData(d=>({...d,placementRequests:d.placementRequests.map(item=>item.id===r.id?{...item,...changes}:item)}))
  return <div className={`carrier-request ${r.status==='Complete'?'request-complete':''}`}>
    <label className="request-completion"><input type="checkbox" checked={r.status==='Complete'} onChange={e=>update({status:e.target.checked?'Complete':'Open'})}/><span>Complete request</span></label>
    <div className="grow"><input className="request-title" aria-label="Request description" value={r.description} onChange={e=>update({description:e.target.value})}/><p className="muted">{r.carrier} · {r.dateReceived} · {r.sourceEmail}</p><label className="request-field">Answer / notes<input value={r.answer} onChange={e=>update({answer:e.target.value})}/></label><label className="request-field">Supporting document reference<input value={r.documentRef} onChange={e=>update({documentRef:e.target.value})} placeholder="Document name or reference"/></label></div>
    <div><Badge tone={r.status==='Complete'?'green':r.status==='In progress'?'blue':'amber'}>{r.status}</Badge>{r.status!=='Complete'&&<button className="text-btn" onClick={()=>update({status:r.status==='Open'?'In progress':'Open'})}>{r.status==='Open'?'Start working':'Mark open'}</button>}</div>
  </div>
}

export function CarrierRequests({data,setData,submissionId}:{data:WorkspaceData;setData:Dispatch<SetStateAction<WorkspaceData>>;submissionId:string}) {
  const [compose,setCompose]=useState(false),[carrier,setCarrier]=useState(''),[subject,setSubject]=useState(''),[body,setBody]=useState(''),[lines,setLines]=useState<string[]>([]),[showComplete,setShowComplete]=useState(false),[notice,setNotice]=useState('')
  const sub=data.submissions.find(s=>s.id===submissionId)
  if(!sub)return null
  const all=data.placementRequests.filter(r=>r.submissionId===submissionId)
  const shown=all.filter(r=>showComplete||r.status!=='Complete')
  function save() {
    if(!sub||!carrier.trim())return
    const descriptions=[...new Set(lines.map(s=>s.trim()).filter(Boolean))]
    if(!descriptions.length)return
    setData(d=>{
      const known=new Set(d.placementRequests.filter(r=>r.submissionId===submissionId&&r.carrier.trim().toLowerCase()===carrier.trim().toLowerCase()).map(r=>r.description.trim().toLowerCase()))
      const additions:PlacementRequest[]=descriptions.filter(description=>!known.has(description.toLowerCase())).map(description=>({id:crypto.randomUUID(),submissionId,accountName:sub.accountName,carrier:carrier.trim(),description,status:'Open',answer:'',documentRef:'',dateReceived:new Date().toISOString().slice(0,10),sourceEmail:subject.trim()||'Manual request',sharedKey:description.toLowerCase().replace(/[^a-z0-9]+/g,'-')}))
      return {...d,placementRequests:[...additions,...d.placementRequests]}
    });setCompose(false);setLines([]);setBody('');setCarrier('');setSubject('');setNotice('Requests saved. Identical requests for this carrier were skipped.')
  }
  return <section className="account-requests"><div className="panel-head"><h3>Carrier requests</h3><button className="btn primary" onClick={()=>setCompose(v=>!v)}>{compose?'Close request entry':'Add requests'}</button></div>
    {notice&&<p role="status" className="muted">{notice}</p>}
    <label className="inline-check"><input type="checkbox" checked={showComplete} onChange={e=>setShowComplete(e.target.checked)}/>Show completed ({all.filter(r=>r.status==='Complete').length})</label>
    {compose&&<section className="request-composer"><div className="form-grid"><label>Carrier<input value={carrier} onChange={e=>setCarrier(e.target.value)}/></label><label>Source / email subject<input value={subject} onChange={e=>setSubject(e.target.value)}/></label><label className="full">Email or request text<textarea rows={4} value={body} onChange={e=>setBody(e.target.value)} placeholder="Paste an email or enter each request on a separate line."/></label></div><div className="composer-actions"><button className="btn" onClick={()=>setLines(suggestedRequestLines(body))}>Review suggested items</button><button className="btn" onClick={()=>setLines(v=>[...v,''])}>Add an item manually</button></div>{lines.map((line,i)=><div className="add-row" key={i}><input aria-label={`Request item ${i+1}`} value={line} onChange={e=>setLines(v=>v.map((s,j)=>i===j?e.target.value:s))}/><button aria-label={`Remove request item ${i+1}`} className="btn" onClick={()=>setLines(v=>v.filter((_,j)=>j!==i))}>×</button></div>)}<div className="composer-actions"><button disabled={!carrier.trim()||!lines.some(l=>l.trim())} className="btn primary" onClick={save}>Save requests</button></div></section>}
    {shown.map(r=><RequestRow key={r.id} request={r} setData={setData}/>)}
    {!shown.length&&!compose&&<Empty title="No outstanding carrier requests" detail="Add requests here as placement questions arrive."/>}
  </section>
}
