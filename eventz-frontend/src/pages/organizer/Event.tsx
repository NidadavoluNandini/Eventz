import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createEvent, updateEvent } from "../../api/events.api";
import api from "../../utils/axios";

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
type TicketFormType = {
  type?: string;
  name: string;
  description?: string;
  price?: number;
  quantity?: number;
  available?: number;
  gst?: number;
  finalPrice?: number;
  gstIncluded?: boolean;
  subTickets?: {
    name: string;
    price: number;
    quantity?: number;
    gst?: number;
    finalPrice: number;
    gstIncluded?: boolean;
  }[];
};

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

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

type FormStep =
  | "userInfo"
  | "basic"
  | "schedule"
  | "media"
  | "tickets"
  | "payment"
  | "review"
  | "preview";

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
  } catch (e) {
    console.error("Geocode error", e);
  }
  return [20.5937, 78.9629];
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const locationHook = useLocation() as any;

  const editMode = locationHook.state?.editMode || false;
  const existingEvent = locationHook.state?.eventData || null;

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("userInfo");
  const [completedSections, setCompletedSections] = useState<Set<FormStep>>(
    new Set()
  );
  const [returnToReviewAfterEdit, setReturnToReviewAfterEdit] =
    useState<FormStep | null>(null);

  // Simple toast + modal state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // USER INFO
const [userFieldConfig, setUserFieldConfig] = useState({
  linkedin: false,
  gender: false,
  altPhone: false,
  altEmail: false,
  dob: false,
  country: false,
  state: false,
  postalCode: false,
  organization: false,
  designation: false,
  collegeId: false,
  employeeId: false,
  tShirtSize: false,
  emergencyContactName: false,
  emergencyContactPhone: false,
});

  // BASIC
  
  const [title, setTitle] = useState(existingEvent?.title || "");
  const [description, setDescription] = useState(
    existingEvent?.description || ""
  );
  const [category, setCategory] = useState<string>(
    existingEvent?.category || "Technology"
  );
  const [city, setCity] = useState(existingEvent?.city || "");
  const [locationText, setLocationText] = useState(
    existingEvent?.location || ""
  );
  const [themeColor, setThemeColor] = useState(
    existingEvent?.themeColor || THEME_COLORS[0]
  );

  // DATE/TIME
  const [startDate, setStartDate] = useState(
    existingEvent?.startDate
      ? new Date(existingEvent.startDate).toISOString().split("T")[0]
      : ""
  );
  const [endDate, setEndDate] = useState(
    existingEvent?.endDate
      ? new Date(existingEvent.endDate).toISOString().split("T")[0]
      : ""
  );
  const [startTime, setStartTime] = useState(existingEvent?.startTime || "");
  const [endTime, setEndTime] = useState(existingEvent?.endTime || "");

  // MEDIA
  const [bannerImageUrl, setBannerImageUrl] = useState<string | undefined>(
    existingEvent?.bannerImageUrl
  );
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    existingEvent?.mediaUrls || []
  );
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // TICKETS
  const [tickets, setTickets] = useState<Ticket[]>(
    existingEvent?.tickets?.map((t: any) => ({
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: t.name,
      price: t.price ?? 0,
      quantity: t.quantity ?? 0,
      gst: t.gst ?? 0,
      finalPrice: t.finalPrice ?? 0,
      subTickets:
        t.subTickets?.map((s: any) => ({
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: s.name,
          price: s.price ?? 0,
          quantity: s.quantity ?? 0,
          gst: s.gst ?? 0,
          finalPrice: s.finalPrice ?? 0,
        })) || [],
      isExpanded: false,
    })) || []
  );

  // PAYMENT SETTINGS
  const [paymentSettings, setPaymentSettings] = useState({
    collectPaymentCharges: false,
    platformFeePercent: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMapCenter, setPreviewMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]);
