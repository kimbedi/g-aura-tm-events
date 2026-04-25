"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl?: string;
  isPremium?: boolean;
}

export default function EventCard({ id, title, date, location, imageUrl, isPremium }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 cursor-pointer"
    >
      {/* Fallback Image / Gradient */}
      <div className="h-64 w-full bg-neutral-800 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black" />
        )}
        
        {isPremium && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Premium
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-neutral-400 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-yellow-500" />
            {date}
          </div>
          <div className="flex items-center text-neutral-400 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-yellow-500" />
            {location}
          </div>
        </div>

        <Link
          href={`/checkout/${id}`}
          className="flex items-center justify-between text-yellow-500 font-medium group-hover:text-yellow-400 transition-colors"
        >
          <span>Réserver</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
