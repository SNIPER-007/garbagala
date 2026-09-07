import React from "react";

interface FestiveDividerProps {
  className?: string;
}

export default function FestiveDivider({ className = "" }: FestiveDividerProps) {
  return (
    <div className={`relative flex items-center justify-center my-8 ${className}`}>
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#F7B731]/30 to-transparent" />
      <div className="px-4 flex items-center gap-2 text-[#F7B731]">
        <span className="text-xs opacity-70">✦</span>
        <div className="w-6 h-6 rounded-full bg-[#FF9F1C]/10 border border-[#F7B731]/40 flex items-center justify-center text-[10px] text-[#F7B731] font-bold shadow-[0_0_12px_rgba(247,183,49,0.3)]">
          ❖
        </div>
        <span className="text-xs opacity-70">✦</span>
      </div>
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#F7B731]/30 to-transparent" />
    </div>
  );
}
