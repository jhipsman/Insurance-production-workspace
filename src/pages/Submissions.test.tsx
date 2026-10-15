import { useState } from 'react'
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Submissions } from './Submissions'
import { sampleData } from '../sampleData'
import { parseBackup, serializeBackup } from '../data/backup'
import type { WorkspaceData } from '../types'

afterEach(cleanup)
function Harness() {
  const [data,setData]=useState<WorkspaceData>(structuredClone(sampleData))
  return <><Submissions data={data} setData={setData}/><output data-testid="workspace">{JSON.stringify(data)}</output></>
}
const saved=():WorkspaceData=>JSON.parse(screen.getByTestId('workspace').textContent!)
const open=()=>fireEvent.click(screen.getByRole('button',{name:/Harborlight Youth Services/}))

it('adds and removes submission coverages, retains edits when reopened, and backs them up',()=>{
  render(<Harness/>);open()
  expect(screen.getByRole('checkbox',{name:'Commercial Auto',exact:true})).toBeChecked()
  fireEvent.click(screen.getByRole('checkbox',{name:'Cyber',exact:true}))
  fireEvent.click(screen.getByRole('checkbox',{name:'Commercial Auto',exact:true}))
  fireEvent.click(screen.getByRole('button',{name:'Close'}));open()
  expect(screen.getByRole('checkbox',{name:'Cyber',exact:true})).toBeChecked()
  expect(screen.getByRole('checkbox',{name:'Commercial Auto',exact:true})).not.toBeChecked()
  const data=parseBackup(serializeBackup(saved()))
  expect(data.submissions.find(s=>s.id==='s2')?.coverages).toEqual(['General Liability','Umbrella','Cyber'])
  expect(data.submissions.find(s=>s.id==='s2')?.checklist).toEqual(sampleData.submissions.find(s=>s.id==='s2')?.checklist)
  expect(data.submissions.find(s=>s.id==='s1')).toEqual(sampleData.submissions.find(s=>s.id==='s1'))
})

it('supports custom coverage lines and blocks case-insensitive duplicates',()=>{
  render(<Harness/>);open()
  const input=screen.getByLabelText('Other coverage')
  fireEvent.change(input,{target:{value:'Fictional Specialized Coverage'}})
  fireEvent.click(screen.getByRole('button',{name:'Add coverage'}))
  expect(screen.getByRole('checkbox',{name:'Fictional Specialized Coverage'})).toBeChecked()
  fireEvent.change(input,{target:{value:'fictional specialized coverage'}})
  fireEvent.click(screen.getByRole('button',{name:'Add coverage'}))
  expect(screen.getByRole('alert')).toHaveTextContent('already selected')
  expect(saved().submissions.find(s=>s.id==='s2')?.coverages.filter(c=>c.toLowerCase()==='fictional specialized coverage')).toHaveLength(1)
  fireEvent.click(screen.getByRole('checkbox',{name:'Fictional Specialized Coverage'}))
  expect(saved().submissions.find(s=>s.id==='s2')?.coverages).not.toContain('Fictional Specialized Coverage')
})
