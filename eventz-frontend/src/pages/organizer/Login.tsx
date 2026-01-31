import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function OrganizerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Advanced email validation function
  const validateEmail = (email: string): { isValid: boolean; error: string } => {
    email = email.trim();

    if (!email) {
      return { isValid: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Invalid email format" };
    }

    const [localPart, domainPart] = email.split("@");

    if (email.includes("..")) {
      return { isValid: false, error: "Email cannot contain consecutive dots (..)" };
    }

    const domainParts = domainPart.split(".");

    const duplicateTLDs = [
      ".com.com",
      ".org.org",
      ".net.net",
      ".edu.edu",
      ".in.in",
      ".uk.uk",
      ".us.us",
      ".io.io",
    ];

    if (duplicateTLDs.some((dup) => domainPart.endsWith(dup))) {
      return { isValid: false, error: "Invalid domain - duplicate extension detected" };
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) {
      return { isValid: false, error: "Invalid domain extension" };
    }

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
      return {
        isValid: false,
        error: `Did you mean ${commonDomains[domainPart.toLowerCase()]}?`,
      };
    }

    if (email.includes(" ")) {
      return { isValid: false, error: "Email cannot contain spaces" };
    }

    const validLocalRegex = /^[a-zA-Z0-9._+-]+$/;
    if (!validLocalRegex.test(localPart)) {
      return { isValid: false, error: "Email contains invalid characters" };
    }

    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return { isValid: false, error: "Email cannot start or end with a dot" };
    }

    if (domainParts.length < 2) {
      return { isValid: false, error: "Invalid domain format" };
    }

    if (/^\d+$/.test(domainParts[0])) {
      return { isValid: false, error: "Invalid domain name" };
    }

    return { isValid: true, error: "" };
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    const validation = validateEmail(emailValue);

    if (!validation.isValid && emailValue) setEmailError(validation.error);
    else setEmailError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/organizer/login", {
        email,
        password,
      });

      const token = res.data.access_token || res.data.accessToken || res.data.token;

      if (!token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      localStorage.setItem("organizerToken", token);
      localStorage.setItem("organizer", JSON.stringify(res.data.organizer));

      navigate("/organizer/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-svh overflow-hidden bg-slate-50 px-4 py-3 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden px-6 py-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-0" />

          <div className="relative z-10">
            {/* Header (tight to avoid scroll) */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl mb-2 shadow-xl shadow-indigo-500/40 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                <svg
                  className="w-7 h-7 text-white relative z-10 transform group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Welcome Back
              </h1>
              <p className="text-slate-600 text-sm font-medium">
                Sign in to manage your events
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className={`h-5 w-5 transition-colors ${
                        emailError
                          ? "text-red-500"
                          : "text-slate-400 group-focus-within:text-indigo-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <input
                    id="email"
                    type="email"
                    placeholder="organizer@example.com"
                    className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent focus:bg-white transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400 ${
                      emailError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-indigo-500"
                    }`}
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    required
                    disabled={isLoading}
                  />

                  {emailError && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {emailError && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top duration-200">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Password
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="ml-2 text-slate-600">Remember me</span>
                </label>

                <Link
                  to="/organizer/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Buttons: Sign In + Create Account */}
              <button
                type="submit"
                disabled={isLoading || !!emailError}
                className="group relative w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-3 rounded-xl font-bold shadow-xl shadow-indigo-500/35 hover:shadow-indigo-500/55 hover:scale-[1.01] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <Link
                to="/organizer/register"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Create account
              </Link>

              {/* Security badge inside card (no extra page height) */}
              <div className="pt-1 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-[11px] text-slate-600 font-medium">
                    256-bit SSL Encrypted and Secure
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Optional: if you still see scroll, remove this whole block (kept empty by default) */}
      </div>
    </div>
  );
}
