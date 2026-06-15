import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StudioCanvas } from "@/components/studio/StudioCanvas";
import { StudioProvider } from "@/components/studio/StudioContext";
import { StudioStepper } from "@/components/studio/StudioStepper";
import { StudioRightPanel } from "@/components/studio/StudioRightPanel";

export default function StudioPage() {
  return (
    <StudioProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 72px)",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {/* ─── Top Bar ─── */}
        <div
          style={{
            padding: "16px 24px",
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          {/* Breadcrumb */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: 8,
              fontFamily: "var(--font-body)",
            }}
          >
            <Link
              href="/"
              style={{ color: "#6b7280", textDecoration: "none" }}
            >
              Trang chủ
            </Link>
            <ChevronRight style={{ width: 12, height: 12 }} />
            <span style={{ color: "#6b7280" }}>studio.design</span>
          </nav>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#111827",
                letterSpacing: "-0.02em",
                margin: 0,
                fontFamily: "var(--font-body)",
                lineHeight: 1.3,
              }}
            >
              Thiết kế & Mua hàng
            </h1>
            <StudioStepper />
          </div>
        </div>

        {/* ─── Main Content: Canvas + Right Panel ─── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
          }}
        >
          {/* Left: Canvas */}
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "#f4f5f7",
              minWidth: 0,
            }}
          >
            <StudioCanvas />
          </div>

          {/* Right: Dynamic Panel */}
          <StudioRightPanel />
        </div>

        {/* Mobile price bar */}
        <div
          style={{
            display: "none",
            padding: "12px 16px",
            background: "#fff",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
            fontSize: 13,
            color: "#9ca3af",
          }}
          className="md-hidden-override"
        >
          Xem chi tiết hóa đơn ở bảng bên phải
        </div>
      </div>
    </StudioProvider>
  );
}
