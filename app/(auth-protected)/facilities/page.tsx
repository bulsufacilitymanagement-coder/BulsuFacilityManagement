import Facilities from "@/components/pages/facilities/Facilities";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";
import { redirect } from "next/navigation";

export default async function FacilitiesPage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  return <Facilities user={user} />;
}
