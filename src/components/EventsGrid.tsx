"use client";

import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";

export default function EventsGrid({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return <div className="text-center py-20 text-neutral-500">Aucun événement prévu pour le moment.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <EventCard 
            id={event.id}
            title={event.title}
            date={new Date(event.date_time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            location={event.location}
            imageUrl={event.image_url}
            isPremium={event.is_premium}
          />
        </motion.div>
      ))}
    </div>
  );
}
