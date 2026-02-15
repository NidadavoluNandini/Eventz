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
  const [, tick] = useState(0);

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
    .filter(
      (e) =>
        e.timeStatus !== "ENDED" &&
        (e.status === "PUBLISHED" || e.status === "UNPUBLISHED")
    );

  /* ================= SECTIONS ================= */
  const liveEvents = enrichedEvents.filter(
    (e) =>
      e.timeStatus === "LIVE" && (filter === "ALL" || e.category === filter)
  );

  const upcomingEvents = enrichedEvents.filter(
    (e) =>
      e.timeStatus === "UPCOMING" &&
      (filter === "ALL" || e.category === filter)
  );

  /* ================= UI ================= */
  return (
    <PublicLayout>
      {/* Hero Section - REMOVED GRADIENT OVERLAY */}
      <div className="relative overflow-hidden">
        <HeroCarousel />
      </div>

      {/* Filter Section */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <EventsFilter selected={filter} setSelected={setFilter} />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[100dvh]
 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-600 font-medium mt-4 animate-pulse">
                Loading amazing events...
              </p>
            </div>
          )}

          {/* 🔴 LIVE EVENTS */}
          {liveEvents.length > 0 && (
            <section className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute top-0 left-0"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Live Events
                  </h2>
                  <span className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full font-semibold shadow-lg shadow-red-500/30">
                    {liveEvents.length} happening now
                  </span>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveEvents.map((e, idx) => (
                  <div
                    key={e._id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <EventCard event={e} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 🔵 UPCOMING EVENTS */}
          {upcomingEvents.length > 0 && (
            <section className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Upcoming Events
                  </h2>
                  <span className="text-sm bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full font-semibold">
                    {upcomingEvents.length} events
                  </span>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((e, idx) => (
                  <div
                    key={e._id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <EventCard event={e} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ❌ NO EVENTS */}
          {!loading &&
            liveEvents.length === 0 &&
            upcomingEvents.length === 0 && (
              <div className="text-center py-20 animate-fadeIn">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-slate-400"
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
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No Active Events
                </h3>
                <p className="text-slate-500 text-lg">
                  Check back soon for upcoming events in this category
                </p>
              </div>
            )}
        </div>
      </div>

      <Footer />
    </PublicLayout>
  );
}
