import { useEffect, useMemo, useState } from "react";
import { getOrganizerEvents } from "../../api/events.api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface Ticket {
  type: string;
  price: number;
  quantity: number;
  available: number;
}

interface Event {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  city: string;
  location: string;
  category: string;
  tickets?: Ticket[];
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("monthly");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getOrganizerEvents()
      .then((res) => setEvents(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const getEventState = (event: Event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return "UPCOMING";
    if (now > end) return "COMPLETED";
    return "ONGOING";
  };

  // Filter events based on selection
  const filteredEvents =
    selectedEventId === "all"
      ? events
      : events.filter((e) => e._id === selectedEventId);

  // Search available events (not filtered by selection)
  const searchResults = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* COUNTS */
  const totalEvents = filteredEvents.length;

  const ongoingEvents = useMemo(
    () => filteredEvents.filter((e) => getEventState(e) === "ONGOING").length,
    [filteredEvents]
  );

  const upcomingEvents = useMemo(
    () => filteredEvents.filter((e) => getEventState(e) === "UPCOMING").length,
    [filteredEvents]
  );

  const completedEvents = useMemo(
    () => filteredEvents.filter((e) => getEventState(e) === "COMPLETED").length,
    [filteredEvents]
  );

  /* TOTAL REGISTRATIONS */
  const totalRegistrations = useMemo(() => {
    return filteredEvents.reduce((sum, event) => {
      if (!event.tickets) return sum;
      return (
        sum +
        event.tickets.reduce((tSum, t) => {
          const sold = t.quantity - t.available;
          return tSum + Math.max(sold, 0);
        }, 0)
      );
    }, 0);
  }, [filteredEvents]);

  /* REVENUE */
  const revenue = useMemo(() => {
    return filteredEvents.reduce((eventSum, event) => {
      if (!event.tickets) return eventSum;
      const eventRevenue = event.tickets.reduce((ticketSum, ticket) => {
        if (!ticket.price || ticket.price <= 0) return ticketSum;
        const sold = ticket.quantity - ticket.available;
        return ticketSum + Math.max(sold, 0) * ticket.price;
      }, 0);
      return eventSum + eventRevenue;
    }, 0);
  }, [filteredEvents]);

  /* AVERAGE TICKET PRICE */
  const avgTicketPrice = useMemo(() => {
    let totalPrice = 0;
    let count = 0;
    filteredEvents.forEach((event) => {
      event.tickets?.forEach((ticket) => {
        if (ticket.price > 0) {
          const sold = ticket.quantity - ticket.available;
          totalPrice += ticket.price * sold;
          count += sold;
        }
      });
    });
    return count > 0 ? Math.round(totalPrice / count) : 0;
  }, [filteredEvents]);

  /* TICKET TYPE DISTRIBUTION */
  const ticketDistribution = useMemo(() => {
    const dist: { [key: string]: number } = {};
    const total = filteredEvents.reduce((sum, event) => {
      return (
        sum +
        (event.tickets?.reduce(
          (tSum, t) => tSum + (t.quantity - t.available),
          0
        ) || 0)
      );
    }, 0);

    filteredEvents.forEach((event) => {
      event.tickets?.forEach((ticket) => {
        const sold = ticket.quantity - ticket.available;
        dist[ticket.type] = (dist[ticket.type] || 0) + Math.max(sold, 0);
      });
    });

    return Object.entries(dist).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
    }));
  }, [filteredEvents]);

  /* CATEGORY DISTRIBUTION */
  const categoryDistribution = useMemo(() => {
    const dist: { [key: string]: number } = {};
    filteredEvents.forEach((event) => {
      const registrations =
        event.tickets?.reduce((sum, t) => sum + (t.quantity - t.available), 0) ||
        0;
      const categoryName = event.category.charAt(0).toUpperCase() + event.category.slice(1);
      dist[categoryName] = (dist[categoryName] || 0) + registrations;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [filteredEvents]);

  /* MONTHLY/WEEKLY REVENUE DATA */
  const revenueData = useMemo(() => {
    const data: { [key: string]: number } = {};

    filteredEvents.forEach((event) => {
      const date = new Date(event.startDate);
      let key: string;

      if (timeframe === "monthly") {
        key = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      if (!event.tickets) return;

      const eventRevenue = event.tickets.reduce((sum, ticket) => {
        if (!ticket.price || ticket.price <= 0) return sum;
        const sold = ticket.quantity - ticket.available;
        return sum + Math.max(sold, 0) * ticket.price;
      }, 0);

      data[key] = (data[key] || 0) + eventRevenue;
    });

    return Object.entries(data)
      .map(([name, revenue]) => ({ name, revenue }))
      .slice(-8);
  }, [filteredEvents, timeframe]);

  /* REGISTRATION DATA */
  const registrationData = useMemo(() => {
    const data: { [key: string]: number } = {};

    filteredEvents.forEach((event) => {
      const date = new Date(event.startDate);
      let key: string;

      if (timeframe === "monthly") {
        key = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      if (!event.tickets) return;

      const registrations = event.tickets.reduce((sum, ticket) => {
        const sold = ticket.quantity - ticket.available;
        return sum + Math.max(sold, 0);
      }, 0);

      data[key] = (data[key] || 0) + registrations;
    });

    return Object.entries(data)
      .map(([name, registrations]) => ({ name, registrations }))
      .slice(-8);
  }, [filteredEvents, timeframe]);

  /* TICKET SALES RATE */
  const ticketSalesRate = useMemo(() => {
    const totalCapacity = filteredEvents.reduce(
      (sum, event) =>
        sum + (event.tickets?.reduce((s, t) => s + t.quantity, 0) || 0),
      0
    );
    const soldTickets = filteredEvents.reduce(
      (sum, event) =>
        sum +
        (event.tickets?.reduce((s, t) => s + (t.quantity - t.available), 0) ||
          0),
      0
    );
    return totalCapacity > 0
      ? Math.round((soldTickets / totalCapacity) * 100)
      : 0;
  }, [filteredEvents]);

  const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"];

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-1">{payload[0].name}</p>
          <p className="text-sm text-slate-600">
            Tickets Sold: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-indigo-600 font-semibold">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Header with Event Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">
              {selectedEventId === "all"
                ? "Overall performance metrics across all events"
                : `Performance insights for selected event`}
            </p>
          </div>

          {/* Event Selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none w-full sm:w-64"
              />
            </div>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSearchTerm(""); // Clear search when selecting event
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none font-medium text-slate-900 w-full sm:w-64"
            >
              <option value="all">📊 All Events Overview</option>
              {searchResults.length > 0 ? (
                searchResults.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))
              ) : (
                <option disabled>No events found</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Events"
          value={totalEvents}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          changeValue={upcomingEvents}
          changeLabel="upcoming"
        />
        <KPICard
          title="Total Registrations"
          value={totalRegistrations}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          changeValue={ticketSalesRate}
          changeLabel="% sold"
        />
        <KPICard
          title="Total Revenue"
          value={`₹${revenue.toLocaleString()}`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          bgColor="bg-green-50"
          iconColor="text-green-600"
          changeValue={avgTicketPrice}
          changeLabel="₹ avg/ticket"
        />
        <KPICard
          title="Active Events"
          value={ongoingEvents}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
          changeValue={completedEvents}
          changeLabel="completed"
        />
      </div>

      {/* EVENT STATUS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <StatusCard
          title="Upcoming Events"
          count={upcomingEvents}
          shade="light"
        />
        <StatusCard title="Ongoing Events" count={ongoingEvents} shade="medium" />
        <StatusCard
          title="Completed Events"
          count={completedEvents}
          shade="dark"
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Revenue Analytics
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Track your earnings over time
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe("weekly")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  timeframe === "weekly"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  timeframe === "monthly"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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

        {/* Ticket Distribution Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Ticket Sales by Type
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Distribution across ticket categories
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={ticketDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {ticketDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {ticketDistribution.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-slate-700 font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-semibold">
                    {item.value}
                  </span>
                  <span className="text-xs text-indigo-600 font-semibold">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Registration Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              📈 How Many People Registered?
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              See how many attendees signed up each {timeframe === "weekly" ? "week" : "month"}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey="registrations"
                fill="#6366F1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              🎯 Which Event Type is Most Popular?
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Compare registrations for Technology, Sports, Arts, etc.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="value" fill="#818CF8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT EVENTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Recent Events
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Overview of your latest events
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition w-full sm:w-auto">
            View All Events
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                    Event Name
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                    Location
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                    Registrations
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.slice(0, 5).map((event) => {
                  const status = getEventState(event);
                  const registrations =
                    event.tickets?.reduce(
                      (sum, t) => sum + (t.quantity - t.available),
                      0
                    ) || 0;
                  const eventRevenue =
                    event.tickets?.reduce((sum, t) => {
                      const sold = t.quantity - t.available;
                      return sum + sold * (t.price || 0);
                    }, 0) || 0;

                  return (
                    <tr
                      key={event._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {event.category}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {event.city}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(event.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            status === "ONGOING"
                              ? "bg-green-100 text-green-800"
                              : status === "UPCOMING"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-slate-900">
                        {registrations}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-green-600">
                        ₹{eventRevenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* KPI CARD COMPONENT */
function KPICard({
  title,
  value,
  icon,
  bgColor,
  iconColor,
  changeValue,
  changeLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  changeValue: number;
  changeLabel: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center ${iconColor}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <span className="font-semibold text-indigo-600">{changeValue}</span>
        <span>{changeLabel}</span>
      </div>
    </div>
  );
}

/* STATUS CARD COMPONENT */
function StatusCard({
  title,
  count,
  shade,
}: {
  title: string;
  count: number;
  shade: string;
}) {
  const shadeClasses = {
    light: "bg-indigo-50 border-indigo-200",
    medium: "bg-indigo-100 border-indigo-300",
    dark: "bg-indigo-200 border-indigo-400",
  };

  const textClasses = {
    light: "text-indigo-700",
    medium: "text-indigo-800",
    dark: "text-indigo-900",
  };

  return (
    <div
      className={`${
        shadeClasses[shade as keyof typeof shadeClasses]
      } border rounded-xl shadow-sm p-6`}
    >
      <p
        className={`${
          textClasses[shade as keyof typeof textClasses]
        } font-semibold text-sm mb-2`}
      >
        {title}
      </p>
      <p
        className={`text-4xl sm:text-5xl font-bold ${
          textClasses[shade as keyof typeof textClasses]
        } mb-3`}
      >
        {count}
      </p>
      <div
        className={`flex items-center gap-2 text-xs ${
          textClasses[shade as keyof typeof textClasses]
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="font-medium">View Details</span>
      </div>
    </div>
  );
}
