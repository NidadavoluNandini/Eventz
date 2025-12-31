import React from "react";

type EventsFilterProps = {
  selected: string;
  setSelected: React.Dispatch<
    React.SetStateAction<string>
  >;
};

const categories = [
  { label: "ALL", value: "ALL" },
  { label: "Technology", value: "technology" },
  { label: "Science", value: "science" },
  { label: "Arts", value: "arts" },
  { label: "Business", value: "business" },
  { label: "Sports", value: "sports" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Industry" , value:"industry"},
];

export default function EventsFilter({
  selected,
  setSelected,
}: EventsFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-10">
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
