"use client";

import Link from "next/link";

import { Button } from "@/components/ui";
import { Container } from "@/components/layout/Container";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/lib/i18n/useI18n";

export default function NotFound() {
  const { dictionary } = useI18n();
  const copy = dictionary.notFound;

  return (
    <section className="min-h-[70dvh] bg-background py-24">
      <Container size="lg">
        <div className="mx-auto flex max-w-content flex-col items-center text-center">
          <p className="text-body-sm font-semibold uppercase tracking-wide text-primary">
            404
          </p>
          <h1 className="mt-4 text-display-lg text-text-primary">
            {copy.title}
          </h1>
          <p className="mt-4 text-body-lg text-text-secondary">
            {copy.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.home}>{copy.home}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.collections}>{copy.collection}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
