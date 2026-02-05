import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import PublicLayout from "../../layouts/PublicLayout";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const navigate = useNavigate();
  const { registrationId } = useParams();

  const storedSession = JSON.parse(
    sessionStorage.getItem("paymentSession") || "null"
  );

  const finalRegistrationId = registrationId || storedSession?.registrationId;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(true);

  /* ---------------- FETCH REGISTRATION ---------------- */
  useEffect(() => {
    if (!finalRegistrationId) {
      setError("Invalid payment session.");
      setFetchingDetails(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/api/registrations/${finalRegistrationId}`);
        setOrderDetails(res.data);
      } catch {
        setError("Failed to load payment details");
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchDetails();
  }, [finalRegistrationId]);

  /* ---------------- SAFE AMOUNT RESOLUTION ---------------- */
  const displayAmount = useMemo(() => {
    if (!orderDetails) return 0;

    // Priority-based resolution
    if (orderDetails.totalAmount) return orderDetails.totalAmount;
    if (orderDetails.finalAmount) return orderDetails.finalAmount;
    if (orderDetails.finalPrice) return orderDetails.finalPrice;
    if (orderDetails.payment?.amount) return orderDetails.payment.amount;

    // Fallback: Convert from smallest currency unit if needed
    if (orderDetails.amount) {
      return orderDetails.amount > 1000
        ? Math.floor(orderDetails.amount / 100)
        : orderDetails.amount;
    }

    return 0;
  }, [orderDetails]);

  /* ---------------- START PAYMENT ---------------- */
  const startPayment = async () => {
    if (!finalRegistrationId) return;

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/payments/registration/create-order", {
        registrationId: finalRegistrationId,
      });

      const { razorpayOrderId, amount, currency, key } = res.data;

      const options = {
        key,
        amount, // Amount in smallest currency unit (from backend)
        currency,
        name: "Event Registration",
        description: "Event Ticket Payment",
        order_id: razorpayOrderId,

        prefill: {
          name: orderDetails?.userName || "",
          email: orderDetails?.userEmail || "",
          contact: orderDetails?.userPhone || "",
        },

        handler: async (response: any) => {
          try {
            await api.post("/api/payments/registration/verify", {
              registrationId: finalRegistrationId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch {
            // Webhook handles verification
          }

          sessionStorage.removeItem("paymentSession");
          navigate(`/payment-processing/${finalRegistrationId}`);
        },

        modal: {
          // Payment modal dismiss handler
          ondismiss: async () => {
            try {
              await api.post(`/api/payments/registration/fail/${finalRegistrationId}`);
            } catch {}

            navigate(`/payment-cancelled/${finalRegistrationId}`);
          },
        },

        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (fetchingDetails) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading payment details...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  /* ---------------- ENHANCED UI ---------------- */
  return (
    <PublicLayout>
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.3); }
            50% { box-shadow: 0 0 40px rgba(79, 70, 229, 0.6); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
        `}
      </style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Payment Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            {/* HEADER with Gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Payment</h2>
                    <p className="text-indigo-100 text-sm">Secure checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Secure</span>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">
              {/* EVENT DETAILS CARD */}
              {orderDetails && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
                        Event Details
                      </p>
                      <h3 className="text-lg font-bold text-gray-900">
                        {orderDetails.eventId?.title || "Event"}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Ticket */}
                    <div className="flex items-center justify-between py-2 border-b border-indigo-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Ticket</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {orderDetails.ticketName}
                      </span>
                    </div>

                    {/* Sub-Ticket */}
                    {orderDetails.subTicketName && (
                      <div className="flex items-center justify-between py-2 border-b border-indigo-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Option</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {orderDetails.subTicketName}
                        </span>
                      </div>
                    )}

                    {/* Attendee */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Attendee</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {orderDetails.userName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AMOUNT DISPLAY */}
              {orderDetails && (
                <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200 relative overflow-hidden">
                  <div className="shimmer absolute inset-0"></div>
                  <div className="relative flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Amount to Pay</span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">₹{displayAmount}</p>
                      <p className="text-xs text-gray-500">GST included</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* PAY BUTTON */}
              <button
                onClick={startPayment}
                disabled={loading || !!error}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 pulse-glow"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              {/* SECURITY BADGES */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">256-bit SSL</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium">Razorpay Secure</span>
                </div>
              </div>

              {/* INFO NOTE */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Payment Information</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      You will be redirected to Razorpay's secure payment gateway. Your payment information is encrypted and safe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CANCEL BUTTON */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
