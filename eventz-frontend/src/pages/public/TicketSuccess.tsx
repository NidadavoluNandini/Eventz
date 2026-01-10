import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PublicLayout from "../../layouts/PublicLayout";
import api from "../../utils/axios";

export default function TicketSuccess() {
  const { id } = useParams<{ id: string }>();
  const [reg, setReg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchRegistration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRegistration = async () => {
    try {
      const res = await api.get(`/api/registrations/${id}`);
      setReg(res.data);
    } catch (err) {
      console.error("Failed to load ticket", err);
      setError("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const resendTicket = async () => {
    try {
      await api.post("/api/tickets/resend", {
        registrationId: id,
      });
      alert("📧 Ticket email resent!");
    } catch (err) {
      alert("Failed to resend ticket email");
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading your ticket…
        </div>
      </PublicLayout>
    );
  }

  if (!reg || error) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center text-red-600">
          Ticket not found
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 text-center">
            <div className="text-4xl mb-2">🎟️</div>
            <h1 className="text-2xl font-bold">Ticket Confirmed</h1>
            <p className="text-gray-300 text-sm mt-1">
              Payment successful & ticket generated
            </p>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-5">

            {/* EVENT CARD */}
            <div className="border rounded-2xl p-4 bg-gray-50">
              <p className="text-xs uppercase text-gray-500 mb-1">
                Event
              </p>
              <h2 className="font-semibold text-lg">
                {reg.eventId?.title}
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Ticket Type</p>
                  <p className="font-medium">{reg.ticketType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Registration No</p>
                  <p className="font-mono text-xs">
                    {reg.registrationNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* DOWNLOAD TICKET */}
            <a
              href={`${import.meta.env.VITE_API_URL}/api/tickets/download/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-black text-white py-3 rounded-xl font-semibold text-center hover:bg-gray-800 transition"
            >
              ⬇ Download Ticket (PDF)
            </a>

            {/* RESEND EMAIL */}
            <button
              onClick={resendTicket}
              className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              📧 Resend Ticket Email
            </button>

            {/* FOOTER */}
            <Link
              to="/"
              className="block text-center text-sm text-gray-500 pt-2 hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
