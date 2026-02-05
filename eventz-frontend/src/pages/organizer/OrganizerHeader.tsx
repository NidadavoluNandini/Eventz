import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveImageSrc } from "../../utils/image";

export default function OrganizerHeader() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [organizer, setOrganizer] = useState<any>(() => {
    const stored = localStorage.getItem("organizer");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const syncProfile = () => {
      const stored = localStorage.getItem("organizer");
      setOrganizer(stored ? JSON.parse(stored) : null);
    };

    // 🔥 listen for profile updates
    window.addEventListener("profileUpdated", syncProfile);

    return () => {
      window.removeEventListener("profileUpdated", syncProfile);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("organizer");
    localStorage.removeItem("organizerToken");
    navigate("/organizer/login");
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen(!dropdownOpen);
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-slate-200">
            {organizer?.photoUrl ? (
              <img
                src={resolveImageSrc(organizer.photoUrl)}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">
                {organizer?.name?.[0]?.toUpperCase() || "O"}
              </div>
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>

        {/* Name & Email */}
        <div className="text-left hidden md:block">
          <p className="font-semibold text-slate-900 text-sm leading-tight">
            {organizer?.name || "Organizer"}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-[150px]">
            {organizer?.email || "organizer@example.com"}
          </p>
        </div>

        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur ring-2 ring-white/50">
                {organizer?.photoUrl ? (
                  <img
                    src={resolveImageSrc(organizer.photoUrl)}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white">
                    {organizer?.name?.[0]?.toUpperCase() || "O"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {organizer?.name || "Organizer"}
                </p>
                <p className="text-xs text-indigo-100 truncate">
                  {organizer?.email || "organizer@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile */}
            <button
              onClick={() => {
                navigate("/organizer/profile");
                setDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <p className="font-medium text-slate-900">My Profile</p>
                <p className="text-xs text-slate-500">
                  View and edit your profile
                </p>
              </div>
            </button>

            {/* Dashboard */}
            <button
              onClick={() => {
                navigate("/organizer/dashboard");
                setDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <div>
                <p className="font-medium text-slate-900">Dashboard</p>
                <p className="text-xs text-slate-500">Go to dashboard</p>
              </div>
            </button>

            {/* Events */}
            <button
              onClick={() => {
                navigate("/organizer/events");
                setDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <svg
                className="w-5 h-5 text-slate-400"
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
              <div>
                <p className="font-medium text-slate-900">My Events</p>
                <p className="text-xs text-slate-500">Manage your events</p>
              </div>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-slate-200"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-xs text-red-500">Logout from your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
