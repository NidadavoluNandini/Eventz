import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PublicLayout from "../../layouts/PublicLayout";
import api from "../../utils/axios";
import AccessDenied from "../../components/AccessDenied";
export default function TicketSuccess() {
  const [isValidAccess, setIsValidAccess] = useState<boolean | null>(null);

  const { id } = useParams<{ id: string }>();
  const [reg, setReg] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (reg) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [reg]);

const fetchData = async () => {
  try {
    const [regRes, paymentRes] = await Promise.all([
      api.get(`/api/registrations/${id}`),
      api.get(`/api/payments/registration/details/${id}`),
    ]);

    setReg(regRes.data);
    setPaymentDetails(paymentRes.data);
    setIsValidAccess(true);

  } catch (err: any) {

    const message = err.response?.data?.message;

    if (
      message === "Registration not found" ||
      message === "Event not found"
    ) {
      setIsValidAccess(false);
      return;
    }

    setError("Failed to load ticket details");
    setIsValidAccess(false);
  } finally {
    setLoading(false);
  }
};
  /* ---------------- ACTIONS ---------------- */

  const resendTicket = async () => {
    try {
      setResending(true);
      setResendSuccess(false);
      await api.post(`/api/tickets/resend/${id}`);
      setResendSuccess(true);
      setToast("Ticket email sent successfully");
      setTimeout(() => {
        setResendSuccess(false);
        setToast(null);
      }, 3000);
    } catch {
      setToast("Failed to resend ticket email");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setResending(false);
    }
  };

  const downloadTicket = () => {
    setDownloading(true);
    window.open(
      `${import.meta.env.VITE_API_URL}/api/tickets/download/${id}`,
      "_blank"
    );
    setToast("Ticket download started");
    setTimeout(() => {
      setDownloading(false);
      setToast(null);
    }, 2000);
  };

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[100dvh]
 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your ticket...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }
