import { useEffect, useState } from "react";
import { getAllEvents } from "../api/events.api";
import PublicLayout from "../layouts/PublicLayout";
import Hero from "../components/Hero";
import EventGrid from "../components/EventGrid";
export default function Home() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getAllEvents().then((res) => setEvents(res.data));
  }, []);

  return (
    <PublicLayout>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-6">
          Upcoming Events
        </h2>

        <EventGrid events={events} />
      </section>
    </PublicLayout>
  );
}
