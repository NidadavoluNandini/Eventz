import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import toast from "react-hot-toast";

export default function OrganizerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    photoUrl: "",
  });

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // ================= LOAD PROFILE =================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/organizers/me");
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        photoUrl: res.data.photoUrl || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE PROFILE =================
  const saveProfile = async () => {
    try {
      const res = await api.put("/api/organizers/me", profile);

      localStorage.setItem("organizer", JSON.stringify(res.data));
      window.dispatchEvent(new Event("profileUpdated"));

      toast.success("Profile updated successfully ✅");
      navigate("/organizer/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // ================= CHANGE PASSWORD =================
  const changePassword = async () => {
    if (!password.oldPassword || !password.newPassword) {
      toast.error("Fill both password fields");
      return;
    }

    try {
      await api.put("/api/organizers/change-password", password);

      toast.success("Password updated successfully 🔐");
      localStorage.removeItem("organizer");
      localStorage.removeItem("organizerToken");
      navigate("/organizer/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Organizer Profile</h1>

      {/* PROFILE */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="font-semibold">Profile Details</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <img
            src={profile.photoUrl || "/default-avatar.png"}
            onError={(e) =>
              (e.currentTarget.src = "/default-avatar.png")
            }
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>

        <input
          placeholder="Image URL"
          value={profile.photoUrl}
          onChange={(e) =>
            setProfile({ ...profile, photoUrl: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Email"
          value={profile.email}
          onChange={(e) =>
            setProfile({ ...profile, email: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <button
          onClick={saveProfile}
          className="bg-indigo-600 text-white px-5 py-2 rounded"
        >
          Save Profile
        </button>
      </div>

      {/* PASSWORD */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="font-semibold">Change Password</h2>

        <input
          type="password"
          placeholder="Old password"
          value={password.oldPassword}
          onChange={(e) =>
            setPassword({ ...password, oldPassword: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="password"
          placeholder="New password"
          value={password.newPassword}
          onChange={(e) =>
            setPassword({ ...password, newPassword: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <button
          onClick={changePassword}
          className="bg-green-600 text-white px-5 py-2 rounded"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
