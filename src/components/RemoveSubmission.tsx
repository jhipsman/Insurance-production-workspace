import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Submission, WorkspaceData } from '../types'

export function RemoveSubmission({submission,setData,onRemoved}:{submission:Submission;setData:Dispatch<SetStateAction<WorkspaceData>>;onRemoved:()=>void}) {
  const [confirming,setConfirming]=useState(false)
  function remove() {
    setData(data=>({...data,
      submissions:data.submissions.filter(s=>s.id!==submission.id),
      placementRequests:data.placementRequests.filter(r=>r.submissionId!==submission.id),
    }))
    onRemoved()
  }
  return <section className="remove-submission">
    {!confirming?<button className="btn danger" onClick={()=>setConfirming(true)}>Remove submission</button>:<div role="alert" aria-label="Confirm submission removal">
      <h3>Remove {submission.accountName} from submissions?</h3>
      <p>This permanently removes this submission, its coverages, checklist, and linked carrier requests. Its prospect record and other submissions are kept.</p>
      <p>There is no undo. To keep a copy, cancel and download a backup from Data &amp; backup first.</p>
      <div className="modal-actions"><button className="btn" onClick={()=>setConfirming(false)}>Keep submission</button><button className="btn danger" onClick={remove}>Yes, remove submission</button></div>
    </div>}
  </section>
}
