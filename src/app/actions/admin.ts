"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getPendingOrders() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      events ( title )
    `)
    .eq("status", "pending_validation")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data;
}

export async function validateOrder(orderId: string) {
  const supabase = await createClient();

  // 1. Get order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return { error: "Order not found" };

  // 2. Mark order as completed
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "completed", validated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) return { error: "Failed to update order" };

  // 3. Generate Digital Ticket (QR Code Hash)
  const qrHash = crypto.randomBytes(16).toString("hex");

  const { error: ticketError } = await supabase
    .from("issued_tickets")
    .insert({
      order_id: order.id,
      event_id: order.event_id,
      owner_name: order.customer_name,
      qr_code_hash: qrHash
      // ticket_category_id: order.ticket_category_id
    });

  if (ticketError) return { error: "Failed to generate ticket" };

  revalidatePath("/admin/payments");
  return { success: true, qrHash };
}

export async function getAdminStats() {
  const supabase = await createClient();

  // 1. Total Completed Revenue (CDF)
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("total_price_usd")
    .eq("status", "completed");

  const totalRevenue = completedOrders?.reduce((acc, order) => acc + Number(order.total_price_usd || 0), 0) || 0;

  // 2. Total Tickets Sold vs Total Scanned
  const { data: tickets } = await supabase
    .from("issued_tickets")
    .select("status");

  const totalSold = tickets?.length || 0;
  const totalScanned = tickets?.filter(t => t.status === 'scanned').length || 0;

  // 3. Stats by Event
  const { data: eventStats } = await supabase
    .from("events")
    .select(`
      id,
      title,
      orders (
        total_price_usd,
        status
      ),
      issued_tickets (
        status
      )
    `);

  const formattedEventStats = eventStats?.map(event => {
    const revenue = event.orders
      ?.filter((o: any) => o.status === 'completed')
      .reduce((acc: number, o: any) => acc + Number(o.total_price_usd || 0), 0) || 0;
    
    return {
      id: event.id,
      title: event.title,
      revenue,
      sold: event.issued_tickets?.length || 0,
      scanned: event.issued_tickets?.filter((t: any) => t.status === 'scanned').length || 0
    };
  }) || [];

  return {
    totalRevenue,
    totalSold,
    totalScanned,
    eventStats: formattedEventStats
  };
}
