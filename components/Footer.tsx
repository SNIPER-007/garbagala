import React from "react";
import Link from "next/link";
import { EVENT_DETAILS } from "@/lib/constants";
import { Calendar, MapPin, ShieldAlert, Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A090D] border-t border-[#272435] pt-16 pb-12 text-[#8E8A9F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#272435]">
          {/* Col 1: Brand & Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E03616] to-[#F7B731] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0A090D] rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#F7B731]" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-white font-heading tracking-tight">
                GARBA GALA 2026
              </span>
            </div>
            <p className="text-sm text-[#B5B1C5] max-w-md leading-relaxed">
              {EVENT_DETAILS.description}
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#B5B1C5]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F7B731]" />
                <span>{EVENT_DETAILS.dateFormatted} • {EVENT_DETAILS.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF9F1C]" />
                <a
                  href={EVENT_DETAILS.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline decoration-[#FF9F1C]"
                >
                  {EVENT_DETAILS.venue}, {EVENT_DETAILS.venueAddress}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Organizers */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 font-heading text-[#F7B731]">
              Organizers
            </h4>
            <ul className="space-y-2 text-xs text-[#B5B1C5]">
              {EVENT_DETAILS.organisers.map((org, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F1C]" />
                  {org}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Policy & Quick Access */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 font-heading text-[#F7B731]">
              Important Rules
            </h4>
            <ul className="space-y-2.5 text-xs text-[#B5B1C5]">
              <li className="flex items-center gap-2 text-[#E03616] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                NON-REFUNDABLE PASSES
              </li>
              <li className="flex items-center gap-2 text-[#E03616] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                NON-TRANSFERABLE
              </li>
              <li>• Age Restriction: 10+ Years</li>
              <li>• Government ID: Not Required</li>
              <li>• Single Purchaser Multi-pass Allowed</li>
              <li className="pt-2">
                <Link href="/organizer/login" className="text-[#F7B731] hover:underline font-semibold">
                  Organizer Login →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Garba Gala. Official Ticketing Platform.</p>
          <p className="flex items-center gap-1.5 text-[#B5B1C5]">
            Crafted with <Heart className="w-3.5 h-3.5 text-[#E03616] fill-[#E03616]" /> for Garba Lovers in Mumbai
          </p>
        </div>
      </div>
    </footer>
  );
}
