import { useEffect, useState } from "react";
import { getOrganizerEvents } from "../../api/events.api";
import { getEventRegistrations } from "../../api/registrations.api";

interface Registration {
  _id: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  status: string;
  attended?: boolean;
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-indigo-100">
          Manage and track event registrations
        </p>
      </div>

      {/* Event Selection & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event Selector */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Event
          </label>
          <select
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-slate-900 font-medium"
            onChange={(e) => loadUsers(e.target.value)}
            value={selectedEvent}
          >
            <option value="">Choose an event...</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title} - {new Date(e.startDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Card */}
        {selectedEvent && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
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
                <p className="text-xs text-white/80 font-medium">
                  Total Registrations
                </p>
                <p className="text-3xl font-bold">{totalRegistrations}</p>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-white/20">
              <p className="text-sm flex justify-between">
                <span className="text-white/80">Confirmed:</span>
                <span className="font-bold">{confirmedRegistrations}</span>
              </p>
              <p className="text-sm flex justify-between">
                <span className="text-white/80">Attended:</span>
                <span className="font-bold">{attendedCount}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      {selectedEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search Users
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
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
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-sm"
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Ticket Type
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none text-sm"
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
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              Showing{" "}
              <span className="font-semibold text-indigo-600">
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
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">
              Registered Users
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Complete list of event attendees
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
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
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-slate-300 mx-auto mb-3"
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
              <p className="text-xs text-slate-400 mt-1">
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
                    <th className="text-left py-3 px-5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-700 font-semibold text-xs">
                              {r.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900 text-sm">
                            {r.userName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-600">
                        {r.userEmail}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {r.ticketType}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            r.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <button
                          onClick={() => toggleAttendance(r._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            r.attended
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {r.attended ? (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
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
                                className="w-3.5 h-3.5"
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
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-indigo-600"
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
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Select an Event
          </h3>
          <p className="text-sm text-slate-600">
            Choose an event from the dropdown above to view registered users
          </p>
        </div>
      )}
    </div>
  );
}
