import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@lego-shop/ui";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  eyebrow?: string;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function SectionHeader({
  align = "left",
  className,
  cta,
  eyebrow,
  subtitle,
  title,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "items-center text-center"
          : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-primary-dark sm:text-[14px]">
          {eyebrow}
        </p>
      ) : null}
      <div className={cn("space-y-4", align === "center" && "max-w-[820px]")}>
        <h2 className="text-balance font-display text-[clamp(1.875rem,7.6vw,2.125rem)] font-[650] leading-[1.2] tracking-[-0.012em] text-navy sm:text-[clamp(2.125rem,4vw,2.5rem)] lg:text-[clamp(2.375rem,3.1vw,2.75rem)] lg:leading-[1.18] lg:tracking-[-0.016em]">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-[15px] leading-[1.7] text-text-secondary sm:text-[16px] lg:text-[17px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {cta ? (
        <Link
          href={cta.href}
          className="group inline-flex items-center gap-2 text-[15px] font-semibold text-primary-dark no-underline transition-colors hover:text-primary sm:text-[16px]"
        >
          {cta.label}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
        </Link>
      ) : null}
    </header>
  );
}
