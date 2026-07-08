"use client";

import { useState } from "react";
import { LayoutTemplate, Image as ImageIcon, Type, Puzzle } from "lucide-react";
import { useStudio } from "./StudioContext";

export function StudioSidebar() {
  const [activeTab, setActiveTab] = useState("templates");
  const { activeTemplate, setActiveTemplate, addElement, templates } = useStudio();

  const TABS = [
    { id: "templates", icon: LayoutTemplate, label: "Mẫu" },
    { id: "uploads", icon: ImageIcon, label: "Tải lên" },
    { id: "text", icon: Type, label: "Văn bản" },
    { id: "accessories", icon: Puzzle, label: "Phụ kiện" },
  ];

  const handleAddText = (type: 'title' | 'body') => {
    addElement({
      type: "text",
      content: type === 'title' ? "Tiêu đề của bạn" : "Thêm nội dung văn bản vào đây",
      x: 100,
      y: 100,
      fontSize: type === 'title' ? 32 : 16,
      color: "#000000"
    });
  };

  const handleAddAccessory = (emoji: string) => {
    addElement({
      type: "accessory",
      content: emoji,
      x: 150,
      y: 150,
      fontSize: 64
    });
  };

  const STICKERS = ["🧸", "🎀", "💖", "✨", "🎈", "🎁", "🎉", "👑", "🌺"];

  return (
    <div className="w-80 border-r bg-white h-full flex flex-col z-20">
      <div className="flex border-b">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-red-600 border-b-2 border-red-600 bg-red-50/50" : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "templates" && (
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <div 
                key={t.id} 
                onClick={() => setActiveTemplate(t.id)}
                className={`aspect-square rounded-lg border-2 cursor-pointer flex items-center justify-center font-bold transition-all ${
                  activeTemplate === t.id ? "border-red-500 bg-red-50 text-red-600" : "bg-zinc-100 border-transparent hover:border-red-200"
                }`}
              >
                Mẫu {t.id}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === "uploads" && (
          <div className="flex flex-col gap-4">
            <button className="w-full py-3 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-500 font-medium hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Tải ảnh lên
            </button>
            <p className="text-xs text-zinc-400 text-center">Hỗ trợ JPG, PNG. Tối đa 5MB.</p>
          </div>
        )}

        {activeTab === "text" && (
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleAddText('title')}
              className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
            >
              + Thêm tiêu đề
            </button>
            <button 
              onClick={() => handleAddText('body')}
              className="w-full py-3 bg-zinc-100 text-zinc-900 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
            >
              + Thêm nội dung
            </button>
          </div>
        )}

        {activeTab === "accessories" && (
          <div className="grid grid-cols-3 gap-2">
            {STICKERS.map((sticker, i) => (
              <div 
                key={i} 
                onClick={() => handleAddAccessory(sticker)}
                className="aspect-square bg-zinc-100 rounded-lg border border-zinc-200 hover:border-red-500 cursor-pointer flex items-center justify-center text-3xl transition-transform hover:scale-110"
              >
                {sticker}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
