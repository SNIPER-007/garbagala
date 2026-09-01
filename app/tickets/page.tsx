"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, CheckCircle2, ShieldAlert, Sparkles, ArrowRight, Flame } from "lucide-react";
import { INITIAL_TICKET_TYPES } from "@/lib/constants";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
    <div className="min-h-screen bg-[#0A090D] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-gold text-xs font-bold uppercase tracking-wider">
            PASS CATEGORIES
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white">
            Select Your Pass
          </h1>
          <p className="text-sm text-[#8E8A9F]">
            All tickets include entry to Garba Gala 2026 at Golden Celebration Hall on 27 September 2026.
          </p>
        </div>

        {/* Active Ticket Card */}
        <div className="card-glass rounded-3xl p-8 border-2 border-[#F7B731] relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#272435]">
            <div>
              <div className="inline-block px-3 py-1 rounded-md bg-[#FF9F1C]/20 text-[#F7B731] text-xs font-bold uppercase mb-2">
                ACTIVE SALE
              </div>
              <h2 className="text-3xl font-extrabold text-white font-heading">
                {ticketType.name}
              </h2>
              <p className="text-xs text-[#B5B1C5] mt-1">
                {ticketType.description}
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="text-4xl font-extrabold text-[#F7B731] font-heading">
                ₹{ticketType.price}
              </div>
              <p className="text-xs text-[#8E8A9F]">Per Ticket Pass</p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#FF9F1C] font-semibold">
              <Flame className="w-4 h-4 text-[#E03616]" />
              <span>
                Availability: <strong>{remaining} passes left</strong> ({ticketType.soldQuantity} / {ticketType.totalQuantity} sold)
              </span>
            </div>

            {/* Inclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#B5B1C5]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                Full Dance Floor Access
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                Live Band & Orchestra Performances
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                Unique QR Entry Pass
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7B731]" />
                Automated PDF Pass via Email
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#8E8A9F] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#E03616]" />
              Strictly Non-Refundable & Non-Transferable. Minimum Age: 10+.
            </div>

            <Link
              href="/checkout"
              className="btn-primary-gold w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 text-sm"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>      </div>
    </div>
  );
}
