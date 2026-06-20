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
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : isPast
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-surface-hover text-text-muted hover:text-text-secondary"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black transition-colors duration-300 ${
                  isActive
                    ? "bg-white/25 text-white"
                    : isPast
                    ? "bg-primary text-white shadow-sm"
                    : "bg-border text-text-muted group-hover:bg-zinc-300"
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
                    isPast ? "bg-primary/30" : "bg-border"
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
