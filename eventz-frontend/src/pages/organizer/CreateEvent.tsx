import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../../api/events.api";

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

const TICKET_TYPES = ["FREE", "EARLY_BIRD", "REGULAR", "VIP"];

interface Ticket {
  type: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  /* BASIC */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("technology");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");

  /* DATE & TIME (IMPORTANT) */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* MEDIA */
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useUrl, setUseUrl] = useState(true);

  /* CAPACITY */
  const [capacity, setCapacity] = useState(0);

  /* TICKETS */
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const toggleTicket = (type: string) => {
    if (tickets.find((t) => t.type === type)) {
      setTickets(tickets.filter((t) => t.type !== type));
    } else {
      setTickets([
        ...tickets,
        {
          type,
          name: type.replace("_", " "),
          price: type === "FREE" ? 0 : 100,
          quantity: 0,
        },
      ]);
    }
  };

  const updateTicket = (type: string, key: keyof Ticket, value: any) => {
    setTickets(
      tickets.map((t) =>
        t.type === type ? { ...t, [key]: Number(value) } : t
      )
    );
  };

  const totalTickets = tickets.reduce(
    (sum, t) => sum + Number(t.quantity || 0),
    0
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (totalTickets !== capacity) {
      alert("Total ticket quantity must equal capacity");
      setIsLoading(false);
      return;
    }

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

      capacity: Number(capacity),

      mediaUrls: imageUrl && useUrl ? [imageUrl] : [],

      tickets: tickets.map((t) => ({
        ...t,
        available: t.quantity,
      })),
    };

    console.log("CREATE EVENT PAYLOAD 👉", payload);

    try {
      await createEvent(payload);
      navigate("/organizer/events");
    } catch (err: any) {
      console.error("CREATE EVENT ERROR:", err.response?.data || err);
      alert(
        err.response?.data?.message?.join(", ") || "Failed to create event"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTicketIcon = (type: string) => {
    switch (type) {
      case "FREE":
        return "🎁";
      case "EARLY_BIRD":
        return "🐦";
      case "REGULAR":
        return "🎫";
      case "VIP":
        return "👑";
      default:
        return "🎟️";
    }
  };

  const getTicketColor = (type: string) => {
    switch (type) {
      case "FREE":
        return "from-green-500 to-emerald-600";
      case "EARLY_BIRD":
        return "from-blue-500 to-cyan-600";
      case "REGULAR":
        return "from-purple-500 to-indigo-600";
      case "VIP":
        return "from-amber-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/organizer/events")}
            className="text-gray-600 hover:text-gray-800 transition"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Create New Event
            </h1>
            <p className="text-gray-500 text-sm">
              Fill in the details below to create your event
            </p>
          </div>
        </div>

        {/* Single Card Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Basic Information
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                    placeholder="Enter event title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-none"
                    placeholder="Describe your event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isLoading}
                  />
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
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Location Details
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                    placeholder="Enter venue address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Date & Time Schedule
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Start Date & Time */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Event Start</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none bg-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none bg-white"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="bg-gradient-to-br from-pink-50 to-red-50 p-5 rounded-xl border border-pink-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-pink-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Event End</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition outline-none bg-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition outline-none bg-white"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-pink-600"
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Event Media
                </h2>
              </div>

              {/* Toggle between URL and File Upload */}
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
                  🔗 Image URL
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
                  📁 Upload File
                </button>
              </div>

              {useUrl ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
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
                        {imageFile
                          ? imageFile.name
                          : "Click to upload or drag and drop"}
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </p>
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

            {/* Capacity & Tickets */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Capacity & Tickets
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                    placeholder="Enter total capacity"
                    value={capacity || ""}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Ticket Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TICKET_TYPES.map((type) => {
                      const isSelected = tickets.find((t) => t.type === type);
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => toggleTicket(type)}
                          disabled={isLoading}
                          className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                            isSelected
                              ? "border-transparent shadow-lg"
                              : "border-gray-300 bg-white hover:border-indigo-300"
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                          {isSelected && (
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${getTicketColor(
                                type
                              )} opacity-90`}
                            ></div>
                          )}
                          <div className="relative z-10 text-center">
                            <div className="text-3xl mb-2">
                              {getTicketIcon(type)}
                            </div>
                            <p
                              className={`font-bold text-sm ${
                                isSelected ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {type.replace("_", " ")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Premium Ticket Cards */}
                {tickets.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">
                      Configure Ticket Details
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {tickets.map((t) => (
                        <div
                          key={t.type}
                          className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-md hover:shadow-xl transition-all"
                        >
                          {/* Ticket Header with Gradient */}
                          <div
                            className={`bg-gradient-to-r ${getTicketColor(
                              t.type
                            )} p-4 text-white`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                  {getTicketIcon(t.type)}
                                </span>
                                <div>
                                  <h3 className="font-bold text-lg">
                                    {t.name}
                                  </h3>
                                  <p className="text-xs opacity-90">
                                    {t.type} TICKET
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleTicket(t.type)}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                                disabled={isLoading}
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

                          {/* Ticket Details */}
                          <div className="p-4 space-y-3">
                            {t.type !== "FREE" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                  💰 Price (₹)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-sm font-semibold"
                                  placeholder="Enter price"
                                  value={t.price || ""}
                                  onChange={(e) =>
                                    updateTicket(t.type, "price", e.target.value)
                                  }
                                  disabled={isLoading}
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-2">
                                🎟️ Available Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-sm font-semibold"
                                placeholder="Enter quantity"
                                value={t.quantity || ""}
                                onChange={(e) =>
                                  updateTicket(
                                    t.type,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          {/* Decorative Pattern */}
                          <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <svg viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="currentColor" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity Summary */}
                <div
                  className={`p-5 rounded-xl border-2 ${
                    totalTickets === capacity && capacity > 0
                      ? "bg-green-50 border-green-300"
                      : "bg-amber-50 border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${
                          totalTickets === capacity && capacity > 0
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span className="font-semibold text-gray-800">
                        Ticket Allocation Summary
                      </span>
                    </div>
                    <span
                      className={`text-2xl font-bold ${
                        totalTickets === capacity && capacity > 0
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {totalTickets} / {capacity}
                    </span>
                  </div>
                  {totalTickets !== capacity && capacity > 0 && (
                    <p className="text-sm text-amber-700">
                      ⚠️ Total ticket quantity must equal event capacity
                    </p>
                  )}
                  {totalTickets === capacity && capacity > 0 && (
                    <p className="text-sm text-green-700">
                      ✅ Capacity allocation complete
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || totalTickets !== capacity}
              className="px-10 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Creating Event...</span>
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
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
