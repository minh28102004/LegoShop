"use client";

import { formatCurrency, type CharacterPart } from "@lego-shop/shared";
import { Check, Layers3, PackageOpen } from "lucide-react";
import Image from "next/image";

import { resolveApiAssetUrl } from "@/lib/api/assets";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { getPartPrice } from "./types";

type CharacterBuilderCopy = Dictionary["characterBuilder"];

export function CharacterPartSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[16px] border border-[#dfebf2] bg-white p-2.5"
        >
          <div className="aspect-[4/3] animate-pulse rounded-[11px] bg-slate-100" />
          <div className="mt-2.5 h-3.5 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-2 h-3.5 w-1/2 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function CharacterEmptyState({
  copy,
  onBack,
}: {
  copy: CharacterBuilderCopy;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[220px] h-full flex-col items-center justify-center rounded-[18px] border border-dashed border-[#cbdfea] bg-[#f8fcfe] px-6 py-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-[#dbeaf2]">
        <PackageOpen className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-black text-navy">{copy.emptyCategoryTitle}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {copy.emptyCategoryDescription}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-primary bg-white px-5 text-sm font-extrabold text-primary transition-[background-color,transform] hover:bg-[#edf8fe] active:scale-[0.98]"
      >
        {copy.backToPresets}
      </button>
    </div>
  );
}

export function CharacterPartGrid({
  copy,
  onBack,
  onSelect,
  parts,
  selectedIds,
}: {
  copy: CharacterBuilderCopy;
  onBack: () => void;
  onSelect: (part: CharacterPart) => void;
  parts: CharacterPart[];
  selectedIds: ReadonlySet<string>;
}) {
  if (!parts.length) {
    return <CharacterEmptyState copy={copy} onBack={onBack} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {parts.map((part, index) => {
        const selected = selectedIds.has(part.id);
        const src = resolveApiAssetUrl(part.imageUrl);
        const unavailable =
          Boolean(part.availability) && part.availability !== "available";
        const price = getPartPrice(part);

        return (
          <button
            key={part.id}
            type="button"
            disabled={unavailable}
            onClick={() => onSelect(part)}
            aria-pressed={selected}
            className={`group relative min-w-0 rounded-[16px] border p-2.5 text-left transition-[border-color,background-color,transform] duration-[170ms] hover:-translate-y-0.5 hover:border-[#78bee7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
              selected
                ? "border-primary bg-[#eef9fe]"
                : "border-[#dce8ef] bg-white"
            }`}
          >
            <span className="relative block aspect-[4/3] overflow-hidden rounded-[11px] bg-[linear-gradient(145deg,#f8fbfd,#eef5f9)]">
              {src ? (
                <Image
                  src={src}
                  alt={part.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 42vw, (max-width: 1024px) 26vw, 180px"
                  loading={index < 4 ? "eager" : "lazy"}
                  className="object-contain p-0.5"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Layers3 className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
              )}
            </span>
            <span className="mt-2.5 block truncate text-sm font-black leading-5 text-navy">
              {part.name}
            </span>
            <span
              className={`mt-1 block text-xs font-extrabold ${
                selected ? "text-primary" : "text-slate-500"
              }`}
            >
              {unavailable
                ? copy.availability.unavailable
                : price > 0
                  ? `+${formatCurrency(price)}`
                  : copy.included}
            </span>
            {selected ? (
              <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-white ring-2 ring-white">
                <Check className="size-4" aria-hidden="true" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
