import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { getEventById } from "../../api/events.api";
import PublicLayout from "../../layouts/PublicLayout";
import { getCategoryImage } from "../../utils/categoryImages";
import {
  getEventStatus,
  isRegistrationOpen,
  getCountdown,
} from "../../utils/eventTime";

/* ---------- HELPER FUNCTION ---------- */
// Convert relative image paths to absolute URLs
const getImageUrl = (url: string): string => {
  if (!url) return "";
  
  // If it's already a full URL (http/https), return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // If it's a relative path, prepend backend URL
const backendUrl = import.meta.env.VITE_API_URL;  
  // Remove leading slash if present to avoid double slashes
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  
  return `${backendUrl}/${cleanUrl}`;
};

/* ---------- COMPONENT ---------- */
export default function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getEventById(id)
      .then((res) => {
        const data = res.data;

        const status = getEventStatus(
          data.startDate,
          data.startTime,
          data.endDate,
          data.endTime
        );

        // ❌ ENDED EVENTS → DO NOT SHOW
        if (status === "ENDED") {
          navigate("/events");
          return;
        }

        setEvent(data);

        if (status === "UPCOMING") {
          setCountdown(getCountdown(data.startDate, data.startTime));
        }
      })
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [id, location.key, navigate]);

  // 🔄 Auto-update status & countdown
  useEffect(() => {
    if (!event) return;

    const i = setInterval(() => {
      const status = getEventStatus(
        event.startDate,
        event.startTime,
        event.endDate,
        event.endTime
      );

      if (status === "ENDED") {
        navigate("/events");
        return;
      }

      if (status === "UPCOMING") {
        setCountdown(getCountdown(event.startDate, event.startTime));
      } else {
        setCountdown(null);
      }
    }, 60000);

    return () => clearInterval(i);
  }, [event, navigate]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-slate-700 font-semibold text-lg">
              Loading event details…
            </p>
            <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!event) return null;

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

  const heroImage = getCategoryImage(event.category, event._id);

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const displayDate =
    startDate.toDateString() === endDate.toDateString()
      ? startDate.toDateString()
      : `${startDate.toDateString()} – ${endDate.toDateString()}`;

  const totalTickets = event.tickets.reduce(
    (sum: number, t: any) => sum + t.quantity,
    0
  );
  const availableTickets = event.tickets.reduce(
    (sum: number, t: any) => sum + t.available,
    0
  );
  const soldPercentage = Math.round(
    ((totalTickets - availableTickets) / totalTickets) * 100
  );

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-slate-100/20 to-slate-50 min-h-screen">
        {/* ================= HERO ================= */}
        <div className="relative h-[600px] w-full overflow-hidden">
          <img
            src={heroImage}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent" />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl"></div>

          <div className="relative h-full flex items-end max-w-7xl mx-auto px-6 pb-16">
            <div className="space-y-8 w-full">
              <div className="flex flex-wrap gap-3">
                <Badge variant="category">
                  {event.category.toUpperCase()}
                </Badge>
                <StatusBadge status={status} />
                {countdown && (
                  <Badge variant="countdown">⏱️ Starts in {countdown}</Badge>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-x-8 gap-y-4 text-white/95 text-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <span className="font-medium">
                      {event.location}, {event.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <span className="font-medium">{displayDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏰</span>
                    <span className="font-medium">
                      {event.startTime} – {event.endTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* ABOUT */}
            <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  About This Event
                </h2>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>

            {/* EVENT DETAILS */}
            <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Event Details
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoCard icon="📅" label="Date" value={displayDate} />
                <InfoCard
                  icon="⏰"
                  label="Time"
                  value={`${event.startTime} – ${event.endTime}`}
                />
                <InfoCard
                  icon="📍"
                  label="Venue"
                  value={`${event.location}, ${event.city}`}
                />
                <InfoCard
                  icon="👥"
                  label="Capacity"
                  value={`${event.capacity} attendees`}
                />
              </div>
            </section>

            {/* GALLERY - FIXED VERSION */}
            {Array.isArray(event.mediaUrls) && event.mediaUrls.length > 0 && (
              <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Event Gallery
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {event.mediaUrls.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="group rounded-2xl overflow-hidden shadow-lg aspect-video bg-slate-100 hover:shadow-2xl transition-all duration-300"
                    >
                      <img
                        src={getImageUrl(url)}
                        alt={`Event media ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT - TICKET SIDEBAR */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden hover:shadow-3xl transition-all">
              {/* Header */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    Get Your Tickets
                  </h3>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-white/90 text-sm font-medium">
                    <span>{soldPercentage}% sold</span>
                    <span>{availableTickets} remaining</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <div
                      className="bg-gradient-to-r from-slate-300 to-slate-100 h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${soldPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="p-8 space-y-4">
                {event.tickets.map((ticket: any) => (
                  <TicketCard key={ticket.type} ticket={ticket} />
                ))}
              </div>

              {/* CTA Button */}
              <div className="p-8 pt-0">
                <Link
                  to={
                    registrationOpen
                      ? `/events/${event._id}/register`
                      : "#"
                  }
                  onClick={(e) => !registrationOpen && e.preventDefault()}
                  className={`group relative block w-full text-center py-5 rounded-2xl font-bold text-xl transition-all duration-300 overflow-hidden ${
                    registrationOpen
                      ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white hover:shadow-2xl hover:shadow-slate-500/50 hover:scale-105"
                      : "bg-slate-200 cursor-not-allowed text-slate-500"
                  }`}
                >
                  {registrationOpen && (
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                  )}
                  <span className="relative flex items-center justify-center gap-3">
                    {registrationOpen ? (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        Register Now
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Registrations Closed
                      </>
                    )}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

/* ---------- UI COMPONENTS ---------- */

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: string;
}) {
  const styles: any = {
    default: "bg-white/20 backdrop-blur-sm text-white border border-white/30",
    category:
      "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/50",
    countdown:
      "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-700/50",
  };

  return (
    <span
      className={`px-5 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    UPCOMING:
      "bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg shadow-slate-700/50",
    LIVE: "bg-gradient-to-r from-red-600 to-red-700 animate-pulse shadow-lg shadow-red-500/50",
    ENDED: "bg-gradient-to-r from-slate-600 to-slate-700",
  };

  return (
    <span
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white ${map[status]}`}
    >
      {status === "LIVE" && (
        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
      )}
      {status === "LIVE" ? "LIVE NOW" : status}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="group bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="font-bold text-slate-900 text-lg">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: any }) {
  const getTicketStyle = (type: string) => {
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes("vip")) {
      return {
        icon: "👑",
        gradient: "from-amber-50 to-yellow-50",
        border: "border-amber-200",
        badge: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
        priceColor: "text-amber-700",
      };
    }
    
    if (typeLower.includes("early") || typeLower.includes("bird")) {
      return {
        icon: "🐦",
        gradient: "from-slate-50 to-slate-100",
        border: "border-slate-300",
        badge: "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
        priceColor: "text-slate-900",
      };
    }
    
    if (typeLower.includes("regular") || typeLower.includes("general")) {
      return {
        icon: "🎫",
        gradient: "from-slate-50 to-gray-50",
        border: "border-slate-200",
        badge: "bg-gradient-to-r from-slate-600 to-gray-700 text-white",
        priceColor: "text-slate-900",
      };
    }
    
    if (typeLower.includes("free")) {
      return {
        icon: "🎁",
        gradient: "from-green-50 to-emerald-50",
        border: "border-green-200",
        badge: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        priceColor: "text-green-700",
      };
    }
    
    return {
      icon: "🎟️",
      gradient: "from-slate-50 to-slate-100",
      border: "border-slate-300",
      badge: "bg-gradient-to-r from-slate-800 to-slate-900 text-white",
      priceColor: "text-slate-900",
    };
  };

  const style = getTicketStyle(ticket.type);
  const availabilityPercent = Math.round(
    (ticket.available / ticket.quantity) * 100
  );

  return (
    <div
      className={`group relative rounded-2xl p-6 border-2 ${style.border} bg-gradient-to-br ${style.gradient} hover:shadow-xl transition-all duration-300 overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-200/30 rounded-full blur-2xl"></div>
      </div>

      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{style.icon}</span>
            <div>
              <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {ticket.type}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${style.badge}`}
                >
                  {ticket.available} left
                </span>
                {availabilityPercent <= 20 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700">
                    🔥 Almost gone!
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-black ${style.priceColor} whitespace-nowrap`}
            >
              {ticket.price === 0 ? "FREE" : `₹${ticket.price.toLocaleString()}`}
            </div>
            {ticket.price > 0 && (
              <p className="text-xs text-slate-500 font-medium">per ticket</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Availability</span>
            <span>{availabilityPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                availabilityPercent > 50
                  ? "bg-gradient-to-r from-slate-600 to-slate-700"
                  : availabilityPercent > 20
                  ? "bg-gradient-to-r from-slate-500 to-slate-600"
                  : "bg-gradient-to-r from-red-400 to-rose-500"
              }`}
              style={{ width: `${availabilityPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
