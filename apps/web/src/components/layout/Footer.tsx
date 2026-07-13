"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import type { ReactNode, SVGProps } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { FOOTER_LINK_GROUPS } from "@/config/routes";
import { SITE, SOCIAL_LINKS } from "@/config/site";
import { useI18n } from "@/lib/i18n/useI18n";

function TikTokGlyph(props: SVGProps<SVGSVGElement>) {
  const d =
    "M16.5 2h-3.1v13.2a2.9 2.9 0 1 1-2.06-2.78V9.3a5.9 5.9 0 1 0 5.16 5.86V8.62a7.9 7.9 0 0 0 4.56 1.45V6.98A4.86 4.86 0 0 1 16.5 2Z";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d={d} fill="#25F4EE" transform="translate(-0.6,0.6)" />
      <path d={d} fill="#FE2C55" transform="translate(0.6,-0.6)" />
      <path d={d} fill="#ffffff" />
    </svg>
  );
}

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3.25"
        y="3.25"
        width="17.5"
        height="17.5"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.35" cy="6.65" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.34 20.5v-7.02h2.37l.36-2.74h-2.73V9c0-.79.22-1.33 1.36-1.33h1.45V5.22c-.25-.03-1.11-.1-2.12-.1-2.1 0-3.54 1.28-3.54 3.64v2.03H8.1v2.74h2.39v7.02h2.85Z" />
    </svg>
  );
}

const SOCIAL_ITEMS = [
  {
    key: "instagram",
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    Icon: InstagramGlyph,
    background:
      "radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
    glow: "rgba(214,36,159,0.45)",
  },
  {
    key: "facebook",
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    Icon: FacebookGlyph,
    background: "#1877F2",
    glow: "rgba(24,119,242,0.45)",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    Icon: TikTokGlyph,
    background: "#000000",
    glow: "rgba(37,244,238,0.35)",
  },
] as const;

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center gap-2 text-left text-[15px] font-medium leading-none text-slate-600 transition-colors duration-200 hover:text-[#197fc0]"
    >
      <span className="relative inline-flex h-8 items-center">
        <span>{children}</span>

        <span className="pointer-events-none absolute -bottom-[2px] left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#2f91d0] via-[#5fc7ef] to-[#f6d76b] transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>

      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 text-[#f2c94c] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        strokeWidth={2.2}
      />
    </Link>
  );
}

function TitleBadge({ icon }: { icon: ReactNode }) {
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-[#2f91d0] [&>svg]:h-[22px] [&>svg]:w-[22px]">
      {icon}
    </span>
  );
}

function FooterColumn({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex w-full min-w-0 flex-col items-start text-left">
      <div className="mb-6 flex h-8 items-center gap-3">
        <TitleBadge icon={icon} />

        <h3 className="text-[20px] font-bold leading-none tracking-[-0.02em] text-navy">
          {title}
        </h3>
      </div>

      <nav className="grid justify-items-start gap-3.5" aria-label={title}>
        {children}
      </nav>
    </section>
  );
}

function ContactLine({
  href,
  icon,
  children,
}: {
  href?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const className =
    "group inline-flex w-fit items-start gap-2.5 text-left text-[15px] font-medium leading-none text-slate-600 transition-colors duration-200 hover:text-[#197fc0]";

  const content = (
    <>
      <span className="flex h-8 shrink-0 items-center text-[#2f91d0] transition-colors duration-200 group-hover:text-[#f2c94c]">
        {icon}
      </span>

      <span className="relative inline-flex min-h-8 items-center">
        <span className="leading-6">{children}</span>

        <span className="pointer-events-none absolute -bottom-[2px] left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#2f91d0] via-[#5fc7ef] to-[#f6d76b] transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export function Footer() {
  const { t } = useI18n();
  const phoneHref = SITE.phone.replace(/[^\d+]/g, "");

  return (
    <footer className="relative mt-10 w-full overflow-hidden border-t border-[#dbeaf4] bg-white text-navy">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#7bc7f0] via-[#2f91d0] to-[#f6d76b]" />

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div
          className="relative mx-auto w-full py-8 sm:py-10 lg:py-12"
          style={{ maxWidth: 1280 }}
        >
          <div className="mb-8 border-b border-[#dbeaf4] pb-6">
            <div className="flex flex-col items-start justify-between gap-5 text-left sm:flex-row sm:items-center">
              <BrandLogo />

              <div className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#dbeaf4] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#2f91d0] shadow-[0_12px_28px_-24px_rgba(18,45,78,0.35)]">
                <Sparkles className="h-3.5 w-3.5 text-[#f2c94c]" />
                {t("footer.badge")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.85fr_0.85fr_1.1fr] lg:gap-10 xl:gap-12">
            <FooterColumn title="Figure Lab" icon={<Sparkles strokeWidth={2.2} />}>
              <p className="max-w-[320px] text-left text-[15px] font-medium leading-7 text-slate-600">
                {t("footer.brandDescription")}
              </p>

              <div className="flex items-center justify-start gap-3 pt-1">
                {SOCIAL_ITEMS.map(({ key, label, href, Icon, background, glow }) => (
                  <Link
                    key={key}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform duration-200 hover:-translate-y-1"
                    style={{
                      background,
                      boxShadow: `0 10px 20px -8px ${glow}, inset 0 1px 1px rgba(255,255,255,0.35)`,
                    }}
                  >
                    <Icon className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                ))}
              </div>
            </FooterColumn>

            <FooterColumn title={t("footer.columns.explore")} icon={<Compass strokeWidth={2.2} />}>
              {FOOTER_LINK_GROUPS[0]?.links.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {t(`footer.links.${link.key}`)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.columns.support")} icon={<LifeBuoy strokeWidth={2.2} />}>
              {FOOTER_LINK_GROUPS[1]?.links.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {t(`footer.links.${link.key}`)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn
              title={t("footer.columns.contact")}
              icon={<MessageCircle strokeWidth={2.2} />}
            >
              <ContactLine
                href={`mailto:${SITE.email}`}
                icon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.9} />}
              >
                {SITE.email}
              </ContactLine>

              <ContactLine
                href={`tel:${phoneHref}`}
                icon={<Phone className="h-[18px] w-[18px]" strokeWidth={1.9} />}
              >
                {SITE.phone}
              </ContactLine>

              <ContactLine icon={<MapPin className="h-[18px] w-[18px]" strokeWidth={1.9} />}>
                {SITE.address}
              </ContactLine>
            </FooterColumn>
          </div>

          <div className="mt-9 flex items-center justify-center gap-2 border-t border-[#dbeaf4] pt-6 text-center text-sm font-medium text-slate-500">
            <span>{t("footer.copyright")}</span>
            <Sparkles className="h-4 w-4 text-[#f2c94c]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
