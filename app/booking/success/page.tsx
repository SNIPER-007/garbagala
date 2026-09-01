"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Ticket, Mail, Download, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BookingData, IndividualTicketData } from "@/lib/types";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");

  const [status, setStatus] = useState<"verifying" | "paid" | "failed">("verifying");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [tickets, setTickets] = useState<IndividualTicketData[]>([]);

  useEffect(() => {
    if (!bookingId) return;

    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        const data = await res.json();
        if (data.success) {
          setStatus("paid");
          clearInterval(pollInterval);

          // Trigger festive celebratory confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#F7B731", "#FF9F1C", "#E03616"],
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (attempts >= 15 && status === "verifying") {
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#0A090D] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {status === "verifying" ? (
          <div className="card-glass rounded-3xl p-10 text-center border border-[#272435] space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-[#F7B731] mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold font-heading text-white">
                Verifying Payment & Generating Tickets...
              </h1>
              <p className="text-xs text-[#8E8A9F]">
                Performing secure server-side verification for Booking <strong>{bookingId}</strong>. Please do not close or refresh this page.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435] text-xs text-[#B5B1C5] space-y-2">
              <div className="flex items-center gap-2 justify-center text-[#F7B731]">
                <ShieldCheck className="w-4 h-4" />
                <span>Checking Razorpay signature and inventory allocation...</span>
              </div>
            </div>
          </div>
        ) : status === "paid" ? (
          <div className="card-glass rounded-3xl p-8 border-2 border-[#F7B731] space-y-8 relative overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border-2 border-[#10B981] flex items-center justify-center mx-auto text-[#10B981]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#10B981] badge-gold px-3 py-1 rounded-full">
                  PAYMENT VERIFIED & CONFIRMED
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mt-3">
                  Garba Gala 2026 Pass Confirmed!
                </h1>
                <p className="text-xs text-[#8E8A9F] mt-1">
                  Booking Reference: <strong className="text-[#F7B731]">{bookingId}</strong>
                </p>
              </div>
            </div>

            {/* Pass Summary Details */}
            <div className="p-6 rounded-2xl bg-[#0A090D] border border-[#272435] space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-[#272435]">
                <span className="text-[#8E8A9F] uppercase font-bold">Event</span>
                <span className="font-bold text-white">Garba Gala 2026</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#272435]">
                <span className="text-[#8E8A9F] uppercase font-bold">Date & Venue</span>
                <span className="font-bold text-white text-right">27 Sept 2026 • Golden Celebration Hall</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#272435]">
                <span className="text-[#8E8A9F] uppercase font-bold">Pass Category</span>
                <span className="font-bold text-[#F7B731]">General Sale</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E8A9F] uppercase font-bold">Status</span>
                <span className="font-bold text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID & ISSUED
                </span>
              </div>
            </div>

            {/* Email Dispatch Notice */}
            <div className="p-4 rounded-xl bg-[#FF9F1C]/10 border border-[#F7B731]/30 text-xs text-[#B5B1C5] flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#F7B731] shrink-0" />
              <span>
                Your ticket PDF pass with secure entrance QR code has been dispatched to your email.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href={`/my-tickets`}
                className="btn-primary-gold flex-1 py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 text-sm"
              >
                <Ticket className="w-4 h-4" />
                <span>VIEW MY PASSES & QR CODES</span>
              </Link>
              <Link
                href="/"
                className="py-3.5 px-6 rounded-xl border border-[#272435] text-[#B5B1C5] hover:text-white text-center text-sm font-semibold"
              >
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="card-glass rounded-3xl p-10 text-center border border-[#E03616] space-y-4">
            <h1 className="text-2xl font-bold text-[#E03616]">Payment Verification Warning</h1>
            <p className="text-xs text-[#8E8A9F]">
              Verification takes up to 30 seconds. If your payment was deducted, your tickets will automatically appear in your 'My Tickets' section.
            </p>
            <Link
              href="/my-tickets"
              className="btn-primary-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold"
            >
              Go to My Tickets →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
