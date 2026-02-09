import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import PublicLayout from "../../layouts/PublicLayout";
import { getEventById } from "../../api/events.api";
import { getCategoryImage } from "../../utils/categoryImages";
import {
  getEventStatus,
  isRegistrationTimeOpen,
  getCountdown,
} from "../../utils/eventTime";

/* ---------- LEAFLET ICON FIX ---------- */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* ---------- CATEGORY-BASED SHORT DESCRIPTION ---------- */
const categoryFallbackCopy: Record<string, string> = {
  Technology:
    "Join innovators, developers, and creators for a future‑focused technology experience.",
  Science:
    "Explore discoveries, experiments, and ideas shaping the world of science.",
  Arts:
    "Immerse yourself in a creative showcase of art, culture, and expression.",
  Business:
    "Connect with professionals, founders, and leaders to grow your business journey.",
  Sports:
    "Experience the thrill of competition and the energy of live sports.",
  Entertainment:
    "Enjoy an unforgettable dose of fun, performances, and entertainment.",
  Industry:
    "Deep‑dive into industry trends, best practices, and real‑world insights.",
  Health:
    "Learn, share, and engage with experiences that focus on wellness and health.",
  default:
    "Be part of an engaging and memorable event designed for curious minds.",
};

function getShortDescription(event: any): string {
  const rawDesc = (event.description ?? "").trim();
  if (rawDesc.length >= 40) return rawDesc;

  const rawCategory = (event.category ?? "").toString().trim();
  if (!rawCategory) {
    return categoryFallbackCopy.default;
  }

  const normalizedCategory =
    rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

  return (
    categoryFallbackCopy[normalizedCategory] ?? categoryFallbackCopy.default
  );
}

/* ---------- HEIGHT BASED ON DESCRIPTION ---------- */
function getAboutMinHeightClass(description: string | undefined) {
  const len = (description ?? "").trim().length;

  if (len === 0) return "min-h-[80px]";
  if (len < 80) return "min-h-[140px]";
  if (len < 200) return "min-h-[220px]";

  return "min-h-[320px]";
}

/* ---------- HELPERS ---------- */
const geocodeLocation = async (
  location: string,
  city: string
): Promise<[number, number]> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${location}, ${city}`
      )}&limit=1`
    );
    const data = await res.json();
    if (data?.length) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {}
  return [20.5937, 78.9629];
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 79, g: 70, b: 229 };
};

/* format banner date/time nicely */
const formatEventDateTime = (date: string, time: string) => {
  if (!date && !time) return "";
  if (!date) return time || "";
  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return time ? `${datePart} · ${time}` : datePart;
  } catch {
    return `${date} ${time || ""}`;
  }
};

