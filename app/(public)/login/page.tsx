import { Login } from "@/components/pages/login/Login";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <Login
      linkError={
        error === "link-expired"
          ? "This invite link is invalid or expired. Ask your admin to send a new invite."
          : null
      }
    />
  );
}
