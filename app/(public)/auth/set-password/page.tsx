import { SetPassword } from "@/components/pages/set-password/SetPassword";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Only reachable with a session (invite accept lands here via /auth/confirm).
// Deliberately outside the login/register redirect loop.
export default async function SetPasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <SetPassword />;
}
