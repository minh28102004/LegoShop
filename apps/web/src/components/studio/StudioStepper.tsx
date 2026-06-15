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
    <div className="flex items-center gap-1">
      {steps.map((s, idx) => {
        const isPast = step > s.num;
        const isActive = step === s.num;
        
        return (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => setStep(s.num)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={
                isActive
                  ? { backgroundColor: "#2563eb", color: "#ffffff" }
                  : isPast
                  ? { color: "#2563eb", backgroundColor: "rgba(37, 99, 235, 0.1)" }
                  : { color: "#9CA3AF" }
              }
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                style={
                  isActive
                    ? { backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#ffffff" }
                    : isPast
                    ? { backgroundColor: "#2563eb", color: "#ffffff" }
                    : { backgroundColor: "#e5e7eb", color: "#9CA3AF" }
                }
              >
                {isPast ? <Check className="w-2.5 h-2.5" /> : s.num}
              </div>
              <span>{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className="w-6 h-px mx-1"
                style={{
                  backgroundColor: isPast ? "rgba(37, 99, 235, 0.3)" : "#e5e7eb"
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
