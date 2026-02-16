// src/pages/events/create/steps/BasicInfoStep.tsx
import React from "react";

const CATEGORIES = [
  "Technology",
  "Arts",
  "Sports",
  "Science",
  "Industry",
  "Entertainment",
  "Business",
  "Health",
];

const THEMECOLORS = [
  { name: "Blue", value: "#4F46E5", class: "bg-indigo-600" },
  { name: "Red", value: "#DC2626", class: "bg-red-600" },
  { name: "Green", value: "#16A34A", class: "bg-green-600" },
  { name: "Purple", value: "#9333EA", class: "bg-purple-600" },
  { name: "Orange", value: "#EA580C", class: "bg-orange-600" },
  { name: "Pink", value: "#DB2777", class: "bg-pink-600" },
  { name: "Teal", value: "#0D9488", class: "bg-teal-600" },
  { name: "Cyan", value: "#0891B2", class: "bg-cyan-600" },
  { name: "Amber", value: "#D97706", class: "bg-amber-600" },
  { name: "Lime", value: "#65A30D", class: "bg-lime-600" },
  { name: "Emerald", value: "#059669", class: "bg-emerald-600" },
  { name: "Sky", value: "#0284C7", class: "bg-sky-600" },
  { name: "Violet", value: "#7C3AED", class: "bg-violet-600" },
  { name: "Fuchsia", value: "#C026D3", class: "bg-fuchsia-600" },
  { name: "Rose", value: "#E11D48", class: "bg-rose-600" },
  { name: "Slate", value: "#475569", class: "bg-slate-600" },
];

export type ThemeColor = {
  name: string;
  value: string;
  class: string;
};

type BasicInfoStepProps = {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  themeColor: ThemeColor;
  setThemeColor: (c: ThemeColor) => void;
  errors: Record<string, string>;
};

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  themeColor,
  setThemeColor,
  errors,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Basic Information
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Tell us about your event.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && (
          <p className="text-red-500 text-[11px] sm:text-xs mt-1">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe your event..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="text-red-500 text-[11px] sm:text-xs mt-1">
            {errors.description}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="sm:max-w-sm">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none ${
            errors.category ? "border-red-500" : "border-gray-300"
          }`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-[11px] sm:text-xs mt-1">
            {errors.category}
          </p>
        )}
      </div>

      {/* Theme color */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
          Event Theme Color
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 -ml-1 pr-1">
          {THEMECOLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setThemeColor(color)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${color.class} transition-all flex-shrink-0 ${
                themeColor.value === color.value
                  ? "ring-2 ring-offset-2 ring-indigo-300 scale-100"
                  : "hover:scale-110"
              }`}
              title={color.name}
            />
          ))}
        </div>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-2">
          Selected{" "}
          <span className="font-semibold">{themeColor.name}</span>
        </p>
      </div>
    </div>
  );
};
