"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare, QrCode, LogOut, FileText, Users, Calendar, Camera, ShoppingBag, Landmark } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children, role, userName }: { children: React.ReactNode, role: string, userName?: string }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["super_admin", "admin", "manager", "moderator"] },
    { name: "Événements", href: "/admin/events", icon: Calendar, roles: ["super_admin", "admin", "manager", "moderator"] },
    { name: "Boutique", href: "/admin/merch", icon: ShoppingBag, roles: ["super_admin", "admin", "manager", "moderator"] },
    { name: "Galerie", href: "/admin/gallery", icon: Camera, roles: ["super_admin", "admin", "manager", "scanner", "moderator"] },
    { name: "Paiements", href: "/admin/payments", icon: CheckSquare, roles: ["super_admin", "admin", "finance", "moderator"] },
    { name: "Scanner", href: "/admin/scanner", icon: QrCode, roles: ["super_admin", "admin", "manager", "scanner", "moderator"] },
    { name: "Billets", href: "/admin/tickets", icon: FileText, roles: ["super_admin", "admin", "moderator"] },
    { name: "Membres", href: "/admin/members", icon: Users, roles: ["super_admin", "admin", "moderator"] },
    { name: "Commissions", href: "/admin/commissions", icon: Landmark, roles: ["super_admin"] },
  ];

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar (Fixed Position) */}
      <div className="hidden md:flex flex-col w-72 bg-neutral-900 border-r border-white/5 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
        <div className="p-8">
          <div className="flex items-center space-x-4 p-5 bg-white/5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Elegant Vertical Divider */}
            <div className="w-1 h-8 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

            <div className="flex flex-col min-w-0">
              <h2 className="text-lg font-black text-white truncate uppercase tracking-tighter leading-none mb-1.5">
                {userName ? userName.split(' ')[0] : "Admin"}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] opacity-80">
                  {role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2 px-6">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-yellow-500/10 text-yellow-500 font-semibold" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>


      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Scrollable for Kinshasa mobile-first Admin) */}
      <nav className="md:hidden fixed bottom-0 w-full border-t border-white/5 bg-neutral-900/95 backdrop-blur-2xl z-50 pb-safe">
        <div className="flex items-center overflow-x-auto px-4 py-1.5 space-x-6 scrollbar-hide no-scrollbar">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-shrink-0 space-y-1 min-w-[70px] transition-all ${
                  isActive 
                    ? "text-yellow-500 scale-110" 
                    : "text-neutral-500"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabMobile" 
                    className="absolute -bottom-1 w-1 h-1 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
