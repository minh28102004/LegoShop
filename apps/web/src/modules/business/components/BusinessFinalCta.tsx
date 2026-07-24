import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

type BusinessFinalCtaProps = {
  copy: BusinessPageCopy["finalCta"];
};

export function BusinessFinalCta({ copy }: BusinessFinalCtaProps) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <Container size="wide">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[30px] bg-[#071d3a] px-6 py-9 text-white sm:px-10 lg:px-14 lg:py-11">
            <div className="pointer-events-none absolute -right-10 -top-16 size-72 rounded-full bg-[#147fbd]/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 left-[32%] size-72 rounded-full bg-[#f6d76b]/15 blur-3xl" />
            <Image src={DECORATIVE_ICON_PATHS.wrappedGift} alt="" width={96} height={96} className="pointer-events-none absolute bottom-5 right-8 hidden size-24 rotate-6 object-contain opacity-90 sm:block lg:right-12" />

            <div className="relative max-w-3xl">
              <p className="text-xs font-bold tracking-[0.2em] text-[#f6d76b] sm:text-sm">{copy.eyebrow}</p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{copy.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{copy.description}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-[#f6d76b] px-7 text-[#071d3a] hover:bg-[#ffe48b]">
                  <Link href="#business-consultation">
                    {copy.primaryCta}
                    <ArrowDownRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white">
                  <Link href={ROUTES.collection}>
                    {copy.secondaryCta}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
