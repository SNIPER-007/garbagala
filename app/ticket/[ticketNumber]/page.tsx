"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, Calendar, MapPin, Printer, ShieldCheck, QrCode } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { IndividualTicketData } from "@/lib/types";
import { EVENT_DETAILS } from "@/lib/constants";
import { generateQrDataUrl } from "@/lib/qr/token";

export default function TicketPrintPage() {
  const params = useParams();
  const ticketNumber = params.ticketNumber as string;

  const [ticket, setTicket] = useState<(IndividualTicketData & { qrDataUrl?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketNumber) return;

    const fetchTicket = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "tickets"), where("ticketNumber", "==", ticketNumber));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const tData = snap.docs[0].data() as IndividualTicketData;
          const qrUrl = await generateQrDataUrl(tData.qrToken);
          setTicket({ ...tData, qrDataUrl: qrUrl });
        } else {
          // Fallback mock preview
          const qrUrl = await generateQrDataUrl(`tkt_mock_${ticketNumber}`);
          setTicket({
            ticketId: "tkt_print_1",
            bookingId: "GG26-SAMPLE",
            eventId: EVENT_DETAILS.eventId,
            ticketNumber: ticketNumber || "GG26-000001",
            ticketType: "General Sale",
            holderName: "Pass Holder",
            holderEmail: "holder@garbagala.com",
            holderPhone: "9876543210",
            qrToken: `tkt_mock_${ticketNumber}`,
            ticketStatus: "valid",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            qrDataUrl: qrUrl,
          });
        }
      } catch (err) {
        console.error("Ticket print error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketNumber]);

  return (
    <div className="min-h-screen bg-[#0A090D] py-12 px-4 flex flex-col items-center justify-center">
      {/* Print Button */}
      <div className="mb-6 flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="btn-primary-gold px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-xl"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT / SAVE AS PDF</span>
        </button>
      </div>

      {ticket && (
        <div className="max-w-md w-full bg-[#14121B] border-2 border-[#F7B731] rounded-3xl p-8 space-y-6 shadow-2xl text-white relative overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#E03616] to-[#FF9F1C] p-4 -mx-8 -mt-8 rounded-t-2xl text-center">
            <h1 className="text-2xl font-extrabold font-heading text-white tracking-wider">
              GARBA GALA 2026
            </h1>
            <p className="text-[11px] font-bold text-[#F7B731] uppercase tracking-widest mt-0.5">
              OFFICIAL ENTRY PASS
            </p>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[10px] text-[#8E8A9F] uppercase font-bold tracking-widest">TICKET NUMBER</p>
            <p className="text-3xl font-extrabold text-[#F7B731] font-heading">{ticket.ticketNumber}</p>
            <p className="text-xs text-[#B5B1C5]">Booking ID: {ticket.bookingId}</p>
          </div>

          {/* QR Code */}
          <div className="text-center py-2">
            {ticket.qrDataUrl ? (
              <div className="inline-block p-3 bg-white rounded-2xl border-2 border-[#F7B731]">
                <img src={ticket.qrDataUrl} alt="Pass QR Code" className="w-44 h-44 mx-auto" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-12 h-12 text-[#F7B731]" />
              </div>
            )}
            <p className="text-[10px] font-bold text-[#F7B731] mt-2 uppercase tracking-wider">
              SCAN AT GATE FOR VALIDATION
            </p>
          </div>

          {/* Details */}
          <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435] space-y-3 text-xs">
            <div>
              <span className="text-[#8E8A9F] block text-[10px] uppercase font-bold">Pass Holder</span>
              <span className="text-sm font-bold text-white">{ticket.holderName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#272435]">
              <div>
                <span className="text-[#8E8A9F] block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-[#FF9F1C]">{ticket.ticketType}</span>
              </div>
              <div>
                <span className="text-[#8E8A9F] block text-[10px] uppercase font-bold">Status</span>
                <span className="font-bold text-[#10B981] uppercase">{ticket.ticketStatus}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#272435]">
              <span className="text-[#8E8A9F] block text-[10px] uppercase font-bold">Date & Time</span>
              <span className="font-bold text-white">27 Sept 2026 • 5:30 PM Onwards</span>
            </div>
            <div>
              <span className="text-[#8E8A9F] block text-[10px] uppercase font-bold">Venue</span>
              <span className="font-bold text-white">Golden Celebration Hall, Mulund West</span>
            </div>
          </div>

          {/* Rules */}
          <div className="text-[10px] text-[#8E8A9F] space-y-1 pt-2 border-t border-[#272435]">
            <p className="text-white font-bold">TERMS & ENTRY RULES:</p>
            <p>• Age Limit: Minimum 10+ years.</p>
            <p>• Strictly NON-REFUNDABLE and NON-TRANSFERABLE.</p>
            <p>• Duplicate passes will be rejected at the entrance scanner.</p>
          </div>
        </div>
      )}
    </div>
  );
}
