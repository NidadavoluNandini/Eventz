import { useEffect, useState } from "react";
import {
  getOrganizerEvents,
  publishEvent,
  unpublishEvent,
  deleteEvent,
} from "../../api/events.api";

const CATEGORIES = [
  "Technology",
  "Arts",
  "Sports",
  "Science",
  "Industry",
  "Health",
  "Entertainment",
  "Business",
];

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const load = () => {
    getOrganizerEvents().then((res) => setEvents(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (category !== "ALL" && e.category !== category) return false;
    if (status !== "ALL" && e.status !== status) return false;
    return true;
  });

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-4 mb-6">
        {/* CATEGORY FILTER */}
       <div className="flex flex-wrap gap-2 mb-4">
  {["ALL", ...CATEGORIES].map((c) => (
    <button
      key={c}
      onClick={() => setCategory(c)}
      className={`px-4 py-2 rounded-full border text-sm transition
        ${
          category === c
            ? "bg-indigo-600 text-white"
            : "bg-white hover:bg-gray-100"
        }`}
    >
      {c}
    </button>
  ))}
</div>


        {/* STATUS FILTER */}
       <div className="flex flex-wrap gap-2 mb-6">
  {[
    "ALL",
    "DRAFT",
    "PUBLISHED",
    "UNPUBLISHED",
    "ONGOING",
    "COMPLETED",
  ].map((s) => (
    <button
      key={s}
      onClick={() => setStatus(s)}
      className={`px-4 py-2 rounded-full text-sm transition
        ${
          status === s
            ? "bg-blue-600 text-white"
            : "bg-white border hover:bg-gray-100"
        }`}
    >
      {s}
    </button>
  ))}
</div>

      </div>

      {/* EVENTS LIST */}
      <div className="space-y-4">
        {filteredEvents.length === 0 && (
          <p className="text-gray-500">No events found.</p>
        )}

        {filteredEvents.map((e) => (
          <div
            key={e._id}
            className="bg-white rounded-2xl shadow p-6 flex justify-between items-start"
          >
            {/* LEFT */}
            <div>
              <h2 className="text-lg font-bold">{e.title}</h2>

              <div className="flex gap-3 mt-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-gray-100">
                  {e.category}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    e.status === "PUBLISHED"
                      ? "bg-green-600"
                      : e.status === "DRAFT"
                      ? "bg-gray-500"
                      : e.status === "UNPUBLISHED"
                      ? "bg-yellow-500"
                      : e.status === "ONGOING"
                      ? "bg-blue-600"
                      : "bg-red-600"
                  }`}
                >
                  {e.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                ₹ {e.totalRevenue || 0} revenue ·{" "}
                {e.totalRegistrations || 0} registrations
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              {e.status !== "PUBLISHED" && (
                <button
                  onClick={() => publishEvent(e._id).then(load)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                >
                  Publish
                </button>
              )}

              {e.status === "PUBLISHED" && (
                <button
                  onClick={() => unpublishEvent(e._id).then(load)}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600"
                >
                  Unpublish
                </button>
              )}

              <button
                onClick={() => deleteEvent(e._id).then(load)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
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
