import { useState } from 'react'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ProspectResearch } from './ProspectResearch'
import { emptyResearch, type Research } from '../data/research'
import { sampleData } from '../sampleData'
import type { WorkspaceData } from '../types'

afterEach(cleanup)
function Harness({research}:{research:Research}) {
  const [data,setData]=useState<WorkspaceData>({...structuredClone(sampleData),prospects:[structuredClone(sampleData.prospects[0])],research})
  return <ProspectResearch data={data} setData={setData}/>
}
it('updates the visible contact decision after reviewed identity confirmation and supports undo',()=>{
  const research=emptyResearch(),today=new Date().toISOString().slice(0,10)
  research.batches=[{id:'batch',kind:'crm',filename:'fictional.csv',asOf:today,importedAt:today,rows:[{id:'row',name:sampleData.prospects[0].name,state:'ME',industry:'Youth Services',revenue:0,employees:0,premium:0,boundDate:'',lastActivity:'2020-01-01',recallUntil:'',relationship:'no',restricted:'no'}]}]
  render(<Harness research={research}/>)
  expect(screen.getByText('Needs Review',{selector:'.badge'})).toBeInTheDocument()
  fireEvent.click(screen.getByText('Review score & matches'))
  fireEvent.click(screen.getByText('Confirm same organization'))
  expect(screen.getByText('Contact status: Cleared')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Undo'))
  expect(screen.getByText('Contact status: Needs Review')).toBeInTheDocument()
})
it('saves agency rules and immediately recalculates scores',()=>{
  render(<Harness research={emptyResearch()}/>)
  expect(screen.getByText('55/100')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Agency rules'))
  fireEvent.change(screen.getByLabelText('Territory states (comma-separated)'),{target:{value:'CA'}})
  fireEvent.click(screen.getByText('Save rules & recalculate'))
  expect(screen.getByText('45/100')).toBeInTheDocument()
})
