"use client";

import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

const sectionKeys = [
  ["collection", 2],
  ["purposes", 2],
  ["providers", 2],
  ["designs", 2],
  ["retention", 1],
  ["rights", 2],
  ["changes", 1],
] as const;

export default function PrivacyPolicyPage() {
  const { t } = useI18n();

  return (
    <section className="bg-[#f5f9fc] py-8 sm:py-12 lg:py-16">
      <Container size="narrow">
        <div className="overflow-hidden rounded-[24px] border border-[#dbe8f1] bg-white shadow-[0_24px_70px_-45px_rgba(16,37,63,0.32)] sm:rounded-[28px]">
          <header className="border-b border-[#dbe8f1] bg-gradient-to-br from-[#eef8fd] via-white to-[#fff9df] px-5 py-8 sm:px-10 sm:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2488c7]">
              Figure Lab
            </p>
            <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#10253f] sm:text-4xl">
              {t("privacyPolicy.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {t("privacyPolicy.description")}
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              {t("privacyPolicy.updatedAt")}
            </p>
          </header>

          <div className="space-y-8 px-5 py-8 sm:space-y-9 sm:px-10 sm:py-12">
            {sectionKeys.map(([section, paragraphCount]) => (
              <section key={section} aria-labelledby={`privacy-${section}`}>
                <h2
                  id={`privacy-${section}`}
                  className="break-words text-lg font-bold tracking-tight text-[#10253f] sm:text-xl"
                >
                  {t(`privacyPolicy.sections.${section}.title`)}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {Array.from({ length: paragraphCount }, (_, index) => (
                    <p key={index}>
                      {t(`privacyPolicy.sections.${section}.paragraph${index + 1}`, {
                        email: SITE.email,
                      })}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <div className="rounded-2xl border border-[#cfe5f3] bg-[#eef8fd] p-5 text-sm leading-7 text-slate-700">
              <p className="font-bold text-[#10253f]">{t("privacyPolicy.contactTitle")}</p>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-1 inline-flex break-all font-semibold text-[#197fc0] underline decoration-[#8fc9e9] underline-offset-4"
              >
                {SITE.email}
              </a>
            </div>

            <Link
              href={ROUTES.home}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#2488c7] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1976ae] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9def3] sm:w-auto"
            >
              {t("privacyPolicy.backHome")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
