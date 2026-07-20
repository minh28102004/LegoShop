"use client";

import type { FrameSize } from "@lego-shop/shared";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import type { CollectionTranslations } from "@/modules/collection/data/collection.translations";
import type { CollectionFilters } from "@/modules/collection/types/collection.types";

type CollectionFilterDrawerProps = {
  filters: CollectionFilters;
  frameSizes: FrameSize[];
  isOpen: boolean;
  labels: CollectionTranslations;
  onApply: (filters: CollectionFilters) => void;
  onClose: () => void;
  onReset: () => void;
};

const COUNT_OPTIONS = [1, 2, 3] as const;

function parsePrice(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed)
    : undefined;
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

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      position="right"
      size="md"
      overlayClassName="!bg-[rgba(7,15,28,0.64)] backdrop-blur-[2px]"
      className="!top-0 !right-0 !bottom-0 !left-auto !h-dvh !w-[min(24rem,calc(100vw-0.75rem))] !overflow-hidden rounded-l-[28px] border-l border-slate-200/80 bg-white shadow-[0_24px_70px_-30px_rgba(7,15,28,0.45)]"
      contentClassName="!overflow-hidden"
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
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/70 pb-5">
          <div>
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-primary-light text-primary-dark">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-[-0.02em] text-navy">
              {labels.filters.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              {labels.filters.description}
            </p>
          </div>
          <button
            type="button"
            aria-label={labels.filters.close}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto py-6 pr-1">
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-navy">
              {labels.filters.price}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                step={10000}
                label={labels.filters.minPrice}
                value={draft.minPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    minPrice: parsePrice(event.target.value),
                  }))
                }
                className="rounded-xl border-border/80 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              <Input
                type="number"
                min={0}
                step={10000}
                label={labels.filters.maxPrice}
                value={draft.maxPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    maxPrice: parsePrice(event.target.value),
                  }))
                }
                className="rounded-xl border-border/80 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </fieldset>

          {(
            [
              ["characterCounts", labels.filters.characters],
              ["charmCounts", labels.filters.charms],
            ] as const
          ).map(([key, title]) => (
            <fieldset key={key}>
              <legend className="mb-3 text-sm font-bold text-navy">
                {title}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {COUNT_OPTIONS.map((count) => {
                  const active = draft[key]?.includes(count) ?? false;
                  return (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={active}
                      className={`h-10 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-border/80 bg-white text-slate-600 hover:border-primary/30 hover:bg-primary-light/35 hover:text-primary-dark"
                      }`}
                      onClick={() => toggleCount(key, count)}
                    >
                      {countLabel(count)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-navy">
              {labels.filters.status}
            </legend>
            <div className="space-y-3">
              {(
                [
                  ["active", labels.filters.statusActive],
                  ["inactive", labels.filters.statusInactive],
                  ["draft", labels.filters.statusDraft],
                ] as const
              ).map(([value, label]) => (
                <Checkbox
                  key={value}
                  label={label}
                  checked={draft.statuses?.includes(value) ?? false}
                  onChange={(event) =>
                    setDraft((current) => {
                      const statuses = current.statuses ?? [];
                      const nextStatuses = event.target.checked
                        ? [...statuses, value]
                        : statuses.filter((status) => status !== value);

                      return {
                        ...current,
                        statuses:
                          nextStatuses.length > 0 ? nextStatuses : undefined,
                      };
                    })
                  }
                  className="shadow-none"
                />
              ))}
            </div>
          </fieldset>

          {frameSizes.length > 0 ? (
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-navy">
                {labels.filters.frameSize}
              </legend>
              <div className="flex flex-wrap gap-2">
                {frameSizes.map((size) => {
                  const active = draft.frameSize === size.label;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={active}
                      className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-border/80 bg-white text-slate-600 hover:border-primary/30 hover:text-primary-dark"
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

          <fieldset className="space-y-4">
            <legend className="mb-3 text-sm font-bold text-navy">
              {labels.filters.flags}
            </legend>
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
                className="shadow-none"
              />
            ))}
          </fieldset>
        </div>

        <div className="-mx-6 grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-border/70 bg-white/95 px-6 pb-1 pt-5 backdrop-blur">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-primary/25 hover:bg-primary-light/30 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            onClick={() => {
              setDraft({});
              onReset();
            }}
          >
            <RotateCcw className="h-4 w-4" />
            {labels.filters.reset}
          </button>
          <button
            type="submit"
            className="h-12 rounded-2xl bg-primary px-5 text-sm font-bold text-white transition-all hover:-translate-y-px hover:bg-primary-dark hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 active:translate-y-0 motion-reduce:transform-none"
          >
            {labels.filters.apply}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
