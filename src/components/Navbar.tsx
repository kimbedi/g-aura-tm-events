"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X, Globe, User, Ticket, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

interface NavbarProps {
  user: any;
  profile: { full_name?: string; role?: string } | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = profile?.role && ["admin", "manager", "scanner", "super_admin", "moderator"].includes(profile.role);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="relative h-12 w-48">
            <Image 
              src="/Assets/logos/long-G-Aura-Events.png" 
              alt="G-Aura TM Events" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
          <Link href="/events" className="hover:text-white transition-colors">Événements</Link>
          <Link href="/merch" className="hover:text-white transition-colors">Boutique Merch</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Galerie</Link>
          {user && (
            <Link href="/tickets" className="hover:text-white transition-colors">Mes Billets</Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-neutral-400 hover:text-white cursor-pointer transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold">FR | CDF</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              {/* Golden pill button - links to dashboard if admin, my-tickets if user */}
              <Link
                href={isAdmin ? (profile?.role === "super_admin" ? "/super-admin" : "/admin") : "/tickets"}
                className="flex items-center space-x-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{isAdmin ? "Dashboard" : "Mon Compte"}</span>
              </Link>
              {/* Small discreet logout */}
              <form action={logout}>
                <button
                  type="submit"
                  title="Déconnexion"
                  className="text-neutral-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-400/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="flex items-center space-x-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                <User className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col space-y-5"
        >
          <Link href="/events" className="text-lg font-medium text-white" onClick={() => setIsOpen(false)}>Événements</Link>
          <Link href="/merch" className="text-lg font-medium text-white" onClick={() => setIsOpen(false)}>Boutique Merch</Link>
          <Link href="/gallery" className="text-lg font-medium text-white" onClick={() => setIsOpen(false)}>Galerie</Link>
          {user && (
            <Link href="/tickets" className="text-lg font-medium text-yellow-500" onClick={() => setIsOpen(false)}>
              🎟 Mes Billets
            </Link>
          )}
          <hr className="border-white/10" />
          {user ? (
            <div className="flex flex-col space-y-3">
              {isAdmin && (
                <Link
                  href={profile?.role === "super_admin" ? "/super-admin" : "/admin"}
                  className="flex items-center space-x-4 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 group"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-black text-yellow-500 uppercase tracking-tighter">Dashboard</span>
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="flex items-center space-x-2 text-red-400 font-medium">
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-neutral-400">
                <Globe className="w-5 h-5" />
                <span>FR | CDF</span>
              </div>
              <Link href="/login" className="text-white px-4 py-2 bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                Connexion
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
