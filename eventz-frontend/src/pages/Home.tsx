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

      {/* Filter buttons without background container */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <EventsFilter selected={filter} setSelected={setFilter} />
      </div>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold mb-6">
          Upcoming Events
        </h2>

        <EventGrid events={filteredEvents} />
      </section>
    </PublicLayout>
  );
}
