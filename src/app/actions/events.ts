"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_categories(*)")
    .order("date_time", { ascending: true });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const dateTime = formData.get("dateTime") as string;
  const isPremium = formData.get("isPremium") === "true";
  const file = formData.get("flyer") as File;
  
  let imageUrl = null;
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("flyers")
      .upload(fileName, file);
      
    if (uploadError) throw new Error("Erreur upload image: " + uploadError.message);
    
    const { data: { publicUrl } } = supabase.storage
      .from("flyers")
      .getPublicUrl(fileName);
    imageUrl = publicUrl;
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert([{
      title,
      description,
      location,
      date_time: dateTime,
      is_premium: isPremium,
      image_url: imageUrl,
      is_published: true
    }])
    .select()
    .single();

  if (eventError) throw new Error(eventError.message);

  // Categories
  const categories = JSON.parse(formData.get("categories") as string);
  if (categories && categories.length > 0) {
    const categoriesWithEventId = categories.map((cat: any) => ({
      ...cat,
      event_id: event.id
    }));
    await supabase.from("ticket_categories").insert(categoriesWithEventId);
  }

  revalidatePath("/admin/events");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/");
  return { success: true };
}
