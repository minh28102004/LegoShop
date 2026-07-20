"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { CollectionTranslations } from "@/modules/collection/data/collection.translations";

type CollectionPaginationProps = {
  labels: CollectionTranslations;
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

function pageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const values = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...values]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((value, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous > 1) result.push("ellipsis");
    result.push(value);
  });

  return result;
}

export function CollectionPagination({
  labels,
  onChange,
  page,
  totalPages,
}: CollectionPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={labels.page(page, totalPages)}
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        aria-label={labels.previous}
        disabled={page <= 1}
        className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white text-navy transition-colors hover:border-primary/30 hover:bg-primary-light/40 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="grid h-11 w-8 place-items-center text-sm text-text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            className={`grid h-11 min-w-11 place-items-center rounded-full border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              item === page
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-navy hover:border-primary/30 hover:bg-primary-light/40"
            }`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label={labels.next}
        disabled={page >= totalPages}
        className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white text-navy transition-colors hover:border-primary/30 hover:bg-primary-light/40 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
