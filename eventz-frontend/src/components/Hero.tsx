import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Discover & Attend Amazing Events
        </h1>

        <p className="text-lg mb-8 text-blue-100">
          Tech, music, business, workshops & more — all in one place.
        </p>

        <Link
          to="/events"
          className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-100"
        >
          Explore Events
        </Link>
      </div>
    </section>
  );
}
