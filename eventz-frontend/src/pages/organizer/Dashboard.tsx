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
  BarChart,
  Bar,
  Legend,
  Label,
  LineChart,
  Line,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

/* ================= TYPES ================= */

interface Event {
  _id: string;
  title: string;
  startDate: string;
  status: string;
}

/* ================= DASHBOARD ================= */

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("monthly");

  /* ================= LOAD EVENTS ================= */

  useEffect(() => {
    getOrganizerEvents()
      .then((res) => setEvents(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOAD REGISTRATIONS ================= */
  useEffect(() => {
    if (selectedEventId !== "all") return;

    const loadAllRegistrations = async () => {
      try {
        const results = await Promise.all(
          events.map((e) => getEventAttendees(e._id))
        );

        const allRegs = results.flatMap((r) => r.data || []);
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
      .then((res) => setRegistrations(res.data || []))
      .catch(() => setRegistrations([]));
  }, [selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (selectedEventId === "all") return null;
    return events.find((e) => e._id === selectedEventId) || null;
  }, [events, selectedEventId]);

  /* ================= KPIs ================= */

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  const draftEvents = events.filter((e) => e.status === "DRAFT").length;

  const totalRegistrations = registrations.reduce(
    (sum, r) => sum + (r.quantity ?? 1),
    0
  );

  const revenue = registrations.reduce(
    (sum, r) => sum + (r.totalAmount ?? 0),
    0
  );

  const avgTicketPrice =
    totalRegistrations > 0 ? Math.round(revenue / totalRegistrations) : 0;

  /* ================= NEW ANALYTICS CALCULATIONS ================= */

  // Registration Rate Over Time
  const registrationTrend = useMemo(() => {
    const map: Record<string, number> = {};

    registrations.forEach((r) => {
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

      map[key] = (map[key] || 0) + (r.quantity ?? 1);
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .slice(-12);
  }, [registrations, timeframe]);

  // Combined Revenue and Registration Trend
  const combinedTrend = useMemo(() => {
    const map: Record<string, { revenue: number; registrations: number }> = {};

    registrations.forEach((r) => {
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

      if (!map[key]) {
        map[key] = { revenue: 0, registrations: 0 };
      }
      map[key].revenue += r.totalAmount ?? 0;
      map[key].registrations += r.quantity ?? 1;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        registrations: data.registrations,
      }))
      .slice(-12);
  }, [registrations, timeframe]);

  // Hourly Registration Pattern
  const hourlyPattern = useMemo(() => {
    const hourMap: Record<number, number> = {};

    registrations.forEach((r) => {
      const hour = new Date(r.createdAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      registrations: hourMap[i] || 0,
    }));
  }, [registrations]);

  // Day of Week Pattern
  const dayPattern = useMemo(() => {
    const dayMap: Record<string, number> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    registrations.forEach((r) => {
      const day = days[new Date(r.createdAt).getDay()];
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    return days.map((day) => ({
      day,
      registrations: dayMap[day] || 0,
    }));
  }, [registrations]);

  // Revenue by Payment Method (if available in data)
  const paymentMethodData = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};

    registrations.forEach((r) => {
      const method = r.paymentMethod || "Online";
      if (!map[method]) {
        map[method] = { count: 0, revenue: 0 };
      }
      map[method].count += 1;
      map[method].revenue += r.totalAmount ?? 0;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }));
  }, [registrations]);

  // Conversion Funnel (Mock data - adjust based on your actual data)
  const conversionFunnel = useMemo(() => {
    const totalViews = registrations.length * 3.5; // Assuming 3.5 views per registration
    const startedRegistration = registrations.length * 1.8;
    const completed = registrations.length;

    return [
      { stage: "Page Views", value: Math.round(totalViews), percentage: 100 },
      {
        stage: "Started Registration",
        value: Math.round(startedRegistration),
        percentage: Math.round((startedRegistration / totalViews) * 100),
      },
      {
        stage: "Completed",
        value: completed,
        percentage: Math.round((completed / totalViews) * 100),
      },
    ];
  }, [registrations]);

  // Event Performance Radar
  const eventRadarData = useMemo(() => {
    if (selectedEventId === "all" || !selectedEvent) return [];

    const total = registrations.length;
    const revenueMax = Math.max(...registrations.map((r) => r.totalAmount || 0));
    const avgRevenue =
      total > 0
        ? registrations.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / total
        : 0;

    return [
      {
        metric: "Registrations",
        value: Math.min((total / 100) * 100, 100),
        fullMark: 100,
      },
      {
        metric: "Revenue",
        value: Math.min((revenue / 100000) * 100, 100),
        fullMark: 100,
      },
      {
        metric: "Avg Ticket",
        value: Math.min((avgTicketPrice / 1000) * 100, 100),
        fullMark: 100,
      },
      {
        metric: "Engagement",
        value: Math.min((total / publishedEvents || 1) * 10, 100),
        fullMark: 100,
      },
      {
        metric: "Growth",
        value: Math.random() * 80 + 20,
        fullMark: 100,
      },
    ];
  }, [selectedEventId, selectedEvent, registrations, revenue, avgTicketPrice, publishedEvents]);

  // Top Revenue Days
  const topRevenueDays = useMemo(() => {
    const dayMap: Record<string, number> = {};

    registrations.forEach((r) => {
      const date = new Date(r.createdAt).toLocaleDateString();
      dayMap[date] = (dayMap[date] || 0) + (r.totalAmount ?? 0);
    });

    return Object.entries(dayMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([date, revenue]) => ({ date, revenue }));
  }, [registrations]);

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
          "Sub-Ticket",
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
          a.subTicketName ?? "",
          String(a.basePricePerTicket ?? 0),
          String(a.quantity ?? 1),
          String(a.gstRate ?? 0),
          String(a.gstAmount ?? 0),
          String(a.totalAmount ?? 0),
          new Date(a.createdAt).toLocaleString(),
        ]);
      });

      const csv = rows.map((r) => r.join(",")).join("\n");
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

    registrations.forEach((r) => {
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

    return Object.entries(map)
      .map(([name, revenue]) => ({
        name,
        revenue,
      }))
      .slice(-12);
  }, [registrations, timeframe]);

  /* ================= TICKET DISTRIBUTION (ENHANCED) ================= */

  const ticketDistribution = useMemo(() => {
    const map: Record<
      string,
      { total: number; subTickets: Record<string, number> }
    > = {};

    registrations.forEach((r) => {
      const ticketName = r.ticketName || "Unknown";
      const subTicketName = r.subTicketName || "General";

      if (!map[ticketName]) {
        map[ticketName] = { total: 0, subTickets: {} };
      }

      const quantity = r.quantity ?? 1;
      map[ticketName].total += quantity;
      map[ticketName].subTickets[subTicketName] =
        (map[ticketName].subTickets[subTicketName] || 0) + quantity;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      value: data.total,
      subTickets: Object.entries(data.subTickets).map(([subName, subValue]) => ({
        name: subName,
        value: subValue,
      })),
    }));
  }, [registrations]);

  const subTicketData = useMemo(() => {
    return ticketDistribution.flatMap((ticket) =>
      ticket.subTickets.map((sub) => ({
        name: `${ticket.name} - ${sub.name}`,
        value: sub.value,
        parentTicket: ticket.name,
      }))
    );
  }, [ticketDistribution]);

  /* ================= EVENT PERFORMANCE ================= */

  const eventPerformance = useMemo(() => {
    const map: Record<string, { registrations: number; revenue: number }> = {};

    registrations.forEach((r) => {
      const eventTitle =
        events.find((e) => e._id === r.eventId)?.title || "Unknown";
      if (!map[eventTitle]) {
        map[eventTitle] = { registrations: 0, revenue: 0 };
      }
      map[eventTitle].registrations += r.quantity ?? 1;
      map[eventTitle].revenue += r.totalAmount ?? 0;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        registrations: data.registrations,
        revenue: data.revenue,
      }))
      .slice(0, 5);
  }, [registrations, events]);

  /* ================= RECENT REGISTRATIONS ================= */

  const recentRegistrations = useMemo(() => {
    return [...registrations]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [registrations]);

  /* ================= UI ================= */

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                📊 Track performance, registrations, and revenue in real-time
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-4 py-2.5 border-2 border-indigo-200 rounded-xl font-semibold text-gray-700 bg-white hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">📊 All Events Overview</option>
                {events.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
                ))}
              </select>

              <button
                disabled={!selectedEvent}
                onClick={downloadAttendeesCSV}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                  selectedEvent
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            title="Total Events"
            value={totalEvents}
            subtitle={`${publishedEvents} Published, ${draftEvents} Draft`}
            icon="📅"
            gradient="from-blue-500 to-cyan-500"
          />
          <KPI
            title="Registrations"
            value={totalRegistrations}
            subtitle="Total attendees"
            icon="👥"
            gradient="from-green-500 to-emerald-500"
          />
          <KPI
            title="Revenue"
            value={`₹${revenue.toLocaleString()}`}
            subtitle="Total earnings"
            icon="💰"
            gradient="from-purple-500 to-pink-500"
          />
          <KPI
            title="Avg Ticket"
            value={`₹${avgTicketPrice}`}
            subtitle="Per registration"
            icon="🎫"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* NEW: CONVERSION FUNNEL & TOP DAYS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Conversion Funnel
            </h3>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {stage.stage}
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {stage.value} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Revenue Days */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🏆 Top Revenue Days
            </h3>
            <div className="space-y-3">
              {topRevenueDays.map((day, index) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {day.date}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ₹{day.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMBINED REVENUE & REGISTRATION TREND */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Revenue & Registration Trend
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe("weekly")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === "weekly"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === "monthly"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={combinedTrend}>
              <defs>
                <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="url(#colorRevenue2)"
                stroke="#4F46E5"
                strokeWidth={2}
                name="Revenue (₹)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="registrations"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 4 }}
                name="Registrations"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* REGISTRATION PATTERNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Pattern */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ⏰ Registration by Hour
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="registrations" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Day of Week Pattern */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📅 Registration by Day
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dayPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="registrations"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EVENT RADAR CHART (Single Event View) */}
        {selectedEventId !== "all" && eventRadarData.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📈 Event Performance Score
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={eventRadarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="metric" stroke="#6B7280" />
                <PolarRadiusAxis stroke="#6B7280" />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REVENUE TREND */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Revenue Trend
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* TICKET DISTRIBUTION - ENHANCED DONUT */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ticket Distribution
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Donut Chart */}
              <div className="relative lg:col-span-3">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    {/* Inner Ring - Main Tickets */}
                    <Pie
                      data={ticketDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {ticketDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const { cx, cy } = viewBox;
                            const total = ticketDistribution.reduce(
                              (sum, t) => sum + t.value,
                              0
                            );
                            return (
                              <text
                                x={cx}
                                y={cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                              >
                                <tspan
                                  x={cx}
                                  y={(cy as number) - 10}
                                  className="fill-gray-900 text-3xl font-bold"
                                >
                                  {total}
                                </tspan>
                                <tspan
                                  x={cx}
                                  y={(cy as number) + 15}
                                  className="fill-gray-500 text-sm"
                                >
                                  Total Tickets
                                </tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </Pie>

                    {/* Outer Ring - Sub-Tickets */}
                    <Pie
                      data={subTicketData}
                      cx="50%"
                      cy="50%"
                      innerRadius={95}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={1}
                    >
                      {subTicketData.map((entry, index) => {
                        const parentIndex = ticketDistribution.findIndex(
                          (t) => t.name === entry.parentTicket
                        );
                        const baseColor = COLORS[parentIndex % COLORS.length];

                        const colorVariations = [
                          baseColor,
                          `${baseColor}dd`,
                          `${baseColor}bb`,
                        ];

                        const subIndex = subTicketData
                          .filter((s) => s.parentTicket === entry.parentTicket)
                          .findIndex((s) => s.name === entry.name);

                        return (
                          <Cell
                            key={`sub-cell-${index}`}
                            fill={
                              colorVariations[subIndex % colorVariations.length] ||
                              baseColor
                            }
                            stroke="#fff"
                            strokeWidth={1}
                          />
                        );
                      })}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        padding: "8px 12px",
                      }}
                      formatter={(value: any) => [`${value} tickets`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Breakdown */}
              <div className="space-y-4 lg:col-span-2">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">
                    Ticket Breakdown
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {ticketDistribution.map((ticket, index) => (
                      <div key={ticket.name} className="space-y-2">
                        {/* Main Ticket */}
                        <div className="flex items-center justify-between bg-white rounded-lg p-2.5 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span className="font-semibold text-gray-900 text-sm">
                              {ticket.name}
                            </span>
                          </div>
                          <span className="font-bold text-indigo-600">
                            {ticket.value}
                          </span>
                        </div>

                        {/* Sub-Tickets */}
                        {ticket.subTickets.map((sub, subIndex) => (
                          <div
                            key={sub.name}
                            className="flex items-center justify-between ml-6 pl-3 border-l-2 border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                  opacity: 1 - subIndex * 0.25,
                                }}
                              />
                              <span className="text-xs text-gray-600">
                                {sub.name}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {sub.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">
                      Ticket Types
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {ticketDistribution.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 font-semibold mb-1">
                      Sub-Categories
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {subTicketData.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EVENT PERFORMANCE */}
        {selectedEventId === "all" && eventPerformance.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Top Events Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="registrations"
                  fill="#4F46E5"
                  name="Registrations"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="#10B981"
                  name="Revenue (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* RECENT REGISTRATIONS */}
        {recentRegistrations.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recent Registrations
            </h3>
            <div className="space-y-3">
              {recentRegistrations.map((reg) => (
                <div
                  key={reg._id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {reg.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {reg.userName}
                      </p>
                      <p className="text-sm text-gray-500">{reg.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{reg.totalAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= KPI ================= */

function KPI({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  value: any;
  subtitle?: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-semibold mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
