"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";

// Creates an auth account via email invite + profile row without touching the
// admin's own session. Must run server-side: it uses the service-role key,
// which must never reach the browser (see SUPABASE_SERVICE_ROLE_KEY).
// The new user receives an invite email and sets their own password —
// the admin never sees or shares one.
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: "Super Admin" | "College Admin" | "Student Org Admin";
  collegeId: string | null;
}

export interface CreatedUserResult {
  id: string;
  email: string;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "User creation is not configured on the server (missing service-role key)."
    );
  }

  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function toFriendlyError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("duplicate")
  ) {
    return "That email is already registered.";
  }

  return message;
}

export async function createUserAsAdmin(
  input: CreateUserInput
): Promise<CreatedUserResult> {
  // Only Super Admins may mint accounts — verified on the server, not the UI.
  const caller = await getCurrentUserProfile();

  if (!caller || caller.role !== "Super Admin") {
    throw new Error("Only Super Admins can create users.");
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();

  if (firstName.length < 2 || lastName.length < 2) {
    throw new Error("First and last names need at least 2 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (
    input.role !== "Super Admin" &&
    input.role !== "College Admin" &&
    input.role !== "Student Org Admin"
  ) {
    throw new Error("Pick a valid role.");
  }

  if (input.role === "College Admin" && !input.collegeId) {
    throw new Error("College Admins need an assigned college.");
  }

  const admin = getServiceClient();

  // Sends the invite email; the recipient sets their own password on accept.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      role: input.role,
    },
  });

  if (error) {
    throw new Error(toFriendlyError(error.message));
  }

  if (!data.user) {
    throw new Error("Account was not created. Try again.");
  }

  // Upsert (not insert) so retries and auth triggers never collide.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        role: input.role,
        college_id: input.collegeId,
      },
      { onConflict: "id" }
    );

  if (profileError) {
    // Roll back the orphan auth account so retries stay clean.
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(
      "Account was created but the profile failed — rolled back. Try again."
    );
  }

  return { id: data.user.id, email };
}
