"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Flame,
  Calendar,
  Clock,
  MapPin,
  Music,
  Users,
  ExternalLink,
  Info,
} from "lucide-react";
import { EVENT_DETAILS, INITIAL_TICKET_TYPES } from "@/lib/constants";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import FestiveDivider from "@/components/FestiveDivider";
import EventCreatives from "@/components/EventCreatives";
import SponsorsSection from "@/components/SponsorsSection";

export default function TicketsPage() {
  const [ticketType, setTicketType] = useState(INITIAL_TICKET_TYPES[0]);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "ticketTypes", "general-sale"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTicketType((prev) => ({
            ...prev,
            soldQuantity: data.soldQuantity ?? prev.soldQuantity,
            totalQuantity: data.totalQuantity ?? prev.totalQuantity,
            status: data.status ?? prev.status,
          }));
        }
      },
      (err) => {
        console.log("Realtime ticket listener fallback:", err);
      }
    );
    return () => unsub();
  }, []);

  const remaining = Math.max(0, ticketType.totalQuantity - ticketType.soldQuantity);

  return (
    <div className="min-h-screen bg-[#0A090D] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-hero-glow pointer-events-none z-0 opacity-75" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-gold text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#F7B731]" />
            OFFICIAL PRODUCT & PASSES DETAILS
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight">
            GARBA GALA 2026 PASSES
          </h1>
          <p className="text-base text-[#B5B1C5] leading-relaxed">
            Official admission passes for Mumbai's festive night of Garba, Dandiya & live music at Golden Celebration Hall, Mulund West.
          </p>
        </div>

        {/* Highlighted Event & Product Summary Card for PayU Verification */}
        <div className="card-glass rounded-3xl p-6 sm:p-10 border-2 border-[#F7B731] relative overflow-hidden shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-[#272435]">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-md bg-[#FF9F1C]/20 border border-[#F7B731]/40 text-[#F7B731] text-xs font-extrabold uppercase tracking-wider">
                GENERAL SALE GARBA PASS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                Garba Gala 2026 Entry Pass
              </h2>
              <p className="text-sm text-[#B5B1C5]">
                Single Entry Pass • Access to Dandiya Dance Floor, Live Band & Food Court Stalls
              </p>
            </div>

            <div className="text-left lg:text-right bg-[#14121B] p-4 rounded-2xl border border-[#272435] w-full lg:w-auto">
              <div className="text-4xl font-black text-[#F7B731] font-heading">
                ₹450 <span className="text-sm font-semibold text-[#8E8A9F]">/ PASS</span>
              </div>
              <p className="text-xs text-[#8E8A9F] mt-0.5">Total Quantity: 150 Passes</p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0A090D] p-4 rounded-2xl border border-[#272435] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF9F1C]/20 text-[#F7B731]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#8E8A9F] uppercase font-bold">Event Date</p>
                <p className="text-sm font-bold text-white">27 September 2026</p>
              </div>
            </div>

            <div className="bg-[#0A090D] p-4 rounded-2xl border border-[#272435] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF9F1C]/20 text-[#F7B731]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#8E8A9F] uppercase font-bold">Event Time</p>
                <p className="text-sm font-bold text-white">5:30 PM Onwards</p>
              </div>
            </div>

            <div className="bg-[#0A090D] p-4 rounded-2xl border border-[#272435] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF9F1C]/20 text-[#F7B731]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#8E8A9F] uppercase font-bold">Venue Location</p>
                <p className="text-sm font-bold text-white">Golden Celebration Hall, Mulund W</p>
              </div>
            </div>
          </div>

          {/* Stock & Main CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#14121B] p-6 rounded-2xl border border-[#272435]">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#FF9F1C]">
                <Flame className="w-4 h-4 text-[#E03616] animate-bounce" />
                <span>Pass Availability: {remaining} passes remaining ({ticketType.soldQuantity} / {ticketType.totalQuantity} sold)</span>
              </div>
              <p className="text-xs text-[#8E8A9F]">
                Multiple passes can be purchased in one booking. Issued under purchaser name.
              </p>
            </div>

            <Link
              href="/checkout"
              className="btn-primary-gold w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 shadow-2xl shrink-0"
            >
              <Ticket className="w-5 h-5 text-[#0A090D]" />
              <span>BUY PASS — ₹450</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Inclusions & Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#272435]">
            {/* What You Get */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-white font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#F7B731]" />
                WHAT YOU GET
              </h3>
              <ul className="space-y-2.5 text-xs text-[#B5B1C5]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731] shrink-0 mt-0.5" />
                  <span>Entry ticket pass for <strong>Garba Gala 2026</strong> on 27 September 2026.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731] shrink-0 mt-0.5" />
                  <span>Full access to the air-conditioned main Dandiya & Garba dance floor.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731] shrink-0 mt-0.5" />
                  <span>Live performances by <strong>Nisha Soni, Jiger Dama, Divya Joshi Ganatra, Chetan Deshmukh & Bharat Kotak Band</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731] shrink-0 mt-0.5" />
                  <span>Automated PDF entry pass with unique QR token delivered via email.</span>
                </li>
              </ul>
            </div>

            {/* Pass Information & Guidelines */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-white font-heading flex items-center gap-2">
                <Info className="w-5 h-5 text-[#FF9F1C]" />
                PASS INFORMATION & TERMS
              </h3>
              <ul className="space-y-2.5 text-xs text-[#B5B1C5]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#F7B731] font-bold">•</span>
                  <span><strong>Price:</strong> ₹450 per pass (150 passes total).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#F7B731] font-bold">•</span>
                  <span><strong>Age Limit:</strong> Minimum age requirement is 10+ years.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#F7B731] font-bold">•</span>
                  <span><strong>Government ID:</strong> Physical ID is not required at entry.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#F7B731] font-bold">•</span>
                  <span><strong>Multiple Purchases:</strong> Permitted. All passes within a booking are issued under the purchaser's name.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E03616] font-bold">•</span>
                  <span><strong>Refund Policy:</strong> Passes are strictly <strong>non-refundable & non-transferable</strong>.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Artists & Organisers Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0A090D] border border-[#272435] text-xs">
            <div>
              <p className="text-[#F7B731] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Live Star Artists
              </p>
              <p className="text-[#B5B1C5] leading-relaxed">
                Nisha Soni, Jiger Dama, Divya Joshi Ganatra, Chetan Deshmukh, Bharat Kotak and Band.
              </p>
            </div>
            <div>
              <p className="text-[#FF9F1C] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Event Organisers
              </p>
              <p className="text-[#B5B1C5] leading-relaxed">
                {EVENT_DETAILS.organisers.join(" • ")}
              </p>
            </div>
          </div>
        </div>

        <FestiveDivider />

        {/* Promotional Creatives Section */}
        <EventCreatives />

        <FestiveDivider />

        {/* Partners Section */}
        <SponsorsSection />
      </div>
    </div>
  );
}
