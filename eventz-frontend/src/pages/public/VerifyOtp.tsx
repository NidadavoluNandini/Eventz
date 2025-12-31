// src/pages/public/VerifyOtp.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const inputs = useRef<HTMLInputElement[]>([]);

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const session = JSON.parse(
    sessionStorage.getItem("otpSession") || "null"
  );

  useEffect(() => {
    if (!session?.registrationId) {
      setError("Invalid session. Please restart registration.");
    }
  }, [session]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[idx] = value;
    setOtp(updated);

    if (value && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
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

      const res = await axios.post(
        `${API_URL}/api/registrations/verify-otp`,
        {
          registrationId: session.registrationId,
          otp: otpValue,
        }
      );

      const { requiresPayment } = res.data;

      // ✅ SHOW SUCCESS UI
      setSuccess(true);

      // ✅ SMOOTH REDIRECT
      setTimeout(() => {
        if (requiresPayment) {
          navigate(`/payment/${session.registrationId}`);
        } else {
          navigate(`/ticket-success/${session.registrationId}`);
        }
      }, 1200);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">

          {!success ? (
            <>
              <h2 className="text-xl font-bold mb-2">Verify OTP</h2>
              <p className="text-gray-500 mb-5 text-sm">
                Enter the 6-digit OTP shown in backend console
              </p>

              {error && (
                <p className="text-red-600 mb-3 text-sm">
                  {error}
                </p>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={el => {
                      if (el) inputs.current[i] = el;
                    }}
                    value={v}
                    maxLength={1}
                    onChange={e =>
                      handleChange(e.target.value, i)
                    }
                    onKeyDown={e =>
                      handleKeyDown(e, i)
                    }
                    className="w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={otp.join("").length !== 6 || loading}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold transition hover:bg-gray-800"
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
            </>
          ) : (
            // 🎉 SUCCESS STATE
            <div className="animate-fade-in">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-green-600">
                OTP Verified!
              </h2>
              <p className="text-gray-500 mt-2">
                Generating your ticket…
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
