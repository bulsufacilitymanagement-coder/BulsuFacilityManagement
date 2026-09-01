import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";
import { UserProvider } from "../providers/userProvider";
import LayoutShell from "./LayoutShell";

export default async function AuthProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      <LayoutShell>{children}</LayoutShell>
    </UserProvider>
  );
}
