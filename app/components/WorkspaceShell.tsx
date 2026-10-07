import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveFarm } from "@/lib/active-farm";
import { logout } from "@/app/login/actions";
import PrimaryNav from "./PrimaryNav";
import FarmSwitcher from "./FarmSwitcher";

export default async function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { farms, farm } = await getActiveFarm();

  return <main className="app-shell">
    <header className="workspace-header">
      <div className="workspace-brand">
        <span className="eyebrow">AGRIFLOW</span>
        <div className="workspace-title-row">
          <div><h1>Farm workspace</h1><FarmSwitcher farms={farms.map(f=>({id:f.id,name:f.name}))} activeId={farm?.id}/></div>
          <form action={logout} className="desktop-signout"><button className="secondary workspace-signout">Sign out</button></form>
        </div>
      </div>
      <PrimaryNav />
    </header>
    <div className="workspace-content">{children}</div>
  </main>;
}
