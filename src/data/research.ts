import Papa from 'papaparse'
import type { Clearance, Prospect } from '../types'
import { normalizeName } from './csv'

export interface EvidenceAccount {
  id: string
  name: string
  state: string
  industry: string
  revenue: number
  employees: number
  premium: number
  lastActivity: string
  recallUntil: string
  relationship: 'yes' | 'no' | 'unknown'
  restricted: 'yes' | 'no' | 'unknown'
  boundDate: string
}
export interface EvidenceBatch {
  id: string
  kind: 'crm' | 'bound'
  filename: string
  importedAt: string
  asOf: string
  rows: EvidenceAccount[]
}
export interface AgencyRules {
  recentDays: number
  freshDays: number
  territory: string[]
  preferredIndustries: string[]
  minRevenue: number
  maxRevenue: number
  minEmployees: number
  maxEmployees: number
}
export interface MatchReview { prospectId: string; recordId: string; decision: 'same' | 'different' }
export interface Research {
  batches: EvidenceBatch[]
  rules: AgencyRules
  matches: MatchReview[]
  duplicates: { left: string; right: string; decision: 'duplicate' | 'different' }[]
}
export const defaultRules: AgencyRules = {
  recentDays: 180, freshDays: 30, territory: ['ME', 'NY', 'CT', 'RI', 'VT', 'MA'],
  preferredIndustries: ['Youth Services', 'Behavioral Health', 'Developmental Services'],
  minRevenue: 1000000, maxRevenue: 20000000, minEmployees: 20, maxEmployees: 250,
}
export const emptyResearch = (): Research => ({ batches: [], rules: structuredClone(defaultRules), matches: [], duplicates: [] })
export const evidenceFields = ['name', 'state', 'industry', 'revenue', 'employees', 'premium', 'lastActivity', 'recallUntil', 'relationship', 'restricted', 'boundDate'] as const
export type EvidenceField = typeof evidenceFields[number]
export type EvidenceMap = Partial<Record<EvidenceField, string>>
export const fieldLabels: Record<EvidenceField, string> = {
  name: 'Organization name', state: 'State', industry: 'Industry', revenue: 'Annual revenue', employees: 'Employee count',
  premium: 'Bound premium', lastActivity: 'Last activity date', recallUntil: 'Recall through date',
  relationship: 'Existing relationship (yes/no)', restricted: 'Do not contact (yes/no)', boundDate: 'Bound date',
}
const aliases: Record<EvidenceField, string[]> = {
  name: ['name', 'organization', 'organization name', 'account', 'account name', 'company'],
  state: ['state'], industry: ['industry', 'sector'], revenue: ['revenue', 'annual revenue'],
  employees: ['employees', 'employee count'], premium: ['premium', 'bound premium'],
  lastActivity: ['last activity', 'last activity date', 'last contact'], recallUntil: ['recall until', 'recall through date'],
  relationship: ['existing relationship', 'relationship', 'client'], restricted: ['do not contact', 'restricted'],
  boundDate: ['bound date', 'date bound'],
}
export function parseEvidenceCsv(text: string) {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim() })
  const errors = parsed.errors.filter(e => e.code !== 'UndetectableDelimiter')
  if (errors.length) throw new Error(`CSV error: ${errors[0].message}`)
  const headers = parsed.meta.fields ?? []
  if (!parsed.data.length || parsed.data.length > 5000) throw new Error('Import between 1 and 5,000 rows per file.')
  const map: EvidenceMap = {}
  evidenceFields.forEach(f => { map[f] = headers.find(h => aliases[f].includes(h.toLowerCase())) })
  return { headers, rows: parsed.data, map }
}
export function dateValid(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
}
export function makeBatch(preview: ReturnType<typeof parseEvidenceCsv>, map: EvidenceMap, kind: EvidenceBatch['kind'], filename: string, asOf: string): EvidenceBatch {
  if (!map.name) throw new Error('Map the organization name.')
  if (!dateValid(asOf) || asOf > new Date().toISOString().slice(0, 10)) throw new Error('Choose a valid export date, no later than today.')
  if (kind === 'bound' && !map.boundDate) throw new Error('Map the bound date. Import only successful bound deals.')
  const id = crypto.randomUUID()
  const rows = preview.rows.map((row, index): EvidenceAccount => {
    const read = (f: EvidenceField) => (row[map[f] ?? ''] ?? '').trim()
    const fail = (message: string): never => { throw new Error(`Row ${index + 2}: ${message}`) }
    const numeric = (f: EvidenceField) => { const value = read(f); if (!value) return 0; const n = Number(value.replace(/[$,\s]/g, '')); if (!Number.isFinite(n) || n < 0) return fail(`${fieldLabels[f]} must be a nonnegative number.`); return n }
    const date = (f: EvidenceField) => { const v = read(f); if (v && !dateValid(v)) return fail(`${fieldLabels[f]} must use YYYY-MM-DD.`); return v }
    const flag = (f: EvidenceField): EvidenceAccount['relationship'] => { const v = read(f).toLowerCase(); if (['yes','true','1'].includes(v)) return 'yes'; if (['no','false','0'].includes(v)) return 'no'; return 'unknown' }
    if (!read('name') || !normalizeName(read('name'))) fail('Organization name is missing or invalid.')
    const boundDate = date('boundDate'), lastActivity = date('lastActivity')
    if (kind === 'bound' && (!boundDate || boundDate > asOf)) fail('A bound date on or before the export date is required.')
    if (lastActivity > asOf) fail('Last activity cannot be after the export date.')
    return { id: `${id}:${index}`, name: read('name'), state: read('state').toUpperCase(), industry: read('industry'), revenue: numeric('revenue'), employees: numeric('employees'), premium: numeric('premium'), lastActivity, recallUntil: date('recallUntil'), relationship: flag('relationship'), restricted: flag('restricted'), boundDate }
  })
  return { id, kind, filename, asOf, importedAt: new Date().toISOString(), rows }
}

