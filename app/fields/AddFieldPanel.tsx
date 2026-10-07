"use client";

import { useState } from "react";

export default function AddFieldPanel({ farmId, action }: { farmId: string; action: (formData: FormData) => void | Promise<void> }) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="page-actions">
      <button type="button" onClick={() => setOpen(true)}>+ Add field</button>
    </div>
    {open && <div className="form-drawer-backdrop" onClick={() => setOpen(false)}>
      <aside className="form-drawer" role="dialog" aria-modal="true" aria-labelledby="add-field-title" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div><span className="eyebrow">LAND</span><h2 id="add-field-title">Add field</h2><p className="muted">Add the essential details now. You can keep optional details simple.</p></div>
          <button type="button" className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        </div>
        <form action={action} className="form drawer-form">
          <input type="hidden" name="farm_id" value={farmId}/>
          <label>Field name<input name="name" required autoFocus placeholder="e.g. North field"/></label>
          <div className="inline-fields">
            <label>Area<input name="area" type="number" inputMode="decimal" min="0.001" step="0.001" required placeholder="0"/></label>
            <label>Unit<select name="area_unit" defaultValue="acre"><option>acre</option><option>kanal</option><option>marla</option><option>hectare</option></select></label>
          </div>
          <details className="optional-fields">
            <summary>More details <span>Optional</span></summary>
            <div className="form optional-fields-body">
              <label>Soil type<select name="soil_type" defaultValue=""><option value="">Not specified</option><option>Sandy</option><option>Clay</option><option>Loamy</option><option>Silty</option><option>Peaty</option><option>Chalky</option><option>Standard</option><option>Other</option></select></label>
              <label>Irrigation<select name="irrigation_type" defaultValue=""><option value="">Not specified</option><option>Canal</option><option>Tubewell</option><option>Rain-fed</option><option>Drip</option><option>Sprinkler</option><option>Other</option></select></label>
            </div>
          </details>
          <div className="drawer-actions"><button type="button" className="secondary" onClick={() => setOpen(false)}>Cancel</button><button type="submit">Add field</button></div>
        </form>
      </aside>
    </div>}
  </>;
}
