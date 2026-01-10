import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import api from "../../utils/axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!registrationId) {
      setError("Invalid payment session.");
      setLoading(false);
      return;
    }

    startPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);

  const startPayment = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ CREATE ORDER (CORRECT API CALL)
      const res = await api.post(
        "/api/payment/initiate/create-order",
        {
          registrationId,
        }
      );

      const {
        orderId,
        amount,
        currency,
        key,
        user,
      } = res.data;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key,
        amount,
        currency,
        name: "Eventz",
        description: "Event Registration",
        order_id: orderId,

        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },

        theme: {
          color: "#000000",
        },

        handler: async (response: any) => {
          try {
            // ✅ VERIFY PAYMENT
            await api.post(
              "/api/payment/verify",
              {
                registrationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            navigate(`/ticket-success/${registrationId}`);
          } catch (err) {
            console.error("VERIFY ERROR:", err);
            setError("Payment verification failed.");
          }
        },

        modal: {
          ondismiss: () => {
            setError("Payment cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error("PAYMENT ERROR:", err.response?.data || err);
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
              <div className="text-3xl mb-4">💳</div>
              <h2 className="text-xl font-bold mb-2">
                Initializing Payment
              </h2>
              <p className="text-gray-500">
                Please wait…
              </p>
            </>
          )}

          {!loading && error && (
            <>
              <p className="text-red-600 font-medium mb-4">
                {error}
              </p>
              <button
                onClick={() => navigate(-1)}
                className="bg-black text-white px-6 py-2 rounded-xl"
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