// Candidate generation is deliberately conservative. A candidate is not a confirmed identity.
export function nameSimilarity(a: string, b: string): number {
  const x = normalizeName(a), y = normalizeName(b)
  if (!x || !y) return 0
  if (x === y) return 1
  const pairs = (s: string) => new Set(Array.from({ length: Math.max(s.length - 1, 0) }, (_, i) => s.slice(i, i + 2)))
  const p = pairs(x), q = pairs(y)
  return p.size + q.size ? 2 * [...p].filter(v => q.has(v)).length / (p.size + q.size) : 0
}
export function crmCandidates(p: Prospect, research: Research) {
  return research.batches.filter(b => b.kind === 'crm').flatMap(batch => batch.rows.map(record => ({ batch, record })))
    .filter(({ record }) => nameSimilarity(p.name, record.name) >= .72)
}
const age = (date: string, today: string) => (Date.parse(today) - Date.parse(date)) / 86400000
export function assessContact(p: Prospect, research: Research, today = new Date().toISOString().slice(0, 10)): { status: Clearance; reasons: string[] } {
  if (p.clearance === 'Restricted') return { status: 'Restricted', reasons: [`Existing account restriction retained: ${p.clearanceReason}`] }
  const candidates = crmCandidates(p, research).filter(({ record }) => !research.matches.some(m => m.prospectId === p.id && m.recordId === record.id && m.decision === 'different'))
  const reasons: string[] = []
  let restricted = false
  for (const { record, batch } of candidates) {
    const confirmed = research.matches.some(m => m.prospectId === p.id && m.recordId === record.id && m.decision === 'same')
    const source = `${record.name} (${batch.filename}, ${batch.asOf})`
    if (!confirmed) { reasons.push(`Confirm possible CRM match: ${source}`); continue }
    if (record.restricted === 'yes' || record.relationship === 'yes' || (record.recallUntil && record.recallUntil >= today) || (record.lastActivity && age(record.lastActivity, today) <= research.rules.recentDays)) {
      restricted = true
      reasons.push(`Contact restricted by relationship, do-not-contact, recall, or recent activity: ${source}`)
    }
    if (age(batch.asOf, today) > research.rules.freshDays || age(batch.asOf, today) < 0) reasons.push(`Export is stale or future-dated: ${source}`)
    if (!record.lastActivity || record.relationship === 'unknown' || record.restricted === 'unknown') reasons.push(`Missing activity or relationship/restriction evidence: ${source}`)
  }
  if (restricted) return { status: 'Restricted', reasons }
  if (!candidates.length) reasons.push('No confirmed CRM evidence. A missing match does not establish availability.')
  if (reasons.length) return { status: 'Needs Review', reasons }
  return { status: 'Cleared', reasons: ['Confirmed CRM matches meet the current agency rules. Recheck before contacting.'] }
}
export function scoreProspect(p: Prospect, research: Research) {
  const rules = research.rules
  const history = research.batches.filter(b => b.kind === 'bound').flatMap(b => b.rows)
  const sameIndustry = history.filter(a => a.industry && a.industry.toLowerCase() === p.industry.toLowerCase())
  const range = (n: number, low: number, high: number) => n > 0 && n >= low && n <= high
  const ratio = (a: number, b: number) => a > 0 && b > 0 && Math.min(a,b)/Math.max(a,b) >= .5
  const similar = sameIndustry.filter(a => ratio(p.revenue,a.revenue) || ratio(p.employees,a.employees))
  const factors = [
    { label: 'Successful accounts in the same industry', points: sameIndustry.length ? 25 : 0, maximum: 25, detail: `${sameIndustry.length} imported bound deals; no inferred success rate` },
    { label: 'Similar size to successful accounts', points: similar.length ? 20 : 0, maximum: 20, detail: similar.length ? similar.slice(0,3).map(a => a.name).join(', ') : 'No same-industry account with revenue or employees within 2×' },
    { label: 'Preferred industry', points: rules.preferredIndustries.some(i => i.toLowerCase() === p.industry.toLowerCase()) ? 20 : 0, maximum: 20, detail: p.industry || 'Industry unavailable' },
    { label: 'Revenue fit', points: range(p.revenue,rules.minRevenue,rules.maxRevenue) ? 15 : 0, maximum: 15, detail: p.revenue ? `Reported revenue: $${p.revenue.toLocaleString()}` : 'Revenue unavailable' },
    { label: 'Employee fit', points: range(p.employees,rules.minEmployees,rules.maxEmployees) ? 10 : 0, maximum: 10, detail: p.employees ? `${p.employees} employees` : 'Employee count unavailable' },
    { label: 'Territory fit', points: rules.territory.includes(p.state.toUpperCase()) ? 10 : 0, maximum: 10, detail: p.state || 'State unavailable' },
  ]
  return { total: factors.reduce((s,f) => s + f.points, 0), factors }
}
export function industrySummary(research: Research) {
  const groups = new Map<string, { industry: string; deals: number; premium: number; knownPremiums: number }>()
  for (const row of research.batches.filter(b => b.kind === 'bound').flatMap(b => b.rows)) {
    const industry = row.industry || 'Unclassified', key = industry.toLowerCase()
    const group = groups.get(key) ?? { industry, deals: 0, premium: 0, knownPremiums: 0 }
    group.deals++; group.premium += row.premium; if (row.premium > 0) group.knownPremiums++
    groups.set(key, group)
  }
  return [...groups.values()].sort((a,b) => b.deals - a.deals)
}

