import Papa from 'papaparse'
import type { Clearance, Prospect } from '../types'

export const prospectFields = ['name', 'city', 'state', 'industry', 'revenue', 'employees', 'crmUrl', 'notes'] as const
export type ProspectField = typeof prospectFields[number]
export type FieldMap = Partial<Record<ProspectField, string>>

export interface CsvPreview { headers: string[]; rows: Record<string, string>[]; suggestedMap: FieldMap }

const aliases: Record<ProspectField, string[]> = {
  name: ['organization', 'organization name', 'account', 'account name', 'company', 'name'],
  city: ['city', 'town'], state: ['state', 'province'], industry: ['industry', 'sector', 'class'],
  revenue: ['revenue', 'annual revenue', 'sales'], employees: ['employees', 'employee count', 'fte'],
  crmUrl: ['crm url', 'crm link', 'record link', 'caffeine link'], notes: ['notes', 'comments'],
}

export function parseProspectCsv(text: string): CsvPreview {
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim() })
  if (result.errors.length && !result.data.length) throw new Error(result.errors[0].message)
  const headers = result.meta.fields ?? []
  const suggestedMap: FieldMap = {}
  for (const field of prospectFields) {
    const match = headers.find(header => aliases[field].includes(header.trim().toLowerCase()))
    if (match) suggestedMap[field] = match
  }
  return { headers, rows: result.data.slice(0, 5000), suggestedMap }
}

const amount = (value = '') => Number(value.replace(/[$,\s]/g, '')) || 0
export const normalizeName = (value: string) => value.toLowerCase().replace(/\b(incorporated|inc|llc|corporation|corp|the)\b/g, '').replace(/[^a-z0-9]/g, '')

export function mappedProspects(rows: Record<string, string>[], map: FieldMap, existing: Prospect[]): Prospect[] {
  if (!map.name) throw new Error('Map an organization name before importing.')
  const known = new Set(existing.map(item => normalizeName(item.name)))
  return rows.filter(row => row[map.name!]?.trim()).map((row, index) => {
    const name = row[map.name!]!.trim()
    const duplicate = known.has(normalizeName(name))
    const clearance: Clearance = duplicate ? 'Needs Review' : 'Needs Review'
    return {
      id: `import-${Date.now()}-${index}`,
      name,
      city: map.city ? row[map.city]?.trim() ?? '' : '', state: map.state ? row[map.state]?.trim() ?? '' : '',
      industry: map.industry ? row[map.industry]?.trim() || 'Unclassified' : 'Unclassified',
      revenue: map.revenue ? amount(row[map.revenue]) : 0, employees: map.employees ? amount(row[map.employees]) : 0,
      crmUrl: map.crmUrl ? row[map.crmUrl]?.trim() : undefined, notes: map.notes ? row[map.notes]?.trim() : undefined,
      clearance, priority: false, updatedAt: new Date().toISOString().slice(0, 10),
      clearanceReason: duplicate ? 'Possible normalized-name duplicate; manual review required.' : 'Imported without sufficient CRM activity evidence; manual review required.',
    }
  })
}
