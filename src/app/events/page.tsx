"use client";

import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";

// Données fictives (sera remplacé par un fetch Supabase)
const DUMMY_EVENTS = [
  {
    id: "1",
    title: "G-Aura Exclusive Night",
    date: "24 Mai 2026 • 22h00",
    location: "Pullman Kinshasa Grand Hotel",
    isPremium: true,
  },
  {
    id: "2",
    title: "Afro Tech Festival Vol.3",
    date: "12 Juin 2026 • 18h00",
    location: "Symphonie des Arts",
    isPremium: false,
  },
  {
    id: "3",
    title: "VIP Yacht Party sur le Fleuve",
    date: "05 Juillet 2026 • 15h00",
    location: "Majestic River",
    isPremium: true,
  }
];

export default function EventsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          NOS <span className="text-yellow-500">ÉVÉNEMENTS</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl">
          Découvrez la sélection des expériences les plus exclusives et prestigieuses de la capitale.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DUMMY_EVENTS.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <EventCard {...event} />
          </motion.div>
        ))}
      </div>
    </main>
  );
}
