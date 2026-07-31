"use client";

import { Plus } from "lucide-react";

export function StudioAddContentRow({
  title,
  subtitle,
  emphasis,
  onClick,
}: {
  title: string;
  subtitle: string;
  emphasis: "title" | "body" | "caption";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-h-[84px] w-full items-center justify-between rounded-[20px] border px-4 py-3.5 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#bddaf0] hover:shadow-sm",
        emphasis === "caption"
          ? "border-[#e1ebf3] bg-white hover:bg-white"
          : "border-[#e1ebf3] bg-white shadow-[0_10px_24px_-22px_rgba(15,43,74,0.34)] hover:bg-white",
      ].join(" ")}
    >
      <div className="min-w-0">
        <p
          className={
            emphasis === "title"
              ? "text-lg font-bold tracking-[-0.02em] text-slate-950"
              : emphasis === "caption"
                ? "text-xs font-bold uppercase tracking-wide text-slate-950"
                : "text-base font-bold tracking-[-0.02em] text-slate-950"
          }
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>
      </div>

      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef7ff] text-[#2f91d0] transition-all duration-200 group-hover:bg-[#2f91d0] group-hover:text-white">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}
