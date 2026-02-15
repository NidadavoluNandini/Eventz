import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../../utils/axios";
import OrganizerHeader from "./OrganizerHeader";
import { toast } from "react-hot-toast";

const deleteClickState = { lastClickAt: 0 };

export default function OrganizerLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [organizer, setOrganizer] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const deleteTimerRef = useRef<number | null>(null);

  // Load organizer from localStorage
  useEffect(() => {
    const loadOrganizer = () => {
      const data = localStorage.getItem("organizer");
      if (data) {
        setOrganizer(JSON.parse(data));
      }
    };

    loadOrganizer();

    window.addEventListener("storage", loadOrganizer);
    window.addEventListener("profileUpdated", loadOrganizer);

    return () => {
      window.removeEventListener("storage", loadOrganizer);
      window.removeEventListener("profileUpdated", loadOrganizer);
    };
  }, []);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setScrolled(target.scrollTop > 20);
    };

    const mainContent = document.getElementById("main-content");
    mainContent?.addEventListener("scroll", handleScroll);

    return () => {
      mainContent?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ======================
  // LOGOUT with toast confirm
  // ======================
  const logout = () => {
    toast((t) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">Logout?</p>
        <p className="text-xs text-slate-700">
          You will be signed out from the organizer dashboard.
        </p>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white"
            onClick={() => {
              toast.dismiss(t.id);
              localStorage.removeItem("organizerToken");
              localStorage.removeItem("organizer");
              toast.success("Logged out");
              navigate("/organizer/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    ));
  };

  // ======================
  // DELETE ACCOUNT with toast confirm
  // ======================
  const performDeleteAccount = async () => {
    try {
      await api.delete("/api/organizers/me");

      localStorage.removeItem("organizerToken");
      localStorage.removeItem("organizer");

      toast.success("Account deleted successfully");
      navigate("/organizer/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete account. Please try again."
      );
    } finally {
      deleteClickState.lastClickAt = 0;
      if (deleteTimerRef.current) {
        window.clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    }
  };

  const deleteAccount = () => {
    const now = Date.now();

    // First click (or after timeout): show confirmation toast
    if (now - deleteClickState.lastClickAt > 10_000) {
      deleteClickState.lastClickAt = now;

      toast((t) => (
        <div className="space-y-1">
          <p className="font-semibold text-red-600">Delete account?</p>
          <p className="text-xs text-slate-700">
            This will permanently delete your account and all your events. This
            action cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700"
              onClick={() => {
                deleteClickState.lastClickAt = 0;
                toast.dismiss(t.id);
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white"
              onClick={async () => {
                toast.dismiss(t.id);
                await performDeleteAccount();
              }}
            >
              Confirm delete
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
      });

      if (deleteTimerRef.current) {
        window.clearTimeout(deleteTimerRef.current);
      }
      deleteTimerRef.current = window.setTimeout(() => {
        deleteClickState.lastClickAt = 0;
      }, 10000);

      return;
    }

    // Second click within 10 seconds (optional direct delete)
    performDeleteAccount();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 shadow-2xl z-50 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header with Gradient */}
{/* Header with Gradient */}
<div className="p-6 border-b border-slate-200/80 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2 group">
      <NavLink
        to="/"
        onClick={() => setIsSidebarOpen(false)}
        className="flex items-center gap-2"
      >
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Eventz
        </h2>
      </NavLink>
    </div>
    <button
      onClick={() => setIsSidebarOpen(false)}
      className="lg:hidden text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all duration-200"
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
  <p className="text-xs text-slate-500 font-medium">Organizer Panel</p>
</div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/organizer/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`
            }
          >
            <svg
              className="w-5 h-5 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="relative z-10">Dashboard</span>
          </NavLink>

          <NavLink
            to="/organizer/events"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`
            }
          >
            <svg
              className="w-5 h-5 relative z-10"
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
            <span className="relative z-10">My Events</span>
          </NavLink>

          <NavLink
            to="/organizer/users"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`
            }
          >
            <svg
              className="w-5 h-5 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="relative z-10">Registrations</span>
          </NavLink>

         

         

        </nav>

        {/* Footer Actions */}
        <div className="border-t border-slate-200/80 p-3 space-y-1 bg-slate-50/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:translate-x-1 group"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>

          <button
            onClick={deleteAccount}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm hover:translate-x-1 group"
          >
            <svg
              className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
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
            Delete Account
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header
          className={`bg-white/95 backdrop-blur-xl border-b border-slate-200/80 flex-shrink-0 sticky top-0 z-30 transition-all duration-300 ${
            scrolled ? "shadow-lg" : "shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Mobile Menu + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-slate-900">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {organizer?.name?.trim()
                      ? organizer.name.split(" ")[0]
                      : "Organizer"}
                  </span>
                </h1>
                <p className="text-sm text-slate-500">
                  Manage your events and grow your audience
                </p>
              </div>
            </div>

            {/* Right: Actions + Profile */}
            <div className="flex items-center gap-3">
              {/* Create Event Button */}
              <button
                onClick={() => navigate("/organizer/events/create")}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 group"
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
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
                <span className="hidden sm:inline">Create Event</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110 group">
                <svg
                  className="w-6 h-6 group-hover:animate-wiggle"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {/* Organizer Header Component */}
              <OrganizerHeader />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div
          id="main-content"
          className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100"
        >
          <div className="p-6 max-w-[1600px] mx-auto animate-fadeIn">
            <Outlet />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-6 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Eventz. All rights reserved.</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-indigo-600 transition-all duration-200 font-medium hover:scale-105"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-indigo-600 transition-all duration-200 font-medium hover:scale-105"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-indigo-600 transition-all duration-200 font-medium hover:scale-105"
              >
                Support
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
