import { useNavigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";

export default function AccessDenied({
  title = "Not Available",
  message = "This page is no longer accessible.",
}) {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="min-h-[100vh] flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md">

          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full
                          flex items-center justify-center mx-auto mb-4">
            ❌
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h2>

          <p className="text-gray-600 text-sm mb-6">
            {message}
          </p>

          <button
            onClick={() => navigate("/events")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                       font-semibold hover:bg-indigo-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
