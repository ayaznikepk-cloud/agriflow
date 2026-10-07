import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createActivity, deleteActivity } from "./actions";

const labels: Record<string,string> = {
  sowing:"Sowing", irrigation:"Irrigation", fertilizer:"Fertilizer", pesticide:"Pesticide",
  weeding:"Weeding", spraying:"Spraying", harvesting:"Harvesting", other:"Other"
};

export default async function ActivitiesPage() {
  const s = await createClient();
  const [{ data: cycles }, { data: activities }] = await Promise.all([
    s.from("crop_cycles").select("id, farm_id, status, crops(name), fields(name)").order("created_at", { ascending:false }),
    s.from("activities").select("*, crop_cycles(crops(name), fields(name))").order("activity_date", { ascending:false }).order("created_at", { ascending:false })
  ]);

  const today = new Date().toISOString().slice(0,10);
  const month = today.slice(0,7);
  const thisMonth = (activities || []).filter(x => String(x.activity_date).startsWith(month)).length;
  const recent = (activities || []).filter(x => {
    const d = new Date(String(x.activity_date) + "T00:00:00Z");
    return (Date.now() - d.getTime()) / 86400000 <= 7;
  }).length;

  return <>
    <header className="page-head">
      <span className="eyebrow">FIELD OPERATIONS</span>
      <h1>Activities</h1>
      <p className="muted">Keep a chronological record of work completed across every crop cycle.</p>
    </header>

    <section className="stats">
      <article><strong>{activities?.length || 0}</strong><span>Total records</span></article>
      <article><strong>{thisMonth}</strong><span>This month</span></article>
      <article><strong>{recent}</strong><span>Last 7 days</span></article>
    </section>

    <section className="panel">
      <div className="section-head"><div><h2>Activity log</h2><p className="muted">Add work here or from an individual crop cycle.</p></div></div>

      <details className="record-details">
        <summary>+ Add activity</summary>
        <form action={createActivity} className="form section-form">
          <label>Crop cycle
            <select name="crop_cycle_id" required defaultValue="">
              <option value="" disabled>Select crop and field</option>
              {(cycles || []).map(c => <option key={c.id} value={c.id}>{c.crops?.name || "Crop"} · {c.fields?.name || "Field"} · {c.status}</option>)}
            </select>
          </label>
          <label>Activity
            <select name="activity_type">
              {Object.entries(labels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>Date<input type="date" name="activity_date" defaultValue={today} required /></label>
          <label>Quantity<input type="number" name="quantity" min="0" step="0.001" placeholder="Optional" /></label>
          <label>Unit<input name="unit" placeholder="kg, bags, hours…" /></label>
          <label className="full-field">Notes / description<textarea name="description" rows={3} placeholder="Work done, inputs used, observations…" /></label>
          <button>Add activity</button>
        </form>
      </details>

      <div className="history">
        {(activities || []).map(a => <article className="history-item" key={a.id}>
          <div>
            <div>
              <strong>{labels[a.activity_type] || a.activity_type}</strong>
              <p>{a.crop_cycles?.crops?.name || "Crop"} · {a.crop_cycles?.fields?.name || "Field"}{a.quantity !== null ? " · " + a.quantity + (a.unit ? " " + a.unit : "") : ""}</p>
              {a.description && <p>{a.description}</p>}
            </div>
            <span>{a.activity_date}</span>
          </div>
          <div className="task-status">
            <Link className="button-link" href={"/crop-cycles/" + a.crop_cycle_id + "?tab=activities"}>Open cycle</Link>
            <form action={deleteActivity}>
              <input type="hidden" name="activity_id" value={a.id} />
              <input type="hidden" name="crop_cycle_id" value={a.crop_cycle_id} />
              <button className="secondary">Delete</button>
            </form>
          </div>
        </article>)}
        {!activities?.length && <p className="muted">No activities recorded yet.</p>}
      </div>
    </section>
  </>;
}
