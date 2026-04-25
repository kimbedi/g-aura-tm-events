import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import NavbarWrapper from "../components/NavbarWrapper";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const baseTitle = "G-Aura TM Events";
  const baseDescription = "Plateforme événementielle premium à Kinshasa.";

  // Fetch the next upcoming published event for share previews.
  // Uses the admin client so unauthenticated crawlers (Facebook, WhatsApp,
  // Twitter, LinkedIn) can still resolve the metadata even when RLS is strict.
  let title = baseTitle;
  let description = baseDescription;
  let imageUrl: string | undefined;

  try {
    const supabase = createAdminClient();
    const { data: event } = await supabase
      .from("events")
      .select("title, description, location, image_url, date_time")
      .eq("is_published", true)
      .gte("date_time", new Date().toISOString())
      .order("date_time", { ascending: true })
      .limit(1)
      .single();

    if (event) {
      title = `${event.title} • ${baseTitle}`;
      description = event.description?.slice(0, 200) ||
        `${event.title} — ${event.location}. Réservez votre place sur G-Aura TM Events.`;
      imageUrl = event.image_url || undefined;
    }
  } catch {
    // Fall through to defaults if anything goes wrong (DB down, no events, etc.)
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: baseTitle,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white">
        <NavbarWrapper user={user} profile={profile} />
        {children}
      </body>
    </html>
  );
}
