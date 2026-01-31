import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createEvent } from "../../api/events.api";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = [
  "Technology",
  "Arts",
  "Sports",
  "Science",
  "Industry",
  "Entertainment",
  "Business",
  "Health",
];

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
}

type FormStep = "basic" | "schedule" | "media" | "tickets" | "review";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");

  /* BASIC */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");

  /* DATE & TIME */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* MEDIA */
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useUrl, setUseUrl] = useState(true);

  /* TICKETS */
  const [tickets, setTickets] = useState<Ticket[]>([]);

  /* VALIDATION */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* MAP */
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center

  // Calculate final price based on base price and GST
  const calculateFinalPrice = (price: number, gst: number): number => {
    return Number((price + (gst/100)*price).toFixed(2));
  };

  // Get Google Maps search URL
  const getGoogleMapsSearchUrl = (location: string, city: string) => {
    const query = encodeURIComponent(`${location}, ${city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Geocode location using Nominatim (OpenStreetMap's free geocoding service)
  const geocodeLocation = async (location: string, city: string) => {
    try {
      const query = encodeURIComponent(`${location}, ${city}`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const addTicket = () => {
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      price: 0,
      quantity: 0,
      gst: 0,
      finalPrice: 0,
    };
    setTickets([...tickets, newTicket]);
  };

  const removeTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
  };

  // ✅ FIXED: Prevents input focus loss and TypeScript errors
  const updateTicket = (id: string, field: keyof Ticket, value: any) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id !== id) return ticket;

        let updatedTicket = { ...ticket };

        switch (field) {
          case "price":
            const price = Number(value) || 0;
            updatedTicket.price = price;
            updatedTicket.finalPrice = calculateFinalPrice(price, ticket.gst);
            break;
          case "gst":
            const gst = Number(value) || 0;
            updatedTicket.gst = gst;
            updatedTicket.finalPrice = calculateFinalPrice(ticket.price, gst);
            break;
          case "quantity":
            updatedTicket.quantity = Number(value) || 0;
            break;
          case "name":
            updatedTicket.name = String(value);
            break;
          case "finalPrice":
            updatedTicket.finalPrice = Number(value) || 0;
            break;
          default:
            break;
        }

        return updatedTicket;
      })
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation functions
  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Event title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSchedule = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!city.trim()) newErrors.city = "City is required";
    if (!location.trim()) newErrors.location = "Venue is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTickets = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (tickets.length === 0) {
      newErrors.tickets = "Add at least one ticket type";
    } else {
      const invalidTickets = tickets.filter((t) => !t.name.trim() || t.price <= 0);
      if (invalidTickets.length > 0) {
        newErrors.tickets = "All tickets must have valid name and price";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setErrors({});

    if (currentStep === "basic") {
      if (validateBasicInfo()) setCurrentStep("schedule");
    } else if (currentStep === "schedule") {
      if (validateSchedule()) {
        // Geocode location when moving to media step
        if (location && city) {
          geocodeLocation(location, city);
        }
        setCurrentStep("media");
      }
    } else if (currentStep === "media") {
      setCurrentStep("tickets");
    } else if (currentStep === "tickets") {
      if (validateTickets()) setCurrentStep("review");
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep === "schedule") setCurrentStep("basic");
    else if (currentStep === "media") setCurrentStep("schedule");
    else if (currentStep === "tickets") setCurrentStep("media");
    else if (currentStep === "review") setCurrentStep("tickets");
  };

  const handleSubmit = async () => {
    if (!validateTickets()) return;

    setIsLoading(true);

    const payload = {
      title,
      description,
      category,
      city,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      mediaUrls: imageUrl && useUrl ? [imageUrl] : [],
      tickets: tickets.map((t) => ({
        type: t.name.toUpperCase().replace(/\s+/g, "_"),
        name: t.name,
        price: t.price,
        quantity: t.quantity || 0,
        available: t.quantity || 0,
        gst: t.gst,
        finalPrice: t.finalPrice,
      })),
    };

    console.log("CREATE EVENT PAYLOAD 👉", payload);

    try {
      await createEvent(payload);
      navigate("/organizer/events");
    } catch (err: any) {
      console.error("CREATE EVENT ERROR:", err.response?.data || err);
      alert(err.response?.data?.message?.join(", ") || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const totalTickets = tickets.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
  const totalRevenue = tickets.reduce(
    (sum, t) => sum + t.finalPrice * Number(t.quantity || 0),
    0
  );

  const steps = [
    { id: "basic", label: "Basic Info", completed: currentStep !== "basic" },
    {
      id: "schedule",
      label: "Schedule",
      completed: ["media", "tickets", "review"].includes(currentStep),
    },
    { id: "media", label: "Media", completed: ["tickets", "review"].includes(currentStep) },
    { id: "tickets", label: "Tickets", completed: currentStep === "review" },
    { id: "review", label: "Review", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/organizer/events")}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
              <p className="text-gray-500 text-sm">Fill in the details below to create your event</p>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep === step.id
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : step.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.completed ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep === step.id
                      ? "text-indigo-600"
                      : step.completed
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                      step.completed ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={{ transform: "translateX(50%)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Basic Information */}
          {currentStep === "basic" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Basic Information</h2>
                <p className="text-sm text-gray-500">Tell us about your event</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: "" });
                  }}
                  disabled={isLoading}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: "" });
                  }}
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Location */}
          {currentStep === "schedule" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Schedule & Location</h2>
                <p className="text-sm text-gray-500">When and where is your event?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors({ ...errors, city: "" });
                    }}
                    disabled={isLoading}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter venue address"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({ ...errors, location: "" });
                    }}
                    onBlur={() => {
                      if (location && city) {
                        geocodeLocation(location, city);
                      }
                    }}
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* OpenStreetMap Preview with Leaflet */}
              {location && city && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Location Preview
                    </h3>
                    <a
                      href={getGoogleMapsSearchUrl(location, city)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View on Google Maps
                    </a>
                  </div>

                  <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
                    <MapContainer
                      center={mapCenter}
                      zoom={15}
                      style={{ height: "250px", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapCenter}>
                        <Popup>
                          <strong>{location}</strong>
                          <br />
                          {city}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div className="mt-3 bg-white rounded-lg p-3 border border-gray-300">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{location}</p>
                        <p className="text-xs text-gray-600">{city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.startDate ? "border-red-500" : "border-gray-300"
                      }`}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (errors.startDate) setErrors({ ...errors, startDate: "" });
                      }}
                      disabled={isLoading}
                    />
                    <input
                      type="time"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.startTime ? "border-red-500" : "border-gray-300"
                      }`}
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        if (errors.startTime) setErrors({ ...errors, startTime: "" });
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {(errors.startDate || errors.startTime) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate || errors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.endDate ? "border-red-500" : "border-gray-300"
                      }`}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (errors.endDate) setErrors({ ...errors, endDate: "" });
                      }}
                      disabled={isLoading}
                    />
                    <input
                      type="time"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.endTime ? "border-red-500" : "border-gray-300"
                      }`}
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        if (errors.endTime) setErrors({ ...errors, endTime: "" });
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {(errors.endDate || errors.endTime) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate || errors.endTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {currentStep === "media" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Event Media</h2>
                <p className="text-sm text-gray-500">Add an image for your event (optional)</p>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUseUrl(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    useUrl
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Banner URL
                </button>
                <button
                  type="button"
                  onClick={() => setUseUrl(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    !useUrl
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {useUrl ? (
                <div>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 mb-1">
                        {imageFile ? imageFile.name : "Click to upload or drag and drop"}
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                    </label>
                  </div>
                </div>
              )}

              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt="Event preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/800x400?text=Invalid+Image";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Tickets - Manual GST Entry */}
          {currentStep === "tickets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Ticket Configuration
                  </h2>
                  <p className="text-sm text-gray-500">
                    Add ticket types (Enter GST manually)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTicket}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Ticket
                </button>
              </div>

              {errors.tickets && <p className="text-red-500 text-sm">{errors.tickets}</p>}

              {tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                  <p className="text-gray-600 font-medium mb-1">No tickets added yet</p>
                  <p className="text-sm text-gray-500">
                    Click "Add Ticket" to create your first ticket type
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-indigo-300 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-700">
                            Ticket #{index + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTicket(ticket.id)}
                          disabled={isLoading}
                          className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ticket Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none"
                            placeholder="e.g., VIP Pass"
                            value={ticket.name}
                            onChange={(e) => updateTicket(ticket.id, "name", e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity <span className="text-gray-400">(Optional)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none"
                            placeholder="0"
                            value={ticket.quantity || ""}
                            onChange={(e) => updateTicket(ticket.id, "quantity", e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Price (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none"
                            placeholder="0.00"
                            value={ticket.price || ""}
                            onChange={(e) => updateTicket(ticket.id, "price", e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GST Amount (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none"
                            placeholder="0.00"
                            value={ticket.gst || ""}
                            onChange={(e) => updateTicket(ticket.id, "gst", e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Final Price (₹)
                          </label>
                          <div className="w-full px-4 py-2.5 bg-green-50 border-2 border-green-200 rounded-lg font-bold text-green-800 text-center">
                            ₹{ticket.finalPrice.toFixed(2)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {ticket.price.toFixed(2)} + {ticket.gst.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tickets.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Total Tickets</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {totalTickets || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Ticket Types</p>
                      <p className="text-2xl font-bold text-purple-600">{tickets.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Potential Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Review & Submit</h2>
                <p className="text-sm text-gray-500">
                  Please review your event details before submitting
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">Basic Information</h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep("basic")}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-600">Title:</span>{" "}
                      <span className="font-medium">{title}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Category:</span>{" "}
                      <span className="font-medium">{category}</span>
                    </p>
                    <p className="text-gray-600">
                      Description: <span className="text-gray-800">{description}</span>
                    </p>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">Schedule & Location</h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep("schedule")}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-600">City:</span>{" "}
                      <span className="font-medium">{city}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Venue:</span>{" "}
                      <span className="font-medium">{location}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Start:</span>{" "}
                      <span className="font-medium">
                        {startDate} at {startTime}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">End:</span>{" "}
                      <span className="font-medium">
                        {endDate} at {endTime}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">Tickets</h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep("tickets")}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{ticket.name}</p>
                          <p className="text-xs text-gray-600">
                            Quantity: {ticket.quantity || "Not specified"} | GST: ₹
                            {ticket.gst.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-700">
                            ₹{ticket.finalPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">incl. GST</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Tickets</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {totalTickets || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Potential Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between mt-6">
          {currentStep !== "basic" && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Back
            </button>
          )}

          <div className="flex gap-4 ml-auto">
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Cancel
            </button>

            {currentStep !== "review" ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Creating...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}