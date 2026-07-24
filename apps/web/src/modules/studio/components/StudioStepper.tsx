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
    <div className="mx-auto w-full max-w-[760px] overflow-x-auto overflow-y-visible py-1 scrollbar-hide">
      <div className="relative flex min-w-[680px] items-center justify-between">
        <div className="pointer-events-none absolute left-5 right-5 top-1/2 z-0 h-px -translate-y-1/2 bg-[#dbe7f1]" />
        <div
          className="pointer-events-none absolute left-5 top-1/2 z-0 h-px -translate-y-1/2 bg-[#2f91d0] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `calc((100% - 40px) * ${progressPercent / 100})` }}
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
                "group relative z-10 inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[13px] font-semibold",
                "outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/70 motion-reduce:transition-none",
                isActive
                  ? "border-[#2f91d0] bg-[#2f91d0] text-white ring-1 ring-inset ring-[#7fc2ea]/70"
                  : isPast
                    ? "border-[#9ed0ef] bg-white text-[#2f91d0] hover:border-[#70bde9] hover:bg-[#f8fbff]"
                    : "border-[#dbe7f1] bg-white text-slate-500 hover:border-[#b9d8ed] hover:bg-[#f8fbff] hover:text-slate-800",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-200",
                  isActive
                    ? "bg-white text-[#2f91d0]"
                    : isPast
                      ? "bg-[#2f91d0] text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-[#e9f5fc] group-hover:text-[#2f91d0]",
                ].join(" ")}
              >
                {isPast ? <Check className="h-3 w-3" strokeWidth={3} /> : item.number}
              </span>
              <span className="whitespace-nowrap leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
