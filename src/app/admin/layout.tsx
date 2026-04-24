"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare, QrCode, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Paiements", href: "/admin/payments", icon: CheckSquare },
    { name: "Scanner", href: "/admin/scanner", icon: QrCode },
    { name: "Billets", href: "/admin/tickets", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900 sticky top-0 z-50">
        <span className="font-bold text-yellow-500 tracking-wider text-sm">G-AURA ADMIN</span>
        <button className="text-neutral-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-neutral-900 p-6 min-h-screen">
        <div className="font-bold text-yellow-500 tracking-wider text-xl mb-12">
          G-AURA <br/><span className="text-white text-sm font-light">ADMINISTRATION</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
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

        <button className="flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all mt-auto">
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Crucial for Kinshasa mobile-first Admin) */}
      <nav className="md:hidden fixed bottom-0 w-full border-t border-white/5 bg-neutral-900/90 backdrop-blur-xl z-50 pb-safe">
        <div className="flex items-center justify-around p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 w-16 h-14 rounded-xl transition-all ${
                  isActive 
                    ? "text-yellow-500" 
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute bottom-1 w-1 h-1 bg-yellow-500 rounded-full"
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
