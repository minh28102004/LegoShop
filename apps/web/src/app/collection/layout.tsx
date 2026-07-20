import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bộ sưu tập | Figure Lab",
  description:
    "Khám phá mẫu quà cá nhân hóa, tạo nhân vật và chọn thành phần tại Figure Lab.",
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
