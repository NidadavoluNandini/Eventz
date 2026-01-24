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

  // allow refresh
  const storedSession = JSON.parse(
    sessionStorage.getItem("paymentSession") || "null"
  );

  const finalRegistrationId =
    registrationId || storedSession?.registrationId;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!finalRegistrationId) {
      setError("Invalid payment session.");
    }
  }, [finalRegistrationId]);

  const startPayment = async () => {
    if (!finalRegistrationId) return;

    try {
      setLoading(true);
      setError("");

      // 🔹 create Razorpay order
      const res = await api.post(
        "/api/payments/registration/create-order",
        {
          registrationId: finalRegistrationId,
        }
      );

      const {
        razorpayOrderId,
        amount,
        currency,
        key,
      } = res.data;

     const options = {
  key,
  amount,
  currency,
  name: "Eventz",
  description: "Event Ticket Payment",
  order_id: razorpayOrderId,

  handler: async (response: any) => {
    try {
      await api.post(
        "/api/payments/registration/verify",
        {
          registrationId: finalRegistrationId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }
      );
    } catch (err) {
      console.warn("Webhook will complete verification");
    }

    sessionStorage.removeItem("paymentSession");

    // ✅ move user immediately
    navigate(`/payment-processing/${finalRegistrationId}`);
  },

  modal: {
    ondismiss: async () => {
      try {
        await api.post(
          "/api/payments/registration/failed",
          {
            registrationId: finalRegistrationId,
          }
        );
      } catch {}

      navigate(`/payment-cancelled/${finalRegistrationId}`);
    },
  },

  theme: { color: "#000000" },
};
;

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Payment initialization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4">
            Complete Payment
          </h2>

          {error && (
            <p className="text-red-600 mb-4 text-sm">
              {error}
            </p>
          )}

          <button
            onClick={startPayment}
            disabled={loading || !!error}
            className="bg-black text-white px-6 py-3 rounded-lg w-full font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