const [form, setForm] = useState({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  city: '',
  category: '',
  bannerImageUrl: '',
  mediaUrls: [] as string[],
  tickets: [] as TicketFormType[],
  registrationOpen: true,
  attendeeFieldConfig: {
    alwaysRequired: ['firstName', 'lastName', 'email', 'phone'],
    optional: { /* ...existing booleans... */ },
  },
  paymentSettings: {
    collectPaymentCharges: false,
    platformFeePercent: 0,
  },
  otherAttendeesConfig: {
    enabled: false,
    requiredFields: ['name', 'email', 'phone'], // default trio
  },
});

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const calculateFinalPrice = (
    price: number,
    gst: number,
    platformFeePercent?: number
  ): number => {
    if (!price || price <= 0) return 0;
    let base = price + (price * gst) / 100;
    if (platformFeePercent && platformFeePercent > 0) {
      base += (price * platformFeePercent) / 100;
    }
    return Number(base.toFixed(2));
  };

  const markSectionComplete = (section: FormStep) => {
    setCompletedSections((prev) => new Set(prev).add(section));
  };

  const isSectionCompleted = (section: FormStep): boolean =>
    completedSections.has(section);

  const canNavigateToStep = (step: FormStep) => {
    if (step === "userInfo") return true;
    if (step === "basic") return isSectionCompleted("userInfo");
    if (step === "schedule")
      return isSectionCompleted("userInfo") && isSectionCompleted("basic");
    if (step === "media")
      return (
        isSectionCompleted("userInfo") &&
        isSectionCompleted("basic") &&
        isSectionCompleted("schedule")
      );
    if (step === "tickets")
      return (
        isSectionCompleted("userInfo") &&
        isSectionCompleted("basic") &&
        isSectionCompleted("schedule") &&
        isSectionCompleted("media")
      );
    if (step === "payment")
      return (
        isSectionCompleted("userInfo") &&
        isSectionCompleted("basic") &&
        isSectionCompleted("schedule") &&
        isSectionCompleted("media") &&
        isSectionCompleted("tickets")
      );
    if (step === "review" || step === "preview")
      return (
        isSectionCompleted("userInfo") &&
        isSectionCompleted("basic") &&
        isSectionCompleted("schedule") &&
        isSectionCompleted("media") &&
        isSectionCompleted("tickets") &&
        isSectionCompleted("payment")
      );
    return false;
  };

  // VALIDATION

