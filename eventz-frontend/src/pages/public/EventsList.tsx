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

      {/* REDUCED SPACING - Was py-12, now py-6 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Loading amazing events...</p>
          </div>
        )}

        {/* 🔴 LIVE EVENTS */}
        {liveEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Live Events
                </h2>
              </div>
              <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                {liveEvents.length} happening now
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liveEvents.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          </section>
        )}

        {/* 🔵 UPCOMING EVENTS */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upcoming Events
                </h2>
              </div>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                {upcomingEvents.length} events
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center py-16">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                No Active Events
              </p>
              <p className="text-gray-500">
                Check back soon for upcoming events in this category
              </p>
            </div>
          )}
      </div>

      <Footer />
    </PublicLayout>
  );
}
