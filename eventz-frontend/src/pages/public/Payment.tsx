// src/pages/public/Payment.tsx
import { useEffect, useState } from "react";
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
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(true);

  // ---------------- FETCH PAYMENT DETAILS ----------------
  useEffect(() => {
    if (!finalRegistrationId) {
      setError("Invalid payment session.");
      setFetchingDetails(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get(
          `/api/payments/registration/details/${finalRegistrationId}`
        );
        setPaymentDetails(res.data);
      } catch {
        setError("Failed to load payment details");
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchDetails();
  }, [finalRegistrationId]);

  // ---------------- START PAYMENT ----------------
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
        amount,
        currency,
        name: "Event Registration",
        description: "Event Ticket Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: paymentDetails?.registration?.userName || "",
          email: paymentDetails?.registration?.userEmail || "",
          contact: paymentDetails?.registration?.userPhone || "",
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
            // webhook handles verification
          }


          sessionStorage.removeItem("paymentSession");
          navigate(`/payment-processing/${finalRegistrationId}`);
        },
        modal: {
          ondismiss: async () => {
            try {
              await api.post(
                `/api/payments/registration/fail/${finalRegistrationId}`
              );
            } catch {}
            navigate(`/payment-cancelled/${finalRegistrationId}`);
          },
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Payment initialization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOADING ----------------
  if (fetchingDetails) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium text-sm">
              Loading payment details...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const quantity = paymentDetails?.pricing?.quantity ?? 1;
  const basePrice = paymentDetails?.pricing?.total?.basePrice ?? 0;
  const totalGST = paymentDetails?.pricing?.total?.totalGST ?? 0;
  const platformFee = paymentDetails?.pricing?.total?.platformFee ?? 0;
  const finalAmount = paymentDetails?.pricing?.total?.finalAmount ?? 0;

  // ---------------- RENDER ----------------
  return (
    <PublicLayout>
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 14px rgba(79, 70, 229, 0.25); }
            50% { box-shadow: 0 0 26px rgba(79, 70, 229, 0.5); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.35s ease-out;
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-3 py-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 
                           003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold leading-tight">
                      Payment
                    </h2>
                    <p className="text-indigo-100 text-[11px]">
                      Secure checkout
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 
                         002-2v-6a2 2 0 00-2-2H6a2 2 0 
                         00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 
                         00-8 0v4h8z"
                    />
                  </svg>
                  <span className="font-medium">Secure</span>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="px-4 py-4 space-y-4">
              {/* EVENT & REGISTRATION DETAILS */}
              {paymentDetails && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl px-3.5 py-3.5 border border-indigo-100">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-wide mb-0.5">
                        Event
                      </p>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {paymentDetails.event?.title || "Event"}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-indigo-200/70">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-indigo-600"
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
                        <span className="font-medium text-gray-700">
                          Ticket
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {paymentDetails.registration?.ticketName}
                      </span>
                    </div>

                    {paymentDetails.registration?.subTicketName && (
                      <div className="flex items-center justify-between py-1 border-b border-indigo-200/70">
                        <div className="flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 
                                 010 2.828l-7 7a2 2 0 
                                 01-2.828 0l-7-7A1.994 1.994 0 
                                 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            Option
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {paymentDetails.registration?.subTicketName}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-indigo-600"
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
                        <span className="font-medium text-gray-700">
                          Attendee
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {paymentDetails.registration?.userName}
                      </span>
                    </div>

                    {quantity && (
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 10h10M7 14h7M5 6h14a2 2 0 
                                 012 2v10a2 2 0 
                                 01-2 2H5a2 2 0 
                                 01-2-2V8a2 2 0 012-2z"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            Quantity
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {quantity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRICE BREAKDOWN – USING BACKEND TOTALS ONLY */}
              {paymentDetails?.pricing && (
                <div className="bg-white rounded-xl border border-gray-200 px-3.5 py-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                        Price breakdown
                      </p>
                      <p className="text-[11px] text-gray-600">
                        Includes base, GST, and platform fee.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                        Total to pay
                      </p>
                      <p className="text-2xl font-bold text-green-600 leading-none">
                        ₹{finalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base price</span>
                      <span className="font-medium text-gray-900">
                        ₹{basePrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST</span>
                      <span className="font-medium text-gray-900">
                        ₹{totalGST}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform fee</span>
                      <span className="font-medium text-gray-900">
                        ₹{platformFee}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 mt-1.5">
                      <span className="text-gray-800 font-semibold">Total</span>
                      <span className="font-semibold text-green-600">
                        ₹{finalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500 flex-shrink-0"
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
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* PAY BUTTON */}
              <button
                onClick={startPayment}
                disabled={loading || !!error || !paymentDetails?.pricing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-sm.transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 pulse-glow"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 
                           004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 
                           01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 
                           00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 
                           002-2v-6a2 2 0 00-2-2H9a2 2 0 
                           00-2 2v6a2 2 0 002 2zm7-5a2 2 0 
                           11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              {/* SECURITY BADGES */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 
                         0112 2.944a11.955 11.955 0 
                         01-8.618 3.04A12.02 12.02 0 
                         003 9c0 5.591 3.824 10.29 9 11.622 
                         5.176-1.332 9-6.03 9-11.622 
                         0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>256-bit SSL</span>
                </div>
                <span className="w-px h-3.5 bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 
                         003-3V8a3 3 0 00-3-3H6a3 3 0 
                         00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>Razorpay Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* CANCEL BUTTON */}
          <div className="mt-3 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 font-medium text-xs hover:underline flex items-center gap-1.5 mx-auto"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
