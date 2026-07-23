"use client";

import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect";

type MultiSelectOption = {
  value: string;
  label: string;
};

type StudioSearchableMultiSelectProps = {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  searchPlaceholder: string;
  emptyLabel: string;
  clearLabel: string;
};

export function StudioSearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  searchPlaceholder,
  emptyLabel,
  clearLabel,
}: StudioSearchableMultiSelectProps) {
  return (
    <SearchableMultiSelect
      ariaLabel={label}
      clearLabel={clearLabel}
      emptyLabel={emptyLabel}
      options={options}
      placeholder={label}
      searchPlaceholder={searchPlaceholder}
      values={value}
      onChange={onChange}
      className="w-full"
    />
  );
}
