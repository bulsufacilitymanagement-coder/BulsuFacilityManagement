import "server-only";

import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/app/providers/types";

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      *,
      college:colleges (
        id,
        name,
        code
      )
    `
    )
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching user profile:", profileError);
    return null;
  }

  return profile;
}
