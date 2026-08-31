import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: facilities, error } = await supabase
    .from("facilities")
    .select("*");

  if (error) console.error("Error fetching facilities:", error);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Campus Facilities</h1>
      <pre>{JSON.stringify(facilities, null, 2)}</pre>
    </main>
  );
}
