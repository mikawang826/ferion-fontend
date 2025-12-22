import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
}

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  children: ReactNode;
  onNext: () => void;
  onBack: () => void;
  className?: string;
  contentClassName?: string;
}

export function WizardLayout({
  currentStep,
  totalSteps,
  steps,
  children,
  className = "",
  contentClassName = "",
}: WizardLayoutProps) {
  const gridTemplateColumns = `repeat(${steps.length}, minmax(0, 1fr))`;
  const progressPercent =
    steps.length > 1
      ? ((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100
      : 0;

  return (
    <div
      className={`min-h-full bg-transparent ${className}`}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Ferion RWA Platform
              </h1>
              <p className="mt-1 text-sm text-slate-600">Create New Project</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Draft Auto-saved</span>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Step {currentStep} of {totalSteps}
            </p>
            <p className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
              Guided Creation
            </p>
          </div>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
              <div
                className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-orange-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="relative z-10 grid items-center"
                style={{ gridTemplateColumns }}
              >
                {steps.map((step) => (
                  <div key={step.id} className="flex justify-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm transition-all ${
                        step.id < currentStep
                          ? "border-orange-500 bg-orange-500 text-white"
                          : step.id === currentStep
                          ? "border-orange-500 bg-white text-orange-600 ring-2 ring-orange-300"
                          : "border-slate-300 bg-white text-slate-600 font-semibold ring-1 ring-slate-200"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="mt-3 grid"
              style={{ gridTemplateColumns }}
            >
              {steps.map((step) => (
                <div key={step.id} className="flex justify-center px-2">
                  <p
                    className={`text-center text-sm ${
                      step.id === currentStep
                        ? "text-orange-600 font-semibold"
                        : step.id < currentStep
                        ? "text-slate-700"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={contentClassName}>{children}</div>
      </main>
    </div>
  );
}
