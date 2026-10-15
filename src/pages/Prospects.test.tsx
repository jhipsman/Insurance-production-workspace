import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Prospects } from './Prospects'
import { sampleData } from '../sampleData'
import { useState } from 'react'
import type { WorkspaceData } from '../types'
import { emptyResearch } from '../data/research'
import { serializeBackup, parseBackup } from '../data/backup'

afterEach(cleanup)
const fixture = () => ({...structuredClone(sampleData),prospects:[
  {...sampleData.prospects[0], id:'one', name:'Beta Foundation', revenue:90, employees:1000},
  {...sampleData.prospects[1], id:'two', name:'alpha Center', revenue:1000, employees:90},
  {...sampleData.prospects[2], id:'three', name:'Zulu Outreach', revenue:0, employees:0},
]})
const names = () => screen.getAllByRole('row').slice(1).map(row=>within(row).getAllByRole('cell')[1].querySelector('strong')!.textContent)
function EditorHarness({ initial=fixture(), submit=vi.fn() }: {initial?:WorkspaceData;submit?:()=>void}) {
  const [data,setData]=useState<WorkspaceData>(initial)
  return <><Prospects data={data} setData={setData} createSubmission={submit}/><output data-testid="workspace">{JSON.stringify(data)}</output></>
}
const savedData=():WorkspaceData=>JSON.parse(screen.getByTestId('workspace').textContent!)

it('edits an account without starting a submission and includes the details in backups',()=>{
  const submit=vi.fn()
  render(<EditorHarness submit={submit}/>)
  fireEvent.click(screen.getByRole('button',{name:'Beta Foundation'}))
  fireEvent.change(screen.getByLabelText('Contact name'),{target:{value:'Fictional Contact'}})
  fireEvent.change(screen.getByLabelText('Contact email'),{target:{value:'fictional@example.invalid'}})
  fireEvent.change(screen.getByLabelText('Important notes'),{target:{value:'Confirm residential operations.'}})
  fireEvent.change(screen.getByLabelText('Annual revenue ($)'),{target:{value:'2500000'}})
  fireEvent.change(screen.getByLabelText('Next follow-up'),{target:{value:'2026-11-15'}})
  fireEvent.click(screen.getByRole('button',{name:'Save account'}))
  expect(within(screen.getByRole('dialog')).getByRole('status')).toHaveTextContent('Account saved')
  fireEvent.click(screen.getByRole('button',{name:'Close'}))
  expect(submit).not.toHaveBeenCalled()
  expect(savedData().submissions).toEqual(fixture().submissions)
  const restored=parseBackup(serializeBackup(savedData()))
  expect(restored.prospects.find(p=>p.id==='one')).toMatchObject({contactName:'Fictional Contact',contactEmail:'fictional@example.invalid',revenue:2500000,followUpDate:'2026-11-15',notes:'Confirm residential operations.'})
  fireEvent.click(screen.getByRole('button',{name:'Edit Beta Foundation'}))
  expect(screen.getByLabelText('Contact name')).toHaveValue('Fictional Contact')
})

it('discards canceled changes and creates a manually entered prospect in Needs Review',()=>{
  render(<EditorHarness/>)
  fireEvent.click(screen.getByRole('button',{name:'Edit Beta Foundation'}))
  fireEvent.change(screen.getByLabelText('Organization name'),{target:{value:'Discard me'}})
  fireEvent.click(screen.getByRole('button',{name:'Cancel'}))
  expect(savedData().prospects[0].name).toBe('Beta Foundation')
  fireEvent.click(screen.getByRole('button',{name:'Add prospect'}))
  fireEvent.change(screen.getByLabelText('Organization name'),{target:{value:'Fictional Elm Outreach'}})
  fireEvent.change(screen.getByLabelText('State / province'),{target:{value:'me'}})
  fireEvent.click(screen.getByRole('button',{name:'Save prospect'}))
  expect(savedData().prospects).toHaveLength(4)
  expect(savedData().prospects[0]).toMatchObject({name:'Fictional Elm Outreach',state:'ME',clearance:'Needs Review',revenue:0,employees:0})
})

