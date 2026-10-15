import { expect, it } from 'vitest'
import { removeDemoSubmissions } from './removeDemoSubmissions'
import { sampleData } from '../sampleData'
import { parseBackup, serializeBackup } from './backup'

it('removes known fictional submissions and their placement items while preserving user accounts',()=>{
  const retained={...structuredClone(sampleData.submissions[0]),id:'retained',accountName:'Fictional Retained Organization'}
  const request={...structuredClone(sampleData.placementRequests[0]),id:'retained-request',submissionId:retained.id,accountName:retained.accountName}
  const input={...structuredClone(sampleData),submissions:[...structuredClone(sampleData.submissions),retained],placementRequests:[...structuredClone(sampleData.placementRequests),request]}
  const cleaned=removeDemoSubmissions(input)
  expect(cleaned.submissions).toEqual([retained])
  expect(cleaned.placementRequests).toEqual([request])
  expect(cleaned.prospects).toEqual(input.prospects)
  expect(input.submissions).toHaveLength(4)
  expect(cleaned.demoSubmissionCleanup?.submissions).toHaveLength(3)
  expect(parseBackup(serializeBackup(cleaned)).demoSubmissionCleanup).toEqual(cleaned.demoSubmissionCleanup)
})

it('preserves a renamed account even if it uses a sample ID',()=>{
  const retained={...structuredClone(sampleData.submissions[0]),accountName:'Fictional Retained Organization'}
  const cleaned=removeDemoSubmissions({...structuredClone(sampleData),submissions:[retained]})
  expect(cleaned.submissions).toEqual([retained])
  expect(cleaned.placementRequests).toEqual(sampleData.placementRequests)
})

it('is idempotent and leaves other manually entered accounts intact',()=>{
  const other={...structuredClone(sampleData.submissions[0]),id:'other',accountName:'Another fictional test account'}
  const cleaned=removeDemoSubmissions({...structuredClone(sampleData),submissions:[other]})
  expect(cleaned.submissions).toEqual([other])
  expect(removeDemoSubmissions(cleaned)).toBe(cleaned)
})
