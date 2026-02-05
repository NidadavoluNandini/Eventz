import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { getEventById } from "../../api/events.api";
import { initiateRegistration } from "../../api/registrations.api";

/* ---------- GST CONFIG (DISPLAY ONLY) ---------- */
const GST_PERCENT = 18;

// Extract GST portion from GST-INCLUDED price
const extractGST = (price: number) =>
  Math.round((price * GST_PERCENT) / (100 + GST_PERCENT));

export default function RegisterEvent() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [ticketName, setTicketName] = useState<string | null>(
    location.state?.ticketName || null
  );
  const [subTicketName, setSubTicketName] = useState<string | null>(null);
  const [showSubTickets, setShowSubTickets] = useState<{ [key: string]: boolean }>({});

  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  useEffect(() => {
    if (!id) return;

    getEventById(id)
      .then((res) => setEvent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

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

  /* ---------- PRICING (GST INCLUDED) ---------- */
  const parentPrice = selectedTicket?.finalPrice || 0;
  const subPrice = selectedSubTicket?.finalPrice || 0;

  const totalAmount = parentPrice + subPrice;

  const parentGST = extractGST(parentPrice);
  const subGST = extractGST(subPrice);
  const totalGST = parentGST + subGST;

  const themeColor = event?.themeColor?.value || "#0F172A";

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!ticketName) {
      alert("Please select a ticket");
      return;
    }

    if (!form.userName.trim() || !form.userEmail.trim() || !form.userPhone.trim()) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await initiateRegistration({
        eventId: event._id,
        ticketName,
        subTicketName: subTicketName || undefined,
        quantity: 1,
        ...form,
      });

      navigate(`/verify-otp/${res.data.registrationId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
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
      <div className="min-h-screen py-6 px-4" style={{ background: `linear-gradient(135deg, ${themeColor}08 0%, #ffffff 50%, ${themeColor}08 100%)` }}>
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
            {/* LEFT COLUMN - TICKET SELECTION & USER INFO */}
            <div className="lg:col-span-2 space-y-5">
              {/* TICKET SELECTION CARD */}
              <div className="bg-white rounded-2xl shadow-lg border-2 p-6" style={{ borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Select Ticket</h2>
                </div>

                {/* ✅ PARENT TICKETS WITH INLINE SUB-TICKETS */}
                <div className="space-y-3">
                  {event.tickets.map((t: any) => {
                    const isSelected = ticketName === t.name;
                    const hasSubTickets = t.subTickets?.length > 0;
                    const isExpanded = showSubTickets[t.name];

                    return (
                      <div key={t.name}>
                        {/* Parent Ticket */}
                        <label
                          className={`relative flex items-center justify-between border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-2 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={isSelected ? { borderColor: themeColor, backgroundColor: `${themeColor}05` } : {}}
                        >
                          <input
                            type="radio"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => {
                              setTicketName(t.name);
                              setSubTicketName(null);
                              if (hasSubTickets) {
                                setShowSubTickets({ ...showSubTickets, [t.name]: true });
                              }
                            }}
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-0" : "border-gray-300"}`} style={isSelected ? { backgroundColor: themeColor } : {}}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-500">{t.quantity ? `${t.available || 0} available` : "Unlimited"}</p>
                            </div>
                          </div>
                          <span className="font-bold text-lg text-green-600">₹{t.finalPrice}</span>
                        </label>

                        {/* ✅ SUB-TICKETS - SHOW IMMEDIATELY UNDER SELECTED TICKET */}
                        {isSelected && hasSubTickets && (
                          <div className="mt-3 ml-6">
                            <button
                              type="button"
                              onClick={() => setShowSubTickets({ ...showSubTickets, [t.name]: !isExpanded })}
                              className="flex items-center gap-2 text-sm font-semibold mb-3 hover:underline"
                              style={{ color: themeColor }}
                            >
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span>{isExpanded ? "Hide" : "Show"} Ticket Options</span>
                            </button>

                            {isExpanded && (
                              <div className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: `${themeColor}05` }}>
                                {t.subTickets.map((s: any) => (
                                  <label
                                    key={s.name}
                                    className={`flex items-center justify-between border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                      subTicketName === s.name ? "border-2 bg-white shadow" : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                    style={subTicketName === s.name ? { borderColor: themeColor } : {}}
                                  >
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={subTicketName === s.name}
                                      onChange={() => setSubTicketName(s.name)}
                                    />
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${subTicketName === s.name ? "border-0" : "border-gray-300"}`} style={subTicketName === s.name ? { backgroundColor: themeColor } : {}}>
                                        {subTicketName === s.name && (
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                      </div>
                                      <span className="text-sm font-medium">{s.name}</span>
                                    </div>
                                    <span className="font-bold text-green-600">₹{s.finalPrice}</span>
                                  </label>
                                ))}
                                <button
                                  onClick={() => {
                                    setSubTicketName(null);
                                    setShowSubTickets({ ...showSubTickets, [t.name]: false });
                                  }}
                                  className="text-xs text-gray-500 hover:underline mt-2"
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

              {/* USER DETAILS CARD */}
              <div className="bg-white rounded-2xl shadow-lg border-2 p-6" style={{ borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none transition"
                      style={{ borderColor: form.userName ? themeColor : undefined }}
                      value={form.userName}
                      onChange={(e) => setForm({ ...form, userName: e.target.value })}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => e.target.style.borderColor = form.userName ? themeColor : '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none transition"
                      value={form.userEmail}
                      onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => e.target.style.borderColor = form.userEmail ? themeColor : '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none transition"
                      value={form.userPhone}
                      onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => e.target.style.borderColor = form.userPhone ? themeColor : '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - STICKY SUMMARY */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-2xl shadow-xl border-2 overflow-hidden" style={{ borderColor: `${themeColor}40` }}>
                {/* Summary Header */}
                <div className="p-5 text-white" style={{ backgroundColor: themeColor }}>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Order Summary
                  </h3>
                </div>

                {/* Summary Details */}
                <div className="p-5 space-y-3">
                  {ticketName ? (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div>
                          <p className="font-semibold text-gray-900">{selectedTicket?.name}</p>
                          <p className="text-xs text-gray-500">Main Ticket</p>
                        </div>
                        <span className="font-bold text-gray-900">₹{parentPrice}</span>
                      </div>

                      {subTicketName && (
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div>
                            <p className="font-semibold text-gray-900">{selectedSubTicket?.name}</p>
                            <p className="text-xs text-gray-500">Option</p>
                          </div>
                          <span className="font-bold text-gray-900">₹{subPrice}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm text-gray-600">
                        <span>GST ({GST_PERCENT}% included)</span>
                        <span>₹{totalGST}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t-2 text-lg font-bold" style={{ borderColor: `${themeColor}30` }}>
                        <span>Total Amount</span>
                        <span className="text-green-600">₹{totalAmount}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-6">Please select a ticket</p>
                  )}
                </div>

                {/* Submit Button */}
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
