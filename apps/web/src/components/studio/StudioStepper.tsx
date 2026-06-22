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
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
      {steps.map((s, idx) => {
        const isPast = step > s.num;
        const isActive = step === s.num;
        
        return (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => setStep(s.num)}
              className={`group flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                isActive
                  ? "border border-[#ef9ab3] bg-[#fff4f7] text-[#d94f77] shadow-sm scale-105"
                  : isPast
                  ? "border border-[#ef9ab3] bg-white text-slate-700 hover:bg-[#fff4f7]"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-[#ef9ab3]/60 hover:text-slate-700"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black transition-colors duration-300 ${
                  isActive
                    ? "bg-[#ef9ab3] text-white"
                    : isPast
                    ? "bg-[#ef9ab3] text-white shadow-sm"
                    : "bg-slate-200 text-slate-600 group-hover:bg-[#f8d6df]"
                }`}
              >
                {isPast ? <Check className="h-3 w-3" /> : s.num}
              </div>
              <span>{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className="mx-2 flex w-8 items-center justify-center">
                <div
                  className={`h-[2px] w-full rounded-full transition-colors duration-300 ${
                    isPast ? "bg-[#ef9ab3]/50" : "bg-slate-200"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
