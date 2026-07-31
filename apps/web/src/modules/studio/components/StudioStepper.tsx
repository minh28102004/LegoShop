"use client";

import { Check } from "lucide-react";
import toast from "react-hot-toast";

import {
  DEFAULT_PANEL_TAB_BY_STEP,
  DEFAULT_TOOL_BY_STEP,
  STUDIO_STEP_INDEX,
  STUDIO_STEPS,
  type StudioStep,
} from "../state/studio.types";
import { useStudioI18n } from "../hooks/useStudioI18n";
import { useStudio } from "./StudioContext";

export function StudioStepper() {
  const {
    activeStep,
    setActiveStep,
    validateStep,
    setActiveTool,
    setActivePanelTab,
    setIsContextPanelCollapsed,
  } = useStudio();
  const { text } = useStudioI18n();
  const steps = STUDIO_STEPS.map((id, index) => ({
    id,
    number: index + 1,
    label: text.steps[index],
  }));
  const activeIndex = STUDIO_STEP_INDEX[activeStep];

  function activateStep(targetStep: StudioStep) {
    setActiveStep(targetStep);
    setActiveTool(DEFAULT_TOOL_BY_STEP[targetStep]);
    setActivePanelTab(DEFAULT_PANEL_TAB_BY_STEP[targetStep]);
    setIsContextPanelCollapsed(false);
  }

  function handleStepChange(targetStep: StudioStep) {
    const targetIndex = STUDIO_STEP_INDEX[targetStep];
    if (targetIndex <= activeIndex) {
      activateStep(targetStep);
      return;
    }

    for (let index = activeIndex; index < targetIndex; index += 1) {
      const stepToValidate = STUDIO_STEPS[index];
      if (!stepToValidate) continue;

      const validation = validateStep(stepToValidate);
      if (!validation.isValid) {
        toast.error(validation.summaryErrors[0] ?? text.toast.validationError);
        return;
      }
    }

    activateStep(targetStep);
  }

  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="mx-auto w-full max-w-[790px] overflow-x-auto overflow-y-visible px-3 py-2 scrollbar-hide">
      <div className="relative flex min-w-[660px] items-center justify-between">
        <div className="pointer-events-none absolute left-6 right-6 top-1/2 z-0 h-px -translate-y-1/2 bg-[#dbe7f1]" />
        <div
          className="pointer-events-none absolute left-6 top-1/2 z-0 h-[2px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#2f91d0,#68b8e6)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `calc((100% - 48px) * ${progressPercent / 100})` }}
        />

        {steps.map((item, index) => {
          const isPast = activeIndex > index;
          const isActive = activeStep === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleStepChange(item.id)}
              aria-current={isActive ? "step" : undefined}
              className={[
                "business-hover-lift group relative z-10 inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold",
                "outline-none hover:shadow-[0_10px_22px_-20px_rgba(18,45,78,0.28)] focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/70",
                isActive
                  ? "border-2 border-[#2f91d0] bg-[linear-gradient(135deg,#2f91d0,#3da4dc)] text-white"
                  : isPast
                    ? "border-2 border-[#9ed0ef] bg-white text-[#2f91d0] hover:border-[#70bde9] hover:bg-[#f4faff]"
                    : "border-[#dbe7f1] bg-white text-slate-500 hover:border-[#b9d8ed] hover:bg-[#f8fbff] hover:text-slate-800",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-500",
                  isActive
                    ? "bg-white text-[#2f91d0]"
                    : isPast
                      ? "bg-[#2f91d0] text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-[#e9f5fc] group-hover:text-[#2f91d0]",
                ].join(" ")}
              >
                {isPast ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  item.number
                )}
              </span>
              <span className="whitespace-nowrap leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
