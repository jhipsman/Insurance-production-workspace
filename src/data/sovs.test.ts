import { expect, it } from 'vitest'
import { MAX_SOV_BYTES, readSov, validateSovs } from './sovs'
it('rejects oversized or empty files',async()=>{
  await expect(readSov(new File([],'empty.csv'))).rejects.toThrow('nonempty')
  await expect(readSov(new File([new Uint8Array(MAX_SOV_BYTES+1)],'large.pdf'))).rejects.toThrow('5 MB')
})
it('rejects corrupt attachments in backups and accepts legacy records',()=>{
  expect(()=>validateSovs(undefined)).not.toThrow()
  const file={id:'fictional',name:'test.csv',size:1,uploadedAt:'2026-10-15',base64:'YQ=='}
  expect(()=>validateSovs([file])).not.toThrow()
  expect(()=>validateSovs([{...file,base64:'javascript:bad'}])).toThrow()
  expect(()=>validateSovs([{...file,size:2}])).toThrow()
})
