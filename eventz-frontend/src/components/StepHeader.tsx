import React from "react";
import { useNavigate } from "react-router-dom";

type StepHeaderProps = {
  editMode: boolean;
  onUpdate?: () => void;
  isLoading?: boolean;
};

export const StepHeader: React.FC<StepHeaderProps> = ({
  editMode,
  onUpdate,
  isLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/organizer/events")}
          className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            {editMode ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Fill in the details below
          </p>
        </div>
      </div>

      {editMode && onUpdate && (
        <button
          type="button"
          onClick={onUpdate}
          disabled={isLoading}
          className="self-start sm:self-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update Event"}
        </button>
      )}
    </div>
  );
};
