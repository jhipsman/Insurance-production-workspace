import { useState } from 'react'
import type { Submission } from '../types'

export const safeWebLink = (value?: string) => {
  if(!value)return undefined
  try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:undefined}catch{return undefined}
}
export function SubmissionLinks({submission,onSave}:{submission:Submission;onSave:(links:Pick<Submission,'indioUrl'|'tailwindUrl'>)=>void}) {
  const [indioUrl,setIndio]=useState(submission.indioUrl??''),[tailwindUrl,setTailwind]=useState(submission.tailwindUrl??''),[message,setMessage]=useState('')
  return <section className="submission-links"><h3>Submission links</h3><label className="request-field">Indio link<input type="url" value={indioUrl} onChange={e=>setIndio(e.target.value)}/></label><label className="request-field">Tailwind link<input type="url" value={tailwindUrl} onChange={e=>setTailwind(e.target.value)}/></label><button className="btn small" onClick={()=>{if((indioUrl.trim()&&!safeWebLink(indioUrl.trim()))||(tailwindUrl.trim()&&!safeWebLink(tailwindUrl.trim()))){setMessage('Enter links starting with https:// or http://.');return}onSave({indioUrl:indioUrl.trim(),tailwindUrl:tailwindUrl.trim()});setMessage('Links saved.')}}>Save links</button>{message&&<p className="muted" role="status">{message}</p>}</section>
}
