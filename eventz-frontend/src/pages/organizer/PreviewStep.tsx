// src/pages/organizer/PreviewStep.tsx
import React, { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type ThemeColor = {
  name: string;
  value: string;
  class: string;
};

type Ticket = {
  id: string;
  name: string;
  price: number;
  finalPrice: number;
  subTickets: { id: string; name?: string; price?: number }[];
};

type PreviewStepProps = {
  title: string;
  category: string;
  description: string;
  themeColor: ThemeColor;
  city: string;
  locationText: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  bannerImageUrl?: string;
  mediaUrls: string[];
  tickets: Ticket[];
  previewMapCenter: [number, number];
  formatDate: (date: string) => string;
};

const formatEventDateTime = (date: string, time: string) => {
  if (!date && !time) return "";
  if (!date) return time || "";
  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    return time ? `${datePart} · ${time}` : datePart;
  } catch {
    return `${date} ${time || ""}`;
  }
};

const getAboutMinHeightClass = (description: string | undefined) => {
  const len = (description ?? "").trim().length;
  if (len === 0) return "min-h-[80px]";
  if (len < 80) return "min-h-[140px]";
  if (len < 200) return "min-h-[220px]";
  return "min-h-[320px]";
};

export const PreviewStep: React.FC<PreviewStepProps> = ({
  title,
  category,
  description,
  themeColor,
  city,
  locationText,
  startDate,
  endDate,
  startTime,
  endTime,
  bannerImageUrl,
  mediaUrls,
  tickets,
  previewMapCenter,
  formatDate
}) => {
  const [activeTab, setActiveTab] = useState<"about" | "location" | "gallery">(
    "about"
  );
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedSubTicket, setSelectedSubTicket] = useState<string | null>(
    null
  );

  const themeHex = themeColor?.value || "#4F46E5";
  const aboutMinHeightClass = getAboutMinHeightClass(description);

