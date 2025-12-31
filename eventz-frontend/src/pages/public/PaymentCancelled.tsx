// src/pages/public/PaymentCancelled.tsx
import { useParams, useNavigate } from "react-router-dom";

export default function PaymentCancelled() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-sm">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Payment Cancelled
        </h2>

        <p className="text-gray-600 mb-6">
          Your payment was not completed. You can retry anytime.
        </p>

        <button
          onClick={() => navigate(`/payment/${id}`)}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold"
        >
          🔁 Retry Payment
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 text-sm text-gray-500"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
