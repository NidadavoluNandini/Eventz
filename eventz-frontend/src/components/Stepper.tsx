import React from "react";

export type FormStep =
  | "userInfo"
  | "basic"
  | "schedule"
  | "media"
  | "tickets"
  | "payment"
  | "review"
  | "preview";

export type StepMeta = {
  id: FormStep;
  label: string;
  icon: React.ReactNode;
};

type StepperProps = {
  steps: StepMeta[];
  currentStep: FormStep;
  canNavigateToStep: (step: FormStep) => boolean;
  isSectionCompleted: (step: FormStep) => boolean;
  goToStep: (step: FormStep) => void;
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  canNavigateToStep,
  isSectionCompleted,
  goToStep,
}) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-3 py-3 sm:px-4 sm:py-4 mb-4 sm:mb-6">
      {/* Header: step count + current label */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-800">
            {steps[currentIndex]?.label}
          </p>
        </div>
      </div>

      {/* Horizontal pills – always row, scroll if overflow */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const completed = isSectionCompleted(step.id);
            const clickable = canNavigateToStep(step.id);
            const number = index + 1;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && goToStep(step.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : completed
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                } ${
                  !clickable
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-indigo-50"
                }`}
              >
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                    isActive
                      ? "bg-white text-indigo-700"
                      : completed
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {completed ? "✓" : number}
                </span>
                <span className="hidden xs:inline truncate max-w-[90px] sm:max-w-[130px]">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
