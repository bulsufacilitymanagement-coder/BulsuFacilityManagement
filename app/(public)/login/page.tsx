import { Login } from "@/components/pages/login/Login";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { error, message } = await searchParams;

  // Specific backend reason wins; otherwise the generic expired message.
  const linkError =
    error === "link-invalid" && message
      ? message
      : error === "link-expired" || error === "link-invalid"
        ? "This invite link is invalid or expired. Ask your admin to send a new invite."
        : null;

  return <Login linkError={linkError} />;
}
