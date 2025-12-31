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

  const status = getEventStatus(
    event.startDate,
    event.startTime,
    event.endDate,
    event.endTime
  );

  const registrationOpen = isRegistrationOpen(
    event.startDate,
    event.startTime
  );

  const [countdown, setCountdown] = useState<string | null>(
    status === "UPCOMING"
      ? getCountdown(event.startDate, event.startTime)
      : null
  );

  useEffect(() => {
    if (status !== "UPCOMING") return;

    const i = setInterval(() => {
      setCountdown(getCountdown(event.startDate, event.startTime));
    }, 60000);

    return () => clearInterval(i);
  }, [status, event.startDate, event.startTime]);

  return (
    <Link
      to={`/events/${event._id}`}
      className="block bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative h-56">
        <img src={image} className="w-full h-full object-cover" />

        {/* STATUS BADGE */}
        <span
          className={`absolute top-4 right-4 px-3 py-1 text-xs rounded-full font-semibold
            ${
              status === "LIVE"
                ? "bg-red-600 text-white"
                : status === "UPCOMING"
                ? "bg-blue-600 text-white"
                : "bg-gray-500 text-white"
            }
          `}
        >
          {status === "LIVE" ? "LIVE NOW" : status}
        </span>

        {/* COUNTDOWN */}
        {status === "UPCOMING" && countdown && (
          <span className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 text-xs rounded-full">
            ⏳ {countdown}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-2">
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>

        <div className="text-sm text-gray-500 flex gap-3">
          <span>📍 {event.city}</span>
          <span>⏰ {event.startTime}</span>
        </div>

        <div className="flex justify-between items-center pt-3">
          <span className="font-bold">
            ₹{event.tickets?.[0]?.price ?? "FREE"}
          </span>

          <button
            disabled={!registrationOpen}
            className={`px-4 py-2 text-sm rounded-lg font-semibold
              ${
                registrationOpen
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }
            `}
          >
            {registrationOpen ? "Register" : "Closed"}
          </button>
        </div>
      </div>
    </Link>
  );
}
