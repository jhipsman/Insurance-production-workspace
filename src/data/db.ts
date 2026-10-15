import { openDB } from 'idb'
import type { WorkspaceData } from '../types'

const DB_NAME = 'northstar-producer-workspace'
const STORE = 'workspace'
const KEY = 'current'

const database = () => openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
  },
})

export async function loadWorkspace(): Promise<WorkspaceData | undefined> {
  return (await database()).get(STORE, KEY)
}

export async function saveWorkspace(data: WorkspaceData): Promise<void> {
  await (await database()).put(STORE, data, KEY)
}

export async function clearWorkspace(): Promise<void> {
  await (await database()).delete(STORE, KEY)
}
