import { getPublishedEvents } from "@/app/actions/events";
import EventsGrid from "@/components/EventsGrid";

export default async function EventsPage() {
  const events = await getPublishedEvents();
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 animate-fade-in-up">
          NOS <span className="text-yellow-500">ÉVÉNEMENTS</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl animate-fade-in-up">
          Découvrez la sélection des expériences les plus exclusives et prestigieuses de la capitale.
        </p>
      </div>

      <EventsGrid events={events} />
    </main>
  );
}
