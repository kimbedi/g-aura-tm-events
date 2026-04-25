"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Ticket, Calendar, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface HomeClientProps {
  featuredEvent: any;
}

export default function HomeClient({ featuredEvent }: HomeClientProps) {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-yellow-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-neutral-800/50 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 min-h-[90vh] flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left order-2 md:order-1"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.05] mb-8 uppercase">
              L'EXCELLENCE DE <br className="hidden xl:block" />
              L'ÉVÉNEMENTIEL À <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">KINSHASA</span>.
            </h1>
            
            <p className="text-base md:text-lg text-neutral-400 max-w-md mx-auto md:mx-0 mb-10 leading-relaxed font-light">
              Billetterie premium, expériences immersives et merchandising exclusif. 
              Découvrez une nouvelle ère de divertissement au cœur de l'Afrique.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href={featuredEvent ? `/checkout/${featuredEvent.id}` : "/events"} className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95">
                  <Ticket className="w-5 h-5" />
                  <span>Réserver</span>
                </button>
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white px-8 py-4 rounded-full font-medium transition-all backdrop-blur-md">
                <span>Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Logo with Fluid Shadow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="flex justify-center items-center relative order-1 md:order-2 mb-12 md:mb-0"
          >
            {/* Background Glow */}
            <div className="absolute w-[80%] h-[80%] bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" />
            
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px]"
              style={{ filter: "drop-shadow(0 20px 60px rgba(234, 179, 8, 0.2))" }}
            >
              <Image 
                src="/Assets/logos/G-Aura-Events.png" 
                alt="G-Aura Events" 
                width={480}
                height={480}
                className="w-full h-auto object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Featured Event Card */}
        {featuredEvent && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-24 p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl"
          >
            <div className="bg-neutral-900/40 backdrop-blur-3xl rounded-[2.2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-white/5">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6 flex-1 mb-6 md:mb-0 text-center md:text-left">
                {featuredEvent.image_url && (
                  <div className="w-full md:w-24 aspect-video md:aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <img src={featuredEvent.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                    <h3 className="text-2xl font-bold tracking-tight">{featuredEvent.title}</h3>
                    {featuredEvent.is_premium && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-8 text-neutral-400">
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <Calendar className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">
                        {new Date(featuredEvent.date_time).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <MapPin className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{featuredEvent.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <Link href={`/checkout/${featuredEvent.id}`}>
                  <button className="w-full md:w-auto px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-yellow-500 transition-all shadow-xl">
                    Acheter un billet
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
