import { vi } from "@/lib/i18n/dictionaries/vi";

export const metadata = {
  title: vi.metadata.orderTracking.title,
  description: vi.metadata.orderTracking.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
