import { useState } from "react";
import api from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";

export default function OrganizerForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/organizer/forgot-password", { email });

      setMessage("Password reset email sent.");
      setTimeout(() => {
        navigate("/organizer/reset-password");
      }, 500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your organizer email
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}
        {message && (
          <div className="mb-4 text-sm text-green-600">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="organizer@example.com"
            className="w-full border px-4 py-3 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            to="/organizer/login"
            className="text-indigo-600 font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
