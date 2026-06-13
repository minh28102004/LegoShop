import { StudioCanvas } from "@/components/studio/StudioCanvas";
import { StudioProvider } from "@/components/studio/StudioContext";
import { StudioStepper } from "@/components/studio/StudioStepper";
import { StudioRightPanel } from "@/components/studio/StudioRightPanel";

export default function StudioPage() {
  return (
    <StudioProvider>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-zinc-50">
        <div className="px-8 py-4 bg-white border-b">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Thiết kế & Mua hàng</h1>
          <StudioStepper />
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Canvas Area */}
          <div className="flex-1 relative flex flex-col">
            <h2 className="absolute top-4 left-6 text-sm font-bold uppercase tracking-wider text-zinc-500 z-10">Ảnh xem trước</h2>
            <StudioCanvas />
          </div>
          
          {/* Right: Dynamic Panel based on step */}
          <StudioRightPanel />
        </div>
      </div>
    </StudioProvider>
  );
}
