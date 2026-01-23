import { useEffect, useState } from "react";
import api from "../../utils/axios";

export default function OrganizerProfile() {
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

  // ==============================
  // Load profile
  // ==============================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/organizers/me");
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        photoUrl: res.data.photoUrl || "",
      });
    } catch (err) {
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Update profile
  // ==============================
  


  const saveProfile = async () => {
  await api.put("/organizers/me", profile);

  const updated = await api.get("/organizers/me");

  localStorage.setItem(
    "organizer",
    JSON.stringify(updated.data)
  );

  alert("Profile updated");
};


  // ==============================
  // Change password
  // ==============================
  const changePassword = async () => {
    if (!password.oldPassword || !password.newPassword) {
      return alert("Fill both password fields");
    }

    try {
      await api.put("/organizers/change-password", password);
      alert("Password changed successfully");

      setPassword({
        oldPassword: "",
        newPassword: "",
      });
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Password change failed",
      );
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Organizer Profile
      </h1>

      {/* ================= PROFILE SECTION ================= */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Profile Details
        </h2>

        <div className="space-y-4">
          {/* PHOTO */}
          <div>
            <label className="block text-sm font-medium">
              Photo URL
            </label>

            <input
              value={profile.photoUrl}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  photoUrl: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded"
              placeholder="https://image-url"
            />

            {profile.photoUrl && (
              <img
                src={profile.photoUrl}
                className="w-24 h-24 rounded-full mt-3 object-cover"
              />
            )}
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium">
              Name
            </label>

            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded"
              placeholder="Your name"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium">
              Email
            </label>

            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
  onClick={saveProfile}
  className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
>
  Save Profile
</button>

        </div>
      </div>

      {/* ================= PASSWORD SECTION ================= */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Change Password
        </h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Old password"
            value={password.oldPassword}
            onChange={(e) =>
              setPassword({
                ...password,
                oldPassword: e.target.value,
              })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="password"
            placeholder="New password"
            value={password.newPassword}
            onChange={(e) =>
              setPassword({
                ...password,
                newPassword: e.target.value,
              })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <button
            onClick={changePassword}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
