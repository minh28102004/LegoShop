"use client";

import type { FrameSize } from "@lego-shop/shared";
import {
  ArrowRight,
  Banknote,
  Check,
  Frame,
  Gift,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import type { CollectionDictionary } from "@/lib/i18n/dictionaries";
import type { CollectionFilters } from "@/modules/collection/types/collection.types";

type CollectionFilterDrawerProps = {
  filters: CollectionFilters;
  frameSizes: FrameSize[];
  isOpen: boolean;
  labels: CollectionDictionary;
  onApply: (filters: CollectionFilters) => void;
  onClose: () => void;
  onReset: () => void;
};

const COUNT_OPTIONS = [1, 2, 3] as const;

const sectionClassName =
  "rounded-[22px] border border-[#dce8f1] bg-white p-4 shadow-[0_16px_34px_-30px_rgba(7,29,58,0.32)] sm:p-5";

function parsePrice(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed)
    : undefined;
}

function countActiveFilters(filters: CollectionFilters) {
  return [
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    Boolean(filters.characterCounts?.length),
    Boolean(filters.charmCounts?.length),
    Boolean(filters.frameSize),
    filters.featured === true,
    filters.isNew === true,
    filters.includedGift === true,
  ].filter(Boolean).length;
}

export function CollectionFilterDrawer({
  filters,
  frameSizes,
  isOpen,
  labels,
  onApply,
  onClose,
  onReset,
}: CollectionFilterDrawerProps) {
  const [draft, setDraft] = useState<CollectionFilters>(filters);

  function handleClose() {
    setDraft(filters);
    onClose();
  }

  function toggleCount(
    key: "characterCounts" | "charmCounts",
    count: (typeof COUNT_OPTIONS)[number],
  ) {
    setDraft((current) => {
      const values = current[key] ?? [];
      const nextValues = values.includes(count)
        ? values.filter((value) => value !== count)
        : [...values, count].sort((left, right) => left - right);

      return {
        ...current,
        [key]: nextValues.length > 0 ? nextValues : undefined,
      };
    });
  }

  const countLabel = (count: (typeof COUNT_OPTIONS)[number]) =>
    count === 1
      ? labels.filters.one
      : count === 2
        ? labels.filters.two
        : labels.filters.threePlus;
  const activeFilterCount = countActiveFilters(draft);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      position="right"
      size="lg"
      overlayClassName="!bg-[#071a2f]/45 backdrop-blur-[3px]"
      className="!inset-y-0 !right-0 !left-auto !flex !h-[100dvh] !w-full !max-w-[520px] !flex-col !overflow-hidden !bg-slate-100 shadow-[-28px_0_80px_-46px_rgba(7,29,58,0.6)] sm:!rounded-l-[4px]"
      contentClassName="!h-full !overflow-hidden !p-0"
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 36,
        mass: 0.85,
      }}
      style={{ top: 0, right: 0, bottom: 0, left: "auto", height: "100dvh" }}
    >
      <form
        className="flex h-full min-h-0 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          onApply(draft);
          onClose();
        }}
      >
        <header className="flex min-h-[88px] shrink-0 items-center justify-between gap-4 border-b border-[#e0eaf1] bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf5fc] text-[#258fce] ring-1 ring-inset ring-[#d2e8f5]">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[21px] font-bold tracking-[-0.02em] text-[#0c213b]">
                  {labels.filters.title}
                </h2>
                {activeFilterCount > 0 ? (
                  <Badge
                    variant="highlight"
                    size="sm"
                    className="h-7 px-2.5 text-xs font-bold"
                  >
                    {labels.filters.selectedCount(activeFilterCount)}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-[13px]">
                {labels.filters.description}
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            aria-label={labels.filters.close}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe16a]/45"
            onClick={handleClose}
          >
            <X className="h-[22px] w-[22px]" aria-hidden="true" />
          </motion.button>
        </header>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <fieldset className={sectionClassName}>
            <legend className="sr-only">{labels.filters.price}</legend>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff7d9] text-[#b8860b]">
                <Banknote className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-navy">
                  {labels.filters.price}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {labels.filters.priceDescription}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                step={10000}
                label={labels.filters.minPrice}
                placeholder="0"
                rightIcon={<span className="text-xs font-bold">₫</span>}
                value={draft.minPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    minPrice: parsePrice(event.target.value),
                  }))
                }
                containerClassName="space-y-1.5"
                className="h-11 rounded-xl border-border/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              <Input
                type="number"
                min={0}
                step={10000}
                label={labels.filters.maxPrice}
                placeholder="500000"
                rightIcon={<span className="text-xs font-bold">₫</span>}
                value={draft.maxPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    maxPrice: parsePrice(event.target.value),
                  }))
                }
                containerClassName="space-y-1.5"
                className="h-11 rounded-xl border-border/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </fieldset>

          {(
            [
              ["characterCounts", labels.filters.characters, Users],
              ["charmCounts", labels.filters.charms, Sparkles],
            ] as const
          ).map(([key, title, Icon]) => (
            <fieldset key={key} className={sectionClassName}>
              <legend className="sr-only">{title}</legend>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf5fc] text-[#258fce]">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <h3 className="text-[15px] font-bold text-navy">{title}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-inset ring-[#e2ebf2]">
                {COUNT_OPTIONS.map((count) => {
                  const active = draft[key]?.includes(count) ?? false;
                  return (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={active}
                      className={`group relative flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transform-none ${
                        active
                          ? "border-[#91cdeb] bg-white text-[#167bb5] shadow-[0_8px_18px_-14px_rgba(37,143,206,0.75)]"
                          : "border-transparent bg-transparent text-slate-600 hover:-translate-y-px hover:bg-white hover:text-navy"
                      }`}
                      onClick={() => toggleCount(key, count)}
                    >
                      {active ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : null}
                      {countLabel(count)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {frameSizes.length > 0 ? (
            <fieldset className={sectionClassName}>
              <legend className="sr-only">{labels.filters.frameSize}</legend>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef1ff] text-[#6574c4]">
                  <Frame className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <h3 className="text-[15px] font-bold text-navy">
                  {labels.filters.frameSize}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {frameSizes.map((size) => {
                  const active = draft.frameSize === size.label;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={active}
                      className={`h-11 rounded-xl border px-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transform-none ${
                        active
                          ? "border-[#258fce] bg-[#eaf5fc] text-[#167bb5]"
                          : "border-[#dce8f1] bg-white text-slate-600 hover:-translate-y-px hover:border-[#9fcbe5] hover:bg-[#f4faff] hover:text-navy"
                      }`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          frameSize: active ? undefined : size.label,
                        }))
                      }
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <fieldset className={sectionClassName}>
            <legend className="sr-only">{labels.filters.flags}</legend>
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff1f2] text-[#e45c78]">
                <Gift className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-[15px] font-bold text-navy">
                {labels.filters.flags}
              </h3>
            </div>
            <div className="space-y-1.5">
              {(
                [
                  ["featured", labels.filters.featured],
                  ["isNew", labels.filters.isNew],
                  ["includedGift", labels.filters.includedGift],
                ] as const
              ).map(([key, label]) => (
                <Checkbox
                  key={key}
                  label={label}
                  checked={draft[key] === true}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.checked || undefined,
                    }))
                  }
                  containerClassName="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-inset ring-[#e2ebf2] transition-colors hover:bg-[#f4faff]"
                  className="shadow-none"
                />
              ))}
            </div>
          </fieldset>
        </div>

        <footer className="shrink-0 border-t border-[#dce8f1] bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-4px_12px_-10px_rgba(7,29,58,0.15)] backdrop-blur-xl sm:px-6">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] gap-2.5">
            <button
              type="button"
              className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-[13px] font-semibold text-[#17334f] ring-1 ring-inset ring-[#cfdde8] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4faff] hover:text-[#258fce] hover:ring-[#9fcbe5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] active:translate-y-0 motion-reduce:transform-none"
              onClick={() => {
                setDraft({});
                onReset();
              }}
            >
              <RotateCcw className="h-[17px] w-[17px] transition-transform duration-300 group-hover:-rotate-45" />
              <span>{labels.filters.reset}</span>
            </button>
            <button
              type="submit"
              className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#258fce] px-5 text-[13px] font-semibold text-white shadow-[0_12px_30px_-20px_rgba(37,143,206,0.95)] transition-all duration-300 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-[#1d7fb8] hover:before:translate-x-[430%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 active:translate-y-0 motion-reduce:transform-none motion-reduce:before:hidden"
            >
              <span className="relative z-10">{labels.filters.apply}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </footer>
      </form>
    </Drawer>
  );
}
