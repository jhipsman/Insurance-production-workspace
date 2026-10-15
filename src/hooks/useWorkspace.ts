import { useEffect, useState } from 'react'
import { loadWorkspace, saveWorkspace } from '../data/db'
import { sampleData } from '../sampleData'
import type { WorkspaceData } from '../types'
import { removeDemoSubmissions } from '../data/removeDemoSubmissions'

export function useWorkspace() {
  const [data, setData] = useState<WorkspaceData>(()=>removeDemoSubmissions(sampleData))
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(true)
  const [saveError,setSaveError]=useState('')

  useEffect(() => { loadWorkspace().then(stored => { setData(removeDemoSubmissions(stored??sampleData)); setReady(true) }) }, [])
  useEffect(() => {
    if (!ready) return
    setSaved(false)
    let active=true
    const timer = window.setTimeout(() => saveWorkspace(data).then(() => {if(active){setSaved(true);setSaveError('')}}).catch(()=>{if(active)setSaveError('Changes could not be saved to this browser. Storage may be full. Download a backup now before closing, then remove unneeded attachments or free browser storage.')}), 250)
    return () => {active=false;window.clearTimeout(timer)}
  }, [data, ready])

  return { data, setData, ready, saved, saveError }
}
