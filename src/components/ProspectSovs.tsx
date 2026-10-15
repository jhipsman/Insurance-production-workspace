import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { Prospect, WorkspaceData } from '../types'
import { downloadSov, readSov } from '../data/sovs'
import { DocumentChecklist } from './DocumentChecklist'
import type { Submission } from '../types'

export function ProspectSovs({prospect,submissions,setData}:{prospect:Prospect;submissions:Submission[];setData:Dispatch<SetStateAction<WorkspaceData>>}) {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[removing,setRemoving]=useState<string>()
  const generation=useRef(0)
  useEffect(()=>()=>{generation.current++},[])
  async function upload(file:File) {
    const run=++generation.current;setBusy(true);setMessage('')
    try {
      const attachment=await readSov(file)
      if(run!==generation.current)return
      setData(d=>({...d,prospects:d.prospects.map(p=>p.id===prospect.id?{...p,sovs:[...(p.sovs??[]),attachment]}:p)}))
      setMessage('SOV attached. Wait for “Saved locally” before closing the app.')
    } catch(error) {if(run===generation.current)setMessage(error instanceof Error?error.message:'Upload failed.')}
    finally {if(run===generation.current)setBusy(false)}
  }
  return <section className="prospect-sovs">
    <h3>Statements of values (SOVs)</h3>
    <p>Attach XLSX, XLS, CSV, or PDF files, up to 5 MB each. Stored only in this browser and included in Data &amp; backup exports. Uploading does not analyze values. You can confirm matching submission requirements below after reviewing the file.</p>
    <label>Upload SOV<input type="file" accept=".xlsx,.xls,.csv,.pdf" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void upload(file)}}/></label>
    {busy&&<p role="status">Reading SOV…</p>}{message&&<p role="status">{message}</p>}
    {!prospect.sovs?.length&&<p>No SOVs attached yet.</p>}
    {prospect.sovs?.map(file=><div className="sov-file" key={file.id}>
      <strong>{file.name}</strong><small>{Math.ceil(file.size/1024)} KB · Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</small>
      <div className="sov-actions"><button className="btn small" onClick={()=>{try{downloadSov(file)}catch{setMessage('Could not download this SOV. Try restoring a valid backup.')}}}>Download {file.name}</button><button className="btn small danger" onClick={()=>setRemoving(file.id)}>Remove {file.name}</button></div>
      {removing===file.id&&<div role="alert"><p>Remove this SOV? It cannot be recovered unless you have the original file or a prior backup.</p><button className="btn" onClick={()=>setRemoving(undefined)}>Keep SOV</button><button className="btn danger" onClick={()=>{setData(d=>({...d,prospects:d.prospects.map(p=>p.id===prospect.id?{...p,sovs:p.sovs?.filter(s=>s.id!==file.id)}:p)}));setRemoving(undefined);setMessage('SOV removed. The prospect record is unchanged.')}}>Confirm remove SOV</button></div>}
    </div>)}
    {!!prospect.sovs?.length&&submissions.filter(s=>s.prospectId===prospect.id).map(s=><DocumentChecklist key={s.id} submission={s} kind="sov" onComplete={ids=>setData(d=>({...d,submissions:d.submissions.map(sub=>sub.id===s.id?{...sub,checklist:sub.checklist.map(i=>ids.includes(i.id)?{...i,complete:true}:i)}:sub)}))}/>)}
  </section>
}
