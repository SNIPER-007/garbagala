"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Ticket, Calendar, MapPin, Download, CheckCircle2, ShieldAlert, ArrowLeft, Loader2, QrCode } from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BookingData, IndividualTicketData } from "@/lib/types";
import { EVENT_DETAILS } from "@/lib/constants";
import { generateQrDataUrl } from "@/lib/qr/token";

export default function SingleBookingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [tickets, setTickets] = useState<(IndividualTicketData & { qrDataUrl?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    const loadBookingData = async () => {
      setLoading(true);
      try {
        // Query tickets matching bookingId
        const q = query(collection(db, "tickets"), where("bookingId", "==", bookingId));
        const snap = await getDocs(q);

        const loadedTickets: (IndividualTicketData & { qrDataUrl?: string })[] = [];

        for (const docSnap of snap.docs) {
          const tData = docSnap.data() as IndividualTicketData;
          const qrUrl = await generateQrDataUrl(tData.qrToken || `tkt_demo_${tData.ticketNumber}`);
          loadedTickets.push({ ...tData, qrDataUrl: qrUrl });
        }

        if (loadedTickets.length > 0) {
          setTickets(loadedTickets);
          setBooking({
            bookingId,
            customerId: "guest",
            eventId: EVENT_DETAILS.eventId,
            purchaserName: loadedTickets[0].holderName,
            purchaserEmail: loadedTickets[0].holderEmail,
            purchaserPhone: loadedTickets[0].holderPhone,
            ticketType: loadedTickets[0].ticketType,
            quantity: loadedTickets.length,
            subtotal: 450 * loadedTickets.length,
            totalAmount: 450 * loadedTickets.length,
            currency: "INR",
            paymentStatus: "paid",
            bookingStatus: "paid",
            createdAt: loadedTickets[0].createdAt,
            updatedAt: loadedTickets[0].updatedAt,
          });
        } else {
          // Fallback mock preview for booking testing
          const mockTicketNumber = `GG26-000001`;
          const qrUrl = await generateQrDataUrl(`tkt_mock_secure_token_${bookingId}`);
          setTickets([
            {
              ticketId: "tkt_1",
              bookingId,
              eventId: EVENT_DETAILS.eventId,
              ticketNumber: mockTicketNumber,
              ticketType: "General Sale",
              holderName: "Pass Holder",
              holderEmail: "holder@garbagala.com",
              holderPhone: "9876543210",
              qrToken: `tkt_mock_secure_token_${bookingId}`,
              ticketStatus: "valid",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              qrDataUrl: qrUrl,
            },
          ]);
          setBooking({
            bookingId,
            customerId: "guest",
            eventId: EVENT_DETAILS.eventId,
            purchaserName: "Pass Holder",
            purchaserEmail: "holder@garbagala.com",
            purchaserPhone: "9876543210",
            ticketType: "General Sale",
            quantity: 1,
            subtotal: 450,
            totalAmount: 450,
            currency: "INR",
            paymentStatus: "paid",
            bookingStatus: "paid",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error("Booking load error:", err);
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#0A090D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/my-tickets"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8E8A9F] hover:text-[#F7B731]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Passes
        </Link>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#F7B731] mx-auto" />
            <p className="text-xs text-[#8E8A9F]">Fetching ticket details...</p>
          </div>
        ) : booking ? (
          <div className="space-y-8">
            {/* Booking Header Card */}
            <div className="card-glass rounded-3xl p-6 border border-[#272435] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#F7B731] px-2.5 py-0.5 rounded bg-[#FF9F1C]/20">
                    {booking.bookingId}
                  </span>
                  <span className="text-xs font-bold text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/10">
                    CONFIRMED & PAID
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-white font-heading mt-2">
                  Garba Gala 2026 Pass ({tickets.length} Ticket{tickets.length > 1 ? "s" : ""})
                </h1>
                <p className="text-xs text-[#8E8A9F] mt-1">
                  Purchaser: <strong>{booking.purchaserName}</strong> ({booking.purchaserEmail})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl font-extrabold text-[#F7B731] font-heading">
                  ₹{booking.totalAmount}
                </div>
                <p className="text-[10px] text-[#8E8A9F] font-bold">TOTAL AMOUNT</p>
              </div>
            </div>

            {/* Individual Ticket Cards Grid */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-heading">
                Issued Individual Passes ({tickets.length})
              </h2>

              {tickets.map((tkt, idx) => (
                <div
                  key={tkt.ticketNumber || idx}
                  className="card-glass rounded-3xl p-8 border-2 border-[#F7B731]/50 relative overflow-hidden shadow-2xl space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#272435]">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#F7B731] badge-gold px-3 py-1 rounded-full">
                        PASS #{idx + 1} OF {tickets.length}
                      </span>
                      <h3 className="text-3xl font-extrabold text-[#F7B731] font-heading mt-2">
                        {tkt.ticketNumber}
                      </h3>
                      <p className="text-xs text-[#B5B1C5] mt-1">
                        Holder: <strong>{tkt.holderName}</strong> • {tkt.ticketType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          tkt.ticketStatus === "checked_in"
                            ? "bg-[#E03616]/20 text-[#E03616] border border-[#E03616]/40"
                            : "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                        }`}
                      >
                        {tkt.ticketStatus === "checked_in" ? "🔴 CHECKED IN" : "✓ VALID FOR ENTRY"}
                      </span>
                    </div>
                  </div>

                  {/* QR Code & Entry Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 text-center">
                      {tkt.qrDataUrl ? (
                        <div className="inline-block p-4 bg-white rounded-2xl border-4 border-[#F7B731] shadow-xl">
                          <img
                            src={tkt.qrDataUrl}
                            alt={`QR Code for ${tkt.ticketNumber}`}
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                          <QrCode className="w-12 h-12 text-[#F7B731]" />
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-[#F7B731] mt-3 uppercase tracking-wider">
                        SCAN THIS QR CODE AT GATE
                      </p>
                    </div>

                    <div className="md:col-span-7 space-y-4 text-xs text-[#B5B1C5]">
                      <div className="p-4 rounded-xl bg-[#0A090D] border border-[#272435] space-y-2">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <Calendar className="w-4 h-4 text-[#F7B731]" />
                          <span>27 September 2026 • 5:30 PM Onwards</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold">
                          <MapPin className="w-4 h-4 text-[#FF9F1C]" />
                          <span>Golden Celebration Hall, Mulund West</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[#8E8A9F]">
                        <p>• Age Restriction: <strong>Minimum 10+ years required</strong>.</p>
                        <p>• ID Requirement: Physical ID is not required; show QR at entrance.</p>
                        <p className="text-[#E03616] font-semibold">
                          • Policy: Strictly NON-REFUNDABLE and NON-TRANSFERABLE.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href={`/ticket/${tkt.ticketNumber}`}
                          target="_blank"
                          className="btn-primary-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>VIEW / PRINT VERIFIABLE PASS</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-glass rounded-3xl p-10 text-center border border-[#E03616]">
            <p className="text-sm text-[#E03616]">Booking not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
