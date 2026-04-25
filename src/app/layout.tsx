import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
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

export const metadata: Metadata = {
  title: "G-Aura TM Events",
  description: "Plateforme événementielle premium.",
  icons: {
    icon: "/Assets/logos/favicon.png",
  },
};

const scrollbarStyles = `
  /* Force Overlay mode */
  html, body, * {
    overflow-y: overlay !important;
    scrollbar-width: thin !important;
    scrollbar-color: #eab308 transparent !important;
  }

  /* Reset all webkit scrollbars */
  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
    background-color: transparent !important;
  }

  ::-webkit-scrollbar-track {
    background: transparent !important;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #eab308 !important;
    border-radius: 10px !important;
    /* This makes it look "inside" because it floats over content */
    border: 1px solid rgba(0,0,0,0.1) !important;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #facc15 !important;
  }

  /* KILL ARROWS AT THE ROOT */
  ::-webkit-scrollbar-button {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  ::-webkit-scrollbar-corner {
    background: transparent !important;
  }
`;

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
