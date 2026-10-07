"use client";
import { useState } from "react";

export default function AddFarmPanel({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [open,setOpen]=useState(false);
  return <><div className="page-actions"><button type="button" onClick={()=>setOpen(true)}>+ Add farm</button></div>
  {open&&<div className="form-drawer-backdrop" onClick={()=>setOpen(false)}><aside className="form-drawer" role="dialog" aria-modal="true" aria-labelledby="add-farm-title" onClick={e=>e.stopPropagation()}>
    <div className="drawer-head"><div><span className="eyebrow">WORKSPACE</span><h2 id="add-farm-title">Add farm</h2><p className="muted">Create a farm workspace, then add its fields and crop cycles.</p></div><button type="button" className="icon-button" aria-label="Close" onClick={()=>setOpen(false)}>×</button></div>
    <form action={action} className="form drawer-form">
      <label>Farm name<input name="name" required autoFocus placeholder="e.g. Sultan Farm"/></label>
      <label>Location / village<input name="location" placeholder="Optional"/></label>
      <div className="inline-fields"><label>Total area<input name="total_area" type="number" inputMode="decimal" min="0" step="0.001" placeholder="Optional"/></label><label>Unit<select name="area_unit" defaultValue="acre"><option>acre</option><option>kanal</option><option>marla</option><option>hectare</option></select></label></div>
      <div className="drawer-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancel</button><button type="submit">Add farm</button></div>
    </form>
  </aside></div>}</>;
}
