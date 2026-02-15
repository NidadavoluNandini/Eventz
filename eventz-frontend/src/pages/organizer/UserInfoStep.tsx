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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        Attendee Fields Configuration
      </h2>
      <p className="text-sm text-gray-500">
        Choose which attendee fields to collect and whether they are required.
      </p>

      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Fields
        </h3>

        <div className="space-y-2 text-sm">
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
                className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-white"
              >
                <div className="flex items-center gap-2">
                  {/* visibility checkbox */}
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={!!visible}
                    onChange={(e) =>
                      setUserFieldConfig((prev) => ({
                        ...prev,
                        [f.key]: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-gray-700">{f.label}</span>
                </div>

                {/* required toggle */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{required ? "Required" : "Optional"}</span>
                  <button
                    type="button"
                    onClick={() => {
  const newRequired = !required;

  // toggle required
  setUserFieldRequiredConfig((prev) => ({
    ...prev,
    [f.key]: newRequired,
  }));

  // ✅ if required → automatically enable field visibility
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
