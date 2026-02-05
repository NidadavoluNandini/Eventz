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

const THEME_COLORS = [
  { name: "Blue", value: "#4F46E5", class: "bg-indigo-600" },
  { name: "Red", value: "#DC2626", class: "bg-red-600" },
  { name: "Green", value: "#16A34A", class: "bg-green-600" },
  { name: "Purple", value: "#9333EA", class: "bg-purple-600" },
  { name: "Orange", value: "#EA580C", class: "bg-orange-600" },
  { name: "Pink", value: "#DB2777", class: "bg-pink-600" },
  { name: "Teal", value: "#0D9488", class: "bg-teal-600" },
  { name: "Cyan", value: "#0891B2", class: "bg-cyan-600" },
  { name: "Amber", value: "#D97706", class: "bg-amber-600" },
  { name: "Lime", value: "#65A30D", class: "bg-lime-600" },
  { name: "Emerald", value: "#059669", class: "bg-emerald-600" },
  { name: "Sky", value: "#0284C7", class: "bg-sky-600" },
  { name: "Violet", value: "#7C3AED", class: "bg-violet-600" },
  { name: "Fuchsia", value: "#C026D3", class: "bg-fuchsia-600" },
  { name: "Rose", value: "#E11D48", class: "bg-rose-600" },
  { name: "Slate", value: "#475569", class: "bg-slate-600" },
];


interface SubTicket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
  subTickets: SubTicket[];
  isExpanded: boolean;
}

