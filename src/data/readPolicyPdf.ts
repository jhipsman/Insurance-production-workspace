import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
GlobalWorkerOptions.workerSrc=workerUrl

export async function readPolicyPdf(file:File):Promise<{pages:string[];warnings:string[]}> {
  if(!/\.pdf$/i.test(file.name))throw new Error('Only PDF policies are supported. Extract PDFs from ZIP files first; spreadsheets are not analyzed.')
  if(file.size>25*1024*1024)throw new Error('PDF exceeds the 25 MB limit. Upload a smaller declarations extract.')
  const task=getDocument({data:new Uint8Array(await file.arrayBuffer()),useSystemFonts:true})
  task.onPassword=()=>{void task.destroy()}
  try {
    const pdf=await task.promise
    const pages:string[]=[],warnings:string[]=[]
    if(pdf.numPages>250)warnings.push('Only the first 250 pages were checked. Review the remaining pages manually.')
    for(let n=1;n<=Math.min(pdf.numPages,250);n++) {
      const page=await pdf.getPage(n),content=await page.getTextContent()
      pages.push(content.items.map(item=>'str' in item?item.str:'').join(' '));page.cleanup()
    }
    const blank=pages.filter(p=>p.trim().length<40).length
    if(blank)warnings.push(`${blank} page(s) have little or no readable text. Scans need OCR; review these pages manually.`)
    return {pages,warnings}
  } finally {await task.destroy()}
}
