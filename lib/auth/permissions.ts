// Central role gate for booking actions.
// Only College Admins and Student Org Admins may submit reservations;
// Super Admins and public visitors are read-only.
export function canReserveFacility(role: string | null | undefined): boolean {
  return role === "College Admin" || role === "Student Org Admin";
}
