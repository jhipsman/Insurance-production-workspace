import type { Submission } from '../types'

export function CoverageProgress({submission,onChange}:{submission:Submission;onChange:(coverage:string,progress:NonNullable<Submission['coverageProgress']>[number])=>void}) {
  const bound=submission.coverages.filter(c=>submission.coverageProgress?.some(p=>p.coverage===c&&p.status==='Bound')).length
  return <section className="coverage-progress">
    <h3>Coverage line tracking</h3>
    <p>{bound} of {submission.coverages.length} lines bound. Each line saves independently; the overall submission stage stays unchanged.</p>
    <p className="muted">Bound date is when binding was confirmed, not the policy effective date. Unchecking a coverage hides its tracking; selecting it again restores it.</p>
    {submission.coverages.map(coverage=>{
      const progress=submission.coverageProgress?.find(p=>p.coverage===coverage)??{coverage,status:'Not tracked' as const}
      return <fieldset key={coverage}><legend>{coverage}</legend><div className="form-grid">
        <label>Status<select aria-label={`${coverage} status`} value={progress.status} onChange={e=>onChange(coverage,{coverage,status:e.target.value as typeof progress.status,boundDate:e.target.value==='Bound'?progress.boundDate:undefined})}>{['Not tracked','Preparing','Ready to Market','In Market','Proposal','Bound'].map(status=><option key={status}>{status}</option>)}</select></label>
        <label>Bound date<input type="date" aria-label={`${coverage} bound date`} disabled={progress.status!=='Bound'} value={progress.boundDate??''} onChange={e=>onChange(coverage,{...progress,boundDate:e.target.value||undefined})}/></label>
      </div>{progress.status==='Bound'&&!progress.boundDate&&<small>Bound date not recorded.</small>}</fieldset>
    })}
    {!submission.coverages.length&&<p>Select a coverage above to track its progress.</p>}
  </section>
}
