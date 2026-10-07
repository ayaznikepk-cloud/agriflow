import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createExpense, updateExpense } from "./actions";

const categoryLabels: Record<string,string> = {
  labor:"Labor", seed:"Seed", fertilizer:"Fertilizer", pesticide:"Pesticide / spray",
  machinery:"Machinery", irrigation:"Irrigation", fuel:"Fuel", transport:"Transport", other:"Other"
};

function money(n:number) { return "PKR " + n.toLocaleString(undefined,{maximumFractionDigits:0}); }

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{cycle?:string,category?:string,from?:string,to?:string}> }) {
  const filters = await searchParams;
  const s = await createClient();
  const [{ data: cycles }, { data: allExpenses }, { data: sales }] = await Promise.all([
    s.from("crop_cycles").select("id, farm_id, status, crops(name), fields(name)").order("created_at",{ascending:false}),
    s.from("expenses").select("*, crop_cycles(crops(name), fields(name))").order("expense_date",{ascending:false}).order("created_at",{ascending:false}),
    s.from("sales").select("crop_cycle_id,total_amount")
  ]);

  const expenses = (allExpenses || []).filter(x =>
    (!filters.cycle || x.crop_cycle_id === filters.cycle) &&
    (!filters.category || x.category === filters.category) &&
    (!filters.from || x.expense_date >= filters.from) &&
    (!filters.to || x.expense_date <= filters.to)
  );

  const today = new Date().toISOString().slice(0,10);
  const month = today.slice(0,7);
  const total = expenses.reduce((n,x)=>n+Number(x.amount),0);
  const monthTotal = (allExpenses || []).filter(x=>String(x.expense_date).startsWith(month)).reduce((n,x)=>n+Number(x.amount),0);
  const revenue = (sales || []).reduce((n,x)=>n+Number(x.total_amount || 0),0);
  const allCost = (allExpenses || []).reduce((n,x)=>n+Number(x.amount),0);

  const categoryTotals = Object.entries(categoryLabels).map(([key,label]) => ({
    key,label,total:(allExpenses || []).filter(x=>x.category===key).reduce((n,x)=>n+Number(x.amount),0)
  })).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);

  const cycleFinance = (cycles || []).map(c => {
    const cost=(allExpenses || []).filter(x=>x.crop_cycle_id===c.id).reduce((n,x)=>n+Number(x.amount),0);
    const rev=(sales || []).filter(x=>x.crop_cycle_id===c.id).reduce((n,x)=>n+Number(x.total_amount || 0),0);
    return {...c,cost,revenue:rev,profit:rev-cost};
  }).filter(c=>c.cost>0||c.revenue>0);

  return <>
    <header className="page-head">
      <span className="eyebrow">FINANCE</span>
      <h1>Expenses</h1>
      <p className="muted">Track farm costs and see how spending affects crop profitability.</p>
    </header>

    <section className="stats finance-stats">
      <article><strong>{money(allCost)}</strong><span>Total recorded cost</span></article>
      <article><strong>{money(monthTotal)}</strong><span>This month</span></article>
      <article><strong>{money(revenue)}</strong><span>Sales revenue</span></article>
      <article><strong>{money(revenue-allCost)}</strong><span>Gross profit / loss</span></article>
      <article><strong>{allExpenses?.length || 0}</strong><span>Expense entries</span></article>
    </section>

    <section className="panel">
      <div className="section-head"><div><h2>Record expense</h2><p className="muted">Link every cost to the crop cycle that incurred it.</p></div></div>
      <details className="record-details">
        <summary>+ Add expense</summary>
        <form action={createExpense} className="form section-form">
          <label>Crop cycle<select name="crop_cycle_id" required defaultValue=""><option value="" disabled>Select crop and field</option>{(cycles||[]).map(c=><option key={c.id} value={c.id}>{c.crops?.name||"Crop"} · {c.fields?.name||"Field"} · {c.status}</option>)}</select></label>
          <label>Category<select name="category">{Object.entries(categoryLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label>Date<input type="date" name="expense_date" defaultValue={today} required/></label>
          <label>Amount (PKR)<input type="number" min="0.01" step="0.01" name="amount" required/></label>
          <label className="full-field">Vendor / reference / notes<textarea name="description" rows={3} placeholder="Vendor, receipt, payment method, purpose or other details…"/></label>
          <button>Add expense</button>
        </form>
      </details>
    </section>

    <section className="detail-grid">
      <article className="panel">
        <h2>Cost breakdown</h2>
        <div className="history">{categoryTotals.map(x=><div className="history-item" key={x.key}><div><strong>{x.label}</strong><span>{money(x.total)}</span></div><p>{allCost ? Math.round(x.total/allCost*100) : 0}% of recorded costs</p></div>)}{!categoryTotals.length&&<p className="muted">No expense data yet.</p>}</div>
      </article>
      <article className="panel">
        <h2>Crop profitability</h2>
        <div className="history">{cycleFinance.map(c=><div className="history-item" key={c.id}><div><strong>{c.crops?.name||"Crop"} · {c.fields?.name||"Field"}</strong><span>{money(c.profit)}</span></div><p>{money(c.revenue)} revenue · {money(c.cost)} cost</p><Link className="back-link" href={"/crop-cycles/"+c.id}>Open cycle →</Link></div>)}{!cycleFinance.length&&<p className="muted">Profitability will appear after expenses or sales are recorded.</p>}</div>
      </article>
    </section>

    <section className="panel">
      <div className="section-head"><div><h2>Expense history</h2><p className="muted">{expenses.length} matching entr{expenses.length===1?"y":"ies"} · {money(total)}</p></div></div>
      <form className="form expense-filters">
        <label>Crop cycle<select name="cycle" defaultValue={filters.cycle||""}><option value="">All crop cycles</option>{(cycles||[]).map(c=><option key={c.id} value={c.id}>{c.crops?.name||"Crop"} · {c.fields?.name||"Field"}</option>)}</select></label>
        <label>Category<select name="category" defaultValue={filters.category||""}><option value="">All categories</option>{Object.entries(categoryLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label>From<input type="date" name="from" defaultValue={filters.from||""}/></label>
        <label>To<input type="date" name="to" defaultValue={filters.to||""}/></label>
        <button>Apply filters</button>
        <Link className="button-link secondary" href="/expenses">Clear</Link>
      </form>

      <div className="history">{expenses.map(x=><article className="history-item" key={x.id}>
        <div><div><strong>{categoryLabels[x.category]||x.category} · {money(Number(x.amount))}</strong><p>{x.crop_cycles?.crops?.name||"Crop"} · {x.crop_cycles?.fields?.name||"Field"}{x.description?" · "+x.description:""}</p></div><span>{x.expense_date}</span></div>
        <details className="record-details compact-details"><summary>Edit</summary><form action={updateExpense} className="form section-form">
          <input type="hidden" name="expense_id" value={x.id}/><input type="hidden" name="crop_cycle_id" value={x.crop_cycle_id}/>
          <label>Category<select name="category" defaultValue={x.category}>{Object.entries(categoryLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label>Date<input type="date" name="expense_date" defaultValue={x.expense_date} required/></label>
          <label>Amount (PKR)<input type="number" min="0.01" step="0.01" name="amount" defaultValue={x.amount} required/></label>
          <label className="full-field">Vendor / reference / notes<textarea name="description" rows={3} defaultValue={x.description||""}/></label>
          <button>Save changes</button>
        </form></details>
        <div className="task-status"><Link className="button-link" href={"/crop-cycles/"+x.crop_cycle_id+"?tab=expenses"}>Open cycle</Link></div>
      </article>)}{!expenses.length&&<p className="muted">No expenses match these filters.</p>}</div>
    </section>
  </>;
}
