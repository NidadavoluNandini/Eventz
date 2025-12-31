import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600"
          >
            Eventz
          </Link>

          {/* NAV LINKS */}
         

          {/* CTA BUTTONS */}
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="
                px-4 py-2
                rounded-lg
                border border-indigo-600
                text-indigo-600
                font-semibold
                hover:bg-indigo-50
                transition
              "
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              className="
                px-4 py-2
                rounded-lg
                border border-indigo-600
                text-indigo-600
                font-semibold
                hover:bg-indigo-50
                transition
              "
            >
              About Us
            </Link>

            <Link
              to="/organizer/login?redirect=/organizer/events/create"
              className="
                px-4 py-2
                rounded-lg
                bg-indigo-600
                text-white
                font-semibold
                hover:bg-indigo-700
                transition
              "
            >
              Create Event
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {children}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Eventz. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
