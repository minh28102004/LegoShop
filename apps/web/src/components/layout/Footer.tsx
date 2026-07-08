import Link from 'next/link'

import { BrandLogo } from '@/components/layout/BrandLogo'
import { PageContainer } from '@/components/layout/PageContainer'
import { FOOTER_LINKS } from '@/config/routes'
import { SITE, SOCIAL_LINKS } from '@/config/site'

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-[linear-gradient(180deg,rgba(245,248,252,0.82)_0%,#ffffff_100%)]">
      <PageContainer className="py-6 pt-12">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] xl:gap-9">
          <div className="grid gap-3.5">
            <BrandLogo compact />
            <p className="max-w-[290px] text-sm leading-7 text-muted">
              © 2026 Figure Lab. Quà tặng cá nhân hóa tinh tế cho những khoảnh
              khắc đáng nhớ.
            </p>
            <p className="max-w-[290px] text-sm leading-7 text-muted">
              {SITE.twitterHandle}
            </p>
          </div>

          <div className="grid gap-3.5">
            <h3 className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-navy">
              Khám phá
            </h3>
            <div className="grid gap-3">
              {FOOTER_LINKS[0]?.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm leading-6 text-muted hover:text-primary-dark">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3.5">
            <h3 className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-navy">
              Hỗ trợ
            </h3>
            <div className="grid gap-3">
              {FOOTER_LINKS[1]?.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm leading-6 text-muted hover:text-primary-dark">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3.5">
            <h3 className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-navy">
              Kết nối
            </h3>
            <div className="grid gap-3">
              <Link href={SOCIAL_LINKS.instagram} className="text-sm leading-6 text-muted hover:text-primary-dark">
                Instagram
              </Link>
              <Link href={SOCIAL_LINKS.facebook} className="text-sm leading-6 text-muted hover:text-primary-dark">
                Facebook
              </Link>
              <Link href={SOCIAL_LINKS.tiktok} className="text-sm leading-6 text-muted hover:text-primary-dark">
                TikTok
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4 text-sm leading-6 text-muted">
          {SITE.email} · {SITE.phone} · {SITE.address}
        </div>
      </PageContainer>
    </footer>
  )
}
