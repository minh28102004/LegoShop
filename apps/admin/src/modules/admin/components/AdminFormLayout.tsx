import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/common/utils/cn";

export type AdminFormFieldSpan = 3 | 4 | 5 | 6 | 7 | 8 | 12;

const FIELD_SPAN_CLASS: Record<AdminFormFieldSpan, string> = {
  3: "col-span-12 md:col-span-6 xl:col-span-3",
  4: "col-span-12 md:col-span-6 xl:col-span-4",
  5: "col-span-12 lg:col-span-5",
  6: "col-span-12 md:col-span-6",
  7: "col-span-12 lg:col-span-7",
  8: "col-span-12 lg:col-span-8",
  12: "col-span-12",
};

type FormGridProps = PropsWithChildren<{ className?: string }>;
type FormFieldProps = PropsWithChildren<{
  className?: string;
  span?: AdminFormFieldSpan;
}>;
type FormSectionProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  title?: ReactNode;
}>;

export function FormGrid({ className, children }: FormGridProps) {
  return (
    <div className={cn("grid grid-cols-12 gap-x-6 gap-y-5", className)}>
      {children}
    </div>
  );
}

export function FormField({ className, children, span = 12 }: FormFieldProps) {
  return (
    <div className={cn("min-w-0", FIELD_SPAN_CLASS[span], className)}>
      {children}
    </div>
  );
}

export function FormSection({
  className,
  contentClassName,
  children,
  description,
  title,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-sky-100 bg-white p-5 sm:p-6",
        className,
      )}
    >
      {title || description ? (
        <header className="mb-5 border-b border-slate-100 pb-4">
          {title ? (
            <h4 className="text-base font-bold leading-6 text-slate-900">
              {title}
            </h4>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}

      <div className={contentClassName}>{children}</div>
    </section>
  );
}
