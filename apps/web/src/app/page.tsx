import Link from "next/link";
import { publicApiClient } from "@/lib/api/public-client";
import { ArrowRight, ChevronRight } from "lucide-react";

type HomeProduct = {
  id: string | number;
  name: string;
  subtitle?: string;
  category?: string;
  basePrice: number;
  pieces?: number;
  images: string[];
  badge?: string | null;
};

export const revalidate = 0;

// Fallback products with reliable images
const DEMO_PRODUCTS: HomeProduct[] = [
  {
    id: "1",
    name: "Classic Rangefinder",
    subtitle: "Bộ sưu tập máy ảnh retro",
    category: "Photography",
    basePrice: 290000,
    pieces: 342,
    images: [
      "https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?q=80&w=900&auto=format&fit=crop",
    ],
    badge: "Bán chạy",
  },
  {
    id: "2",
    name: "Modern Cabin",
    subtitle: "Nhà gỗ hiện đại",
    category: "Architecture",
    basePrice: 360000,
    pieces: 279,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    ],
    badge: null,
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Chọn khung mẫu",
    desc: "Duyệt bộ sưu tập các mẫu khung LEGO được thiết kế sẵn cho từng dịp đặc biệt.",
    icon: "🖼️",
  },
  {
    num: "02",
    title: "Tùy chỉnh theo ý",
    desc: "Thêm ảnh, nhân vật LEGO, phụ kiện và thông điệp cá nhân của bạn.",
    icon: "🎨",
  },
  {
    num: "03",
    title: "Nhận hàng tận nơi",
    desc: "Chúng tôi in và đóng gói cẩn thận, giao đến tận tay bạn trong 1–3 ngày.",
    icon: "📦",
  },
];

