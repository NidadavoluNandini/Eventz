import EventCard from "./EventCard";

type EventGridProps = {
  events: any[];
  loading?: boolean;
};

export default function EventGrid({ events, loading = false }: EventGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse">
            <div className="h-44 bg-slate-300 rounded-t-xl"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-slate-300 rounded w-3/4"></div>
              <div className="h-4 bg-slate-300 rounded w-full"></div>
              <div className="h-4 bg-slate-300 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-slate-700">No events available</p>
        <p className="text-slate-500 text-sm mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
