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
  {label:"Health",value:"Health"},
];

export default function EventsFilter({ selected, setSelected }: EventsFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map(({ label, value }) => {
        const isActive = selected === value;

        return (
          <button
            key={value}
            onClick={() => setSelected(value)}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
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
