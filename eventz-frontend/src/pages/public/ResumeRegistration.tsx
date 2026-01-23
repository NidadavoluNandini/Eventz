import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function ResumeRegistration() {
  const { registrationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRegistration = async () => {
      try {
        const res = await api.get(
  `/api/registrations/${registrationId}`
);


        const reg = res.data;

        // ❌ expired
        if (
          reg.status === "CANCELLED" ||
          new Date(reg.expiresAt) < new Date()
        ) {
          navigate("/registration-expired");
          return;
        }

        // 🔐 OTP not verified
        if (reg.status === "PENDING_OTP") {
          navigate(`/verify-otp/${registrationId}`);
          return;
        }

        // 💳 payment pending
        if (reg.status === "PENDING_PAYMENT") {
          navigate(`/payment/${registrationId}`);
          return;
        }

        // ✅ already completed
        if (reg.status === "COMPLETED") {
          navigate(`/ticket/${registrationId}`);
        }
      } catch (err) {
        navigate("/registration-expired");
      }
    };

    loadRegistration();
  }, [registrationId]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">
        Resuming your registration...
      </p>
    </div>
  );
}
