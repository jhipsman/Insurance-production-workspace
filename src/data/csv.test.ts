import { describe, expect, it } from 'vitest'
import { mappedProspects, normalizeName, parseProspectCsv } from './csv'

describe('prospect CSV import', () => {
  it('detects common columns and maps numeric values', () => {
    const preview = parseProspectCsv('Organization Name,City,State,Annual Revenue,Employee Count\nHope Center,Boston,MA,"$1,200,000",24')
    expect(preview.suggestedMap.name).toBe('Organization Name')
    const [prospect] = mappedProspects(preview.rows, preview.suggestedMap, [])
    expect(prospect).toMatchObject({ name: 'Hope Center', revenue: 1200000, employees: 24, clearance: 'Needs Review' })
  })
  it('normalizes common legal suffixes for duplicate review', () => {
    expect(normalizeName('The Hope Center, Inc.')).toBe(normalizeName('Hope Center'))
  })
  it('requires an organization-name mapping', () => {
    expect(() => mappedProspects([{ City: 'Boston' }], { city: 'City' }, [])).toThrow(/organization name/i)
  })
})
