import { useEffect, useState } from "react";
import { getOrganizerEvents } from "../../api/events.api";
import { getEventRegistrations } from "../../api/registrations.api";

interface Registration {
  _id: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  status: string;
  attended?: boolean; // Add this field
}

export default function UserManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTicket, setFilterTicket] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOrganizerEvents().then((res) => setEvents(res.data || []));
  }, []);

  const loadUsers = (eventId: string) => {
    if (!eventId) return;
    setLoading(true);
    setSelectedEvent(eventId);
    getEventRegistrations(eventId)
      .then((res) => setRegistrations(res.data || []))
      .finally(() => setLoading(false));
  };

  // Toggle attendance
  const toggleAttendance = (regId: string) => {
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg._id === regId ? { ...reg, attended: !reg.attended } : reg
      )
    );
    // TODO: Make API call to update attendance in backend
    // await api.post(`/registrations/${regId}/attendance`, { attended: !reg.attended });
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || reg.status === filterStatus;

    const matchesTicket =
      filterTicket === "all" || reg.ticketType === filterTicket;

    return matchesSearch && matchesStatus && matchesTicket;
  });

  // Get unique ticket types for filter
  const ticketTypes = Array.from(
    new Set(registrations.map((r) => r.ticketType))
  );

  // Get stats
  const totalRegistrations = registrations.length;
  const confirmedRegistrations = registrations.filter(
    (r) => r.status === "CONFIRMED"
  ).length;
  const attendedCount = registrations.filter((r) => r.attended).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          User Management
        </h1>
        <p className="text-slate-600">
          Manage and track event registrations
        </p>
      </div>

      {/* Event Selection & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Selector */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Select Event
          </label>
          <select
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-slate-900 font-medium"
            onChange={(e) => loadUsers(e.target.value)}
            value={selectedEvent}
          >
            <option value="">Choose an event to view registrations</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title} - {new Date(e.startDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Card */}
        {selectedEvent && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border border-indigo-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-indigo-700 font-medium">
                  Total Registrations
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {totalRegistrations}
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-indigo-200">
              <p className="text-sm text-indigo-700 flex justify-between">
                <span>Confirmed:</span>
                <span className="font-bold text-indigo-900">
                  {confirmedRegistrations}
                </span>
              </p>
              <p className="text-sm text-indigo-700 flex justify-between">
                <span>Attended:</span>
                <span className="font-bold text-green-700">
                  {attendedCount}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      {selectedEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Users
              </label>
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
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Ticket Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ticket Type
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                value={filterTicket}
                onChange={(e) => setFilterTicket(e.target.value)}
              >
                <option value="all">All Tickets</option>
                {ticketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredRegistrations.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalRegistrations}
              </span>{" "}
              registrations
            </p>
          </div>
        </div>
      )}

      {/* Users Table */}
      {selectedEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Registered Users
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Complete list of event attendees
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
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
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-16 h-16 text-slate-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-slate-500 font-medium">
                No registrations found
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm || filterStatus !== "all" || filterTicket !== "all"
                  ? "Try adjusting your filters"
                  : "Users will appear here once they register"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Name
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
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
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                        Ticket Type
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Status
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        Attendance
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-700 font-semibold text-sm">
                              {r.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">
                            {r.userName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {r.userEmail}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {r.ticketType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            r.status === "CONFIRMED"
                              ? "bg-green-50 text-green-700"
                              : r.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleAttendance(r._id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            r.attended
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {r.attended ? (
                            <>
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Attended
                            </>
                          ) : (
                            <>
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Not Attended
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* No Event Selected State */}
      {!selectedEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg
            className="w-20 h-20 text-slate-300 mx-auto mb-4"
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
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Select an Event
          </h3>
          <p className="text-slate-600">
            Choose an event from the dropdown above to view registered users
          </p>
        </div>
      )}
    </div>
  );
}
