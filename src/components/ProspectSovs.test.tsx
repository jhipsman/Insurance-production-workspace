import { useState } from 'react'
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ProspectSovs } from './ProspectSovs'
import { sampleData } from '../sampleData'
import { parseBackup, serializeBackup } from '../data/backup'
import type { WorkspaceData } from '../types'
afterEach(cleanup)
function Harness(){
  const [data,setData]=useState<WorkspaceData>(()=>({...structuredClone(sampleData),submissions:[{...structuredClone(sampleData.submissions[1]),checklist:[{id:'sov',label:'Updated statement of values',complete:false,required:true},{id:'loss',label:'Loss runs',complete:false,required:true}]}]}))
  return <><ProspectSovs prospect={data.prospects[0]} submissions={data.submissions} setData={setData}/><output data-testid="data">{JSON.stringify(data)}</output></>
}
const saved=():WorkspaceData=>JSON.parse(screen.getByTestId('data').textContent!)
it('attaches a file, round-trips bytes in backup, requires explicit checklist confirmation, and confirms removal',async()=>{
  render(<Harness/>);const before=saved()
  fireEvent.change(screen.getByLabelText('Upload SOV'),{target:{files:[new File(['Location,Value\nFictional,123'],'fictional.csv')]}})
  await screen.findByRole('button',{name:'Download fictional.csv'})
  const backup=parseBackup(serializeBackup(saved()))
  expect(atob(backup.prospects[0].sovs![0].base64)).toBe('Location,Value\nFictional,123')
  expect(backup.submissions).toEqual(before.submissions)
  expect(backup.prospects[1]).toEqual(before.prospects[1])
  fireEvent.click(screen.getByRole('checkbox',{name:/I reviewed the files/}))
  fireEvent.click(screen.getByRole('button',{name:'Mark confirmed requirements complete'}))
  expect(saved().submissions[0].checklist.map(i=>i.complete)).toEqual([true,false])
  fireEvent.click(screen.getByRole('button',{name:'Remove fictional.csv'}))
  fireEvent.click(screen.getByRole('button',{name:'Keep SOV'}))
  expect(saved().prospects[0].sovs).toHaveLength(1)
  fireEvent.click(screen.getByRole('button',{name:'Remove fictional.csv'}))
  fireEvent.click(screen.getByRole('button',{name:'Confirm remove SOV'}))
  expect(saved().prospects[0].sovs).toEqual([])
})
it('rejects unsupported attachments without changing data',async()=>{
  render(<Harness/>);const before=saved()
  fireEvent.change(screen.getByLabelText('Upload SOV'),{target:{files:[new File(['bad'],'run.html')]}})
  await waitFor(()=>expect(screen.getByText('Choose an XLSX, XLS, CSV, or PDF SOV.')).toBeInTheDocument())
  expect(saved()).toEqual(before)
})
