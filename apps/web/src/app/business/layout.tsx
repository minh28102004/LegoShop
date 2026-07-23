import type { Metadata } from "next";
import { vi } from "@/lib/i18n/dictionaries/vi";

export const metadata: Metadata = {
  title: vi.metadata.business.title,
  description: vi.metadata.business.description,
};

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
