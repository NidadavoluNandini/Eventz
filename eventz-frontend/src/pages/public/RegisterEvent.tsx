import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/axios";
import PublicLayout from "../../layouts/PublicLayout";
import { getEventById } from "../../api/events.api";

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
    ticketName: "", // ✅ IMPORTANT (matches backend)
    quantity: 1,
  });

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    if (!id) return;
    getEventById(id).then((res) => setEvent(res.data));
  }, [id]);

  /* ================= SELECTED TICKET ================= */
  const selectedTicket = event?.tickets.find(
    (t: any) => t.name === form.ticketName
  );

  /* ================= GST CALCULATION ================= */
  const basePerTicket = selectedTicket?.price ?? 0;
  const gstRate = selectedTicket?.gst ?? 0;

  const baseTotal = basePerTicket * form.quantity;
  const gstAmount = Math.round((baseTotal * gstRate) / 100);
  const totalPayable = baseTotal + gstAmount;

  /* ================= FORM VALIDATION ================= */
  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.ticketName &&
    form.quantity > 0;

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/registrations/initiate", {
        eventId: id,
        userName: `${form.firstName} ${form.lastName}`,
        userEmail: form.email,
        userPhone: form.phone,
        ticketName: form.ticketName, // ✅ MATCHES BACKEND
        quantity: form.quantity,
      });

      sessionStorage.setItem(
        "otpSession",
        JSON.stringify({ registrationId: res.data.registrationId })
      );

      navigate("/verify-otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start registration");
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex justify-center py-14 px-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
          <p className="text-gray-600 mb-6">Choose your ticket & continue</p>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ================= TICKETS ================= */}
          <div className="space-y-4 mb-8">
            {event.tickets.map((t: any) => {
              const isSelected = form.ticketName === t.name;

              return (
                <label
                  key={t.name}
                  className={`flex items-center justify-between rounded-2xl border p-5 cursor-pointer transition
                    ${
                      isSelected
                        ? "border-black ring-2 ring-black"
                        : "border-gray-200"
                    }
                  `}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <p className="text-xs text-gray-500">
                      GST {t.gst}% applicable
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      ₹{Math.round(t.price + (t.price * t.gst) / 100)}
                    </span>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() =>
                        setForm({ ...form, ticketName: t.name })
                      }
                      className="h-5 w-5 accent-black"
                    />
                  </div>
                </label>
              );
            })}
          </div>

          {/* ================= USER DETAILS ================= */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
            />
            <Input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
            />
          </div>

          <Input
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="mb-3"
          />

          <Input
            placeholder="Phone number"
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="mb-4"
          />

          {/* ================= QUANTITY ================= */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Number of attendees
            </label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: Number(e.target.value),
                })
              }
            />
          </div>

          {/* ================= PRICE BREAKUP ================= */}
          {selectedTicket && (
            <div className="mb-6 bg-gray-100 p-4 rounded-xl space-y-1">
              <div className="flex justify-between text-sm">
                <span>Base price total</span>
                <span>₹{baseTotal}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>GST total ({gstRate}%)</span>
                <span>₹{gstAmount}</span>
              </div>

              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total payable</span>
                <span>₹{totalPayable}</span>
              </div>
            </div>
          )}

          {/* ================= CONTINUE ================= */}
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
            OTP will expire in 5 minutes.
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