const validateUserInfoConfig = (): boolean => {
  // nothing mandatory except the implicit 4 core fields
  markSectionComplete("userInfo");
  return true;
};

  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Event title is required";
    if (!description.trim())
      newErrors.description = "Description is required";
    if (!category) newErrors.category = "Category is required";

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (isValid) markSectionComplete("basic");
    return isValid;
  };

  const validateSchedule = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!city.trim()) newErrors.city = "City is required";
    if (!locationText.trim())
      newErrors.location = "Venue is required";

    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";

    if (startDate && endDate) {
      const sd = new Date(startDate);
      const ed = new Date(endDate);
      if (ed < sd) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (isValid) markSectionComplete("schedule");
    return isValid;
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
    const isValid = Object.keys(newErrors).length === 0;
    if (isValid) markSectionComplete("tickets");
    return isValid;
  };

  const validatePaymentInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (
      paymentSettings.collectPaymentCharges &&
      (paymentSettings.platformFeePercent < 0 ||
        paymentSettings.platformFeePercent > 100)
    ) {
      newErrors.platformFeePercent =
        "Platform fee percentage must be between 0 and 100";
    }
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (isValid) markSectionComplete("payment");
    return isValid;
  };

  // MEDIA UPLOAD HELPERS

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url as string;
  };

  const handleBannerChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadImage(file);
      setBannerImageUrl(url);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleGalleryChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingGallery(true);
    try {
      const uploaded: string[] = [];
      for (const f of Array.from(files)) {
        const url = await uploadImage(f);
        uploaded.push(url);
      }
      setMediaUrls((prev) => [...prev, ...uploaded]);
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setMediaUrls((prev) => prev.filter((u) => u !== url));
  };

  // STEP NAVIGATION

  const goToStep = (step: FormStep, fromReview = false) => {
    if (!canNavigateToStep(step) && !fromReview) return;
    setErrors({});
    if (fromReview) {
      setReturnToReviewAfterEdit("review");
    }
    setCurrentStep(step);
    scrollTop();
  };

  const handleNext = async () => {
    setErrors({});

    if (returnToReviewAfterEdit) {
      if (currentStep === "basic") {
        if (validateBasicInfo()) {
          setReturnToReviewAfterEdit(null);
          setCurrentStep("review");
          scrollTop();
        }
        return;
      }
      if (currentStep === "schedule") {
        if (validateSchedule()) {
          setReturnToReviewAfterEdit(null);
          setCurrentStep("review");
          scrollTop();
        }
        return;
      }
      if (currentStep === "media") {
        markSectionComplete("media");
        setReturnToReviewAfterEdit(null);
        setCurrentStep("review");
        scrollTop();
        return;
      }
      if (currentStep === "tickets") {
        if (validateTickets()) {
          setReturnToReviewAfterEdit(null);
          setCurrentStep("review");
          scrollTop();
        }
        return;
      }
    }

    if (currentStep === "userInfo") {
      if (validateUserInfoConfig()) {
        setCurrentStep("basic");
        scrollTop();
      }
    } else if (currentStep === "basic") {
      if (validateBasicInfo()) {
        setCurrentStep("schedule");
        scrollTop();
      }
    } else if (currentStep === "schedule") {
      if (validateSchedule()) {
        setCurrentStep("media");
        scrollTop();
      }
    } else if (currentStep === "media") {
      markSectionComplete("media");
      setCurrentStep("tickets");
      scrollTop();
    } else if (currentStep === "tickets") {
      if (validateTickets()) {
        setCurrentStep("payment");
        scrollTop();
      }
    } else if (currentStep === "payment") {
      if (validatePaymentInfo()) {
        markSectionComplete("review");
        if (locationText && city) {
          setPreviewMapCenter(await geocodeLocation(locationText, city));
        } else {
          setPreviewMapCenter([20.5937, 78.9629]);
        }
        setCurrentStep("preview");
        scrollTop();
      }
    } else if (currentStep === "review") {
      if (locationText && city) {
        setPreviewMapCenter(await geocodeLocation(locationText, city));
      } else {
        setPreviewMapCenter([20.5937, 78.9629]);
      }
      setCurrentStep("preview");
      scrollTop();
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep === "basic") setCurrentStep("userInfo");
    else if (currentStep === "schedule") setCurrentStep("basic");
    else if (currentStep === "media") setCurrentStep("schedule");
    else if (currentStep === "tickets") setCurrentStep("media");
    else if (currentStep === "payment") setCurrentStep("tickets");
    else if (currentStep === "review") setCurrentStep("payment");
    else if (currentStep === "preview") setCurrentStep("review");
    scrollTop();
  };

  // TICKET HELPERS

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
        ticket.id === id
          ? { ...ticket, isExpanded: !ticket.isExpanded }
          : ticket
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
          subTickets: ticket.subTickets.filter(
            (sub) => sub.id !== subTicketId
          ),
        };
      })
    );
  };

  const updateTicket = (
    id: string,
    field: keyof Ticket,
    value: any
  ) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id !== id) return ticket;
        let updatedTicket = { ...ticket };
        switch (field) {
          case "price": {
            const price = Number(value) || 0;
            updatedTicket.price = price;
            if (price <= 0) {
              updatedTicket.gst = 0;
              updatedTicket.finalPrice = 0;
            } else {
              updatedTicket.finalPrice = calculateFinalPrice(
                price,
                updatedTicket.gst,
                paymentSettings.collectPaymentCharges
                  ? paymentSettings.platformFeePercent
                  : 0
              );
            }
            break;
          }
          case "gst": {
            const gst = Number(value) || 0;
            updatedTicket.gst = gst;
            updatedTicket.finalPrice = calculateFinalPrice(
              ticket.price,
              gst,
              paymentSettings.collectPaymentCharges
                ? paymentSettings.platformFeePercent
                : 0
            );
            break;
          }
          case "quantity": {
            updatedTicket.quantity = Number(value) || 0;
            break;
          }
          case "name": {
            updatedTicket.name = String(value);
            break;
          }
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
              case "price": {
                const price = Number(value) || 0;
                updatedSub.price = price;
                if (price <= 0) {
                  updatedSub.gst = 0;
                  updatedSub.finalPrice = 0;
                } else {
                  updatedSub.finalPrice = calculateFinalPrice(
                    price,
                    updatedSub.gst,
                    paymentSettings.collectPaymentCharges
                      ? paymentSettings.platformFeePercent
                      : 0
                  );
                }
                break;
              }
              case "gst": {
                const gst = Number(value) || 0;
                updatedSub.gst = gst;
                updatedSub.finalPrice = calculateFinalPrice(
                  sub.price,
                  gst,
                  paymentSettings.collectPaymentCharges
                    ? paymentSettings.platformFeePercent
                    : 0
                );
                break;
              }
              case "quantity": {
                updatedSub.quantity = Number(value) || 0;
                break;
              }
              case "name": {
                updatedSub.name = String(value);
                break;
              }
            }
            return updatedSub;
          }),
        };
      })
    );
  };

  // SUBMIT

