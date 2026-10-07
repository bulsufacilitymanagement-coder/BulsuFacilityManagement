// Row shape for the User Management table (profiles + college join).
export interface ViewUserCollege {
  id: string;
  name: string;
  code: string;
}

export interface ViewUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  college_id: string | null;
  created_at: string;
  college: ViewUserCollege | null;
}

// Assignable roles when editing a user.
export const USER_ROLES = [
  "Super Admin",
  "College Admin",
  "Student Org Admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
