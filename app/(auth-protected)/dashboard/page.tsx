import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/dashboard/Dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Dashboard reads role/college from UserProvider (set by the
  // auth-protected layout), so no props are needed here.
  return <Dashboard />;
}
