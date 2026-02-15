// src/pages/organizer/CreateEvent.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { createEvent, updateEvent } from "../../api/events.api";
import api from "../../utils/axios";

import { StepHeader } from "../../components/StepHeader";
import { Stepper, FormStep, StepMeta } from "../../components/Stepper";

import { UserInfoStep } from "./UserInfoStep";
import { BasicInfoStep } from "./BasicInfoStep";
import { ScheduleStep } from "./ScheduleStep";
import { MediaStep } from "./MediaStep";
import { TicketsStep } from "./TicketsStep";
import { PaymentStep } from "./PaymentStep";
import { ReviewStep } from "./ReviewStep";
import { PreviewStep } from "./PreviewStep";

type SubTicket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
};

type Ticket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
  subTickets: SubTicket[];
  isExpanded: boolean;
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const locationHook = useLocation() as any;
  const { id } = useParams(); // /organizer/events/edit/:id

  const editModeFromState = locationHook.state?.editMode || false;
  const existingEventFromState = locationHook.state?.eventData || null;

  const editMode = !!id || editModeFromState;
  const existingEvent = existingEventFromState;
  const eventId = id || existingEventFromState?._id;

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("userInfo");
  const [completedSections, setCompletedSections] = useState<Set<FormStep>>(
    () => new Set()
  );
  const [returnToReviewAfterEdit, setReturnToReviewAfterEdit] =
    useState<FormStep | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMapCenter, setPreviewMapCenter] = useState<[number, number]>([
    20.5937,
    78.9629,
  ]);

  const [userFieldConfig, setUserFieldConfig] = useState<
    Record<string, boolean>
  >({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
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

  const [userFieldRequiredConfig, setUserFieldRequiredConfig] = useState<
    Record<string, boolean>
  >({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
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

  // Keep platformFeePercent for TS, but you don't use it in logic/payload
  const [paymentSettings, setPaymentSettings] = useState({
    collectPaymentCharges: false,
    platformFeePercent: 0,
  });

  const [title, setTitle] = useState<string>(existingEvent?.title || "");
  const [description, setDescription] = useState<string>(
    existingEvent?.description || ""
  );
  const [category, setCategory] = useState<string>(
    existingEvent?.category || "Technology"
  );
  const [themeColor, setThemeColor] = useState<any>(
    existingEvent?.themeColor || {
      name: "Blue",
      value: "#4F46E5",
      class: "bg-indigo-600",
    }
  );

  const [city, setCity] = useState<string>(existingEvent?.city || "");
  const [locationText, setLocationText] = useState<string>(
    existingEvent?.location || ""
  );
  const [startDate, setStartDate] = useState<string>(
    existingEvent?.startDate || ""
  );
  const [endDate, setEndDate] = useState<string>(
    existingEvent?.endDate || ""
  );
  const [startTime, setStartTime] = useState<string>(
    existingEvent?.startTime || ""
  );
  const [endTime, setEndTime] = useState<string>(
    existingEvent?.endTime || ""
  );

  const [bannerImageUrl, setBannerImageUrl] = useState<string | undefined>(
    existingEvent?.bannerImageUrl
  );
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    existingEvent?.mediaUrls || []
  );
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [form, setForm] = useState<any>({
    otherAttendeesConfig: {
      enabled: false,
      requiredFields: ["name", "email", "phone"],
    },
  });

const scrollTop = () => {
  formScrollRef.current?.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};


  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };
useEffect(() => {
  scrollTop();
}, [currentStep]);

// ✅ Load tickets when editing an event
useEffect(() => {
  if (!existingEvent) return;

  /* ---------------- USER INFO (Attendee Fields) ---------------- */

  const attendeeCfg = existingEvent.attendeeFieldConfig || {};

  // optional fields
  setUserFieldConfig((prev) => ({
    ...prev,
    ...(attendeeCfg.optional || {}),
  }));

  // required fields
  setUserFieldRequiredConfig((prev) => ({
    ...prev,
    ...(attendeeCfg.required || {}),
  }));

  /* ---------------- TICKETS ---------------- */

  if (existingEvent.tickets?.length) {
    const mappedTickets = existingEvent.tickets.map((t: any) => ({
      id: `ticket-${Date.now()}-${Math.random()}`,
      name: t.name || "",
      price: t.price || 0,
      quantity: t.quantity || 0,
      gst: t.gst || 0,
      finalPrice: t.finalPrice || t.price || 0,
      isExpanded: false,
      subTickets: (t.subTickets || []).map((s: any) => ({
        id: `sub-${Date.now()}-${Math.random()}`,
        name: s.name || "",
        price: s.price || 0,
        quantity: s.quantity || 0,
        gst: 0,
        finalPrice: s.finalPrice || s.price || 0,
      })),
    }));

    setTickets(mappedTickets);
  }
}, [existingEvent]);


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

  const addTicket = () => {
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      name: "",
      price: 0,
      quantity: 0,
      gst: 0,
      finalPrice: 0,
      subTickets: [],
      isExpanded: true,
    };
    setTickets((prev) => [...prev, newTicket]);
  };

  const removeTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTicketExpansion = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isExpanded: !t.isExpanded } : t
      )
    );
  };

  const addSubTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newSub: SubTicket = {
          id: `sub-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          name: "",
          price: 0,
          quantity: 0,
          gst: 0,
          finalPrice: 0,
        };
        return { ...t, subTickets: [...t.subTickets, newSub] };
      })
    );
  };

  const removeSubTicket = (ticketId: string, subTicketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          subTickets: t.subTickets.filter((s) => s.id !== subTicketId),
        };
      })
    );
  };

  const calculateFinalPrice = (price: number, gst: number): number => {
    if (!price || price <= 0) return 0;
    let basePrice = price;
    if (gst && gst > 0) {
      basePrice = basePrice + (basePrice * gst) / 100;
    }
    return Number(basePrice.toFixed(2));
  };

  const updateTicket = (id: string, field: keyof Ticket, value: any) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated: Ticket = { ...t };
        switch (field) {
          case "name":
            updated.name = String(value);
            break;
          case "price": {
            const price = Number(value) || 0;
            updated.price = price;
            updated.finalPrice = price;
            break;
          }
          case "gst":
            updated.gst = Number(value) || 0;
            break;
          case "quantity":
            updated.quantity = Number(value) || 0;
            break;
          default:
            (updated as any)[field] = value;
        }
        return updated;
      })
    );
  };

  const updateSubTicket = (
    ticketId: string,
    subTicketId: string,
    field: keyof SubTicket,
    value: any
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          subTickets: t.subTickets.map((s) => {
            if (s.id !== subTicketId) return s;
            const updated: SubTicket = { ...s };
            switch (field) {
              case "name":
                updated.name = String(value);
                break;
              case "price": {
                const price = Number(value) || 0;
                updated.price = price;
                updated.finalPrice =
                  price === 0 ? 0 : calculateFinalPrice(price, t.gst);
                break;
              }
              case "quantity":
                updated.quantity = Number(value) || 0;
                break;
              default:
                (updated as any)[field] = value;
            }
            return updated;
          }),
        };
      })
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const validateUserInfoConfig = (): boolean => {
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
    if (!locationText.trim()) newErrors.location = "Venue is required";
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

      const invalidSubTickets = tickets.some((t) =>
        t.subTickets.some((sub) => !sub.name.trim())
      );
      if (invalidSubTickets) {
        newErrors.tickets =
          "All addons must have a name. Remove empty addons or give them a name.";
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (isValid) markSectionComplete("tickets");
    return isValid;
  };

  const validatePaymentInfo = (): boolean => {
    setErrors({});
    markSectionComplete("payment");
    return true;
  };

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

  const markSectionComplete = (section: FormStep) => {
    setCompletedSections((prev) => new Set(prev).add(section));
  };

  const isSectionCompleted = (section: FormStep) =>
    completedSections.has(section);

  const canNavigateToStep = (step: FormStep) => {
    if (editMode) return true;
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

  const goToStep = (step: FormStep, fromReview = false) => {
    if (!canNavigateToStep(step) && !fromReview) {
      setErrors({});
      return;
    }
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
          setCurrentStep("preview");
          scrollTop();
        }
        return;
      }

      if (currentStep === "schedule") {
        if (validateSchedule()) {
          setReturnToReviewAfterEdit(null);
          setCurrentStep("preview");
          scrollTop();
        }
        return;
      }

      if (currentStep === "media") {
        markSectionComplete("media");
        setReturnToReviewAfterEdit(null);
        setCurrentStep("preview");
        scrollTop();
        return;
      }

      if (currentStep === "tickets") {
        if (validateTickets()) {
          setReturnToReviewAfterEdit(null);
          setCurrentStep("preview");
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

        setCurrentStep("review");
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

  const steps: StepMeta[] = [
    { id: "userInfo", label: "Attendee Fields", icon: <span>🧾</span> },
    { id: "basic", label: "Basic Info", icon: <span>📝</span> },
    { id: "schedule", label: "Date & Location", icon: <span>📅</span> },
    { id: "media", label: "Media", icon: <span>🖼️</span> },
    { id: "tickets", label: "Tickets", icon: <span>🎫</span> },
    { id: "payment", label: "Payment Info", icon: <span>💳</span> },
    { id: "review", label: "Review & Edit", icon: <span>✅</span> },
    { id: "preview", label: "Event Preview", icon: <span>👀</span> },
  ];
const formScrollRef = React.useRef<HTMLDivElement | null>(null);

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
            ? t.subTickets
                .filter((sub) => sub.name && sub.name.trim().length > 0)
                .map((sub) => ({
                  name: sub.name,
                  price: sub.price,
                  finalPrice: sub.finalPrice,
                  gstIncluded: true,
                }))
            : undefined,
      })),
      status: "PUBLISHED",
      attendeeFieldConfig: {
        optional: userFieldConfig,
        required: userFieldRequiredConfig,
      },
      paymentSettings: {
        collectPaymentCharges: paymentSettings.collectPaymentCharges,
      },
      otherAttendeesConfig: form.otherAttendeesConfig,
    };

    try {
      if (editMode && eventId) {
        await updateEvent(eventId, payload);
        showToast("success", "Event updated successfully!");
      } else {
        await createEvent(payload);
        showToast("success", "Event created successfully!");
      }
      setShowSuccessModal(true);
      setTimeout(() => navigate("/organizer/events"), 1000);
    } catch (err: any) {
      console.error("EVENT SAVE ERROR", err?.response?.data || err);
      const raw = err?.response?.data;
      const message =
        raw?.message?.join?.(", ") ||
        raw?.message ||
        raw?.error ||
        "Failed to save event";
      showToast("error", message);
    } finally {
      setIsLoading(false);
    }
  };

const handlePrimaryClick = async () => {
  console.log("primary click", { editMode, currentStep, eventId });

  // ✅ Only submit on preview step
  if (currentStep === "preview") {
    await handleSubmit();
    return;
  }

  // ✅ Otherwise always go to next step
  await handleNext();
};
  return (
<div className="min-h-screen bg-gray-50 px-3 py-3 flex flex-col">

      {toast && (
        <div
          className={`fixed top-3 right-3 z-50 px-3 py-2 rounded-md text-xs text-white shadow-md ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

<div className="max-w-4xl mx-auto w-full flex flex-col gap-3 flex-1">
<StepHeader
  editMode={editMode}
  isLoading={isLoading}
  onUpdate={async () => {
    if (currentStep !== "preview") {
      setCurrentStep("preview");
      scrollTop();
      return;
    }
    await handleSubmit();
  }}
/>

        <Stepper
          steps={steps}
          currentStep={currentStep}
          canNavigateToStep={canNavigateToStep}
          isSectionCompleted={isSectionCompleted}
          goToStep={(step) => goToStep(step)}
        />

<div
  ref={formScrollRef}
  className="bg-white rounded-xl shadow border border-gray-200 p-4 overflow-y-auto max-h-[calc(100vh-220px)]"
>




          {currentStep === "userInfo" && (
            <UserInfoStep
              userFieldConfig={userFieldConfig}
              setUserFieldConfig={setUserFieldConfig}
              userFieldRequiredConfig={userFieldRequiredConfig}
              setUserFieldRequiredConfig={setUserFieldRequiredConfig}
            />
          )}

          {currentStep === "basic" && (
            <BasicInfoStep
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              themeColor={themeColor}
              setThemeColor={setThemeColor}
              errors={errors}
            />
          )}

          {currentStep === "schedule" && (
            <ScheduleStep
              city={city}
              setCity={setCity}
              locationText={locationText}
              setLocationText={setLocationText}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              errors={errors}
            />
          )}

          {currentStep === "media" && (
            <MediaStep
              bannerImageUrl={bannerImageUrl}
              setBannerImageUrl={setBannerImageUrl}
              mediaUrls={mediaUrls}
              setMediaUrls={setMediaUrls}
              uploadingBanner={uploadingBanner}
              uploadingGallery={uploadingGallery}
              handleBannerChange={handleBannerChange}
              handleGalleryChange={handleGalleryChange}
              removeGalleryImage={removeGalleryImage}
            />
          )}

          {currentStep === "tickets" && (
            <TicketsStep
              tickets={tickets}
              addTicket={addTicket}
              removeTicket={removeTicket}
              toggleTicketExpansion={toggleTicketExpansion}
              updateTicket={updateTicket}
              addSubTicket={addSubTicket}
              updateSubTicket={updateSubTicket}
              removeSubTicket={removeSubTicket}
              errors={errors}
              paymentSettings={paymentSettings}
            />
          )}

          {currentStep === "payment" && (
            <PaymentStep
              paymentSettings={paymentSettings}
              setPaymentSettings={setPaymentSettings}
              form={form}
              setForm={setForm}
              errors={errors}
            />
          )}

          {currentStep === "review" && (
            <ReviewStep
              userFieldConfig={userFieldConfig}
              goToStep={goToStep}
              title={title}
              category={category}
              themeColor={themeColor}
              city={city}
              locationText={locationText}
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              bannerImageUrl={bannerImageUrl}
              mediaUrls={mediaUrls}
              tickets={tickets}
              paymentSettings={paymentSettings}
              formatDate={formatDate}
            />
          )}

          {currentStep === "preview" && (
            <PreviewStep
              title={title}
              category={category}
              description={description}
              themeColor={themeColor}
              city={city}
              locationText={locationText}
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              bannerImageUrl={bannerImageUrl}
              mediaUrls={mediaUrls}
              tickets={tickets}
              previewMapCenter={previewMapCenter}
              formatDate={formatDate}
            />
          )}
        </div>

<div className="bg-gray-50 pt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between shrink-0">
          {currentStep !== "userInfo" && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <span>←</span> Back
            </button>
          )}

          <div className="flex gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="px-4 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePrimaryClick}
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <svg
                  className="animate-spin h-3 w-3"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 
                    7.938l3-2.647z"
                  />
                </svg>
              )}
             {currentStep === "preview"
  ? editMode
    ? "Update Event"
    : "Create Event"
  : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
