import { useEffect, useState } from "react";
import { getAllEvents } from "../../api/events.api";
import PublicLayout from "../../layouts/PublicLayout";
import EventCard from "../../components/EventCard";
import HeroCarousel from "../../components/HeroCarousel";
import EventsFilter from "../../components/EventsFilter";
import Footer from "../../components/Footer";
import { getEventStatus } from "../../utils/eventTime";

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [, tick] = useState(0); // 🔄 auto refresh

  // ✅ FETCH EVENTS (FIXED)
  useEffect(() => {
    getAllEvents()
      .then((res) => {
        // 🛡️ Handle all possible backend response shapes safely
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.events || [];
        setEvents(list);
      })
      .catch((err) => {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔄 re-evaluate status every minute
  useEffect(() => {
    const i = setInterval(() => tick((v) => v + 1), 60000);
    return () => clearInterval(i);
  }, []);

  const enriched = events
    .map((e) => ({
      ...e,
      status: getEventStatus(
        e.startDate,
        e.startTime,
        e.endDate,
        e.endTime
      ),
    }))
    .filter((e) => e.status !== "ENDED"); // ❌ hide ended events

  const liveEvents = enriched.filter(
    (e) =>
      e.status === "LIVE" &&
      (filter === "ALL" || e.category === filter)
  );

  const upcomingEvents = enriched.filter(
    (e) =>
      e.status === "UPCOMING" &&
      (filter === "ALL" || e.category === filter)
  );

  return (
    <PublicLayout>
      <HeroCarousel />
      <EventsFilter selected={filter} setSelected={setFilter} />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {loading && (
          <p className="text-center text-gray-500">Loading events…</p>
        )}

        {liveEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-red-600">
              🔴 Live Events
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {liveEvents.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          </section>
        )}

        {upcomingEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              🔵 Upcoming Events
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          </section>
        )}

        {!loading &&
          liveEvents.length === 0 &&
          upcomingEvents.length === 0 && (
            <p className="text-center text-gray-500">
              No active events
            </p>
          )}
      </div>

      <Footer />
    </PublicLayout>
  );
}
