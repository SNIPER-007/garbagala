"use client";

import React, { useState } from "react";
import { Sparkles, Image as ImageIcon, Calendar, Music, MapPin, Award, ChevronLeft, ChevronRight, X } from "lucide-react";

export type EventCreative = {
  id: string;
  title: string;
  category: "Official Poster" | "Artist Roster" | "Venue & Date" | "Pass Alert" | "Organisers";
  tag: string;
  description: string;
  imageSrc?: string;
  gradientBg: string;
  icon: React.ElementType;
};

const DEFAULT_CREATIVES: EventCreative[] = [
  {
    id: "poster-main",
    title: "Garba Gala 2026 Official Key Art",
    category: "Official Poster",
    tag: "GRAND FESTIVAL POSTER",
    description: "Official promotional poster for Garba Gala 2026 featuring live band lineup & ticket pass details.",
    gradientBg: "from-[#991B1B] via-[#D97706] to-[#7C2D12]",
    icon: Sparkles,
  },
  {
    id: "artist-roster",
    title: "Star Vocalists & Live Orchestra",
    category: "Artist Roster",
    tag: "LIVE ARTIST LINEUP",
    description: "Featuring Nisha Soni, Jiger Dama, Divya Joshi Ganatra, Chetan Deshmukh & Bharat Kotak Band.",
    gradientBg: "from-[#581C87] via-[#C026D3] to-[#831843]",
    icon: Music,
  },
  {
    id: "venue-poster",
    title: "Golden Celebration Hall • Mulund",
    category: "Venue & Date",
    tag: "EVENT DATE & VENUE",
    description: "27 September 2026 • 5:30 PM Onwards at Golden Celebration Hall, Mulund West, Mumbai.",
    gradientBg: "from-[#1E3A8A] via-[#0284C7] to-[#0F766E]",
    icon: MapPin,
  },
  {
    id: "ticket-alert",
    title: "General Sale Pass — ₹450 Only",
    category: "Pass Alert",
    tag: "OFFICIAL PASS BOOKING",
    description: "Limited stock of 150 passes. Includes entry to main Garba dance floor & live music performances.",
    gradientBg: "from-[#78350F] via-[#D97706] to-[#B45309]",
    icon: Calendar,
  },
  {
    id: "organisers-promo",
    title: "Rotaract Clubs & Event Team",
    category: "Organisers",
    tag: "PRESENTING ORGANISERS",
    description: "Presented by RC Mumbai Ghatkopar, RC Mumbai Salt City, RC Mumbai Medico Marvel, Nisha Soni & Dipti Vora.",
    gradientBg: "from-[#065F46] via-[#059669] to-[#047857]",
    icon: Award,
  },
];

export default function EventCreatives() {
  const [selectedCreative, setSelectedCreative] = useState<EventCreative | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");

  const categories = ["All", "Official Poster", "Artist Roster", "Venue & Date", "Pass Alert", "Organisers"];

  const filteredCreatives = activeTab === "All"
    ? DEFAULT_CREATIVES
    : DEFAULT_CREATIVES.filter((c) => c.category === activeTab);

  return (
    <section id="creatives" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(255,159,28,0.2)]">
          <ImageIcon className="w-3.5 h-3.5 text-[#F7B731]" />
          EVENT CREATIVES & PROMOTIONAL ARTWORK
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
          Festive Gallery & Announcements
        </h2>
        <p className="text-sm text-[#8E8A9F] mt-2">
          Official promotional graphics, artist roster announcements, and event posters for Garba Gala 2026.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === cat
                ? "bg-gradient-to-r from-[#FF9F1C] to-[#F7B731] text-[#0A090D] shadow-lg scale-105"
                : "bg-[#14121B] border border-[#272435] text-[#B5B1C5] hover:text-white hover:border-[#F7B731]/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatives.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedCreative(item)}
              className="card-glass rounded-2xl border border-[#272435] hover:border-[#F7B731]/50 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-xl"
            >
              {/* Creative Graphic Placeholder / Container */}
              <div className={`relative h-56 bg-gradient-to-br ${item.gradientBg} p-6 flex flex-col justify-between overflow-hidden`}>
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
                
                {/* Top Badge */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Graphics Preview Graphic Elements */}
                <div className="my-auto text-center z-10 space-y-1">
                  <div className="text-2xl font-black text-white tracking-wider uppercase font-heading drop-shadow-md">
                    GARBA GALA 2026
                  </div>
                  <div className="text-xs font-semibold text-amber-200 uppercase tracking-widest">
                    {item.title}
                  </div>
                </div>

                {/* Bottom Footer Overlay */}
                <div className="z-10 flex items-center justify-between text-[11px] text-white/80 font-medium border-t border-white/10 pt-2">
                  <span>27 SEPT 2026 • MULUND</span>
                  <span className="text-amber-300 font-bold group-hover:underline">Click to view →</span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 space-y-2 bg-[#14121B]/90">
                <h3 className="text-base font-extrabold text-white font-heading group-hover:text-[#F7B731] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#8E8A9F] line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Modal */}
      {selectedCreative && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14121B] border-2 border-[#F7B731]/60 rounded-3xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedCreative(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#0A090D] border border-[#272435] text-[#B5B1C5] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`h-72 rounded-2xl bg-gradient-to-br ${selectedCreative.gradientBg} p-8 flex flex-col justify-between relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
              <div className="z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-black/50 text-xs font-bold text-amber-300 uppercase">
                  {selectedCreative.tag}
                </span>
                <span className="text-xs font-semibold text-white/90">Official Creative #GG26</span>
              </div>
              <div className="z-10 text-center space-y-2">
                <h3 className="text-3xl font-extrabold text-white font-heading uppercase tracking-tight drop-shadow-lg">
                  {selectedCreative.title}
                </h3>
                <p className="text-xs text-amber-200 font-medium">Garba Gala 2026 • Golden Celebration Hall, Mulund West</p>
              </div>
              <div className="z-10 text-center text-xs text-white/80 font-bold border-t border-white/20 pt-2">
                27 SEPTEMBER 2026 • 5:30 PM ONWARDS • PASS: ₹450
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-white font-heading">
                {selectedCreative.title}
              </h4>
              <p className="text-xs text-[#B5B1C5] leading-relaxed">
                {selectedCreative.description}
              </p>
              <div className="pt-3 border-t border-[#272435] flex items-center justify-between">
                <span className="text-xs text-[#8E8A9F]">Category: <strong className="text-white">{selectedCreative.category}</strong></span>
                <button
                  onClick={() => setSelectedCreative(null)}
                  className="px-5 py-2 rounded-xl bg-[#272435] text-white text-xs font-bold hover:bg-[#F7B731] hover:text-[#0A090D] transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
