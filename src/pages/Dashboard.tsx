import type { WorkspaceData } from '../types'
import { Badge, Progress } from '../components/UI'

export function Dashboard({ data, navigate }: { data: WorkspaceData; navigate: (target: 'prospects' | 'submissions' | 'placement') => void }) {
  const outstanding = data.placementRequests.filter(item => item.status !== 'Complete')
  const missing = data.submissions.flatMap(sub => sub.checklist.filter(item => item.required && !item.complete))
  const metrics = [
    ['Priority prospects', data.prospects.filter(p => p.priority).length, 'Ready for focused review', 'prospects'],
    ['Active submissions', data.submissions.filter(s => s.stage !== 'Bound').length, 'Across the current pipeline', 'submissions'],
    ['Placement requests', outstanding.length, 'Items still outstanding', 'placement'],
    ['Missing documents', missing.length, 'Across active submissions', 'submissions'],
  ] as const
  return <div className="page dashboard-page">
    <div className="page-title"><div><span className="eyebrow">Your workspace</span><h1>Welcome back.</h1><p>Here’s where your attention will have the most impact today.</p></div><button className="btn primary" onClick={() => navigate('prospects')}>Review priorities</button></div>
    <div className="metric-grid">{metrics.map(([label, value, detail, target], index) => <button className="metric-card" key={label} onClick={() => navigate(target)}><div className={`metric-symbol tone-${index}`}>{['◎','↗','✓','!'][index]}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></button>)}</div>
    <div className="dashboard-grid">
      <section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">Pipeline</span><h2>Active submissions</h2></div><button className="text-btn" onClick={() => navigate('submissions')}>View all →</button></div>
        <div className="account-list">{data.submissions.map(sub => { const complete = sub.checklist.filter(i => i.complete).length; const pct = Math.round(complete / sub.checklist.length * 100); return <div className="account-row" key={sub.id}><div className="account-avatar">{sub.accountName.split(' ').slice(0,2).map(x=>x[0]).join('')}</div><div className="grow"><strong>{sub.accountName}</strong><span>{sub.industry} · {sub.coverages.length} coverages</span></div><Badge tone={sub.stage === 'In Market' ? 'blue' : sub.stage === 'Preparing' ? 'amber' : 'green'}>{sub.stage}</Badge><div className="row-progress"><span>{pct}% ready</span><Progress value={pct}/></div></div> })}</div>
      </section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">Follow-ups</span><h2>Coming up</h2></div></div>
        <div className="timeline">{[...data.submissions].sort((a,b)=>a.followUp.localeCompare(b.followUp)).map((sub, i) => <div key={sub.id}><div className="date-tile"><strong>{sub.followUp.slice(-2)}</strong><span>OCT</span></div><div><strong>{sub.accountName}</strong><p>{i === 0 ? 'Review outstanding information' : 'Submission follow-up'}</p></div></div>)}</div>
      </section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">Attention</span><h2>Outstanding requests</h2></div><button className="text-btn" onClick={() => navigate('placement')}>Open tracker →</button></div>
        <div className="compact-list">{outstanding.slice(0,4).map(item => <div key={item.id}><span className="status-dot"/><div><strong>{item.description}</strong><span>{item.accountName} · {item.carrier}</span></div></div>)}</div>
      </section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">Recent</span><h2>Workspace activity</h2></div></div>
        <div className="compact-list">{data.activities.map(item => <div key={item.id}><span className="activity-mark">↗</span><div><strong>{item.title}</strong><span>{item.detail} · {item.occurredAt}</span></div></div>)}</div>
      </section>
    </div>
  </div>
}
