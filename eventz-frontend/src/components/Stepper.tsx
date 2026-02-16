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
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-indigo-600 uppercase">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
            {steps[currentIndex]?.label}
          </p>
        </div>
      </div>

      {/* Pills + desktop connectors */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const completed = isSectionCompleted(step.id);
            const clickable = canNavigateToStep(step.id);
            const isBeforeOrCurrent = index <= currentIndex;

            return (
              <div
                key={step.id}
                className="flex items-center md:flex-1 md:min-w-0"
              >
                {/* pill */}
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && goToStep(step.id)}
                  className={`flex items-center gap-2
                    px-3 sm:px-4 md:px-5
                    py-1.5 md:py-2
                    rounded-full border
                    text-[11px] sm:text-xs md:text-sm
                    font-medium transition whitespace-nowrap
                    ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : completed
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }
                    ${
                      !clickable
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-indigo-50"
                    }`}
                >
                  {/* icon badge */}
                  <span
                    className={`relative flex items-center justify-center
                      w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9
                      rounded-full ${
                        isActive
                          ? "bg-white text-indigo-700"
                          : completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    <span className="text-base sm:text-lg md:text-2xl leading-none">
                      {step.icon}
                    </span>
                    {completed && !isActive && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      </span>
                    )}
                  </span>

                  <span className="hidden xs:inline truncate max-w-[90px] sm:max-w-[130px] md:max-w-[180px]">
                    {step.label}
                  </span>
                </button>

                {/* desktop connector line: only between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 mx-1">
                    <div
                      className={`h-1 w-full rounded-full transition-colors ${
                        isBeforeOrCurrent ? "bg-indigo-200" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
