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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      {/* MOBILE = vertical | DESKTOP = horizontal */}
      <ol className="flex flex-col md:flex-row md:items-center md:justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const completed = isSectionCompleted(step.id);
          const isPast = index < currentIndex && completed;
          const clickable = canNavigateToStep(step.id);

          return (
            <li
              key={step.id}
              className="flex md:flex-1 md:flex-col items-center relative"
            >
              {/* STEP BUTTON */}
              <button
                type="button"
                onClick={() => clickable && goToStep(step.id)}
                disabled={!clickable}
                className={`flex items-center md:flex-col gap-3 group z-10
                  ${
                    !clickable
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }
                `}
              >
                {/* CIRCLE */}
                <div
                  className={`
                    w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12
                    rounded-full flex items-center justify-center
                    font-bold transition-all
                    ${
                      isActive
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110"
                        : isPast
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {isPast ? (
                    <svg
                      className="w-5 h-5"
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

                {/* LABEL */}
                <span
                  className={`
                    text-[11px] sm:text-xs font-medium text-center md:mt-2
                    ${
                      isActive
                        ? "text-indigo-600 font-semibold"
                        : isPast
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* ---------- CONNECTOR LINE ---------- */}

              {/* Desktop Horizontal Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-1/2 w-full">
                  <div
                    className={`h-1 ml-6 rounded-full
                      ${
                        index < currentIndex
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }
                    `}
                  />
                </div>
              )}

              {/* Mobile Vertical Line */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute top-12 left-5">
                  <div
                    className={`w-0.5 h-8 rounded-full
                      ${
                        index < currentIndex
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }
                    `}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
