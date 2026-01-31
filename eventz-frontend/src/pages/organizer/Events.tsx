import { useEffect, useState } from "react";
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

  const load = async () => {
    setLoading(true);
    const res = await getOrganizerEvents();
    setEvents(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading events...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Events</h1>

      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-gray-500">No events found.</p>
        )}

        {events.map((e) => (
          <div
            key={e._id}
            className="bg-white rounded-2xl shadow p-6 flex justify-between items-start"
          >
            {/* LEFT */}
            <div>
              <h2 className="text-lg font-bold">{e.title}</h2>

              {/* STATUS BADGE */}
              <div className="mt-2 flex gap-2 flex-wrap text-sm">
                {e.status === "DRAFT" && (
                  <span className="px-3 py-1 rounded-full bg-gray-400 text-white">
                    Draft
                  </span>
                )}

                {e.status === "PUBLISHED" && e.registrationOpen && (
                  <span className="px-3 py-1 rounded-full bg-green-600 text-white">
                    Published · Registration Open
                  </span>
                )}

                {(e.status === "UNPUBLISHED" ||
                  (e.status === "PUBLISHED" && !e.registrationOpen)) && (
                  <span className="px-3 py-1 rounded-full bg-yellow-500 text-white">
                    Registration Closed
                  </span>
                )}

                {e.status === "COMPLETED" && (
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white">
                    Completed
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                ₹ {e.totalRevenue || 0} revenue ·{" "}
                {e.totalRegistrations || 0} registrations
              </p>
            </div>

            {/* ACTION BUTTONS */}
{/* ACTION BUTTONS */}
<div className="flex gap-2 flex-wrap">

  {/* PUBLISH */}
  {(e.status === "DRAFT" || e.status === "UNPUBLISHED") && (
    <button
      onClick={() => publishEvent(e._id).then(load)}
      disabled={e.status === "COMPLETED"}
      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
    >
      Publish
    </button>
  )}

  {/* CLOSE REGISTRATION (UNPUBLISH) */}
  {e.status === "PUBLISHED" && e.registrationOpen && (
    <button
      onClick={() => unpublishEvent(e._id).then(load)}
      className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm"
    >
      Close Registration
    </button>
  )}

  {/* MOVE TO DRAFT */}
  {e.status !== "COMPLETED" && (
    <button
      onClick={() => moveToDraft(e._id).then(load)}
      className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm"
    >
      Move to Draft
    </button>
  )}

  {/* DELETE */}
  <button
    onClick={() => {
      if (confirm("Delete this event permanently?")) {
        deleteEvent(e._id).then(load);
      }
    }}
    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
  >
    Delete
  </button>
</div>
          </div>
        ))}
      </div>
    </div>
  );
}
