import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrganizerEvents,
  publishEvent,
  unpublishEvent,
  deleteEvent,
  moveToDraft,
} from "../../api/events.api";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOrganizerEvents();
      setEvents(res.data || []);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (action: () => Promise<any>, eventId: string) => {
    setActionLoading(eventId);
    try {
      await action();
      await load();
      // Show success flash animation
      setSuccessFlash(eventId);
      setTimeout(() => setSuccessFlash(null), 1000);
    } catch (error) {
      console.error("Action failed", error);
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (event: any) => {
    if (event.status === "PUBLISHED" && event.registrationOpen) {
      await handleAction(() => unpublishEvent(event._id), event._id);
    } else if (event.status === "DRAFT" || event.status === "UNPUBLISHED") {
      await handleAction(() => publishEvent(event._id), event._id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your events</p>
        </div>
        <Link
          to="/organizer/events/create"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Event
        </Link>
      </div>

      {/* EVENTS LIST */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first event to get started
          </p>
          <Link
            to="/organizer/events/create"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => {
            const isPublished = e.status === "PUBLISHED" && e.registrationOpen;
            const canToggle =
              e.status === "DRAFT" ||
              e.status === "UNPUBLISHED" ||
              (e.status === "PUBLISHED" && e.registrationOpen);
            const isFlashing = successFlash === e._id;

            return (
              <div
                key={e._id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border overflow-hidden ${
                  isFlashing
                    ? "border-emerald-400 animate-pulse bg-emerald-50"
                    : isPublished
                    ? "border-emerald-200 bg-emerald-50/20"
                    : e.status === "DRAFT"
                    ? "border-gray-200"
                    : "border-gray-300"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center gap-4">
                    {/* LEFT - EVENT INFO */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Event Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isPublished
                            ? "bg-gradient-to-br from-emerald-500 to-green-600"
                            : e.status === "DRAFT"
                            ? "bg-gradient-to-br from-gray-400 to-gray-500"
                            : "bg-gradient-to-br from-gray-500 to-gray-600"
                        }`}
                      >
                        <svg
                          className="w-6 h-6 text-white"
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

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate">
                          {e.title}
                        </h2>

                        {/* STATS */}
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg
                              className="w-4 h-4 text-green-600"
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
                            <span className="font-semibold">
                              ₹{e.totalRevenue || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg
                              className="w-4 h-4 text-indigo-600"
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
                            <span className="font-semibold">
                              {e.totalRegistrations || 0}
                            </span>
                          </div>

                          {/* STATUS BADGE - Compact */}
                          {e.status === "DRAFT" && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-500 text-white text-xs font-semibold">
                              Draft
                            </span>
                          )}
                          {e.status === "PUBLISHED" && e.registrationOpen && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                              Live
                            </span>
                          )}
                          {(e.status === "UNPUBLISHED" ||
                            (e.status === "PUBLISHED" && !e.registrationOpen)) && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-400 text-white text-xs font-semibold">
                              Closed
                            </span>
                          )}
                          {e.status === "COMPLETED" && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT - VISIBLE ACTION BUTTONS */}
                    <div className="flex items-center gap-2">
                      {/* TOGGLE SWITCH - IMPROVED COLORS */}
                      {canToggle && e.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleTogglePublish(e)}
                          disabled={
                            actionLoading === e._id || e.status === "COMPLETED"
                          }
                          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0 ${
                            actionLoading === e._id
                              ? "bg-gray-300 cursor-wait focus:ring-gray-400"
                              : isPublished
                              ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400"
                              : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span
                            className={`${
                              isPublished ? "translate-x-9" : "translate-x-1"
                            } inline-flex h-6 w-6 items-center justify-center transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out`}
                          >
                            {actionLoading === e._id ? (
                              <svg
                                className="animate-spin h-3 w-3 text-gray-600"
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
                            ) : null}
                          </span>
                        </button>
                      )}

                      {/* MOVE TO DRAFT BUTTON */}
                      {e.status !== "DRAFT" && e.status !== "COMPLETED" && (
                        <button
                          onClick={() =>
                            handleAction(() => moveToDraft(e._id), e._id)
                          }
                          disabled={actionLoading === e._id}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          title="Move to Draft"
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
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          Draft
                        </button>
                      )}

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete "${e.title}" permanently? This cannot be undone.`
                            )
                          ) {
                            handleAction(() => deleteEvent(e._id), e._id);
                          }
                        }}
                        disabled={actionLoading === e._id}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        title="Delete Event"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
