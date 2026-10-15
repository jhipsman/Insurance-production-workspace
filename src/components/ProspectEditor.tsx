import { useState, type FormEvent } from 'react'
import type { Prospect } from '../types'
import { Modal } from './UI'

export type ProspectDetails = Pick<Prospect, 'name' | 'city' | 'state' | 'industry' | 'revenue' | 'employees' | 'crmUrl' | 'notes' | 'priority' | 'contactName' | 'contactEmail' | 'contactPhone' | 'website' | 'streetAddress' | 'renewalDate' | 'followUpDate'>

export function ProspectEditor({ prospect, onSave, onClose }: { prospect?: Prospect; onSave: (details: ProspectDetails) => void; onClose: () => void }) {
  const [draft,setDraft] = useState({
    name:prospect?.name??'',city:prospect?.city??'',state:prospect?.state??'',industry:prospect?.industry??'',
    revenue:prospect?.revenue?String(prospect.revenue):'',employees:prospect?.employees?String(prospect.employees):'',
    crmUrl:prospect?.crmUrl??'',notes:prospect?.notes??'',priority:prospect?.priority??false,
    contactName:prospect?.contactName??'',contactEmail:prospect?.contactEmail??'',contactPhone:prospect?.contactPhone??'',
    website:prospect?.website??'',streetAddress:prospect?.streetAddress??'',renewalDate:prospect?.renewalDate??'',followUpDate:prospect?.followUpDate??'',
  })
  const [error,setError] = useState('')
  const change = (key: keyof typeof draft, value: string | boolean) => setDraft(d=>({...d,[key]:value}))
  function submit(event: FormEvent) {
    event.preventDefault();setError('')
    if (!draft.name.trim()) { setError('Enter an organization name.'); return }
    const revenue=Number(draft.revenue),employees=Number(draft.employees)
    if (!Number.isFinite(revenue)||revenue<0||!Number.isSafeInteger(employees)||employees<0) { setError('Use a nonnegative revenue amount and a whole-number employee count.'); return }
    for (const key of ['crmUrl','website'] as const) {
      if (!draft[key].trim()) continue
      try { const url=new URL(draft[key].trim()); if(!['https:','http:'].includes(url.protocol)) throw new Error() }
      catch { setError(`${key==='crmUrl'?'CRM link':'Website'} must start with https:// or http://.`); return }
    }
    onSave({...draft,name:draft.name.trim(),city:draft.city.trim(),state:draft.state.trim().toUpperCase(),industry:draft.industry.trim()||'Unclassified',revenue,employees,crmUrl:draft.crmUrl.trim(),website:draft.website.trim(),contactEmail:draft.contactEmail.trim()})
  }
  const field=(key:Exclude<keyof typeof draft,'priority'|'notes'>,label:string,type='text')=><label key={key}>{label}<input type={type} value={draft[key]} onChange={e=>change(key,e.target.value)} required={key==='name'} min={type==='number'?'0':undefined} step={key==='employees'?'1':key==='revenue'?'0.01':undefined} autoComplete="off"/></label>
  return <Modal title={prospect?'Edit prospect':'Add prospect'} onClose={onClose} wide>
    <form onSubmit={submit}>
      <p className="modal-intro">Save account details here at any stage. Contact availability is evaluated separately from CRM evidence and agency rules.</p>
      <div className="form-grid prospect-form">
        <h3>Organization</h3>
        {field('name','Organization name')}{field('industry','Industry / operations')}
        <label className="full">Street address<input value={draft.streetAddress} onChange={e=>change('streetAddress',e.target.value)}/></label>
        {field('city','City')}{field('state','State / province')}{field('revenue','Annual revenue ($)','number')}{field('employees','Employee count','number')}
        <h3>Contact & links</h3>
        {field('contactName','Contact name')}{field('contactEmail','Contact email','email')}{field('contactPhone','Contact phone','tel')}{field('website','Organization website','url')}
        <label className="full">CRM record link<input type="url" value={draft.crmUrl} onChange={e=>change('crmUrl',e.target.value)} placeholder="https://…"/></label>
        <h3>Planning & notes</h3>
        {field('renewalDate','Renewal date','date')}{field('followUpDate','Next follow-up','date')}
        <label className="full">Important notes<textarea rows={5} value={draft.notes} onChange={e=>change('notes',e.target.value)} placeholder="Operations, exposures, next steps, or information to confirm…"/></label>
        <label className="full prospect-priority"><input type="checkbox" checked={draft.priority} onChange={e=>change('priority',e.target.checked)}/>Save as a priority prospect</label>
      </div>
      {error&&<p className="research-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button type="submit" className="btn primary">Save prospect</button></div>
    </form>
  </Modal>
}
