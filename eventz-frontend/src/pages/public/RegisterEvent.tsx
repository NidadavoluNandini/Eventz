import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PublicLayout from "../../layouts/PublicLayout";
import { getEventById } from "../../api/events.api";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "",
    quantity: 1,
  });

  useEffect(() => {
    if (id) {
      getEventById(id).then(res => setEvent(res.data));
    }
  }, [id]);

  const selectedTicket = event?.tickets.find(
    (t: any) => t.type === form.ticketType
  );

  const totalPrice =
    selectedTicket ? selectedTicket.price * form.quantity : 0;

  const isValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.ticketType &&
    form.quantity > 0;

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${API_URL}/api/registrations/initiate`,
        {
          eventId: id,
          userName: `${form.firstName} ${form.lastName}`,
          userEmail: form.email,
          userPhone: form.phone,
          ticketType: form.ticketType,
          quantity: form.quantity,
        }
      );

      if (res.data.resumePayment) {
        navigate(`/payment/${res.data.registrationId}`);
        return;
      }

      sessionStorage.setItem(
        "otpSession",
        JSON.stringify({ registrationId: res.data.registrationId })
      );

      navigate("/verify-otp");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to start registration"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <PublicLayout>
        <div className="py-20 text-center text-gray-500">
          Loading event…
        </div>
      </PublicLayout>
    );
  }

  /* ✅ SAFE META CONFIG (WITH FALLBACK) */
  const metaConfig: Record<string, any> = {
    VIP: {
      icon: "⭐",
      badge: "VIP Access",
      badgeClass: "bg-yellow-400 text-black",
      border: "border-yellow-400",
    },
    EARLY_BIRD: {
      icon: "🔥",
      badge: "Best Value",
      badgeClass: "bg-green-500 text-white",
      border: "border-green-500",
    },
    FREE: {
      icon: "🎁",
      badge: "Free Pass",
      badgeClass: "bg-blue-100 text-blue-700",
      border: "border-blue-400",
    },
    REGULAR: {
      icon: "🎟️",
      badge: "Regular",
      badgeClass: "bg-gray-200 text-gray-800",
      border: "border-gray-400",
    },
  };

  const defaultMeta = {
    icon: "🎫",
    badge: "Ticket",
    badgeClass: "bg-gray-100 text-gray-700",
    border: "border-gray-300",
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex justify-center py-14 px-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
          <p className="text-gray-600 mb-6">
            Choose your ticket & continue
          </p>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 🎟️ TICKET SELECTION */}
          <div className="space-y-4 mb-8">
            {event.tickets.map((t: any) => {
              const meta = metaConfig[t.type] || defaultMeta;
              const isSelected = form.ticketType === t.type;
              const isSoldOut = t.available <= 0;

              return (
                <label
                  key={t.type}
                  className={`flex items-center justify-between rounded-2xl border p-5 transition-all
                    ${
                      isSoldOut
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                    ${
                      isSelected
                        ? `${meta.border} bg-gray-50 ring-2 ring-black`
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <div className="flex gap-4">
                    <div className="text-2xl">{meta.icon}</div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{t.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${meta.badgeClass}`}
                        >
                          {meta.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isSoldOut
                          ? "Sold out"
                          : `${t.available} seats available`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      {t.price === 0 ? "FREE" : `₹${t.price}`}
                    </span>
                    <input
                      type="radio"
                      disabled={isSoldOut}
                      checked={isSelected}
                      onChange={() =>
                        setForm({ ...form, ticketType: t.type })
                      }
                      className="h-5 w-5 accent-black"
                    />
                  </div>
                </label>
              );
            })}
          </div>

          {/* 👤 USER DETAILS */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="First name"
              value={form.firstName}
              onChange={e =>
                setForm({ ...form, firstName: e.target.value })
              }
            />
            <Input
              placeholder="Last name"
              value={form.lastName}
              onChange={e =>
                setForm({ ...form, lastName: e.target.value })
              }
            />
          </div>

          <Input
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={e =>
              setForm({ ...form, email: e.target.value })
            }
            className="mb-3"
          />

          <Input
            placeholder="Phone number"
            type="tel"
            value={form.phone}
            onChange={e =>
              setForm({ ...form, phone: e.target.value })
            }
            className="mb-4"
          />

          {/* 👥 QUANTITY */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Number of attendees
            </label>
            <Input
              type="number"
              min={1}
              max={selectedTicket?.available || 1}
              value={form.quantity}
              onChange={e =>
                setForm({
                  ...form,
                  quantity: Number(e.target.value),
                })
              }
              className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* 💰 TOTAL */}
          {selectedTicket && (
            <div className="mb-6 bg-gray-100 p-4 rounded-xl flex justify-between">
              <span className="font-medium text-gray-700">
                Total payable
              </span>
              <span className="font-bold text-lg">
                {totalPrice === 0 ? "FREE" : `₹${totalPrice}`}
              </span>
            </div>
          )}

          {/* CONTINUE */}
          <button
            disabled={!isValid || loading}
            onClick={sendOtp}
            className={`w-full py-3 rounded-xl font-semibold transition
              ${
                isValid
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loading ? "Sending OTP…" : "Continue"}
          </button>

          <p className="text-xs text-center text-gray-500 mt-3">
            OTP will be expired in 5 minutes.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
    />
  );
}
