import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getEventById } from "../../api/events.api";
import PublicLayout from "../../layouts/PublicLayout";
import { getCategoryImage } from "../../utils/categoryImages";
import {
  getEventStatus,
  isRegistrationOpen,
  getCountdown,
} from "../../utils/eventTime";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ---------- IMAGE URL HELPER ---------- */
const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const backendUrl = import.meta.env.VITE_API_URL;
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `${backendUrl}/${cleanUrl}`;
};

// Geocode location using Nominatim
const geocodeLocation = async (location: string, city: string): Promise<[number, number]> => {
  try {
    const query = encodeURIComponent(`${location}, ${city}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lat), parseFloat(lon)];
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return [20.5937, 78.9629];
};

/* ---------- COMPONENT ---------- */
export default function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);

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

        // Geocode the location
        if (data.location && data.city) {
          const coords = await geocodeLocation(data.location, data.city);
          setMapCenter(coords);
        }

        if (status === "UPCOMING") {
          setCountdown(getCountdown(data.startDate, data.startTime));
        }
      })
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [id, location.key, navigate]);

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading event details...</p>
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

  const getGoogleMapsSearchUrl = (location: string, city: string) => {
    const query = encodeURIComponent(`${location}, ${city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">

        {/* HERO SECTION - COMPACT */}
        <div className="relative h-[350px] bg-slate-900">
          <img
            src={heroImage}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />

          <div className="relative z-10 h-full flex items-end max-w-7xl mx-auto px-6 pb-8">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white text-slate-900 rounded-full text-xs font-bold uppercase">
                  {event.category}
                </span>
                <StatusBadge status={status} />
                {countdown && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-bold border border-white/30">
                    Starts in {countdown}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-white text-sm mb-6">
                <span><strong>Location:</strong> {event.location}, {event.city}</span>
                <span><strong>Date:</strong> {displayDate}</span>
                <span><strong>Time:</strong> {event.startTime} – {event.endTime}</span>
              </div>

              {registrationOpen && (
                <Link
                  to={`/events/${event._id}/register`}
                  className="inline-block px-6 py-2.5 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Register Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-10">

              {/* ABOUT */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-slate-900">
                  About This Event
                </h2>
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </section>

              {/* LOCATION MAP */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-slate-900">
                  Event Location
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{event.location}</p>
                      <p className="text-sm text-slate-600">{event.city}</p>
                    </div>
                    <a
                      href={getGoogleMapsSearchUrl(event.location, event.city)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border-2 border-slate-900 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-900 hover:text-white transition-colors"
                    >
                      View on Google Maps
                    </a>
                  </div>

                  <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                    <MapContainer
                      center={mapCenter}
                      zoom={15}
                      style={{ height: "300px", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapCenter}>
                        <Popup>
                          <div className="text-center p-2">
                            <strong className="text-sm font-bold">{event.location}</strong>
                            <br />
                            <span className="text-xs text-gray-600">{event.city}</span>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </section>

              {/* GALLERY */}
              {Array.isArray(event.mediaUrls) && event.mediaUrls.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-slate-900">
                    Event Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {event.mediaUrls.map((url: string, i: number) => (
                      <div key={i} className="border-2 border-slate-200 rounded-lg overflow-hidden hover:border-slate-900 transition-colors">
                        <img
                          src={getImageUrl(url)}
                          alt={`Event media ${i + 1}`}
                          className="w-full h-full object-cover aspect-video"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x225?text=Image+Not+Available";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN - TICKETS */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="border-2 border-slate-900 rounded-lg overflow-hidden">
                
                {/* Header */}
                <div className="bg-slate-900 text-white p-4">
                  <h3 className="text-xl font-bold">Available Tickets</h3>
                </div>

                {/* Tickets List */}
                <div className="p-4 space-y-2">
                  {event.tickets && event.tickets.length > 0 ? (
                    event.tickets.map((ticket: any) => (
                      <TicketCard 
                        key={ticket._id} 
                        ticket={ticket}
                        eventId={event._id}
                        registrationOpen={registrationOpen}
                      />
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-6 text-sm">No tickets available</p>
                  )}
                </div>

                {/* Register Button */}
                {event.tickets && event.tickets.length > 0 && (
                  <div className="p-4 pt-0">
                    <Link
                      to={registrationOpen ? `/events/${event._id}/register` : "#"}
                      onClick={(e) => !registrationOpen && e.preventDefault()}
                      className={`block text-center py-2.5 rounded-lg font-bold text-sm transition-colors ${
                        registrationOpen
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {registrationOpen ? "Register Now" : "Registrations Closed"}
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

/* ---------- UI COMPONENTS ---------- */

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    UPCOMING: "bg-slate-700 text-white",
    LIVE: "bg-red-600 text-white animate-pulse",
    ENDED: "bg-slate-500 text-white",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status]}`}>
      {status === "LIVE" ? "LIVE NOW" : status}
    </span>
  );
}

function TicketCard({ 
  ticket, 
  eventId, 
  registrationOpen 
}: { 
  ticket: any;
  eventId: string;
  registrationOpen: boolean;
}) {
  return (
    <Link
      to={registrationOpen ? `/events/${eventId}/register` : "#"}
      onClick={(e) => !registrationOpen && e.preventDefault()}
      className={`block border border-slate-200 rounded-lg p-3 transition-all ${
        registrationOpen 
          ? 'hover:border-slate-900 cursor-pointer' 
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-base text-slate-900">
            {ticket.name || ticket.type}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {ticket.available} available
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-900">
            {ticket.finalPrice === 0 ? "FREE" : `₹${ticket.finalPrice.toLocaleString()}`}
          </p>
        </div>
      </div>
    </Link>
  );
}