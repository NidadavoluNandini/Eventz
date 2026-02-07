// components/EventCard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryImage } from '../utils/categoryImages';
import {
  getEventStatus,
  isRegistrationTimeOpen,
  getCountdown,
} from '../utils/eventTime';

export default function EventCard({ event }: any) {
  const image = getCategoryImage(event.category, event._id);

  const publishStatus = event.status;

  // 1️⃣ Only show published events on Home
  if (publishStatus !== 'PUBLISHED') {
    return null;
  }

  const timeStatus = getEventStatus(
    event.startDate,
    event.startTime,
    event.endDate,
    event.endTime
  );

  // 2️⃣ Registration can be open/closed while still published
  const registrationOpen =
    event.registrationOpen &&
    isRegistrationTimeOpen(
      event.startDate,
      event.startTime,
      event.endDate,
      event.endTime
    );

  const [countdown, setCountdown] = useState<string | null>(
    publishStatus === 'PUBLISHED' && timeStatus === 'UPCOMING'
      ? getCountdown(event.startDate, event.startTime)
      : null
  );

  useEffect(() => {
    if (publishStatus !== 'PUBLISHED' || timeStatus !== 'UPCOMING') return;

    const i = setInterval(() => {
      setCountdown(getCountdown(event.startDate, event.startTime));
    }, 60000);

    return () => clearInterval(i);
  }, [publishStatus, timeStatus, event.startDate, event.startTime]);

  const badgeStatus =
    event.status === 'UNPUBLISHED' ? 'PAUSED' : timeStatus;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={image}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={event.title}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* STATUS BADGE */}
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full font-bold shadow-lg backdrop-blur-sm
            ${
              badgeStatus === 'LIVE'
                ? 'bg-red-600 text-white animate-pulse'
                : badgeStatus === 'UPCOMING'
                ? 'bg-indigo-600 text-white'
                : 'bg-orange-600 text-white'
            }
          `}
        >
          {badgeStatus === 'LIVE' ? '🔴 LIVE' : badgeStatus}
        </span>

        {/* COUNTDOWN */}
        {publishStatus === 'PUBLISHED' &&
          badgeStatus === 'UPCOMING' &&
          countdown && (
            <span className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 text-xs rounded font-semibold flex items-center gap-1">
              <svg
                className="w-3 h-3"
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

        {/* Capacity */}
        {event.maxAttendees && (
          <span className="absolute top-2 left-2 bg-white/90 text-slate-700 px-2 py-1 text-xs rounded font-semibold flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {event.maxAttendees}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>

        {/* Info Row */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-indigo-500"
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
            </svg>
            <span className="font-medium">{event.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-indigo-500"
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

        {/* Category */}
        {event.category && (
          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
            {event.category}
          </span>
        )}

        {/* Price & CTA */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-500">From</span>
            <p className="text-lg font-bold text-slate-900">
              {event.tickets?.[0]?.price === 0 ||
              !event.tickets?.[0]?.price
                ? 'FREE'
                : `₹${event.tickets[0].price}`}
            </p>
          </div>

          <button
            disabled={!registrationOpen}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all
              ${
                registrationOpen
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {registrationOpen ? 'Register' : 'Registration Closed'}
          </button>
        </div>
      </div>
    </Link>
  );
}
