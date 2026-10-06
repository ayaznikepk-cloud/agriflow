const modules = [
  ["Farms","Manage farms, land area and locations."],
  ["Fields","Organize plots, soil and irrigation details."],
  ["Crops","Maintain crops and varieties."],
  ["Crop Cycles","Track each planting from sowing to harvest."]
];
export default function Home() {
  return <main>
    <section className="hero">
      <span className="eyebrow">AGRIFLOW • PHASE 1</span>
      <h1>Run your farm with clarity.</h1>
      <p>One place for fields, crops and production cycles. Operations, inventory and finance will build on this foundation.</p>
      <div className="actions"><a className="primary" href="#foundation">View foundation</a><span>Supabase-ready • Vercel-ready</span></div>
    </section>
    <section id="foundation" className="grid">
      {modules.map(([title,copy]) => <article key={title}><div className="icon">↗</div><h2>{title}</h2><p>{copy}</p></article>)}
    </section>
  </main>;
}
