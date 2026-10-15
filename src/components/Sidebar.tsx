import type { Section } from '../types'
import { Icon } from './UI'

const items: { id: Section; label: string; phase?: string }[] = [
  { id: 'dashboard', label: 'Today' }, { id: 'prospects', label: 'Prospecting Desk' },
  { id: 'submissions', label: 'Submission Center' }, { id: 'placement', label: 'Outstanding items' },
]

export function Sidebar({ active, onChange, open, onClose }: { active: Section; onChange: (s: Section) => void; open: boolean; onClose: () => void }) {
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="brand"><div className="brand-mark">N</div><div><strong>Northstar</strong><span>Producer workspace</span></div></div>
    <nav>{items.map(item => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => { onChange(item.id); onClose() }}><Icon name={item.id} /><span>{item.label}</span>{item.phase && <small>{item.phase}</small>}</button>)}</nav>
    <div className="sidebar-foot"><div className="local-dot" /> <div><strong>Local workspace</strong><span>Data stays in this browser</span></div></div>
  </aside>
}
