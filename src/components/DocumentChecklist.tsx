import { useState } from 'react'
import type { Submission } from '../types'

export function documentRequirement(label:string,kind:'sov'|'policy') {
  const text=label.trim().toLowerCase()
  return kind==='sov'?/^(updated |current )?(statement of values|sov)$/.test(text):/^(expiring policies|past policies|prior policies)$/.test(text)
}
export function DocumentChecklist({submission,kind,onComplete}:{submission:Submission;kind:'sov'|'policy';onComplete:(ids:string[])=>void}) {
  const [selected,setSelected]=useState<string[]>([])
  const items=submission.checklist.filter(i=>!i.complete&&documentRequirement(i.label,kind))
  if(!items.length)return null
  return <section className="document-checklist">
    <h4>Confirm document requirement — {submission.accountName}</h4>
    <small>{submission.stage} · Submission {submission.id}</small>
    <p>After reviewing the uploaded {kind==='sov'?'SOV':'policies'}, select only requirements these files fully satisfy. Check the account, dates, completeness, and current values. Uploading alone does not verify these.</p>
    {items.map(item=><label key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={e=>setSelected(s=>e.target.checked?[...s,item.id]:s.filter(id=>id!==item.id))}/>I reviewed the files and confirm: {item.label}</label>)}
    <button className="btn small" disabled={!items.some(i=>selected.includes(i.id))} onClick={()=>{onComplete(items.filter(i=>selected.includes(i.id)).map(i=>i.id));setSelected([])}}>Mark confirmed requirements complete</button>
  </section>
}