/* ---------- COMPONENT ---------- */
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]);
  const [activeTab, setActiveTab] = useState<"about" | "location" | "gallery">(
    "about"
  );
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedSubTicket, setSelectedSubTicket] = useState<string | null>(
    null
  );

  /* scroll to top when page opens */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!id) return;

    getEventById(id)
      .then(async (res) => {
        const data = res.data;

        const status = getEventStatus(
          data.startDate,
          data.startTime,
          data.endDate,
          data.endTime
        );

        if (status === "ENDED") {
          navigate("/events");
          return;
        }

        setEvent(data);

        if (data.location && data.city) {
          setMapCenter(await geocodeLocation(data.location, data.city));
        }

        if (status === "UPCOMING") {
          setCountdown(getCountdown(data.startDate, data.startTime));
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading event...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!event) return null;

  const heroImage = event.bannerImageUrl
    ? event.bannerImageUrl
    : getCategoryImage(event.category, event._id);

  const themeColor = event.themeColor?.value || "#4F46E5";
  const rgb = hexToRgb(themeColor);

  const registrationOpen = isRegistrationTimeOpen(
    event.startDate,
    event.startTime,
    event.endDate,
    event.endTime
  );
  const status = getEventStatus(
    event.startDate,
    event.startTime,
    event.endDate,
    event.endTime
  );

  const selectedTicketObj = event.tickets.find(
    (t: any) => t.name === selectedTicket
  );
  const hasSubTickets = selectedTicketObj?.subTickets?.length > 0;

  const canRegister = selectedTicket !== null;

  const handleRegister = () => {
    if (!canRegister || !registrationOpen) return;

    const state: any = { ticketName: selectedTicket };
    if (selectedSubTicket) {
      state.subTicketName = selectedSubTicket;
    }
    navigate(`/events/${event._id}/register`, { state });
  };

  const aboutMinHeightClass = getAboutMinHeightClass(event.description);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location}, ${event.city}`
  )}`;

  return (
    <PublicLayout>
      <style>
        {`
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }
        `}
      </style>

      {/* THEME BACKGROUND */}
      <div
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, #ffffff 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 100%)`,
        }}
      >
        {/* HERO IMAGE */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="relative h-56 overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={heroImage}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

            <div className="relative z-10 h-full flex items-end px-6 pb-5">
              <div className="w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                    style={{ backgroundColor: themeColor }}
                  >
                    {event.category}
                  </span>
                  {status === "LIVE" && (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
                  {event.title}
                </h1>

                {/* LOCATION + FORMATTED DATE/TIME WITH COLORED ICONS */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                  {/* Location pill */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-white">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/90">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 
                             0 01-2.827 0l-4.244-4.243a8 8 0 
                             1111.314 0z"
                        />
                      </svg>
                    </span>
                    <span className="font-medium">
                      {event.location}, {event.city}
                    </span>
                  </div>

                  {/* Date/time pill */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-white/90">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/90">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                             002-2V7a2 2 0 00-2-2H5a2 2 0 
                             00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <span className="font-medium">
                      {formatEventDateTime(event.startDate, event.startTime)}
                      {event.endDate && (
                        <>
                          {" — "}
                          {formatEventDateTime(event.endDate, event.endTime)}
                        </>
                      )}
                    </span>
                  </div>

                  {countdown && (
                    <span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-100 text-[11px] font-semibold">
                      🎉 Starts in {countdown}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT - TWO COLUMN LAYOUT */}
        <div className="max-w-7xl mx-auto px-6 py-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT - TABBED CONTENT */}
            <div className="lg:col-span-2 animate-slide-up">
              {/* TABS */}
              <div
                className="bg-white rounded-t-2xl border-2 border-b-0 overflow-hidden"
                style={{ borderColor: `${themeColor}30` }}
              >
                <div
                  className="flex border-b"
                  style={{ borderColor: `${themeColor}20` }}
                >
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`flex-1 py-3 px-4 font-semibold transition-all ${
                      activeTab === "about"
                        ? "text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={
                      activeTab === "about"
                        ? { backgroundColor: themeColor }
                        : {}
                    }
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab("location")}
                    className={`flex-1 py-3 px-4 font-semibold transition-all ${
                      activeTab === "location"
                        ? "text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={
                      activeTab === "location"
                        ? { backgroundColor: themeColor }
                        : {}
                    }
                  >
                    Location
                  </button>
                  {event.mediaUrls?.length > 0 && (
                    <button
                      onClick={() => setActiveTab("gallery")}
                      className={`flex-1 py-3 px-4 font-semibold transition-all ${
                        activeTab === "gallery"
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={
                        activeTab === "gallery"
                          ? { backgroundColor: themeColor }
                          : {}
                      }
                    >
                      Gallery
                    </button>
                  )}
                </div>
              </div>

              {/* TAB CONTENT */}
              <div
                className={`bg-white rounded-b-2xl border-2 border-t-0 p-6 shadow-lg ${aboutMinHeightClass}`}
                style={{ borderColor: `${themeColor}30` }}
              >
                {activeTab === "about" && (
                  <div>
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        style={{ color: themeColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 
                             12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      About This Event
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {getShortDescription(event)}
                    </p>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        style={{ color: themeColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 
                             0 01-2.827 0l-4.244-4.243a8 8 0 
                             1111.314 0z"
                        />
                      </svg>
                      Event Location
                    </h2>

                    <div
                      className="mb-2 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      style={{ backgroundColor: `${themeColor}10` }}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {event.location}
                        </p>
                        <p className="text-sm text-gray-600">{event.city}</p>
                      </div>

                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
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
                            d="M10 6h8m0 0v8m0-8L9 15"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 19h6a2 2 0 002-2v-6"
                          />
                        </svg>
                        View in Google Maps
                      </a>
                    </div>

                    <div
                      className="rounded-xl overflow-hidden border-2"
                      style={{ borderColor: themeColor }}
                    >
                      <MapContainer
                        center={mapCenter}
                        zoom={15}
                        style={{ height: "240px" }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={mapCenter}>
                          <Popup>{event.location}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}

                {activeTab === "gallery" && event.mediaUrls?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        style={{ color: themeColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 
                             0L16 16m-2-2l1.586-1.586a2 2 0 
                             012.828 0L20 14m-6-6h.01M6 20h12a2 
                             2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                             00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Photo Gallery
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {event.mediaUrls.map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Gallery ${i + 1}`}
                          className="rounded-xl h-40 w-full object-cover hover:opacity-90 transition cursor-pointer shadow-lg hover:shadow-xl"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT - STICKY TICKETS */}
            <div
              className="lg:sticky lg:top-6 h-fit animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                className="bg-white rounded-2xl border-2 shadow-xl overflow-hidden"
                style={{ borderColor: `${themeColor}40` }}
              >
                {/* Header */}
                <div
                  className="p-4 text-white font-bold"
                  style={{ backgroundColor: themeColor }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 
                           00-2 2v3a2 2 0 110 4v3a2 2 0 
                           002 2h14a2 2 0 002-2v-3a2 2 0 
                           110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    <span>Get Tickets</span>
                  </div>
                  {!registrationOpen && (
                    <p className="text-white/90 text-xs mt-1">
                      ⚠️ Registration closed
                    </p>
                  )}
                </div>

                {/* Tickets List */}
                <div className="p-3 space-y-3 max-h-[340px] overflow-y-auto">
                  {event.tickets.map((ticket: any) => {
                    const isSelected = selectedTicket === ticket.name;
                    const ticketHasSub = ticket.subTickets?.length > 0;

                    return (
                      <div key={ticket.name}>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket.name);
                            setSelectedSubTicket(null);
                          }}
                          className={`w-full rounded-xl border-2 p-3 transition-all text-left ${
                            isSelected ? "shadow-md" : ""
                          }`}
                          style={{
                            borderColor: isSelected ? themeColor : "#e5e7eb",
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-900">
                                {ticket.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {ticket.quantity
                                  ? `${ticket.available || 0} left`
                                  : "Unlimited"}
                              </p>
                            </div>
                            <span className="font-bold text-lg text-green-600">
                              ₹{ticket.price || 0}
                            </span>
                          </div>
                        </button>

                        {isSelected && ticketHasSub && (
                          <div
                            className="mt-2 ml-3 space-y-2 p-2 rounded-lg animate-slide-up"
                            style={{
                              backgroundColor: `${themeColor}08`,
                            }}
                          >
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                              Select Option (Optional)
                            </p>
                            {ticket.subTickets.map((sub: any) => (
                              <button
                                key={sub.name}
                                onClick={() => setSelectedSubTicket(sub.name)}
                                className={`w-full flex justify-between p-2 rounded-lg border transition text-sm ${
                                  selectedSubTicket === sub.name
                                    ? "bg-white border-2 shadow-md"
                                    : "bg-white hover:shadow"
                                }`}
                                style={
                                  selectedSubTicket === sub.name
                                    ? { borderColor: themeColor }
                                    : {}
                                }
                              >
                                <span className="font-medium">{sub.name}</span>
                                <span className="font-bold text-green-600">
                                  ₹{sub.price || 0}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Register Button */}
                <div className="p-3 border-t">
                  <button
                    disabled={!registrationOpen || !canRegister}
                    onClick={handleRegister}
                    className="w-full py-3 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-lg transition"
                    style={{ backgroundColor: themeColor }}
                  >
                    {!registrationOpen
                      ? "Registration Closed"
                      : !selectedTicket
                      ? "Select a Ticket"
                      : "Register Now"}
                  </button>
                  {selectedTicket && hasSubTickets && !selectedSubTicket && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      💡 Sub-ticket selection is optional
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t text-center">
                  <p className="text-xs text-gray-600 font-medium">
                    💳 Secure Payment • 🎫 Instant E-Tickets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
