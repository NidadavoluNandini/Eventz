import { useNavigate } from "react-router-dom";

export default function RegistrationExpired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Registration Expired
        </h1>

        <p className="text-gray-700 mb-6">
          Your registration was not completed within 24 hours and
          has been automatically cancelled.
        </p>

        <button
          onClick={() => navigate("/events")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Browse Events
        </button>
      </div>
    </div>
  );
}
