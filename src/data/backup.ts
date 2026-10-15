import type { WorkspaceData } from '../types'

export function serializeBackup(data: WorkspaceData): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), application: 'Northstar Producer Workspace', data }, null, 2)
}

export function parseBackup(text: string): WorkspaceData {
  const parsed: unknown = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) throw new Error('This is not a Northstar backup file.')
  const data = (parsed as { data: Partial<WorkspaceData> }).data
  if (data.version !== 1 || !Array.isArray(data.prospects) || !Array.isArray(data.submissions) || !Array.isArray(data.placementRequests)) {
    throw new Error('The backup format is incomplete or unsupported.')
  }
  return data as WorkspaceData
}
