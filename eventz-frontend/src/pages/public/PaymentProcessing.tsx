import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import PublicLayout from "../../layouts/PublicLayout";

export default function PaymentProcessing() {
  const { registrationId } = useParams();
  const navigate = useNavigate();

 useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await api.get(
        `/api/registrations/${registrationId}`
      );

    if (
  res.data?.status === "COMPLETED" &&
  res.data?.paymentStatus === "PAID"
) {
  navigate(`/ticket-success/${registrationId}`);
}

    } catch (err) {
      console.error(err);
    }
  }, 2500);

  return () => clearInterval(interval);
}, [registrationId]);


  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">

          <div className="text-5xl animate-spin mb-4">⏳</div>

          <h2 className="text-xl font-bold mb-2">
            Processing Payment
          </h2>

          <p className="text-gray-600 text-sm">
            Please wait while we confirm your payment and
            generate your ticket.
          </p>

          <p className="text-xs text-gray-400 mt-4">
            Do not refresh this page
          </p>

        </div>
      </div>
    </PublicLayout>
  );
}
