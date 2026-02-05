import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategoryImage } from "../utils/categoryImages";
import {
  getEventStatus,
  isRegistrationOpen,
  getCountdown,
} from "../utils/eventTime";

export default function EventCard({ event }: any) {
  const image = getCategoryImage(event.category, event._id);

  const publishStatus = event.status;

  if (publishStatus === "DRAFT" || publishStatus === "COMPLETED") {
    return null;
  }

  const timeStatus = getEventStatus(
    event.startDate,
    event.startTime,
    event.endDate,
    event.endTime
  );

  const registrationOpen =
    publishStatus === "PUBLISHED" &&
    isRegistrationOpen(event.startDate, event.startTime);

  const [countdown, setCountdown] = useState<string | null>(
    publishStatus === "PUBLISHED" && timeStatus === "UPCOMING"
      ? getCountdown(event.startDate, event.startTime)
      : null
  );

  useEffect(() => {
    if (publishStatus !== "PUBLISHED" || timeStatus !== "UPCOMING") return;

    const i = setInterval(() => {
      setCountdown(getCountdown(event.startDate, event.startTime));
    }, 60000);

    return () => clearInterval(i);
  }, [publishStatus, timeStatus, event.startDate, event.startTime]);

  const badgeStatus =
    publishStatus === "UNPUBLISHED" ? "UNPUBLISHED" : timeStatus;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={event.title}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* STATUS BADGE */}
        <span
          className={`absolute top-4 right-4 px-3 py-1.5 text-xs rounded-full font-bold shadow-lg backdrop-blur-sm
            ${
              badgeStatus === "LIVE"
                ? "bg-red-600 text-white animate-pulse"
                : badgeStatus === "UPCOMING"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            }
          `}
        >
          {badgeStatus === "LIVE" ? "🔴 LIVE NOW" : badgeStatus}
        </span>

        {/* COUNTDOWN */}
        {publishStatus === "PUBLISHED" &&
          badgeStatus === "UPCOMING" &&
          countdown && (
            <span className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 shadow-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {countdown}
            </span>
          )}

        {/* Capacity Badge */}
        {event.maxAttendees && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 shadow-lg">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {event.maxAttendees} slots
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">{event.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{event.startTime}</span>
          </div>
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
              {event.category}
            </span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Starting at</span>
            <span className="text-2xl font-bold text-slate-900">
              {event.tickets?.[0]?.price === 0 ||
              event.tickets?.[0]?.price === undefined
                ? "FREE"
                : `₹${event.tickets[0].price}`}
            </span>
          </div>

          <button
            disabled={!registrationOpen}
            className={`px-5 py-2.5 text-sm rounded-lg font-bold transition-all duration-300 transform
              ${
                registrationOpen
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }
            `}
          >
            {registrationOpen ? "Register Now" : "Closed"}
          </button>
        </div>
      </div>
    </Link>
  );
}
