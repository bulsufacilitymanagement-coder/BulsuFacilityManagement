import Facilities from "@/components/pages/facilities/Facilities";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FacilitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <Facilities />;
}
