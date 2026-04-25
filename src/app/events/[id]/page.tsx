import { getEventById } from "@/app/actions/events";
import { formatDate, formatTime, formatNumber } from "@/utils/format";
import { Calendar, Clock, MapPin, Star, Ticket, ArrowLeft, Users, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event || !event.is_published) {
    notFound();
  }

  // Sort categories by price ascending so "cheapest first" feels natural
  const categories = [...(event.ticket_categories || [])].sort(
    (a: any, b: any) => Number(a.price_usd) - Number(b.price_usd)
  );

  // Total seats across all categories
  const totalCapacity = categories.reduce(
    (sum: number, cat: any) => sum + Number(cat.capacity || 0),
    0
  );

  return (
    <main className="min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center text-neutral-500 hover:text-yellow-500 transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux événements
        </Link>

        {/* Hero — flyer + headline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14 items-start">
          {/* Image */}
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-700">
                <Ticket className="w-24 h-24" />
              </div>
            )}
            {event.is_premium && (
              <div className="absolute top-6 left-6 bg-yellow-500 text-black text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                <Star className="w-3 h-3 fill-current" /> Premium
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="flex flex-col">
            {event.is_premium && (
              <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-3">
                G-Aura Exclusive
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] uppercase mb-6">
              {event.title}
            </h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                    Date
                  </div>
                  <div className="text-base font-semibold capitalize">
                    {formatDate(event.date_time, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                    Heure
                  </div>
                  <div className="text-base font-semibold">{formatTime(event.date_time)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                    Lieu
                  </div>
                  <div className="text-base font-semibold">{event.location}</div>
                </div>
              </div>

              {totalCapacity > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                      Capacité totale
                    </div>
                    <div className="text-base font-semibold">{formatNumber(totalCapacity)} places</div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <Link
              href={`/checkout/${event.id}`}
              className="inline-flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm px-8 py-5 rounded-2xl transition-all active:scale-[0.98] shadow-xl"
            >
              <Ticket className="w-5 h-5" />
              <span>Acheter un billet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <section className="mb-14">
            <h2 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">
              À propos de l'événement
            </h2>
            <div className="bg-neutral-900/60 border border-white/5 rounded-3xl p-8">
              <p className="text-neutral-300 leading-relaxed whitespace-pre-line text-base">
                {event.description}
              </p>
            </div>
          </section>
        )}

        {/* Ticket categories */}
        {categories.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">
              Catégories de billets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat: any, index: number) => {
                const isFirst = index === 0;
                return (
                  <div
                    key={cat.id || cat.name}
                    className={`relative rounded-3xl p-6 border transition-all ${
                      isFirst
                        ? "bg-gradient-to-br from-yellow-500/10 to-neutral-900 border-yellow-500/30"
                        : "bg-neutral-900 border-white/5"
                    }`}
                  >
                    {isFirst && (
                      <div className="absolute -top-2 right-6 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                        Le plus accessible
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-yellow-500">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        {formatNumber(cat.capacity)} places
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        ${formatNumber(cat.price_usd)}
                      </span>
                      <span className="text-xs font-bold text-neutral-500 uppercase">USD</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trust banner + secondary CTA */}
        <section className="bg-neutral-900/60 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-sm font-bold mb-1">Réservation sécurisée</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Billet QR officiel envoyé immédiatement après validation du paiement.
                Mobile Money ou cash sur place — tu choisis.
              </p>
            </div>
          </div>
          <Link
            href={`/checkout/${event.id}`}
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-yellow-500 font-bold px-6 py-3.5 rounded-2xl transition-colors text-sm uppercase tracking-widest shrink-0"
          >
            Réserver
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