if (isValidAccess === false) {
  return (
    <AccessDenied
      title="Ticket Not Available"
      message="This ticket no longer exists or the event is unavailable."
    />
  );
}
  if (!reg || error) {
    return (
      <PublicLayout>
        <div className="min-h-[100dvh]
 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50">
          <div className="text-center bg-white rounded-3xl shadow-xl p-8 max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
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
            </div>
            <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find your ticket</p>
            <Link
              to="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const paidAmount = paymentDetails?.pricing?.total?.finalAmount || 0;
  const quantity = paymentDetails?.pricing?.quantity ?? reg.quantity ?? 1;

  /* ---------------- UI ---------------- */


  return (
    <PublicLayout>
      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            animation: confetti-fall 3s linear forwards;
          }
          .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
          .checkmark-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: checkmark 0.5s ease-in-out 0.3s forwards;
          }
        `}
      </style>

      <div className="min-h-[100dvh]
 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: [
                    "#10b981",
                    "#059669",
                    "#34d399",
                    "#fbbf24",
                    "#f59e0b",
                  ][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* SUCCESS HEADER */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-2.5 animate-bounce-in">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="white" />
                    <path
                      className="checkmark-path"
                      d="M25 50 L40 65 L75 35"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h1 className="text-xl font-extrabold mb-1">
                  Payment Successful!
                </h1>
                <p className="text-green-100 text-xs">
                  Your ticket has been sent to your email
                </p>
              </div>
            </div>

            {/* BODY */}
            <div className="p-4 space-y-3">
              {/* EVENT DETAILS CARD */}
              <div className="border border-green-200 rounded-xl p-3.5 bg-gradient-to-br from-green-50 to-emerald-50 animate-slide-up">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-green-600"
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
                  <p className="text-xs uppercase text-green-700 font-bold tracking-wide">
                    Event Details
                  </p>
                </div>

                <h2 className="font-bold text-base text-gray-900 mb-2">
                  {reg.eventId?.title}
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  {/* Main Ticket */}
                  <div className="bg-white rounded-lg p-2.5 border border-green-100">
                    <p className="text-[11px] text-gray-500 font-semibold mb-0.5">
                      Main Ticket
                    </p>
                    <p className="font-bold text-sm text-gray-900">
                      {reg.ticketName}
                    </p>
                  </div>

                  {/* Sub-Ticket */}
                  {reg.subTicketName && (
                    <div className="bg-white rounded-lg p-2.5 border border-green-100">
                      <p className="text-[11px] text-gray-500 font-semibold mb-0.5">
                        Option
                      </p>
                      <p className="font-bold text-sm text-gray-900">
                        {reg.subTicketName}
                      </p>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="bg-white rounded-lg p-2.5 border border-green-100">
                    <p className="text-[11px] text-gray-500 font-semibold mb-0.5">
                      Quantity
                    </p>
                    <p className="font-bold text-sm text-gray-900">
                      {quantity}
                    </p>
                  </div>

                  {/* Amount Paid */}
                  <div
                    className={`bg-white rounded-lg p-2.5 border border-green-100 ${
                      !reg.subTicketName ? "col-span-1" : "col-span-1"
                    }`}
                  >
                    <p className="text-[11px] text-gray-500 font-semibold mb-0.5">
                      Amount Paid
                    </p>
                    <p className="font-bold text-lg text-green-600">
                      ₹{paidAmount}
                    </p>
                  </div>
                </div>

                {/* Registration Number */}
                <div className="mt-2.5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-2.5 text-white">
                  <p className="text-[11px] text-gray-300 font-semibold mb-0.5 uppercase">
                    Registration Number
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-xs tracking-wider">
                      {reg.registrationNumber}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            reg.registrationNumber
                          );
                          setToast("Registration number copied");
                          setTimeout(() => setToast(null), 2000);
                        } catch {
                          setToast("Failed to copy registration number");
                          setTimeout(() => setToast(null), 2000);
                        }
                      }}
                      className="bg-white/20 hover:bg:white/30 px-2 py-1 rounded text-[11px] font-semibold transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* INFO BOX */}
              <div
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
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
                  <div>
                    <p className="font-semibold text-blue-900 text-sm mb-1">
                      What's Next?
                    </p>
                    <ul className="text-xs text-blue-800 space-y-0.5">
                      <li>✓ Check your email for the PDF ticket</li>
                      <li>✓ Download or save it to your phone</li>
                      <li>✓ Show it at the venue for entry</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div
                className="space-y-2 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <button
                  onClick={downloadTicket}
                  disabled={downloading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>
                    {downloading ? "Downloading..." : "Download Ticket (PDF)"}
                  </span>
                </button>

                <button
                  onClick={resendTicket}
                  disabled={resending}
                  className="w-full border border-gray-300 py-2.5 rounded-xl font-semibold hover:border-green-500 hover:text-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 
                         00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{resending ? "Sending..." : "Resend Ticket Email"}</span>
                </button>

                {resendSuccess && (
                  <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-xl text-center font-semibold text-xs">
                    ✓ Email sent successfully!
                  </div>
                )}
              </div>

              {/* FOOTER LINKS */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
                <Link
                  to="/"
                  className="text-gray-600 text-xs hover:text-green-600 font-semibold hover:underline"
                >
                  Back to Home
                </Link>
                <span className="text-gray-300">•</span>
                <Link
                  to="/"
                  className="text-gray-600 text-xs hover:text-green-600 font-semibold hover:underline"
                >
                  Browse Events
                </Link>
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                <p className="text-[11px] text-gray-600">
                  Need help?{" "}
                  <a
                    href="mailto:support@eventstg.online"
                    className="text-green-600 font-semibold hover:underline"
                  >
                    support@eventstg.online
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Success Message */}
          <div
            className="mt-3 text-center animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="text-gray-600 text-xs">
              See you at the event! Have an amazing time!
            </p>
          </div>
        </div>
      </div>

      {/* Toast at top-center */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs shadow-lg z-50">
          {toast}
        </div>
      )}
    </PublicLayout>
  );
}