export default async function Home() {
  let apiProducts: HomeProduct[] = [];
  try {
    const prodRes = await publicApiClient.products.listProducts({ limit: 4, featured: true });
    apiProducts = prodRes.slice(0, 4);
  } catch {}

  const products = apiProducts.length > 0 ? apiProducts : DEMO_PRODUCTS;
  const heroImg =
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900&auto=format&fit=crop";
  const bigImg =
    products[0]?.images?.[0] ||
    "https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?q=80&w=900&auto=format&fit=crop";
  const smallImg =
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop";

  return (
    <main className="bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section
        className="bg-white"
        style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

            {/* LEFT — Text */}
            <div style={{ maxWidth: 440 }}>
              <h1
                style={{
                  fontSize: "clamp(2.6rem, 5vw, 4rem)",
                  fontWeight: 900,
                  lineHeight: 1.06,
                  letterSpacing: "-0.02em",
                  color: "#0f0f0f",
                  margin: "0 0 20px 0",
                }}
              >
                Turn Memories<br />
                Into{" "}
                <span style={{ color: "#2563eb", fontStyle: "italic" }}>Brick Art.</span>
              </h1>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: "0 0 28px 0",
                  maxWidth: 360,
                }}
              >
                Design premium, bespoke architectural models from your favorite
                moments. The sophistication of a modern meets combined with the
                big of laidback creation.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/studio"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13.5,
                    padding: "10px 20px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                >
                  Start Designing →
                </Link>
                <Link
                  href="/collection"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: 13.5,
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                  }}
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            {/* RIGHT — Hero image card */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ position: "relative" }}>
                {/* Image */}
                <div
                  style={{
                    width: 320,
                    height: 280,
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                    background: "#f3f4f6",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImg}
                    alt="Featured LEGO Model"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Floating badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: -40,
                    background: "#fff",
                    borderRadius: 16,
                    padding: "12px 16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    border: "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    zIndex: 10,
                    minWidth: 160,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#fbbf24",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🏠
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                      Precious Crafts
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                      {products[1]?.pieces || 279} Pieces
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED ARTWORKS
      ═══════════════════════════════════════ */}
      <section style={{ background: "#fff", borderTop: "1px solid #f3f4f6", padding: "72px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0f0f0f", margin: 0, letterSpacing: "-0.02em" }}>
                Featured Artworks
              </h2>
              <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                Curated selections of what you can build.
              </p>
            </div>
            <Link
              href="/collection"
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}
            >
              View Gallery <ChevronRight size={14} />
            </Link>
          </div>

          {/* Grid: big left + right column */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 420 }}>

            {/* Big left card */}
            <Link
              href="/studio"
              style={{
                display: "block",
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                background: "#111",
                textDecoration: "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bigImg}
                alt={products[0]?.name || "Featured"}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px" }}>
                {products[0]?.badge && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "#2563eb",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 6,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {products[0].badge}
                  </span>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 4px 0" }}>
                  {products[0]?.name || "Classic Rangefinder"}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 6px 0" }}>
                  {products[0]?.subtitle || products[0]?.category || "Bộ sưu tập nổi bật"}
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, margin: 0 }}>
                  {products[0]?.pieces || 342} lượt đặt hàng
                </p>
              </div>
            </Link>

            {/* Right column */}
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>

              {/* Top: image card */}
              <Link
                href="/studio"
                style={{
                  display: "block",
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#f3f4f6",
                  textDecoration: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={smallImg}
                  alt={products[1]?.name || "Modern Cabin"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>
                    {products[1]?.name || "Modern Cabin"}
                  </h3>
                </div>
              </Link>

              {/* Bottom: CTA card */}
              <div
                style={{
                  borderRadius: 20,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 24,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 900, color: "#111827", margin: "0 0 6px 0" }}>
                  Your Design Here
                </p>
                <Link
                  href="/studio"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  Last Catalog <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section style={{ background: "#f9fafb", borderTop: "1px solid #f3f4f6", padding: "80px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>
              — Quy trình đơn giản
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f0f0f", margin: 0, letterSpacing: "-0.02em" }}>
              Tạo quà trong 3 bước
            </h2>
          </div>

          {/* 3 Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, position: "relative" }}>

            {/* Connector line behind cards */}
            <div
              style={{
                position: "absolute",
                top: 52,
                left: "calc(16.67% + 20px)",
                right: "calc(16.67% + 20px)",
                height: 1,
                background: "#e5e7eb",
                zIndex: 0,
              }}
            />

            {HOW_STEPS.map((step, idx) => (
              <div
                key={step.num}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 20,
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Step number + Icon row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#2563eb",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#f0f5ff",
                      border: "1px solid #dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Text */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>

                {/* Arrow connector between cards */}
                {idx < 2 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 52,
                      right: -14,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link
              href="/studio"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13.5,
                padding: "13px 32px",
                borderRadius: 50,
                textDecoration: "none",
              }}
            >
              Bắt đầu thiết kế ngay →
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          KHUNG GALLERY — NEW COLLECTION
      ═══════════════════════════════════════ */}
      <section style={{ background: "#fff", borderTop: "1px solid #f3f4f6", padding: "72px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>
                — New Collection
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0f0f0f", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                Khung Gallery
              </h2>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0, maxWidth: 320, lineHeight: 1.6 }}>
                Bộ sưu tập khung trang trí nghệ thuật, tinh tế và sang trọng cho không gian sống của bạn.
              </p>
            </div>
            <Link
              href="/collection"
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "#111827",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
                marginTop: 4,
                borderBottom: "1px solid #111827",
                paddingBottom: 2,
              }}
            >
              Khám phá tất cả Gallery →
            </Link>
          </div>

          {/* 4-column image grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              {
                img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
                name: "Gallery 1",
                tag: "Minimalist Art",
              },
              {
                img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=600&auto=format&fit=crop",
                name: "Gallery 2",
                tag: "Minimalist Art",
              },
              {
                img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop",
                name: "Gallery 3",
                tag: "Minimalist Art",
              },
              {
                img: "https://images.unsplash.com/photo-1524117074681-31bd4de22ad3?q=80&w=600&auto=format&fit=crop",
                name: "Gallery 4",
                tag: "Minimalist Art",
              },
            ].map((item) => (
              <Link
                key={item.name}
                href="/collection"
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#f3f4f6",
                    aspectRatio: "4/3",
                    position: "relative",
                    marginBottom: 14,
                    transition: "transform 0.2s",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div style={{ paddingLeft: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 4px 0" }}>{item.name}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, fontStyle: "italic" }}>
                    {item.tag}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BỘ SƯU TẬP NỔI BẬT
      ═══════════════════════════════════════ */}
      <section style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6", padding: "72px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Centered header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f0f0f", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
              Bộ sưu tập nổi bật (LEGO)
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Đã có hơn 1.500 lượt đặt hàng trên toàn hệ thống
            </p>
          </div>

          {/* 4-col product cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 36 }}>
            {[
              {
                img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=600&auto=format&fit=crop",
                name: "Happy Birthday 1",
                sub: "Thiết kế độc bản",
              },
              {
                img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop",
                name: "Merry Christmas",
                sub: "Thiết kế độc bản",
              },
              {
                img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop",
                name: "Merry Christmas 2",
                sub: "Thiết kế độc bản",
              },
              {
                img: "https://images.unsplash.com/photo-1524117074681-31bd4de22ad3?q=80&w=600&auto=format&fit=crop",
                name: "Ronaldo",
                sub: "Thiết kế độc bản",
              },
            ].map((p) => (
              <Link
                key={p.name}
                href="/studio"
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Badge */}
                  <div style={{ position: "relative" }}>
                    <div style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.img}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: 6,
                        letterSpacing: "0.05em",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      ✦ Tùy chỉnh
                    </span>
                  </div>
                  <div style={{ padding: "14px 16px 16px" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 4px 0" }}>{p.name}</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                      {p.sub}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center" }}>
            <Link
              href="/collection"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid #111827",
                color: "#111827",
                fontWeight: 600,
                fontSize: 13.5,
                padding: "13px 36px",
                borderRadius: 50,
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              XEM TẤT CẢ BỘ SƯU TẬP
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          OUR FEEDBACKS
      ═══════════════════════════════════════ */}
      <section style={{ background: "#fff", borderTop: "1px solid #f3f4f6", padding: "72px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", marginBottom: 36 }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f0f0f", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
              Our feedbacks
            </h2>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.18em", margin: 0 }}>
              Khách hàng nói gì về The Luvin
            </p>
          </div>
        </div>

        {/* Horizontal scroll strip — centered on wide screens */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              justifyContent: "center",
              flexWrap: "wrap",
              paddingBottom: 12,
              scrollbarWidth: "none",
              msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"],
            }}
          >
          {[
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1524117074681-31bd4de22ad3?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop",
          ].map((img, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 200,
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
                background: "#f3f4f6",
                aspectRatio: "3/4",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Feedback ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* Watermark overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 12px",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.65)",
                    fontStyle: "italic",
                    fontFamily: "serif",
                    textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Feedback
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#e11d48",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    background: "rgba(255,255,255,0.85)",
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  THE LUVIN
                </span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

    </main>
  );
}
