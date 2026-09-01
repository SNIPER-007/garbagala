"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, CheckCircle2, ShieldAlert, XCircle, Loader2, Ticket } from "lucide-react";
import { IndividualTicketData } from "@/lib/types";

export default function ManualSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    status: string;
    message?: string;
    ticket?: IndividualTicketData;
    checkedInAt?: string;
    checkedInBy?: string;
  } | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setTicketResult(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: searchTerm.trim(),
          action: "validate",
        }),
      });

      const data = await res.json();
      setTicketResult(data);
    } catch (err: any) {
      setTicketResult({
        status: "invalid",
        message: "Failed to search ticket database.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!ticketResult?.ticket) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: ticketResult.ticket.ticketNumber,
          action: "checkin",
          organizerId: "gate_manual_staff",
        }),
      });

      const data = await res.json();
      setTicketResult(data);
    } catch (err: any) {
      setTicketResult({
        status: "invalid",
        message: "Check-in failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A090D] py-8 px-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#272435]">
          <Link href="/organizer" className="flex items-center gap-2 text-xs font-bold text-[#8E8A9F]">
            <ArrowLeft className="w-4 h-4" /> Organizer Console
          </Link>
          <span className="text-xs font-extrabold text-[#F7B731] font-heading">MANUAL LOOKUP</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8E8A9F]" />
            <input
              type="text"
              required
              placeholder="Enter Ticket # (e.g. GG26-000001) or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#14121B] border-2 border-[#272435] focus:border-[#F7B731] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white font-bold tracking-wide focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-gold w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#0A090D]" /> : <Search className="w-4 h-4" />}
            <span>SEARCH TICKET ROSTER</span>
          </button>
        </form>

        {/* Result Cards */}
        {ticketResult && (
          <div className="space-y-4 pt-2">
            {ticketResult.status === "valid" && ticketResult.ticket && (
              <div className="card-glass rounded-3xl p-6 border-2 border-[#10B981] space-y-4 text-center bg-[#10B981]/10">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#10B981] text-[#0A090D] uppercase">
                  ✓ VALID PASS FOUND
                </span>

                <div>
                  <h3 className="text-2xl font-extrabold text-white font-heading mt-2">
                    {ticketResult.ticket.holderName}
                  </h3>
                  <p className="text-lg font-bold text-[#F7B731]">
                    {ticketResult.ticket.ticketNumber}
                  </p>
                  <p className="text-xs text-[#8E8A9F] mt-1">
                    Booking: {ticketResult.ticket.bookingId} • Category: {ticketResult.ticket.ticketType}
                  </p>
                </div>

                <button
                  onClick={handleManualCheckIn}
                  className="btn-primary-gold w-full py-3.5 rounded-2xl font-extrabold text-sm"
                >
                  MANUALLY CHECK IN PASS →
                </button>
              </div>
            )}

            {ticketResult.status === "success" && (
              <div className="card-glass rounded-3xl p-6 border-2 border-[#10B981] space-y-3 text-center bg-[#10B981]/20">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                <h3 className="text-2xl font-extrabold text-[#10B981] font-heading">
                  ENTRY CONFIRMED!
                </h3>
                <p className="text-xs text-white">Welcome to Garba Gala 2026</p>
              </div>
            )}

            {ticketResult.status === "already_checked_in" && (
              <div className="card-glass rounded-3xl p-6 border-2 border-[#E03616] space-y-3 text-center bg-[#E03616]/20">
                <XCircle className="w-12 h-12 text-[#E03616] mx-auto" />
                <h3 className="text-xl font-extrabold text-[#E03616] font-heading">
                  🔴 TICKET ALREADY USED
                </h3>
                {ticketResult.ticket && (
                  <p className="text-sm text-white font-bold">
                    {ticketResult.ticket.ticketNumber} - {ticketResult.ticket.holderName}
                  </p>
                )}
              </div>
            )}

            {ticketResult.status === "invalid" && (
              <div className="card-glass rounded-3xl p-6 border-2 border-[#E03616] space-y-2 text-center bg-[#E03616]/10">
                <ShieldAlert className="w-10 h-10 text-[#E03616] mx-auto" />
                <h3 className="text-lg font-bold text-[#E03616]">No Ticket Found</h3>
                <p className="text-xs text-[#8E8A9F]">{ticketResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
