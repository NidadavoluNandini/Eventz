// src/pages/organizer/ReviewStep.tsx
import React from "react";
import type { FormStep } from "../../components/Stepper";

type ThemeColor = {
  name: string;
  value: string;
  class: string;
};

type Ticket = {
  id: string;
  name: string;
  price: number;
  finalPrice: number;
  subTickets: { id: string }[];
};

type PaymentSettings = {
  collectPaymentCharges: boolean;
  platformFeePercent: number;
};

type ReviewStepProps = {
  userFieldConfig: Record<string, boolean>;
  goToStep: (step: FormStep, fromReview?: boolean) => void;
  title: string;
  category: string;
  themeColor: { name: string; value: string; class: string };
  city: string;
  locationText: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  bannerImageUrl?: string;
  mediaUrls: string[];
  tickets: Ticket[];
  paymentSettings: PaymentSettings;
  formatDate: (date: string) => string;
};

export const ReviewStep: React.FC<ReviewStepProps> = ({
  userFieldConfig,
  goToStep,
  title,
  category,
  themeColor,
  city,
  locationText,
  startDate,
  endDate,
  startTime,
  endTime,
  bannerImageUrl,
  mediaUrls,
  tickets,
  paymentSettings,
  formatDate,
}) => {
  const enabledOptionalFields = Object.entries(userFieldConfig)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Review Event Details
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Double-check everything before publishing.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* User info */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">👤</span>
              User Information Fields
            </h3>
            <button
              type="button"
              onClick={() => goToStep("userInfo", true)}
              className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <p>
              <span className="font-medium text-gray-700">
                Always required:
              </span>{" "}
              First Name, Last Name, Email, Phone
            </p>
            <p>
              <span className="font-medium text-gray-700">
                Optional fields enabled:
              </span>{" "}
              {enabledOptionalFields.length > 0
                ? enabledOptionalFields.join(", ")
                : "None"}
            </p>
          </div>
        </div>

        {/* Basic */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">📝</span>
              Basic Information
            </h3>
            <button
              type="button"
              onClick={() => goToStep("basic", true)}
              className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <p>
              <span className="font-medium text-gray-700">Title:</span> {title}
            </p>
            <p>
              <span className="font-medium text-gray-700">Category:</span>{" "}
              {category}
            </p>
            <p>
              <span className="font-medium text-gray-700">Theme:</span>{" "}
              {themeColor.name}
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">📅</span>
              Schedule & Location
            </h3>
            <button
              type="button"
              onClick={() => goToStep("schedule", true)}
              className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <p>
              <span className="font-medium text-gray-700">City:</span> {city}
            </p>
            <p>
              <span className="font-medium text-gray-700">Venue:</span>{" "}
              {locationText}
            </p>
            <p>
              <span className="font-medium text-gray-700">Start:</span>{" "}
              {startDate
                ? `${formatDate(startDate)} at ${startTime || "-"}`
                : "-"}
            </p>
            <p>
              <span className="font-medium text-gray-700">End:</span>{" "}
              {endDate
                ? `${formatDate(endDate)} at ${endTime || "-"}`
                : "-"}
            </p>
          </div>
        </div>

        {/* Media */}
        {(bannerImageUrl || mediaUrls.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">🖼️</span>
                Media
              </h3>
              <button
                type="button"
                onClick={() => goToStep("media", true)}
                className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-gray-600">
              {bannerImageUrl && <span>Banner image set</span>}
              {mediaUrls.length > 0 && (
                <span>
                  {mediaUrls.length} gallery image
                  {mediaUrls.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tickets */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">🎟️</span>
              Tickets ({tickets.length})
            </h3>
            <button
              type="button"
              onClick={() => goToStep("tickets", true)}
              className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            {tickets.map((t, i) => (
              <div
                key={t.id}
                className="text-xs sm:text-sm bg-white p-2 sm:p-2.5 rounded border border-gray-200"
              >
                <p className="font-medium text-gray-800">
                  {i + 1}. {t.name} –{" "}
                  {t.price <= 0 ? "FREE" : t.finalPrice.toFixed(2)}
                </p>
                {t.subTickets.length > 0 && (
                  <p className="text-[11px] sm:text-xs text-gray-600 ml-4">
                    {t.subTickets.length} addon option
                    {t.subTickets.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">💰</span>
              Payment Preferences
            </h3>
            <button
              type="button"
              onClick={() => goToStep("payment", true)}
              className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <p>
              <span className="font-medium text-gray-700">
                Collect charges:
              </span>{" "}
              {paymentSettings.collectPaymentCharges ? "Yes" : "No"}
            </p>
            {paymentSettings.collectPaymentCharges && (
              <p>
                <span className="font-medium text-gray-700">
                  Platform fee:
                </span>{" "}
                {paymentSettings.platformFeePercent}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