const selectedTicketObj = tickets.find((t) => t.name === selectedTicket);
const hasSubTickets = !!selectedTicketObj?.subTickets?.length;

  const heroImage =
    bannerImageUrl ||
    "https://via.placeholder.com/1200x400?text=Event+Banner";

  const registrationOpen = true; // preview only

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Event Preview
        </h2>
        <p className="text-sm text-gray-500">
          This is a preview of how your event page will look.
        </p>
      </div>

      <div className="min-h-[100dvh]
 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* HERO IMAGE (matching EventDetails) */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="relative h-56 overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={heroImage}
              alt={title || "Event"}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

            <div className="relative z-10 h-full flex items-end px-6 pb-5">
              <div className="w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                    style={{ backgroundColor: themeHex }}
                  >
                    {category || "Category"}
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
                  {title || "Event Title"}
                </h1>

                {/* Location + formatted date/time pills */}
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
                      {locationText || "Venue"}, {city || "City"}
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
                      {startDate
                        ? formatEventDateTime(startDate, startTime)
                        : "Start not set"}
                      {endDate && (
                        <>
                          {" — "}
                          {formatEventDateTime(endDate, endTime)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT - TWO COLUMN LAYOUT (like EventDetails) */}
        <div className="max-w-7xl mx-auto px-6 pt-0 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT - TABS */}
            <div className="lg:col-span-2">
              {/* Tabs header */}
              <div
                className="bg-white rounded-t-2xl border-2 border-b-0 overflow-hidden"
                style={{ borderColor: `${themeHex}30` }}
              >
                <div
                  className="flex border-b"
                  style={{ borderColor: `${themeHex}20` }}
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
                        ? { backgroundColor: themeHex }
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
                        ? { backgroundColor: themeHex }
                        : {}
                    }
                  >
                    Location
                  </button>
                  {mediaUrls.length > 0 && (
                    <button
                      onClick={() => setActiveTab("gallery")}
                      className={`flex-1 py-3 px-4 font-semibold transition-all ${
                        activeTab === "gallery"
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={
                        activeTab === "gallery"
                          ? { backgroundColor: themeHex }
                          : {}
                      }
                    >
                      Gallery
                    </button>
                  )}
                </div>
              </div>

              {/* Tab content */}
              <div
                className={`bg-white rounded-b-2xl border-2 border-t-0 p-6 shadow-lg ${aboutMinHeightClass}`}
                style={{ borderColor: `${themeHex}30` }}
              >
                {activeTab === "about" && (
                  <div>
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        style={{ color: themeHex }}
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
                      {description ||
                        "Add a detailed description to tell people more about your event."}
                    </p>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        style={{ color: themeHex }}
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
                      style={{ backgroundColor: `${themeHex}10` }}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {locationText || "Venue not set"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {city || "City not set"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl overflow-hidden border-2"
                      style={{ borderColor: themeHex }}
                    >
                      <MapContainer
                        center={previewMapCenter}
                        zoom={15}
                        style={{ height: "240px" }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={previewMapCenter}>
                          <Popup>{locationText}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}

                {activeTab === "gallery" && mediaUrls.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        style={{ color: themeHex }}
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
                      {mediaUrls.map((url, i) => (
                        <img
                          key={url + i}
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

            {/* RIGHT - STICKY TICKETS (preview version, no real register) */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div
                className="bg-white rounded-2xl border-2 shadow-xl overflow-hidden"
                style={{ borderColor: `${themeHex}40` }}
              >
                {/* Header */}
                <div
                  className="p-4 text-white font-bold"
                  style={{ backgroundColor: themeHex }}
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
                    <span>Tickets (preview)</span>
                  </div>
                </div>

                {/* Tickets List */}
                <div className="p-3 space-y-3 max-h-[340px] overflow-y-auto">
                  {tickets.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No tickets configured yet.
                    </p>
                  )}

                  {tickets.map((ticket) => {
                    const isSelected = selectedTicket === ticket.name;
                    const ticketHasSub = ticket.subTickets?.length > 0;

                    return (
                      <div key={ticket.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(ticket.name);
                            setSelectedSubTicket(null);
                          }}
                          className={`w-full rounded-xl border-2 p-3 transition-all text-left ${
                            isSelected ? "shadow-md" : ""
                          }`}
                          style={{
                            borderColor: isSelected ? themeHex : "#e5e7eb"
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-900">
                                {ticket.name || "Ticket"}
                              </p>
                            </div>
                            <span className="font-bold text-lg text-green-600">
                              {ticket.price <= 0
                                ? "FREE"
                                : ticket.finalPrice.toFixed(2)}
                            </span>
                          </div>
                        </button>

                        {isSelected && ticketHasSub && (
                          <div
                            className="mt-2 ml-3 space-y-2 p-2 rounded-lg"
                            style={{
                              backgroundColor: `${themeHex}08`
                            }}
                          >
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                              Select Option (Optional)
                            </p>
                            {ticket.subTickets.map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() =>
                                  setSelectedSubTicket(sub.name ?? sub.id)
                                }
                                className={`w-full flex justify-between p-2 rounded-lg border transition text-sm ${
                                  selectedSubTicket === (sub.name ?? sub.id)
                                    ? "bg-white border-2 shadow-md"
                                    : "bg-white hover:shadow"
                                }`}
                                style={
                                  selectedSubTicket === (sub.name ?? sub.id)
                                    ? { borderColor: themeHex }
                                    : {}
                                }
                              >
                                <span className="font-medium">
                                  {sub.name || "Addon"}
                                </span>
                                {sub.price !== undefined && (
                                  <span className="font-bold text-green-600">
                                    {sub.price <= 0
                                      ? "FREE"
                                      : sub.price.toFixed(2)}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t text-center">
                  <p className="text-xs text-gray-600 font-medium">
                    💳 Secure Payment • 🎫 Instant E‑Tickets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};
