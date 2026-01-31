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
  const [, tick] = useState(0); // 🔄 auto refresh every minute

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    getAllEvents()
      .then((res) => {
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

  /* ================= AUTO TIME RE-EVALUATION ================= */
  useEffect(() => {
    const i = setInterval(() => tick((v) => v + 1), 60000);
    return () => clearInterval(i);
  }, []);

  /* ================= MERGE BACKEND + TIME STATUS ================= */
  const enrichedEvents = events
    .map((e) => ({
      ...e,
      timeStatus: getEventStatus(
        e.startDate,
        e.startTime,
        e.endDate,
        e.endTime
      ),
    }))
    // ❌ Hide ended events
    // ❌ Hide drafts
    // ✅ Show PUBLISHED + UNPUBLISHED
    .filter(
      (e) =>
        e.timeStatus !== "ENDED" &&
        (e.status === "PUBLISHED" || e.status === "UNPUBLISHED")
    );

  /* ================= SECTIONS ================= */

  const liveEvents = enrichedEvents.filter(
    (e) =>
      e.timeStatus === "LIVE" &&
      (filter === "ALL" || e.category === filter)
  );

  const upcomingEvents = enrichedEvents.filter(
    (e) =>
      e.timeStatus === "UPCOMING" &&
      (filter === "ALL" || e.category === filter)
  );

  /* ================= UI ================= */

  return (
    <PublicLayout>
      <HeroCarousel />
      <EventsFilter selected={filter} setSelected={setFilter} />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {loading && (
          <p className="text-center text-gray-500">Loading events…</p>
        )}

        {/* 🔴 LIVE EVENTS */}
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

        {/* 🔵 UPCOMING EVENTS */}
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

        {/* ❌ NO EVENTS */}
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
