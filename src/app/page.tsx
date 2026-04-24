"use client";

import { motion } from "framer-motion";
import { ArrowRight, Ticket, Calendar, MapPin } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-yellow-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-neutral-800/50 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Navbar Placeholder */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter">
            G-AURA <span className="text-yellow-500 font-light">TM EVENTS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
            <a href="#" className="hover:text-white transition-colors">Événements</a>
            <a href="#" className="hover:text-white transition-colors">Boutique Merch</a>
            <a href="#" className="hover:text-white transition-colors">Galerie</a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-white px-4 py-2 hover:bg-white/5 rounded-full transition-colors">
              Connexion
            </button>
            <button className="text-sm font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-neutral-200 transition-colors">
              Billetterie
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24 min-h-[90vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center space-x-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Prochain Événement</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-8">
            L'EXCELLENCE DE L'ÉVÉNEMENTIEL À <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">KINSHASA</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
            Billetterie premium, expériences immersives et merchandising exclusif. 
            Découvrez une nouvelle ère de divertissement au cœur de l'Afrique.
          </p>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95">
              <Ticket className="w-5 h-5" />
              <span>Acheter un billet</span>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/15 border border-white/5 text-white px-8 py-4 rounded-full font-medium transition-all backdrop-blur-md">
              <span>Voir le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Featured Event Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-24 p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent"
        >
          <div className="bg-neutral-900/80 backdrop-blur-xl rounded-[23px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-white/5">
            <div className="flex-1 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">G-Aura Exclusive Night</h3>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-8 text-neutral-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">24 Mai 2026 • 22h00</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Pullman Kinshasa Grand Hotel</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <button className="w-full md:w-auto px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
                Réserver ma place
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