type FormStep = "basic" | "schedule" | "media" | "tickets" | "review" | "preview";

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
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);

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

  // Format date
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  // Calculate final price
  const calculateFinalPrice = (price: number, gst: number): number => {
    if (price === 0) return 0;
    return Number((price + (gst / 100) * price).toFixed(2));
  };

  const addTicket = () => {
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      price: 0,
      quantity: 0,
      gst: 0,
      finalPrice: 0,
      subTickets: [],
      isExpanded: true,
    };
    setTickets([...tickets, newTicket]);
  };

  const removeTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
  };

  const toggleTicketExpansion = (id: string) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === id ? { ...ticket, isExpanded: !ticket.isExpanded } : ticket
      )
    );
  };

  const addSubTicket = (ticketId: string) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        const newSubTicket: SubTicket = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: "",
          price: 0,
          quantity: 0,
          gst: 0,
          finalPrice: 0,
        };
        return {
          ...ticket,
          subTickets: [...ticket.subTickets, newSubTicket],
        };
      })
    );
  };

  const removeSubTicket = (ticketId: string, subTicketId: string) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        return {
          ...ticket,
          subTickets: ticket.subTickets.filter((sub) => sub.id !== subTicketId),
        };
      })
    );
  };

  const updateTicket = (id: string, field: keyof Ticket, value: any) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id !== id) return ticket;

        let updatedTicket = { ...ticket };

        switch (field) {
          case "price":
            const price = Number(value) || 0;
            updatedTicket.price = price;
            if (price === 0) {
              updatedTicket.gst = 0;
            }
            updatedTicket.finalPrice = calculateFinalPrice(price, updatedTicket.gst);
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
          default:
            break;
        }

        return updatedTicket;
      })
    );
  };

  const updateSubTicket = (
    ticketId: string,
    subTicketId: string,
    field: keyof SubTicket,
    value: any
  ) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        return {
          ...ticket,
          subTickets: ticket.subTickets.map((sub) => {
            if (sub.id !== subTicketId) return sub;
            
            let updatedSub = { ...sub };

            switch (field) {
              case "price":
                const price = Number(value) || 0;
                updatedSub.price = price;
                if (price === 0) {
                  updatedSub.gst = 0;
                }
                updatedSub.finalPrice = calculateFinalPrice(price, updatedSub.gst);
                break;
              case "gst":
                const gst = Number(value) || 0;
                updatedSub.gst = gst;
                updatedSub.finalPrice = calculateFinalPrice(sub.price, gst);
                break;
              case "quantity":
                updatedSub.quantity = Number(value) || 0;
                break;
              case "name":
                updatedSub.name = String(value);
                break;
              default:
                break;
            }

            return updatedSub;
          }),
        };
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

  // Validation
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
      const invalidTickets = tickets.filter((t) => !t.name.trim());
      if (invalidTickets.length > 0) {
        newErrors.tickets = "All tickets must have a name";
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
      if (validateSchedule()) setCurrentStep("media");
    } else if (currentStep === "media") {
      setCurrentStep("tickets");
    } else if (currentStep === "tickets") {
      if (validateTickets()) setCurrentStep("review");
    } else if (currentStep === "review") {
      setCurrentStep("preview");
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep === "schedule") setCurrentStep("basic");
    else if (currentStep === "media") setCurrentStep("schedule");
    else if (currentStep === "tickets") setCurrentStep("media");
    else if (currentStep === "review") setCurrentStep("tickets");
    else if (currentStep === "preview") setCurrentStep("review");
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

  themeColor: {
    name: themeColor.name,
    value: themeColor.value,
    class: themeColor.class,
  },

  mediaUrls: imageUrl && useUrl ? [imageUrl] : [],

  tickets: tickets.map((t) => ({
    name: t.name,
    price: t.price,
    gst: t.gst,
    finalPrice: t.finalPrice,
    gstIncluded: true,

    subTickets: t.subTickets.length
      ? t.subTickets.map((sub) => ({
          name: sub.name,
          price: sub.price,
          gst: sub.gst,
          finalPrice: sub.finalPrice,
          gstIncluded: true,
        }))
      : undefined,
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
    { id: "basic", label: "Basic Info", completed: !["basic"].includes(currentStep) },
    {
      id: "schedule",
      label: "Schedule",
      completed: ["media", "tickets", "review", "preview"].includes(currentStep),
    },
    { id: "media", label: "Media", completed: ["tickets", "review", "preview"].includes(currentStep) },
    { id: "tickets", label: "Tickets", completed: ["review", "preview"].includes(currentStep) },
    { id: "review", label: "Review", completed: currentStep === "preview" },
    { id: "preview", label: "Preview", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
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
            <p className="text-gray-500 text-sm">Fill in the details below</p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all z-10 ${
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
                    className={`text-xs mt-2 font-medium text-center ${
                      currentStep === step.id
                        ? "text-indigo-600"
                        : step.completed
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      step.completed ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={{ marginTop: "-28px" }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[calc(100vh-280px)] overflow-y-auto">
          {/* Step 1: Basic Information */}
          {currentStep === "basic" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Basic Information</h2>
                <p className="text-sm text-gray-500">Tell us about your event</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-none ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
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

           <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Event Theme Color
  </label>
  <div className="flex gap-3 overflow-x-auto pb-2">
    {THEME_COLORS.map((color) => (
      <button
        key={color.value}
        type="button"
        onClick={() => setThemeColor(color)}
        className={`w-10 h-10 rounded-full ${color.class} transition-all flex-shrink-0 ${
          themeColor.value === color.value
            ? "ring-1 ring-offset-1 ring-indigo-300 scale-90"
            : "hover:scale-95"
        }`}
        title={color.name}
      />
    ))}
  </div>
  <p className="text-xs text-gray-500 mt-2">
    Selected: <span className="font-semibold">{themeColor.name}</span>
  </p>
</div>

            </div>
          )}

          {/* Step 2: Schedule & Location - FIXED */}
          {currentStep === "schedule" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Schedule & Location</h2>
                <p className="text-sm text-gray-500">When and where is your event?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter venue address"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({ ...errors, location: "" });
                    }}
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* START DATE & TIME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
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
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
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

                {/* END DATE & TIME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
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
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
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
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Event Media</h2>
                <p className="text-sm text-gray-500">Add an image for your event (optional)</p>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUseUrl(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
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
                  className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div>
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
                        className="w-10 h-10 text-gray-400 mb-2"
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
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
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

          {/* Step 4: Tickets - ENHANCED WITH SUB-TICKET GST */}
          {currentStep === "tickets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Ticket Configuration</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Add tickets and sub-tickets with pricing</p>
                </div>
                <button
                  type="button"
                  onClick={addTicket}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Ticket
                </button>
              </div>

              {errors.tickets && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{errors.tickets}</p>
                </div>
              )}

              {tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">No Tickets Added</p>
                  <p className="text-sm text-gray-500">Click "Add Ticket" to create your first ticket</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket, index) => {
                    const isFree = ticket.price === 0;

                    return (
                      <div
                        key={ticket.id}
                        className={`bg-white rounded-xl border-2 transition-all shadow-sm ${
                          ticket.isExpanded ? "border-indigo-300" : "border-gray-200"
                        }`}
                      >
                        {/* Header */}
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleTicketExpansion(ticket.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-sm">
                                {ticket.name || `Ticket #${index + 1}`}
                                {isFree && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    FREE
                                  </span>
                                )}
                                {ticket.subTickets.length > 0 && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                    {ticket.subTickets.length} Options
                                  </span>
                                )}
                              </h3>
                              {!ticket.isExpanded && (
                                <p className="text-xs text-gray-500">
                                  {ticket.quantity || 0} tickets • {isFree ? "Free" : `₹${ticket.finalPrice}`}
                                </p>
                              )}
                            </div>
                            {!isFree && (
                              <div className="text-right mr-2">
                                <p className="text-lg font-bold text-green-600">
                                  ₹{ticket.finalPrice.toFixed(2)}
                                </p>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTicketExpansion(ticket.id);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg"
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${ticket.isExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Delete this ticket?")) {
                                  removeTicket(ticket.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {ticket.isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            {/* Main Ticket Details */}
                            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 mb-4">
                              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                Main Ticket Details
                              </h4>
                              
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Ticket Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="e.g., VIP, General"
                                    value={ticket.name}
                                    onChange={(e) => updateTicket(ticket.id, "name", e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Quantity <span className="text-gray-400">(Optional)</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="Unlimited"
                                    value={ticket.quantity || ""}
                                    onChange={(e) => updateTicket(ticket.id, "quantity", e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Base Price (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="0.00"
                                    value={ticket.price || ""}
                                    onChange={(e) => updateTicket(ticket.id, "price", e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    GST (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-lg transition outline-none text-sm ${
                                      isFree ? "bg-gray-100" : ""
                                    }`}
                                    placeholder="0.00"
                                    value={isFree ? "0.00" : ticket.gst || ""}
                                    onChange={(e) => updateTicket(ticket.id, "gst", e.target.value)}
                                    disabled={isFree}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Final Price
                                  </label>
                                  <div
                                    className={`w-full px-3 py-2 border-2 rounded-lg font-bold text-center text-sm flex items-center justify-center h-[38px] ${
                                      isFree
                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                        : "bg-green-50 border-green-300 text-green-700"
                                    }`}
                                  >
                                    {isFree ? "FREE" : `₹${ticket.finalPrice.toFixed(2)}`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Sub-Tickets Section */}
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  Sub-Ticket Options
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => addSubTicket(ticket.id)}
                                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add Option
                                </button>
                              </div>

                              {ticket.subTickets.length === 0 ? (
                                <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-purple-200">
                                  <p className="text-gray-500 text-xs">No sub-ticket options added</p>
                                  <p className="text-gray-400 text-xs mt-1">Create different pricing tiers for this ticket</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {ticket.subTickets.map((sub, subIndex) => {
                                    const isSubFree = sub.price === 0;
                                    const combinedPrice = ticket.finalPrice + sub.finalPrice;

                                    return (
                                      <div key={sub.id} className="bg-white rounded-lg p-3 border-2 border-purple-100 hover:border-purple-300 transition">
                                        {/* Sub-Ticket Header */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="w-6 h-6 bg-purple-600 text-white rounded text-xs font-bold flex items-center justify-center">
                                            {subIndex + 1}
                                          </span>
                                          <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Sub-ticket name (e.g., Early Bird, Regular)"
                                            value={sub.name}
                                            onChange={(e) => updateSubTicket(ticket.id, sub.id, "name", e.target.value)}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeSubTicket(ticket.id, sub.id)}
                                            className="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500 transition font-medium"
                                          >
                                            Remove
                                          </button>
                                        </div>

                                        {/* Sub-Ticket Pricing */}
                                        <div className="grid grid-cols-5 gap-2">
                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                              Price (₹)
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              className="w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                              placeholder="0.00"
                                              value={sub.price || ""}
                                              onChange={(e) => updateSubTicket(ticket.id, sub.id, "price", e.target.value)}
                                            />
                                          </div>

                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                              GST (%)
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              className={`w-full px-2 py-1.5 border rounded-lg text-xs outline-none ${
                                                isSubFree ? "bg-gray-100" : ""
                                              }`}
                                              placeholder="0.00"
                                              value={isSubFree ? "0.00" : sub.gst || ""}
                                              onChange={(e) => updateSubTicket(ticket.id, sub.id, "gst", e.target.value)}
                                              disabled={isSubFree}
                                            />
                                          </div>

                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                              Sub Final
                                            </label>
                                            <div className={`w-full px-2 py-1.5 border-2 rounded-lg text-xs font-bold text-center ${
                                              isSubFree ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-green-50 border-green-300 text-green-700"
                                            }`}>
                                              {isSubFree ? "FREE" : `₹${sub.finalPrice.toFixed(2)}`}
                                            </div>
                                          </div>

                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                              Combined
                                            </label>
                                            <div className="w-full px-2 py-1.5 bg-purple-600 text-white border-2 border-purple-700 rounded-lg text-xs font-bold text-center">
                                              ₹{combinedPrice.toFixed(2)}
                                            </div>
                                          </div>

                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                              Qty
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              className="w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                              placeholder="∞"
                                              value={sub.quantity || ""}
                                              onChange={(e) => updateSubTicket(ticket.id, sub.id, "quantity", e.target.value)}
                                            />
                                          </div>
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-gray-600">
                                          <span className="font-semibold">Price Breakdown:</span> Main (₹{ticket.finalPrice.toFixed(2)}) + Sub (₹{sub.finalPrice.toFixed(2)}) = <span className="font-bold text-purple-700">₹{combinedPrice.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {tickets.length > 0 && (
                <div className="bg-indigo-600 rounded-xl p-4 text-white">
                  <h3 className="text-sm font-bold mb-3">Summary</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-xs opacity-80">Tickets</p>
                      <p className="text-2xl font-bold">{totalTickets || "∞"}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-xs opacity-80">Types</p>
                      <p className="text-2xl font-bold">{tickets.length}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-xs opacity-80">Revenue</p>
                      <p className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: REVIEW */}
          {currentStep === "review" && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Review & Verify</h2>
                <p className="text-sm text-gray-500">Please review your event details</p>
              </div>

              <div className="space-y-3">
                <div className="border-b pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700 text-sm">Basic Information</h3>
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
                    <p>
                      <span className="text-gray-600">Theme Color:</span>{" "}
                      <span
                        className="inline-block w-4 h-4 rounded ml-1"
                        style={{ backgroundColor: themeColor.value }}
                      ></span>
                      <span className="font-medium ml-2">{themeColor.name}</span>
                    </p>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700 text-sm">Schedule & Location</h3>
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

                <div className="border-b pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700 text-sm">Tickets</h3>
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
                      <div key={ticket.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">{ticket.name}</p>
                            <p className="text-xs text-gray-600">
                              Qty: {ticket.quantity || "∞"} | GST: {ticket.gst}%
                            </p>
                            {ticket.subTickets.length > 0 && (
                              <p className="text-xs text-purple-600 mt-1">
                                {ticket.subTickets.length} sub-options available
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-green-700">
                            {ticket.price === 0 ? "FREE" : `₹${ticket.finalPrice.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Total Tickets</p>
                      <p className="text-xl font-bold text-indigo-600">{totalTickets || "∞"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Revenue</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: PREVIEW */}
          {currentStep === "preview" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Event Preview</h2>
                <p className="text-sm text-gray-500">How your event will appear to attendees</p>
              </div>

              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                <div className="relative h-64">
                  <img
                    src={imageUrl || "https://via.placeholder.com/1200x400?text=Event+Banner"}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <span
                      className="px-3 py-1 text-white text-xs font-bold rounded-full mb-2 inline-block uppercase"
                      style={{ backgroundColor: themeColor.value }}
                    >
                      {category}
                    </span>
                    <span className="ml-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      LIVE NOW
                    </span>
                    <h1 className="text-3xl font-bold text-white mt-2">{title || "Event Title"}</h1>
                    <p className="text-white text-sm mt-1">
                      <strong>Location:</strong> {location || "Venue"}, {city || "City"} •{" "}
                      <strong>Date:</strong> {startDate ? formatDate(startDate) : "TBD"} •{" "}
                      <strong>Time:</strong> {startTime || "TBD"}
                    </p>
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-3">About This Event</h2>
                    <p className="text-gray-300 text-sm">{description || "Event description"}</p>
                  </div>

                  <div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-white font-bold mb-3">Available Tickets</h3>
                      <div className="space-y-3">
                        {tickets.slice(0, 3).map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-semibold text-sm">{ticket.name}</p>
                              <p className="text-gray-400 text-xs">Available</p>
                            </div>
                            <p className="text-white font-bold">
                              {ticket.price === 0 ? "FREE" : `₹${ticket.finalPrice.toFixed(2)}`}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        className="w-full mt-4 py-3 text-white font-bold rounded-lg transition hover:opacity-90"
                        style={{ backgroundColor: themeColor.value }}
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-4">
          {currentStep !== "basic" && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Back
            </button>
          )}

          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>

            {currentStep !== "preview" ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
