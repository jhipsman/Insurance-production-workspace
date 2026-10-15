import { useRef, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Icon, Modal } from './components/UI'
import { serializeBackup, parseBackup } from './data/backup'
import { clearWorkspace } from './data/db'
import { useWorkspace } from './hooks/useWorkspace'
import { sampleData } from './sampleData'
import type { Prospect, Section, Submission } from './types'
import { Dashboard } from './pages/Dashboard'
import { Prospects } from './pages/Prospects'
import { Submissions } from './pages/Submissions'
import { Placement } from './pages/Placement'
import { AccountPanel } from './components/AccountPanel'
import type { AccountTarget } from './data/accounts'
import { assessContact, emptyResearch } from './data/research'

export default function App() {
  const { data, setData, ready, saved, saveError } = useWorkspace(); const [section,setSection]=useState<Section>('dashboard'); const [mobile,setMobile]=useState(false); const [settings,setSettings]=useState(false); const [message,setMessage]=useState(''); const restoreRef=useRef<HTMLInputElement>(null)
  const [accountTarget,setAccountTarget]=useState<AccountTarget>()
  function backup(){const blob=new Blob([serializeBackup(data)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`northstar-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);setMessage('Backup downloaded.')}
  async function restore(file?:File){if(!file)return;try{setData(parseBackup(await file.text()));setMessage('Backup restored successfully.')}catch(e){setMessage(e instanceof Error?e.message:'Restore failed.')}}
  async function reset(){if(!window.confirm('Replace local workspace data with the fictional demonstration set?'))return;await clearWorkspace();setData(sampleData);setMessage('Fictional demonstration data restored.')}
  function createSubmission(p:Prospect){const existing=data.submissions.find(s=>s.prospectId===p.id);if(existing){setAccountTarget({submissionId:existing.id,tab:'submission'});return}if(assessContact(p,data.research??emptyResearch()).status==='Restricted'){setMessage('This account is restricted. Review contact evidence before starting a new submission.');return}const submission:Submission={id:`sub-${Date.now()}`,prospectId:p.id,accountName:p.name,industry:p.industry,stage:'Preparing',coverages:['General Liability'],updatedAt:new Date().toISOString().slice(0,10),followUp:p.followUpDate||new Date(Date.now()+7*86400000).toISOString().slice(0,10),crmUrl:p.crmUrl,checklist:[{id:`c-${Date.now()}-1`,label:'Five-year currently valued loss runs',complete:false,required:true},{id:`c-${Date.now()}-2`,label:'Expiring policies',complete:false,required:true},{id:`c-${Date.now()}-3`,label:'Review operations-specific application requirements',complete:false,required:true}]};setData(d=>({...d,submissions:[submission,...d.submissions]}));setSection('submissions');setAccountTarget({submissionId:submission.id,tab:'submission'})}
  if(!ready)return <div className="loading"><div className="brand-mark">N</div><span>Opening local workspace…</span></div>
  return <div className="app"><Sidebar active={section} onChange={setSection} open={mobile} onClose={()=>setMobile(false)}/>{mobile&&<div className="mobile-shade" onClick={()=>setMobile(false)}/>}<main className="main"><header className="topbar"><button className="menu-btn" onClick={()=>setMobile(true)}>☰</button><div className="workspace-label"><span>Personal workspace</span><strong>Nonprofit & Human Services</strong></div><div className="top-actions"><span className={`save-state ${saved?'saved':''}`}><i/>{saved?'Saved locally':'Saving…'}</span><button className="icon-btn has-label" onClick={()=>setSettings(true)}>⚙ <span>Data & backup</span></button><div className="user-avatar" aria-label="Personal workspace">You</div></div></header>
      {section==='dashboard'&&<Dashboard data={data} navigate={setSection} onOpen={setAccountTarget}/>} {section==='prospects'&&<Prospects data={data} setData={setData} createSubmission={createSubmission} onOpen={setAccountTarget}/>} {section==='submissions'&&<Submissions data={data} setData={setData} onOpen={setAccountTarget}/>} {section==='placement'&&<Placement data={data} setData={setData} onOpen={setAccountTarget}/>}
    {saveError&&<div role="alert" className="storage-error">{saveError}<button className="btn" onClick={backup}>Download backup</button></div>}
    </main>{message&&<div className="global-toast">{message}<button onClick={()=>setMessage('')}>×</button></div>}
    {accountTarget&&<AccountPanel key={`${accountTarget.prospectId??accountTarget.submissionId}:${accountTarget.tab}`} target={accountTarget} data={data} setData={setData} onClose={()=>setAccountTarget(undefined)} onStartSubmission={createSubmission}/>}
    {settings&&<Modal title="Data & backup" onClose={()=>setSettings(false)}><p className="modal-intro">Workspace records are stored in this browser using IndexedDB. Download regular backups, especially before browser or device maintenance.</p><div className="setting-actions"><button onClick={backup}><span className="setting-icon"><Icon name="upload"/></span><div><strong>Download backup</strong><small>Save all workspace data as JSON</small></div><span>→</span></button><button onClick={()=>restoreRef.current?.click()}><span className="setting-icon">↙</span><div><strong>Restore backup</strong><small>Replace workspace data from a Northstar file</small></div><span>→</span></button><input hidden type="file" accept="application/json,.json" ref={restoreRef} onChange={e=>restore(e.target.files?.[0])}/><button onClick={reset}><span className="setting-icon">↻</span><div><strong>Restore demonstration data</strong><small>Reset to fictional sample accounts</small></div><span>→</span></button></div><div className="privacy-note"><strong>Privacy boundary</strong><p>The application does not transmit imported records. External CRM, Indio, and Tailwind links open only when you click them and remain subject to your organization’s policies.</p></div></Modal>}
  </div>
}
