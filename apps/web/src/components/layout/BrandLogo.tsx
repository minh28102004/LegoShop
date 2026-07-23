"use client";

import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/config/routes";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@lego-shop/ui";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  const { dictionary } = useI18n();

  return (
    <Link
      href={ROUTES.home}
      aria-label={dictionary.common.brandHomeLabel}
      className={cn(
        "group inline-flex min-w-0 items-center no-underline ",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-visible",
          compact
            ? "h-[50px] w-[50px] max-[430px]:h-[42px] max-[430px]:w-[42px] sm:h-[54px] sm:w-[54px] lg:h-[50px] lg:w-[50px] xl:h-[58px] xl:w-[58px]"
            : "h-[52px] w-[52px] max-[430px]:h-[42px] max-[430px]:w-[42px] sm:h-[58px] sm:w-[58px] lg:h-[52px] lg:w-[52px] xl:h-[62px] xl:w-[62px]",
        )}
      >
        <Image
          src="/brand/figure-lab-logo.png"
          alt={dictionary.common.brandLogoAlt}
          width={112}
          height={112}
          sizes="(max-width: 640px) 58px, (max-width: 1024px) 64px, 70px"
          priority
          quality={100}
          className="block h-full w-full scale-[1.08] object-contain transition-transform duration-200 group-hover:scale-[1.12]"
        />
      </span>

      <span
        className={cn(
          "min-w-0 whitespace-nowrap font-display font-semibold leading-none tracking-[-0.018em] text-[#2f91d0] transition-colors duration-200 group-hover:text-[#197fc0]",
          compact
            ? "text-[1.55rem] max-[430px]:text-[1.35rem] sm:text-[1.68rem] lg:text-[1.7rem] xl:text-[1.8rem]"
            : "text-[1.72rem] max-[430px]:text-[1.35rem] sm:text-[1.86rem] lg:text-[1.75rem] xl:text-[1.9rem]",
        )}
      >
        {dictionary.common.brandName}
      </span>
    </Link>
  );
}
