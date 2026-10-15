import { useEffect, useState } from 'react'
import { loadWorkspace, saveWorkspace } from '../data/db'
import { sampleData } from '../sampleData'
import type { WorkspaceData } from '../types'
import { removeDemoSubmissions } from '../data/removeDemoSubmissions'

export function useWorkspace() {
  const [data, setData] = useState<WorkspaceData>(()=>removeDemoSubmissions(sampleData))
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(true)

  useEffect(() => { loadWorkspace().then(stored => { setData(removeDemoSubmissions(stored??sampleData)); setReady(true) }) }, [])
  useEffect(() => {
    if (!ready) return
    setSaved(false)
    const timer = window.setTimeout(() => saveWorkspace(data).then(() => setSaved(true)), 250)
    return () => window.clearTimeout(timer)
  }, [data, ready])

  return { data, setData, ready, saved }
}
