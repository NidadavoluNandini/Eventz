import { useEffect, useState } from "react";
import { getAllEvents } from "../api/events.api";
import PublicLayout from "../layouts/PublicLayout";
import Hero from "../components/Hero";
import EventGrid from "../components/EventGrid";
import EventsFilter from "../components/EventsFilter";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getAllEvents().then((res) => setEvents(res.data));
  }, []);

  const filteredEvents = events.filter(
    (e) => filter === "ALL" || e.category === filter
  );

  return (
    <PublicLayout>
      <Hero />

      {/* Filters – compact, no big background */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <EventsFilter selected={filter} setSelected={setFilter} />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Upcoming Events
          </h2>
          <span className="text-sm text-gray-500">
            {filteredEvents.length} events
          </span>
        </div>

        <EventGrid events={filteredEvents} />
      </section>
    </PublicLayout>
  );
}
