"use client";

import React, { useState } from "react";
import { Star, Award, Sparkles, Heart } from "lucide-react";

export type SponsorSlot = {
  id: string;
  category: "Title Sponsor" | "Strategic Event Partner" | "Powered By" | "Media Partner";
  title: string;
  subtitle?: string;
  logoSrc: string;
  icon: React.ElementType;
  accentColor: string;
  bgGradient: string;
};

const SPONSORS: SponsorSlot[] = [
  {
    id: "title-sponsor",
    category: "Title Sponsor",
    title: "Green Space IPC Real Estate Advisory",
    subtitle: "Official Title Sponsor",
    logoSrc: "/sponsors/title-sponsor.png",
    icon: Star,
    accentColor: "border-[#F7B731] text-[#F7B731]",
    bgGradient: "from-[#F7B731]/20 via-[#FF9F1C]/10 to-transparent",
  },
  {
    id: "strategic-partner",
    category: "Strategic Event Partner",
    title: "Natyam Garba by Pooja Dedhia",
    subtitle: "Strategic Event Partner",
    logoSrc: "/sponsors/strategic-event.jpg",
    icon: Award,
    accentColor: "border-[#FF9F1C] text-[#FF9F1C]",
    bgGradient: "from-[#FF9F1C]/20 via-[#E03616]/10 to-transparent",
  },
  {
    id: "powered-by",
    category: "Powered By",
    title: "Zen Scientific Pvt Ltd",
    subtitle: "By Dhaval Thakkar",
    logoSrc: "/sponsors/powered-by.jpeg",
    icon: Sparkles,
    accentColor: "border-[#10B981] text-[#10B981]",
    bgGradient: "from-[#10B981]/20 via-[#059669]/10 to-transparent",
  },
  {
    id: "media-partner",
    category: "Media Partner",
    title: "GurjarBhoomi",
    subtitle: "Official Media Partner",
    logoSrc: "/sponsors/media-partner.jpeg",
    icon: Heart,
    accentColor: "border-[#3B82F6] text-[#3B82F6]",
    bgGradient: "from-[#3B82F6]/20 via-[#2563EB]/10 to-transparent",
  },
];

export default function SponsorsSection() {
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="sponsors" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#272435]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(255,159,28,0.2)]">
          OUR SPONSORS & PARTNERS
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
          Presented In Association With
        </h2>
        <p className="text-sm text-[#8E8A9F] mt-2">
          Garba Gala 2026 is proudly supported by our esteemed partners and sponsors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SPONSORS.map((sponsor) => {
          const Icon = sponsor.icon;
          const hasImageError = imageErrorMap[sponsor.id];

          return (
            <div
              key={sponsor.id}
              className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all flex flex-col items-center justify-between text-center group relative overflow-hidden shadow-xl"
            >
              {/* Category Header */}
              <div className="w-full pb-3 border-b border-[#272435]/60 mb-4 flex items-center justify-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${sponsor.accentColor.split(" ")[1]}`} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E8A9F]">
                  {sponsor.category}
                </span>
              </div>

              {/* Logo / Image Container */}
              <div className="w-full h-24 flex items-center justify-center p-2 rounded-xl bg-[#0A090D]/80 border border-[#272435] my-2 group-hover:scale-105 transition-transform">
                {!hasImageError ? (
                  <img
                    src={sponsor.logoSrc}
                    alt={sponsor.title}
                    onError={() => handleImageError(sponsor.id)}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Icon className={`w-6 h-6 ${sponsor.accentColor.split(" ")[1]}`} />
                    <span className="text-xs font-extrabold text-white font-heading">
                      {sponsor.title.split(" ")[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="pt-3 space-y-1 w-full">
                <h3 className="text-sm font-extrabold text-white font-heading group-hover:text-[#F7B731] transition-colors line-clamp-2">
                  {sponsor.title}
                </h3>
                {sponsor.subtitle && (
                  <p className="text-[11px] font-semibold text-[#8E8A9F]">
                    {sponsor.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
