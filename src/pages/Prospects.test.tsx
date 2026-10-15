import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Prospects } from './Prospects'
import { sampleData } from '../sampleData'

afterEach(cleanup)
const fixture = () => ({...structuredClone(sampleData),prospects:[
  {...sampleData.prospects[0], id:'one', name:'Beta Foundation', revenue:90, employees:1000},
  {...sampleData.prospects[1], id:'two', name:'alpha Center', revenue:1000, employees:90},
  {...sampleData.prospects[2], id:'three', name:'Zulu Outreach', revenue:0, employees:0},
]})
const names = () => screen.getAllByRole('row').slice(1).map(row=>within(row).getAllByRole('cell')[1].querySelector('strong')!.textContent)

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
