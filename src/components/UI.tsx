import type { ReactNode } from 'react'

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    prospects: <><circle cx="9" cy="8" r="4"/><path d="M2 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2M16 3.5a4 4 0 0 1 0 8M18 14a5 5 0 0 1 4 5v2"/></>,
    submissions: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 15h8M8 18h5"/></>,
    placement: <><path d="M4 4h16v16H4zM8 2v4M16 2v4"/><path d="m8 14 2.5 2.5L16 11"/></>,
    sov: <><path d="M4 21V3h11l5 5v13zM14 3v6h6M8 13h8M8 17h8"/></>,
    bor: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
    library: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 5.5v14A2.5 2.5 0 0 0 6.5 22H20"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, upload: <><path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v7H4V6h7"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>, check: <path d="m5 12 4 4L19 6"/>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.dashboard}</svg>
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}>{children}</span> }
export function Progress({ value }: { value: number }) { return <div className="progress" aria-label={`${value}% complete`}><span style={{ width: `${value}%` }} /></div> }
export function Empty({ title, detail }: { title: string; detail: string }) { return <div className="empty"><div className="empty-mark">✦</div><h3>{title}</h3><p>{detail}</p></div> }

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><div><span className="eyebrow">Workspace</span><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div>
      {children}
    </section>
  </div>
}
