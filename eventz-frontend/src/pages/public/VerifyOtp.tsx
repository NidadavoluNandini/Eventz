import { useEffect, useRef, useState } from "react";
import api from "../../utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";

export default function VerifyOtp() {

  const [isValidRegistration, setIsValidRegistration] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const inputs = useRef<HTMLInputElement[]>([]);
  const { registrationId } = useParams();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // ✅ CHANGED: 2 minutes (120 seconds)

  const session =
    JSON.parse(sessionStorage.getItem("otpSession") || "null") ?? { registrationId };

  useEffect(() => {
    if (!session?.registrationId) {
      setError("Invalid session. Please restart registration.");
    }
  }, [session]);

  // Countdown timer


useEffect(() => {
  if (!isValidRegistration) return;
  if (timeLeft <= 0) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, isValidRegistration]);



useEffect(() => {
  const validateRegistration = async () => {
    try {
      await api.get(`/api/registrations/${registrationId}/status`);

      // ✅ registration valid
      setIsValidRegistration(true);
    } catch (err: any) {
      const message = err.response?.data?.message;

      if (
        message === "Registration closed" ||
        message === "Registration expired" ||
        message === "Registration not found" ||
        message === "Event not found"
      ) {
        setIsValidRegistration(false);
        return;
      }

      setIsValidRegistration(false);
    }
  };

  if (registrationId) {
    validateRegistration();
  }
}, [registrationId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[idx] = value;
    setOtp(updated);
    setError(""); // Clear error on input

    if (value && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const updated = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) updated[i] = char;
    });
    setOtp(updated);
    inputs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const resendOtp = async () => {
    try {
      setResendLoading(true);
      setResendMessage("");
      await api.post("/api/registrations/resend-otp", {
        registrationId: session.registrationId,
      });
      setResendMessage("OTP resent successfully!");
      setTimeLeft(120); // ✅ CHANGED: Reset to 2 minutes
      setOtp(Array(6).fill("")); // Clear OTP inputs
      inputs.current[0]?.focus();
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!session?.registrationId) {
      setError("Session expired. Please restart registration.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const otpValue = Number(otp.join(""));

      const res = await api.post("/api/registrations/verify-otp", {
        registrationId: session.registrationId,
        otp: otpValue,
      });

      const { requiresPayment } = res.data;

      setSuccess(true);

      setTimeout(() => {
        if (requiresPayment) {
          sessionStorage.setItem(
            "paymentSession",
            JSON.stringify({ registrationId: session.registrationId })
          );
          navigate(`/payment/${session.registrationId}`);
        } else {
          navigate(`/ticket-success/${session.registrationId}`);
        }
      }, 1500);
    } catch (err: any) {
      if (err.response?.data?.message === "Registration expired") {
        navigate("/registration-expired");
        return;
      }
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };
if (isValidRegistration === null) {
  return (
    <PublicLayout>
      <div className="min-h-[100vh] flex items-center justify-center">
        <p className="text-gray-600 font-medium">
          Validating registration...
        </p>
      </div>
    </PublicLayout>
  );
}
if (isValidRegistration === false) {
  return (
    <PublicLayout>
      <div className="min-h-[100vh] flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md">
          
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            ❌
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Registration Not Available
          </h2>

          <p className="text-gray-600 text-sm mb-6">
            This event is no longer accepting registrations or the session has expired.
          </p>

          <button
            onClick={() => navigate("/events")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}

  return (
    <PublicLayout>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes success-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
          .animate-success {
            animation: success-bounce 0.6s ease-in-out;
          }
        `}
      </style>

      <div className="min-h-[100dvh]
 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
        <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 ${success ? 'animate-success' : 'animate-fade-in'}`}>
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
                <p className="text-gray-600 text-sm">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 30 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-sm">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Resend Message */}
              {resendMessage && (
                <div className={`mb-4 p-3 rounded-lg ${resendMessage.includes("success") ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className={`text-sm font-medium ${resendMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {resendMessage}
                  </p>
                </div>
              )}

              {/* OTP Inputs with Labels */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  Enter OTP Code
                </label>
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        if (el) inputs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      value={v}
                      maxLength={1}
                      onChange={(e) => handleChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      aria-label={`OTP digit ${i + 1}`}
                      title={`Enter digit ${i + 1} of 6`}
                      placeholder="0"
                      className={`w-12 h-14 text-center border-2 rounded-xl text-xl font-bold transition-all focus:outline-none ${
                        error
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      } ${v ? "bg-indigo-50 border-indigo-400" : "bg-white"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyOtp}
                disabled={otp.join("").length !== 6 || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify OTP</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
                <button
                  onClick={resendOtp}
                  disabled={resendLoading || timeLeft > 60}
                  className="text-indigo-600 font-semibold text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
                {timeLeft > 60 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available in {formatTime(timeLeft - 60)}
                  </p>
                )}
              </div>

              {/* Help Text */}
            
            </>
          ) : (
            // 🎉 SUCCESS STATE
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-success">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Verified Successfully!</h2>
              <p className="text-gray-600 mb-4">Your OTP has been verified</p>
              <div className="flex items-center justify-center gap-2 text-indigo-600">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <span className="text-sm font-medium ml-2">Redirecting...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
