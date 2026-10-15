import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from './backup'
import { sampleData } from '../sampleData'

describe('workspace backup', () => {
  it('round-trips workspace data', () => expect(parseBackup(serializeBackup(sampleData))).toEqual(sampleData))
  it('rejects unrelated JSON', () => expect(() => parseBackup('{"hello":"world"}')).toThrow(/not a Northstar/i))
})
