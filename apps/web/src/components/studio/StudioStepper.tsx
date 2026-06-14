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
    <div className="flex items-center gap-4 py-4 px-8 border-b bg-white">
      {steps.map((s, idx) => {
        const isPast = step > s.num;
        const isActive = step === s.num;
        
        return (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                isActive ? "border-red-500 text-red-600 bg-red-50 font-medium" :
                isPast ? "border-red-200 text-red-500 hover:bg-red-50" : 
                "border-zinc-200 text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                isActive || isPast ? "bg-red-200 text-red-700" : "bg-zinc-100 text-zinc-500"
              }`}>
                {isPast ? <Check className="w-3 h-3" /> : s.num}
              </div>
              <span className="text-sm">{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className="w-8 h-[2px] mx-2 bg-zinc-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
