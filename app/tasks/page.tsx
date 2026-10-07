import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTask, deleteTask, updateTaskStatus } from "./actions";

function statusLabel(v:string) {
  return v === "in_progress" ? "In progress" : v[0].toUpperCase() + v.slice(1);
}

export default async function TasksPage() {
  const s = await createClient();
  const [{ data: cycles }, { data: tasks }] = await Promise.all([
    s.from("crop_cycles").select("id, farm_id, status, crops(name), fields(name)").order("created_at", { ascending:false }),
    s.from("tasks").select("*, crop_cycles(crops(name), fields(name))").order("due_date", { ascending:true, nullsFirst:false }).order("created_at", { ascending:false })
  ]);

  const today = new Date().toISOString().slice(0,10);
  const open = (tasks || []).filter(t => ["open","in_progress"].includes(t.status)).length;
  const overdue = (tasks || []).filter(t => t.due_date && t.due_date < today && ["open","in_progress"].includes(t.status)).length;
  const done = (tasks || []).filter(t => t.status === "done").length;

  return <>
    <header className="page-head">
      <span className="eyebrow">WORK PLANNING</span>
      <h1>Tasks</h1>
      <p className="muted">Plan upcoming farm work and keep overdue items visible.</p>
    </header>

    <section className="stats">
      <article><strong>{open}</strong><span>Open / in progress</span></article>
      <article><strong>{overdue}</strong><span>Overdue</span></article>
      <article><strong>{done}</strong><span>Completed</span></article>
    </section>

    <section className="panel">
      <div className="section-head"><div><h2>Task board</h2><p className="muted">Use status to move work from planned to complete.</p></div></div>

      <details className="record-details">
        <summary>+ Add task</summary>
        <form action={createTask} className="form section-form">
          <label>Crop cycle
            <select name="crop_cycle_id" required defaultValue="">
              <option value="" disabled>Select crop and field</option>
              {(cycles || []).map(c => <option key={c.id} value={c.id}>{c.crops?.name || "Crop"} · {c.fields?.name || "Field"} · {c.status}</option>)}
            </select>
          </label>
          <label>Task<input name="title" required placeholder="e.g. Irrigate field" /></label>
          <label>Due date<input type="date" name="due_date" /></label>
          <label>Priority<select name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          <label>Assigned to<input name="assigned_to" placeholder="Person or team" /></label>
          <label className="full-field">Notes<textarea name="notes" rows={3} placeholder="Instructions, inputs or follow-up details…" /></label>
          <button>Add task</button>
        </form>
      </details>

      <div className="history">
        {(tasks || []).map(t => {
          const isOverdue = !!t.due_date && t.due_date < today && ["open","in_progress"].includes(t.status);
          return <article className="history-item" key={t.id}>
            <div>
              <div>
                <strong>{t.title}</strong>
                <p>{t.crop_cycles?.crops?.name || "Crop"} · {t.crop_cycles?.fields?.name || "Field"} · {t.priority} priority{t.assigned_to ? " · " + t.assigned_to : ""}</p>
                {t.notes && <p>{t.notes}</p>}
              </div>
              <span>{t.due_date ? (isOverdue ? "Overdue · " : "Due · ") + t.due_date : "No due date"}</span>
            </div>
            <form action={updateTaskStatus} className="task-status">
              <input type="hidden" name="task_id" value={t.id} />
              <input type="hidden" name="crop_cycle_id" value={t.crop_cycle_id} />
              <select name="status" defaultValue={t.status}>
                <option value="open">Open</option><option value="in_progress">In progress</option><option value="done">Done</option><option value="cancelled">Cancelled</option>
              </select>
              <button>Save</button>
            </form>
            <div className="task-status">
              <span className="pill">{statusLabel(t.status)}</span>
              <Link className="button-link" href={"/crop-cycles/" + t.crop_cycle_id + "?tab=tasks"}>Open cycle</Link>
              <form action={deleteTask}>
                <input type="hidden" name="task_id" value={t.id} />
                <input type="hidden" name="crop_cycle_id" value={t.crop_cycle_id} />
                <button className="secondary">Delete</button>
              </form>
            </div>
          </article>;
        })}
        {!tasks?.length && <p className="muted">No tasks yet.</p>}
      </div>
    </section>
  </>;
}
