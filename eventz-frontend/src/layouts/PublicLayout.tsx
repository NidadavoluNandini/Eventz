import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600">
            Eventz
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/contact"
              className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition text-sm"
            >
              Contact Us
            </Link>

            <Link
              to="/about"
              className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition text-sm"
            >
              About Us
            </Link>

            <Link
              to="/organizer/login?redirect=/organizer/events/create"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm"
            >
              Create Event
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition text-sm text-center"
              >
                Contact Us
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition text-sm text-center"
              >
                About Us
              </Link>

              <Link
                to="/organizer/login?redirect=/organizer/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm text-center"
              >
                Create Event
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-1 w-full">{children}</main>

      {/* FOOTER */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-600">
          © {new Date().getFullYear()} Eventz. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
