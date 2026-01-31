import { useEffect, useState } from "react";
import { resolveImageSrc } from "../../utils/image";

export default function OrganizerHeader() {
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

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
        {organizer?.photoUrl ? (
          <img
  src={resolveImageSrc(organizer.photoUrl)}
  className="w-full h-full object-cover"
/>
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
            {organizer?.name?.[0] || "O"}
          </div>
        )}
      </div>

      {/* Name */}
      <span className="font-medium">
        {organizer?.name || "Organizer"}
      </span>
    </div>
  );
}
