"use client";

import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { cn } from "@lego-shop/ui";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${SITE.name} home`}
      className={cn(
        "group inline-flex min-w-0 items-center no-underline ",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-visible",
          compact
            ? "h-[50px] w-[50px] sm:h-[54px] sm:w-[54px] lg:h-[58px] lg:w-[58px]"
            : "h-[58px] w-[58px] sm:h-[64px] sm:w-[64px] lg:h-[74px] lg:w-[74px]",
        )}
      >
        <Image
          src="/brand/figure-lab-logo.png"
          alt="Figure Lab logo"
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
          "min-w-0 whitespace-nowrap font-display font-semibold leading-none tracking-[-0.05em] text-[#2f91d0] transition-colors duration-200 group-hover:text-[#197fc0]",
          compact
            ? "text-[1.55rem] sm:text-[1.68rem] lg:text-[1.78rem]"
            : "text-[1.82rem] sm:text-[2rem] lg:text-[2.2rem]",
        )}
      >
        Figure Lab
      </span>
    </Link>
  );
}
