import { useEffect, useMemo, useState } from "react";
import { getOrganizerEvents, getEventAttendees } from "../../api/events.api";

import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

/* ================= TYPES ================= */

interface Event {
  _id: string;
  title: string;
  startDate: string;
}

/* ================= DASHBOARD ================= */

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEventId, setSelectedEventId] =
    useState<string>("all");

  const [timeframe, setTimeframe] =
    useState<"weekly" | "monthly">("monthly");

  /* ================= LOAD EVENTS ================= */

  useEffect(() => {
    getOrganizerEvents()
      .then(res => setEvents(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOAD REGISTRATIONS ================= */
useEffect(() => {
  if (selectedEventId !== "all") return;

  const loadAllRegistrations = async () => {
    try {
      const results = await Promise.all(
        events.map(e => getEventAttendees(e._id))
      );

      const allRegs = results.flatMap(r => r.data || []);
      setRegistrations(allRegs);
    } catch {
      setRegistrations([]);
    }
  };

  if (events.length > 0) {
    loadAllRegistrations();
  }
}, [selectedEventId, events]);

  useEffect(() => {
    if (selectedEventId === "all") {
      setRegistrations([]);
      return;
    }

    getEventAttendees(selectedEventId)
      .then(res => setRegistrations(res.data || []))
      .catch(() => setRegistrations([]));
  }, [selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (selectedEventId === "all") return null;
    return events.find(e => e._id === selectedEventId) || null;
  }, [events, selectedEventId]);

  /* ================= KPIs ================= */

  const totalEvents = events.length;

  // ✅ REGISTRATIONS = sum of quantity
  const totalRegistrations = registrations.reduce(
    (sum, r) => sum + (r.quantity ?? 1),
    0
  );

  // ✅ REVENUE from registrations
  const revenue = registrations.reduce(
    (sum, r) => sum + (r.totalAmount ?? 0),
    0
  );

  const avgTicketPrice =
    totalRegistrations > 0
      ? Math.round(revenue / totalRegistrations)
      : 0;

  /* ================= CSV DOWNLOAD ================= */

  const downloadAttendeesCSV = async () => {
    if (!selectedEvent) return;

    try {
      const res = await getEventAttendees(selectedEvent._id);
      const attendees = res.data || [];

      if (attendees.length === 0) {
        alert("No attendees found for this event");
        return;
      }

      const rows = [
        [
          "Registration No",
          "Name",
          "Email",
          "Phone",
          "Ticket",
          "Base Price",
          "Quantity",
          "GST %",
          "GST Amount",
          "Total Amount",
          "Registered At",
        ],
      ];

      attendees.forEach((a: any) => {
        rows.push([
          a.registrationNumber,
          a.userName,
          a.userEmail,
          a.userPhone ?? "",
          a.ticketName,
          String(a.basePricePerTicket ?? 0),
          String(a.quantity ?? 1),
          String(a.gstRate ?? 0),
          String(a.gstAmount ?? 0),
          String(a.totalAmount ?? 0),
          new Date(a.createdAt).toLocaleString(),
        ]);
      });

      const csv = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedEvent.title}-attendees.csv`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to download attendees");
    }
  };

  /* ================= REVENUE TREND ================= */

  const revenueData = useMemo(() => {
    const map: Record<string, number> = {};

    registrations.forEach(r => {
      const date = new Date(r.createdAt);
      const key =
        timeframe === "monthly"
          ? date.toLocaleString("default", {
              month: "short",
              year: "numeric",
            })
          : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

      map[key] = (map[key] || 0) + (r.totalAmount ?? 0);
    });

    return Object.entries(map).map(([name, revenue]) => ({
      name,
      revenue,
    }));
  }, [registrations, timeframe]);

  /* ================= UI ================= */

  const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];

  if (loading) {
    return (
      <p className="p-10 text-center text-slate-600">
        Loading Dashboard...
      </p>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm text-slate-600">
              View performance, registrations and revenue
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">📊 All Events Overview</option>
              {events.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>

            <button
              disabled={!selectedEvent}
              onClick={downloadAttendeesCSV}
              className={`px-4 py-2 rounded-lg font-semibold
                ${
                  selectedEvent
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
            >
              ⬇ Download Attendees
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Total Events" value={totalEvents} />
        <KPI title="Registrations" value={totalRegistrations} />
        <KPI title="Revenue" value={`₹${revenue}`} />
        <KPI title="Avg Ticket" value={`₹${avgTicketPrice}`} />
      </div>

      {/* REVENUE TREND */}
      <div className="bg-white p-6 rounded-xl">
        <div className="flex gap-3 mb-4">
          <button onClick={() => setTimeframe("weekly")}>
            Weekly
          </button>
          <button onClick={() => setTimeframe("monthly")}>
            Monthly
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              dataKey="revenue"
              stroke="#4F46E5"
              fill="#C7D2FE"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================= KPI ================= */

function KPI({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-5 rounded-xl border">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
