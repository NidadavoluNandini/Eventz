// src/pages/organizer/PaymentStep.tsx
import React from "react";

type PaymentSettings = {
  collectPaymentCharges: boolean;
  platformFeePercent: number; // keep in shape, but we won't show the input
};

type OtherAttendeesConfig = {
  enabled: boolean;
  requiredFields: string[];
};

type FormState = {
  otherAttendeesConfig: OtherAttendeesConfig;
};

type PaymentStepProps = {
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Record<string, string>;
};

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentSettings,
  setPaymentSettings,
  form,
  setForm
}) => {
  const toggleCollectCharges = () => {
    setPaymentSettings((p) => ({
      ...p,
      collectPaymentCharges: !p.collectPaymentCharges
    }));
  };

  const toggleOtherAttendees = () => {
    setForm((prev) => ({
      ...prev,
      otherAttendeesConfig: {
        enabled: !prev.otherAttendeesConfig?.enabled,
        requiredFields:
          prev.otherAttendeesConfig?.requiredFields ?? [
            "name",
            "email",
            "phone"
          ]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Payment preferences
        </h2>
        <p className="text-sm text-gray-500">
          Control how ticket charges are shown to attendees and how you collect
          details for multiple attendees.
        </p>
      </div>

      {/* Collect platform charges (toggle only) */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Collect additional platform charges
          </p>
          <p className="text-xs text-gray-500 mt-1">
            When enabled, ticket price shown to attendees will include a small
            additional platform fee.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleCollectCharges}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            paymentSettings.collectPaymentCharges
              ? "bg-indigo-600"
              : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              paymentSettings.collectPaymentCharges
                ? "translate-x-5"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Other attendees config */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Additional attendees details
          </p>
          <p className="text-xs text-gray-500 mt-1">
            When enabled, ask details for each attendee if a user buys more than
            one ticket.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleOtherAttendees}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            form.otherAttendeesConfig?.enabled ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              form.otherAttendeesConfig?.enabled
                ? "translate-x-5"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
