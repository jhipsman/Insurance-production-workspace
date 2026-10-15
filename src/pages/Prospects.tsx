import { useMemo, useRef, useState } from 'react'
import { mappedProspects, parseProspectCsv, prospectFields, type CsvPreview, type FieldMap } from '../data/csv'
import type { Prospect, WorkspaceData } from '../types'
import { Badge, Icon, Modal } from '../components/UI'
import { ProspectResearch } from './ProspectResearch'
import { assessContact, emptyResearch } from '../data/research'
import { SortableHeader, useTableSort } from '../components/SortableHeader'

const money = (value: number) => value ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value) : '—'
const columns = [
  ['priority', 'Priority'], ['name', 'Organization'], ['industry', 'Industry'],
  ['location', 'Location'], ['revenue', 'Revenue'], ['employees', 'Employees'], ['clearance', 'Availability'],
] as const
type SortKey = typeof columns[number][0]

export function Prospects({ data, setData, createSubmission }: { data: WorkspaceData; setData: React.Dispatch<React.SetStateAction<WorkspaceData>>; createSubmission: (p: Prospect) => void }) {
  const [view, setView] = useState('Prospect list')
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('All'); const [preview, setPreview] = useState<CsvPreview>(); const [map, setMap] = useState<FieldMap>({}); const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const sorting = useTableSort<Prospect, SortKey>('name', (p, key) => {
    if (key === 'location') return [p.city, p.state].filter(Boolean).join(', ')
    if (key === 'revenue' || key === 'employees') return p[key] || null
    return p[key]
  })
  const filtered = useMemo(() => data.prospects.map(p => {
    const contact = assessContact(p, data.research ?? emptyResearch())
    return {...p, clearance:contact.status, clearanceReason:contact.reasons.join(' ')}
  }).filter(p => (filter === 'All' || p.clearance === filter || (filter === 'Priority' && p.priority)) && `${p.name} ${p.city} ${p.industry}`.toLowerCase().includes(search.toLowerCase())), [data.prospects, data.research, filter, search])
  const update = (id: string, changes: Partial<Prospect>) => setData(d => ({ ...d, prospects: d.prospects.map(p => p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString().slice(0,10) } : p) }))
  async function chooseFile(file?: File) { if (!file) return; try { const result = parseProspectCsv(await file.text()); setPreview(result); setMap(result.suggestedMap) } catch (e) { setNotice(e instanceof Error ? e.message : 'Unable to read this CSV.') } }
  function importRows() { if (!preview) return; try { const added = mappedProspects(preview.rows, map, data.prospects); setData(d => ({ ...d, prospects: [...added, ...d.prospects] })); setPreview(undefined); setNotice(`${added.length} prospects imported for manual review.`) } catch (e) { setNotice(e instanceof Error ? e.message : 'Import failed.') } }
  return <div className="page"><div className="page-title"><div><span className="eyebrow">Prospecting</span><h1>Prospecting Desk</h1><p>Prioritize opportunities while respecting relationship and activity restrictions.</p></div><button className="btn primary" onClick={() => fileRef.current?.click()}><Icon name="upload"/> Import CSV</button><input hidden ref={fileRef} type="file" accept=".csv,text/csv" onChange={e => chooseFile(e.target.files?.[0])}/></div>
    <div className="research-view-tabs">{['Prospect list','Research & screening'].map(v=><button className={`btn ${view===v?'primary':''}`} key={v} onClick={()=>setView(v)}>{v}</button>)}</div>
    <div className="guardrail"><strong>Availability guardrail</strong><span>Missing CRM activity is never treated as permission to contact. Review imported evidence and identity matches under Research & screening.</span></div>
    {view==='Research & screening' && <ProspectResearch data={data} setData={setData}/>}
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    {view==='Prospect list' && <section className="panel table-panel"><div className="table-tools"><label className="search"><Icon name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search organizations, cities, industries…"/></label><div className="filter-tabs">{['All','Priority','Cleared','Needs Review','Restricted'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
      <div className="table-wrap"><table><thead><tr>{columns.map(([key,label])=><SortableHeader key={key} label={label} {...sorting.headerProps(key)}/>)}<th>Actions</th></tr></thead><tbody>{sorting.sortRows(filtered).map(p=><tr key={p.id}><td><button className={`star ${p.priority?'selected':''}`} aria-label="Toggle priority" onClick={()=>update(p.id,{priority:!p.priority})}>★</button></td><td><strong>{p.name}</strong>{p.notes && <span className="subtext">{p.notes}</span>}</td><td>{p.industry}</td><td>{[p.city,p.state].filter(Boolean).join(', ')||'—'}</td><td>{money(p.revenue)}</td><td>{p.employees||'—'}</td><td><Badge tone={p.clearance==='Cleared'?'green':p.clearance==='Restricted'?'red':'amber'}>{p.clearance}</Badge><span className="subtext reason">{p.clearanceReason}</span></td><td><div className="actions">{p.crmUrl && <a className="icon-btn" href={p.crmUrl} target="_blank" rel="noreferrer" aria-label="Open CRM"><Icon name="external"/></a>}<button className="btn small" disabled={p.clearance==='Restricted'} onClick={()=>createSubmission(p)}>Start submission</button></div></td></tr>)}</tbody></table></div><div className="table-foot">Showing {filtered.length} of {data.prospects.length} prospects · Click a column heading to sort; click again to reverse.</div>
    </section>}
    {preview && <Modal title="Map prospect fields" onClose={()=>setPreview(undefined)} wide><p className="modal-intro">Review the detected columns before importing. Only the organization name is required; all records enter as <strong>Needs Review</strong>.</p><div className="mapping-grid">{prospectFields.map(field=><label key={field}><span>{field === 'crmUrl'?'CRM record link':field[0].toUpperCase()+field.slice(1)}</span><select value={map[field]??''} onChange={e=>setMap({...map,[field]:e.target.value||undefined})}><option value="">Not mapped</option>{preview.headers.map(h=><option key={h}>{h}</option>)}</select></label>)}</div><div className="preview-table"><strong>Preview · first 3 rows</strong><div className="table-wrap"><table><thead><tr>{preview.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{preview.rows.slice(0,3).map((row,i)=><tr key={i}>{preview.headers.map(h=><td key={h}>{row[h]}</td>)}</tr>)}</tbody></table></div></div><div className="modal-actions"><button className="btn" onClick={()=>setPreview(undefined)}>Cancel</button><button className="btn primary" onClick={importRows}>Import {preview.rows.length} records</button></div></Modal>}
  </div>
}