export function appendEvidence(research: Research, batch: EvidenceBatch): Research {
  const content = (b: EvidenceBatch) => JSON.stringify(b.rows.map(({id: _id,...r})=>r))
  if (research.batches.some(b=>b.kind===batch.kind && b.asOf===batch.asOf && content(b)===content(batch))) throw new Error('This export has already been imported.')
  if (batch.kind==='bound') {
    const key = (r: EvidenceAccount) => `${normalizeName(r.name)}|${r.state.toUpperCase()}|${r.boundDate}`
    const known=new Set(research.batches.filter(b=>b.kind==='bound').flatMap(b=>b.rows.map(key)))
    for (const row of batch.rows) {
      if (known.has(key(row))) throw new Error(`Overlapping bound deal: ${row.name} on ${row.boundDate}. Use one aggregate row per organization, state, and bound date; remove an older overlapping source before importing its replacement.`)
      known.add(key(row))
    }
  }
  return {...research,batches:[...research.batches,batch]}
}

// Backups may come from older releases; absent Phase 2 data is valid, malformed data is not.
export function validateResearch(value: unknown): asserts value is Research {
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
  const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')
  const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0
  const invalid = () => { throw new Error('The backup contains invalid Phase 2 research data.') }
  if (!object(value) || !object(value.rules) || !Array.isArray(value.batches) || !Array.isArray(value.matches) || !Array.isArray(value.duplicates)) return invalid()
  const rules=value.rules
  if (!strings(rules.territory) || !strings(rules.preferredIndustries) || !['recentDays','freshDays','minRevenue','maxRevenue','minEmployees','maxEmployees'].every(k=>number(rules[k]))) return invalid()
  if (Number(rules.minRevenue)>Number(rules.maxRevenue)||Number(rules.minEmployees)>Number(rules.maxEmployees)) return invalid()
  const ids = new Set<string>()
  for (const b of value.batches) {
    if (!object(b) || !['crm','bound'].includes(String(b.kind)) || typeof b.id!=='string' || typeof b.filename!=='string' || typeof b.importedAt!=='string' || typeof b.asOf!=='string' || !dateValid(b.asOf) || !Array.isArray(b.rows)) return invalid()
    for (const row of b.rows) {
      if (!object(row) || !['id','name','state','industry','lastActivity','recallUntil','boundDate'].every(k=>typeof row[k]==='string') || !['revenue','employees','premium'].every(k=>number(row[k])) || !['yes','no','unknown'].includes(String(row.relationship)) || !['yes','no','unknown'].includes(String(row.restricted))) return invalid()
      if (!normalizeName(String(row.name)) || ids.has(String(row.id))) return invalid()
      for (const k of ['lastActivity','recallUntil','boundDate']) if (row[k] && !dateValid(String(row[k]))) return invalid()
      if (String(row.lastActivity)>b.asOf || (b.kind==='bound' && (!row.boundDate || String(row.boundDate)>b.asOf))) return invalid()
      ids.add(String(row.id))
    }
  }
  for (const m of value.matches) if (!object(m) || typeof m.prospectId!=='string' || typeof m.recordId!=='string' || !ids.has(m.recordId) || !['same','different'].includes(String(m.decision))) return invalid()
  for (const d of value.duplicates) if (!object(d) || typeof d.left!=='string' || typeof d.right!=='string' || !['duplicate','different'].includes(String(d.decision))) return invalid()
}
export function duplicatePairs(prospects: Prospect[], research: Research) {
  const pairs: { left: Prospect; right: Prospect; similarity: number }[] = []
  for (let i=0; i<prospects.length; i++) for (let j=i+1; j<prospects.length; j++) {
    const left=prospects[i], right=prospects[j], similarity=nameSimilarity(left.name,right.name)
    if (similarity >= .72 && !research.duplicates.some(d => d.left===left.id && d.right===right.id || d.left===right.id && d.right===left.id)) pairs.push({left,right,similarity})
  }
  return pairs
}
