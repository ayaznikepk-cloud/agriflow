import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import PrimaryNav from "./PrimaryNav";

export default async function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: farms } = await s.from("farms").select("name").limit(1);
  const farmName = farms?.[0]?.name || "Farm workspace";

  return <main className="app-shell">
    <header className="workspace-header">
      <div className="workspace-brand">
        <span className="eyebrow">AGRIFLOW</span>
        <div className="workspace-title-row">
          <div>
            <h1>Farm workspace</h1>
            <p className="muted">{farmName}</p>
          </div>
          <form action={logout}><button className="secondary workspace-signout">Sign out</button></form>
        </div>
      </div>
    </header>
    <PrimaryNav />
    <div className="workspace-content">{children}</div>
  </main>;
}
