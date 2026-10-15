import type { WorkspaceData } from '../types'
import type { AccountTarget } from '../data/accounts'
import { Empty } from '../components/UI'

export function Dashboard({data,navigate,onOpen}:{data:WorkspaceData;navigate:(target:'prospects'|'submissions'|'placement')=>void;onOpen?:(target:AccountTarget)=>void}) {
  const now=new Date()
  const date=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')
  const today=date(now),nextWeek=new Date(now);nextWeek.setDate(now.getDate()+7)
  const active=data.submissions.filter(s=>s.stage!=='Bound')
  const followUps=[
    ...active.map(s=>({key:s.id,name:s.accountName,date:data.prospects.find(p=>p.id===s.prospectId)?.followUpDate??s.followUp,target:{submissionId:s.id,tab:'details' as const}})),
    ...data.prospects.filter(p=>!data.submissions.some(s=>s.prospectId===p.id)).map(p=>({key:p.id,name:p.name,date:p.followUpDate??'',target:{prospectId:p.id,tab:'details' as const}})),
  ].filter(item=>item.date&&item.date<=date(nextWeek)).sort((a,b)=>a.date.localeCompare(b.date))
  const outstanding=data.placementRequests.filter(r=>r.status!=='Complete')
  const missing=active.flatMap(s=>s.checklist.filter(i=>i.required&&!i.complete))
  const metrics=[
    ['Follow-ups due',followUps.filter(f=>f.date<=today).length,'Overdue or due today','prospects'],
    ['Carrier questions',outstanding.length,'Awaiting a response','placement'],
    ['Missing requirements',missing.length,'Across active submissions','placement'],
  ] as const
  return <div className="page dashboard-page"><div className="page-title"><div><span className="eyebrow">{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</span><h1>Today</h1><p>Your follow-ups and unfinished work, in one place.</p></div><button className="btn primary" onClick={()=>navigate('placement')}>Work outstanding items</button></div>
    <div className="metric-grid attention-metrics">{metrics.map(([label,count,detail,target])=><button key={label} className="metric-card" onClick={()=>navigate(target)}><span>{label}</span><strong>{count}</strong><small>{detail}</small></button>)}</div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-head"><h2>Follow-ups · next 7 days</h2></div>{!followUps.length?<Empty title="No follow-ups due" detail="Set the next follow-up in an account's details."/>:followUps.map(item=><div className="attention-row" key={item.key}><div><strong>{item.name}</strong><span>{item.date}{item.date<today?' · Overdue':item.date===today?' · Today':''}</span></div><button className="btn small" onClick={()=>onOpen?onOpen(item.target):navigate('prospects')}>Open account</button></div>)}</section>
    <section className="panel"><div className="panel-head"><h2>Carrier questions</h2><button className="text-btn" onClick={()=>navigate('placement')}>View all →</button></div>{!outstanding.length?<Empty title="No unanswered requests" detail="Carrier requests appear here when added to a submission."/>:outstanding.slice(0,5).map(r=><div className="attention-row" key={r.id}><div><strong>{r.description}</strong><span>{r.accountName} · {r.carrier}</span></div><button className="btn small" onClick={()=>onOpen?onOpen({submissionId:r.submissionId,tab:'requests'}):navigate('placement')}>Open</button></div>)}</section></div>
  </div>
}
