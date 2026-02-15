import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getOrganizerEvents,
  publishEvent,
  unpublishEvent,
  deleteEvent,
  moveToDraft,
  closeRegistration,
  openRegistration,
  updateEvent,
} from "../../api/events.api";

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState<string | null>(null);

  // toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOrganizerEvents();
      setEvents(res.data || []);
    } catch (error) {
      console.error("Failed to load events", error);
      showToast("error", "Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (action: () => Promise<any>, eventId: string, successMsg?: string) => {
    setActionLoading(eventId);
    try {
      await action();
      await load();
      setSuccessFlash(eventId);
      setTimeout(() => setSuccessFlash(null), 1000);
      if (successMsg) {
        showToast("success", successMsg);
      } else {
        showToast("success", "Action completed successfully.");
      }
    } catch (error: any) {
      console.error("Action failed", error);
      const msg =
        error?.response?.data?.message ||
        "Action failed. Please try again.";
      showToast("error", msg);
    } finally {
      setActionLoading(null);
    }
  };


const handleTogglePublish = async (event: any) => {
  if (event.status === "PUBLISHED") {
    await handleAction(
      () => unpublishEvent(event._id),
      event._id,
      "Event unpublished."
    );
  } else {
    await handleAction(
      () => publishEvent(event._id),
      event._id,
      "Event published."
    );
  }
};

async function handleEdit(event: any) {
  try {
    // optional: mark as EDITING, but failure should not block navigation
    await updateEvent(event._id, { status: "EDITING" });
  } catch (e: any) {
    console.error("Failed to set EDITING (continuing anyway)", e);
    // no toast here, or use a soft one if you want
  }

  navigate(`/organizer/events/edit/${event._id}`, {
    state: { editMode: true, eventData: event },
  });
}

  const confirmDelete = (event: any) => {
    setDeleteTarget({ id: event._id, title: event.title });
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    await handleAction(() => deleteEvent(id), id, "Event deleted.");
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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm text-white shadow-md ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete event?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{deleteTarget.title}"</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Events
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage and monitor your events
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
          <span>Create Event</span>
        </Link>
      </div>

      {/* EVENTS LIST */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
                 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
            Create your first event to get started
          </p>
          <Link
            to="/organizer/events/create"
            className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-indigo-700 transition"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => {
           
            const isCompleted = e.status === "COMPLETED";
            const isPublished = e.status === "PUBLISHED" ;
              const canToggle = !isCompleted; 

            const isFlashing = successFlash === e._id;

            return (
              <div
                key={e._id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border overflow-hidden ${
                  isFlashing
                    ? "border-emerald-400 animate-pulse bg-emerald-50"
                    : isPublished
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isCompleted
                    ? "border-blue-200 bg-blue-50/20"
                    : e.status === "DRAFT"
                    ? "border-gray-200"
                    : "border-gray-300"
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* LEFT - EVENT INFO */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isPublished
                            ? "bg-gradient-to-br from-emerald-500 to-green-600"
                            : isCompleted
                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                            : e.status === "DRAFT"
                            ? "bg-gradient-to-br from-gray-400 to-gray-500"
                            : "bg-gradient-to-br from-gray-500 to-gray-600"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                             002-2V7a2 2 0 00-2-2H5a2 2 0 
                             00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                          {e.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm mt-1">
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
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 
                                 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 
                                 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 
                                 0-2.08-.402-2.599-1M21 12a9 9 0 
                                 11-18 0 9 9 0 0118 0z"
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
                                d="M17 20h5v-2a3 3 0 
                                 00-5.356-1.857M17 20H7m10 
                                 0v-2c0-.656-.126-1.283-.356-1.857M7 
                                 20H2v-2a3 3 0 
                                 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 
                                 0a5.002 5.002 0 019.288 0M15 7a3 3 0 
                                 11-6 0 3 3 0 016 0zm6 3a2 2 0 
                                 11-4 0 2 2 0 014 0zM7 10a2 2 0 
                                 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span className="font-semibold">
                              {e.totalRegistrations || 0}
                            </span>
                          </div>

                          {e.status === "DRAFT" && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-500 text-white text-[11px] sm:text-xs font-semibold">
                              Draft
                            </span>
                          )}
                          {e.status === "PUBLISHED" && e.registrationOpen && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              Live
                            </span>
                          )}
                          {e.status === "UNPUBLISHED" && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[11px] sm:text-xs font-semibold">
                              Paused
                            </span>
                          )}
                          {e.status === "PUBLISHED" && !e.registrationOpen && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-400 text-white text-[11px] sm:text-xs font-semibold">
                              Reg Closed
                            </span>
                          )}
                          {e.status === "COMPLETED" && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[11px] sm:text-xs font-semibold">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT - ACTION BUTTONS */}
                    <div className="flex flex-wrap gap-2 justify-end md:justify-start md:flex-nowrap">
                      {/* PUBLISH/UNPUBLISH TOGGLE */}
                      {canToggle && (
                        <div className="flex items-center gap-1.5">
                          <span className="hidden sm:inline text-sm font-medium text-gray-600">
                            {isPublished ? "Published" : "Unpublished"}
                          </span>
                          <button
                            onClick={() => handleTogglePublish(e)}
                            disabled={actionLoading === e._id}
                            className={`relative inline-flex h-7 w-14 sm:h-8 sm:w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 flex-shrink-0 ${
                              actionLoading === e._id
                                ? "bg-gray-300 cursor-wait focus:ring-gray-400"
                                : isPublished
                                ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400"
                                : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <span
                              className={`${
                                isPublished
                                  ? "translate-x-7 sm:translate-x-9"
                                  : "translate-x-1"
                              } inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out`}
                            >
                              {actionLoading === e._id && (
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
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 
                                     0 5.373 0 12h4zm2 5.291A7.962 
                                     7.962 0 014 12H0c0 3.042 1.135 
                                     5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* CLOSE/OPEN REGISTRATION */}
                      {e.status === "PUBLISHED" && !isCompleted && (
                        <button
                          onClick={() =>
                            handleAction(
                              () =>
                                e.registrationOpen
                                  ? closeRegistration(e._id)
                                  : openRegistration(e._id),
                              e._id,
                              e.registrationOpen
                                ? "Registration closed."
                                : "Registration opened."
                            )
                          }
                          disabled={actionLoading === e._id}
                          className={`px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                            e.registrationOpen
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {e.registrationOpen ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 
                                 002-2v-6a2 2 0 00-2-2H6a2 2 0 
                                 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 
                                 00-8 0v4h8z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 11V7a4 4 0 
                                 118 0m-4 8v2m-6 4h12a2 2 0 
                                 002-2v-6a2 2 0 
                                 00-2-2H6a2 2 0 00-2 2v6a2 2 0 
                                 002 2z"
                              />
                            )}
                          </svg>
                          <span>
                            {e.registrationOpen ? "Close Reg" : "Open Reg"}
                          </span>
                        </button>
                      )}

                      {/* EDIT BUTTON */}
                      {!isCompleted && (
                        <button
                          onClick={() => handleEdit(e)}
                          disabled={actionLoading === e._id}
                          className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          title="Edit Event"
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 
                               00-2 2v11a2 2 0 002 2h11a2 2 0 
                               002-2v-5m-1.414-9.414a2 2 0 
                               112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>
                      )}

                      {/* MOVE TO DRAFT */}
                      {e.status !== "DRAFT" && !isCompleted && (
                        <button
                          onClick={() =>
                            handleAction(
                              () => moveToDraft(e._id),
                              e._id,
                              "Moved to draft."
                            )
                          }
                          disabled={actionLoading === e._id}
                          className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          title="Move to Draft"
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 
                               2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 
                               3.732z"
                            />
                          </svg>
                          <span>Draft</span>
                        </button>
                      )}

                      {/* DELETE */}
                      <button
                        onClick={() => confirmDelete(e)}
                        disabled={actionLoading === e._id}
                        className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        title="Delete Event"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 
                             0116.138 21H7.862a2 2 0 
                             01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 
                             1 0 00-1-1h-4a1 1 0 00-1 
                             1v3M4 7h16"
                          />
                        </svg>
                        <span>Delete</span>
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