const handleSubmit = async () => {
  if (!validateTickets()) return;
  if (!validatePaymentInfo()) return;

  setIsLoading(true);
  const payload = {
    title,
    description,
    category,
    city,
    location: locationText,
    startDate,
    endDate,
    startTime,
    endTime,
    themeColor: {
      name: themeColor.name,
      value: themeColor.value,
      class: themeColor.class,
    },
    bannerImageUrl: bannerImageUrl || undefined,
    mediaUrls,
    tickets: tickets.map((t) => ({
      name: t.name,
      price: t.price,
      gst: t.gst,
      finalPrice: t.finalPrice,
      gstIncluded: true,
      subTickets:
        t.subTickets.length > 0
          ? t.subTickets.map((sub) => ({
              name: sub.name,
              price: sub.price,
              gst: sub.gst,
              finalPrice: sub.finalPrice,
              gstIncluded: true,
            }))
          : undefined,
    })),
    status: "PUBLISHED",
    attendeeFieldConfig: {
      alwaysRequired: ["firstName", "lastName", "email", "phone"],
      optional: userFieldConfig,
    },
    paymentSettings,
    otherAttendeesConfig: form.otherAttendeesConfig, // ✅ add this line
  };

  try {
    if (editMode && existingEvent?._id) {
      await updateEvent(existingEvent._id, payload);
      showToast("success", "Event updated successfully!");
    } else {
      await createEvent(payload);
      showToast("success", "Event created successfully!");
    }

    setShowSuccessModal(true);
    setTimeout(() => {
      navigate("/organizer/events");
    }, 1000);
  } catch (err: any) {
    console.error("EVENT SAVE ERROR", err?.response?.data || err);
    const message =
      err?.response?.data?.message?.join?.(", ") || "Failed to save event";
    showToast("error", message);
  } finally {
    setIsLoading(false);
  }
};


  const steps = [
    { id: "userInfo" as FormStep, label: "User Info", number: 1 },
    { id: "basic" as FormStep, label: "Basic Info", number: 2 },
    { id: "schedule" as FormStep, label: "Schedule", number: 3 },
    { id: "media" as FormStep, label: "Media", number: 4 },
    { id: "tickets" as FormStep, label: "Tickets", number: 5 },
    { id: "payment" as FormStep, label: "Payment Info", number: 6 },
    { id: "review" as FormStep, label: "Review", number: 7 },
    { id: "preview" as FormStep, label: "Preview", number: 8 },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-[100dvh]
 bg-gray-50 py-4 px-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm text-white shadow-md ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-1">
              {editMode ? "Event Updated" : "Event Created"}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-5">
              Your event has been saved successfully.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/organizer/events");
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Go to My Events
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/organizer/events")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
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
            <h1 className="text-2xl font-bold text-gray-800">
              {editMode ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-gray-500 text-sm">
              Fill in the details below
            </p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = isSectionCompleted(step.id);
              const isPast =
                getCurrentStepIndex() > index || isCompleted;
              const clickable = canNavigateToStep(step.id);

              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1"
                >
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    disabled={!clickable}
                    className={`flex flex-col items-center relative group ${
                      !clickable ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110"
                          : isCompleted || isPast
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500 hover:scale-105"
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center transition-colors ${
                        isActive
                          ? "text-indigo-600 font-semibold"
                          : isCompleted || isPast
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 relative hidden md:block">
                      <div
                        className={`h-full rounded transition-colors ${
                          getCurrentStepIndex() > index ||
                          isCompleted ||
                          isPast
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4 min-h-[500px]">
          {/* USER INFO */}
{/* UserInfo step: just selection, no text inputs */}
{currentStep === "userInfo" && (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        Attendee Fields Configuration
      </h2>
      <p className="text-sm text-gray-500">
        First name, last name, email, and phone will always be required on the registration form. Select any extra fields you want to collect from attendees.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Always required
        </h3>
        <ul className="space-y-1 text-sm text-gray-600 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <li>• First Name</li>
          <li>• Last Name</li>
          <li>• Email</li>
          <li>• Phone Number</li>
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Optional fields
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { key: "linkedin", label: "LinkedIn Profile URL" },
            { key: "gender", label: "Gender" },
            { key: "altPhone", label: "Alternate Phone" },
            { key: "altEmail", label: "Alternate Email" },
            { key: "dob", label: "Date of Birth" },
            { key: "country", label: "Country" },
            { key: "state", label: "State" },
            { key: "postalCode", label: "Postal Code" },
            { key: "organization", label: "Organization / College" },
            { key: "designation", label: "Designation / Role" },
            { key: "collegeId", label: "College ID" },
            { key: "employeeId", label: "Employee ID" },
            { key: "tShirtSize", label: "T-shirt Size" },
            {
              key: "emergencyContactName",
              label: "Emergency Contact Name",
            },
            {
              key: "emergencyContactPhone",
              label: "Emergency Contact Phone",
            },
          ].map((f) => (
            <label
              key={f.key}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                checked={userFieldConfig[f.key as keyof typeof userFieldConfig]}
                onChange={(e) =>
                  setUserFieldConfig((prev) => ({
                    ...prev,
                    [f.key]: e.target.checked,
                  }))
                }
              />
              <span className="text-gray-700">{f.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

          {/* BASIC */}
          {currentStep === "basic" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-500">
                  Tell us about your event
                </p>
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
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-none ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                    errors.category
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Theme Color
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setThemeColor(color as any)
                      }
                      className={`w-8 h-8 rounded-full ${color.class} transition-all flex-shrink-0 ${
                        themeColor.value === color.value
                          ? "ring-1 ring-offset-4 ring-indigo-350 scale-100"
                          : "hover:scale-120"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected{" "}
                  <span className="font-semibold">
                    {themeColor.name}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {currentStep === "schedule" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Schedule & Location
                </h2>
                <p className="text-sm text-gray-500">
                  When and where is your event?
                </p>
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
                    onChange={(e) => setCity(e.target.value)}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Location{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                      errors.location
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter venue address"
                    value={locationText}
                    onChange={(e) =>
                      setLocationText(e.target.value)
                    }
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.startDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(e.target.value)
                      }
                    />
                    <input
                      type="time"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.startTime
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={startTime}
                      onChange={(e) =>
                        setStartTime(e.target.value)
                      }
                    />
                  </div>
                  {(errors.startDate || errors.startTime) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate || errors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.endDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={endDate}
                      onChange={(e) =>
                        setEndDate(e.target.value)
                      }
                    />
                    <input
                      type="time"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                        errors.endTime
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={endTime}
                      onChange={(e) =>
                        setEndTime(e.target.value)
                      }
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

          {/* MEDIA */}
          {currentStep === "media" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Event Media
                </h2>
                <p className="text-sm text-gray-500">
                  Add images for your event (optional)
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Banner image (hero)
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    Optional – shown at top of event page
                  </span>
                </label>
                <div className="relative inline-block">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                    onClick={() =>
                      document
                        .getElementById("banner-input")
                        ?.click()
                    }
                  >
                    Choose File
                  </button>
                  <span className="ml-2 text-sm text-gray-600 align-middle">
                    {bannerImageUrl ? "1 file selected" : "No file chosen"}
                  </span>
                  <input
                    id="banner-input"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </div>
                {uploadingBanner && (
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading banner...
                  </p>
                )}
                {bannerImageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Banner preview
                    </p>
                    <img
                      src={bannerImageUrl}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Gallery images
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    Optional – shown in event gallery
                  </span>
                </label>
                <div className="relative inline-block">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                    onClick={() =>
                      document
                        .getElementById("gallery-input")
                        ?.click()
                    }
                  >
                    Choose Files
                  </button>
                  <span className="ml-2 text-sm text-gray-600 align-middle">
                    {mediaUrls.length > 0
                      ? `${mediaUrls.length} file${
                          mediaUrls.length > 1 ? "s" : ""
                        } selected`
                      : "No file chosen"}
                  </span>
                  <input
                    id="gallery-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                </div>
                {uploadingGallery && (
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading gallery images...
                  </p>
                )}
                {mediaUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Gallery preview
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {mediaUrls.map((url) => (
                        <div
                          key={url}
                          className="relative group"
                        >
                          <img
                            src={url}
                            alt="Gallery"
                            className="w-full h-20 object-cover rounded-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(url)
                            }
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          

          {/* TICKETS */}

          
          {currentStep === "tickets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Ticket Configuration
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add tickets and addons with pricing
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTicket}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm shadow-md"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Ticket
                </button>
              </div>

              {errors.tickets && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 
                         11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">
                    {errors.tickets}
                  </p>
                </div>
              )}

              {tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-indigo-600"
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
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">
                    No Tickets Added
                  </p>
                  <p className="text-sm text-gray-500">
                    Click "Add Ticket" to create your first ticket
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket, index) => {
                    const isFree = ticket.price <= 0;
                    return (
                      <div
                        key={ticket.id}
                        className={`bg-white rounded-xl border-2 transition-all shadow-sm ${
                          ticket.isExpanded
                            ? "border-indigo-300"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            toggleTicketExpansion(ticket.id)
                          }
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-sm">
                                {ticket.name || `Ticket ${index + 1}`}
                                {isFree && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    FREE
                                  </span>
                                )}
                                {ticket.subTickets.length > 0 && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                    {ticket.subTickets.length} Addons
                                  </span>
                                )}
                              </h3>
                              {!ticket.isExpanded && (
                                <p className="text-xs text-gray-500">
                                  {ticket.quantity || 0} tickets •{" "}
                                  {isFree
                                    ? "Free"
                                    : ticket.finalPrice.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isFree && (
                              <div className="text-right mr-2">
                                <p className="text-lg font-bold text-green-600">
                                  {ticket.finalPrice.toFixed(2)}
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
                                className={`w-5 h-5 transition-transform ${
                                  ticket.isExpanded ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    "Delete this ticket?"
                                  )
                                ) {
                                  removeTicket(ticket.id);
                                }
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {ticket.isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 mb-2">
                              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-indigo-600"
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
                                Main Ticket Details
                              </h4>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Ticket Name
                                    <span className="text-red-500">
                                      *
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="e.g., VIP, General"
                                    value={ticket.name}
                                    onChange={(e) =>
                                      updateTicket(
                                        ticket.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Quantity
                                    <span className="text-gray-400">
                                      {" "}
                                      (Optional)
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="0"
                                    min={0}
                                    value={
                                      ticket.quantity === 0
                                        ? ""
                                        : ticket.quantity
                                    }
                                    onChange={(e) =>
                                      updateTicket(
                                        ticket.id,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="0"
                                    min={0}
                                    value={
                                      ticket.price === 0
                                        ? ""
                                        : ticket.price
                                    }
                                    onChange={(e) =>
                                      updateTicket(
                                        ticket.id,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    GST %
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                                    placeholder="0"
                                    min={0}
                                    max={100}
                                    value={
                                      ticket.gst === 0
                                        ? ""
                                        : ticket.gst
                                    }
                                    onChange={(e) =>
                                      updateTicket(
                                        ticket.id,
                                        "gst",
                                        e.target.value
                                      )
                                    }
                                    disabled={isFree}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Final Price
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-bold text-green-600"
                                    value={ticket.finalPrice.toFixed(2)}
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                  Addons
                                </h4>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addSubTicket(ticket.id)
                                  }
                                  className="px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                                >
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
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                  Addons
                                </button>
                              </div>
                              {ticket.subTickets.length > 0 && (
                                <div className="space-y-2">
                                  {ticket.subTickets.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                                    >
                                      <div className="grid grid-cols-6 gap-2 items-end">
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Addon Name
                                          </label>
                                          <input
                                            type="text"
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition outline-none text-sm"
                                            placeholder="Addon name"
                                            value={sub.name}
                                            onChange={(e) =>
                                              updateSubTicket(
                                                ticket.id,
                                                sub.id,
                                                "name",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Price
                                          </label>
                                          <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition outline-none text-sm"
                                            placeholder="Price"
                                            min={0}
                                            value={
                                              sub.price === 0
                                                ? ""
                                                : sub.price
                                            }
                                            onChange={(e) =>
                                              updateSubTicket(
                                                ticket.id,
                                                sub.id,
                                                "price",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                        <div className="col-span-1">
                                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Final Price
                                          </label>
                                          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-green-600 text-center">
                                            {sub.finalPrice.toFixed(2)}
                                          </div>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeSubTicket(
                                                ticket.id,
                                                sub.id
                                              )
                                            }
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition w-full"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
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
            </div>
          )}

          {/* PAYMENT INFO */}
          {currentStep === "payment" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Payment Preferences
                </h2>
                <p className="text-sm text-gray-500">
                  Configure whether you want to collect additional platform
                  charges from attendees.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="collectCharges"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={paymentSettings.collectPaymentCharges}
                  onChange={(e) =>
                    setPaymentSettings((p) => ({
                      ...p,
                      collectPaymentCharges: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="collectCharges"
                  className="text-sm font-medium text-gray-700"
                >
                  Collect additional platform charges from attendees
                </label>
              </div>

              {paymentSettings.collectPaymentCharges && (
                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                      errors.platformFeePercent
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={paymentSettings.platformFeePercent}
                    onChange={(e) =>
                      setPaymentSettings((p) => ({
                        ...p,
                        platformFeePercent: Number(
                          e.target.value || 0
                        ),
                      }))
                    }
                    placeholder="e.g. 5"
                  />
                  {errors.platformFeePercent && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.platformFeePercent}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    This percentage will be added on top of ticket price and
                    considered together with GST at registration.
                  </p>
                </div>
              )}
              {/* OTHER ATTENDEES CONFIG */}
<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="text-sm font-semibold text-gray-800">
        Other attendees
      </p>
      <p className="text-xs text-gray-500">
        When enabled, ask details for additional attendees if quantity &gt; 1.
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        setForm((prev) => ({
          ...prev,
          otherAttendeesConfig: {
            enabled: !prev.otherAttendeesConfig?.enabled,
            requiredFields:
              prev.otherAttendeesConfig?.requiredFields ??
              ['name', 'email', 'phone'],
          },
        }))
      }
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        form.otherAttendeesConfig?.enabled ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          form.otherAttendeesConfig?.enabled ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
</div>

            </div>
          )}

          {/* REVIEW */}
          {currentStep === "review" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Review Event Details
                </h2>
                <p className="text-sm text-gray-500">
                  Double-check everything before publishing
                </p>
              </div>

             <div className="space-y-3">
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <span className="text-xl">👤</span> User Information Fields
      </h3>
    </div>
    <div className="space-y-1 text-sm">
      <p>
        <span className="font-medium text-gray-700">
          Always required:
        </span>{" "}
        First Name, Last Name, Email, Phone
      </p>
      <p>
        <span className="font-medium text-gray-700">
          Optional fields enabled:
        </span>{" "}
        {Object.entries(userFieldConfig)
          .filter(([_, enabled]) => enabled)
          .map(([key]) => key)
          .join(", ") || "None"}
      </p>
    </div>
  </div>


                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">📝</span> Basic Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => goToStep("basic", true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">
                        Title:
                      </span>{" "}
                      {title}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        Category:
                      </span>{" "}
                      {category}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        Theme:
                      </span>{" "}
                      {themeColor.name}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">📅</span> Schedule & Location
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        goToStep("schedule", true)
                      }
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">
                        City:
                      </span>{" "}
                      {city}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        Venue:
                      </span>{" "}
                      {locationText}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        Start:
                      </span>{" "}
                      {startDate
                        ? `${formatDate(startDate)} at ${startTime}`
                        : "-"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        End:
                      </span>{" "}
                      {endDate
                        ? `${formatDate(endDate)} at ${endTime}`
                        : "-"}
                    </p>
                  </div>
                </div>

                {(bannerImageUrl || mediaUrls.length > 0) && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-xl">🖼️</span> Media
                      </h3>
                      <button
                        type="button"
                        onClick={() => goToStep("media", true)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {bannerImageUrl && (
                        <span>Banner image set</span>
                      )}
                      {mediaUrls.length > 0 && (
                        <span>
                          {mediaUrls.length} gallery image
                          {mediaUrls.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-xl">🎟️</span> Tickets (
                      {tickets.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => goToStep("tickets", true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tickets.map((t, i) => (
                      <div
                        key={t.id}
                        className="text-sm bg-white p-2 rounded border border-gray-200"
                      >
                        <p className="font-medium text-gray-800">
                          {i + 1}. {t.name} -{" "}
                          {t.price <= 0
                            ? "FREE"
                            : t.finalPrice.toFixed(2)}
                        </p>
                        {t.subTickets.length > 0 && (
                          <p className="text-xs text-gray-600 ml-4">
                            {t.subTickets.length} addon option
                            {t.subTickets.length > 1 ? "s" : ""}{" "}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">💰</span> Payment
                      Preferences
                    </h3>
                    <button
                      type="button"
                      onClick={() => goToStep("payment", true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">
                        Collect charges:
                      </span>{" "}
                      {paymentSettings.collectPaymentCharges
                        ? "Yes"
                        : "No"}
                    </p>
                    {paymentSettings.collectPaymentCharges && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Platform fee:
                        </span>{" "}
                        {paymentSettings.platformFeePercent}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {currentStep === "preview" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Event Preview
                </h2>
                <p className="text-sm text-gray-500">
                  This is how your event will appear
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {(bannerImageUrl || category) && (
                  <img
                    src={
                      bannerImageUrl ||
                      "https://via.placeholder.com/1200x400?text=Event+Banner"
                    }
                    alt={title}
                    className="w-full h-64 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span
                        className={`inline-block px-3 py-1 ${
                          themeColor.class
                        } text-white text-xs font-bold rounded-full mb-2`}
                      >
                        {category}
                      </span>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {title || "Event Title"}
                      </h1>
                      <p className="text-gray-600">
                        {description || "Event description"}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                             002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">
                          {startDate && endDate
                            ? `${formatDate(startDate)} - ${formatDate(
                                endDate
                              )}`
                            : "Event dates"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {startTime && endTime
                            ? `${startTime} - ${endTime}`
                            : "Times not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 
                             0 01-2.827 0l-4.244-4.243a8 8 0 
                             1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">
                          {locationText || "Event location"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {city || "City not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {locationText && city && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-indigo-600"
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
                      </h3>
                      <div className="mb-3 p-3 rounded-lg bg-indigo-50/40">
                        <p className="font-semibold text-gray-900">
                          {locationText}
                        </p>
                        <p className="text-sm text-gray-600">
                          {city}
                        </p>
                      </div>
                      <div className="rounded-xl overflow-hidden border-2 border-indigo-500/60">
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

                  <h3 className="font-semibold text-gray-800 mb-3">
                    Available Tickets
                  </h3>
                  <div className="grid gap-3">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {t.name}
                            </h4>
                            {t.subTickets.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {t.subTickets.length} addon option
                                {t.subTickets.length > 1 ? "s" : ""}{" "}
                                available
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">
                              {t.price <= 0
                                ? "FREE"
                                : t.finalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {mediaUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Gallery
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {mediaUrls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="Gallery"
                            className="w-full h-20 object-cover rounded-md border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {currentStep !== "userInfo" && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm flex items-center gap-2"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
          )}

          <div className="flex gap-3 sm:ml-auto">
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
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm flex items-center gap-2"
              >
                Next
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {isLoading && (
                  <svg
                    className="animate-spin h-4 w-4"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 
                         0 5.373 0 12h4zm2 5.291A7.962 
                         7.962 0 014 12H0c0 3.042 1.135 
                         5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {editMode ? "Update Event" : "Create Event"}
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
