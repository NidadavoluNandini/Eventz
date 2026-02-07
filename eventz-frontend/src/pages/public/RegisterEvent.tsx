import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { getEventById } from "../../api/events.api";
import { initiateRegistration } from "../../api/registrations.api";

/* ---------- DYNAMIC GST CALCULATION ---------- */
const calculateGST = (price: number, gstPercent: number) => {
  if (!gstPercent) return 0;
  return Math.round((price * gstPercent) / 100);
};

const calculateFinalPrice = (price: number, gstPercent: number) => {
  return price + calculateGST(price, gstPercent);
};

export default function RegisterEvent() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [ticketName, setTicketName] = useState<string | null>(
    location.state?.ticketName || null
  );
  const [subTicketName, setSubTicketName] = useState<string | null>(
    location.state?.subTicketName || null
  );
  const [showSubTickets, setShowSubTickets] = useState<{ [key: string]: boolean }>({});

  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  const [errors, setErrors] = useState({
    ticketName: false,
    userName: false,
    userEmail: false,
    userPhone: false,
  });

  // ✅ quantity state
  const [quantity, setQuantity] = useState<number>(1);

  // ✅ Centered modal popup
  const [modal, setModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    if (!id) return;

    getEventById(id)
      .then((res) => setEvent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

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
    return event.tickets.find((t: any) => t.name === ticketName);
  }, [event, ticketName]);

  const selectedSubTicket = useMemo(() => {
    if (!selectedTicket || !subTicketName) return null;
    return selectedTicket.subTickets?.find(
      (s: any) => s.name === subTicketName
    );
  }, [selectedTicket, subTicketName]);

  /* ---------- PRICING CALCULATION ---------- */
  const parentPrice = selectedTicket?.price || 0;
  const parentGST = selectedTicket?.gst || 0;
  const subPrice = selectedSubTicket?.price || 0;
  const subGST = selectedSubTicket?.gst || 0;

  const parentGSTAmount = calculateGST(parentPrice, parentGST);
  const subGSTAmount = calculateGST(subPrice, subGST);

  const parentFinalPrice = calculateFinalPrice(parentPrice, parentGST);
  const subFinalPrice = calculateFinalPrice(subPrice, subGST);

  const totalBasePricePerTicket = parentPrice + subPrice;
  const totalGSTPerTicket = parentGSTAmount + subGSTAmount;
  const totalAmountPerTicket = parentFinalPrice + subFinalPrice;

  // 👉 multiply by quantity for totals shown to user
  const totalBasePrice = totalBasePricePerTicket * quantity;
  const totalGST = totalGSTPerTicket * quantity;
  const totalAmount = totalAmountPerTicket * quantity;

  const themeColor = event?.themeColor?.value || "#0F172A";

  // ✅ Show centered modal
  const showModal = (message: string) => {
    setModal({ show: true, message });
  };

  /* ---------- SUBMIT WITH VALIDATION ---------- */
  const handleSubmit = async () => {
    setErrors({
      ticketName: false,
      userName: false,
      userEmail: false,
      userPhone: false,
    });

    if (!ticketName) {
      setErrors((prev) => ({ ...prev, ticketName: true }));
      showModal("⚠️ Please select a ticket");
      document.getElementById("ticket-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const newErrors = {
      ticketName: false,
      userName: !form.userName.trim(),
      userEmail: !form.userEmail.trim(),
      userPhone: !form.userPhone.trim(),
    };

    if (newErrors.userName || newErrors.userEmail || newErrors.userPhone) {
      setErrors(newErrors);
      showModal("⚠️ Please fill all required fields");
      document.getElementById("user-details")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (quantity < 1) {
      showModal("⚠️ Quantity must be at least 1");
      return;
    }

    try {
      const res = await initiateRegistration({
        eventId: event._id,
        ticketName,
        subTicketName: subTicketName || undefined,
        quantity, // 👈 send selected quantity
        ...form,
      });

      navigate(`/verify-otp/${res.data.registrationId}`);
    } catch (err: any) {
      showModal("❌ " + (err.response?.data?.message || "Registration failed"));
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading registration...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!event) return null;

  return (
    <PublicLayout>
      {/* ✅ CENTERED MODAL POPUP */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-6">{modal.message}</p>
              <button
                onClick={() => setModal({ show: false, message: "" })}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out;
          }
        `}
      </style>

      <div
        className="min-h-screen py-6 px-4"
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
            <p className="text-gray-600">Complete your registration in just a few steps</p>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-4">
              {/* ✅ TICKET SELECTION CARD */}
              <div
                id="ticket-section"
                className={`bg-white rounded-xl shadow-lg border-2 p-4 transition-all ${
                  errors.ticketName ? "border-red-500 ring-2 ring-red-200" : ""
                }`}
                style={!errors.ticketName ? { borderColor: `${themeColor}30` } : {}}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Select Ticket</h2>
                  {errors.ticketName && (
                    <span className="text-red-600 text-xs font-semibold ml-auto">Required *</span>
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
                              ? "border-2 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={
                            isSelected
                              ? { borderColor: themeColor, backgroundColor: `${themeColor}05` }
                              : {}
                          }
                        >
                          <input
                            type="radio"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => {
                              setTicketName(t.name);
                              setSubTicketName(null);
                              setErrors((prev) => ({ ...prev, ticketName: false }));
                              setQuantity(1); // reset quantity on ticket change
                              if (hasSubTickets) {
                                setShowSubTickets({ ...showSubTickets, [t.name]: true });
                              }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-0" : "border-gray-300"
                              }`}
                              style={isSelected ? { backgroundColor: themeColor } : {}}
                            >
                              {isSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-500">
                                {t.quantity ? `${t.available || 0} available` : "Unlimited"}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-base text-green-600">
                            ₹{t.price || 0}
                          </span>
                        </label>

                        {/* SUB-TICKETS */}
                        {isSelected && hasSubTickets && (
                          <div className="mt-2 ml-4">
                            <button
                              type="button"
                              onClick={() =>
                                setShowSubTickets({ ...showSubTickets, [t.name]: !isExpanded })
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span>{isExpanded ? "Hide" : "Show"} Ticket Options</span>
                            </button>

                            {isExpanded && (
                              <div
                                className="space-y-2 p-2 rounded-lg"
                                style={{ backgroundColor: `${themeColor}05` }}
                              >
                                {t.subTickets.map((s: any) => (
                                  <label
                                    key={s.name}
                                    className={`flex items-center justify-between border-2 rounded-lg p-2 cursor-pointer transition-all ${
                                      subTicketName === s.name
                                        ? "border-2 bg-white shadow"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                    style={
                                      subTicketName === s.name ? { borderColor: themeColor } : {}
                                    }
                                  >
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={subTicketName === s.name}
                                      onChange={() => {
                                        setSubTicketName(s.name);
                                        setQuantity(1); // reset quantity when option changes
                                      }}
                                    />
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                                          subTicketName === s.name
                                            ? "border-0"
                                            : "border-gray-300"
                                        }`}
                                        style={
                                          subTicketName === s.name
                                            ? { backgroundColor: themeColor }
                                            : {}
                                        }
                                      >
                                        {subTicketName === s.name && (
                                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        )}
                                      </div>
                                      <span className="text-xs font-medium">{s.name}</span>
                                    </div>
                                    <span className="font-bold text-sm text-green-600">
                                      ₹{s.price || 0}
                                    </span>
                                  </label>
                                ))}
                                <button
                                  onClick={() => {
                                    setSubTicketName(null);
                                    setShowSubTickets({ ...showSubTickets, [t.name]: false });
                                    setQuantity(1);
                                  }}
                                  className="text-xs text-gray-500 hover:underline mt-1"
                                >
                                  Skip ticket options
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ USER DETAILS CARD */}
              <div
                id="user-details"
                className="bg-white rounded-xl shadow-lg border-2 p-4"
                style={{ borderColor: `${themeColor}30` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                      {errors.userName && (
                        <span className="text-red-600 text-xs ml-2">Required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.userName
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200"
                      }`}
                      value={form.userName}
                      onChange={(e) => {
                        setForm({ ...form, userName: e.target.value });
                        setErrors((prev) => ({ ...prev, userName: false }));
                      }}
                      onFocus={(e) =>
                        !errors.userName && (e.target.style.borderColor = themeColor)
                      }
                      onBlur={(e) =>
                        !errors.userName &&
                        (e.target.style.borderColor = form.userName ? themeColor : "#e5e7eb")
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                      {errors.userEmail && (
                        <span className="text-red-600 text-xs ml-2">Required</span>
                      )}
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.userEmail
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200"
                      }`}
                      value={form.userEmail}
                      onChange={(e) => {
                        setForm({ ...form, userEmail: e.target.value });
                        setErrors((prev) => ({ ...prev, userEmail: false }));
                      }}
                      onFocus={(e) =>
                        !errors.userEmail && (e.target.style.borderColor = themeColor)
                      }
                      onBlur={(e) =>
                        !errors.userEmail &&
                        (e.target.style.borderColor = form.userEmail ? themeColor : "#e5e7eb")
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number *
                      {errors.userPhone && (
                        <span className="text-red-600 text-xs ml-2">Required</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full border-2 rounded-lg p-2.5 text-sm focus:outline-none transition ${
                        errors.userPhone
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-200"
                      }`}
                      value={form.userPhone}
                      onChange={(e) => {
                        setForm({ ...form, userPhone: e.target.value });
                        setErrors((prev) => ({ ...prev, userPhone: false }));
                      }}
                      onFocus={(e) =>
                        !errors.userPhone && (e.target.style.borderColor = themeColor)
                      }
                      onBlur={(e) =>
                        !errors.userPhone &&
                        (e.target.style.borderColor = form.userPhone ? themeColor : "#e5e7eb")
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - ORDER SUMMARY */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div
                className="bg-white rounded-2xl shadow-xl border-2 overflow-hidden"
                style={{ borderColor: `${themeColor}40` }}
              >
                <div className="p-5 text-white" style={{ backgroundColor: themeColor }}>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Order Summary
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  {ticketName ? (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedTicket?.name}
                          </p>
                          <p className="text-xs text-gray-500">Base Price</p>
                        </div>
                        <span className="font-bold text-gray-900">
                          ₹{parentPrice}
                        </span>
                      </div>

                      {subTicketName && (
                        <div className="flex justify-between items-center pb-2 border-b mt-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedSubTicket?.name}
                            </p>
                            <p className="text-xs text-gray-500">Base Price</p>
                          </div>
                          <span className="font-bold text-gray-900">
                            ₹{subPrice}
                          </span>
                        </div>
                      )}

                      {/* Quantity selector */}
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
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(
                                Math.max(1, Number(e.target.value) || 1)
                              )
                            }
                            className="w-14 text-center border rounded-lg text-sm py-1"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border text-gray-700 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div
                        className="pt-3 mt-3 border-t-2 space-y-2"
                        style={{ borderColor: `${themeColor}30` }}
                      >
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>Subtotal (Base)</span>
                          <span>₹{totalBasePrice}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>Total GST</span>
                          <span>₹{totalGST}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t text-lg font-bold">
                          <span>Total Amount</span>
                          <span className="text-green-600">
                            ₹{totalAmount}
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Proceed to Verify
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    🔒 Secure registration • OTP verification required
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
