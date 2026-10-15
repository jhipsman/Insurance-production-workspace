import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DocumentChecklist, documentRequirement } from './DocumentChecklist'
import { sampleData } from '../sampleData'
afterEach(cleanup)
it('only offers document receipt requirements, never reviews or other exposures',()=>{
  expect(documentRequirement('Expiring policies','policy')).toBe(true)
  expect(documentRequirement('Review expiring policy declarations, limits and exclusions','policy')).toBe(false)
  expect(documentRequirement('Loss runs','policy')).toBe(false)
  expect(documentRequirement('Updated statement of values','sov')).toBe(true)
  const complete=vi.fn()
  render(<DocumentChecklist submission={{...sampleData.submissions[0],checklist:[{id:'policy',label:'Expiring policies',complete:false,required:true}]}} kind="policy" onComplete={complete}/>)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(complete).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByRole('button'))
  expect(complete).toHaveBeenCalledWith(['policy'])
})
