import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
          Discover & Attend Amazing Events
        </h1>

        <p className="text-sm sm:text-base mb-5 text-blue-100 max-w-2xl mx-auto">
          Tech, music, business, workshops & more — all in one place.
        </p>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Events
          </Link>

          <Link
            to="/organizer/register"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm hover:bg-white hover:text-indigo-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
      </div>
    </section>
  );
}
