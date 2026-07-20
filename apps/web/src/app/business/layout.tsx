import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quà tặng doanh nghiệp",
  description:
    "Giải pháp quà tặng doanh nghiệp cá nhân hóa, duyệt mẫu trước và hỗ trợ số lượng lớn từ Figure Lab.",
};

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
