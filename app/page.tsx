"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Sparkles,
  Music,
  Users,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { EVENT_DETAILS, INITIAL_TICKET_TYPES } from "@/lib/constants";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function HomePage() {
  const [ticketType, setTicketType] = useState(INITIAL_TICKET_TYPES[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    // Real-time listener for ticket stock availability
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

  const remainingQuantity = Math.max(0, ticketType.totalQuantity - ticketType.soldQuantity);

  return (
    <div className="relative bg-[#0A090D] overflow-hidden">
      {/* Dynamic Festival Hero Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-hero-glow pointer-events-none z-0 opacity-80" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-gold text-xs font-semibold tracking-wide uppercase shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9F1C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7B731]"></span>
            </span>
            GENERAL SALE LIVE NOW • LIMITED TO 150 PASSES
          </div>

          {/* Main Editorial Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight text-white leading-[1.05]">
            GARBA GALA <br />
            <span className="bg-clip-text text-transparent bg-gold-gradient gold-text-glow">
              2026
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#B5B1C5] max-w-2xl mx-auto leading-relaxed">
            Mumbai's premier traditional Garba & Dandiya spectacle. Immerse yourself in an unforgettable evening of live music, cultural rhythm, and festive bliss.
          </p>

          {/* Key Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="card-glass p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FF9F1C]/20 border border-[#F7B731]/30">
                <Calendar className="w-5 h-5 text-[#F7B731]" />
              </div>
              <div>
                <p className="text-[11px] text-[#8E8A9F] uppercase font-bold tracking-wider">Date</p>
                <p className="text-sm font-bold text-white">{EVENT_DETAILS.date}</p>
              </div>
            </div>

            <div className="card-glass p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FF9F1C]/20 border border-[#F7B731]/30">
                <Clock className="w-5 h-5 text-[#F7B731]" />
              </div>
              <div>
                <p className="text-[11px] text-[#8E8A9F] uppercase font-bold tracking-wider">Time</p>
                <p className="text-sm font-bold text-white">{EVENT_DETAILS.time}</p>
              </div>
            </div>

            <div className="card-glass p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FF9F1C]/20 border border-[#F7B731]/30">
                <MapPin className="w-5 h-5 text-[#FF9F1C]" />
              </div>
              <div>
                <p className="text-[11px] text-[#8E8A9F] uppercase font-bold tracking-wider">Venue</p>
                <a
                  href={EVENT_DETAILS.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-white hover:text-[#F7B731] flex items-center gap-1"
                >
                  {EVENT_DETAILS.venue} <ExternalLink className="w-3 h-3 text-[#FF9F1C]" />
                </a>
              </div>
            </div>
          </div>

          {/* Hero CTAs & Price Badge */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/checkout"
              className="btn-primary-gold w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-extrabold flex items-center justify-center gap-3 shadow-2xl group"
            >
              <Ticket className="w-5 h-5 text-[#0A090D] group-hover:rotate-12 transition-transform" />
              <span>GET YOUR PASS • ₹450</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#artists"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-[#272435] text-[#B5B1C5] hover:text-white hover:border-[#F7B731]/40 text-sm font-semibold flex items-center justify-center gap-2 bg-[#14121B]"
            >
              <Music className="w-4 h-4 text-[#F7B731]" />
              View Live Artists
            </a>
          </div>

          {/* Inventory Progress Pill */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#B5B1C5]">
            <Flame className="w-4 h-4 text-[#E03616] animate-bounce" />
            <span>
              <strong>{remainingQuantity} passes remaining</strong> out of {ticketType.totalQuantity} total General Sale passes
            </span>
          </div>
        </div>
      </section>

      {/* Ticket Showcase Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#272435]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-3">
            OFFICIAL ADMISSION PASS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            General Sale Ticket Pass
          </h2>
          <p className="text-sm text-[#8E8A9F] mt-2">
            Instant digital ticket generation with secure unique QR pass delivered directly to your email.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="card-glass rounded-3xl p-8 border-2 border-[#F7B731]/40 relative overflow-hidden shadow-2xl">
            {/* Corner Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#E03616] to-[#FF9F1C] text-white text-[11px] font-extrabold uppercase px-6 py-1.5 rounded-bl-2xl shadow-md">
              OFFICIAL PASS
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-heading">
                    {ticketType.name}
                  </h3>
                  <p className="text-xs text-[#8E8A9F] mt-1">
                    Garba Gala 2026 • Single Entry Pass
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-[#F7B731] font-heading">
                    ₹{ticketType.price}
                  </div>
                  <p className="text-[10px] text-[#8E8A9F] uppercase tracking-wider font-bold">
                    PER TICKET
                  </p>
                </div>
              </div>

              {/* Inclusions checklist */}
              <ul className="space-y-3 pt-2 text-sm text-[#B5B1C5] border-t border-[#272435]">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                  <span>Full access to main Dandiya & Garba dance floor</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                  <span>Live performances by Nisha Soni, Jiger Dama & Band</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                  <span>Unique ticket number & secure scanner QR code</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                  <span>Automated PDF ticket pass delivered via email</span>
                </li>
              </ul>

              {/* Rules Alert */}
              <div className="p-3.5 rounded-xl bg-[#0A090D] border border-[#272435] text-xs text-[#8E8A9F] space-y-1">
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#E03616]" />
                  NON-REFUNDABLE & NON-TRANSFERABLE
                </p>
                <p>Minimum age: 10+ years. Government ID is not required at venue entry.</p>
              </div>

              {/* Button */}
              <Link
                href="/checkout"
                className={`w-full py-4 rounded-xl font-extrabold text-center block text-base shadow-xl transition-all ${
                  remainingQuantity > 0
                    ? "btn-primary-gold"
                    : "bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                {remainingQuantity > 0 ? "BUY TICKETS NOW →" : "SOLD OUT"}
              </Link>

              <p className="text-center text-[11px] text-[#8E8A9F]">
                Multiple tickets per purchaser supported. Issued under purchaser name.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Roster Section */}
      <section id="artists" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#272435]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-3">
            LIVE PERFORMANCE ROSTER
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Star Artist Lineup
          </h2>
          <p className="text-sm text-[#8E8A9F] mt-2">
            Performing live at Golden Celebration Hall on 27 September 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENT_DETAILS.artists.map((artist, idx) => (
            <div
              key={idx}
              className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 mb-4 group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
                  <Music className="w-6 h-6 text-[#F7B731]" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-white font-heading">
                {artist.name}
              </h3>
              <p className="text-xs font-semibold text-[#FF9F1C] mt-1 uppercase tracking-wider">
                {artist.role}
              </p>
              <p className="text-xs text-[#8E8A9F] mt-3">
                Bringing soulful folk vocals, acoustic percussion beats, and high-energy Garba rhythms.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Venue & Experience Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#272435]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 text-[#F7B731] text-xs font-semibold uppercase tracking-wider">
              PRIME VENUE LOCATION
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              Golden Celebration Hall
            </h2>
            <p className="text-base text-[#B5B1C5] leading-relaxed">
              Located in the heart of Mulund West, Mumbai. A air-conditioned indoor venue with spacious Garba dance floors, state-of-the-art acoustic sound systems, and dedicated security infrastructure.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF9F1C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Address</p>
                  <p className="text-xs text-[#8E8A9F]">Mulund West, Mumbai 400080, Maharashtra</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#F7B731] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Organizers</p>
                  <p className="text-xs text-[#8E8A9F]">
                    {EVENT_DETAILS.organisers.join(" • ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={EVENT_DETAILS.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#F7B731]/40 text-[#F7B731] hover:bg-[#F7B731]/10 text-sm font-bold transition-all"
              >
                <MapPin className="w-4 h-4" />
                Open Venue in Google Maps →
              </a>
            </div>
          </div>

          <div className="card-glass rounded-3xl p-8 border border-[#272435] space-y-6">
            <h3 className="text-2xl font-extrabold text-white font-heading">
              Event Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#B5B1C5]">
              <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435]">
                <span className="text-[#F7B731] font-bold block mb-1">🎵 Live Orchestra</span>
                <span>Non-stop high-energy acoustic & electric fusion Garba music.</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435]">
                <span className="text-[#FF9F1C] font-bold block mb-1">👑 Traditional Attire</span>
                <span>Grand traditional Chaniya Choli & Kediyu fashion night.</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435]">
                <span className="text-[#E03616] font-bold block mb-1">🍔 Food & Drinks</span>
                <span>Delicious food court stalls with traditional festive snacks.</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435]">
                <span className="text-[#10B981] font-bold block mb-1">🛡️ Seamless Entry</span>
                <span>Instant QR scanner entry with fast digital check-in.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#272435]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#8E8A9F] mt-2">
            Everything you need to know about passes, entry, and event rules.
          </p>
        </div>

        <div className="space-y-4">
          {EVENT_DETAILS.faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="card-glass rounded-2xl border border-[#272435] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex justify-between items-center text-base font-bold text-white hover:text-[#F7B731]"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#F7B731] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8E8A9F] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#B5B1C5] leading-relaxed border-t border-[#272435]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#272435]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 text-[#F7B731] text-xs font-semibold uppercase tracking-wider mb-3">
            NEED ASSISTANCE?
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Contact Us
          </h2>
          <p className="text-sm text-[#8E8A9F] mt-2">
            Have questions about Garba Gala 2026 passes or venue guidelines? Reach out to our event co-ordinators directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Contact 1 */}
          <div className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 mx-auto group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#F7B731]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-heading">
                Rtr. Chittansh Pancholi
              </h3>
              <p className="text-xs text-[#8E8A9F] mt-1">Event Co-ordinator</p>
            </div>
            <a
              href="tel:7738969033"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#14121B] border border-[#272435] text-[#F7B731] hover:text-white hover:border-[#F7B731] font-bold text-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>📞 7738969033</span>
            </a>
          </div>

          {/* Contact 2 */}
          <div className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 mx-auto group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#F7B731]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-heading">
                Rtr. Tanish Momaya
              </h3>
              <p className="text-xs text-[#8E8A9F] mt-1">Event Co-ordinator</p>
            </div>
            <a
              href="tel:9136930426"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#14121B] border border-[#272435] text-[#F7B731] hover:text-white hover:border-[#F7B731] font-bold text-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>📞 9136930426</span>
            </a>
          </div>

          {/* Contact 3 */}
          <div className="card-glass rounded-2xl p-6 border border-[#272435] hover:border-[#F7B731]/40 transition-all text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03616] via-[#FF9F1C] to-[#F7B731] p-0.5 mx-auto group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-[#0A090D] rounded-[14px] flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#F7B731]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-heading">
                Rtr. Dr. Akanksha Dubey
              </h3>
              <p className="text-xs text-[#8E8A9F] mt-1">Event Co-ordinator</p>
            </div>
            <a
              href="tel:8828483919"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#14121B] border border-[#272435] text-[#F7B731] hover:text-white hover:border-[#F7B731] font-bold text-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>📞 8828483919</span>
            </a>
          </div>
        </div>
      </section>

      {/* Final Ticket CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#272435]">
        <div className="card-glass rounded-3xl p-10 text-center border-2 border-[#F7B731]/40 relative overflow-hidden bg-hero-glow">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold font-heading text-white">
              Don't Miss Mumbai's Biggest Garba Night!
            </h2>
            <p className="text-base text-[#B5B1C5]">
              General Sale passes are limited to 150 passes. Book your entry pass now for ₹450!
            </p>
            <div>
              <Link
                href="/checkout"
                className="btn-primary-gold inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-extrabold shadow-2xl"
              >
                <Sparkles className="w-5 h-5" />
                BOOK PASSES NOW • ₹450
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
