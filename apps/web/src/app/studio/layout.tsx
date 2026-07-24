import type { Metadata } from "next";
import { vi } from "@/lib/i18n/dictionaries/vi";

export const metadata: Metadata = {
  title: vi.metadata.studio.title,
  description: vi.metadata.studio.description,
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
