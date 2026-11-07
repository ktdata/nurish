import React from 'react';
import { Check } from 'lucide-react';

interface OperationalChecklistProps {
  currentStep: 1 | 2 | 3;
  reservedZoneName?: string;
  onSelectStep: (step: 1 | 2 | 3) => void;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
}

export const OperationalChecklist: React.FC<OperationalChecklistProps> = ({
  currentStep,
  reservedZoneName,
  onSelectStep,
  step1Completed,
  step2Completed,
  step3Completed,
}) => {
  const steps = [
    {
      num: 1 as const,
      title: '1. Reserve Spot',
      desc: reservedZoneName ? `Committed: ${reservedZoneName}` : 'Select high-need relief zone',
      completed: step1Completed,
    },
    {
      num: 2 as const,
      title: '2. Pick Up Supplies',
      desc: 'Verify depot inventory & manifest',
      completed: step2Completed,
    },
    {
      num: 3 as const,
      title: '3. Serve Meals',
      desc: 'Live disbursement tally & field sign-off',
      completed: step3Completed,
    },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
            Field Deployment Pipeline
          </span>
          <span className="text-xs text-[#64748B] font-mono-metrics">
            STEP {currentStep} OF 3
          </span>
        </div>
        <span className="text-xs text-[#0D9488] font-medium hidden sm:inline-block">
          {currentStep === 1 && 'Pending Zone Allocation'}
          {currentStep === 2 && 'En Route to Depot'}
          {currentStep === 3 && 'On-Site Disbursement Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isDone = step.completed;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => onSelectStep(step.num)}
              className={`text-left p-3.5 rounded-lg border transition-all relative flex flex-col justify-between min-h-[76px] cursor-pointer ${
                isActive
                  ? 'border-[#0D9488] bg-[#F0FDFA] ring-1 ring-[#0D9488]/30 shadow-xs'
                  : isDone
                  ? 'border-[#10B981]/40 bg-[#F8FAFC] hover:border-[#10B981]'
                  : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm font-semibold tracking-tight ${
                    isActive
                      ? 'text-[#0D9488]'
                      : isDone
                      ? 'text-[#0F172A]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {step.title}
                </span>

                {isDone ? (
                  <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : isActive ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9488] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0D9488]"></span>
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#CBD5E1]" />
                )}
              </div>

              <div
                className={`text-xs mt-1 truncate ${
                  isDone
                    ? 'line-through text-[#64748B]'
                    : isActive
                    ? 'text-[#0F172A] font-medium'
                    : 'text-[#64748B]'
                }`}
              >
                {step.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
