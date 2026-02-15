// src/pages/events/create/steps/ScheduleStep.tsx
import React from 'react';

type ScheduleStepProps = {
  city: string;
  setCity: (v: string) => void;
  locationText: string;
  setLocationText: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  errors: Record<string, string>;
};

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  city,
  setCity,
  locationText,
  setLocationText,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  errors
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Schedule & Location
        </h2>
        <p className="text-sm text-gray-500">
          When and where is your event?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter venue address"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="time"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          {(errors.startDate || errors.startTime) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.startDate || errors.startTime}
            </p>
          )}
        </div>

        {/* End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="time"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
                errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          {(errors.endDate || errors.endTime) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.endDate || errors.endTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
