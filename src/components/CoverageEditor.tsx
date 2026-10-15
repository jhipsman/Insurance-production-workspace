import { useState } from 'react'

const coverageOptions = [
  'General Liability', 'Professional Liability', 'Property', 'Commercial Auto',
  'Workers Compensation', 'Umbrella', 'Management Liability', 'Cyber',
  'Abuse & Molestation', 'Crime', 'Employment Practices Liability', 'Directors & Officers',
]

export function CoverageEditor({ value, onChange }: { value: string[]; onChange: (coverages: string[]) => void }) {
  const [custom,setCustom] = useState('')
  const [error,setError] = useState('')
  const options = [...new Set([...coverageOptions,...value])]
  function addCustom() {
    const name=custom.trim()
    if (!name) return
    if (value.some(c=>c.toLowerCase()===name.toLowerCase())) {setError('That coverage is already selected.');return}
    const canonical=coverageOptions.find(c=>c.toLowerCase()===name.toLowerCase())??name
    onChange([...value,canonical]);setCustom('');setError('')
  }
  return <section className="coverage-editor">
    <fieldset><legend>Coverages</legend>
      <p>Select all coverage lines being submitted. Changes save automatically.</p>
      <div className="coverage-options">{options.map(name=><label key={name}><input type="checkbox" checked={value.includes(name)} onChange={e=>{onChange(e.target.checked?[...value,name]:value.filter(c=>c!==name));setError('')}}/>{name}</label>)}</div>
    </fieldset>
    <label className="custom-coverage">Other coverage<input value={custom} onChange={e=>{setCustom(e.target.value);setError('')}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addCustom()}}} placeholder="Enter a coverage line…" maxLength={120}/></label>
    <button type="button" className="btn small" disabled={!custom.trim()} onClick={addCustom}>Add coverage</button>
    {error&&<p role="alert">{error}</p>}
    {!value.length&&<p>No coverage lines selected.</p>}
  </section>
}
