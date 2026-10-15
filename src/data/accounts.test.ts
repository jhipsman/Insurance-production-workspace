import { expect, it } from 'vitest'
import { accountProfile, saveAccount } from './accounts'
import { sampleData } from '../sampleData'
import { parseBackup, serializeBackup } from './backup'

it('keeps account identity and follow-up in sync without changing coverage, stages, IDs or checklist progress',()=>{
  const data=structuredClone(sampleData),p=data.prospects[0],sub=data.submissions.find(s=>s.prospectId===p.id)!
  const updated=saveAccount(data,{submissionId:sub.id},{...p,name:'Fictional Unified Account',notes:'Shared note',followUpDate:'2026-12-01'})
  expect(updated.prospects.find(row=>row.id===p.id)?.notes).toBe('Shared note')
  expect(updated.submissions.find(row=>row.id===sub.id)).toMatchObject({id:sub.id,accountName:'Fictional Unified Account',followUp:'2026-12-01',checklist:sub.checklist,stage:sub.stage,coverages:sub.coverages})
  expect(updated.placementRequests.filter(r=>r.submissionId===sub.id).every(r=>r.accountName==='Fictional Unified Account')).toBe(true)
  expect(data.prospects[0].name).toBe(p.name)
})

it('stores complete account details for a submission with no linked prospect, including through backup restore',()=>{
  const data=structuredClone(sampleData),sub=data.submissions.find(s=>!s.prospectId)!
  const profile=accountProfile(undefined,sub)!
  const updated=saveAccount(data,{submissionId:sub.id},{...profile,contactName:'Fictional Contact',notes:'Keep this note'})
  expect(updated.prospects).toEqual(data.prospects)
  const restored=parseBackup(serializeBackup(updated))
  expect(accountProfile(undefined,restored.submissions.find(s=>s.id===sub.id))).toMatchObject({contactName:'Fictional Contact',notes:'Keep this note'})
})

it('displays a renamed submission accurately until the user explicitly synchronizes account details',()=>{
  const sub={...sampleData.submissions[1],accountName:'Fictional Retained Account'}
  expect(accountProfile(sampleData.prospects[0],sub,true)?.name).toBe('Fictional Retained Account')
  expect(sub.accountName).toBe('Fictional Retained Account')
})