it('invalidates prior identity decisions after a name change and preserves existing restrictions',()=>{
  const initial:WorkspaceData=fixture()
  initial.research={...emptyResearch(),matches:[{prospectId:'three',recordId:'old-crm-id',decision:'same'}],duplicates:[{left:'three',right:'one',decision:'different'}]}
  render(<EditorHarness initial={initial}/>)
  fireEvent.click(screen.getByRole('button',{name:'Edit Zulu Outreach'}))
  fireEvent.change(screen.getByLabelText('Organization name'),{target:{value:'Fictional Zulu Outreach Updated'}})
  fireEvent.click(screen.getByRole('button',{name:'Save account'}))
  expect(savedData().research?.matches).toEqual([])
  expect(savedData().research?.duplicates).toEqual([])
  expect(savedData().prospects.find(p=>p.id==='three')?.clearance).toBe('Restricted')
})

it('rejects executable CRM links before saving',()=>{
  render(<EditorHarness/>)
  fireEvent.click(screen.getByRole('button',{name:'Edit Beta Foundation'}))
  fireEvent.change(screen.getByLabelText('CRM record link'),{target:{value:'javascript:alert(1)'}})
  fireEvent.click(screen.getByRole('button',{name:'Save account'}))
  expect(screen.getByRole('alert')).toHaveTextContent('CRM link must start with https:// or http://.')
  expect(savedData().prospects[0].crmUrl).toBe(fixture().prospects[0].crmUrl)
})

it('toggles account names A–Z and Z–A and sorts numeric values numerically with unknowns last',()=>{
  const data=fixture(),original=data.prospects.map(p=>p.id)
  render(<Prospects data={data} setData={vi.fn()} createSubmission={vi.fn()}/>)
  expect(names()).toEqual(['alpha Center','Beta Foundation','Zulu Outreach'])
  fireEvent.click(screen.getByRole('button',{name:'Organization'}))
  expect(names()).toEqual(['Zulu Outreach','Beta Foundation','alpha Center'])
  expect(screen.getByRole('columnheader',{name:'Organization'})).toHaveAttribute('aria-sort','descending')
  fireEvent.click(screen.getByRole('button',{name:'Revenue'}))
  expect(names()).toEqual(['Beta Foundation','alpha Center','Zulu Outreach'])
  fireEvent.click(screen.getByRole('button',{name:'Revenue'}))
  expect(names()).toEqual(['alpha Center','Beta Foundation','Zulu Outreach'])
  fireEvent.click(screen.getByRole('button',{name:'Employees'}))
  expect(names()).toEqual(['alpha Center','Beta Foundation','Zulu Outreach'])
  expect(data.prospects.map(p=>p.id)).toEqual(original)
})

it('retains the selected sort when search filters the rows and exposes sorting on each data column',()=>{
  render(<Prospects data={fixture()} setData={vi.fn()} createSubmission={vi.fn()}/>)
  for(const label of ['Priority','Organization','Industry','Location','Revenue','Employees','Availability']) {
    const button=within(screen.getByRole('columnheader',{name:label})).getByRole('button')
    fireEvent.click(button)
    expect(button.closest('th')).toHaveAttribute('aria-sort','ascending')
  }
  fireEvent.click(screen.getByRole('button',{name:'Revenue'}))
  fireEvent.click(screen.getByRole('button',{name:'Revenue'}))
  fireEvent.change(screen.getByPlaceholderText('Search organizations, cities, industries…'),{target:{value:'Center'}})
  expect(names()).toEqual(['alpha Center'])
  fireEvent.change(screen.getByPlaceholderText('Search organizations, cities, industries…'),{target:{value:''}})
  expect(names()).toEqual(['alpha Center','Beta Foundation','Zulu Outreach'])
})
