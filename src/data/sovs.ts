import type { SovAttachment } from '../types'

export const MAX_SOV_BYTES=5*1024*1024
export function readSov(file:File):Promise<SovAttachment> {
  if(!/\.(xlsx|xls|csv|pdf)$/i.test(file.name))return Promise.reject(new Error('Choose an XLSX, XLS, CSV, or PDF SOV.'))
  if(!file.size||file.size>MAX_SOV_BYTES)return Promise.reject(new Error('Choose a nonempty file no larger than 5 MB.'))
  return new Promise((resolve,reject)=>{
    const reader=new FileReader()
    reader.onerror=()=>reject(new Error('Could not read this file. Please try again.'))
    reader.onabort=()=>reject(new Error('File reading was canceled.'))
    reader.onload=()=>resolve({id:crypto.randomUUID(),name:file.name,size:file.size,uploadedAt:new Date().toISOString(),base64:String(reader.result).split(',')[1]})
    reader.readAsDataURL(file)
  })
}
export function downloadSov(file:SovAttachment) {
  const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0))
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}))
  const link=document.createElement('a');link.href=url;link.download=file.name;link.click()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
}
export function validateSovs(value:unknown) {
  if(value===undefined)return
  if(!Array.isArray(value))throw new Error('Invalid SOV attachments in backup.')
  const ids=new Set<string>()
  for(const file of value) {
    if(!file||typeof file.id!=='string'||ids.has(file.id)||typeof file.name!=='string'||! /\.(xlsx|xls|csv|pdf)$/i.test(file.name)||!Number.isInteger(file.size)||file.size<1||file.size>MAX_SOV_BYTES||typeof file.uploadedAt!=='string'||!Number.isFinite(Date.parse(file.uploadedAt))||typeof file.base64!=='string'||file.base64.length>Math.ceil(MAX_SOV_BYTES/3)*4||(file.base64.length%4!==0||! /^[A-Za-z0-9+/]*={0,2}$/.test(file.base64)))throw new Error('Invalid SOV attachment in backup.')
    const padding=file.base64.endsWith('==')?2:file.base64.endsWith('=')?1:0
    if(file.base64.length/4*3-padding!==file.size)throw new Error('SOV file size does not match backup contents.')
    ids.add(file.id)
  }
}
