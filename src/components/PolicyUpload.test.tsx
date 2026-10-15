import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PolicyUpload } from './PolicyUpload'
vi.mock('../data/readPolicyPdf',()=>({readPolicyPdf:vi.fn(async(file:File)=>{
  if(file.name.endsWith('.zip'))throw Error('Unsupported')
  return {pages:['Cyber Insurance Policy Declarations. Commercial general liability exclusion.'],warnings:['Review exclusions.']}
})}))
afterEach(cleanup)
it('requires explicit selections, reports failed files, and does not apply on upload',async()=>{
  const apply=vi.fn();render(<PolicyUpload onApply={apply}/>)
  fireEvent.change(screen.getByLabelText('Policy PDFs'),{target:{files:[new File(['test'],'fictional.pdf'),new File(['zip'],'bundle.zip')]}})
  await waitFor(()=>expect(screen.getByRole('checkbox',{name:'Cyber'})).toBeInTheDocument())
  expect(screen.getByRole('checkbox',{name:'Cyber'})).not.toBeChecked()
  expect(screen.getByRole('checkbox',{name:'General Liability'})).not.toBeChecked()
  expect(screen.getByText(/bundle.zip: could not read/)).toBeInTheDocument()
  expect(apply).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('checkbox',{name:'Cyber'}))
  fireEvent.click(screen.getByRole('button',{name:'Add selected coverages and checklist items'}))
  expect(apply).toHaveBeenCalledExactlyOnceWith(['Cyber'])
})
