import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio thiết kế",
  description:
    "Cá nhân hóa khung tranh, nhân vật và phụ kiện tại Figure Lab Studio.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
