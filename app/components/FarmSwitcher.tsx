"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { selectFarm } from "@/app/farms/actions";

export default function FarmSwitcher({farms,activeId}:{farms:{id:string,name:string}[],activeId?:string}){
  const pathname=usePathname();
  if(!farms.length)return <Link className="farm-add-link" href="/farms">+ Add farm</Link>;
  return <div className="farm-switcher-row"><form action={selectFarm} className="farm-switcher"><input type="hidden" name="return_to" value={pathname}/><label><span>Active farm</span><select name="farm_id" defaultValue={activeId||farms[0].id} onChange={e=>e.currentTarget.form?.requestSubmit()}>{farms.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></label></form><Link className="farm-add-link" href="/farms">+ Add farm</Link></div>;
}
