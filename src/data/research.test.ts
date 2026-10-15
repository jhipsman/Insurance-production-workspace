import { describe, expect, it } from 'vitest'
import { appendEvidence, assessContact, crmCandidates, duplicatePairs, emptyResearch, industrySummary, makeBatch, nameSimilarity, parseEvidenceCsv, scoreProspect, type EvidenceAccount, type Research } from './research'
import { sampleData } from '../sampleData'
import { parseBackup, serializeBackup } from './backup'

const prospect = {...sampleData.prospects[0], clearance: 'Needs Review' as const}
const today = '2026-10-15'
const row: EvidenceAccount = { id:'crm1',name:prospect.name,state:'ME',industry:prospect.industry,revenue:8000000,employees:90,premium:85000,lastActivity:'2025-01-01',recallUntil:'',relationship:'no',restricted:'no',boundDate:'' }
function fixture(overrides: Partial<EvidenceAccount> = {}): Research {
  return {...emptyResearch(),batches:[{id:'batch1',kind:'crm',filename:'fictional.csv',asOf:today,importedAt:today,rows:[{...row,...overrides}]}],matches:[{prospectId:prospect.id,recordId:row.id,decision:'same'}]}
}
describe('CRM contact safeguards',()=>{
  it('does not clear missing matches or missing activity',()=>{
    expect(assessContact(prospect,emptyResearch(),today).status).toBe('Needs Review')
    expect(assessContact(prospect,fixture({lastActivity:''}),today).status).toBe('Needs Review')
  })
  it('requires identity confirmation even for an identical name',()=>{
    const r=fixture();r.matches=[]
    expect(crmCandidates(prospect,r)).toHaveLength(1)
    expect(assessContact(prospect,r,today).status).toBe('Needs Review')
  })
  it('clears only confirmed identities with sufficient current evidence',()=>{
    expect(assessContact(prospect,fixture(),today).status).toBe('Cleared')
  })
  it.each([{relationship:'yes' as const},{restricted:'yes' as const},{recallUntil:today},{lastActivity:'2026-10-01'}])('restricts a confirmed match with %j',overrides=>{
    expect(assessContact(prospect,fixture(overrides),today).status).toBe('Restricted')
  })
  it('retains prior account restrictions even without a CRM match',()=>{
    expect(assessContact({...prospect,clearance:'Restricted'},emptyResearch(),today).status).toBe('Restricted')
  })
  it('keeps stale and unknown evidence in review',()=>{
    const r=fixture();r.batches[0].asOf='2026-08-01'
    expect(assessContact(prospect,r,today).status).toBe('Needs Review')
    expect(assessContact(prospect,fixture({relationship:'unknown'}),today).status).toBe('Needs Review')
  })
  it('does not use an excluded match as clearance evidence',()=>{
    const r=fixture();r.matches[0].decision='different'
    expect(assessContact(prospect,r,today).status).toBe('Needs Review')
  })
  it('does not let a conflicting older restriction get overwritten by a clean export',()=>{
    const r=fixture();r.batches.push({...r.batches[0],id:'batch2',rows:[{...row,id:'crm2',restricted:'yes'}]});r.matches.push({prospectId:prospect.id,recordId:'crm2',decision:'same'})
    expect(assessContact(prospect,r,today).status).toBe('Restricted')
  })
})
describe('local evidence imports, scoring and backups',()=>{
  it('rejects repeated imports and overlapping bound deals rather than double-counting',()=>{
    const r=fixture(), batch=r.batches[0]
    expect(()=>appendEvidence(r,batch)).toThrow(/already/)
    const bound={...batch,kind:'bound' as const,rows:[{...row,boundDate:'2026-01-01'}]}
    const history=appendEvidence(emptyResearch(),bound)
    expect(()=>appendEvidence(history,{...bound,id:'second',asOf:'2026-10-14'})).toThrow(/Overlapping/)
  })
  it('validates dates and amounts before importing, treating unfamiliar flags as unknown',()=>{
    const csv=parseEvidenceCsv('Organization Name,Last Activity Date,Existing Relationship\nExample,2025-01-01,maybe')
    const batch=makeBatch(csv,csv.map,'crm','fictional.csv','2026-01-01')
    expect(batch.rows[0].relationship).toBe('unknown')
    const bad=parseEvidenceCsv('Organization Name,Last Activity Date\nExample,2025-02-30')
    expect(()=>makeBatch(bad,bad.map,'crm','bad.csv','2026-01-01')).toThrow(/YYYY-MM-DD/)
  })
  it('requires an actual bound date and rejects malformed CSV',()=>{
    const csv=parseEvidenceCsv('Organization Name\nExample')
    expect(()=>makeBatch(csv,csv.map,'bound','fictional.csv','2026-01-01')).toThrow(/bound date/)
    expect(()=>parseEvidenceCsv('Name,State\nExample,ME,extra')).toThrow(/CSV error/)
  })
  it('explains every point and does not infer historical success without evidence',()=>{
    const r=emptyResearch(), baseline=scoreProspect(prospect,r)
    expect(baseline.total).toBe(55)
    r.batches=[{id:'bound',kind:'bound',filename:'fictional.csv',asOf:today,importedAt:today,rows:[{...row,boundDate:'2026-01-01'}]}]
    const scored=scoreProspect(prospect,r)
    expect(scored.total).toBe(100)
    expect(scored.factors.reduce((n,f)=>n+f.points,0)).toBe(scored.total)
    expect(industrySummary(r)[0]).toMatchObject({deals:1,premium:85000,knownPremiums:1})
  })
  it('detects similar names without merging and respects duplicate-review decisions',()=>{
    const other={...prospect,id:'other',name:'Harborlight Youth Service Inc.'}
    expect(nameSimilarity(prospect.name,other.name)).toBeGreaterThan(.72)
    const r=emptyResearch()
    expect(duplicatePairs([prospect,other],r)).toHaveLength(1)
    r.duplicates=[{left:prospect.id,right:other.id,decision:'different'}]
    expect(duplicatePairs([prospect,other],r)).toHaveLength(0)
  })
  it('round-trips research while retaining Phase 1 backup compatibility',()=>{
    const data={...sampleData,research:fixture()}
    expect(parseBackup(serializeBackup(data))).toEqual(data)
    expect(parseBackup(serializeBackup(sampleData))).toEqual(sampleData)
    expect(()=>parseBackup(JSON.stringify({data:{...data,research:{}}}))).toThrow(/Phase 2/)
  })
})
