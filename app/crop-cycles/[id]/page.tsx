import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCycleStatus } from "@/app/dashboard/actions";
import { addActivity, addTask, updateTask, addExpense, addHarvest, completeHarvesting, reopenHarvesting, addBuyer, addSale } from "./actions";

const tabs = ["overview", "activities", "tasks", "expenses", "harvest", "sales"] as const;

export default async function CyclePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string, error?: string }> }) {
  const { id } = await params;
  const { tab: raw, error } = await searchParams;
  const tab: typeof tabs[number] = tabs.find(t => t === raw) ?? "overview";
  const s = await createClient();

  const [{ data: c }, { data: activities }, { data: tasks }, { data: expenses }, { data: harvests }, { data: sales }] = await Promise.all([
    s.from("crop_cycles").select("*, crops(name), crop_varieties(name), fields(name), farms(name)").eq("id", id).single(),
    s.from("activities").select("*").eq("crop_cycle_id", id).order("activity_date", { ascending: false }),
    s.from("tasks").select("*").eq("crop_cycle_id", id).order("due_date"),
    s.from("expenses").select("*").eq("crop_cycle_id", id).order("expense_date", { ascending: false }),
    s.from("harvests").select("*").eq("crop_cycle_id", id).order("harvest_date", { ascending: false }),
    s.from("sales").select("*, buyers(name)").eq("crop_cycle_id", id).order("sale_date", { ascending: false }),
  ]);
  if (!c) notFound();

  const expense = (expenses || []).reduce((n, x) => n + Number(x.amount), 0);
  const revenue = (sales || []).reduce((n, x) => n + Number(x.total_amount || 0), 0);
  const { data: buyers } = await s.from("buyers").select("*").eq("farm_id", c.farm_id).order("name");

  const stockKeys = Array.from(new Set((harvests || []).map(h => JSON.stringify([h.product_kind, h.product_name, h.unit]))));
  const inventory = stockKeys.map(key => {
    const [productKind, productName, unit] = JSON.parse(key) as [string, string, string];
    const harvested = (harvests || []).filter(h => h.product_kind === productKind && h.product_name === productName && h.unit === unit).reduce((n, h) => n + Number(h.quantity), 0);
    const sold = (sales || []).filter(x => x.product_kind === productKind && x.product_name === productName && x.unit === unit).reduce((n, x) => n + Number(x.quantity), 0);
    return { productKind, productName, unit, harvested, sold, remaining: harvested - sold };
  }).filter(i => i.remaining > 0);

  return <main className="app-shell">
    <Link href="/crop-cycles" className="back-link">← Crop cycles</Link>
    <section className="panel detail-hero">
      <span className="eyebrow">CROP CYCLE</span><h1>{c.crops?.name}</h1>
      <p className="muted">{c.crop_varieties?.name || "Variety not specified"} · {c.fields?.name} · {c.farms?.name}</p>
      <span className="pill">{c.status==="active"?"Growing":c.status==="harvest_complete"?"Harvest complete":c.status==="harvesting"?"Harvesting":c.status[0].toUpperCase()+c.status.slice(1)}</span>
    </section>

    <nav className="cycle-tabs">{tabs.map(t => <Link key={t} className={tab === t ? "active" : ""} href={"/crop-cycles/" + id + "?tab=" + t}>{t[0].toUpperCase() + t.slice(1)}</Link>)}</nav>

    {tab === "overview" && <>
      <section className="stats finance-stats">
        <article><strong>{c.planted_area} {c.area_unit}</strong><span>Planted area</span></article>
        <article><strong>PKR {expense.toLocaleString()}</strong><span>Total cost</span></article>
        <article><strong>PKR {revenue.toLocaleString()}</strong><span>Revenue</span></article>
        <article><strong>PKR {(revenue - expense).toLocaleString()}</strong><span>Gross profit / loss</span></article>
      </section>
      <section className="detail-grid">
        <article className="panel"><h2>Crop details</h2><dl>
          <div><dt>Sowing date</dt><dd>{c.sowing_date}</dd></div>
          <div><dt>Expected harvest</dt><dd>{c.expected_harvest_date || "Not set"}</dd></div>
          <div><dt>Actual harvest</dt><dd>{c.actual_harvest_date || "—"}</dd></div>
          <div><dt>Harvest output lines</dt><dd>{harvests?.length || 0}</dd></div>
        </dl></article>
        <article className="panel"><h2>Status</h2>
          <form action={updateCycleStatus} className="form">
            <input type="hidden" name="id" value={c.id} />
            <label>Crop cycle status<select name="status" defaultValue={c.status}>
              <option value="planned">Planned</option><option value="active">Growing</option><option value="harvesting">Harvesting</option><option value="harvest_complete">Harvest complete</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option>
            </select></label>
            <label>Actual harvest date<input type="date" name="actual_harvest_date" defaultValue={c.actual_harvest_date || ""} /></label>
            <button>Update status</button>
          </form>
        </article>
      </section>
    </>}

    {tab === "activities" && <Section title="Activities">
      <form action={addActivity} className="form section-form"><input type="hidden" name="crop_cycle_id" value={c.id}/><input type="hidden" name="farm_id" value={c.farm_id}/>
        <label>Activity<select name="activity_type"><option value="irrigation">Irrigation</option><option value="fertilizer">Fertilizer</option><option value="pesticide">Pesticide</option><option value="weeding">Weeding</option><option value="spraying">Spraying</option><option value="sowing">Sowing</option><option value="harvesting">Harvesting</option><option value="other">Other</option></select></label>
        <label>Date<input type="date" name="activity_date" required/></label><label>Description<input name="description"/></label><button>Add activity</button>
      </form>
      <List empty="No activities recorded yet." rows={(activities || []).map(a => ({ a: a.activity_type, b: a.activity_date, c: a.description || "No notes" }))}/>
    </Section>}

    {tab === "tasks" && <Section title="Tasks">
      <form action={addTask} className="form section-form"><input type="hidden" name="crop_cycle_id" value={c.id}/><input type="hidden" name="farm_id" value={c.farm_id}/>
        <label>Task<input name="title" required/></label><label>Due date<input type="date" name="due_date"/></label><label>Priority<select name="priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><button>Add task</button>
      </form>
      <div className="history">{(tasks || []).map(t => <div className="history-item" key={t.id}><div><strong>{t.title}</strong><span>{t.due_date || "No due date"} · {t.priority}</span></div><form action={updateTask} className="task-status"><input type="hidden" name="task_id" value={t.id}/><input type="hidden" name="crop_cycle_id" value={c.id}/><select name="status" defaultValue={t.status}><option value="open">Open</option><option value="in_progress">In progress</option><option value="done">Done</option><option value="cancelled">Cancelled</option></select><button>Save</button></form></div>)}{!tasks?.length && <p className="muted">No tasks yet.</p>}</div>
    </Section>}

    {tab === "expenses" && <Section title="Expenses">
      <form action={addExpense} className="form section-form"><input type="hidden" name="crop_cycle_id" value={c.id}/><input type="hidden" name="farm_id" value={c.farm_id}/>
        <label>Category<select name="category"><option value="labor">Labor</option><option value="seed">Seed</option><option value="fertilizer">Fertilizer</option><option value="pesticide">Pesticide</option><option value="machinery">Machinery</option><option value="irrigation">Irrigation</option><option value="fuel">Fuel</option><option value="transport">Transport</option><option value="other">Other</option></select></label>
        <label>Date<input type="date" name="expense_date" required/></label><label>Amount (PKR)<input type="number" min="0.01" step="0.01" name="amount" required/></label><button>Add expense</button>
      </form>
      <List empty="No expenses recorded yet." rows={(expenses || []).map(e => ({ a: e.category, b: e.expense_date, c: "PKR " + Number(e.amount).toLocaleString() + " · " + (e.description || "No notes") }))}/>
    </Section>}

    {tab === "harvest" && <Section title="Harvest outputs">
      {error && <p className="notice error">{error}</p>}
      <div className="section-head"><div><strong>{harvests?.length || 0} output line{harvests?.length === 1 ? "" : "s"}</strong><p className="muted">Record the primary product and any by-products separately for every picking or harvest.</p></div>
        {c.status === "harvest_complete" ? <form action={reopenHarvesting}><input type="hidden" name="crop_cycle_id" value={c.id}/><button className="secondary action-button">Reopen harvesting</button></form>
        : c.status !== "closed" && c.status !== "cancelled" && harvests?.length ? <form action={completeHarvesting}><input type="hidden" name="crop_cycle_id" value={c.id}/><input type="hidden" name="actual_harvest_date" value={harvests[0]?.harvest_date || ""}/><button className="action-button">Complete harvesting</button></form> : null}
      </div>
      {!["harvest_complete", "closed", "cancelled"].includes(c.status) && <form action={addHarvest} className="form section-form">
        <input type="hidden" name="crop_cycle_id" value={c.id}/><input type="hidden" name="farm_id" value={c.farm_id}/>
        <label>Output type<select name="product_kind"><option value="primary">Primary product</option><option value="by_product">By-product</option></select></label>
        <label>Product name<input name="product_name" defaultValue={c.crops?.name || ""} placeholder="e.g. Cotton lint, Cotton seed, Wheat straw" required/></label>
        <label>Harvest date<input type="date" name="harvest_date" required/></label>
        <label>Quantity<input type="number" min="0.001" step="0.001" name="quantity" required/></label>
        <label>Unit<select name="unit"><option value="kg">kg</option><option value="maund">maund</option><option value="ton">ton</option><option value="bag">bag</option><option value="unit">unit</option></select></label>
        <label>Grade<input name="grade"/></label>
        <button>Add harvest output</button>
      </form>}
      <List empty="No harvest recorded yet." rows={(harvests || []).map(h => ({ a: h.product_name + " · " + h.quantity + " " + h.unit, b: h.harvest_date, c: (h.product_kind === "primary" ? "Primary product" : "By-product") + " · " + (h.grade || "Grade not specified") }))}/>
    </Section>}

    {tab === "sales" && <Section title="Sales">
      {error && <p className="notice error">{error}</p>}
      <div className="inventory-grid">{inventory.map(i => <article key={JSON.stringify([i.productKind,i.productName,i.unit])}><strong>{i.remaining.toLocaleString()} {i.unit}</strong><span>{i.productName}</span><small>{i.productKind === "primary" ? "Primary product" : "By-product"} · {i.harvested.toLocaleString()} harvested · {i.sold.toLocaleString()} sold</small></article>)}{!inventory.length && <p className="muted">Record a harvest output before entering sales.</p>}</div>
      <div className="sales-tools">
        <form action={addBuyer} className="form"><input type="hidden" name="farm_id" value={c.farm_id}/><input type="hidden" name="crop_cycle_id" value={c.id}/><label>New buyer<input name="name" required/></label><label>Phone<input name="phone"/></label><button>Add buyer</button></form>
        <form action={addSale} className="form"><input type="hidden" name="farm_id" value={c.farm_id}/><input type="hidden" name="crop_cycle_id" value={c.id}/>
          <label>Buyer<select name="buyer_id"><option value="">Not specified</option>{buyers?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label>Inventory item<select name="stock_item" required>{inventory.map(i => <option key={JSON.stringify([i.productKind,i.productName,i.unit])} value={JSON.stringify([i.productKind,i.productName,i.unit])}>{i.productName} · {i.productKind === "primary" ? "Primary" : "By-product"} · {i.remaining.toLocaleString()} {i.unit} available</option>)}</select></label>
          <label>Sale date<input type="date" name="sale_date" required/></label><label>Quantity<input type="number" min="0.001" step="0.001" name="quantity" required/></label>
          <label>Rate / unit (PKR)<input type="number" min="0" step="0.01" name="rate_per_unit" required/></label>
          <label>Payment<select name="payment_status"><option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option></select></label>
          <button disabled={!inventory.length}>Record sale</button>
        </form>
      </div>
      <List empty="No sales recorded yet." rows={(sales || []).map(x => ({ a: x.product_name + " · " + x.quantity + " " + x.unit + " · PKR " + Number(x.total_amount || 0).toLocaleString(), b: x.sale_date, c: (x.product_kind === "primary" ? "Primary product" : "By-product") + " · " + (x.buyers?.name || "Buyer not specified") + " · " + x.payment_status }))}/>
    </Section>}
  </main>;
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}
function List({ rows, empty }: { rows: { a: string, b: string, c: string }[], empty: string }) {
  return <div className="history">{rows.map((r, i) => <div className="history-item" key={i}><div><strong>{r.a}</strong><span>{r.b}</span></div><p>{r.c}</p></div>)}{!rows.length && <p className="muted">{empty}</p>}</div>;
}
