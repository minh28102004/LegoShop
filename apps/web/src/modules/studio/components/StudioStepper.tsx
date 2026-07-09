"use client";

import { Check } from "lucide-react";
import { useStudio } from "./StudioContext";

export function StudioStepper() {
  const { step, setStep } = useStudio();

  const steps = [
    { num: 1, label: "Chọn khung" },
    { num: 2, label: "Nội dung" },
    { num: 3, label: "Nhân vật" },
    { num: 4, label: "Hoàn tất" },
  ];

  return (
    <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-[#e5edf5] bg-white/95 p-[3px] shadow-[0_10px_20px_-22px_rgba(18,45,78,0.16)] backdrop-blur scrollbar-hide">
      {steps.map((item, index) => {
        const isPast = step > item.num;
        const isActive = step === item.num;

        return (
          <div key={item.num} className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setStep(item.num)}
              className={`group inline-flex h-9 items-center gap-2.5 rounded-full px-3.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#2f91d0] text-white shadow-[0_10px_18px_-16px_rgba(47,145,208,0.42)]"
                  : isPast
                    ? "border border-[#e0e8f0] bg-white text-slate-700 hover:border-[#cfdbe6] hover:bg-slate-50"
                    : "border border-[#e0e8f0] bg-white text-slate-500 hover:border-[#cfdbe6] hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[11px] transition ${
                  isActive
                    ? "bg-white text-[#2f91d0]"
                    : isPast
                      ? "bg-slate-100 text-slate-700"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                {isPast ? <Check className="h-3 w-3" /> : item.num}
              </span>
              <span>{item.label}</span>
            </button>
            {index < steps.length - 1 ? (
              <div className="mx-1 hidden h-px w-5 rounded-full bg-[#e8eff5] sm:block" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
