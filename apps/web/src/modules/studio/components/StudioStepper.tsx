"use client";

import { Check } from "lucide-react";
import { useStudio } from "./StudioContext";

const steps = [
  { num: 1, label: "Chọn khung" },
  { num: 2, label: "Nội dung" },
  { num: 3, label: "Nhân vật" },
  { num: 4, label: "Hoàn tất" },
];

export function StudioStepper() {
  const { step, setStep } = useStudio();

  const progressPercent =
    ((Math.max(1, Math.min(step, steps.length)) - 1) / (steps.length - 1)) *
    100;

  return (
    <div className="w-full max-w-[660px] overflow-x-auto overflow-y-visible py-2 scrollbar-hide">
      <div className="relative flex min-w-[600px] items-center justify-between">
        <div className="pointer-events-none absolute left-7 right-7 top-1/2 z-0 h-[2px] -translate-y-1/2 rounded-full bg-[#dbe7f1]" />

        <div
          className="pointer-events-none absolute left-7 top-1/2 z-0 h-[2px] -translate-y-1/2 rounded-full bg-[#2f91d0] transition-[width] duration-500 ease-out"
          style={{
            width: `calc((100% - 56px) * ${progressPercent / 100})`,
          }}
        />

        {steps.map((item) => {
          const isPast = step > item.num;
          const isActive = step === item.num;

          return (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num)}
              aria-current={isActive ? "step" : undefined}
              className={[
                "group relative z-10 box-border inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold",
                "transition-all duration-200 ease-out",
                "outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60",
                "hover:-translate-y-px active:translate-y-0",
                isActive
                  ? "border-[#2f91d0] bg-[#2f91d0] text-white shadow-none"
                  : isPast
                    ? "border-[#7fc2ea] bg-white text-[#2f91d0] shadow-none hover:border-[#2f91d0] hover:bg-[#f4faff]"
                    : "border-[#dbe7f1] bg-white text-slate-500 shadow-none hover:border-[#b9d8ed] hover:bg-[#f8fbff] hover:text-slate-800",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-200",
                  isActive
                    ? "bg-white text-[#2f91d0]"
                    : isPast
                      ? "bg-[#2f91d0] text-white"
                      : "bg-slate-200 text-slate-600 group-hover:bg-[#d9edf9] group-hover:text-[#2f91d0]",
                ].join(" ")}
              >
                {isPast ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  item.num
                )}
              </span>

              <span className="whitespace-nowrap leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
