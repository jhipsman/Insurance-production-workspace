import { useState } from 'react'
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { AccountPanel } from './AccountPanel'
import { Placement } from '../pages/Placement'
import { sampleData } from '../sampleData'
import type { WorkspaceData } from '../types'

afterEach(cleanup)
function Harness() {
  const [data,setData]=useState<WorkspaceData>(structuredClone(sampleData)),[open,setOpen]=useState(true)
  return <>{open?<AccountPanel target={{submissionId:'s2',tab:'details'}} data={data} setData={setData} onClose={()=>setOpen(false)}/>:<Placement data={data} setData={setData} onOpen={()=>setOpen(true)}/>}<output data-testid="snapshot">{JSON.stringify(data)}</output></>
}

it('keeps an unsaved account draft while navigating tabs, then saves to the linked account and submission',()=>{
  render(<Harness/>)
  fireEvent.change(screen.getByLabelText('Contact name'),{target:{value:'Fictional Contact'}})
  fireEvent.click(screen.getByRole('button',{name:'Submission'}))
  fireEvent.click(screen.getByRole('checkbox',{name:'Cyber'}))
  fireEvent.click(screen.getByRole('button',{name:'Account details'}))
  expect(screen.getByLabelText('Contact name')).toHaveValue('Fictional Contact')
  fireEvent.click(screen.getByRole('button',{name:'Save account'}))
  const saved:WorkspaceData=JSON.parse(screen.getByTestId('snapshot').textContent!)
  expect(saved.prospects.find(p=>p.id==='p1')?.contactName).toBe('Fictional Contact')
  expect(saved.submissions.find(s=>s.id==='s2')?.coverages).toContain('Cyber')
})

it('adds requests inside an account and completes the same record from the outstanding queue',()=>{
  render(<Harness/>)
  fireEvent.click(screen.getByRole('button',{name:'Carrier requests'}))
  fireEvent.click(screen.getByRole('button',{name:'Add requests'}))
  fireEvent.change(screen.getByLabelText('Carrier'),{target:{value:'Fictional Carrier'}})
  fireEvent.click(screen.getByRole('button',{name:'Add an item manually'}))
  fireEvent.change(screen.getByLabelText('Request item 1'),{target:{value:'Confirm fictional building updates'}})
  fireEvent.click(screen.getByRole('button',{name:'Save requests'}))
  expect(screen.getByDisplayValue('Confirm fictional building updates')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Close'}))
  const description=screen.getByDisplayValue('Confirm fictional building updates')
  const row=description.closest('.carrier-request') as HTMLElement
  fireEvent.click(within(row).getByRole('checkbox',{name:'Complete request'}))
  expect(screen.queryByDisplayValue('Confirm fictional building updates')).not.toBeInTheDocument()
  const saved:WorkspaceData=JSON.parse(screen.getByTestId('snapshot').textContent!)
  expect(saved.placementRequests.find(r=>r.description==='Confirm fictional building updates')).toMatchObject({submissionId:'s2',status:'Complete'})
})
