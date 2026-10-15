import { useEffect, useRef, useState } from 'react'
import { detectPolicyMatches, policyRules, type PolicyMatch } from '../data/policyReview'

export function PolicyUpload({onApply}:{onApply:(coverages:string[])=>void}) {
  const [matches,setMatches]=useState<PolicyMatch[]>([]),[selected,setSelected]=useState<string[]>([])
  const [messages,setMessages]=useState<string[]>([]),[busy,setBusy]=useState(false),[done,setDone]=useState(false)
  const generation=useRef(0)
  useEffect(()=>()=>{generation.current++},[])
  async function analyze(files:File[]) {
    const run=++generation.current;setBusy(true);setDone(false);setMatches([]);setSelected([]);setMessages([])
    const found:PolicyMatch[]=[],notes:string[]=[]
    if(files.length>10)notes.push('Only the first 10 files were checked. Upload the rest separately.')
    for(const file of files.slice(0,10)) {
      if(run!==generation.current)return
      try {
        const {readPolicyPdf}=await import('../data/readPolicyPdf')
        const result=await readPolicyPdf(file)
        const detected=detectPolicyMatches(result.pages,file.name);found.push(...detected)
        notes.push(`${file.name}: ${result.pages.length} pages checked; ${detected.length} possible coverage matches.`,...result.warnings.map(w=>`${file.name}: ${w}`))
      } catch {notes.push(`${file.name}: could not read this file. Use an unlocked, text-readable PDF under 25 MB. ZIP, XLSX, and scanned-only policies require separate review.`)}
    }
    if(run!==generation.current)return
    setMatches(found);setMessages(notes);setBusy(false)
  }
  return <section className="policy-upload">
    <h3>Import past policies</h3>
    <p>Choose policy PDFs to suggest coverage lines and submission requirements. Files are read in this browser, not sent to a server or stored in backups.</p>
    <label>Policy PDFs<input type="file" accept=".pdf,application/pdf" multiple disabled={busy} onChange={e=>{const files=Array.from(e.target.files??[]);e.target.value='';if(files.length)void analyze(files)}}/></label>
    {busy&&<p role="status">Reading policy PDFs…</p>}
    {!!messages.length&&<div role="status">{messages.map((m,i)=><p key={i}>{m}</p>)}</div>}
    {!!matches.length&&<>
      <p><strong>Review before adding.</strong> Matches may be exclusions, blank coverage headings, or references to other insurance—not purchased coverage. Confirm against declarations, premiums, limits and endorsements. These suggestions are not a determination of current insurance needs.</p>
      {policyRules.filter(r=>matches.some(m=>m.coverage===r.coverage)).map(rule=><div className="policy-match" key={rule.coverage}>
        <label><input type="checkbox" checked={selected.includes(rule.coverage)} onChange={e=>setSelected(s=>e.target.checked?[...s,rule.coverage]:s.filter(c=>c!==rule.coverage))}/>{rule.coverage}</label>
        {matches.filter(m=>m.coverage===rule.coverage).map((m,i)=><details key={i}><summary>{m.file} — page {m.page}</summary><p>{m.excerpt}</p></details>)}
        <small>Suggested checklist: {rule.requirements.join('; ')}.</small>
      </div>)}
      <p>Adding selections does not complete checklist items or mark coverage bound. Existing entries are preserved; duplicate suggestions are skipped.</p>
      <button className="btn primary" disabled={!selected.length||done} onClick={()=>{onApply(selected);setDone(true)}}>Add selected coverages and checklist items</button>
      {done&&<p role="status">Selections added. Review and edit the checklist below.</p>}
    </>}
    {!busy&&!!messages.length&&!matches.length&&<p>No coverage suggestions available. You can still add coverages manually below.</p>}
  </section>
}
