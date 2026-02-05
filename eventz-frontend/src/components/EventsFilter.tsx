import React from "react";

type EventsFilterProps = {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};

const categories = [
  { label: "ALL", value: "ALL" },
  { label: "Technology", value: "Technology" },
  { label: "Science", value: "Science" },
  { label: "Arts", value: "Arts" },
  { label: "Business", value: "Business" },
  { label: "Sports", value: "Sports" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Industry", value: "Industry" },
];

export default function EventsFilter({
  selected,
  setSelected,
}: EventsFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-4">
      {categories.map(({ label, value }) => {
        const isActive = selected === value;

        return (
          <button
            key={value}
            onClick={() => setSelected(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
