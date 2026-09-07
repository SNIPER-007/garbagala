import React from "react";
import { ShieldCheck, Award, Star, Heart, Flame, Sparkles } from "lucide-react";

export type SponsorSlot = {
  id: string;
  category: "Title Sponsor" | "Co-Sponsor" | "Associate Partner" | "Beverage Partner" | "Media Partner" | "Ticketing Partner";
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
};

const SPONSORS: SponsorSlot[] = [
  {
    id: "sp-1",
    category: "Title Sponsor",
    title: "Official Title Sponsor",
    subtitle: "Garba Gala 2026 Season Partner",
    icon: Star,
    accentColor: "border-[#F7B731] text-[#F7B731]",
  },
  {
    id: "sp-2",
    category: "Co-Sponsor",
    title: "Co-Presenting Partner",
    subtitle: "Festive Celebration Sponsor",
    icon: Award,
    accentColor: "border-[#FF9F1C] text-[#FF9F1C]",
  },
  {
    id: "sp-3",
    category: "Associate Partner",
    title: "Associate Partner",
    subtitle: "Venue & Hospitality Partner",
    icon: Sparkles,
    accentColor: "border-[#E03616] text-[#E03616]",
  },
  {
    id: "sp-4",
    category: "Beverage Partner",
    title: "Refreshment Partner",
    subtitle: "Official Food & Beverage Partner",
    icon: Flame,
    accentColor: "border-[#10B981] text-[#10B981]",
  },
  {
    id: "sp-5",
    category: "Media Partner",
    title: "Official Media Partner",
    subtitle: "Digital & Broadcast Partner",
    icon: Heart,
    accentColor: "border-[#3B82F6] text-[#3B82F6]",
  },
  {
    id: "sp-6",
    category: "Ticketing Partner",
    title: "Official Ticketing Partner",
    subtitle: "Powered by Garba Gala Passes",
    icon: ShieldCheck,
    accentColor: "border-[#8B5CF6] text-[#8B5CF6]",
  },
];

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#272435]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(255,159,28,0.2)]">
          OUR PARTNERS
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
          Sponsors & Partners
        </h2>
        <p className="text-sm text-[#8E8A9F] mt-2">
          Garba Gala 2026 is proudly supported by our event partners and youth organisations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {SPONSORS.map((sponsor) => {
          const Icon = sponsor.icon;
          return (
            <div
              key={sponsor.id}
              className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              {/* Logo Emblem Container */}
              <div className={`w-16 h-16 rounded-2xl bg-[#0A090D] border-2 ${sponsor.accentColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E8A9F] mb-1">
                {sponsor.category}
              </span>
              <h3 className="text-base font-extrabold text-white font-heading group-hover:text-[#F7B731] transition-colors">
                {sponsor.title}
              </h3>
              <p className="text-xs text-[#B5B1C5] mt-1">
                {sponsor.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
