// src/pages/events/create/steps/UserInfoStep.tsx
import React from "react";

type UserInfoStepProps = {
  userFieldConfig: Record<string, boolean>;
  setUserFieldConfig: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  userFieldRequiredConfig: Record<string, boolean>;
  setUserFieldRequiredConfig: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
};

const ALL_FIELDS = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "linkedin", label: "LinkedIn Profile URL" },
  { key: "gender", label: "Gender" },
  { key: "altPhone", label: "Alternate Phone" },
  { key: "altEmail", label: "Alternate Email" },
  { key: "dob", label: "Date of Birth" },
  { key: "country", label: "Country" },
  { key: "state", label: "State" },
  { key: "postalCode", label: "Postal Code" },
  { key: "organization", label: "Organization / College" },
  { key: "designation", label: "Designation / Role" },
  { key: "tShirtSize", label: "T-shirt Size" },
  { key: "emergencyContactName", label: "Emergency Contact Name" },
  { key: "emergencyContactPhone", label: "Emergency Contact Phone" },
];

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
  userFieldConfig,
  setUserFieldConfig,
  userFieldRequiredConfig,
  setUserFieldRequiredConfig,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Attendee Fields Configuration
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Choose which attendee fields to collect and mark important ones as required.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Fields
          </h3>
          <span className="text-[11px] sm:text-xs text-gray-400">
            Toggle visibility & required
          </span>
        </div>

        {/* GRID: 1 per row on mobile, 2 per row on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {ALL_FIELDS.map((f) => {
            const visible =
              userFieldConfig[f.key as keyof typeof userFieldConfig];
            const required =
              userFieldRequiredConfig[
                f.key as keyof typeof userFieldRequiredConfig
              ];

            return (
              <div
                key={f.key}
                className="border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition px-3 py-2.5 flex flex-col gap-1.5"
              >
                {/* top row: checkbox + label + toggle on right */}
                <div className="flex items-start justify-between gap-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={!!visible}
                      onChange={(e) =>
                        setUserFieldConfig((prev) => ({
                          ...prev,
                          [f.key]: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      {f.label}
                    </span>
                  </label>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
                    <span className="hidden sm:inline">
                      {required ? "Required" : "Optional"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newRequired = !required;

                        setUserFieldRequiredConfig((prev) => ({
                          ...prev,
                          [f.key]: newRequired,
                        }));

                        if (newRequired) {
                          setUserFieldConfig((prev) => ({
                            ...prev,
                            [f.key]: true,
                          }));
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                        required ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                          required ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* bottom text */}
                <p className="text-[11px] sm:text-xs text-gray-500">
                  {required
                    ? "Shown to attendees • Required"
                    : visible
                    ? "Shown to attendees • Optional"
                    : "Hidden from attendees"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
