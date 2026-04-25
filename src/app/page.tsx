import { createClient } from "@/utils/supabase/server";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch the next upcoming published event
  const { data: featuredEvent } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(1)
    .single();

  return <HomeClient featuredEvent={featuredEvent} />;
}
