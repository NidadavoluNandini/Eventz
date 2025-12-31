// src/pages/public/Payment.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PublicLayout from "../../layouts/PublicLayout";

const API_URL = import.meta.env.VITE_API_URL;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { id: registrationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => initPayment();
    script.onerror = () => {
      setError("Failed to load payment gateway");
      setLoading(false);
    };

    document.body.appendChild(script);
  }, []);

  const initPayment = async () => {
    try {
      if (!registrationId) {
        setError("Invalid registration");
        setLoading(false);
        return;
      }

      // 1️⃣ Create order
      const { data } = await axios.post(
        `${API_URL}/payments/registration/create-order`,
        { registrationId }
      );

      // 2️⃣ Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Eventz",
        description: "Event Ticket Payment",
        order_id: data.razorpayOrderId,

        // ✅ PAYMENT SUCCESS
        handler: async (response: any) => {
          await axios.post(
            `${API_URL}/payments/registration/verify`,
            {
              registrationId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }
          );

          navigate(`/ticket-success/${registrationId}`);
        },

        // ❌ PAYMENT CANCELLED
        modal: {
          ondismiss: async () => {
            try {
              // 🔥 INFORM BACKEND (EMAIL TRIGGER)
              await axios.post(
                `${API_URL}/payments/registration/failed`,
                { registrationId }
              );
            } catch (e) {
              console.error("Failed to notify backend", e);
            }

            navigate(`/payment-cancelled/${registrationId}`);
          },
        },

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },

        theme: { color: "#000000" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to start payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">

          {loading && (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">
                Opening payment gateway…
              </p>
            </>
          )}

          {error && (
            <>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold"
              >
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
