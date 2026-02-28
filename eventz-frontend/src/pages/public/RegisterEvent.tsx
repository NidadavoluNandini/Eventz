// src/pages/public/RegisterEvent.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { getEventById } from "../../api/events.api";
import { initiateRegistration } from "../../api/registrations.api";

/* ---------- DYNAMIC GST CALCULATION ---------- */
export const calculateTicketTotals = (
  price: number,
  quantity: number,
  gstPercent: number
) => {
  // base amount
  const baseTotal = price * quantity;

  // GST PER TICKET (client rule)
  const gstPerTicket = gstPercent
    ? Math.round((price * gstPercent) / 100)
    : 0;

  // total GST
  const gstAmount = gstPerTicket * quantity;

  // final amount
  const finalAmount = baseTotal + gstAmount;

  return {
    baseTotal,
    gstPerTicket,
    gstAmount,
    finalAmount,
  };
};
const calculateGST = (price: number, gstPercent: number) => {
  if (!gstPercent) return 0;

  // CLIENT RULE: GST per ticket
  return Math.round((price * gstPercent) / 100);
};
export default function RegisterEvent() {
  const { id } = useParams();
  const location = useLocation() as any;
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [ticketName, setTicketName] = useState<string | null>(
    location.state?.ticketName || null
  );
  const [subTicketName, setSubTicketName] = useState<string | null>(
    location.state?.subTicketName || null
  );
  const [showSubTickets, setShowSubTickets] = useState<
    Record<string, boolean>
  >({});

  // base required + all possible optional fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userEmail: "",
    userPhone: "",
    linkedin: "",
    gender: "",
    altPhone: "",
    altEmail: "",
    dob: "",
    country: "",
    state: "",
    postalCode: "",
    organization: "",
    designation: "",
    collegeId: "",
    employeeId: "",
    tShirtSize: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({
    ticketName: false,
    firstName: false,
    lastName: false,
    userEmail: false,
    userPhone: false,
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

  const [quantity, setQuantity] = useState<number>(1);

  // centered modal popup
  const [modal, setModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // NEW: other attendees (extra persons)
  const [otherAttendees, setOtherAttendees] = useState<
    { name: string; email: string; phone: string }[]
  >([]);
  const [otherAttendeesErrors, setOtherAttendeesErrors] = useState<
    { name?: boolean; email?: boolean; phone?: boolean }[]
  >([]);


useEffect(() => {
  if (!id) return;

  getEventById(id)
    .then((res) => {
      const ev = res.data;

      // ⭐ REGISTRATION CLOSED GUARD
      if (!ev.registrationOpen) {
        // show modal message
        setModal({
          show: true,
          message: "Registration is closed for this event",
        });

        // redirect after short delay (so user sees message)
        setTimeout(() => {
          navigate(`/events/${ev._id}`, { replace: true });
        }, 1500);

        return;
      }

      setEvent(ev);
    })
    .catch((err) => {
      console.error("getEventById error:", err?.response?.data || err);
      navigate("/events");
    })
    .finally(() => setLoading(false));
}, [id, navigate]);


  useEffect(() => {
    if (event && ticketName) {
      const ticket = event.tickets.find((t: any) => t.name === ticketName);
      if (ticket?.subTickets?.length > 0) {
        setShowSubTickets({ [ticketName]: true });
      }
    }
  }, [event, ticketName]);

  /* ---------- SELECTED TICKETS ---------- */
  const selectedTicket = useMemo(() => {
    if (!event || !ticketName) return null;
    return event.tickets.find((t: any) => t.name === ticketName) || null;
  }, [event, ticketName]);

  const selectedSubTicket = useMemo(() => {
    if (!selectedTicket || !subTicketName) return null;
    return (
      selectedTicket.subTickets?.find(
        (s: any) => s.name === subTicketName
      ) || null
    );
  }, [selectedTicket, subTicketName]);

  /* ---------- PRICING CALCULATION with platform fee ---------- */
  // base values from ticket/sub-ticket
  const parentPrice = selectedTicket?.price ?? 0;
  const parentGSTPercent = selectedTicket?.gst ?? 0;
  const subPrice = selectedSubTicket?.price ?? 0; // assume no GST on sub-ticket
  const subGSTPercent = 0;

  // GST per ticket
  const parentGSTAmount = calculateGST(parentPrice, parentGSTPercent);
  const subGSTAmount = calculateGST(subPrice, subGSTPercent);
  
// =====================================================
// PLATFORM FEE (FROM ENV + ORGANIZER TOGGLE)
// =====================================================

// Organizer toggle
const collectFromUser =
  event?.paymentSettings?.collectPaymentCharges === true;

// Percent from VITE env (IMPORTANT: use import.meta.env in Vite)
const platformPercent = Number(
  import.meta.env.VITE_PLATFORM_FEE_PERCENT ?? 0
);

// =====================================================

// =====================================================
// FINAL PRICE CALCULATION (MATCH BACKEND)
// =====================================================

// BASE (per ticket)
const basePricePerTicket = parentPrice + subPrice;

// GST per ticket
const gstPerTicket = calculateGST(basePricePerTicket, parentGSTPercent);

// totals before platform fee
const baseTotal = basePricePerTicket * quantity;
const gstAmount = gstPerTicket * quantity;

// platform fee ONLY if organizer enabled
let platformFee = 0;

if (collectFromUser && platformPercent > 0) {
  const basePlusGst = baseTotal + gstAmount;

  platformFee = Math.round(
    (basePlusGst * platformPercent) / 100
  );
}

// FINAL TOTAL (same as backend)
const totalAmount = baseTotal + gstAmount + platformFee;

// values used in summary UI
const totalBasePrice = baseTotal;
const totalGST = gstAmount;
const totalPlatformFee = platformFee;

  const themeColor = event?.themeColor?.value || "#0F172A";
  const attendeeConfig = event?.attendeeFieldConfig;
  const optionalConfig = attendeeConfig?.optional || {};
  const requiredConfig = attendeeConfig?.required || {};
  // helper → check if organizer marked field as required
const isRequired = (field: string) => {
  return requiredConfig?.[field] === true;
};


  // NEW: sync otherAttendees with quantity and organizer preference
  useEffect(() => {
    if (!event?.otherAttendeesConfig?.enabled) {
      setOtherAttendees([]);
      setOtherAttendeesErrors([]);
      return;
    }

    if (quantity <= 1) {
      setOtherAttendees([]);
      setOtherAttendeesErrors([]);
      return;
    }

    const needed = quantity - 1; // main attendee uses form fields

    setOtherAttendees((prev) => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({ name: "", email: "", phone: "" });
      }
      return next.slice(0, needed);
    });

    setOtherAttendeesErrors((prev) => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({});
      }
      return next.slice(0, needed);
    });
  }, [quantity, event?.otherAttendeesConfig?.enabled]);

  /* ---------- SHOW centered modal ---------- */
  const showModal = (message: string) => {
    setModal({ show: true, message });
  };


  /* ---------- SUBMIT WITH VALIDATION ---------- */
  const handleSubmit = async () => {
    setErrors((prev) => ({
      ...prev,
      ticketName: false,
      userName: false,
      userEmail: false,
      userPhone: false,
    }));

    if (!ticketName) {
      setErrors((prev) => ({ ...prev, ticketName: true }));
      showModal("Please select a ticket");
      document
        .getElementById("ticket-section")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const newErrors: Record<string, boolean> = {
      ticketName: false,
      firstName: !form.firstName.trim(),
      lastName: !form.lastName.trim(),
      userEmail: !form.userEmail.trim(),
      userPhone: !form.userPhone.trim(),
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
    };

    // treat enabled optional fields as required
    
// validate ONLY required fields from organizer config
const fieldMap: Record<string, string> = {
  email: "userEmail",
  phone: "userPhone",
};

Object.entries(requiredConfig).forEach(([key, isRequired]) => {
  if (!isRequired) return;

  const formKey = fieldMap[key] || key;
  const value = (form as any)[formKey];

  if (!value || !String(value).trim()) {
    newErrors[formKey] = true;
  }
});


    const hasAnyError = Object.values(newErrors).some((b) => b);
    if (hasAnyError) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      console.log("Form errors:", newErrors);
      showModal("Please fill all required fields");
      document
        .getElementById("user-details")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (quantity < 1) {
      showModal("Quantity must be at least 1");
      return;
    }

    // NEW: validate otherAttendees if enabled and quantity > 1
    if (event?.otherAttendeesConfig?.enabled && quantity > 1) {
      const oaErrors = otherAttendees.map((att) => ({
        name: !att.name.trim(),
        email: !att.email.trim(),
        phone: !att.phone.trim(),
      }));
      const hasAnyOA = oaErrors.some(
        (e) => e.name || e.email || e.phone
      );
      if (hasAnyOA) {
        setOtherAttendeesErrors(oaErrors);
        showModal("Please fill all other attendees details");
        document
          .getElementById("other-attendees")
          ?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    try {
      const res = await initiateRegistration({
  eventId: event._id,
  ticketName,
  subTicketName: subTicketName || undefined,
  quantity,
  ...form,
  otherAttendees:
    event?.otherAttendeesConfig?.enabled && quantity > 1
      ? otherAttendees
      : [],
});

console.log("Registration response:", res.data);

// ✅ ensure backend returned id
if (!res?.data?.registrationId) {
  showModal("Something went wrong. Please try again.");
  return;
}

navigate(`/verify-otp/${res.data.registrationId}`);

    } catch (err: any) {
  console.error("Registration error:", err?.response?.data || err);

  showModal(
    err.response?.data?.message || "Registration failed"
  );
}

  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[100dvh]
 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Loading registration...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="min-h-[100dvh]
 flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Event not found.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* centered modal popup */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0
                      2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
                      0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-6">
                {modal.message}
              </p>
              <button
                onClick={() => setModal({ show: false, message: "" })}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition"
              >
                OK
              </button>
            </div>
          </div>

          <style>
            {`
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes scale-in {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
              .animate-fade-in { animation: fade-in 0.2s ease-out; }
              .animate-scale-in { animation: scale-in 0.3s ease-out; }
            `}
          </style>
        </div>
      )}

      <div
        className="min-h-[100dvh]
 py-6 px-4"
        style={{
          background: `linear-gradient(135deg, ${themeColor}08 0%, #ffffff 50%, ${themeColor}08 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              Register for {event.title}
            </h1>
            <p className="text-gray-600">
              Complete your registration in just a few steps
            </p>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-4">
              {/* TICKET SELECTION CARD */}
              <div
                id="ticket-section"
                className={`bg-white rounded-xl shadow-lg border-2 p-4 transition-all ${
                  errors.ticketName
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-200"
                }`}
                style={{
                  borderColor: !errors.ticketName
                    ? themeColor + "30"
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0
                          00-2 2v3a2 2 0 110 4v3a2 2 0 002
                          2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2
                          2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">
                      Select Ticket
                    </h2>
                  </div>
                  {errors.ticketName && (
                    <span className="text-red-600 text-xs font-semibold ml-auto">
                      Required
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {event.tickets.map((t: any) => {
                    const isSelected = ticketName === t.name;
                    const hasSubTickets = t.subTickets?.length > 0;
                    const isExpanded = showSubTickets[t.name];

                    return (
                      <div key={t.name}>
                        <label
                          className={`relative flex items-center justify-between border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            isSelected
                              ? "border-2 shadow-md border-gray-200 hover:border-gray-300"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={{
                            borderColor: isSelected
                              ? themeColor
                              : undefined,
                            backgroundColor: isSelected
                              ? themeColor + "05"
                              : undefined,
                          }}
                        >
                          <input
                            type="radio"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => {
                              setTicketName(t.name);
                              setSubTicketName(null);
                              setErrors((prev) => ({
                                ...prev,
                                ticketName: false,
                              }));
                              setQuantity(1);
                              if (hasSubTickets) {
                                setShowSubTickets((prev) => ({
                                  ...prev,
                                  [t.name]: true,
                                }));
                              }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-0" : "border-gray-300"
                              }`}
                              style={{
                                backgroundColor: isSelected
                                  ? themeColor
                                  : undefined,
                              }}
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
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
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">
                                {t.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t.quantity
                                  ? `${t.available ?? 0} available`
                                  : "Unlimited available"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-base text-green-600">
                              ₹{t.price ?? 0}
                            </span>
                          </div>
                        </label>

                        {isSelected && hasSubTickets && (
                          <div className="mt-2 ml-4">
                            <button
                              type="button"
                              onClick={() =>
                                setShowSubTickets((prev) => ({
                                  ...prev,
                                  [t.name]: !isExpanded,
                                }))
                              }
                              className="flex items-center gap-1 text-xs font-semibold mb-2 hover:underline"
                              style={{ color: themeColor }}
                            >
                              <svg
                                className={`w-3 h-3 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
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
                              <span>
                                {isExpanded
                                  ? "Hide Ticket Options"
                                  : "Show Ticket Options"}
                              </span>
                            </button>

                            {isExpanded && (
                              <div
                                className="space-y-2 p-2 rounded-lg"
                                style={{
                                  backgroundColor: themeColor + "05",
                                }}
                              >
                                {t.subTickets.map((s: any) => (
                                  <label
                                    key={s.name}
                                    className={`flex items-center justify-between border-2 rounded-lg p-2 cursor-pointer transition-all ${
                                      subTicketName === s.name
                                        ? "border-2 bg-white shadow border-gray-200 hover:border-gray-300"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                    style={{
                                      borderColor:
                                        subTicketName === s.name
                                          ? themeColor
                                          : undefined,
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={subTicketName === s.name}
                                      onChange={() => {
                                        setSubTicketName(s.name);
                                        setQuantity(1);
                                      }}
                                    />
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                                          subTicketName === s.name
                                            ? "border-0"
                                            : "border-gray-300"
                                        }`}
                                        style={{
                                          backgroundColor:
                                            subTicketName === s.name
                                              ? themeColor
                                              : undefined,
                                        }}
                                      >
                                        {subTicketName === s.name && (
                                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        )}
                                      </div>
                                      <span className="text-xs font-medium">
                                        {s.name}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-sm text-green-600">
                                        ₹{s.price ?? 0}
                                      </span>
                                    </div>
                                  </label>
                                ))}
                                {subTicketName && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSubTicketName(null);
                                      setShowSubTickets((prev) => ({
                                        ...prev,
                                        [t.name]: false,
                                      }));
                                      setQuantity(1);
                                    }}
                                    className="text-xs text-gray-500 hover:underline mt-1"
                                  >
                                    Remove SubTickets
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* USER DETAILS CARD */}
              <div
                id="user-details"
                className="bg-white rounded-xl shadow-lg border-2 p-4"
                style={{ borderColor: themeColor + "30" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0
                          018 0zM12 14a7 7 0 00-7 7h14a7 7 0
                          00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Your Details
                    </h2>
                  </div>
                </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                     First Name
{isRequired("firstName") && (
  <span className="text-red-500 ml-1">*</span>
)}
{errors.firstName && (
  <span className="text-red-600 text-xs ml-2">
    Required
  </span>
)}

                    </label>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.firstName
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200 focus:border-indigo-500"
                      }`}
                      value={form.firstName}
                      onChange={(e) => {
                        setForm({ ...form, firstName: e.target.value });
                        setErrors((prev) => ({ ...prev, firstName: false }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Last Name
{isRequired("lastName") && (
  <span className="text-red-500 ml-1">*</span>
)}
{errors.lastName && (
  <span className="text-red-600 text-xs ml-2">
    Required
  </span>
)}
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.lastName
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200 focus:border-indigo-500"
                      }`}
                      value={form.lastName}
                      onChange={(e) => {
                        setForm({ ...form, lastName: e.target.value });
                        setErrors((prev) => ({ ...prev, lastName: false }));
                      }}
                    />
                  </div>


                  
                 {/*Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address
{isRequired("email") && (
  <span className="text-red-500 ml-1">*</span>
)}

                      {errors.userEmail && (
                        <span className="text-red-600 text-xs ml-2">
                          Required
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.userEmail
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200 focus:border-indigo-500"
                      }`}
                      value={form.userEmail}
                      onChange={(e) => {
                        setForm({ ...form, userEmail: e.target.value });
                        setErrors((prev) => ({ ...prev, userEmail: false }));
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                     Phone Number
{isRequired("phone") && (
  <span className="text-red-500 ml-1">*</span>
)}

                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.userPhone
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200 focus:border-indigo-500"
                      }`}
                      value={form.userPhone}
                      onChange={(e) => {
                        setForm({ ...form, userPhone: e.target.value });
                        setErrors((prev) => ({ ...prev, userPhone: false }));
                      }}
                    />
                  </div>

                  {/* Optional fields using optionalConfig same pattern as before */}
                  {optionalConfig.linkedin && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        LinkedIn Profile URL
{isRequired("linkedin") && (
  <span className="text-red-500 ml-1">*</span>
)}

                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.linkedin
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.linkedin}
                        onChange={(e) => {
                          setForm({ ...form, linkedin: e.target.value });
                          setErrors((prev) => ({
                            ...prev,
                            linkedin: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.gender && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gender
                        {isRequired("gender") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.gender && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <select
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.gender
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.gender}
                        onChange={(e) => {
                          setForm({ ...form, gender: e.target.value });
                          setErrors((prev) => ({
                            ...prev,
                            gender: false,
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                  )}

                  {optionalConfig.altPhone && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Alternate Phone
                        {isRequired("altPhone") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.altPhone && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="tel"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.altPhone
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.altPhone}
                        onChange={(e) => {
                          setForm({ ...form, altPhone: e.target.value });
                          setErrors((prev) => ({
                            ...prev,
                            altPhone: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.altEmail && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Alternate Email
                        {isRequired("altEmail") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.altEmail && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="email"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.altEmail
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.altEmail}
                        onChange={(e) => {
                          setForm({ ...form, altEmail: e.target.value });
                          setErrors((prev) => ({
                            ...prev,
                            altEmail: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.dob && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Date of Birth
                        {isRequired("dob") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.dob && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.dob
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.dob}
                        onChange={(e) => {
                          setForm({ ...form, dob: e.target.value });
                          setErrors((prev) => ({ ...prev, dob: false }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.country && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Country
                        {isRequired("country") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.country && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.country
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.country}
                        onChange={(e) => {
                          setForm({ ...form, country: e.target.value });
                          setErrors((prev) => ({
                            ...prev,
                            country: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.state && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        State
                        {isRequired("state") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.state && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.state
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.state}
                        onChange={(e) => {
                          setForm({ ...form, state: e.target.value });
                          setErrors((prev) => ({ ...prev, state: false }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.postalCode && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Postal Code
                        {isRequired("postalCode") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.postalCode && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.postalCode
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.postalCode}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            postalCode: e.target.value,
                          });
                          setErrors((prev) => ({
                            ...prev,
                            postalCode: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.organization && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Organization / College
                        {isRequired("organization") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.organization && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.organization
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.organization}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            organization: e.target.value,
                          });
                          setErrors((prev) => ({
                            ...prev,
                            organization: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.designation && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Designation / Role
                        {isRequired("designation") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.designation && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.designation
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.designation}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            designation: e.target.value,
                          });
                          setErrors((prev) => ({
                            ...prev,
                            designation: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                 

                  {optionalConfig.tShirtSize && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        T-shirt Size
                        {isRequired("tShirtSize") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.tShirtSize && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <select
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.tShirtSize
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.tShirtSize}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            tShirtSize: e.target.value,
                          });
                          setErrors((prev) => ({
                            ...prev,
                            tShirtSize: false,
                          }));
                        }}
                      >
                        <option value="">Select size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  )}

                  {optionalConfig.emergencyContactName && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Emergency Contact Name
                        {isRequired("emergencyContactName") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.emergencyContactName && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.emergencyContactName
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.emergencyContactName}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            emergencyContactName: e.target.value,
                          });
                          setErrors((prev) => ({
                            ...prev,
                            emergencyContactName: false,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {optionalConfig.emergencyContactPhone && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Emergency Contact Phone
                        {isRequired("emergencyContactPhone") && (
  <span className="text-red-500 ml-1">*</span>
)}
                        {errors.emergencyContactPhone && (
                          <span className="text-red-600 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </label>
                      <input
                        type="tel"
                        className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                          errors.emergencyContactPhone
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
                        value={form.emergencyContactPhone}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            emergencyContactPhone: e.target.value,
                          });
                          setErrors((prev) => ({
                            ...prev,
                            emergencyContactPhone: false,
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* OTHER ATTENDEES (STEPS PER EXTRA ATTENDEE) */}
              {event?.otherAttendeesConfig?.enabled && quantity > 1 && (
                <div
                  id="other-attendees"
                  className="bg-white rounded-xl shadow-lg border-2 p-4"
                  style={{ borderColor: themeColor + "30" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: themeColor }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5V10H2v10h5m10 0v-2a3 3 0 00-3-3H9a3 3 0 00-3 3v2m10 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Other Attendees
                      </h2>
                      <p className="text-xs text-gray-500">
                        Add details for each additional attendee (beyond
                        you).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {otherAttendees.map((att, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-700">
                            Attendee {idx + 2}
                          </p>
                          <span className="text-[11px] text-gray-500">
                            Step {idx + 2} of {quantity}
                          </span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          {/* Name */}
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Name
                              {otherAttendeesErrors[idx]?.name && (
                                <span className="text-red-600 text-[10px] ml-1">
                                  Required
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              className={`w-full border-2 rounded-lg px-2 py-1.5 text-xs focus:outline-none transition ${
                                otherAttendeesErrors[idx]?.name
                                  ? "border-red-500 ring-2 ring-red-200"
                                  : "border-gray-200 focus:border-indigo-500"
                              }`}
                              value={att.name}
                              onChange={(e) => {
                                const value = e.target.value;
                                setOtherAttendees((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], name: value };
                                  return copy;
                                });
                                setOtherAttendeesErrors((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = {
                                    ...copy[idx],
                                    name: false,
                                  };
                                  return copy;
                                });
                              }}
                            />
                          </div>

                          {/* Email */}
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Email
                              {otherAttendeesErrors[idx]?.email && (
                                <span className="text-red-600 text-[10px] ml-1">
                                  Required
                                </span>
                              )}
                            </label>
                            <input
                              type="email"
                              className={`w-full border-2 rounded-lg px-2 py-1.5 text-xs focus:outline-none transition ${
                                otherAttendeesErrors[idx]?.email
                                  ? "border-red-500 ring-2 ring-red-200"
                                  : "border-gray-200 focus:border-indigo-500"
                              }`}
                              value={att.email}
                              onChange={(e) => {
                                const value = e.target.value;
                                setOtherAttendees((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], email: value };
                                  return copy;
                                });
                                setOtherAttendeesErrors((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = {
                                    ...copy[idx],
                                    email: false,
                                  };
                                  return copy;
                                });
                              }}
                            />
                          </div>

                          {/* Phone */}
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Phone
                              {otherAttendeesErrors[idx]?.phone && (
                                <span className="text-red-600 text-[10px] ml-1">
                                  Required
                                </span>
                              )}
                            </label>
                            <input
                              type="tel"
                              className={`w-full border-2 rounded-lg px-2 py-1.5 text-xs focus:outline-none transition ${
                                otherAttendeesErrors[idx]?.phone
                                  ? "border-red-500 ring-2 ring-red-200"
                                  : "border-gray-200 focus:border-indigo-500"
                              }`}
                              value={att.phone}
                              onChange={(e) => {
                                const value = e.target.value;
                                setOtherAttendees((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], phone: value };
                                  return copy;
                                });
                                setOtherAttendeesErrors((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = {
                                    ...copy[idx],
                                    phone: false,
                                  };
                                  return copy;
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - ORDER SUMMARY */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div
                className="bg-white rounded-2xl shadow-xl border-2 overflow-hidden"
                style={{ borderColor: themeColor + "40" }}
              >
                <div
                  className="p-5 text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0
                          002 2h10a2 2 0 002-2V7a2 2 0
                          00-2-2h-2M9 5a2 2 0 002 2h2a2
                          2 0 002-2M9 5a2 2 0 012-2h2a2
                          2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Order Summary
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  {ticketName ? (
                    <>
                      {/* parent ticket */}
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedTicket?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Base Price per ticket
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">
                            ₹{parentPrice}
                          </span>
                        </div>
                      </div>

                      {/* sub ticket */}
                      {subTicketName && (
                        <div className="flex justify-between items-center pb-2 border-b mt-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedSubTicket?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Base Price per ticket
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">
                              ₹{subPrice}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* quantity selector */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-medium text-gray-700">
                          Quantity
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((q) => Math.max(1, q - 1))
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full border text-gray-700 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(
                                Math.max(
                                  1,
                                  Number(e.target.value) || 1
                                )
                              )
                            }
                            className="w-14 text-center border rounded-lg text-sm py-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((q) => q + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full border text-gray-700 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* totals */}
                      <div
                        className="pt-3 mt-3 border-t-2 space-y-2"
                        style={{ borderColor: themeColor + "30" }}
                      >
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>Subtotal (Base)</span>
                          <span>{totalBasePrice}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>GST</span>
                          <span>{totalGST}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>Platform fee</span>
                          <span>{totalPlatformFee}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t text-lg font-bold">
                          <span>Total Amount</span>
                          <span className="text-green-600">
                            {totalAmount}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-6">
                      Please select a ticket
                    </p>
                  )}
                </div>

                <div className="p-5 bg-gray-50 border-t">
                  <button
                    onClick={handleSubmit}
                    disabled={!ticketName}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: themeColor }}
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
                        d="M9 12l2 2 4-4m6 2a9 9 0
                          11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Proceed to Verify
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Secure registration. OTP verification required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scale-in {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
            .animate-scale-in { animation: scale-in 0.3s ease-out; }
          `}
        </style>
      </div>
    </PublicLayout>
  );
}
