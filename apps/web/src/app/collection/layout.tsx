import type { Metadata } from "next";
import { vi } from "@/lib/i18n/dictionaries/vi";

export const metadata: Metadata = {
  title: vi.metadata.collection.title,
  description: vi.metadata.collection.description,
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
