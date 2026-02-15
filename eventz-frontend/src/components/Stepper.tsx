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
  goToStep
}) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:flex-nowrap">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const completed = isSectionCompleted(step.id);
          const isPast = index < currentIndex && completed;
          const clickable = canNavigateToStep(step.id);

          return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                onClick={() => clickable && goToStep(step.id)}
                disabled={!clickable}
                className={`flex flex-col items-center relative group ${
                  !clickable ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all
                    ${
                      isActive
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110"
                        : isPast
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500 hover:scale-105"
                    }`}
                >
                  {isPast ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center transition-colors ${
                    isActive
                      ? "text-indigo-600 font-semibold"
                      : isPast
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
<div className="flex-1 h-1 mx-2 relative hidden md:block">
                  <div
                    className={`h-full rounded transition-colors ${
                      isPast ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
