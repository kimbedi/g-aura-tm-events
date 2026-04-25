"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPublishedEvents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("date_time", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data;
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }

  return data;
}
