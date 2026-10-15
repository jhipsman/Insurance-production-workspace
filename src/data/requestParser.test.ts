import { describe, expect, it } from 'vitest'
import { suggestedRequestLines } from './requestParser'

describe('placement request parser', () => {
  it('suggests reviewable items from a simple carrier message', () => {
    const items = suggestedRequestLines('Please provide the completed supplemental application; updated payroll; confirmation of employee screening procedures.')
    expect(items).toHaveLength(3)
    expect(items[0]).toMatch(/supplemental application/i)
  })
})
