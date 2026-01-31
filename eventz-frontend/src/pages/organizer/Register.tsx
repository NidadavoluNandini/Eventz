import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axios";

type Step = "email" | "otp" | "details";

export default function Register() {
  const navigate = useNavigate();

  // IMPORTANT: Change these to your backend routes
 const ENDPOINTS = useMemo(
  () => ({
    sendOtp: "/api/auth/organizer/send-otp",
    verifyOtp: "/api/auth/organizer/verify-otp",
    register: "/api/auth/organizer/register",
  }),
  []
);


  const [step, setStep] = useState<Step>("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [verificationId, setVerificationId] = useState<string | null>(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Advanced email validation function (same logic style you used)
  const validateEmail = (value: string): { isValid: boolean; error: string } => {
    value = value.trim();

    if (!value) return { isValid: false, error: "Email is required" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return { isValid: false, error: "Invalid email format" };

    const [localPart, domainPart] = value.split("@");
    if (value.includes("..")) return { isValid: false, error: "Email cannot contain consecutive dots (..)" };

    const domainParts = domainPart.split(".");
    const duplicateTLDs = [".com.com", ".org.org", ".net.net", ".edu.edu", ".in.in", ".uk.uk", ".us.us", ".io.io"];
    if (duplicateTLDs.some((dup) => domainPart.endsWith(dup))) {
      return { isValid: false, error: "Invalid domain - duplicate extension detected" };
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) return { isValid: false, error: "Invalid domain extension" };

    const commonDomains: Record<string, string> = {
      "gmial.com": "gmail.com",
      "gmai.com": "gmail.com",
      "gmil.com": "gmail.com",
      "yahooo.com": "yahoo.com",
      "yaho.com": "yahoo.com",
      "hotmial.com": "hotmail.com",
      "outlok.com": "outlook.com",
    };
    if (commonDomains[domainPart.toLowerCase()]) {
      return { isValid: false, error: `Did you mean ${commonDomains[domainPart.toLowerCase()]}?` };
    }

    if (value.includes(" ")) return { isValid: false, error: "Email cannot contain spaces" };

    const validLocalRegex = /^[a-zA-Z0-9._+-]+$/;
    if (!validLocalRegex.test(localPart)) return { isValid: false, error: "Email contains invalid characters" };

    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return { isValid: false, error: "Email cannot start or end with a dot" };
    }

    if (domainParts.length < 2) return { isValid: false, error: "Invalid domain format" };
    if (/^\d+$/.test(domainParts[0])) return { isValid: false, error: "Invalid domain name" };

    return { isValid: true, error: "" };
  };

  const resetMessages = () => {
    setSuccess("");
    setError("");
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const validation = validateEmail(val);
    if (!validation.isValid && val) setEmailError(validation.error);
    else setEmailError("");
  };

  const sendOtp = async () => {
    resetMessages();
    setOtpError("");

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(ENDPOINTS.sendOtp, { email });

      // If your backend returns a verificationId/sessionId, store it (optional).
      const vId = res.data?.verificationId || res.data?.verification_id || res.data?.id || null;
      setVerificationId(vId);

      setSuccess("OTP sent to your email. Please check your inbox.");
      setStep("otp");
    } catch (err: any) {
      // Your requested message when OTP can't be sent / email invalid/unverified
      setError(
        err.response?.data?.message ||
          "Email not found / not verified. OTP was not sent. Please provide a valid email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    resetMessages();
    setOtpError("");

    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(ENDPOINTS.verifyOtp, {
        email,
        otp,
        verificationId, // optional, if your backend uses it
      });

      setSuccess("Email verified successfully. You can now create your account.");
      setStep("details");
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setPasswordError("");

    if (step !== "details") {
      setError("Please verify your email first.");
      return;
    }

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (password.trim().length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(ENDPOINTS.register, {
        name,
        email,
        password,
        otp, // include OTP so backend can cross-validate
        verificationId, // optional
      });

      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/organizer/login"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const changeEmail = () => {
    resetMessages();
    setOtp("");
    setVerificationId(null);
    setStep("email");
  };

  return (
    <div className="h-svh overflow-hidden bg-slate-50 px-4 py-3 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden px-6 py-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-0" />

          <div className="relative z-10">
            {/* Header (compact) */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl mb-2 shadow-xl shadow-indigo-500/40 relative">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Create Account
              </h1>
              <p className="text-slate-600 text-sm font-medium">
                Verify email → then register
              </p>

              {/* Step pills */}
<div className="mt-3 flex items-center justify-center gap-1">
  {/* Line */}
  <div className="flex-1 h-1 bg-gradient-to-r from-slate-200 to-slate-200 rounded-full" />

  {/* Steps */}
  <div className="flex items-center gap-3">
    <div
      className={`relative flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
        step === "email"
          ? "text-indigo-700"
          : step === "otp"
          ? "text-indigo-500"
          : "text-slate-500"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
          step === "email"
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
            : step === "otp"
            ? "bg-indigo-50 border-indigo-300"
            : "bg-slate-50 border-slate-300"
        }`}
      >
        {step === "email" ? "✓" : "1"}
      </div>
      <span className="text-xs font-medium leading-tight">Email</span>
    </div>

    <div
      className={`w-10 h-1 transition-all duration-300 ${
        step === "email" ? "bg-indigo-200" : step === "otp" ? "bg-indigo-300" : "bg-slate-200"
      }`}
    />

    <div
      className={`relative flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
        step === "otp"
          ? "text-indigo-700"
          : step === "details"
          ? "text-indigo-500"
          : "text-slate-500"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
          step === "otp"
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
            : step === "details"
            ? "bg-indigo-50 border-indigo-300"
            : "bg-slate-50 border-slate-300"
        }`}
      >
        {step === "otp" ? "✓" : "2"}
      </div>
      <span className="text-xs font-medium leading-tight">OTP</span>
    </div>

    <div
      className={`w-10 h-1 transition-all duration-300 ${
        step === "otp" ? "bg-indigo-200" : step === "details" ? "bg-indigo-300" : "bg-slate-200"
      }`}
    />

    <div
      className={`relative flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
        step === "details" ? "text-indigo-700" : "text-slate-500"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
          step === "details"
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
            : "bg-slate-50 border-slate-300"
        }`}
      >
        {step === "details" ? "✓" : "3"}
      </div>
      <span className="text-xs font-medium leading-tight">Details</span>
    </div>
  </div>

  {/* Right line */}
  <div className="flex-1 h-1 bg-gradient-to-r from-slate-200 to-slate-200 rounded-full" />
</div>
            </div>

            {/* Success / Error */}
            {success && (
              <div className="mb-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-xl text-sm text-green-700 font-medium">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* STEP 1: Email */}
            {step === "email" && (
              <div className="space-y-3">
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${emailError ? "text-red-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                        if (error) setError("");
                      }}
                      onBlur={handleEmailBlur}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent focus:bg-white transition outline-none disabled:opacity-50 ${
                        emailError ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"
                      }`}
                    />
                  </div>

                  {emailError && <p className="mt-1.5 text-sm text-red-600">{emailError}</p>}
                </div>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={isLoading || !!emailError}
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-3 rounded-xl font-bold shadow-xl shadow-indigo-500/35 hover:shadow-indigo-500/55 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>

                <Link
                  to="/organizer/login"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Already have an account? Login
                </Link>
              </div>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                  OTP sent to: <span className="font-semibold">{email}</span>
                </div>

                <div className="group">
                  <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-1">
                    Enter OTP
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (otpError) setOtpError("");
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent focus:bg-white transition outline-none disabled:opacity-50 ${
                      otpError ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"
                    }`}
                  />

                  {otpError && <p className="mt-1.5 text-sm text-red-600">{otpError}</p>}
                </div>

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-3 rounded-xl font-bold shadow-xl shadow-indigo-500/35 hover:shadow-indigo-500/55 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-70"
                  >
                    Resend OTP
                  </button>

                  <button
                    type="button"
                    onClick={changeEmail}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-70"
                  >
                    Change email
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Details */}
            {step === "details" && (
              <form onSubmit={handleCreateAccount} className="space-y-3">
                <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
                  Email verified: <span className="font-semibold">{email}</span>
                </div>

                <div className="group">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition outline-none disabled:opacity-50"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      disabled={isLoading}
                      className={`w-full pl-4 pr-12 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent focus:bg-white transition outline-none disabled:opacity-50 ${
                        passwordError ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"
                      }`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition"
                      disabled={isLoading}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {passwordError && <p className="mt-1.5 text-sm text-red-600">{passwordError}</p>}
                  {!passwordError && (
                    <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters long</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-3 rounded-xl font-bold shadow-xl shadow-indigo-500/35 hover:shadow-indigo-500/55 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>

                <Link
                  to="/organizer/login"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Login instead
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
